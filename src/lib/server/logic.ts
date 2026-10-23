/* Business rules for orders, reservations, enquiries and the dashboard. */
import "server-only";
import { randomBytes } from "node:crypto";
import { MAX_ONLINE_PARTY, SLOT_CAPACITY, coupons, dishById, fees, menu, seatingOptions, servicePincodes } from "../data";
import { addDays, openStatus, restaurantNow } from "../hours";
import { computeTotals, optionsLabel, unitPrice, type DishOptions, type OrderMode } from "../pricing";
import type { AdminData, AdminStats, Enquiry, Order, OrderLine, OrderStatus, PublicOrder, Reservation } from "../types";
import { ApiError, email, int, phone, text } from "./api";
import { store } from "./store";

/** ISO timestamp in Indian Standard Time, e.g. 2026-10-22T19:05:00+05:30 */
export const nowISO = () => new Date(Date.now() + 330 * 60000).toISOString().slice(0, 19) + "+05:30";
export const todayIST = () => restaurantNow(new Date()).iso;

/* ---------------------------------------------------------------- availability */
export async function soldOutIds(): Promise<string[]> {
  const overrides = await store().getAvailability();
  return menu.filter((d) => !(overrides[d.id] ?? !d.soldOut)).map((d) => d.id);
}

export async function setAvailability(id: string, available: boolean) {
  if (!dishById(id)) throw new ApiError(404, "Dish not found");
  await store().setAvailability(id, available);
  return { ok: true };
}

/* ---------------------------------------------------------------- orders */
/** No online payment is taken: customers pay when they receive the order. */
export const PAYMENTS = { delivery: ["Cash on delivery", "UPI on delivery", "Card on delivery"], pickup: ["Pay at counter"] } as const;

function parseOptions(raw: unknown, dishName: string): DishOptions {
  const o = (raw ?? {}) as { spice?: unknown; portion?: unknown; addons?: unknown };
  const spice = Number(o.spice ?? 1), portion = Number(o.portion ?? 0);
  const addons = [...new Set((Array.isArray(o.addons) ? o.addons : []).map(Number))].sort((a, b) => a - b);
  const valid = [spice, portion, ...addons].every(Number.isInteger) && spice >= 0 && spice < 4 && portion >= 0 && portion < 2 && addons.every((a) => a >= 0 && a < 5);
  if (!valid) throw new ApiError(400, `Invalid options for ${dishName}`);
  return { spice, portion, addons };
}

export async function createOrder(body: Record<string, unknown>) {
  const mode = body.mode as OrderMode;
  if (mode !== "delivery" && mode !== "pickup") throw new ApiError(400, "Choose delivery or pickup");
  const name = text(body, "name", { min: 2, max: 80 });
  const ph = phone(body);
  let address = "", pincode = "";
  if (mode === "delivery") {
    address = text(body, "address", { min: 8, max: 300 });
    pincode = text(body, "pincode", { max: 6 });
    if (!servicePincodes.includes(pincode)) throw new ApiError(400, "Sorry — we don't deliver to this pincode yet. Try pickup!", "pincode");
  }
  const allowed: readonly string[] = PAYMENTS[mode];
  const payment = allowed.includes(String(body.payment)) ? String(body.payment) : allowed[0];
  const when = text(body, "when", { required: false, max: 20 }) || "asap";
  if (!/^(asap|(tmr-)?([01]\d|2[0-3]):[0-5]\d)$/.test(when)) throw new ApiError(400, "Invalid order time");
  if (when === "asap" && !openStatus(new Date()).open) {
    throw new ApiError(409, "The kitchen is closed right now — please choose a later time for your order.", "when");
  }
  const note = text(body, "note", { required: false, max: 500 });
  const coupon = body.coupon ? String(body.coupon).toUpperCase().trim().slice(0, 20) : null;

  const rawItems = body.items;
  if (!Array.isArray(rawItems) || rawItems.length === 0) throw new ApiError(400, "Your order is empty");
  if (rawItems.length > 50) throw new ApiError(400, "Too many items in one order");

  // Recalculate everything from the menu — prices sent by the browser are ignored.
  const soldOut = new Set(await soldOutIds());
  const lines: { id: string; qty: number; opts: DishOptions | null }[] = [];
  const items: OrderLine[] = [];
  for (const raw of rawItems as Record<string, unknown>[]) {
    const dish = dishById(String(raw?.id));
    if (!dish) throw new ApiError(400, "One of the dishes no longer exists — please refresh the menu");
    if (soldOut.has(dish.id)) throw new ApiError(409, `Sorry, ${dish.name} has just sold out. Please remove it from your order.`);
    const qty = Number(raw.qty);
    if (!Number.isInteger(qty) || qty < 1 || qty > 20) throw new ApiError(400, "Quantity must be between 1 and 20");
    let opts: DishOptions | null = null;
    if (raw.opts) {
      if (!dish.custom) throw new ApiError(400, `${dish.name} has no options`);
      opts = parseOptions(raw.opts, dish.name);
    }
    const unit = unitPrice(dish, opts);
    lines.push({ id: dish.id, qty, opts });
    items.push({ id: dish.id, name: dish.name, veg: dish.veg, qty, unit, options: optionsLabel(opts), line: unit * qty });
  }
  const t = computeTotals(lines, coupon, mode);
  if (t.subtotal < fees.minOrder) throw new ApiError(400, `Minimum order is ₹${fees.minOrder}`);
  if (coupon && t.couponError) throw new ApiError(400, t.couponError);

  const created = nowISO();
  const order = await store().insertOrder({
    token: randomBytes(16).toString("base64url"),
    created,
    status: "new",
    history: [{ status: "new", at: created }],
    mode, when, payment, paid: false,
    customer: { name, phone: ph, whatsapp: Boolean(body.whatsapp) },
    address, pincode, note,
    coupon: coupon && coupons[coupon] ? coupon : null,
    items,
    totals: { subtotal: t.subtotal, discount: t.discount, delivery: t.delivery, packaging: t.packaging, gst: t.gst, total: t.total },
    cancelReason: "",
  });
  console.info(`[order] ${order.id} ${mode} ₹${order.totals.total}`);
  return { id: order.id, token: order.token, status: order.status, totals: order.totals };
}

