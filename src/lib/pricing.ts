/* Price calculation shared by the cart (browser) and the order API (server). */
import { coupons, dishById, fees, options, type Dish } from "./data";

export type DishOptions = { spice: number; portion: number; addons: number[] };
export type OrderMode = "delivery" | "pickup";

export const rupee = (n: number) => "₹" + Math.round(n).toLocaleString("en-IN");

export function unitPrice(dish: Dish, opts: DishOptions | null): number {
  let p = dish.price;
  if (opts) {
    p += options.portion.choices[opts.portion]?.[1] ?? 0;
    opts.addons.forEach((a) => (p += options.addons.choices[a]?.[1] ?? 0));
  }
  return p;
}

export function optionsLabel(opts: DishOptions | null): string {
  if (!opts) return "";
  const out: string[] = [options.spice.choices[opts.spice]?.[0] ?? ""];
  if (opts.portion) out.push(options.portion.choices[opts.portion][0]);
  opts.addons.forEach((a) => out.push("+ " + options.addons.choices[a][0]));
  return out.filter(Boolean).join(" · ");
}

export type Totals = {
  subtotal: number;
  discount: number;
  delivery: number;
  packaging: number;
  gst: number;
  total: number;
};

/** Totals plus a human-readable coupon problem (null when the coupon is fine or absent). */
export function computeTotals(
  lines: { id: string; qty: number; opts: DishOptions | null }[],
  coupon: string | null,
  mode: OrderMode,
): Totals & { couponError: string | null; after: number } {
  const subtotal = lines.reduce((a, l) => {
    const d = dishById(l.id);
    return d ? a + unitPrice(d, l.opts) * l.qty : a;
  }, 0);
  let discount = 0;
  let couponError: string | null = null;
  if (coupon) {
    const c = coupons[coupon];
    if (!c) couponError = `Coupon ${coupon} doesn't exist.`;
    else if (subtotal < c.min) couponError = `Add ${rupee(c.min - subtotal)} more to use ${coupon}.`;
    else discount = c.type === "percent" ? Math.round((subtotal * c.value) / 100) : c.value;
  }
  const after = Math.max(0, subtotal - discount);
  const delivery = mode === "delivery" && subtotal > 0 && after < fees.freeDeliveryAbove ? fees.deliveryFee : 0;
  const packaging = subtotal > 0 ? fees.packaging : 0;
  const gst = Math.round(after * fees.gst);
  return { subtotal, discount, delivery, packaging, gst, total: after + delivery + packaging + gst, couponError, after };
}
