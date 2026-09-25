import type { Metadata } from "next";
import { PricingCard } from "@/components/PricingCard";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pricing — Europe Trip Planning Service",
  description: "One personalized Europe trip planning service: $49 to find your trip, $150 to build it. Travel purchases are booked directly by you.",
};

export default function Pricing() {
  return (
    <section className="section">
      <div className="wrap">
        <h1 className="d2">Simple pricing.<br />Serious planning.</h1>
        <p className="lede" style={{ marginTop: 20 }}>A custom Europe itinerary, researched by a real person. You only continue to step two if you love one of your trip directions.</p>
        <PricingCard />
        <p style={{ marginTop: 32 }}>Questions about deposits and refunds? Read the <Link className="link" href="/refund-policy">Refund &amp; Cancellation Policy</Link> or the <Link className="link" href="/faq">FAQ</Link>.</p>
      </div>
    </section>
  );
}
