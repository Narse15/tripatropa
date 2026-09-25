// Central access to environment configuration. Nothing business-specific is hard-coded.
function req(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing environment variable ${name}. See .env.example.`);
  return v;
}
const opt = (name: string, fallback = "") => process.env[name] || fallback;

export const config = {
  siteUrl: () => opt("NEXT_PUBLIC_SITE_URL", "http://localhost:3000").replace(/\/$/, ""),
  databaseUrl: () => req("DATABASE_URL"),
  stripeSecret: () => req("STRIPE_SECRET_KEY"),
  stripeWebhookSecret: () => req("STRIPE_WEBHOOK_SECRET"),
  depositCents: () => parseInt(opt("TRIPATROP_DEPOSIT_CENTS", "4900"), 10),
  finalCents: () => parseInt(opt("TRIPATROP_FINAL_CENTS", "15000"), 10),
  resendKey: () => req("RESEND_API_KEY"),
  fromEmail: () => req("TRIPATROP_FROM_EMAIL"),
  ownerEmail: () => req("TRIPATROP_OWNER_EMAIL"),
  supportEmail: () => opt("TRIPATROP_SUPPORT_EMAIL", "[SUPPORT EMAIL]"),
  privacyEmail: () => opt("TRIPATROP_PRIVACY_EMAIL", "[PRIVACY EMAIL]"),
  legalName: () => opt("TRIPATROP_LEGAL_NAME", "[LEGAL BUSINESS NAME]"),
  businessAddress: () => opt("TRIPATROP_BUSINESS_ADDRESS", "[BUSINESS ADDRESS]"),
  jurisdiction: () => opt("TRIPATROP_JURISDICTION", "[JURISDICTION]"),
  adminPassword: () => req("ADMIN_PASSWORD"),
  adminSecret: () => req("ADMIN_SESSION_SECRET"),
  finalLinkTtlDays: () => parseInt(opt("FINAL_LINK_TTL_DAYS", "30"), 10),
  instagram: () => opt("NEXT_PUBLIC_INSTAGRAM_URL", "#"),
  tiktok: () => opt("NEXT_PUBLIC_TIKTOK_URL", "#"),
  showDraftNotes: () => opt("NEXT_PUBLIC_SHOW_DRAFT_NOTES", "true") !== "false",
};

export const money = (cents: number) =>
  `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: cents % 100 ? 2 : 0 })}`;
