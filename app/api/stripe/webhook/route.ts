import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { config } from "@/lib/config";
import { db } from "@/lib/db";
import { fulfillDepositSession, fulfillFinalSession } from "@/lib/trips";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Stripe webhook — add this endpoint in Stripe → Developers → Webhooks:
 *   https://YOUR-DOMAIN/api/stripe/webhook
 * Events: checkout.session.completed, checkout.session.async_payment_succeeded,
 *         checkout.session.async_payment_failed, checkout.session.expired
 */
export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");
  const raw = await req.text();
  let event: Stripe.Event;
  try { event = stripe().webhooks.constructEvent(raw, sig || "", config.stripeWebhookSecret()); }
  catch (e: any) { return NextResponse.json({ error: `Signature verification failed: ${e.message}` }, { status: 400 }); }

  const sql = db();
  const inserted = await sql`INSERT INTO stripe_events (id, type) VALUES (${event.id}, ${event.type}) ON CONFLICT (id) DO NOTHING RETURNING id`;
  if (!inserted.length) return NextResponse.json({ received: true, duplicate: true });

  try {
    if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
      const s = event.data.object as Stripe.Checkout.Session;
      if (s.metadata?.kind === "deposit") await fulfillDepositSession(s.id);
      else if (s.metadata?.kind === "final") await fulfillFinalSession(s.id);
    }
    // Failed / expired sessions: the trip simply stays PENDING_PAYMENT (or AWAITING final payment).
    return NextResponse.json({ received: true });
  } catch (e) {
    console.error("[webhook] processing failed", e);
    await sql`DELETE FROM stripe_events WHERE id = ${event.id}`; // let Stripe retry
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
}
