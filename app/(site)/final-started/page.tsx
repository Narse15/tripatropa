import type { Metadata } from "next";
import Link from "next/link";
import { fulfillFinalSession } from "@/lib/trips";
import { money } from "@/lib/config";
import { TrackOnMount } from "@/components/TrackOnMount";

export const metadata: Metadata = { title: "Let's build it", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function FinalStarted({ searchParams }: { searchParams: { session_id?: string } }) {
  let trip: any = null, paid = false;
  if (searchParams.session_id && /^cs_[A-Za-z0-9_]+$/.test(searchParams.session_id)) {
    try { const r = await fulfillFinalSession(searchParams.session_id); trip = r.trip; paid = r.paid; } catch (e) { console.error("[final-started]", e); }
  }
  if (!paid) return (
    <section className="status-page"><div className="wrap narrow">
      <h1 className="d2">Almost there.</h1>
      <p className="lede" style={{ marginTop: 20 }}>We&apos;re confirming your payment. You&apos;ll get an email as soon as it&apos;s verified. Questions? <Link className="link" href="/contact">Contact us</Link>.</p>
    </div></section>
  );
  return (
    <section className="status-page"><div className="wrap narrow">
      <TrackOnMount event="final_payment_success" />
      <h1 className="d1" style={{ fontSize: "clamp(3.4rem,10vw,6.4rem)" }}>Let&apos;s build it.</h1>
      <p className="eyebrow" style={{ marginTop: 32, marginBottom: 4 }}>TRIP ID</p><div className="tripid">{trip.public_trip_id}</div>
      <p className="paidline">✓ {money(trip.final_amount_cents)} PAID · PLANNING FEE COMPLETE</p>
      <p className="lede" style={{ marginTop: 28 }}>Now we&apos;re turning <strong>{trip.selected_concept}</strong> into your complete TRIPATROP plan. When it&apos;s ready, we&apos;ll send your final trip plan and booking links by email.</p>
      <p className="d3" style={{ marginTop: 32 }}>We plan. You book. You go.</p>
    </div></section>
  );
}
