import { NextRequest, NextResponse } from "next/server";
import { getTripByFinalToken, createFinalCheckout } from "@/lib/trips";
import { isSameOrigin, rateLimit, clientIp } from "@/lib/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  if (!rateLimit(`final:${clientIp(req)}`, 10, 10 * 60_000)) return NextResponse.json({ error: "Too many attempts. Please wait a few minutes." }, { status: 429 });
  const { token } = (await req.json().catch(() => ({}))) as { token?: string };
  const trip = token ? await getTripByFinalToken(token).catch(() => null) : null;
  if (!trip) return NextResponse.json({ error: "This payment link isn't valid anymore. Contact us and we'll help." }, { status: 404 });
  try { return NextResponse.json({ url: await createFinalCheckout(trip) }); }
  catch (e) { console.error("[final-checkout]", e); return NextResponse.json({ error: "Payment couldn't start. Please try again." }, { status: 502 }); }
}
