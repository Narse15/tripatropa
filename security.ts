import { NextRequest } from "next/server";
import { config } from "./config";

/** Basic CSRF defence for JSON POST endpoints: require a same-origin Origin/Referer. */
export function isSameOrigin(req: NextRequest) {
  const origin = req.headers.get("origin") || req.headers.get("referer");
  if (!origin) return false;
  try {
    const o = new URL(origin);
    const allowed = new Set([new URL(config.siteUrl()).host, req.headers.get("host") || ""]);
    return allowed.has(o.host);
  } catch { return false; }
}

/**
 * Simple in-memory fixed-window rate limiter.
 * NOTE: on serverless hosts each instance has its own memory. For stronger limits,
 * swap this for Upstash Redis / Vercel KV using the same interface.
 */
const buckets = new Map<string, { n: number; reset: number }>();
export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || b.reset < now) { buckets.set(key, { n: 1, reset: now + windowMs }); return true; }
  if (b.n >= limit) return false;
  b.n++; return true;
}
export const clientIp = (req: NextRequest) =>
  (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || req.ip || "unknown";
