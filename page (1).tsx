import Link from "next/link";
import { requireAdmin } from "@/lib/admin-guard";
import { db } from "@/lib/db";
import { TRIP_STATUSES } from "@/lib/options";
import { shortDates, budgetLine } from "@/lib/format";
import { AdminBar } from "./AdminBar";

export const dynamic = "force-dynamic";

export default async function AdminHome({ searchParams }: { searchParams: { status?: string; q?: string } }) {
  await requireAdmin();
  const status = searchParams.status && (TRIP_STATUSES as readonly string[]).includes(searchParams.status) ? searchParams.status : null;
  const showAll = searchParams.status === "ALL";
  const q = (searchParams.q || "").trim().slice(0, 100);
  const sql = db();
  const rows = await sql`
    SELECT * FROM trip_requests
    WHERE ${status ? sql`trip_status = ${status}` : showAll ? sql`true` : sql`trip_status NOT IN ('PENDING_PAYMENT','CANCELLED','DELIVERED')`}
    ${q ? sql`AND (public_trip_id ILIKE ${"%" + q + "%"} OR email ILIKE ${"%" + q + "%"} OR (first_name || ' ' || last_name) ILIKE ${"%" + q + "%"})` : sql``}
    ORDER BY created_at DESC LIMIT 300`;
  const counts = await sql`SELECT trip_status, count(*)::int AS n FROM trip_requests GROUP BY trip_status`;
  const c = Object.fromEntries(counts.map((r) => [r.trip_status, r.n]));
  const emailErrors = rows.filter((r) => r.email_delivery_status === "EMAIL_DELIVERY_ERROR").length;

  return (
    <>
      <AdminBar />
      <main>
        <div className="row" style={{ justifyContent: "space-between" }}>
          <h1 className="d3">{status ? status.replace(/_/g, " ") : showAll ? "All trips" : "Active trips"} <span className="muted">({rows.length})</span></h1>
          <form className="row"><input className="input" name="q" defaultValue={q} placeholder="Trip ID, name or email" style={{ width: 260, minHeight: 42, padding: "8px 12px" }} /><button className="btn btn-ghost" style={{ minHeight: 42, padding: "8px 16px" }}>SEARCH</button></form>
        </div>
        {emailErrors > 0 && <div className="alert alert-err" role="alert">{emailErrors} trip(s) have EMAIL_DELIVERY_ERROR. Open them to resend.</div>}
        <nav className="filters" aria-label="Filter by status">
          <Link href="/admin" aria-current={!status && !showAll}>ACTIVE</Link>
          <Link href="/admin?status=NEW" aria-current={status === "NEW"}>NEW TRIPS ({c.NEW || 0})</Link>
          {TRIP_STATUSES.filter((s) => s !== "NEW").map((s) => <Link key={s} href={`/admin?status=${s}`} aria-current={status === s}>{s.replace(/_/g, " ")} ({c[s] || 0})</Link>)}
          <Link href="/admin?status=ALL" aria-current={showAll}>ALL</Link>
        </nav>
        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr><th>TRIP ID</th><th>CUSTOMER</th><th>DATES</th><th>DESTINATION IDEAS</th><th>BUDGET</th><th>STATUS</th><th>PAYMENT</th><th>EMAIL</th><th>CREATED</th></tr></thead>
            <tbody>
              {rows.length === 0 && <tr><td colSpan={9} className="muted">No trips here yet.</td></tr>}
              {rows.map((t) => (
                <tr key={t.internal_id}>
                  <td><Link href={`/admin/trips/${t.internal_id}`}>{t.public_trip_id || "— pending —"}</Link></td>
                  <td>{t.first_name} {t.last_name}<br /><span className="muted">{t.email}</span></td>
                  <td>{shortDates(t)}<br /><span className="muted">{t.trip_length}</span></td>
                  <td style={{ maxWidth: 260 }}>{(t.must_visit || "").slice(0, 90) || <span className="muted">{(t.landscapes || []).join(", ")}</span>}</td>
                  <td>{budgetLine(t)}</td>
                  <td><span className={`badge ${t.trip_status === "PENDING_PAYMENT" ? "gray" : ""}`}>{t.trip_status}</span></td>
                  <td><span className={`badge ${t.deposit_status === "PAID" ? "ok" : "gray"}`}>$49 {t.deposit_status}</span><br /><span className={`badge ${t.final_payment_status === "PAID" ? "ok" : "gray"}`} style={{ marginTop: 4 }}>$150 {t.final_payment_status}</span></td>
                  <td><span className={`badge ${t.email_delivery_status === "EMAIL_DELIVERY_ERROR" ? "err" : t.email_delivery_status === "SENT" ? "ok" : "gray"}`}>{t.email_delivery_status}</span></td>
                  <td className="muted">{new Date(t.created_at).toLocaleDateString("en-US")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}
