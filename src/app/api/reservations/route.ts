import { json, readJson, route } from "@/lib/server/api";
import { createReservation } from "@/lib/server/logic";
import { rateLimit } from "@/lib/server/rate-limit";

export const POST = route(async (req) => {
  rateLimit(req, "booking", 10, 10 * 60);
  return json(await createReservation(await readJson(req)), 201);
});
