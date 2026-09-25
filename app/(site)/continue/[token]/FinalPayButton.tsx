"use client";
import { useState } from "react";
import { track } from "@/lib/analytics";
export function FinalPayButton({ token, label }: { token: string; label: string }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  async function go() {
    setBusy(true); setErr(null); track("final_checkout_started");
    try {
      const res = await fetch("/api/final-checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token }) });
      const d = await res.json().catch(() => ({}));
      if (d.url) { window.location.href = d.url; return; }
      setErr(d.error || "Payment couldn't start. Please try again.");
    } catch { setErr("Payment couldn't start. Check your connection and try again."); }
    setBusy(false);
  }
  return (<>{err && <div className="alert alert-err" role="alert">{err}</div>}<button className="btn btn-primary btn-lg btn-block" onClick={go} disabled={busy} style={{ fontSize: "1.1rem" }}>{busy ? "OPENING SECURE CHECKOUT…" : label}</button></>);
}
