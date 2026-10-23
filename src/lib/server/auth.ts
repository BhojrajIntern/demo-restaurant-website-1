/* Manager login: password from the environment + signed, HttpOnly session cookie. */
import "server-only";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";

export const COOKIE = "es_admin";
export const SESSION_SECONDS = 12 * 60 * 60;

const DEMO_PASSWORD = "ember-admin";
const isProd = process.env.NODE_ENV === "production";

/**
 * The admin password, or null when the dashboard must stay locked.
 * In production the demo password (or a short one) is refused, so a live site can never be opened with it.
 */
export function adminPassword(): string | null {
  const pw = (process.env.ADMIN_PASSWORD ?? "").trim();
  if (!isProd) return pw || DEMO_PASSWORD;
  if (!pw || pw === DEMO_PASSWORD || pw.length < 10) return null;
  return pw;
}

/**
 * Key that signs session cookies. ADMIN_SESSION_SECRET if set; otherwise derived from the password,
 * so it's identical on every server instance and changing the password signs everyone out.
 */
function secret(): Buffer {
  const s = process.env.ADMIN_SESSION_SECRET;
  if (s && s.length >= 32) return Buffer.from(s);
  return createHash("sha256").update("ember-saffron-session:" + (adminPassword() ?? "locked")).digest();
}

const sign = (data: string) => createHmac("sha256", secret()).update(data).digest("base64url");

export function passwordMatches(input: unknown): boolean {
  const pw = adminPassword();
  if (!pw) return false;
  const a = createHash("sha256").update(String(input ?? "").trim()).digest();
  const b = createHash("sha256").update(pw).digest();
  return timingSafeEqual(a, b);
}

export function createSession(): string {
  const exp = String(Math.floor(Date.now() / 1000) + SESSION_SECONDS);
  return `${exp}.${sign(exp)}`;
}

export function isLoggedIn(req: NextRequest): boolean {
  if (!adminPassword()) return false;
  const token = req.cookies.get(COOKIE)?.value;
  if (!token) return false;
  const [exp, sig] = token.split(".");
  if (!exp || !sig || Number(exp) * 1000 < Date.now()) return false;
  const expected = Buffer.from(sign(exp));
  const given = Buffer.from(sig);
  return expected.length === given.length && timingSafeEqual(expected, given);
}

/** Secure cookies over HTTPS; plain HTTP still works for local testing. */
export function cookieOptions(req: NextRequest, maxAge: number) {
  const https = req.nextUrl.protocol === "https:" || req.headers.get("x-forwarded-proto") === "https";
  return { httpOnly: true, sameSite: "strict" as const, path: "/", maxAge, secure: https };
}
