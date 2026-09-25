export type TripRow = Record<string, any>;

const fmt = (d: string | Date | null | undefined, opts: Intl.DateTimeFormatOptions) => {
  if (!d) return "";
  const date = typeof d === "string" ? new Date(d.length === 10 ? d + "T12:00:00Z" : d) : d;
  return date.toLocaleDateString("en-US", { timeZone: "UTC", ...opts });
};
export const toISODate = (d: any) => (d instanceof Date ? d.toISOString().slice(0, 10) : d ? String(d).slice(0, 10) : "");

/** "Jun 8–18" / "Jun 28 – Jul 6" / "Flexible: June 2027" */
export function shortDates(t: TripRow) {
  if (t.date_type === "EXACT" && t.departure_date && t.return_date) {
    const a = toISODate(t.departure_date), b = toISODate(t.return_date);
    const sameMonth = a.slice(0, 7) === b.slice(0, 7);
    return sameMonth
      ? `${fmt(a, { month: "short", day: "numeric" })}–${fmt(b, { day: "numeric" })}`
      : `${fmt(a, { month: "short", day: "numeric" })} – ${fmt(b, { month: "short", day: "numeric" })}`;
  }
  return `Flexible: ${t.flexible_month || "TBD"}`;
}
export function longDates(t: TripRow) {
  if (t.date_type === "EXACT")
    return `${fmt(toISODate(t.departure_date), { month: "short", day: "numeric", year: "numeric" })} – ${fmt(toISODate(t.return_date), { month: "short", day: "numeric", year: "numeric" })}`;
  return `Flexible — ${t.flexible_month}${t.flexible_dates ? ` (${t.flexible_dates})` : ""}`;
}
export const budgetLine = (t: TripRow) =>
  `$${Number(t.budget_amount).toLocaleString("en-US")} ${t.budget_type === "PER_PERSON" ? "per person" : "total trip"}`;
export const flightsLabel = (v: string) => ({ YES: "Yes", NO: "No", NOT_SURE: "Not sure" } as Record<string, string>)[v] || v;
export const stamp = (d: any) => (d ? new Date(d).toLocaleString("en-US", { timeZone: "UTC", dateStyle: "medium", timeStyle: "short" }) + " UTC" : "—");

/** First destination-ish word from "must visit" text for email subject lines. */
export function destinationHint(t: TripRow) {
  const s: string = t.must_visit || "";
  const m = s.match(/\b(Italy|Spain|France|Portugal|Greece|Croatia|Switzerland|Austria|Germany|England|UK|Ireland|Scotland|Netherlands|Belgium|Norway|Iceland|Rome|Paris|Barcelona|Lisbon|London|Amsterdam|Madrid|Athens|Florence|Venice|Ibiza|Nice|Amalfi|Santorini|Dolomites|Alps)\b/i);
  if (m) return m[1][0].toUpperCase() + m[1].slice(1);
  return (t.landscapes && t.landscapes[0]) ? String(t.landscapes[0]).toLowerCase().replace(/^\w/, (c: string) => c.toUpperCase()) : "Europe";
}
