import type { Enquiry, Order, Reservation, Subscriber } from "../../types";

/**
 * Everything the app needs from a database. Two implementations:
 *  - postgres.ts  (used when DATABASE_URL is set — recommended for hosting)
 *  - file.ts      (data/db.json — local development or a single server with a persistent disk)
 * All update functions are atomic: two managers clicking at the same moment can't overwrite each other.
 */
export interface Store {
  readonly kind: "postgres" | "file" | "showcase";
  ping(): Promise<void>;

  insertOrder(order: Omit<Order, "id">): Promise<Order>;
  getOrder(id: string): Promise<Order | null>;
  /** Locks the order, lets `fn` change it (or throw), then saves. Returns null if it doesn't exist. */
  updateOrder(id: string, fn: (o: Order) => void): Promise<Order | null>;
  listOrders(limit: number): Promise<Order[]>;

  /** Inserts unless the time slot already has `capacity` active bookings (then returns null). */
  insertReservation(r: Omit<Reservation, "id">, capacity: number): Promise<Reservation | null>;
  slotCounts(date: string): Promise<Record<string, number>>;
  updateReservation(id: string, fn: (r: Reservation) => void): Promise<Reservation | null>;
  listReservations(fromDate: string): Promise<Reservation[]>;

  insertEnquiry(e: Omit<Enquiry, "id">): Promise<Enquiry>;
  updateEnquiry(id: string, fn: (e: Enquiry) => void): Promise<Enquiry | null>;
  listEnquiries(limit: number): Promise<Enquiry[]>;

  /** Returns false when the email is already subscribed. */
  addSubscriber(s: Subscriber): Promise<boolean>;
  listSubscribers(): Promise<Subscriber[]>;

  /** dish id -> available (only dishes the manager has changed). */
  getAvailability(): Promise<Record<string, boolean>>;
  setAvailability(dishId: string, available: boolean): Promise<void>;
}
