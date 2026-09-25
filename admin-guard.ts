import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, verifySession } from "./admin-session";

/** Call at the top of every admin page and server action. */
export async function requireAdmin() {
  const ok = await verifySession(process.env.ADMIN_SESSION_SECRET, cookies().get(ADMIN_COOKIE)?.value);
  if (!ok) redirect("/admin/login");
}
