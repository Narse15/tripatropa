import { readFileSync, existsSync } from "node:fs";
import postgres from "postgres";

// Load .env.local / .env if present (minimal parser, no dependency)
for (const f of [".env.local", ".env"]) {
  if (!existsSync(f)) continue;
  for (const line of readFileSync(f, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^"|"$/g, "");
  }
}
if (!process.env.DATABASE_URL) { console.error("DATABASE_URL is not set."); process.exit(1); }
const sql = postgres(process.env.DATABASE_URL, { max: 1, onnotice: () => {} });
await sql.unsafe(readFileSync(new URL("../db/schema.sql", import.meta.url), "utf8"));
console.log("✓ TRIPATROP schema is up to date.");
await sql.end();
