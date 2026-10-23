/* Simple in-memory rate limiter (per server instance) to slow down spam and password guessing.
   For multi-server deployments put a CDN/WAF rate limit (e.g. Cloudflare) in front as well. */
import "server-only";
import type { NextRequest } from "next/server";
import { ApiError } from "./api";

type Bucket = { count: number; reset: number };
const g = globalThis as unknown as { __esRate?: Map<string, Bucket> };
const buckets = (g.__esRate ??= new Map());

/** Visitor IP as reported by the hosting proxy. The last X-Forwarded-For entry is the one our own
    proxy added (earlier entries can be faked by the visitor). */
export function clientIp(req: NextRequest): string {
  const real = req.headers.get("x-real-ip");
  if (real) return real.trim();
  const fwd = req.headers.get("x-forwarded-for")?.split(",").map((s) => s.trim()).filter(Boolean);
  return fwd?.at(-1) ?? "local";
}

/** Throws 429 when `key` has been used more than `limit` times in `windowSec`. */
export function rateLimit(req: NextRequest, name: string, limit: number, windowSec: number) {
  const key = `${name}:${clientIp(req)}`;
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || b.reset < now) {
    buckets.set(key, { count: 1, reset: now + windowSec * 1000 });
  } else if (++b.count > limit) {
    const wait = Math.ceil((b.reset - now) / 60000);
    throw new ApiError(429, `Too many attempts — please try again in ${wait} minute${wait === 1 ? "" : "s"}.`);
  }
  if (buckets.size > 10_000) for (const [k, v] of buckets) if (v.reset < now) buckets.delete(k);
}
