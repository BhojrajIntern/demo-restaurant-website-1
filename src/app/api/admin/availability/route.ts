import { json, readJson, route } from "@/lib/server/api";
import { setAvailability } from "@/lib/server/logic";

/** Switch a dish on/off ("Sold out" on the website). */
export const PUT = route(
  async (req) => {
    const body = await readJson(req);
    return json(await setAvailability(String(body.id), Boolean(body.available)));
  },
  { admin: true },
);
