import { NextResponse } from "next/server";
import { ApiError, readJson, route } from "@/lib/server/api";
import { COOKIE, SESSION_SECONDS, adminPassword, cookieOptions, createSession, passwordMatches } from "@/lib/server/auth";
import { rateLimit } from "@/lib/server/rate-limit";

export const POST = route(async (req) => {
  rateLimit(req, "login", 10, 15 * 60);
  if (!adminPassword()) {
    throw new ApiError(503, "The dashboard is locked: set a strong ADMIN_PASSWORD (10+ characters, not the demo one) on the server and restart. See DEPLOY.md.");
  }
  const body = await readJson(req);
  if (!passwordMatches(body.password)) {
    await new Promise((r) => setTimeout(r, 600)); // slow down password guessing
    throw new ApiError(401, "Wrong password — it's case-sensitive.");
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, createSession(), cookieOptions(req, SESSION_SECONDS));
  return res;
});
