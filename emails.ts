import { config, money } from "./config";
import { TripRow, longDates, budgetLine, flightsLabel, stamp, shortDates, destinationHint } from "./format";
import { iconicLabel } from "./options";
import type { Mail } from "./email";

const C = { cream: "#F2EADB", paper: "#FAF5EA", ink: "#2B201A", muted: "#6E5C50", terra: "#BC6243", line: "#E3D7C3" };
const e = (s: unknown) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
const nl = (s: unknown) => e(s).replace(/\n/g, "<br>");
const serif = "Georgia,'Times New Roman',serif";
const sans = "-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

function layout(inner: string, preheader = "") {
  const site = config.siteUrl();
  return `<!doctype html><html><body style="margin:0;background:${C.cream};">
<span style="display:none;max-height:0;overflow:hidden;opacity:0">${e(preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.cream};padding:32px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:${C.paper};border:1px solid ${C.line};border-radius:6px">
<tr><td style="padding:32px 36px 8px"><img src="${site}/logo-wordmark.png" width="170" alt="tripatrop" style="display:block;border:0;width:170px;height:auto"></td></tr>
<tr><td style="padding:8px 36px 36px;font-family:${sans};font-size:16px;line-height:1.6;color:${C.ink}">${inner}</td></tr>
<tr><td style="padding:20px 36px;border-top:1px solid ${C.line};font-family:${sans};font-size:12px;color:${C.muted};letter-spacing:.12em">WE PLAN. YOU GO.</td></tr>
</table></td></tr></table></body></html>`;
}
const h1 = (t: string) => `<h1 style="font-family:${serif};font-weight:400;font-size:34px;line-height:1.1;margin:16px 0 18px;color:${C.ink}">${t}</h1>`;
const h2 = (t: string) => `<h2 style="font-family:${sans};font-size:12px;letter-spacing:.16em;color:${C.terra};margin:28px 0 8px;font-weight:700">${t}</h2>`;
const btn = (href: string, label: string) =>
  `<a href="${e(href)}" style="display:inline-block;background:${C.terra};color:#FAF5EA;text-decoration:none;font-family:${sans};font-weight:700;letter-spacing:.08em;font-size:14px;padding:14px 24px;border-radius:999px">${e(label)}</a>`;
const rows = (pairs: [string, unknown][]) =>
  `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid ${C.line}">${pairs
    .map(([k, v]) => `<tr><td style="padding:8px 12px 8px 0;border-bottom:1px solid ${C.line};color:${C.muted};font-size:13px;width:38%;vertical-align:top">${e(k)}</td><td style="padding:8px 0;border-bottom:1px solid ${C.line};font-size:15px;vertical-align:top">${v === undefined || v === null || v === "" ? "—" : nl(v)}</td></tr>`)
    .join("")}</table>`;
const txt = (pairs: [string, unknown][]) => pairs.map(([k, v]) => `${k}: ${v ?? "—"}`).join("\n");
const list = (a?: string[]) => (a && a.length ? a.join(", ") : "—");

function sections(t: TripRow) {
  const il = iconicLabel(t.iconic_local_score);
  return {
    customer: [["First name", t.first_name], ["Last name", t.last_name], ["Email", t.email], ["Phone", t.phone]] as [string, unknown][],
    travel: [["Departure city", t.departure_city], ["Airport", t.departure_airport], ["Dates", longDates(t)], ["Trip length", t.trip_length], ["Travelers", t.traveler_count], ["Traveler type", t.traveler_type], ["Children's ages", t.child_ages]] as [string, unknown][],
    budget: [["Amount", `$${Number(t.budget_amount).toLocaleString("en-US")}`], ["Per person / total", t.budget_type === "PER_PERSON" ? "Per person" : "Total trip"], ["Flights included?", flightsLabel(t.flights_in_budget)]] as [string, unknown][],
    europe: [["Landscapes", list(t.landscapes)], ["Vibes", list(t.vibes)], ["Trip structure", t.trip_structure], ["Pace", t.pace], ["Iconic / local", `${t.iconic_local_score}/100 toward local — ${il.t}`], ["Accommodation level", t.accommodation_level], ["Property preferences", list(t.property_types)], ["Transportation", list(t.transport_preferences)], ["Would drive in Europe", t.drive_europe]] as [string, unknown][],
    words: [["Places already in mind", t.must_visit], ["Dream experience", t.dream_experience], ["Things to avoid", t.avoid], ["Additional information", t.additional_notes]] as [string, unknown][],
    payment: [["Deposit status", t.deposit_status], ["Payment reference", t.deposit_payment_id], ["Amount", t.deposit_amount_cents ? money(t.deposit_amount_cents) : "—"], ["Timestamp", stamp(t.deposit_paid_at)]] as [string, unknown][],
  };
}

