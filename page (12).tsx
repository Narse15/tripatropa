import type { Metadata } from "next";
import { LegalPage, PH } from "@/components/Legal";
import { config } from "@/lib/config";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function Privacy() {
  const pe = config.privacyEmail();
  return (
    <LegalPage title="Privacy Policy">
      <p>This policy explains how {config.legalName()} (&ldquo;TRIPATROP&rdquo;), {config.businessAddress()}, collects and uses personal information when you use this website and our trip-planning service.</p>
      <h2>Information you provide</h2>
      <p>When you contact us or request a trip, you provide your first and last name, email address and, optionally, phone number.</p>
      <h2>Trip questionnaire information</h2>
      <p>Your departure city and airport, travel dates, number and type of travelers (including optional children&apos;s ages), budget, travel preferences, and anything you choose to write in free-text answers. Please don&apos;t include sensitive information you don&apos;t want us to have.</p>
      <h2>Contact information</h2>
      <p>Messages sent through our contact form, including your name, email, optional Trip ID and message.</p>
      <h2>Payment processing</h2>
      <p>Payments are processed by Stripe. We receive confirmation of payment, amount, date and a payment reference. We do not receive or store your full card number or security code. Stripe&apos;s own privacy policy applies to the data it processes.</p>
      <h2>Cookies</h2>
      <p>We use strictly necessary cookies (for example to keep the admin area secure) and your browser&apos;s session storage to save questionnaire answers while you complete them. <PH>[OWNER TO CONFIRM: any additional cookies, and whether a cookie banner is required for your audience]</PH></p>
      <h2>Analytics</h2>
      <p><PH>[OWNER TO SET: analytics provider, e.g. Plausible or Google Analytics]</PH>. We track anonymous funnel events (such as starting the questionnaire or completing checkout) and do not send your name, email, free-text answers or payment details to analytics providers.</p>
      <h2>Email communication</h2>
      <p>We send transactional emails needed to deliver the service (confirmations, trip directions, payment links and your final plan) through our email provider <PH>[e.g. Resend]</PH>.</p>
      <h2>Marketing consent</h2>
      <p>We send travel ideas and updates only if you tick the optional marketing box. You can withdraw consent at any time via the unsubscribe link or by contacting us.</p>
      <h2>How we use information</h2>
      <p>To research and deliver your trip plan, process payments, communicate with you, provide support, keep records required by law, prevent fraud and improve the service. <PH>[OWNER TO SET: legal bases, if required in your jurisdiction]</PH></p>
      <h2>Third-party service providers</h2>
      <p>We share data only with providers that help us run the service: hosting <PH>[e.g. Vercel]</PH>, database <PH>[e.g. Neon/Supabase]</PH>, payments (Stripe), email <PH>[e.g. Resend]</PH> and analytics <PH>[provider]</PH>. We do not sell your personal information.</p>
      <h2>Data retention</h2>
      <p><PH>[OWNER TO SET: how long trip requests, contact messages and payment records are kept]</PH></p>
      <h2>Your rights</h2>
      <p>Depending on where you live, you may have rights to access, correct, delete or obtain a copy of your information, and to object to or restrict certain processing. Contact <a className="link" href={`mailto:${pe}`}>{pe}</a>. <PH>[OWNER TO CONFIRM rights applicable to your users, e.g. US state privacy laws / GDPR]</PH></p>
      <h2>Security</h2>
      <p>We use HTTPS, access-controlled systems and a hosted payment page. No system is perfectly secure, but we take reasonable measures to protect your information.</p>
      <h2>International processing</h2>
      <p>Our service providers may process data in the United States and other countries. <PH>[OWNER TO CONFIRM transfer safeguards if applicable]</PH></p>
      <h2>Children</h2>
      <p>The service is intended for adults booking their own travel. Children&apos;s ages may be shared by a parent or guardian for planning purposes only.</p>
      <h2>Contact</h2>
      <p>{config.legalName()} · {config.businessAddress()} · <a className="link" href={`mailto:${pe}`}>{pe}</a></p>
    </LegalPage>
  );
}
