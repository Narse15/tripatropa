import type { Metadata } from "next";
import Link from "next/link";
import { fulfillDepositSession } from "@/lib/trips";
import { money } from "@/lib/config";
import { TrackOnMount } from "@/components/TrackOnMount";
import { ClearQuiz } from "@/components/ClearQuiz";

export const metadata: Metadata = { title: "We're on it", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function TripStarted({ searchParams }: { searchParams: { session_id?: string } }) {
  let tripId: string | null = null, amount: number | null = null, state: "paid" | "processing" | "unknown" = "unknown";
  if (searchParams.session_id && /^cs_[A-Za-z0-9_]+$/.test(searchParams.session_id)) {
    try {
      const r = await fulfillDepositSession(searchParams.session_id);
      if (r.paid && r.trip) { state = "paid"; tripId = r.trip.public_trip_id; amount = r.trip.deposit_amount_cents; }
      else if (r.trip) state = "processing";
    } catch (e) { console.error("[trip-started]", e); state = "processing"; }
  }
  if (state === "processing") {
    return (
      <section className="status-page"><div className="wrap narrow">
        <h1 className="d2">Almost there.</h1>
        <p className="lede" style={{ marginTop: 20 }}>We&apos;re confirming your payment with our payment provider. You&apos;ll receive a confirmation email with your Trip ID as soon as it&apos;s verified.</p>
        <p>Nothing else to do right now. If you don&apos;t hear from us within an hour, <Link className="link" href="/contact">contact us</Link>.</p>
      </div></section>
    );
  }
  return (
    <section className="status-page"><div className="wrap narrow">
      <ClearQuiz />
      {state === "paid" && <TrackOnMount event="deposit_payment_success" />}
      <h1 className="d1" style={{ fontSize: "clamp(3.4rem,10vw,6.4rem)" }}>We&apos;re on it.</h1>
      <p className="lede strong" style={{ marginTop: 20 }}>Your Europe is officially taking shape.</p>
      {tripId && <><p className="eyebrow" style={{ marginTop: 32, marginBottom: 4 }}>YOUR TRIP ID</p><div className="tripid">{tripId}</div></>}
      <p className="paidline">✓ {amount ? money(amount) : "$49"} PAID</p>
      <h2 className="d3" style={{ marginTop: 48 }}>What happens now?</h2>
      <ol className="numbered">
        <li><span>01</span>We read everything you told us.</li>
        <li><span>02</span>We research.</li>
        <li><span>03</span>We build three trip directions.</li>
        <li><span>04</span>They arrive in your inbox.</li>
      </ol>
      <p className="d3">For now? You can close the 37 travel tabs.</p>
      <p className="fine" style={{ marginTop: 24 }}>A confirmation email is on its way. Can&apos;t find it? Check spam, or <Link className="link" href="/contact">contact us</Link> with your Trip ID.</p>
    </div></section>
  );
}
