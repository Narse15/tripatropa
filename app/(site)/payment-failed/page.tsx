import type { Metadata } from "next";
import { RetryPayment } from "./RetryPayment";
export const metadata: Metadata = { title: "Payment didn't go through", robots: { index: false } };
export default function PaymentFailed({ searchParams }: { searchParams: { r?: string; k?: string } }) {
  return (
    <section className="status-page"><div className="wrap narrow">
      <h1 className="d2">Payment didn&apos;t go through.</h1>
      <p className="lede" style={{ marginTop: 20 }}>Your answers are saved — you can try again.</p>
      <RetryPayment r={searchParams.r || ""} k={searchParams.k || ""} />
    </div></section>
  );
}
