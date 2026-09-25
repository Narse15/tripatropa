// Edge + Node compatible signed admin session (HMAC-SHA256 via Web Crypto).
export const ADMIN_COOKIE = "tp_admin";
const enc = new TextEncoder();

async function hmac(secret: string, data: string) {
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
export async function createSession(secret: string, hours = 12) {
  const exp = Date.now() + hours * 3600_000;
  return `${exp}.${await hmac(secret, `admin:${exp}`)}`;
}
export async function verifySession(secret: string | undefined, value: string | undefined) {
  if (!secret || !value) return false;
  const [exp, sig] = value.split(".");
  if (!exp || !sig || Number(exp) < Date.now()) return false;
  const expected = await hmac(secret, `admin:${exp}`);
  if (expected.length !== sig.length) return false;
  let diff = 0;
  for (let i = 0; i < sig.length; i++) diff |= expected.charCodeAt(i) ^ sig.charCodeAt(i);
  return diff === 0;
}
