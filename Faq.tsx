"use client";
import { track } from "@/lib/analytics";
export type FaqItem = { id: string; q: string; a: React.ReactNode };
export function Faq({ items }: { items: FaqItem[] }) {
  return (
    <div className="faq">
      {items.map((it) => (
        <details key={it.id} id={it.id} onToggle={(e) => { if ((e.target as HTMLDetailsElement).open) track("faq_opened", { question: it.id }); }}>
          <summary>{it.q}</summary>
          <div className="ans">{it.a}</div>
        </details>
      ))}
    </div>
  );
}
