import { NextRequest, NextResponse } from "next/server";
import { tripSchema } from "@/lib/validation";
import { createPendingTrip, createDepositCheckout } from "@/lib/trips";
import { isSameOrigin, rateLimit, clientIp } from "@/lib/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const SUBMIT_FAIL = "Your trip isn't lost. Something went wrong sending it. Please try again.";

export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  if (!rateLimit(`trip:${clientIp(req)}`, 8, 10 * 60_000))
    return NextResponse.json({ error: "Too many attempts. Please wait a few minutes and try again." }, { status: 429 });

  const body = await req.json().catch(() => null);
  const parsed = tripSchema.safeParse(body);
  if (!parsed.success) {
    const fields = parsed.error.issues.map((i) => ({ path: i.path.join("."), message: i.message }));
    return NextResponse.json({ error: "Some answers need another look.", fields }, { status: 400 });
  }
  if (parsed.data.website) return NextResponse.json({ error: SUBMIT_FAIL }, { status: 400 }); // honeypot

  let trip;
  try { trip = await createPendingTrip(parsed.data); }
  catch (e) { console.error("[trips] insert failed", e); return NextResponse.json({ error: SUBMIT_FAIL }, { status: 500 }); }

  try {
    const url = await createDepositCheckout(trip);
    return NextResponse.json({ url });
  } catch (e) {
    console.error("[trips] checkout failed", e);
    // Answers are saved as PENDING_PAYMENT — client can retry with this reference.
    return NextResponse.json({ error: "Payment couldn't start. Your trip answers are saved — please try again.", retry: { r: trip.internal_id, k: trip.resume_token } }, { status: 502 });
  }
}
