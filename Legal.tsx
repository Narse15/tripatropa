import { config } from "@/lib/config";
export function LegalPage({ title, updated, children }: { title: string; updated?: string; children: React.ReactNode }) {
  return (
    <section className="section legal"><div className="wrap narrow">
      <h1>{title}</h1>
      <p className="muted">Last updated: {updated || <span className="ph">[DATE]</span>}</p>
      {config.showDraftNotes() && <div className="draft-banner" role="note">DRAFT TEMPLATE — Every item marked in orange is a business decision or legal detail the owner must complete. This page must be reviewed by a qualified lawyer for {config.jurisdiction()} before publication. Nothing here is legal advice.</div>}
      {children}
    </div></section>
  );
}
/** Placeholder / owner decision marker */
export const PH = ({ children }: { children: React.ReactNode }) => <span className="ph">{children}</span>;
