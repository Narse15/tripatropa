import type { Metadata } from "next";
import { Faq } from "@/components/Faq";
import { faqItems } from "@/lib/faq";
import { getSetting } from "@/lib/trips";
import { BuildLink } from "@/components/BuildLink";

export const metadata: Metadata = { title: "FAQ", description: "How TRIPATROP's personalized Europe trip planning works: pricing, trip directions, direct booking, revisions, football trips, budgets and more." };
export const revalidate = 300;

export default async function FaqPage() {
  const items = faqItems(await getSetting("turnaround_message", "[OWNER TO SET]"));
  return (
    <section className="section">
      <div className="wrap narrow">
        <h1 className="d2">Questions, answered.</h1>
        <Faq items={items} />
        <div className="endrow"><p>Still wondering? Ask a human, or just start.</p><BuildLink className="btn btn-primary btn-lg" from="faq_page" /></div>
      </div>
    </section>
  );
}
