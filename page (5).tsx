import type { Metadata } from "next";
import { LegalPage, PH } from "@/components/Legal";
import { config, money } from "@/lib/config";

export const metadata: Metadata = { title: "Refund & Cancellation Policy" };

export default function Refunds() {
  const dep = money(config.depositCents()), fin = money(config.finalCents());
  return (
    <LegalPage title="Refund & Cancellation Policy">
      <p>This policy applies to TRIPATROP planning fees only. Refunds for flights, accommodations and other travel products are governed by each provider&apos;s own terms.</p>
      <h2>Cancellation before research begins</h2>
      <p><PH>[OWNER DECISION: Is the {dep} deposit refundable if you cancel before we start researching? Full / partial / none? Within what time window?]</PH></p>
      <h2>Cancellation after research begins</h2>
      <p><PH>[OWNER DECISION: What happens to the {dep} deposit once research has started?]</PH></p>
      <h2>Cancellation after trip directions are delivered</h2>
      <p><PH>[OWNER DECISION: The deposit covers research already completed. State whether any refund applies, including if you don&apos;t like any of the three directions after the included revision.]</PH></p>
      <h2>Final payment ({fin}) cancellation</h2>
      <p><PH>[OWNER DECISION: Refund rules for the {fin} balance before final research starts, during it, and after the final plan is delivered.]</PH></p>
      <h2>Changes requested by the customer</h2>
      <p>One reasonable revision to your selected direction is included. <PH>[OWNER DECISION: how larger changes (new dates, destinations, budget) are priced and whether they affect refunds]</PH></p>
      <h2>Failure to respond</h2>
      <p><PH>[OWNER DECISION: e.g. if we don&apos;t hear back within X days after delivering trip directions, the request may be closed; what happens to payments]</PH></p>
      <h2>Exceptional circumstances</h2>
      <p><PH>[OWNER DECISION: illness, bereavement, travel bans, or if TRIPATROP cannot deliver the service]</PH></p>
      <h2>Refund processing time</h2>
      <p>Approved refunds are issued to the original payment method through Stripe. <PH>[OWNER TO SET: e.g. initiated within X business days; banks may take longer to post]</PH></p>
      <h2>Applicable statutory rights</h2>
      <p>Nothing in this policy limits rights you have under applicable consumer law. <PH>[LAWYER TO CONFIRM statutory cancellation rights for {config.jurisdiction()} and for customers&apos; locations]</PH></p>
      <h2>How to cancel</h2>
      <p>Email <a className="link" href={`mailto:${config.supportEmail()}`}>{config.supportEmail()}</a> with your Trip ID.</p>
    </LegalPage>
  );
}
