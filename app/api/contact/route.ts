import { NextRequest, NextResponse } from "next/server";
import { contactSchema } from "@/lib/validation";
import { isSameOrigin, rateLimit, clientIp } from "@/lib/security";
import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { ownerContactEmail, customerContactEmail } from "@/lib/emails";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  if (!rateLimit(`contact:${clientIp(req)}`, 5, 10 * 60_000)) return NextResponse.json({ error: "Too many messages. Please wait a few minutes." }, { status: 429 });
  const parsed = contactSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Please check the highlighted fields.", fields: parsed.error.issues.map((i) => ({ path: i.path.join("."), message: i.message })) }, { status: 400 });
  const m = parsed.data;
  if (m.website) return NextResponse.json({ ok: true }); // honeypot: silently accept

  let id: string | null = null;
  const created_at = new Date();
  try {
    const [row] = await db()`INSERT INTO contact_messages (name, email, trip_id, subject, message) VALUES (${m.name}, ${m.email}, ${m.tripId ?? null}, ${m.subject}, ${m.message}) RETURNING id`;
    id = row.id;
  } catch (e) { console.error("[contact] db insert failed", e); }

  const owner = await sendEmail(ownerContactEmail({ ...m, created_at })).catch((e) => ({ ok: false as const, error: String(e) }));
  if (!owner.ok && !id) return NextResponse.json({ error: "Your message didn't send. Please try again, or email us directly." }, { status: 502 });
  await sendEmail(customerContactEmail(m)).catch(() => null);
  if (id) await db()`UPDATE contact_messages SET email_delivery_status = ${owner.ok ? "SENT" : "EMAIL_DELIVERY_ERROR"} WHERE id = ${id}`.catch(() => null);
  return NextResponse.json({ ok: true });
}
