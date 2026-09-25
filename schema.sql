-- TRIPATROP database schema (PostgreSQL). Safe to run repeatedly.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS trip_requests (
  internal_id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  public_trip_id           text UNIQUE,
  resume_token             text NOT NULL,
  created_at               timestamptz NOT NULL DEFAULT now(),
  updated_at               timestamptz NOT NULL DEFAULT now(),

  first_name               text NOT NULL,
  last_name                text NOT NULL,
  email                    text NOT NULL,
  phone                    text,

  departure_city           text NOT NULL,
  departure_airport        text,
  date_type                text NOT NULL CHECK (date_type IN ('EXACT','FLEXIBLE')),
  departure_date           date,
  return_date              date,
  flexible_month           text,
  flexible_dates           text,
  traveler_type            text NOT NULL,
  traveler_count           integer NOT NULL,
  child_ages               text,
  trip_length              text NOT NULL,

  budget_amount            integer NOT NULL,
  budget_type              text NOT NULL CHECK (budget_type IN ('PER_PERSON','TOTAL')),
  flights_in_budget        text NOT NULL CHECK (flights_in_budget IN ('YES','NO','NOT_SURE')),

  landscapes               text[] NOT NULL DEFAULT '{}',
  vibes                    text[] NOT NULL DEFAULT '{}',
  trip_structure           text NOT NULL,
  pace                     text NOT NULL,
  iconic_local_score       integer NOT NULL,
  accommodation_level      text NOT NULL,
  property_types           text[] NOT NULL DEFAULT '{}',
  transport_preferences    text[] NOT NULL DEFAULT '{}',
  drive_europe             text NOT NULL,

  must_visit               text,
  dream_experience         text,
  avoid                    text,
  additional_notes         text,

  terms_accepted_at        timestamptz NOT NULL,
  service_acknowledgment_at timestamptz NOT NULL,
  marketing_consent        boolean NOT NULL DEFAULT false,

  deposit_status           text NOT NULL DEFAULT 'UNPAID' CHECK (deposit_status IN ('UNPAID','PAID','REFUNDED')),
  deposit_session_id       text,
  deposit_payment_id       text,
  deposit_amount_cents     integer,
  deposit_paid_at          timestamptz,

  selected_concept         text,
  final_payment_eligible   boolean NOT NULL DEFAULT false,
  final_payment_token      text UNIQUE,
  final_token_expires_at   timestamptz,
  final_payment_status     text NOT NULL DEFAULT 'NOT_DUE' CHECK (final_payment_status IN ('NOT_DUE','AWAITING','PAID','REFUNDED')),
  final_session_id         text,
  final_payment_id         text,
  final_amount_cents       integer,
  final_paid_at            timestamptz,

  trip_status              text NOT NULL DEFAULT 'PENDING_PAYMENT' CHECK (trip_status IN (
    'PENDING_PAYMENT','NEW','RESEARCHING','CONCEPTS_SENT','REVISION_REQUESTED','AWAITING_SELECTION',
    'AWAITING_FINAL_PAYMENT','FINAL_RESEARCH','FINAL_READY','DELIVERED','CANCELLED')),
  email_delivery_status    text NOT NULL DEFAULT 'NONE' CHECK (email_delivery_status IN ('NONE','SENT','EMAIL_DELIVERY_ERROR')),
  email_error_detail       text,
  internal_notes           text
);
CREATE INDEX IF NOT EXISTS trip_requests_status_idx ON trip_requests (trip_status, created_at DESC);
CREATE INDEX IF NOT EXISTS trip_requests_email_idx ON trip_requests (lower(email));

CREATE TABLE IF NOT EXISTS contact_messages (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at   timestamptz NOT NULL DEFAULT now(),
  name         text NOT NULL,
  email        text NOT NULL,
  trip_id      text,
  subject      text NOT NULL,
  message      text NOT NULL,
  email_delivery_status text NOT NULL DEFAULT 'NONE',
  handled      boolean NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS site_settings (
  key        text PRIMARY KEY,
  value      text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
INSERT INTO site_settings (key, value) VALUES ('turnaround_message', '[OWNER TO SET]') ON CONFLICT (key) DO NOTHING;

-- Processed Stripe events (webhook idempotency)
CREATE TABLE IF NOT EXISTS stripe_events (
  id         text PRIMARY KEY,
  type       text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
