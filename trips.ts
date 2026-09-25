import "server-only";
import type Stripe from "stripe";
import { db } from "./db";
import { stripe } from "./stripe";
import { config } from "./config";
import { sendEmail } from "./email";
import { makeTripId, secureToken } from "./tokens";
import type { TripInput } from "./validation";
import type { TripRow } from "./format";
import { ownerNewTripEmail, customerDepositEmail, ownerFinalEmail, customerFinalEmail, customerFinalLinkEmail } from "./emails";

/* ─────────────────────────── Stage 1: pending request ─────────────────────────── */

export async function createPendingTrip(v: TripInput) {
  const sql = db();
  const resumeToken = secureToken();
  const [row] = await sql`
    INSERT INTO trip_requests (
      resume_token, first_name, last_name, email, phone, departure_city, departure_airport, date_type,
      departure_date, return_date, flexible_month, flexible_dates, traveler_type, traveler_count, child_ages,
      trip_length, budget_amount, budget_type, flights_in_budget, landscapes, vibes, trip_structure, pace,
      iconic_local_score, accommodation_level, property_types, transport_preferences, drive_europe,
      must_visit, dream_experience, avoid, additional_notes, terms_accepted_at, service_acknowledgment_at,
      marketing_consent, trip_status, deposit_status
    ) VALUES (
      ${resumeToken}, ${v.firstName}, ${v.lastName}, ${v.email.toLowerCase()}, ${v.phone ?? null}, ${v.departureCity}, ${v.departureAirport ?? null}, ${v.dateType},
      ${v.dateType === "EXACT" ? v.departureDate! : null}::date, ${v.dateType === "EXACT" ? v.returnDate! : null}::date,
      ${v.dateType === "FLEXIBLE" ? v.flexibleMonth! : null}, ${v.dateType === "FLEXIBLE" ? v.flexibleDates ?? null : null},
      ${v.travelerType}, ${v.travelerCount}, ${v.childAges ?? null}, ${v.tripLength}, ${v.budgetAmount}, ${v.budgetType}, ${v.flightsInBudget},
      ${sql.array(v.landscapes as string[])}::text[], ${sql.array(v.vibes as string[])}::text[], ${v.tripStructure}, ${v.pace},
      ${v.iconicLocalScore}, ${v.accommodationLevel}, ${sql.array(v.propertyTypes as string[])}::text[], ${sql.array(v.transportPreferences as string[])}::text[], ${v.driveEurope},
      ${v.mustVisit ?? null}, ${v.dreamExperience ?? null}, ${v.avoid ?? null}, ${v.additionalNotes ?? null}, now(), now(),
      ${v.marketingConsent}, 'PENDING_PAYMENT', 'UNPAID'
    ) RETURNING *`;
  return row as TripRow;
}

export async function getTrip(internalId: string) {
  if (!/^[0-9a-f-]{36}$/i.test(internalId)) return null;
  const [row] = await db()`SELECT * FROM trip_requests WHERE internal_id = ${internalId}`;
  return (row as TripRow) || null;
}

export async function createDepositCheckout(t: TripRow) {
  const site = config.siteUrl();
  const name = `${t.first_name} ${t.last_name}`;
  const meta = { kind: "deposit", trip_request_id: t.internal_id, customer_name: name, customer_email: t.email };
  const session = await stripe().checkout.sessions.create({
    mode: "payment",
    customer_email: t.email,
    client_reference_id: t.internal_id,
    line_items: [{
      quantity: 1,
      price_data: {
        currency: "usd",
        unit_amount: config.depositCents(),
        product_data: { name: "TRIPATROP — Find My Europe", description: "Personal review, initial research and three personalized trip directions." },
      },
    }],
    metadata: meta,
    payment_intent_data: { metadata: meta, description: `TRIPATROP Find My Europe — ${name}` },
    success_url: `${site}/trip-started?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${site}/payment-failed?r=${t.internal_id}&k=${encodeURIComponent(t.resume_token)}`,
  });
  await db()`UPDATE trip_requests SET deposit_session_id = ${session.id}, updated_at = now() WHERE internal_id = ${t.internal_id}`;
  return session.url!;
}

