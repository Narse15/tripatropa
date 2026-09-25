import postgres from "postgres";
import { config } from "./config";

type Sql = ReturnType<typeof postgres>;
const g = globalThis as unknown as { __tpSql?: Sql };

/** Lazily-created Postgres client (so builds don't need DATABASE_URL). */
export function db(): Sql {
  if (!g.__tpSql) {
    g.__tpSql = postgres(config.databaseUrl(), {
      max: 5,
      idle_timeout: 20,
      prepare: false,
      onnotice: () => {}, // compatible with pgbouncer / serverless poolers
      transform: { undefined: null },
    });
  }
  return g.__tpSql;
}
