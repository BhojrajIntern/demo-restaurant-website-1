import { json, route } from "@/lib/server/api";
import { fullSlots } from "@/lib/server/logic";

/** Time slots that have reached capacity on a given date (?date=YYYY-MM-DD). */
export const GET = route(async (req) => json({ full: await fullSlots(req.nextUrl.searchParams.get("date") ?? "") }));
