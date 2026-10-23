/* PostgreSQL store — used when DATABASE_URL is set. Works with any Postgres host
   (Neon, Supabase, Railway, Render, AWS RDS, a local Docker container…).
   Tables are created automatically on first use. */
import "server-only";
import postgres from "postgres";
import type { Enquiry, Order, Reservation, Subscriber } from "../../types";
import type { Store } from "./types";

const g = globalThis as unknown as { __esSql?: postgres.Sql; __esSchema?: Promise<void> };

function client(): postgres.Sql {
  if (g.__esSql) return g.__esSql;
  const url = process.env.DATABASE_URL!;
  const local = /@(localhost|127\.0\.0\.1|db|postgres)(:|\/)/.test(url);
  g.__esSql = postgres(url, {
    ssl: local || /sslmode=disable/.test(url) ? false : "require",
    max: Number(process.env.DATABASE_POOL_SIZE ?? (process.env.VERCEL ? 1 : 10)),
    idle_timeout: 20,
    connect_timeout: 10,
    prepare: false, // compatible with connection poolers (PgBouncer, Neon, Supabase pooler)
    onnotice: () => {},
  });
  return g.__esSql;
}

const SCHEMA = `
  create sequence if not exists es_order_seq start 1001;
  create sequence if not exists es_reservation_seq start 501;
  create sequence if not exists es_enquiry_seq start 101;
  create table if not exists es_orders (
    id text primary key,
    created timestamptz not null,
    status text not null,
    data jsonb not null
  );
  create index if not exists es_orders_created_idx on es_orders (created desc);
  create table if not exists es_reservations (
    id text primary key,
    date text not null,
    time text not null,
    status text not null,
    data jsonb not null
  );
  create index if not exists es_reservations_date_idx on es_reservations (date, time);
  create table if not exists es_enquiries (
    id text primary key,
    created timestamptz not null,
    data jsonb not null
  );
  create table if not exists es_subscribers (
    email text primary key,
    created timestamptz not null,
    data jsonb not null
  );
  create table if not exists es_availability (
    dish_id text primary key,
    available boolean not null
  );
`;

async function db(): Promise<postgres.Sql> {
  const sql = client();
  g.__esSchema ??= sql.unsafe(SCHEMA).then(() => undefined).catch((e) => {
    g.__esSchema = undefined; // retry next time
    throw e;
  });
  await g.__esSchema;
  return sql;
}

type Row<T> = { data: T };
const rows = <T>(r: Row<T>[]) => r.map((x) => x.data);
type Json = postgres.JSONValue;
const j = (sql: postgres.Sql | postgres.TransactionSql, v: unknown) => sql.json(v as Json);

/** Row-locked read-modify-write of one JSON record (and its status column, if the table has one). */
async function updateJson<T extends { id: string; status?: string }>(
  table: "es_orders" | "es_reservations" | "es_enquiries",
  id: string,
  fn: (x: T) => void,
  hasStatus: boolean,
): Promise<T | null> {
  const sql = await db();
  const result = await sql.begin(async (tx) => {
    const [row] = await tx<Row<T>[]>`select data from ${tx(table)} where id = ${id} for update`;
    if (!row) return null;
    const item = row.data;
    fn(item);
    if (hasStatus) await tx`update ${tx(table)} set data = ${j(tx, item)}, status = ${item.status ?? ""} where id = ${id}`;
    else await tx`update ${tx(table)} set data = ${j(tx, item)} where id = ${id}`;
    return item;
  });
  return result as T | null;
}

export const postgresStore: Store = {
  kind: "postgres",
  async ping() {
    const sql = await db();
    await sql`select 1`;
  },

  async insertOrder(o) {
    const sql = await db();
    const [{ n }] = await sql<{ n: string }[]>`select nextval('es_order_seq') as n`;
    const order = { ...o, id: `ES${n}` } as Order;
    await sql`insert into es_orders (id, created, status, data) values (${order.id}, ${order.created}, ${order.status}, ${j(sql, order)})`;
    return order;
  },
  async getOrder(id) {
    const sql = await db();
    const [r] = await sql<Row<Order>[]>`select data from es_orders where id = ${id}`;
    return r?.data ?? null;
  },
  updateOrder: (id, fn) => updateJson<Order>("es_orders", id, fn, true),
  async listOrders(limit) {
    const sql = await db();
    return rows(await sql<Row<Order>[]>`select data from es_orders order by created desc limit ${limit}`);
  },

  async insertReservation(r, capacity) {
    const sql = await db();
    const result = await sql.begin(async (tx) => {
      // serialise bookings for the same slot so capacity can't be exceeded
      await tx`select pg_advisory_xact_lock(hashtext(${r.date + " " + r.time}))`;
      const [{ c }] = await tx<{ c: number }[]>`select count(*)::int as c from es_reservations where date = ${r.date} and time = ${r.time} and status <> 'cancelled'`;
      if (c >= capacity) return null;
      const [{ n }] = await tx<{ n: string }[]>`select nextval('es_reservation_seq') as n`;
      const res = { ...r, id: `R${n}` } as Reservation;
      await tx`insert into es_reservations (id, date, time, status, data) values (${res.id}, ${res.date}, ${res.time}, ${res.status}, ${j(tx, res)})`;
      return res;
    });
    return result as Reservation | null;
  },
  async slotCounts(date) {
    const sql = await db();
    const r = await sql<{ time: string; c: number }[]>`select time, count(*)::int as c from es_reservations where date = ${date} and status <> 'cancelled' group by time`;
    return Object.fromEntries(r.map((x) => [x.time, x.c]));
  },
  updateReservation: (id, fn) => updateJson<Reservation>("es_reservations", id, fn, true),
  async listReservations(fromDate) {
    const sql = await db();
    return rows(await sql<Row<Reservation>[]>`select data from es_reservations where date >= ${fromDate} order by date, time`);
  },

  async insertEnquiry(e) {
    const sql = await db();
    const [{ n }] = await sql<{ n: string }[]>`select nextval('es_enquiry_seq') as n`;
    const enq = { ...e, id: `E${n}` } as Enquiry;
    await sql`insert into es_enquiries (id, created, data) values (${enq.id}, ${enq.created}, ${j(sql, enq)})`;
    return enq;
  },
  updateEnquiry: (id, fn) => updateJson<Enquiry>("es_enquiries", id, fn, false),
  async listEnquiries(limit) {
    const sql = await db();
    return rows(await sql<Row<Enquiry>[]>`select data from es_enquiries order by created desc limit ${limit}`);
  },

  async addSubscriber(s) {
    const sql = await db();
    const r = await sql`insert into es_subscribers (email, created, data) values (${s.email.toLowerCase()}, ${s.created}, ${j(sql, s)}) on conflict (email) do nothing`;
    return r.count > 0;
  },
  async listSubscribers() {
    const sql = await db();
    return rows(await sql<Row<Subscriber>[]>`select data from es_subscribers order by created desc`);
  },

  async getAvailability() {
    const sql = await db();
    const r = await sql<{ dish_id: string; available: boolean }[]>`select dish_id, available from es_availability`;
    return Object.fromEntries(r.map((x) => [x.dish_id, x.available]));
  },
  async setAvailability(id, available) {
    const sql = await db();
    await sql`insert into es_availability (dish_id, available) values (${id}, ${available}) on conflict (dish_id) do update set available = excluded.available`;
  },
};
