import type { Metadata } from "next";
import { ContactForm } from "./ContactForm";
import { config } from "@/lib/config";

export const metadata: Metadata = { title: "Contact", description: "Talk to a real person at TRIPATROP about planning your Europe trip." };

export default function Contact() {
  const support = config.supportEmail();
  return (
    <section className="section">
      <div className="wrap split">
        <div>
          <h1 className="d2">Talk to a human.</h1>
          <p className="lede" style={{ marginTop: 20 }}>Questions before you start, or about a trip already in progress? Include your Trip ID if you have one.</p>
          <p>Email: <a className="link" href={`mailto:${support}`}>{support}</a></p>
        </div>
        <ContactForm />
      </div>
    </section>
  );
}
