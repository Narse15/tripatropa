"use client";
import { useState } from "react";
import { track } from "@/lib/analytics";

type Errs = Record<string, string>;
export function ContactForm() {
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [err, setErr] = useState<string | null>(null);
  const [fe, setFe] = useState<Errs>({});

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const body = Object.fromEntries(fd.entries()) as Record<string, string>;
    const local: Errs = {};
    if (!body.name?.trim()) local.name = "Add your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email || "")) local.email = "Enter a valid email address.";
    if (!body.subject?.trim()) local.subject = "Add a subject.";
    if ((body.message || "").trim().length < 5) local.message = "Add a message.";
    setFe(local); setErr(null);
    if (Object.keys(local).length) return;
    setState("sending");
    try {
      const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const f: Errs = {}; (data.fields || []).forEach((x: any) => (f[x.path] = x.message));
        setFe(f); setErr(data.error || "Your message didn't send. Please try again."); setState("idle"); return;
      }
      track("contact_submitted"); setState("sent");
    } catch { setErr("Your message didn't send. Check your connection and try again."); setState("idle"); }
  }

  if (state === "sent") return <div className="alert alert-ok" role="status"><span className="d3" style={{ display: "block", marginBottom: 6 }}>We got your message.</span>A real person will reply by email.</div>;

  const F = ({ name, label, type = "text", optional = false, area = false, auto }: { name: string; label: string; type?: string; optional?: boolean; area?: boolean; auto?: string }) => (
    <label className="field" key={name}>
      <span>{label} {optional && <span className="opt-tag">(optional)</span>}</span>
      {area ? <textarea name={name} aria-invalid={!!fe[name]} aria-describedby={fe[name] ? `${name}-e` : undefined} />
        : <input name={name} type={type} autoComplete={auto} aria-invalid={!!fe[name]} aria-describedby={fe[name] ? `${name}-e` : undefined} />}
      {fe[name] && <span className="field-err" id={`${name}-e`}>{fe[name]}</span>}
    </label>
  );
  return (
    <form onSubmit={submit} noValidate>
      {F({ name: "name", label: "Name", auto: "name" })}
      {F({ name: "email", label: "Email", type: "email", auto: "email" })}
      {F({ name: "tripId", label: "Trip ID", optional: true })}
      {F({ name: "subject", label: "Subject" })}
      {F({ name: "message", label: "Message", area: true })}
      <div className="hp" aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
      {err && <div className="alert alert-err" role="alert">{err}</div>}
      <button className="btn btn-primary btn-lg" disabled={state === "sending"}>{state === "sending" ? "SENDING…" : "SEND MESSAGE"}</button>
    </form>
  );
}
