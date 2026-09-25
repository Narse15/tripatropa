import Link from "next/link";
import Image from "next/image";
export function AdminBar() {
  return (
    <div className="admin-bar">
      <Link href="/admin"><Image src="/logo-wordmark.png" alt="tripatrop" width={900} height={198} style={{ height: 22, width: "auto" }} /></Link>
      <nav aria-label="Admin"><Link href="/admin">TRIPS</Link><Link href="/admin/messages">MESSAGES</Link><Link href="/admin/settings">SETTINGS</Link><Link href="/" target="_blank">VIEW SITE ↗</Link></nav>
      <form action="/api/admin/logout" method="post"><button className="btn btn-ghost" style={{ padding: "8px 14px", minHeight: 36, fontSize: ".75rem" }}>LOG OUT</button></form>
    </div>
  );
}
