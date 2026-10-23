import { NextResponse } from "next/server";
import { route } from "@/lib/server/api";
import { COOKIE, cookieOptions } from "@/lib/server/auth";

export const POST = route(async (req) => {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, "", cookieOptions(req, 0));
  return res;
});
