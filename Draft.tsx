import { config } from "@/lib/config";
/** Owner-facing note. Visible until NEXT_PUBLIC_SHOW_DRAFT_NOTES=false. */
export function Draft({ children }: { children: React.ReactNode }) {
  if (!config.showDraftNotes()) return null;
  return <span className="draft" role="note">{children}</span>;
}
