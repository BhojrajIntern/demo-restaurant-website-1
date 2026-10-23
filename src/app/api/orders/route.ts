import { json, readJson, route } from "@/lib/server/api";
import { createOrder } from "@/lib/server/logic";
import { rateLimit } from "@/lib/server/rate-limit";

export const POST = route(async (req) => {
  rateLimit(req, "order", 15, 10 * 60);
  return json(await createOrder(await readJson(req)), 201);
});
