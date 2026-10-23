import { json, route } from "@/lib/server/api";
import { store } from "@/lib/server/store";

/** Health check for hosting platforms / uptime monitors: also verifies the database is reachable. */
export const GET = route(async () => {
  const s = store();
  try {
    await s.ping();
    return json({ ok: true, store: s.kind });
  } catch (e) {
    console.error("[health] database unreachable", e);
    return json({ ok: false, store: s.kind, error: "Database unreachable" }, 503);
  }
});
