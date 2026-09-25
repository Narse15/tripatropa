import { config } from "./config";

export type Mail = { to: string; subject: string; html: string; text: string; replyTo?: string };

/** Sends via Resend's REST API. Returns ok=false instead of throwing so callers can flag errors. */
export async function sendEmail(m: Mail): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  try {
    // RESEND_API_URL is only for local tests. Leave unset in production.
    const res = await fetch(process.env.RESEND_API_URL || "https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${config.resendKey()}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: config.fromEmail(), to: [m.to], subject: m.subject, html: m.html, text: m.text, reply_to: m.replyTo }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: `Resend ${res.status}: ${body?.message || "unknown error"}` };
    return { ok: true, id: body.id };
  } catch (e: any) {
    return { ok: false, error: e?.message || "Email send failed" };
  }
}
