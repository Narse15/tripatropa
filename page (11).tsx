import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, PH } from "@/components/Legal";
import { config, money } from "@/lib/config";

export const metadata: Metadata = { title: "Terms & Conditions" };

export default function Terms() {
  const name = config.legalName(), dep = money(config.depositCents()), fin = money(config.finalCents()), total = money(config.depositCents() + config.finalCents());
  return (
    <LegalPage title="Terms & Conditions">
      <p>These Terms govern the TRIPATROP trip-planning service provided by {name} (&ldquo;TRIPATROP&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;), {config.businessAddress()}. By submitting a trip request and paying, you agree to these Terms.</p>
      <h2>1. Nature of the service</h2>
      <p>TRIPATROP provides personalized trip-planning and research services. We do not sell bundled vacations, and we do not purchase or reserve travel products on your behalf. All flights, accommodations, transportation, tickets, activities and other travel products are purchased by you directly from third-party providers.</p>
      <h2>2. Stage one — Find My Europe ({dep})</h2>
      <p>After your {dep} Trip Design deposit is successfully processed, we review your questionnaire and prepare three personalized trip directions. Trip directions are concepts (for example destinations, route, nights per location, key experiences, a preliminary transport approach, an accommodation direction and an estimated budget range). They are not complete itineraries or booking packages.</p>
      <h2>3. Stage two — Build My Europe ({fin})</h2>
      <p>If you choose to continue with a selected direction, the remaining {fin} planning balance (total {total}) is payable through a secure link we send you. After payment is verified, we research and deliver the complete trip plan, which may include recommended flights, accommodations, transport, attractions, events, food, logistics, an estimated budget and direct booking links, as relevant to your trip.</p>
      <h2>4. Scope of deliverables</h2>
      <p>Deliverables are provided by email. The content of each plan depends on your destination, dates, budget and preferences. <PH>[OWNER TO SET: turnaround times, delivery format, any limits on trip length / number of destinations / number of travelers]</PH></p>
      <h2>5. Revisions</h2>
      <p>One reasonable revision to your selected trip direction is included. Requests that substantially change the trip (for example new dates, new destinations or a different budget) may be treated as a new request and require additional fees agreed before work begins. <PH>[OWNER TO SET: definition of a reasonable revision; revisions to the final plan; fees for additional work]</PH></p>
      <h2>6. Your responsibilities</h2>
      <p>You agree to provide accurate and complete information, to review all recommendations, and to verify prices, schedules, terms and requirements directly with each provider before purchasing. You are responsible for your bookings and the decisions you make.</p>
      <h2>7. Third-party bookings</h2>
      <p>Your contract for any travel product is with the relevant provider, whose terms, prices, change and cancellation rules apply. We do not control and are not responsible for third-party providers&apos; products, services, policies or conduct. We do not add a TRIPATROP markup to direct purchases you make from providers. <PH>[OWNER TO CONFIRM: any affiliate or referral relationships and their disclosure]</PH></p>
      <h2>8. Prices and availability</h2>
      <p>Prices and availability we share reflect information observed at the time of research. They can change at any time and are not guaranteed. The final price is the price shown by the provider when you book.</p>
      <h2>9. Travel disruptions</h2>
      <p>Delays, cancellations, strikes, weather, closures and other disruptions are handled under the relevant provider&apos;s terms and applicable law. <PH>[OWNER TO SET: whether any post-delivery assistance is offered and on what terms]</PH></p>
      <h2>10. Passports, visas and entry requirements</h2>
      <p>You are solely responsible for holding valid passports, visas, entry authorizations, health documents and any other requirements for your trip. We may point you toward official government sources but do not provide legal or immigration advice.</p>
      <h2>11. Accuracy of information</h2>
      <p>We take care to research carefully, but information from third parties can be inaccurate or change. Recommendations are provided for planning purposes and should be verified before you rely on them.</p>
      <h2>12. Intellectual property</h2>
      <p>Trip directions and plans we create are provided for your personal, non-commercial use. <PH>[OWNER TO CONFIRM]</PH></p>
      <h2>13. Limitation of liability</h2>
      <p><PH>[TO BE DRAFTED BY A LAWYER — limitation language subject to applicable law in {config.jurisdiction()}. Nothing should exclude liability or rights that cannot be excluded by law.]</PH></p>
      <h2>14. Cancellation and refunds</h2>
      <p>Cancellations and refunds are governed by our <Link className="link" href="/refund-policy">Refund &amp; Cancellation Policy</Link>, which forms part of these Terms.</p>
      <h2>15. Communication</h2>
      <p>We communicate primarily by email using the address you provide. Please include your Trip ID in any correspondence. Non-essential marketing emails are sent only if you opted in, and you can unsubscribe at any time.</p>
      <h2>16. Payments</h2>
      <p>Payments are processed by our third-party payment processor (Stripe). We do not store your full card details. All fees are in US dollars.</p>
      <h2>17. Applicable law</h2>
      <p>These Terms are governed by the laws of {config.jurisdiction()}. <PH>[OWNER TO SET: dispute resolution / venue, reviewed by a lawyer]</PH></p>
      <h2>18. Contact</h2>
      <p>{name} · {config.businessAddress()} · <a className="link" href={`mailto:${config.supportEmail()}`}>{config.supportEmail()}</a></p>
    </LegalPage>
  );
}
