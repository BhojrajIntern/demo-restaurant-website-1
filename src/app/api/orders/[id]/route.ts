import { createHash, timingSafeEqual } from "node:crypto";
import { ApiError, json, route } from "@/lib/server/api";
import { toPublicOrder } from "@/lib/server/logic";
import { store } from "@/lib/server/store";

const digest = (s: string) => createHash("sha256").update(s).digest();

/** Customer order tracking. Needs the secret token returned when the order was placed. */
export const GET = route(async (req, ctx: { params: Promise<{ id: string }> }) => {
  const { id } = await ctx.params;
  const token = req.nextUrl.searchParams.get("t") ?? "";
  const order = /^ES\d{1,10}$/.test(id) ? await store().getOrder(id) : null;
  if (!order || !timingSafeEqual(digest(token), digest(order.token))) throw new ApiError(404, "Order not found");
  return json(toPublicOrder(order));
});
