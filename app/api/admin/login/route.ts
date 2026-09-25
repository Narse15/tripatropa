import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, createSession } from "@/lib/admin-session";
import { safeEqual } from "@/lib/tokens";
import { rateLimit, clientIp, isSameOrigin } from "@/lib/security";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const back = (q: string) => NextResponse.redirect(new URL(`/admin/login?${q}`, req.url), 303);
  if (!isSameOrigin(req)) return back("e=origin");
  if (!rateLimit(`login:${clientIp(req)}`, 8, 15 * 60_000)) return back("e=rate");
  const form = await req.formData();
  const pw = String(form.get("password") || "");
  const expected = process.env.ADMIN_PASSWORD, secret = process.env.ADMIN_SESSION_SECRET;
  if (!expected || !secret) return back("e=config");
  if (!safeEqual(pw, expected)) return back("e=bad");
  const res = NextResponse.redirect(new URL("/admin", req.url), 303);
  res.cookies.set(ADMIN_COOKIE, await createSession(secret), { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: 12 * 3600 });
  return res;
}
