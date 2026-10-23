import { json, route } from "@/lib/server/api";
import { soldOutIds } from "@/lib/server/logic";

/** Dishes the kitchen has switched off — the website shows them as "Sold out". */
export const GET = route(async () => json({ soldOut: await soldOutIds() }));
