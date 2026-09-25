# TRIPATROP — We plan. You go.

Production website for TRIPATROP: personalized European trip planning for US travelers.

**Stack:** Next.js 14 (App Router, TypeScript) · PostgreSQL · Stripe Checkout (hosted) · Resend (transactional email) · deploys to Vercel.

## What works end to end

questionnaire → database (`PENDING_PAYMENT`) → $49 Stripe Checkout → server-side verification (webhook **and** success page, idempotent) → `NEW` + Trip ID `TT-YYMMDD-NNNN` → owner email with every answer → customer confirmation → admin tracking → owner creates secure `/continue/[token]` link → $150 Stripe Checkout → `FINAL_RESEARCH` → owner + customer emails.

No card data ever touches this server. No paid-client email is sent before Stripe confirms payment. If email fails after a payment, the customer still sees success and the trip is flagged `EMAIL_DELIVERY_ERROR` with a Resend button in admin.

---

## Launch checklist

### 1. Database (≈5 min)
1. Create a Postgres database on **Neon** (neon.tech) or **Supabase**. Copy the connection string (with `?sslmode=require`).
2. Locally: `cp .env.example .env.local`, set `DATABASE_URL`, then:
   ```bash
   npm install
   npm run db:migrate
   ```
   The migration is safe to re-run.

### 2. Stripe (≈10 min)
1. Stripe Dashboard → Developers → API keys → copy the **Secret key** → `STRIPE_SECRET_KEY` (use `sk_test_…` first, `sk_live_…` at launch).
2. Developers → Webhooks → **Add endpoint**: `https://YOUR-DOMAIN/api/stripe/webhook`
   Events: `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`, `checkout.session.expired`.
   Copy the **Signing secret** → `STRIPE_WEBHOOK_SECRET`.
3. No products need to be created in Stripe — amounts come from `TRIPATROP_DEPOSIT_CENTS` / `TRIPATROP_FINAL_CENTS`.
4. Test with card `4242 4242 4242 4242`, any future date, any CVC. Test failure with `4000 0000 0000 0002`.
5. Local webhook testing: `stripe listen --forward-to localhost:3000/api/stripe/webhook`.

### 3. Email — Resend (≈10 min + DNS wait)
1. resend.com → Domains → add your domain, add the DNS records it shows, wait for **Verified**.
2. API Keys → create → `RESEND_API_KEY`.
3. `TRIPATROP_FROM_EMAIL="TRIPATROP <hello@yourdomain.com>"` (must be on the verified domain).

### 4. Deploy to Vercel
1. Push this folder to a GitHub repo → vercel.com → **Import**.
2. Add **every** variable from `.env.example` in Project → Settings → Environment Variables. Set `NEXT_PUBLIC_SITE_URL` to your real domain (`https://tripatrop.com`, no trailing slash).
3. Deploy. Then update the Stripe webhook URL if the domain changed.
4. Go to `/admin` → **Settings** → the checklist shows which variables are still missing.

### 5. Before accepting real customers
- [ ] Set the turnaround message in `/admin/settings` (FAQ shows `[OWNER TO SET]` until then).
- [ ] Complete **Terms**, **Privacy**, **Refund Policy** (`app/(site)/terms|privacy|refund-policy/page.tsx`). Every orange marker is an owner decision. Have a lawyer review them.
- [ ] Replace the FAQ answer "Is the $49 refundable?" (`lib/faq.tsx`) with your reviewed policy.
- [ ] Decide on affiliate links and disclose them if used.
- [ ] Set `TRIPATROP_LEGAL_NAME`, `TRIPATROP_BUSINESS_ADDRESS`, `TRIPATROP_JURISDICTION`.
- [ ] Add photography (below).
- [ ] Set `NEXT_PUBLIC_SHOW_DRAFT_NOTES=false` to hide the orange owner notes.
- [ ] Switch Stripe to live keys + create the live webhook endpoint.
- [ ] Do one real $49 payment on your own card and refund it from Stripe.

---

## Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | ✓ | Public URL for Stripe redirects + email links |
| `DATABASE_URL` | ✓ | Postgres connection string |
| `STRIPE_SECRET_KEY` | ✓ | Server-only Stripe key |
| `STRIPE_WEBHOOK_SECRET` | ✓ | Verifies webhook signatures |
| `RESEND_API_KEY` | ✓ | Sends email |
| `TRIPATROP_FROM_EMAIL` | ✓ | Sender address (verified domain) |
| `TRIPATROP_OWNER_EMAIL` | ✓ | Receives NEW TRIP / FINAL PAYMENT notifications |
| `TRIPATROP_SUPPORT_EMAIL` | ✓ | Shown on site, receives contact form |
| `TRIPATROP_PRIVACY_EMAIL` | | Privacy requests |
| `TRIPATROP_LEGAL_NAME` / `_BUSINESS_ADDRESS` / `_JURISDICTION` | before launch | Legal pages + footer |
| `ADMIN_PASSWORD` | ✓ | `/admin` login |
| `ADMIN_SESSION_SECRET` | ✓ | Signs admin cookie (`openssl rand -hex 32`) |
| `TRIPATROP_DEPOSIT_CENTS` / `TRIPATROP_FINAL_CENTS` | | Default 4900 / 15000 |
| `FINAL_LINK_TTL_DAYS` | | Default 30 |
| `NEXT_PUBLIC_INSTAGRAM_URL` / `NEXT_PUBLIC_TIKTOK_URL` | | Footer links |
| `NEXT_PUBLIC_ANALYTICS_PROVIDER` | | `plausible` or `ga4` |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` / `NEXT_PUBLIC_GA4_ID` | | Analytics IDs |
| `NEXT_PUBLIC_SHOW_DRAFT_NOTES` | | `false` hides owner notes |

`STRIPE_API_BASE` and `RESEND_API_URL` exist **only** for the local test suite. Never set them in production.

---

## Daily use (owner)

1. New paid trip → email **NEW TRIP • TT-… • Name • Destination • Dates**. Click **OPEN TRIP REQUEST**.
2. `/admin` → change status as you work (RESEARCHING → CONCEPTS_SENT → …), keep internal notes.
3. Send the three directions by email from your own inbox (reply to the customer, keep the Trip ID in the subject).
4. When they choose: open the trip → type the **selected concept** → **MARK ELIGIBLE & CREATE LINK** (tick "email the link"). Status becomes AWAITING_FINAL_PAYMENT.
5. They pay $150 → you get **FINAL PAYMENT • TT-… • Name**, status becomes FINAL_RESEARCH automatically.
6. Deliver the plan, set FINAL_READY → DELIVERED.

Refunds are issued from the Stripe Dashboard; then set the trip to CANCELLED and note it.

## Photography

Photos are mapped in `lib/photos.ts`. Put licensed images in `public/photos/` and set `src: "/photos/xyz.jpg"`. Until then an illustrated postcard is shown. Images are automatically optimized and lazy-loaded.

## Analytics events

`homepage_view, build_trip_clicked, quiz_started, quiz_question_completed, quiz_completed, checkout_started, deposit_payment_success, deposit_payment_failed, contact_submitted, faq_opened, final_checkout_started, final_payment_success` — sent to Plausible, GA4 and/or `dataLayer` (GTM). No names, emails, free text or payment data are sent.

## Security notes

- Stripe hosted Checkout; payment verified server-side by retrieving the session from Stripe (amount, currency, status).
- Webhook signature verification + event de-duplication table.
- Same-origin checks on POST endpoints; admin server actions have Next.js built-in origin protection; admin cookie is HttpOnly, SameSite=Strict, HMAC-signed.
- zod validation + honeypot on every form; HTML-escaped emails.
- Final-payment links use 256-bit random tokens with expiry; the Trip ID alone never authorizes payment.
- **Rate limiting** is in-memory. On Vercel each instance has its own memory, so it's a soft limit. For stronger protection, swap `lib/security.ts → rateLimit` for Upstash Redis.

## Local test suite

Requires a local Postgres. Starts mock Stripe/Resend servers and runs 32 checks across the whole payment flow:
```bash
node scripts/e2e/mock.mjs &          # port 4010
# .env.local with DATABASE_URL, STRIPE_API_BASE=http://localhost:4010, RESEND_API_URL=http://localhost:4010/emails,
# STRIPE_WEBHOOK_SECRET=whsec_testsecret, NEXT_PUBLIC_SITE_URL=http://localhost:3100, ADMIN_PASSWORD=testpass123
npm run build && npx next start -p 3100 &
DATABASE_URL=... node scripts/e2e/flow.mjs
```

## Project map

```
app/(site)/…            public pages (home, pricing, faq, contact, legal, trip-started, payment-failed, continue/[token], final-started)
app/build-my-trip/      the 17-step questionnaire + review
app/api/…               trips, checkout/retry, stripe/webhook, final-checkout, contact, admin login/logout
app/admin/…             owner dashboard + server actions
lib/trips.ts            all payment/state logic
lib/emails.ts           every email template
lib/faq.tsx             FAQ copy
db/schema.sql           database schema
```
