import { NextRequest, NextResponse } from "next/server";
import { getTrip, createDepositCheckout } from "@/lib/trips";
import { isSameOrigin, rateLimit, clientIp } from "@/lib/security";
import { safeEqual } from "@/lib/tokens";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  if (!rateLimit(`retry:${clientIp(req)}`, 10, 10 * 60_000)) return NextResponse.json({ error: "Too many attempts. Please wait a few minutes." }, { status: 429 });
  const { r, k } = (await req.json().catch(() => ({}))) as { r?: string; k?: string };
  const trip = r ? await getTrip(r).catch(() => null) : null;
  if (!trip || !k || !safeEqual(String(trip.resume_token), String(k)))
    return NextResponse.json({ error: "We couldn't find that trip request. Please contact us and we'll help." }, { status: 404 });
  if (trip.deposit_status === "PAID") return NextResponse.json({ alreadyPaid: true, tripId: trip.public_trip_id });
  if (trip.trip_status === "CANCELLED") return NextResponse.json({ error: "This trip request was cancelled. Contact us and we'll help." }, { status: 409 });
  try { return NextResponse.json({ url: await createDepositCheckout(trip) }); }
  catch (e) { console.error("[retry] checkout failed", e); return NextResponse.json({ error: "Payment couldn't start. Your trip answers are saved — please try again." }, { status: 502 }); }
}
