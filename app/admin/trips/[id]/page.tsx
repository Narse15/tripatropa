import Link from "next/link";
import { Fragment } from "react";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin-guard";
import { getTrip, finalLink } from "@/lib/trips";
import { TRIP_STATUSES, iconicLabel } from "@/lib/options";
import { longDates, budgetLine, flightsLabel, stamp } from "@/lib/format";
import { money } from "@/lib/config";
import { AdminBar } from "../../AdminBar";
import { updateStatus, saveNotes, saveConcept, enableFinal, disableFinal, emailFinalLink, resendEmails } from "../../actions";

export const dynamic = "force-dynamic";
const L = (a?: string[]) => (a && a.length ? a.join(", ") : "—");

export default async function TripDetail({ params, searchParams }: { params: { id: string }; searchParams: { m?: string } }) {
  await requireAdmin();
  const t = await getTrip(params.id);
  if (!t) notFound();
  const kv = (pairs: [string, any][]) => <dl className="kv">{pairs.map(([k, v]) => <Fragment key={k}><dt>{k}</dt><dd>{v === null || v === undefined || v === "" ? "—" : v}</dd></Fragment>)}</dl>;
  const small = { minHeight: 40, padding: "8px 16px", fontSize: ".78rem" } as const;
  return (
    <>
      <AdminBar />
      <main>
        <p><Link className="link" href="/admin">← All trips</Link></p>
        <div className="row" style={{ justifyContent: "space-between", margin: "10px 0 20px" }}>
          <h1 className="d2" style={{ fontSize: "clamp(2rem,5vw,3rem)" }}>{t.public_trip_id || "Pending payment"} · {t.first_name} {t.last_name}</h1>
          <span className="badge" style={{ fontSize: ".85rem", padding: "6px 12px" }}>{t.trip_status}</span>
        </div>
        {searchParams.m && <div className="alert alert-ok" role="status">{searchParams.m}</div>}
        {t.email_delivery_status === "EMAIL_DELIVERY_ERROR" && <div className="alert alert-err" role="alert">EMAIL_DELIVERY_ERROR — {t.email_error_detail}. Payment is safe; use Resend below.</div>}

        <div className="admin-grid">
          <div>
            <section className="panel"><h2>CUSTOMER</h2>{kv([["Name", `${t.first_name} ${t.last_name}`], ["Email", <a key="e" className="link" href={`mailto:${t.email}?subject=${encodeURIComponent(`TRIPATROP ${t.public_trip_id || ""}`)}`}>{t.email}</a>], ["Phone", t.phone], ["Marketing consent", t.marketing_consent ? "Yes" : "No"], ["Terms accepted", stamp(t.terms_accepted_at)], ["Service acknowledged", stamp(t.service_acknowledgment_at)]])}</section>
            <section className="panel"><h2>TRAVEL</h2>{kv([["Departure", `${t.departure_city}${t.departure_airport ? ` (${t.departure_airport})` : ""}`], ["Dates", longDates(t)], ["Trip length", t.trip_length], ["Travelers", `${t.traveler_count} · ${t.traveler_type}`], ["Children's ages", t.child_ages]])}</section>
            <section className="panel"><h2>BUDGET</h2>{kv([["Budget", budgetLine(t)], ["Flights included", flightsLabel(t.flights_in_budget)]])}</section>
            <section className="panel"><h2>THEIR EUROPE</h2>{kv([["Landscapes", L(t.landscapes)], ["Vibes", L(t.vibes)], ["Structure", t.trip_structure], ["Pace", t.pace], ["Iconic / local", `${t.iconic_local_score}/100 — ${iconicLabel(t.iconic_local_score).t}`], ["Accommodation", t.accommodation_level], ["Property types", L(t.property_types)], ["Transport", L(t.transport_preferences)], ["Would drive", t.drive_europe]])}</section>
            <section className="panel"><h2>THEIR WORDS</h2>{kv([["Already on their list", t.must_visit], ["Dream experience", t.dream_experience], ["Keep out", t.avoid], ["Anything else", t.additional_notes]])}</section>
          </div>

          <div>
            <section className="panel"><h2>STATUS</h2>
              <form action={updateStatus} className="row"><input type="hidden" name="id" value={t.internal_id} />
                <select name="status" defaultValue={t.trip_status} className="input" style={{ flex: 1, minHeight: 42, padding: "8px 10px" }} aria-label="Trip status">{TRIP_STATUSES.map((s) => <option key={s}>{s}</option>)}</select>
                <button className="btn btn-primary" style={small}>UPDATE</button></form>
            </section>

            <section className="panel"><h2>PAYMENTS</h2>
              {kv([["Deposit", `${t.deposit_status}${t.deposit_amount_cents ? ` · ${money(t.deposit_amount_cents)}` : ""}`], ["Deposit paid", stamp(t.deposit_paid_at)], ["Deposit ref", t.deposit_payment_id], ["Final", `${t.final_payment_status}${t.final_amount_cents ? ` · ${money(t.final_amount_cents)}` : ""}`], ["Final paid", stamp(t.final_paid_at)], ["Final ref", t.final_payment_id], ["Emails", t.email_delivery_status]])}
              <div className="row" style={{ marginTop: 14 }}>
                {t.deposit_status === "PAID" && <form action={resendEmails}><input type="hidden" name="id" value={t.internal_id} /><input type="hidden" name="kind" value="deposit" /><button className="btn btn-ghost" style={small}>RESEND DEPOSIT EMAILS</button></form>}
                {t.final_payment_status === "PAID" && <form action={resendEmails}><input type="hidden" name="id" value={t.internal_id} /><input type="hidden" name="kind" value="final" /><button className="btn btn-ghost" style={small}>RESEND FINAL EMAILS</button></form>}
              </div>
            </section>

            <section className="panel"><h2>SELECTED CONCEPT &amp; FINAL PAYMENT</h2>
              {t.deposit_status !== "PAID" ? <p className="muted">Available after the $49 deposit is paid.</p> : t.final_payment_status === "PAID" ? <p><strong>{t.selected_concept}</strong> — final payment received.</p> : <>
                <form action={enableFinal}>
                  <input type="hidden" name="id" value={t.internal_id} />
                  <label className="field"><span>Selected trip concept</span><input name="concept" defaultValue={t.selected_concept || ""} placeholder="Option A — Mediterranean Nights (Rome instead of Nice)" /></label>
                  <label className="check"><input type="checkbox" name="email" defaultChecked /><span>Email the secure $150 link to {t.email}</span></label>
                  <div className="row">
                    <button className="btn btn-primary" style={small}>{t.final_payment_eligible ? "REGENERATE LINK" : "MARK ELIGIBLE & CREATE LINK"}</button>
                    <button className="btn btn-ghost" style={small} formAction={saveConcept}>SAVE CONCEPT ONLY</button>
                  </div>
                </form>
                {t.final_payment_eligible && t.final_payment_token && <div style={{ marginTop: 18 }}>
                  <span className="label">Secure payment link (expires {stamp(t.final_token_expires_at)})</span>
                  <div className="copybox"><input readOnly value={finalLink(t)} aria-label="Final payment link" /></div>
                  <div className="row" style={{ marginTop: 10 }}>
                    <form action={emailFinalLink}><input type="hidden" name="id" value={t.internal_id} /><button className="btn btn-ghost" style={small}>EMAIL LINK AGAIN</button></form>
                    <form action={disableFinal}><input type="hidden" name="id" value={t.internal_id} /><button className="btn btn-ghost" style={small}>DISABLE LINK</button></form>
                  </div>
                </div>}
              </>}
            </section>

            <section className="panel"><h2>INTERNAL NOTES</h2>
              <form action={saveNotes}><input type="hidden" name="id" value={t.internal_id} />
                <label className="field"><span className="sr-only">Internal notes</span><textarea name="notes" defaultValue={t.internal_notes || ""} style={{ minHeight: 180 }} /></label>
                <button className="btn btn-primary" style={small}>SAVE NOTES</button></form>
            </section>
            <p className="fine">Created {stamp(t.created_at)} · Updated {stamp(t.updated_at)}</p>
          </div>
        </div>
      </main>
    </>
  );
}
