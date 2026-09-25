import { requireAdmin } from "@/lib/admin-guard";
import { db } from "@/lib/db";
import { stamp } from "@/lib/format";
import { AdminBar } from "../AdminBar";
import { toggleMessage } from "../actions";
export const dynamic = "force-dynamic";

export default async function Messages() {
  await requireAdmin();
  const rows = await db()`SELECT * FROM contact_messages ORDER BY handled ASC, created_at DESC LIMIT 200`;
  return (<><AdminBar /><main>
    <h1 className="d3" style={{ marginBottom: 20 }}>Messages</h1>
    {rows.length === 0 && <p className="muted">No messages yet.</p>}
    {rows.map((m) => (
      <section className="panel" key={m.id} style={{ opacity: m.handled ? .6 : 1 }}>
        <div className="row" style={{ justifyContent: "space-between" }}>
          <strong>{m.subject}</strong>
          <span className="muted">{stamp(m.created_at)}</span>
        </div>
        <p className="muted" style={{ margin: "6px 0 10px" }}>{m.name} · <a className="link" href={`mailto:${m.email}?subject=${encodeURIComponent("Re: " + m.subject)}`}>{m.email}</a>{m.trip_id ? ` · ${m.trip_id}` : ""} · <span className={`badge ${m.email_delivery_status === "SENT" ? "ok" : "err"}`}>{m.email_delivery_status}</span></p>
        <p style={{ whiteSpace: "pre-line" }}>{m.message}</p>
        <form action={toggleMessage}><input type="hidden" name="id" value={m.id} /><button className="btn btn-ghost" style={{ minHeight: 36, padding: "6px 14px", fontSize: ".75rem" }}>{m.handled ? "MARK UNHANDLED" : "MARK HANDLED"}</button></form>
      </section>
    ))}
  </main></>);
}
