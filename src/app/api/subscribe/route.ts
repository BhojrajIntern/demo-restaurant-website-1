import { json, readJson, route } from "@/lib/server/api";
import { createSubscriber } from "@/lib/server/logic";
import { rateLimit } from "@/lib/server/rate-limit";

export const POST = route(async (req) => {
  rateLimit(req, "subscribe", 8, 10 * 60);
  return json(await createSubscriber(await readJson(req)), 201);
});
