import { json, readJson, route } from "@/lib/server/api";
import { setReservationStatus } from "@/lib/server/logic";

export const PATCH = route(
  async (req, ctx: { params: Promise<{ id: string }> }) => {
    const { id } = await ctx.params;
    return json(await setReservationStatus(id, String((await readJson(req)).status)));
  },
  { admin: true },
);
