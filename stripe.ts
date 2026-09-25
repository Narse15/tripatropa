import Stripe from "stripe";
import { config } from "./config";

let client: Stripe | null = null;
/** Server-only Stripe client. The secret key never reaches the browser. */
export function stripe(): Stripe {
  if (!client) {
    // STRIPE_API_BASE is only for local end-to-end tests against a mock server. Leave unset in production.
    const base = process.env.STRIPE_API_BASE ? new URL(process.env.STRIPE_API_BASE) : null;
    client = new Stripe(config.stripeSecret(), {
      typescript: true,
      ...(base ? { host: base.hostname, port: Number(base.port), protocol: base.protocol.replace(":", "") as "http" | "https" } : {}),
    });
  }
  return client;
}
