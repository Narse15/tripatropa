import Image from "next/image";
const MSG: Record<string, string> = { bad: "Wrong password.", rate: "Too many attempts. Wait 15 minutes.", config: "ADMIN_PASSWORD / ADMIN_SESSION_SECRET are not set.", origin: "Invalid request origin." };
export default function Login({ searchParams }: { searchParams: { e?: string } }) {
  return (
    <main style={{ maxWidth: 420, margin: "0 auto", padding: "15vh 24px" }}>
      <Image src="/logo-wordmark.png" alt="tripatrop" width={900} height={198} style={{ height: 34, width: "auto", marginBottom: 32 }} />
      <h1 className="d3" style={{ marginBottom: 20 }}>Owner login</h1>
      {searchParams.e && <div className="alert alert-err" role="alert">{MSG[searchParams.e] || "Login failed."}</div>}
      <form action="/api/admin/login" method="post">
        <label className="field"><span>Password</span><input type="password" name="password" autoComplete="current-password" required /></label>
        <button className="btn btn-primary btn-block">LOG IN</button>
      </form>
    </main>
  );
}
