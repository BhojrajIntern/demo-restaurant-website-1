/* Showcase store: used for public demos. Nothing a visitor submits is ever saved — every insert
   just echoes the record back (so the website can show its confirmation) and is then forgotten.
   The manager dashboard reads a fixed set of made-up sample records, dated around "today". */
import "server-only";
import { randomInt } from "node:crypto";
import { dishById } from "../../data";
import { addDays, restaurantNow } from "../../hours";
import { computeTotals, optionsLabel, type OrderMode } from "../../pricing";
import type { Enquiry, Order, OrderLine, OrderStatus, Reservation, Subscriber } from "../../types";
import type { Store } from "./types";

const id = (prefix: string) => `${prefix}${randomInt(9000, 9999)}`;
const at = (day: string, hhmm: string) => `${day}T${hhmm}:00+05:30`;

function sampleOrder(n: number, day: string, hhmm: string, status: OrderStatus, mode: OrderMode, name: string, phone: string, dishes: [string, number][]): Order {
  const lines = dishes.map(([dish, qty]) => ({ id: dish, qty, opts: null }));
  const t = computeTotals(lines, null, mode);
  const items: OrderLine[] = dishes.map(([dish, qty]) => {
    const d = dishById(dish)!;
    return { id: d.id, name: d.name, veg: d.veg, qty, unit: d.price, options: optionsLabel(null), line: d.price * qty };
  });
  const created = at(day, hhmm);
  const flow: OrderStatus[] = ["new", "accepted", "preparing", mode === "delivery" ? "out_for_delivery" : "ready", "completed"];
  const history = flow.slice(0, flow.indexOf(status) + 1).map((s, i) => ({ status: s, at: at(day, `${hhmm.slice(0, 2)}:${String(Math.min(59, Number(hhmm.slice(3)) + i * 7)).padStart(2, "0")}`) }));
  return {
    id: `ES${1000 + n}`, token: "sample", created, status, history, mode, when: "asap",
    payment: mode === "delivery" ? "UPI on delivery" : "Pay at counter", paid: status === "completed",
    customer: { name, phone, whatsapp: false },
    address: mode === "delivery" ? "Sample Apartments, 123 Example Street, Demo Nagar" : "", pincode: mode === "delivery" ? "560038" : "",
    note: "", coupon: null, items,
    totals: { subtotal: t.subtotal, discount: t.discount, delivery: t.delivery, packaging: t.packaging, gst: t.gst, total: t.total },
    cancelReason: "",
  };
}

function sampleData() {
  const today = restaurantNow(new Date()).iso;
  const yesterday = addDays(today, -1);
  const orders: Order[] = [
    sampleOrder(8, today, "20:12", "new", "delivery", "Sample Customer A", "0000000001", [["butter-chicken", 1], ["butter-naan", 3]]),
    sampleOrder(7, today, "19:48", "accepted", "pickup", "Sample Customer B", "0000000002", [["paneer-tikka", 1], ["veg-biryani", 2]]),
    sampleOrder(6, today, "19:30", "preparing", "delivery", "Sample Customer C", "0000000003", [["dum-biryani", 2], ["kokum-cooler", 2]]),
    sampleOrder(5, today, "13:05", "completed", "delivery", "Sample Customer D", "0000000004", [["north-thali", 2]]),
    sampleOrder(4, today, "12:40", "completed", "pickup", "Sample Customer E", "0000000005", [["samosa-chaat", 2], ["masala-chai", 2]]),
    sampleOrder(3, yesterday, "21:15", "completed", "delivery", "Sample Customer F", "0000000006", [["royal-thali", 2], ["gulab-jamun", 2]]),
    sampleOrder(2, yesterday, "20:02", "completed", "pickup", "Sample Customer G", "0000000007", [["rogan-josh", 1], ["jeera-rice", 1]]),
  ];
  const res = (n: number, date: string, time: string, party: number, seating: string, name: string, status: Reservation["status"], occasion = ""): Reservation => ({
    id: `R${500 + n}`, created: at(addDays(date, -2), "10:00"), status, date, time, party, seating, name,
    phone: `00000001${String(n).padStart(2, "0")}`, email: `guest${n}@example.com`, occasion, notes: "",
  });
  const reservations: Reservation[] = [
    res(1, today, "19:30", 4, "Dining hall", "Sample Guest One", "confirmed"),
    res(2, today, "20:00", 2, "Terrace", "Sample Guest Two", "confirmed", "Anniversary"),
    res(3, today, "20:30", 6, "Dining hall", "Sample Guest Three", "confirmed", "Birthday"),
    res(4, addDays(today, 1), "13:00", 3, "Bar counter", "Sample Guest Four", "confirmed"),
    res(5, addDays(today, 2), "20:00", 5, "Terrace", "Sample Guest Five", "confirmed"),
    res(6, yesterday, "19:00", 2, "Dining hall", "Sample Guest Six", "completed"),
  ];
  const enquiries: Enquiry[] = [
    { id: "E101", kind: "event", created: at(today, "11:20"), status: "new", name: "Sample Organiser", email: "events@example.com", message: "Corporate dinner (sample enquiry).", eventType: "Corporate dinner", date: addDays(today, 21), guests: 40 },
    { id: "E102", kind: "giftcard", created: at(yesterday, "17:45"), status: "contacted", name: "Sample Recipient", email: "gifts@example.com", message: "Happy birthday! (sample enquiry)", amount: 2500 },
  ];
  const subscribers: Subscriber[] = [
    { email: "subscriber1@example.com", birthday: "21/10", created: at(yesterday, "09:30") },
    { email: "subscriber2@example.com", birthday: "", created: at(today, "08:15") },
    { email: "subscriber3@example.com", birthday: "05/03", created: at(today, "10:40") },
  ];
  return { orders, reservations, enquiries, subscribers };
}

/** Applies `fn` to a copy of the sample record (so its validation still runs) and discards the result. */
async function previewUpdate<T extends { id: string }>(list: T[], recId: string, fn: (r: T) => void): Promise<T | null> {
  const found = list.find((r) => r.id === recId);
  if (!found) return null;
  const copy = structuredClone(found);
  fn(copy);
  return copy;
}

export const showcaseStore: Store = {
  kind: "showcase",
  ping: async () => {},

  insertOrder: async (o) => ({ ...o, id: id("ES") }),
  getOrder: async () => null,
  updateOrder: (oid, fn) => previewUpdate(sampleData().orders, oid, fn),
  listOrders: async (limit) => sampleData().orders.slice(0, limit),

  insertReservation: async (r) => ({ ...r, id: id("R") }),
  slotCounts: async () => ({}),
  updateReservation: (rid, fn) => previewUpdate(sampleData().reservations, rid, fn),
  listReservations: async (fromDate) => sampleData().reservations.filter((r) => r.date >= fromDate),

  insertEnquiry: async (e) => ({ ...e, id: id("E") }),
  updateEnquiry: (eid, fn) => previewUpdate(sampleData().enquiries, eid, fn),
  listEnquiries: async (limit) => sampleData().enquiries.slice(0, limit),

  addSubscriber: async () => true,
  listSubscribers: async () => sampleData().subscribers,

  getAvailability: async () => ({}),
  setAvailability: async () => {},
};
