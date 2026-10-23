import { json, readJson, route } from "@/lib/server/api";
import { setOrderStatus } from "@/lib/server/logic";
import type { OrderStatus } from "@/lib/types";

export const PATCH = route(
  async (req, ctx: { params: Promise<{ id: string }> }) => {
    const { id } = await ctx.params;
    const body = await readJson(req);
    return json(await setOrderStatus(id, body.status as OrderStatus, String(body.reason ?? "")));
  },
  { admin: true },
);
