"use client";
// Provider-agnostic analytics. Never send names, emails, free-text answers or payment details.
export type AnalyticsEvent =
  | "homepage_view" | "build_trip_clicked" | "quiz_started" | "quiz_question_completed" | "quiz_completed"
  | "checkout_started" | "deposit_payment_success" | "deposit_payment_failed" | "contact_submitted"
  | "faq_opened" | "final_checkout_started" | "final_payment_success";

export function track(event: AnalyticsEvent, props: Record<string, string | number | boolean> = {}) {
  if (typeof window === "undefined") return;
  const w = window as any;
  try {
    if (typeof w.plausible === "function") w.plausible(event, { props });
    if (typeof w.gtag === "function") w.gtag("event", event, props);
    (w.dataLayer = w.dataLayer || []).push({ event, ...props });
  } catch { /* analytics must never break the site */ }
}
