"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { track } from "@/lib/analytics";

export function RetryPayment({ r, k }: { r: string; k: string }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => { track("deposit_payment_failed"); try { const s = JSON.parse(sessionStorage.getItem("tripatrop_quiz_v1") || "{}"); if (r && k) sessionStorage.setItem("tripatrop_quiz_v1", JSON.stringify({ ...s, step: 18, retry: { r, k } })); } catch {} }, [r, k]);
  async function retry() {
    setBusy(true); setErr(null); track("checkout_started", { stage: "deposit_retry" });
    try {
      const res = await fetch("/api/checkout/retry", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ r, k }) });
      const d = await res.json().catch(() => ({}));
      if (d.url) { window.location.href = d.url; return; }
      if (d.alreadyPaid) { window.location.href = "/trip-started"; return; }
      setErr(d.error || "Payment couldn't start. Please try again.");
    } catch { setErr("Payment couldn't start. Check your connection and try again."); }
    setBusy(false);
  }
  if (!r || !k) return <p>Go back to <Link className="link" href="/build-my-trip">your trip</Link> to try again, or <Link className="link" href="/contact">contact us</Link>.</p>;
  return (
    <>
      {err && <div className="alert alert-err" role="alert">{err}</div>}
      <div className="row" style={{ marginTop: 24 }}>
        <button className="btn btn-primary btn-lg" onClick={retry} disabled={busy}>{busy ? "OPENING CHECKOUT…" : "TRY PAYMENT AGAIN"}</button>
        <Link className="btn btn-ghost btn-lg" href="/build-my-trip">REVIEW MY ANSWERS</Link>
      </div>
      <p className="fine" style={{ marginTop: 20 }}>No charge was made. If this keeps happening, try a different card or <Link className="link" href="/contact">contact us</Link>.</p>
    </>
  );
}
