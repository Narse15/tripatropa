import { randomBytes, randomInt, timingSafeEqual } from "node:crypto";

/** 256-bit URL-safe random token. */
export const secureToken = () => randomBytes(32).toString("base64url");

/** Human-friendly, non-sequential reference, e.g. TT-260925-1042 */
export function makeTripId(d = new Date()) {
  const yy = String(d.getUTCFullYear()).slice(2);
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `TT-${yy}${mm}${dd}-${String(randomInt(1000, 10000))}`;
}

export function safeEqual(a: string, b: string) {
  const A = Buffer.from(a), B = Buffer.from(b);
  return A.length === B.length && timingSafeEqual(A, B);
}