export function toPublicOrder(o: Order): PublicOrder {
  return {
    id: o.id, status: o.status, mode: o.mode, created: o.created, history: o.history, totals: o.totals,
    cancelReason: o.cancelReason, items: o.items.map((i) => ({ name: i.name, qty: i.qty })), name: o.customer.name.split(" ")[0],
  };
}

const ORDER_FLOW: Record<OrderStatus, OrderStatus[]> = {
  new: ["accepted", "cancelled"],
  accepted: ["preparing", "cancelled"],
  preparing: ["ready", "out_for_delivery", "cancelled"],
  ready: ["completed", "cancelled"],
  out_for_delivery: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
};

export async function setOrderStatus(id: string, next: OrderStatus, reason: string) {
  const updated = await store().updateOrder(id, (o) => {
    if (!ORDER_FLOW[o.status]?.includes(next)) throw new ApiError(409, `Can't move an order from '${o.status}' to '${next}'`);
    if (next === "out_for_delivery" && o.mode !== "delivery") throw new ApiError(409, "Pickup orders use 'ready', not 'out for delivery'");
    if (next === "ready" && o.mode !== "pickup") throw new ApiError(409, "Delivery orders use 'out for delivery'");
    o.status = next;
    o.history.push({ status: next, at: nowISO() });
    if (next === "cancelled") o.cancelReason = reason.slice(0, 200);
    if (next === "completed") o.paid = true; // payment is collected on delivery / at pickup
  });
  if (!updated) throw new ApiError(404, "Order not found");
  return { ok: true, status: next };
}

/* ---------------------------------------------------------------- reservations */
export async function fullSlots(day: string): Promise<string[]> {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) throw new ApiError(400, "Invalid date");
  const counts = await store().slotCounts(day);
  return Object.entries(counts).filter(([, n]) => n >= SLOT_CAPACITY).map(([t]) => t);
}

export async function createReservation(body: Record<string, unknown>) {
  const date = String(body.date ?? "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date))) throw new ApiError(400, "Please pick a valid date", "date");
  const today = todayIST();
  if (date < today || date > addDays(today, 60)) throw new ApiError(400, "Bookings open up to 60 days ahead", "date");
  const time = String(body.time ?? "");
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) throw new ApiError(400, "Please choose a time", "time");
  const party = int(body, "party");
  if (party < 1 || party > MAX_ONLINE_PARTY) throw new ApiError(400, `Online bookings are for 1-${MAX_ONLINE_PARTY} guests. Send a group enquiry for more.`, "party");
  const seating = (seatingOptions as readonly string[]).includes(String(body.seating)) ? String(body.seating) : "Dining hall";
  const res = await store().insertReservation({
    created: nowISO(), status: "confirmed", date, time, party, seating,
    name: text(body, "name", { min: 2, max: 80 }),
    phone: phone(body),
    email: email(body, "email", false),
    occasion: text(body, "occasion", { required: false, max: 40 }),
    notes: text(body, "notes", { required: false, max: 500 }),
  }, SLOT_CAPACITY);
  if (!res) throw new ApiError(409, "That time has just been fully booked — please choose another slot.", "time");
  console.info(`[booking] ${res.id} ${date} ${time} x${party}`);
  return { id: res.id, status: res.status };
}

