import Stripe from "stripe";
import postgres from "postgres";
const APP = "http://localhost:3100", MOCK = "http://localhost:4010";
const sql = postgres(process.env.DATABASE_URL, { onnotice: () => {} });
const stripe = new Stripe("sk_test_mock");
const H = { "Content-Type": "application/json", Origin: APP };
const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) process.exitCode = 1; };
const trip = {
  departureCity: "Atlanta, GA", departureAirport: "ATL", dateType: "EXACT", departureDate: "2027-06-08", returnDate: "2027-06-18",
  travelerType: "Couple", travelerCount: 2, tripLength: "11 days", budgetAmount: 3000, budgetType: "PER_PERSON", flightsInBudget: "YES",
  landscapes: ["BEACHES", "BIG CITIES"], vibes: ["FOOD", "NIGHTLIFE"], tripStructure: "A FEW STOPS", pace: "BALANCED", iconicLocalScore: 70,
  accommodationLevel: "Boutique", propertyTypes: ["Hotel"], transportPreferences: ["TRAIN"], driveEurope: "NO",
  mustVisit: "Italy is a must. <script>alert(1)</script>", dreamExperience: "Seeing my favorite football club.", avoid: "No 6 AM wakeups.", additionalNotes: "",
  firstName: "Sarah", lastName: "Miller", email: "Sarah@Example.com", phone: "", termsAccepted: true, serviceAcknowledged: true, marketingConsent: false,
};
const webhook = async (session, id = "evt_" + Math.random().toString(36).slice(2)) => {
  const payload = JSON.stringify({ id, object: "event", type: "checkout.session.completed", data: { object: session } });
  const sig = stripe.webhooks.generateTestHeaderString({ payload, secret: "whsec_testsecret" });
  const r = await fetch(APP + "/api/stripe/webhook", { method: "POST", headers: { "stripe-signature": sig, "Content-Type": "application/json" }, body: payload });
  return { status: r.status, body: await r.json(), id };
};
const emails = async () => (await (await fetch(MOCK + "/__emails")).json());

// Security / validation
ok((await fetch(APP + "/api/trips", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(trip) })).status === 403, "rejects cross-origin POST (CSRF)");
let r = await fetch(APP + "/api/trips", { method: "POST", headers: H, body: JSON.stringify({ ...trip, email: "nope", termsAccepted: false }) });
ok(r.status === 400 && (await r.json()).fields.length >= 2, "validation errors returned for bad email + missing consent");
r = await fetch(APP + "/api/trips", { method: "POST", headers: H, body: JSON.stringify({ ...trip, returnDate: "2027-06-01" }) });
ok(r.status === 400, "rejects return date before departure");

// 1. Submit questionnaire
r = await fetch(APP + "/api/trips", { method: "POST", headers: H, body: JSON.stringify(trip) });
const { url } = await r.json();
ok(r.status === 200 && url?.includes("checkout.mock"), "questionnaire → pending trip → hosted checkout URL");
const sid = url.split("/").pop();
let [row] = await sql`SELECT * FROM trip_requests WHERE deposit_session_id = ${sid}`;
ok(row.trip_status === "PENDING_PAYMENT" && row.public_trip_id === null && row.email === "sarah@example.com", "row is PENDING_PAYMENT, no Trip ID yet");
ok((await emails()).length === 0, "no emails before payment");

// 2. Success page before payment is verified
let html = await (await fetch(`${APP}/trip-started?session_id=${sid}`)).text();
ok(html.includes("Almost there") && !html.includes("TT-"), "success page does not confirm unpaid session");
[row] = await sql`SELECT trip_status FROM trip_requests WHERE deposit_session_id = ${sid}`;
ok(row.trip_status === "PENDING_PAYMENT", "still PENDING_PAYMENT");

// 3. Forged webhook signature
const bad = await fetch(APP + "/api/stripe/webhook", { method: "POST", headers: { "stripe-signature": "t=1,v1=bad" }, body: "{}" });
ok(bad.status === 400, "webhook rejects bad signature");

// 4. Pay + webhook
const paidSession = await (await fetch(`${MOCK}/__pay/${sid}`, { method: "POST" })).json();
const w = await webhook(paidSession);
ok(w.status === 200, "signed webhook accepted");
[row] = await sql`SELECT * FROM trip_requests WHERE deposit_session_id = ${sid}`;
ok(row.trip_status === "NEW" && row.deposit_status === "PAID" && /^TT-\d{6}-\d{4}$/.test(row.public_trip_id), `PAID → NEW with Trip ID ${row.public_trip_id}`);
let em = await emails();
ok(em.length === 2 && em[0].to === "owner@example.com" && em[0].subject.startsWith(`NEW TRIP • ${row.public_trip_id} • Sarah • Italy • Jun 8–18`), `owner email: "${em[0]?.subject}"`);
ok(em[1].to === "sarah@example.com" && em[1].subject === `We're building your Europe • TRIPATROP ${row.public_trip_id}`, `customer email: "${em[1]?.subject}"`);
ok(row.email_delivery_status === "SENT", "email_delivery_status = SENT");

// 5. Idempotency
const dup = await webhook(paidSession, w.id);
ok(dup.body.duplicate === true, "replayed webhook event ignored");
await webhook(paidSession); // new event id, same session
html = await (await fetch(`${APP}/trip-started?session_id=${sid}`)).text();
ok(html.includes(row.public_trip_id) && html.includes("PAID"), "success page shows Trip ID + $49 PAID");
ok((await emails()).length === 2, "no duplicate emails after repeated fulfilment");