/* ─────────────────────────── Stage 1: verified payment ─────────────────────────── */

const piId = (s: Stripe.Checkout.Session) => (typeof s.payment_intent === "string" ? s.payment_intent : s.payment_intent?.id) || s.id;

/**
 * Verifies a Checkout Session with Stripe (server-side) and marks the deposit PAID.
 * Idempotent: safe to call from both the webhook and the success page.
 */
export async function fulfillDepositSession(sessionId: string): Promise<{ trip: TripRow | null; paid: boolean }> {
  const s = await stripe().checkout.sessions.retrieve(sessionId);
  const id = s.metadata?.trip_request_id || s.client_reference_id;
  if (!id || s.metadata?.kind !== "deposit") return { trip: null, paid: false };
  const paid = s.payment_status === "paid" && s.currency === "usd" && s.amount_total === config.depositCents();
  if (!paid) return { trip: await getTrip(id), paid: false };

  const sql = db();
  for (let attempt = 0; attempt < 6; attempt++) {
    try {
      const [row] = await sql`
        UPDATE trip_requests SET
          deposit_status = 'PAID',
          trip_status = CASE WHEN trip_status = 'PENDING_PAYMENT' THEN 'NEW' ELSE trip_status END,
          public_trip_id = COALESCE(public_trip_id, ${makeTripId()}),
          deposit_session_id = ${s.id}, deposit_payment_id = ${piId(s)},
          deposit_amount_cents = ${s.amount_total}, deposit_paid_at = now(), updated_at = now()
        WHERE internal_id = ${id} AND deposit_status <> 'PAID'
        RETURNING *`;
      if (!row) return { trip: await getTrip(id), paid: true }; // already fulfilled
      await sendDepositEmails(row as TripRow);
      return { trip: (await getTrip(id))!, paid: true };
    } catch (err: any) {
      if (err?.code === "23505" && String(err?.constraint_name || err?.message).includes("public_trip_id")) continue; // Trip ID collision → retry
      throw err;
    }
  }
  throw new Error("Could not allocate a unique Trip ID");
}

async function recordEmailResult(id: string, errors: string[]) {
  const status = errors.length ? "EMAIL_DELIVERY_ERROR" : "SENT";
  await db()`UPDATE trip_requests SET email_delivery_status = ${status}, email_error_detail = ${errors.join(" | ") || null}, updated_at = now() WHERE internal_id = ${id}`;
  return status;
}

export async function sendDepositEmails(t: TripRow) {
  const errors: string[] = [];
  for (const [label, mail] of [["owner", () => ownerNewTripEmail(t)], ["customer", () => customerDepositEmail(t)]] as const) {
    try { const r = await sendEmail(mail()); if (!r.ok) errors.push(`${label}: ${r.error}`); }
    catch (e: any) { errors.push(`${label}: ${e?.message}`); }
  }
  return recordEmailResult(t.internal_id, errors);
}

/* ─────────────────────────── Stage 2: final payment ─────────────────────────── */

export async function enableFinalPayment(id: string, concept: string) {
  const token = secureToken();
  const [row] = await db()`
    UPDATE trip_requests SET selected_concept = ${concept}, final_payment_eligible = true,
      final_payment_token = ${token}, final_token_expires_at = now() + ${config.finalLinkTtlDays() + " days"}::interval,
      final_payment_status = 'AWAITING', trip_status = 'AWAITING_FINAL_PAYMENT', updated_at = now()
    WHERE internal_id = ${id} AND deposit_status = 'PAID' AND final_payment_status <> 'PAID'
    RETURNING *`;
  return (row as TripRow) || null;
}
export async function disableFinalPayment(id: string) {
  await db()`UPDATE trip_requests SET final_payment_eligible = false, final_payment_token = NULL, final_token_expires_at = NULL,
    final_payment_status = CASE WHEN final_payment_status = 'PAID' THEN 'PAID' ELSE 'NOT_DUE' END, updated_at = now() WHERE internal_id = ${id}`;
}
export const finalLink = (t: TripRow) => `${config.siteUrl()}/continue/${t.final_payment_token}`;

