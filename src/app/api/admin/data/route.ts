import { json, route } from "@/lib/server/api";
import { adminData } from "@/lib/server/logic";

/** Everything the manager dashboard shows. Polled every few seconds. */
export const GET = route(async () => json(await adminData()), { admin: true });