// 6. Retry endpoint auth
r = await fetch(APP + "/api/checkout/retry", { method: "POST", headers: H, body: JSON.stringify({ r: row.internal_id, k: "wrong" }) });
ok(r.status === 404, "retry rejects wrong resume token");
r = await fetch(APP + "/api/checkout/retry", { method: "POST", headers: H, body: JSON.stringify({ r: row.internal_id, k: row.resume_token }) });
ok((await r.json()).alreadyPaid === true, "retry on a paid trip reports alreadyPaid (no double charge)");

// 7. Final payment
ok((await (await fetch(`${APP}/continue/${"x".repeat(43)}`)).text()).includes("isn&#x27;t valid anymore") , "invalid final link shows friendly error");
const token = "T".repeat(43);
await sql`UPDATE trip_requests SET selected_concept='Option A — Mediterranean Nights', final_payment_eligible=true, final_payment_token=${token}, final_token_expires_at=now()+interval '30 days', final_payment_status='AWAITING', trip_status='AWAITING_FINAL_PAYMENT' WHERE internal_id=${row.internal_id}`;
html = await (await fetch(`${APP}/continue/${token}`)).text();
ok(html.includes("Ready to build it?") && html.includes(row.public_trip_id) && html.includes("$150"), "secure /continue/[token] page renders trip + $150");
r = await fetch(APP + "/api/final-checkout", { method: "POST", headers: H, body: JSON.stringify({ token }) });
const fsid = (await r.json()).url.split("/").pop();
const fpaid = await (await fetch(`${MOCK}/__pay/${fsid}`, { method: "POST" })).json();
html = await (await fetch(`${APP}/final-started?session_id=${fsid}`)).text();
[row] = await sql`SELECT * FROM trip_requests WHERE internal_id = ${row.internal_id}`;
ok(row.final_payment_status === "PAID" && row.trip_status === "FINAL_RESEARCH" && html.includes("Let&#x27;s build it"), "verified $150 → final PAID, FINAL_RESEARCH");
em = await emails();
ok(em.length === 4 && em[2].subject === `FINAL PAYMENT • ${row.public_trip_id} • Sarah Miller` && em[3].subject === `Let's build it • TRIPATROP ${row.public_trip_id}`, "final owner + customer emails sent");
await webhook(fpaid);
ok((await emails()).length === 4, "final webhook after success page doesn't duplicate emails");
ok((await (await fetch(`${APP}/continue/${token}`)).text()).includes("valid anymore"), "used final link no longer valid");

// 8. Email outage after payment
await fetch(MOCK + "/__failemail", { method: "POST", body: "1" });
r = await fetch(APP + "/api/trips", { method: "POST", headers: H, body: JSON.stringify({ ...trip, firstName: "Jo", email: "jo@example.com", dateType: "FLEXIBLE", flexibleMonth: "July 2027", tripLength: "8–10 days" }) });
const sid2 = (await r.json()).url.split("/").pop();
await fetch(`${MOCK}/__pay/${sid2}`, { method: "POST" });
html = await (await fetch(`${APP}/trip-started?session_id=${sid2}`)).text();
const [row2] = await sql`SELECT * FROM trip_requests WHERE deposit_session_id = ${sid2}`;
ok(html.includes("We&#x27;re on it") && row2.deposit_status === "PAID" && row2.email_delivery_status === "EMAIL_DELIVERY_ERROR", "email outage: customer sees success, trip flagged EMAIL_DELIVERY_ERROR");
await fetch(MOCK + "/__failemail", { method: "POST", body: "0" });

// 9. Contact
r = await fetch(APP + "/api/contact", { method: "POST", headers: H, body: JSON.stringify({ name: "Sarah", email: "sarah@example.com", tripId: row.public_trip_id, subject: "Quick question", message: "Can we add Amsterdam?" }) });
em = await emails();
ok(r.status === 200 && em.at(-2).subject === "TRIPATROP CONTACT • Quick question • Sarah" && em.at(-1).subject.startsWith("We got your message"), "contact → support email + auto-reply");
const [cm] = await sql`SELECT * FROM contact_messages ORDER BY created_at DESC LIMIT 1`;
ok(cm?.trip_id === row.public_trip_id, "contact message saved in DB");

// 10. Admin
ok((await fetch(APP + "/admin", { redirect: "manual" })).status === 307, "admin requires login");
const lr = await fetch(APP + "/api/admin/login", { method: "POST", redirect: "manual", headers: { Origin: APP, "Content-Type": "application/x-www-form-urlencoded" }, body: "password=testpass123" });
const cookie = lr.headers.get("set-cookie").split(";")[0];
html = await (await fetch(APP + "/admin?status=ALL", { headers: { cookie } })).text();
ok(html.includes(row.public_trip_id) && html.includes("EMAIL_DELIVERY_ERROR"), "admin list shows trips + email error flag");
html = await (await fetch(`${APP}/admin/trips/${row2.internal_id}`, { headers: { cookie } })).text();
ok(html.includes("RESEND DEPOSIT EMAILS") && html.includes("MARK ELIGIBLE"), "admin trip page has resend + final-link controls");
ok(!html.includes("<script>alert"), "user input is escaped");
await sql.end();
