/* JSON-file store (data/db.json). Suitable for local development and a single server with a
   persistent disk (VPS, Docker with a volume). Not for serverless hosting — use Postgres there. */
import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import type { Enquiry, Order, Reservation, Subscriber } from "../../types";
import type { Store } from "./types";

type Data = {
  orders: Order[];
  reservations: Reservation[];
  enquiries: Enquiry[];
  subscribers: Subscriber[];
  availability: Record<string, boolean>;
  seq: { order: number; reservation: number; enquiry: number };
};

/* DATA_DIR if set; otherwise ./data in the folder npm was started from (INIT_CWD), because the standalone
   server changes its working directory to .next/standalone — which is wiped on every build. */
export const DATA_DIR = process.env.DATA_DIR || path.join(process.env.INIT_CWD || process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "db.json");

const empty = (): Data => ({
  orders: [], reservations: [], enquiries: [], subscribers: [], availability: {},
  seq: { order: 1000, reservation: 500, enquiry: 100 },
});

async function load(): Promise<Data> {
  try {
    const raw = JSON.parse(await fs.readFile(DB_PATH, "utf8"));
    return { ...empty(), ...raw, seq: { ...empty().seq, ...(raw.seq ?? {}) } };
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === "ENOENT") return empty();
    throw e;
  }
}

async function save(d: Data) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const tmp = `${DB_PATH}.${process.pid}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(d, null, 2), "utf8");
  await fs.rename(tmp, DB_PATH);
}

// One write queue per process, shared by every route (kept on globalThis to survive hot reloads).
const g = globalThis as unknown as { __esFileQueue?: Promise<unknown> };

function write<T>(fn: (d: Data) => T): Promise<T> {
  const run = (g.__esFileQueue ?? Promise.resolve()).catch(() => {}).then(async () => {
    const d = await load();
    const result = fn(d);
    await save(d);
    return result;
  });
  g.__esFileQueue = run.catch(() => {});
  return run;
}

async function read(): Promise<Data> {
  await g.__esFileQueue?.catch(() => {});
  return load();
}

function updateIn<T extends { id: string }>(list: T[], id: string, fn: (x: T) => void): T | null {
  const item = list.find((x) => x.id === id);
  if (!item) return null;
  fn(item);
  return item;
}

export const fileStore: Store = {
  kind: "file",
  async ping() {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.access(DATA_DIR, fs.constants.W_OK);
  },

  insertOrder: (o) => write((d) => {
    d.seq.order += 1;
    const order = { ...o, id: `ES${d.seq.order}` } as Order;
    d.orders.push(order);
    return order;
  }),
  getOrder: async (id) => (await read()).orders.find((o) => o.id === id) ?? null,
  updateOrder: (id, fn) => write((d) => updateIn(d.orders, id, fn)),
  listOrders: async (limit) => [...(await read()).orders].sort((a, b) => b.created.localeCompare(a.created)).slice(0, limit),

  insertReservation: (r, capacity) => write((d) => {
    const taken = d.reservations.filter((x) => x.date === r.date && x.time === r.time && x.status !== "cancelled").length;
    if (taken >= capacity) return null;
    d.seq.reservation += 1;
    const res = { ...r, id: `R${d.seq.reservation}` } as Reservation;
    d.reservations.push(res);
    return res;
  }),
  slotCounts: async (date) => {
    const counts: Record<string, number> = {};
    for (const r of (await read()).reservations) if (r.date === date && r.status !== "cancelled") counts[r.time] = (counts[r.time] ?? 0) + 1;
    return counts;
  },
  updateReservation: (id, fn) => write((d) => updateIn(d.reservations, id, fn)),
  listReservations: async (fromDate) =>
    (await read()).reservations.filter((r) => r.date >= fromDate).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time)),

  insertEnquiry: (e) => write((d) => {
    d.seq.enquiry += 1;
    const enq = { ...e, id: `E${d.seq.enquiry}` } as Enquiry;
    d.enquiries.push(enq);
    return enq;
  }),
  updateEnquiry: (id, fn) => write((d) => updateIn(d.enquiries, id, fn)),
  listEnquiries: async (limit) => [...(await read()).enquiries].sort((a, b) => b.created.localeCompare(a.created)).slice(0, limit),

  addSubscriber: (s) => write((d) => {
    if (d.subscribers.some((x) => x.email.toLowerCase() === s.email.toLowerCase())) return false;
    d.subscribers.push(s);
    return true;
  }),
  listSubscribers: async () => [...(await read()).subscribers].sort((a, b) => b.created.localeCompare(a.created)),

  getAvailability: async () => (await read()).availability,
  setAvailability: async (id, available) => { await write((d) => { d.availability[id] = available; }); },
};
