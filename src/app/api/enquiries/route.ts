import { json, readJson, route } from "@/lib/server/api";
import { createEnquiry } from "@/lib/server/logic";
import { rateLimit } from "@/lib/server/rate-limit";

/** Private-event enquiries and gift-card requests. */
export const POST = route(async (req) => {
  rateLimit(req, "enquiry", 8, 10 * 60);
  return json(await createEnquiry(await readJson(req)), 201);
});
