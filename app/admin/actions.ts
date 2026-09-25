"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin-guard";
import { db } from "@/lib/db";
import { TRIP_STATUSES } from "@/lib/options";
import { getTrip, enableFinalPayment, disableFinalPayment, sendDepositEmails, sendFinalEmails, sendFinalLinkEmail, setSetting } from "@/lib/trips";

const idOf = (f: FormData) => { const id = String(f.get("id") || ""); if (!/^[0-9a-f-]{36}$/i.test(id)) throw new Error("Bad id"); return id; };
const back = (id: string, msg: string): never => { revalidatePath(`/admin/trips/${id}`); revalidatePath("/admin"); redirect(`/admin/trips/${id}?m=${encodeURIComponent(msg)}`); };

export async function updateStatus(f: FormData) {
  await requireAdmin(); const id = idOf(f); const status = String(f.get("status"));
  if (!(TRIP_STATUSES as readonly string[]).includes(status)) throw new Error("Bad status");
  await db()`UPDATE trip_requests SET trip_status = ${status}, updated_at = now() WHERE internal_id = ${id}`;
  back(id, `Status set to ${status}.`);
}
export async function saveNotes(f: FormData) {
  await requireAdmin(); const id = idOf(f);
  await db()`UPDATE trip_requests SET internal_notes = ${String(f.get("notes") || "").slice(0, 20000)}, updated_at = now() WHERE internal_id = ${id}`;
  back(id, "Notes saved.");
}
export async function saveConcept(f: FormData) {
  await requireAdmin(); const id = idOf(f);
  await db()`UPDATE trip_requests SET selected_concept = ${String(f.get("concept") || "").trim().slice(0, 300) || null}, updated_at = now() WHERE internal_id = ${id}`;
  back(id, "Selected concept saved.");
}
export async function enableFinal(f: FormData) {
  await requireAdmin(); const id = idOf(f);
  const concept = String(f.get("concept") || "").trim().slice(0, 300);
  if (!concept) back(id, "Add the selected trip concept first.");
  const t = await enableFinalPayment(id, concept);
  if (!t) back(id, "Can't enable: deposit must be PAID and final payment not already paid.");
  if (f.get("email") === "on") {
    const err = await sendFinalLinkEmail(t!);
    back(id, err ? `Link created, but email failed: ${err}` : "Secure link created and emailed to the customer.");
  }
  back(id, "Secure final-payment link created.");
}
export async function disableFinal(f: FormData) {
  await requireAdmin(); const id = idOf(f); await disableFinalPayment(id); back(id, "Final-payment link disabled.");
}
export async function emailFinalLink(f: FormData) {
  await requireAdmin(); const id = idOf(f); const t = await getTrip(id);
  if (!t?.final_payment_token || !t.final_payment_eligible) back(id, "No active final-payment link.");
  const err = await sendFinalLinkEmail(t!); back(id, err ? `Email failed: ${err}` : "Final-payment link emailed.");
}
export async function resendEmails(f: FormData) {
  await requireAdmin(); const id = idOf(f); const t = await getTrip(id);
  if (!t) back(id, "Trip not found.");
  const kind = String(f.get("kind"));
  if (kind === "deposit" && t!.deposit_status === "PAID") { const s = await sendDepositEmails(t!); back(id, s === "SENT" ? "Deposit emails re-sent." : "Resend failed — see error."); }
  if (kind === "final" && t!.final_payment_status === "PAID") { const s = await sendFinalEmails(t!); back(id, s === "SENT" ? "Final-payment emails re-sent." : "Resend failed — see error."); }
  back(id, "Nothing to resend for that payment.");
}
export async function saveTurnaround(f: FormData) {
  await requireAdmin();
  await setSetting("turnaround_message", String(f.get("turnaround") || "").trim().slice(0, 200) || "[OWNER TO SET]");
  revalidatePath("/faq"); revalidatePath("/"); redirect("/admin/settings?m=saved");
}
export async function toggleMessage(f: FormData) {
  await requireAdmin(); const id = idOf(f);
  await db()`UPDATE contact_messages SET handled = NOT handled WHERE id = ${id}`;
  revalidatePath("/admin/messages");
}