export function ownerNewTripEmail(t: TripRow): Mail {
  const s = sections(t);
  const subject = `NEW TRIP • ${t.public_trip_id} • ${t.first_name} • ${destinationHint(t)} • ${shortDates(t)}`;
  const adminUrl = `${config.siteUrl()}/admin/trips/${t.internal_id}`;
  const html = layout(
    `${h1("New trip request")}
    ${rows([["Trip ID", `${t.public_trip_id}`], ["Submitted", stamp(t.created_at)], ["Deposit", `PAID — ${money(t.deposit_amount_cents)}`]])}
    ${h2("CUSTOMER")}${rows(s.customer)}${h2("TRAVEL")}${rows(s.travel)}${h2("BUDGET")}${rows(s.budget)}
    ${h2("THEIR EUROPE")}${rows(s.europe)}${h2("THEIR WORDS")}${rows(s.words)}${h2("PAYMENT")}${rows(s.payment)}
    <p style="margin-top:28px">${btn(adminUrl, "OPEN TRIP REQUEST")}</p>`, `${t.first_name} • ${shortDates(t)}`);
  const text = [`NEW TRIP REQUEST`, `Trip ID: ${t.public_trip_id}`, `Submitted: ${stamp(t.created_at)}`, `Deposit: PAID — ${money(t.deposit_amount_cents)}`,
    "", "CUSTOMER", txt(s.customer), "", "TRAVEL", txt(s.travel), "", "BUDGET", txt(s.budget), "", "THEIR EUROPE", txt(s.europe),
    "", "THEIR WORDS", txt(s.words), "", "PAYMENT", txt(s.payment), "", `Open trip request: ${adminUrl}`].join("\n");
  return { to: config.ownerEmail(), subject, html, text, replyTo: t.email };
}

export function customerDepositEmail(t: TripRow): Mail {
  const subject = `We're building your Europe • TRIPATROP ${t.public_trip_id}`;
  const support = config.supportEmail();
  const html = layout(
    `<p>Hi ${e(t.first_name)},</p>
    ${h1("Your trip is officially in.")}
    <p>We've received your preferences and your ${money(t.deposit_amount_cents)} Trip Design deposit.</p>
    <p>Now the fun part starts.</p>
    <p>We're going to personally review what you told us and research three trip directions built around your dates, budget and travel style.</p>
    <p style="margin:24px 0 4px;color:${C.muted};font-size:13px;letter-spacing:.12em">YOUR TRIP ID</p>
    <p style="font-family:${serif};font-size:30px;margin:0 0 8px">${e(t.public_trip_id)}</p>
    ${h2("WHAT HAPPENS NEXT")}
    <ol style="padding-left:20px;margin:0">
      <li style="margin:6px 0">We review your trip request.</li>
      <li style="margin:6px 0">We research realistic destinations and routes.</li>
      <li style="margin:6px 0">We create three personalized trip directions.</li>
      <li style="margin:6px 0">We send them to this email.</li>
    </ol>
    <p style="margin-top:20px">At this stage, we're finding the right version of Europe for you — not building three complete booking packages.</p>
    <p>Once you choose the direction you love, one reasonable revision is included.</p>
    <p>If you want us to turn your selected direction into the complete itinerary with detailed recommendations and booking links, the remaining planning balance is ${money(config.finalCents())}.</p>
    <p style="font-family:${serif};font-size:22px;margin:28px 0 4px">You dream it. We map it.</p>
    <p style="margin:0">TRIPATROP</p>
    <p style="margin-top:28px;font-size:13px;color:${C.muted}">Questions? Reply to this email or write to <a href="mailto:${e(support)}" style="color:${C.terra}">${e(support)}</a>. Please include your Trip ID.</p>`,
    "Your trip is officially in.");
  const text = `Hi ${t.first_name},

Your trip is officially in.

We've received your preferences and your ${money(t.deposit_amount_cents)} Trip Design deposit.

Now the fun part starts.

We're going to personally review what you told us and research three trip directions built around your dates, budget and travel style.

Your Trip ID: ${t.public_trip_id}

WHAT HAPPENS NEXT
1. We review your trip request.
2. We research realistic destinations and routes.
3. We create three personalized trip directions.
4. We send them to this email.

At this stage, we're finding the right version of Europe for you — not building three complete booking packages.

Once you choose the direction you love, one reasonable revision is included.

If you want us to turn your selected direction into the complete itinerary with detailed recommendations and booking links, the remaining planning balance is ${money(config.finalCents())}.

You dream it. We map it.

TRIPATROP
WE PLAN. YOU GO.

Support: ${support}`;
  return { to: t.email, subject, html, text, replyTo: support };
}

