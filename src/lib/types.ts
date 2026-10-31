/* Records stored by the server and shown in the manager dashboard. */
import type { OrderMode, Totals } from "./pricing";

export type OrderStatus = "new" | "accepted" | "preparing" | "ready" | "out_for_delivery" | "completed" | "cancelled";
export type ReservationStatus = "confirmed" | "seated" | "completed" | "no_show" | "cancelled";
export type EnquiryStatus = "new" | "contacted" | "closed";

export type OrderLine = { id: string; name: string; veg: boolean; qty: number; unit: number; options: string; line: number };

export type Order = {
  id: string;
  /** secret that lets the customer (and only them) track this order */
  token: string;
  created: string;
  status: OrderStatus;
  history: { status: OrderStatus; at: string }[];
  mode: OrderMode;
  when: string;
  payment: string;
  paid: boolean;
  customer: { name: string; phone: string; whatsapp: boolean };
  address: string;
  pincode: string;
  note: string;
  coupon: string | null;
  items: OrderLine[];
  totals: Totals;
  cancelReason: string;
};

export type Reservation = {
  id: string;
  created: string;
  status: ReservationStatus;
  date: string;
  time: string;
  party: number;
  seating: string;
  name: string;
  phone: string;
  email: string;
  occasion: string;
  notes: string;
};

export type Enquiry = {
  id: string;
  kind: "event" | "giftcard";
  created: string;
  status: EnquiryStatus;
  name: string;
  email: string;
  message: string;
  eventType?: string;
  date?: string;
  guests?: number;
  amount?: number;
};

export type Subscriber = { email: string; birthday: string; created: string };

export type Database = {
  orders: Order[];
  reservations: Reservation[];
  enquiries: Enquiry[];
  subscribers: Subscriber[];
  /** dish id -> available (overrides the default in data.ts) */
  availability: Record<string, boolean>;
  seq: { order: number; reservation: number; enquiry: number };
};

/** What a customer sees when tracking their order. */
export type PublicOrder = Pick<Order, "id" | "status" | "mode" | "created" | "history" | "totals" | "cancelReason"> & {
  items: { name: string; qty: number }[];
  name: string;
};

export type AdminStats = {
  ordersToday: number;
  revenueToday: number;
  newOrders: number;
  activeOrders: number;
  bookingsToday: number;
  coversToday: number;
  newEnquiries: number;
  subscribers: number;
  avgOrder: number;
};

export type AdminData = {
  serverTime: string;
  /** true when running as a public demo: the data below is sample data and nothing is saved */
  showcase: boolean;
  today: string;
  stats: AdminStats;
  orders: Omit<Order, "token">[];
  reservations: Reservation[];
  enquiries: Enquiry[];
  subscribers: Subscriber[];
  menu: { id: string; cat: string; name: string; price: number; veg: boolean; available: boolean }[];
};
