import type { Metadata } from "next";
import Link from "next/link";
import { getTripByFinalToken } from "@/lib/trips";
import { config, money } from "@/lib/config";
import { FinalPayButton } from "./FinalPayButton";

export const metadata: Metadata = { title: "Ready to build it?", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function Continue({ params, searchParams }: { params: { token: string }; searchParams: { payment?: string } }) {
  const trip = await getTripByFinalToken(params.token).catch(() => null);
  if (!trip) {
    return (
      <section className="status-page"><div className="wrap narrow">
        <h1 className="d2">This payment link isn&apos;t valid anymore.</h1>
        <p className="lede" style={{ marginTop: 20 }}>Contact us and we&apos;ll help.</p>
        <Link className="btn btn-primary btn-lg" href="/contact" style={{ marginTop: 16 }}>CONTACT US</Link>
      </div></section>
    );
  }
  const dep = trip.deposit_amount_cents || config.depositCents(), fin = config.finalCents();
  return (
    <section className="status-page"><div className="wrap narrow">
      <h1 className="d2">Ready to build it?</h1>
      {searchParams.payment === "failed" && <div className="alert alert-err" role="alert">Payment didn&apos;t go through. Nothing was charged — you can try again.</div>}
      <table className="sumtable"><tbody>
        <tr><td>Trip</td><td>{trip.public_trip_id}</td></tr>
        <tr><td>Selected direction</td><td>{trip.selected_concept}</td></tr>
        <tr><td>Planning fee</td><td>{money(dep + fin)}</td></tr>
        <tr><td>Already paid</td><td>{money(dep)}</td></tr>
        <tr><td><strong>Remaining</strong></td><td className="d3">{money(fin)}</td></tr>
      </tbody></table>
      <ul className="checks two" style={{ margin: "24px 0 32px" }}>
        {["Detailed itinerary", "Flight recommendations", "Accommodation recommendations", "Transportation", "Attractions", "Ticket research", "Event research", "Restaurants", "Nightlife when relevant", "Direct booking links", "Budget overview"].map((x) => <li key={x}>{x}</li>)}
      </ul>
      <FinalPayButton token={params.token} label={`BUILD MY FINAL TRIP — ${money(fin)} →`} />
      <p className="fine" style={{ marginTop: 18 }}>Secure payment by Stripe. Travel purchases are separate and made directly with providers. See <Link className="link" href="/terms">Terms</Link> and <Link className="link" href="/refund-policy">Refund Policy</Link>.</p>
    </div></section>
  );
}