export function customerFinalLinkEmail(t: TripRow, link: string): Mail {
  const subject = `Ready to build it? • TRIPATROP ${t.public_trip_id}`;
  const html = layout(
    `<p>Hi ${e(t.first_name)},</p>${h1("Ready to build it?")}
    <p>Your selected direction: <strong>${e(t.selected_concept)}</strong></p>
    <p>When you're ready, pay the remaining ${money(config.finalCents())} planning balance and we'll turn it into your complete TRIPATROP plan.</p>
    <p style="margin:26px 0">${btn(link, `BUILD MY FINAL TRIP — ${money(config.finalCents())} →`)}</p>
    <p style="font-size:13px;color:${C.muted}">This link is personal to your trip (${e(t.public_trip_id)}). Please don't share it.</p>`, "Your final payment link");
  const text = `Hi ${t.first_name},\n\nReady to build it?\nSelected direction: ${t.selected_concept}\n\nPay the remaining ${money(config.finalCents())} planning balance here:\n${link}\n\nTrip ID: ${t.public_trip_id}\n\nTRIPATROP\nWE PLAN. YOU GO.`;
  return { to: t.email, subject, html, text, replyTo: config.supportEmail() };
}

export function ownerFinalEmail(t: TripRow): Mail {
  const name = `${t.first_name} ${t.last_name}`;
  const subject = `FINAL PAYMENT • ${t.public_trip_id} • ${name}`;
  const adminUrl = `${config.siteUrl()}/admin/trips/${t.internal_id}`;
  const pairs: [string, unknown][] = [["Customer", `${name} (${t.email})`], ["Trip ID", t.public_trip_id], ["Selected concept", t.selected_concept], ["Paid", `${money(t.final_amount_cents)} — PAID`], ["Payment reference", t.final_payment_id], ["Timestamp", stamp(t.final_paid_at)]];
  const html = layout(`${h1("Final payment received")}${rows(pairs)}<p style="margin-top:28px">${btn(adminUrl, "OPEN TRIP")}</p>`);
  return { to: config.ownerEmail(), subject, html, text: `FINAL PAYMENT\n${txt(pairs)}\n\nOpen trip: ${adminUrl}`, replyTo: t.email };
}

export function customerFinalEmail(t: TripRow): Mail {
  const subject = `Let's build it • TRIPATROP ${t.public_trip_id}`;
  const html = layout(
    `<p>Hi ${e(t.first_name)},</p>${h1("You're in.")}
    <p>We've received your remaining ${money(t.final_amount_cents)} planning balance.</p>
    <p>Now we're turning your selected trip direction into the complete TRIPATROP plan.</p>
    <p>We'll research the details that make the trip work — transportation, stays, activities, timing, events, food and the booking options relevant to your itinerary.</p>
    <p>When it's ready, we'll send your final trip plan and booking links directly to you.</p>
    <p>Remember:</p><p style="font-family:${serif};font-size:22px;margin:0 0 20px">We plan. You book. You go.</p>
    <p>TRIPATROP</p><p style="font-size:13px;color:${C.muted}">Trip ID: ${e(t.public_trip_id)} • ${e(config.supportEmail())}</p>`, "Your final trip is being built.");
  const text = `Hi ${t.first_name},\n\nYou're in.\n\nWe've received your remaining ${money(t.final_amount_cents)} planning balance.\n\nNow we're turning your selected trip direction into the complete TRIPATROP plan.\n\nWe'll research the details that make the trip work — transportation, stays, activities, timing, events, food and the booking options relevant to your itinerary.\n\nWhen it's ready, we'll send your final trip plan and booking links directly to you.\n\nRemember:\nWe plan. You book. You go.\n\nTRIPATROP\nTrip ID: ${t.public_trip_id}\nSupport: ${config.supportEmail()}`;
  return { to: t.email, subject, html, text, replyTo: config.supportEmail() };
}

export function ownerContactEmail(m: { name: string; email: string; tripId?: string; subject: string; message: string; created_at: Date }): Mail {
  const pairs: [string, unknown][] = [["Name", m.name], ["Email", m.email], ["Trip ID", m.tripId], ["Message", m.message], ["Timestamp", stamp(m.created_at)]];
  return { to: config.supportEmail(), subject: `TRIPATROP CONTACT • ${m.subject} • ${m.name}`, html: layout(`${h1("New message")}${rows(pairs)}`), text: txt(pairs), replyTo: m.email };
}

export function customerContactEmail(m: { name: string; email: string; subject: string }): Mail {
  const html = layout(`<p>Hi ${e(m.name)},</p>${h1("We got your message.")}<p>A real person will read it and reply to this address.</p><p style="font-size:13px;color:${C.muted}">Subject: ${e(m.subject)}</p>`);
  return { to: m.email, subject: "We got your message • TRIPATROP", html, text: `Hi ${m.name},\n\nWe got your message. A real person will read it and reply to this address.\n\nTRIPATROP`, replyTo: config.supportEmail() };
}