const RES_STATUSES = ["confirmed", "seated", "completed", "no_show", "cancelled"] as const;
export async function setReservationStatus(id: string, status: string) {
  if (!(RES_STATUSES as readonly string[]).includes(status)) throw new ApiError(400, "Unknown status");
  const r = await store().updateReservation(id, (x) => { x.status = status as Reservation["status"]; });
  if (!r) throw new ApiError(404, "Reservation not found");
  return { ok: true };
}

/* ---------------------------------------------------------------- enquiries & newsletter */
export async function createEnquiry(body: Record<string, unknown>) {
  let rec: Omit<Enquiry, "id" | "created" | "status">;
  if (body.kind === "event") {
    const guests = int(body, "guests");
    if (guests < 9 || guests > 500) throw new ApiError(400, "Events are for 9-500 guests", "guests");
    const date = text(body, "date", { max: 10 });
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new ApiError(400, "Pick a date", "date");
    rec = {
      kind: "event", eventType: text(body, "eventType", { max: 40 }), date, guests,
      name: text(body, "name", { min: 2, max: 80 }), email: email(body), message: text(body, "message", { required: false, max: 1000 }),
    };
  } else if (body.kind === "giftcard") {
    const amount = int(body, "amount");
    if (![1000, 2500, 5000, 10000].includes(amount)) throw new ApiError(400, "Choose a gift card amount");
    rec = { kind: "giftcard", amount, name: text(body, "to", { min: 2, max: 80 }), email: email(body), message: text(body, "message", { required: false, max: 500 }) };
  } else {
    throw new ApiError(400, "Unknown enquiry type");
  }
  const e = await store().insertEnquiry({ ...rec, created: nowISO(), status: "new" });
  console.info(`[enquiry] ${e.id} ${e.kind}`);
  return { id: e.id };
}

export async function setEnquiryStatus(id: string, status: string) {
  if (!["new", "contacted", "closed"].includes(status)) throw new ApiError(400, "Unknown status");
  const e = await store().updateEnquiry(id, (x) => { x.status = status as Enquiry["status"]; });
  if (!e) throw new ApiError(404, "Enquiry not found");
  return { ok: true };
}

export async function createSubscriber(body: Record<string, unknown>) {
  const em = email(body);
  const birthday = String(body.birthday ?? "").trim();
  if (birthday && !/^(0[1-9]|[12]\d|3[01])\/(0[1-9]|1[0-2])$/.test(birthday)) throw new ApiError(400, "Birthday should look like 21/10", "birthday");
  if (!body.consent) throw new ApiError(400, "Please agree to receive emails", "consent");
  const added = await store().addSubscriber({ email: em, birthday, created: nowISO() });
  return { ok: true, already: !added };
}

/* ---------------------------------------------------------------- dashboard */
function stats(orders: Order[], reservations: Reservation[], enquiries: Enquiry[], subscribers: number, today: string): AdminStats {
  const live = orders.filter((o) => o.created.startsWith(today) && o.status !== "cancelled");
  const resToday = reservations.filter((r) => r.date === today && r.status !== "cancelled");
  const revenue = live.reduce((a, o) => a + o.totals.total, 0);
  return {
    ordersToday: live.length,
    revenueToday: revenue,
    newOrders: orders.filter((o) => o.status === "new").length,
    activeOrders: orders.filter((o) => ["accepted", "preparing", "ready", "out_for_delivery"].includes(o.status)).length,
    bookingsToday: resToday.length,
    coversToday: resToday.reduce((a, r) => a + r.party, 0),
    newEnquiries: enquiries.filter((e) => e.status === "new").length,
    subscribers,
    avgOrder: live.length ? Math.round(revenue / live.length) : 0,
  };
}

export async function adminData(): Promise<AdminData> {
  const s = store();
  const today = todayIST();
  const [orders, reservations, enquiries, subscribers, availability] = await Promise.all([
    s.listOrders(500), s.listReservations(addDays(today, -30)), s.listEnquiries(300), s.listSubscribers(), s.getAvailability(),
  ]);
  return {
    serverTime: nowISO(),
    today,
    stats: stats(orders, reservations, enquiries, subscribers.length, today),
    orders: orders.map(({ token, ...o }) => (void token, o)),
    reservations,
    enquiries,
    subscribers,
    menu: menu.map((d) => ({ id: d.id, cat: d.cat, name: d.name, price: d.price, veg: d.veg, available: availability[d.id] ?? !d.soldOut })),
  };
}