export async function sendFinalLinkEmail(t: TripRow) {
  const r = await sendEmail(customerFinalLinkEmail(t, finalLink(t)));
  return r.ok ? null : r.error;
}

/** Token is authoritative — never the editable Trip ID in the URL. */
export async function getTripByFinalToken(token: string) {
  if (!/^[A-Za-z0-9_-]{40,60}$/.test(token)) return null;
  const [row] = await db()`
    SELECT * FROM trip_requests WHERE final_payment_token = ${token}
      AND final_payment_eligible = true AND deposit_status = 'PAID'
      AND final_payment_status = 'AWAITING' AND trip_status <> 'CANCELLED'
      AND (final_token_expires_at IS NULL OR final_token_expires_at > now())`;
  return (row as TripRow) || null;
}

export async function createFinalCheckout(t: TripRow) {
  const site = config.siteUrl();
  const name = `${t.first_name} ${t.last_name}`;
  const meta = { kind: "final", trip_request_id: t.internal_id, trip_id: t.public_trip_id, customer_name: name, customer_email: t.email };
  const session = await stripe().checkout.sessions.create({
    mode: "payment",
    customer_email: t.email,
    client_reference_id: t.internal_id,
    line_items: [{
      quantity: 1,
      price_data: {
        currency: "usd",
        unit_amount: config.finalCents(),
        product_data: { name: "TRIPATROP — Build My Europe", description: `Complete trip plan for ${t.public_trip_id}: ${t.selected_concept}` },
      },
    }],
    metadata: meta,
    payment_intent_data: { metadata: meta, description: `TRIPATROP Build My Europe — ${t.public_trip_id}` },
    success_url: `${site}/final-started?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${site}/continue/${t.final_payment_token}?payment=failed`,
  });
  await db()`UPDATE trip_requests SET final_session_id = ${session.id}, updated_at = now() WHERE internal_id = ${t.internal_id}`;
  return session.url!;
}

export async function fulfillFinalSession(sessionId: string): Promise<{ trip: TripRow | null; paid: boolean }> {
  const s = await stripe().checkout.sessions.retrieve(sessionId);
  const id = s.metadata?.trip_request_id || s.client_reference_id;
  if (!id || s.metadata?.kind !== "final") return { trip: null, paid: false };
  const paid = s.payment_status === "paid" && s.currency === "usd" && s.amount_total === config.finalCents();
  if (!paid) return { trip: await getTrip(id), paid: false };
  const [row] = await db()`
    UPDATE trip_requests SET final_payment_status = 'PAID', trip_status = 'FINAL_RESEARCH',
      final_session_id = ${s.id}, final_payment_id = ${piId(s)}, final_amount_cents = ${s.amount_total},
      final_paid_at = now(), final_payment_eligible = false, updated_at = now()
    WHERE internal_id = ${id} AND final_payment_status <> 'PAID'
    RETURNING *`;
  if (row) await sendFinalEmails(row as TripRow);
  return { trip: await getTrip(id), paid: true };
}

export async function sendFinalEmails(t: TripRow) {
  const errors: string[] = [];
  for (const [label, mail] of [["owner-final", () => ownerFinalEmail(t)], ["customer-final", () => customerFinalEmail(t)]] as const) {
    try { const r = await sendEmail(mail()); if (!r.ok) errors.push(`${label}: ${r.error}`); }
    catch (e: any) { errors.push(`${label}: ${e?.message}`); }
  }
  return recordEmailResult(t.internal_id, errors);
}

/* ─────────────────────────── Settings ─────────────────────────── */

export async function getSetting(key: string, fallback: string) {
  try {
    const [row] = await db()`SELECT value FROM site_settings WHERE key = ${key}`;
    return (row?.value as string) || fallback;
  } catch { return fallback; }
}
export async function setSetting(key: string, value: string) {
  await db()`INSERT INTO site_settings (key, value) VALUES (${key}, ${value})
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`;
}
