/* Helpers shared by the API route handlers: JSON parsing, validation and error responses. */
import "server-only";
import { unstable_rethrow } from "next/navigation";
import { connection, NextResponse, type NextRequest } from "next/server";
import { isLoggedIn } from "./auth";

export class ApiError extends Error {
  constructor(public status: number, message: string, public field?: string) {
    super(message);
  }
}

const MAX_BODY = 64 * 1024;

type Handler<C> = (req: NextRequest, ctx: C) => Promise<Response>;

/** Wraps a route handler: turns ApiErrors into JSON responses and hides unexpected errors. */
export function route<C>(fn: Handler<C>, opts: { admin?: boolean } = {}): Handler<C> {
  return async (req, ctx) => {
    // API answers depend on the request, the database and the clock — never prerender them at build time.
    await connection();
    try {
      if (req.method !== "GET") sameOrigin(req);
      if (opts.admin && !isLoggedIn(req)) throw new ApiError(401, "Please log in");
      return await fn(req, ctx);
    } catch (e) {
      unstable_rethrow(e); // let Next.js handle its own internal signals (e.g. "this route is dynamic")
      if (e instanceof ApiError) return NextResponse.json({ error: e.message, field: e.field ?? null }, { status: e.status });
      console.error(e);
      return NextResponse.json({ error: "Something went wrong on our side — please try again." }, { status: 500 });
    }
  };
}

/** Blocks form posts from other websites (CSRF): the Origin header must match this site. */
function sameOrigin(req: NextRequest) {
  const origin = req.headers.get("origin");
  if (origin && new URL(origin).host !== req.headers.get("host")) throw new ApiError(403, "Cross-site request blocked");
}

export async function readJson(req: NextRequest): Promise<Record<string, unknown>> {
  if (!(req.headers.get("content-type") ?? "").includes("application/json")) throw new ApiError(415, "Expected JSON");
  if (Number(req.headers.get("content-length") ?? 0) > MAX_BODY) throw new ApiError(413, "Request too large");
  const text = await req.text();
  if (text.length > MAX_BODY) throw new ApiError(413, "Request too large");
  let body: unknown;
  try {
    body = JSON.parse(text || "{}");
  } catch {
    throw new ApiError(400, "Invalid JSON");
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) throw new ApiError(400, "Invalid JSON");
  return body as Record<string, unknown>;
}

export const json = (data: unknown, status = 200) => NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });

/* ---------------------------------------------------------------- validators */
const PHONE_RE = /^[6-9]\d{9}$/;
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export function text(body: Record<string, unknown>, key: string, { required = true, min = 1, max = 200 } = {}): string {
  const v = body[key] == null ? "" : String(body[key]).trim();
  if (!v) {
    if (required) throw new ApiError(400, `Please fill in ${key}`, key);
    return "";
  }
  if (v.length < min || v.length > max) throw new ApiError(400, `${key} must be ${min}-${max} characters`, key);
  return v;
}

export function phone(body: Record<string, unknown>, key = "phone"): string {
  const digits = String(body[key] ?? "").replace(/\D/g, "").slice(-10);
  if (!PHONE_RE.test(digits)) throw new ApiError(400, "Enter a valid 10-digit Indian mobile number", key);
  return digits;
}

export function email(body: Record<string, unknown>, key = "email", required = true): string {
  const v = String(body[key] ?? "").trim();
  if (!v && !required) return "";
  if (!EMAIL_RE.test(v) || v.length > 120) throw new ApiError(400, "Enter a valid email address", key);
  return v;
}

export function int(body: Record<string, unknown>, key: string): number {
  const n = Number(body[key]);
  if (!Number.isInteger(n)) throw new ApiError(400, `${key} must be a whole number`, key);
  return n;
}
