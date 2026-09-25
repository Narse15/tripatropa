import { requireAdmin } from "@/lib/admin-guard";
import { getSetting } from "@/lib/trips";
import { config } from "@/lib/config";
import { AdminBar } from "../AdminBar";
import { saveTurnaround } from "../actions";
export const dynamic = "force-dynamic";

export default async function Settings({ searchParams }: { searchParams: { m?: string } }) {
  await requireAdmin();
  const turnaround = await getSetting("turnaround_message", "[OWNER TO SET]");
  const env: [string, string, boolean][] = [
    ["DATABASE_URL", "Database", !!process.env.DATABASE_URL], ["STRIPE_SECRET_KEY", "Stripe payments", !!process.env.STRIPE_SECRET_KEY],
    ["STRIPE_WEBHOOK_SECRET", "Stripe webhook verification", !!process.env.STRIPE_WEBHOOK_SECRET], ["RESEND_API_KEY", "Email sending", !!process.env.RESEND_API_KEY],
    ["TRIPATROP_FROM_EMAIL", "Email sender", !!process.env.TRIPATROP_FROM_EMAIL], ["TRIPATROP_OWNER_EMAIL", "Owner notifications", !!process.env.TRIPATROP_OWNER_EMAIL],
    ["TRIPATROP_SUPPORT_EMAIL", "Support email", !!process.env.TRIPATROP_SUPPORT_EMAIL], ["TRIPATROP_LEGAL_NAME", "Legal business name", !!process.env.TRIPATROP_LEGAL_NAME && !process.env.TRIPATROP_LEGAL_NAME.startsWith("[")],
    ["NEXT_PUBLIC_SITE_URL", "Public site URL", !!process.env.NEXT_PUBLIC_SITE_URL],
  ];
  return (<><AdminBar /><main style={{ maxWidth: 820 }}>
    <h1 className="d3" style={{ marginBottom: 20 }}>Settings</h1>
    {searchParams.m && <div className="alert alert-ok" role="status">Saved.</div>}
    <section className="panel"><h2>TURNAROUND MESSAGE</h2>
      <p className="fine">Shown in the FAQ as &ldquo;Current turnaround: …&rdquo;. Don&apos;t promise what you can&apos;t guarantee.</p>
      <form action={saveTurnaround} className="row"><input className="input" name="turnaround" defaultValue={turnaround} style={{ flex: 1 }} placeholder="Trip directions usually within 5–7 business days" /><button className="btn btn-primary">SAVE</button></form>
    </section>
    <section className="panel"><h2>LAUNCH CHECKLIST — ENVIRONMENT</h2>
      <table className="tbl" style={{ minWidth: 0 }}><tbody>{env.map(([k, label, ok]) => <tr key={k}><td><code>{k}</code></td><td>{label}</td><td><span className={`badge ${ok ? "ok" : "err"}`}>{ok ? "SET" : "MISSING"}</span></td></tr>)}</tbody></table>
      <p className="fine" style={{ marginTop: 12 }}>Draft notes on public pages: <strong>{config.showDraftNotes() ? "VISIBLE" : "hidden"}</strong> (NEXT_PUBLIC_SHOW_DRAFT_NOTES).</p>
    </section>
  </main></>);
}
