import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, verifySession } from "./lib/admin-session";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname.startsWith("/admin/login") || pathname.startsWith("/api/admin/login")) return NextResponse.next();
  const ok = await verifySession(process.env.ADMIN_SESSION_SECRET, req.cookies.get(ADMIN_COOKIE)?.value);
  if (ok) {
    const res = NextResponse.next();
    res.headers.set("X-Robots-Tag", "noindex, nofollow");
    return res;
  }
  if (pathname.startsWith("/api/")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.redirect(new URL("/admin/login", req.url));
}
export const config = { matcher: ["/admin/:path*", "/api/admin/:path*"] };
