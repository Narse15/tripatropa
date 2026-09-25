"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { track } from "@/lib/analytics";
import { Photo } from "@/components/Photo";
import {
  TRAVELER_TYPES, TRIP_LENGTHS, LANDSCAPES, VIBES, STRUCTURES, PACES, STAY_LEVELS, PROPERTY_TYPES,
  TRANSPORT, DRIVE, FLIGHTS_IN_BUDGET, EXCLUSIVE_OPTIONS, iconicLabel,
} from "@/lib/options";

type A = {
  departureCity: string; departureAirport: string;
  dateType: "" | "EXACT" | "FLEXIBLE"; departureDate: string; returnDate: string; flexibleMonth: string; flexibleDates: string;
  travelerType: string; travelerCount: string; childAges: string[];
  tripLength: string;
  budgetAmount: string; budgetType: "" | "PER_PERSON" | "TOTAL"; flightsInBudget: string;
  landscapes: string[]; vibes: string[]; tripStructure: string; pace: string; iconicLocalScore: number;
  accommodationLevel: string; propertyTypes: string[]; transportPreferences: string[]; driveEurope: string;
  mustVisit: string; dreamExperience: string; avoid: string; additionalNotes: string;
  firstName: string; lastName: string; email: string; phone: string;
  termsAccepted: boolean; serviceAcknowledged: boolean; marketingConsent: boolean; website: string;
};
const EMPTY: A = {
  departureCity: "", departureAirport: "", dateType: "", departureDate: "", returnDate: "", flexibleMonth: "", flexibleDates: "",
  travelerType: "", travelerCount: "", childAges: [], tripLength: "", budgetAmount: "", budgetType: "", flightsInBudget: "",
  landscapes: [], vibes: [], tripStructure: "", pace: "", iconicLocalScore: 50, accommodationLevel: "", propertyTypes: [],
  transportPreferences: [], driveEurope: "", mustVisit: "", dreamExperience: "", avoid: "", additionalNotes: "",
  firstName: "", lastName: "", email: "", phone: "", termsAccepted: false, serviceAcknowledged: false, marketingConsent: false, website: "",
};
const KEY = "tripatrop_quiz_v1";
const TOTAL = 17;
const LAND_PHOTO: Record<string, string> = { BEACHES: "beaches", MOUNTAINS: "mountains", "BIG CITIES": "cities", "SMALL TOWNS": "towns", COUNTRYSIDE: "countryside", ISLANDS: "islands", "ROAD TRIPS": "roadtrips", "SURPRISE ME": "surprise" };
const emailOk = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());
const today = () => new Date().toISOString().slice(0, 10);
const daysBetween = (a: string, b: string) => Math.round((Date.parse(b) - Date.parse(a)) / 86400000) + 1;
const months = () => { const d = new Date(); return Array.from({ length: 20 }, (_, i) => new Date(d.getFullYear(), d.getMonth() + i, 1).toLocaleString("en-US", { month: "long", year: "numeric" })); };
const fmtDate = (s: string) => (s ? new Date(s + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "");

/** Returns an error message for the step, or null if valid. */
function validate(step: number, a: A): Record<string, string> {
  const e: Record<string, string> = {};
  switch (step) {
    case 1: if (a.departureCity.trim().length < 2) e.departureCity = "Tell us the city you're leaving from."; break;
    case 2:
      if (!a.dateType) e.dateType = "Choose one option.";
      else if (a.dateType === "EXACT") {
        if (!a.departureDate) e.departureDate = "Add a departure date.";
        if (!a.returnDate) e.returnDate = "Add a return date.";
        else if (a.departureDate && a.returnDate < a.departureDate) e.returnDate = "Return date must be after departure.";
      } else if (!a.flexibleMonth) e.flexibleMonth = "Choose an approximate month.";
      break;
    case 3:
      if (!a.travelerType) e.travelerType = "Choose who's going.";
      if (!(+a.travelerCount >= 1 && +a.travelerCount <= 40)) e.travelerCount = "Add the number of travelers (1–40).";
      break;
    case 4: if (!a.tripLength) e.tripLength = "Choose how long you have."; break;
    case 5:
      if (!(+a.budgetAmount > 0)) e.budgetAmount = "Enter your budget in US dollars.";
      if (!a.budgetType) e.budgetType = "Choose per person or total trip.";
      if (!a.flightsInBudget) e.flightsInBudget = "Tell us whether flights are included.";
      break;
    case 6: if (!a.landscapes.length) e.landscapes = "Pick at least one."; break;
    case 7: if (!a.vibes.length) e.vibes = "Pick at least one."; break;
    case 8: if (!a.tripStructure) e.tripStructure = "Choose one option."; break;
    case 9: if (!a.pace) e.pace = "Choose one option."; break;
    case 11: if (!a.accommodationLevel) e.accommodationLevel = "Choose one option."; break;
    case 12:
      if (!a.transportPreferences.length) e.transportPreferences = "Pick at least one.";
      if (!a.driveEurope) e.driveEurope = "Choose one option.";
      break;
    case 17:
      if (!a.firstName.trim()) e.firstName = "First name is required.";
      if (!a.lastName.trim()) e.lastName = "Last name is required.";
      if (!emailOk(a.email)) e.email = "Enter a valid email address.";
      if (!a.termsAccepted) e.termsAccepted = "Please agree to the Terms & Conditions to continue.";
      if (!a.serviceAcknowledged) e.serviceAcknowledged = "Please confirm you understand how TRIPATROP works.";
      break;
  }
  return e;
}
const FIELD_STEP: Record<string, number> = { departureCity: 1, dateType: 2, departureDate: 2, returnDate: 2, flexibleMonth: 2, travelerType: 3, travelerCount: 3, tripLength: 4, budgetAmount: 5, budgetType: 5, flightsInBudget: 5, landscapes: 6, vibes: 7, tripStructure: 8, pace: 9, accommodationLevel: 11, transportPreferences: 12, driveEurope: 12, firstName: 17, lastName: 17, email: 17, termsAccepted: 17, serviceAcknowledged: 17 };

export function Quiz({ depositLabel, finalLabel }: { depositLabel: string; finalLabel: string }) {
  const [a, setA] = useState<A>(EMPTY);
  const [step, setStep] = useState(0); // 0 intro, 1..17 questions, 18 review
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loaded, setLoaded] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitErr, setSubmitErr] = useState<string | null>(null);
  const [retry, setRetry] = useState<{ r: string; k: string } | null>(null);
  const [returnTo, setReturnTo] = useState<number | null>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  // Restore + autosave (session only)
  useEffect(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem(KEY) || "null");
      if (saved?.a) { setA({ ...EMPTY, ...saved.a }); setStep(saved.step || 0); if (saved.retry) setRetry(saved.retry); }
    } catch {}
    setLoaded(true);
  }, []);
  useEffect(() => { if (loaded) try { sessionStorage.setItem(KEY, JSON.stringify({ a, step, retry })); } catch {} }, [a, step, retry, loaded]);
  useEffect(() => { if (loaded && step > 0) { titleRef.current?.focus({ preventScroll: true }); window.scrollTo({ top: 0 }); } }, [step, loaded]);

  // Q4: derive trip length from exact dates
  const exactDays = a.dateType === "EXACT" && a.departureDate && a.returnDate && a.returnDate >= a.departureDate ? daysBetween(a.departureDate, a.returnDate) : null;
  useEffect(() => { if (exactDays) setA((p) => (p.tripLength === `${exactDays} days` ? p : { ...p, tripLength: `${exactDays} days` })); }, [exactDays]);

  const set = <K extends keyof A>(k: K, v: A[K]) => { setA((p) => ({ ...p, [k]: v })); if (errors[k as string]) setErrors((e) => { const n = { ...e }; delete n[k as string]; return n; }); };
  const toggle = (k: keyof A, v: string) => {
    const cur = (a[k] as string[]) || [];
    let next: string[];
    if (cur.includes(v)) next = cur.filter((x) => x !== v);
    else if (EXCLUSIVE_OPTIONS.includes(v)) next = [v];
    else next = cur.filter((x) => !EXCLUSIVE_OPTIONS.includes(x)).concat(v);
    set(k, next as any);
  };

  function next() {
    const e = validate(step, a);
    setErrors(e);
    if (Object.keys(e).length) { setTimeout(() => (document.querySelector("[aria-invalid=true], .field-err") as HTMLElement | null)?.focus?.(), 0); return; }
    track("quiz_question_completed", { step });
    if (returnTo) { setStep(returnTo); setReturnTo(null); return; }
    if (step === TOTAL) { track("quiz_completed"); setStep(18); return; }
    setStep(step + 1);
  }
  function back() { setErrors({}); if (returnTo) { setStep(returnTo); setReturnTo(null); return; } setStep(Math.max(0, step - 1)); }
  function edit(s: number) { setReturnTo(18); setErrors({}); setRetry(null); setSubmitErr(null); setStep(s); }

  async function startCheckout() {
    setSubmitting(true); setSubmitErr(null);
    track("checkout_started", { stage: "deposit" });
    try {
      let res: Response;
      if (retry) res = await fetch("/api/checkout/retry", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(retry) });
      else res = await fetch("/api/trips", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...a, childAges: a.childAges.filter(Boolean).join(", ") || undefined, travelerCount: +a.travelerCount, budgetAmount: Math.round(+a.budgetAmount) }) });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.url) { window.location.href = data.url; return; }
      if (data.alreadyPaid) { sessionStorage.removeItem(KEY); window.location.href = "/trip-started"; return; }
      if (data.retry) setRetry(data.retry);
      if (res.status === 404 && retry) setRetry(null);
      if (data.fields?.length) {
        const f: Record<string, string> = {}; data.fields.forEach((x: any) => (f[x.path] = x.message));
        const first = Math.min(...data.fields.map((x: any) => FIELD_STEP[x.path] || 18));
        setErrors(f); if (first < 18) { setReturnTo(18); setStep(first); }
      }
      setSubmitErr(data.error || "Your trip isn't lost. Something went wrong sending it. Please try again.");
    } catch {
      setSubmitErr("Your trip isn't lost. Something went wrong sending it. Please try again.");
    } finally { setSubmitting(false); }
  }

  const Err = ({ k }: { k: string }) => (errors[k] ? <span className="field-err" id={`${k}-err`} role="alert">{errors[k]}</span> : null);
  const choice = (k: keyof A, v: string, label: string, desc?: string, cls = "") => {
    const on = a[k] === v;
    return <button type="button" key={v} className={`opt ${cls}`} role="radio" aria-checked={on} onClick={() => set(k, v as any)}><span className="tick" aria-hidden="true">✓</span><b>{label}</b>{desc && <span className="d">{desc}</span>}</button>;
  };
  const multi = (k: keyof A, v: string, label: string, cls = "", photo?: string) => {
    const on = ((a[k] as string[]) || []).includes(v);
    return <button type="button" key={v} className={`opt ${cls}`} aria-pressed={on} onClick={() => toggle(k, v)}>{photo && <Photo id={photo as any} sizes="(max-width:700px) 50vw, 200px" />}<span className="tick" aria-hidden="true">✓</span><b>{label}</b></button>;
  };
  const chip = (k: keyof A, v: string) => <button type="button" key={v} className="chip" aria-pressed={((a[k] as string[]) || []).includes(v)} onClick={() => toggle(k, v)}>{v}</button>;
  const examples = (k: "mustVisit" | "dreamExperience" | "avoid", list: string[]) => (
    <div className="examples" aria-label="Tap to add an example">{list.map((x) => <button type="button" key={x} onClick={() => set(k, (a[k] ? a[k].trim() + "\n" : "") + x)}>+ {x}</button>)}</div>
  );
  const textArea = (k: "mustVisit" | "dreamExperience" | "avoid" | "additionalNotes", placeholder: string, label: string) => (
    <label className="field"><span className="sr-only">{label}</span><textarea value={a[k]} maxLength={3000} placeholder={placeholder} onChange={(e) => set(k, e.target.value)} style={{ minHeight: 180, fontSize: "1.1rem" }} /></label>
  );
  const radiogroup = (label: string, k: string, children: React.ReactNode, cls: string) => (
    <div role="radiogroup" aria-label={label} aria-describedby={errors[k] ? `${k}-err` : undefined} className={`opts ${cls}`}>{children}</div>
  );

  const Q: Record<number, { title: string; hint?: string; body: React.ReactNode }> = {
    1: { title: "Where are you traveling from?", hint: "We'll look at departure options from there.", body: <>
      <label className="field"><span>Departure city</span><input className="bigin" value={a.departureCity} onChange={(e) => set("departureCity", e.target.value)} placeholder="Atlanta, GA" autoComplete="address-level2" aria-invalid={!!errors.departureCity} aria-describedby={errors.departureCity ? "departureCity-err" : undefined} /><Err k="departureCity" /></label>
      <label className="field"><span>Preferred airport <span className="opt-tag">(optional)</span></span><input value={a.departureAirport} onChange={(e) => set("departureAirport", e.target.value)} placeholder="ATL" /></label></> },
    2: { title: "When are you going?", body: <>
      {radiogroup("Dates", "dateType", <>{choice("dateType", "EXACT", "I KNOW MY DATES", undefined, "big")}{choice("dateType", "FLEXIBLE", "I'M FLEXIBLE", undefined, "big")}</>, "c2 stack")}<Err k="dateType" />
      {a.dateType === "EXACT" && <div className="subq grid2">
        <label className="field"><span>Departure date</span><input type="date" min={today()} value={a.departureDate} onChange={(e) => set("departureDate", e.target.value)} aria-invalid={!!errors.departureDate} /><Err k="departureDate" /></label>
        <label className="field"><span>Return date</span><input type="date" min={a.departureDate || today()} value={a.returnDate} onChange={(e) => set("returnDate", e.target.value)} aria-invalid={!!errors.returnDate} /><Err k="returnDate" /></label></div>}
      {a.dateType === "FLEXIBLE" && <div className="subq grid2">
        <label className="field"><span>Month</span><select value={a.flexibleMonth} onChange={(e) => set("flexibleMonth", e.target.value)} aria-invalid={!!errors.flexibleMonth}><option value="">Choose a month</option>{months().map((m) => <option key={m}>{m}</option>)}</select><Err k="flexibleMonth" /></label>
        <label className="field"><span>Approximate date range <span className="opt-tag">(optional)</span></span><input value={a.flexibleDates} onChange={(e) => set("flexibleDates", e.target.value)} placeholder="e.g. mid-June, any 10 days" /></label></div>}</> },
    3: { title: "Who's going?", body: <>
      {radiogroup("Travelers", "travelerType", TRAVELER_TYPES.map((t) => choice("travelerType", t, t.toUpperCase(), undefined, "big")), "c3")}<Err k="travelerType" />
      <div className="subq grid2">
        <label className="field"><span>Number of travelers</span><input type="number" inputMode="numeric" min={1} max={40} value={a.travelerCount} onChange={(e) => set("travelerCount", e.target.value)} aria-invalid={!!errors.travelerCount} /><Err k="travelerCount" /></label>
      </div>
      {(a.travelerType === "Family" || a.travelerType === "Other") && <div className="subq">
        <span className="label">Children&apos;s ages <span className="opt-tag" style={{ fontWeight: 400, color: "var(--muted)" }}>(optional)</span></span>
        <div className="row">{a.childAges.map((age, i) => (
          <label key={i} className="field" style={{ width: 120, marginBottom: 0 }}><span className="sr-only">Child {i + 1} age</span>
            <input type="number" inputMode="numeric" min={0} max={17} value={age} placeholder="Age" onChange={(e) => { const c = [...a.childAges]; c[i] = e.target.value; set("childAges", c); }} /></label>))}
          {a.childAges.length < 8 && <button type="button" className="btn btn-ghost" onClick={() => set("childAges", [...a.childAges, ""])}>+ ADD CHILD</button>}
          {a.childAges.length > 0 && <button type="button" className="btn btn-ghost" onClick={() => set("childAges", a.childAges.slice(0, -1))}>REMOVE</button>}
        </div></div>}</> },
    4: { title: "How long do you have?", body: exactDays
      ? <div className="calc" role="status"><b>{exactDays} days</b>Calculated from your dates ({fmtDate(a.departureDate)} – {fmtDate(a.returnDate)}), including travel days.<p style={{ marginTop: 10, marginBottom: 0 }}><button type="button" className="link" style={{ background: "none", border: 0, padding: 0, cursor: "pointer", color: "var(--terra)" }} onClick={() => edit(2)}>Change dates</button></p></div>
      : <>{radiogroup("Trip length", "tripLength", TRIP_LENGTHS.map((t) => choice("tripLength", t, t, undefined, "big")), "c3")}<Err k="tripLength" /></> },
    5: { title: "What's your budget?", hint: "No judgment. A good trip is about using your budget well.", body: <>
      <label className="field money"><span className="sr-only">Budget in US dollars</span><input className="bigin" type="number" inputMode="numeric" min={1} step={100} value={a.budgetAmount} onChange={(e) => set("budgetAmount", e.target.value)} placeholder="3,000" aria-invalid={!!errors.budgetAmount} /></label><Err k="budgetAmount" />
      {radiogroup("Budget type", "budgetType", <>{choice("budgetType", "PER_PERSON", "PER PERSON")}{choice("budgetType", "TOTAL", "TOTAL TRIP")}</>, "c2")}<Err k="budgetType" />
      <div className="subq"><span className="label">Does this budget include flights from the United States?</span>
        {radiogroup("Flights included", "flightsInBudget", FLIGHTS_IN_BUDGET.map((f) => choice("flightsInBudget", f.v, f.l)), "c3")}<Err k="flightsInBudget" /></div></> },
    6: { title: "What does your Europe look like?", hint: "Pick as many as you like.", body: <><div className="opts c4" role="group" aria-label="Landscapes">{LANDSCAPES.map((l) => multi("landscapes", l, l, "visual", LAND_PHOTO[l]))}</div><Err k="landscapes" /></> },
    7: { title: "Pick your vibe.", hint: "Choose everything that sounds like you.", body: <><div className="chips" role="group" aria-label="Vibes">{VIBES.map((v) => chip("vibes", v))}</div><Err k="vibes" /></> },
    8: { title: "How much do you want to move?", body: <>{radiogroup("Trip structure", "tripStructure", STRUCTURES.map((s) => choice("tripStructure", s.v, s.v, s.d)), "c2 stack")}<Err k="tripStructure" /></> },
    9: { title: "What's your travel pace?", body: <>{radiogroup("Pace", "pace", PACES.map((s) => choice("pace", s.v, s.v, s.d)), "c3 stack")}<Err k="pace" /></> },
    10: { title: "Iconic Europe or local Europe?", hint: "Slide to where you land.", body: <>
      <div className="slider-ends" aria-hidden="true"><span>ICONIC</span><span>LOCAL</span></div>
      <input type="range" min={0} max={100} value={a.iconicLocalScore} onChange={(e) => set("iconicLocalScore", +e.target.value)} aria-label="Iconic to local" aria-valuetext={iconicLabel(a.iconicLocalScore).t} />
      <div className="readout" aria-live="polite"><b>{iconicLabel(a.iconicLocalScore).t}</b>{iconicLabel(a.iconicLocalScore).d}</div>
      <div className="grid2" style={{ marginTop: 20 }}><p className="fine"><strong>Iconic:</strong> Bucket-list landmarks and famous destinations.</p><p className="fine"><strong>Local:</strong> Neighborhoods, local restaurants, smaller destinations and less obvious experiences.</p></div></> },
    11: { title: "Where do you like to stay?", body: <>
      {radiogroup("Accommodation level", "accommodationLevel", STAY_LEVELS.map((s) => choice("accommodationLevel", s, s.toUpperCase(), undefined, "big")), "c3")}<Err k="accommodationLevel" />
      <div className="subq"><span className="label">Property preferences <span style={{ fontWeight: 400, color: "var(--muted)" }}>(optional)</span></span><div className="chips" role="group" aria-label="Property preferences">{PROPERTY_TYPES.map((p) => chip("propertyTypes", p))}</div></div></> },
    12: { title: "How do you want to get around?", hint: "Select any.", body: <>
      <div className="chips" role="group" aria-label="Transport">{TRANSPORT.map((t) => chip("transportPreferences", t))}</div><Err k="transportPreferences" />
      <div className="subq"><span className="label">Would you drive in Europe?</span>{radiogroup("Would you drive in Europe", "driveEurope", DRIVE.map((d) => choice("driveEurope", d, d)), "c3")}<Err k="driveEurope" /></div></> },
    13: { title: "What's already on your Europe list?", hint: "Optional, but it helps.", body: <>{textArea("mustVisit", "Italy is a must, but we're open to everything else...", "Places already on your list")}</> },
    14: { title: "What would make this trip unforgettable?", hint: "Optional. Dream a little.", body: <>{textArea("dreamExperience", "Tell us the moment you'll talk about for years…", "Dream experience")}{examples("dreamExperience", ["Seeing my favorite football club.", "An insane beach club night.", "Driving through the Alps.", "Eating incredible Italian food.", "Proposing somewhere beautiful."])}</> },
    15: { title: "What should we keep OUT?", hint: "Optional. Just as important.", body: <>{textArea("avoid", "Anything you don't want in this trip…", "Things to avoid")}{examples("avoid", ["No museums every day.", "No rental cars.", "No 6 AM wakeups.", "No changing hotels every night."])}</> },
    16: { title: "Anything else?", hint: "Dietary needs, mobility, a birthday, a budget worry. Optional.", body: textArea("additionalNotes", "Anything else we should know…", "Anything else") },
    17: { title: "Who are we building this for?", body: <>
      <div className="grid2">
        <label className="field"><span>First name</span><input value={a.firstName} onChange={(e) => set("firstName", e.target.value)} autoComplete="given-name" aria-invalid={!!errors.firstName} /><Err k="firstName" /></label>
        <label className="field"><span>Last name</span><input value={a.lastName} onChange={(e) => set("lastName", e.target.value)} autoComplete="family-name" aria-invalid={!!errors.lastName} /><Err k="lastName" /></label>
      </div>
      <label className="field"><span>Email</span><input type="email" inputMode="email" value={a.email} onChange={(e) => set("email", e.target.value)} autoComplete="email" aria-invalid={!!errors.email} /><Err k="email" /></label>
      <label className="field"><span>Phone <span className="opt-tag">(optional)</span></span><input type="tel" value={a.phone} onChange={(e) => set("phone", e.target.value)} autoComplete="tel" /></label>
      <div className="hp" aria-hidden="true"><label>Website<input tabIndex={-1} autoComplete="off" value={a.website} onChange={(e) => set("website", e.target.value)} /></label></div>
      <label className="check"><input type="checkbox" checked={a.termsAccepted} onChange={(e) => set("termsAccepted", e.target.checked)} aria-invalid={!!errors.termsAccepted} /><span>I agree to the <Link className="link" href="/terms" target="_blank">Terms &amp; Conditions</Link>.</span></label><Err k="termsAccepted" />
      <label className="check"><input type="checkbox" checked={a.serviceAcknowledged} onChange={(e) => set("serviceAcknowledged", e.target.checked)} aria-invalid={!!errors.serviceAcknowledged} /><span>I acknowledge that TRIPATROP provides trip-planning services and that travel products are booked separately with third-party providers.</span></label><Err k="serviceAcknowledged" />
      <label className="check"><input type="checkbox" checked={a.marketingConsent} onChange={(e) => set("marketingConsent", e.target.checked)} /><span>Send me TRIPATROP travel ideas and updates. <span className="muted">(optional)</span></span></label>
      <p className="fine">See our <Link className="link" href="/privacy" target="_blank">Privacy Policy</Link>.</p></> },
  };

  const reviewRows = useMemo(() => [
    [1, "From", `${a.departureCity}${a.departureAirport ? ` (${a.departureAirport})` : ""}`],
    [2, "Dates", a.dateType === "EXACT" ? `${fmtDate(a.departureDate)} – ${fmtDate(a.returnDate)}` : `Flexible — ${a.flexibleMonth}${a.flexibleDates ? `, ${a.flexibleDates}` : ""}`],
    [3, "Who", `${a.travelerType} · ${a.travelerCount} traveler${+a.travelerCount === 1 ? "" : "s"}${a.childAges.filter(Boolean).length ? ` · kids ${a.childAges.filter(Boolean).join(", ")}` : ""}`],
    [4, "Length", a.tripLength],
    [5, "Budget", a.budgetAmount ? `$${Number(a.budgetAmount).toLocaleString("en-US")} ${a.budgetType === "PER_PERSON" ? "per person" : "total"} · flights included: ${FLIGHTS_IN_BUDGET.find((f) => f.v === a.flightsInBudget)?.l.toLowerCase() || "—"}` : ""],
    [6, "Your Europe", a.landscapes.join(", ")], [7, "Vibe", a.vibes.join(", ")], [8, "Moving around", a.tripStructure], [9, "Pace", a.pace],
    [10, "Iconic / local", iconicLabel(a.iconicLocalScore).t], [11, "Stays", `${a.accommodationLevel}${a.propertyTypes.length ? ` · ${a.propertyTypes.join(", ")}` : ""}`],
    [12, "Getting around", `${a.transportPreferences.join(", ")} · Would drive: ${a.driveEurope}`],
    [13, "Already on your list", a.mustVisit || "—"], [14, "Unforgettable", a.dreamExperience || "—"], [15, "Keep out", a.avoid || "—"], [16, "Anything else", a.additionalNotes || "—"],
    [17, "You", `${a.firstName} ${a.lastName} · ${a.email}${a.phone ? ` · ${a.phone}` : ""}`],
  ] as [number, string, string][], [a]);

  if (!loaded) return <div className="quiz" aria-busy="true" />;

  return (
    <div className="quiz">
      <div className="q-top">
        <Link href="/" aria-label="TRIPATROP home"><Image src="/logo-wordmark.png" alt="tripatrop" width={900} height={198} style={{ height: 24, width: "auto" }} priority /></Link>
        {step >= 1 && step <= TOTAL && <div className="q-progress" aria-label={`Question ${step} of ${TOTAL}`}><span>{step} of {TOTAL}</span><div className="q-bar" role="progressbar" aria-valuemin={1} aria-valuemax={TOTAL} aria-valuenow={step}><i style={{ width: `${(step / TOTAL) * 100}%` }} /></div></div>}
        <Link href="/" className="q-exit">EXIT</Link>
      </div>

      <main id="main" className="q-main">
        <div key={step} className="q-anim">
          {step === 0 && <div style={{ paddingTop: "4vh" }}>
            <h1 className="d1" style={{ fontSize: "clamp(2.8rem,8vw,5.6rem)", maxWidth: "14ch" }}>First, tell us what your Europe looks like.</h1>
            <p className="lede" style={{ margin: "24px 0 40px" }}>About 5 minutes. One question at a time. Then we&apos;ll take it from there.</p>
            <button className="btn btn-primary btn-lg" onClick={() => { track("quiz_started"); setStep(1); }}>LET&apos;S GO →</button>
          </div>}

          {step >= 1 && step <= TOTAL && <>
            <h1 ref={titleRef} tabIndex={-1}>{Q[step].title}</h1>
            {Q[step].hint ? <p className="q-hint">{Q[step].hint}</p> : <div style={{ height: 24 }} />}
            {Q[step].body}
            {submitErr && step === 17 && <div className="alert alert-err" role="alert">{submitErr}</div>}
          </>}

          {step === 18 && <>
            <h1 ref={titleRef} tabIndex={-1}>This is your Europe so far.</h1>
            <p className="q-hint">Check everything. Tap edit to change an answer.</p>
            <dl className="review">{reviewRows.map(([s, k, v]) => <div className="review-row" key={k}><dt>{k}</dt><dd>{v}</dd><button type="button" onClick={() => edit(s)} aria-label={`Edit ${k}`}>EDIT</button></div>)}</dl>
            <section className="service" aria-labelledby="svc-h">
              <div className="service-head"><h2 id="svc-h" className="d3" style={{ fontSize: "2rem" }}>FIND MY EUROPE</h2><p className="d3" style={{ margin: "6px 0 0" }}>{depositLabel} today</p></div>
              <div className="service-body">
                <ul className="checks"><li>Personal review of your request</li><li>Initial destination and route research</li><li>Three personalized trip directions</li><li>One reasonable revision to your selected direction</li></ul>
                <p style={{ marginTop: 18 }}><strong>The remaining {finalLabel} is paid only if you decide to continue with a selected trip direction and want us to build the complete plan.</strong></p>
                <p className="fine">Travel purchases are separate. Deposit terms are explained in our <Link className="link" href="/refund-policy" target="_blank">Refund &amp; Cancellation Policy</Link>. Secure payment by Stripe — we never see or store your card details.</p>
              </div>
            </section>
            {submitErr && <div className="alert alert-err" role="alert">{submitErr}</div>}
            <button className="btn btn-primary btn-lg btn-block" onClick={startCheckout} disabled={submitting} style={{ fontSize: "1.15rem" }}>{submitting ? "OPENING SECURE CHECKOUT…" : submitErr ? "TRY AGAIN →" : `START MY TRIP — ${depositLabel} →`}</button>
          </>}
        </div>
      </main>

      {step >= 1 && step <= TOTAL && <nav className="q-nav" aria-label="Questionnaire navigation">
        <button type="button" className="btn btn-ghost" onClick={back}>{returnTo ? "CANCEL" : "BACK"}</button>
        <button type="button" className="btn btn-primary" onClick={next}>{returnTo ? "SAVE →" : step === TOTAL ? "REVIEW MY TRIP →" : [13, 14, 15, 16].includes(step) && !String(a[({ 13: "mustVisit", 14: "dreamExperience", 15: "avoid", 16: "additionalNotes" } as const)[step as 13]] || "").trim() ? "SKIP →" : "CONTINUE →"}</button>
      </nav>}
      {step === 18 && <nav className="q-nav" aria-label="Review navigation"><button type="button" className="btn btn-ghost" onClick={() => setStep(17)}>BACK</button></nav>}
    </div>
  );
}
