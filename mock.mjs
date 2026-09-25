// Mock Stripe (subset) + Resend for local end-to-end testing
import http from "node:http";
const sessions = new Map(); export const emails = [];
let n = 0; const failEmail = { on: false };
const parseForm = (s) => { const o = {}; for (const [k, v] of new URLSearchParams(s)) { const path = k.replace(/\]/g, "").split("["); let cur = o; path.forEach((p, i) => { if (i === path.length - 1) cur[p] = v; else cur = cur[p] ??= {}; }); } return o; };
http.createServer((req, res) => {
  let body = ""; req.on("data", (c) => (body += c)); req.on("end", () => {
    const json = (code, o) => { res.writeHead(code, { "Content-Type": "application/json" }); res.end(JSON.stringify(o)); };
    const u = new URL(req.url, "http://x");
    if (req.method === "POST" && u.pathname === "/v1/checkout/sessions") {
      const f = parseForm(body); const id = `cs_test_${++n}${Date.now()}`;
      const s = { id, object: "checkout.session", url: `https://checkout.mock/${id}`, metadata: f.metadata || {}, client_reference_id: f.client_reference_id, currency: "usd", amount_total: Number(f.line_items[0].price_data.unit_amount), payment_status: "unpaid", payment_intent: null, customer_email: f.customer_email };
      sessions.set(id, s); return json(200, s);
    }
    const m = u.pathname.match(/^\/v1\/checkout\/sessions\/(cs_[\w]+)$/);
    if (req.method === "GET" && m) return sessions.has(m[1]) ? json(200, sessions.get(m[1])) : json(404, { error: { message: "No such session" } });
    if (req.method === "POST" && u.pathname.startsWith("/__pay/")) { const s = sessions.get(u.pathname.slice(7)); s.payment_status = "paid"; s.payment_intent = "pi_mock_" + s.id.slice(-6); return json(200, s); }
    if (req.method === "POST" && u.pathname === "/__failemail") { failEmail.on = body === "1"; return json(200, {}); }
    if (req.method === "GET" && u.pathname === "/__emails") return json(200, emails);
    if (req.method === "POST" && u.pathname === "/emails") { if (failEmail.on) return json(500, { message: "mock outage" }); const e = JSON.parse(body); emails.push({ to: e.to[0], subject: e.subject, html: e.html.length }); return json(200, { id: "em_" + emails.length }); }
    json(404, { error: { message: "not mocked " + u.pathname } });
  });
}).listen(4010, () => console.log("mock on 4010"));
