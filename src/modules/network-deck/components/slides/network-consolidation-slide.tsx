import { useDeckContent } from "../../data/deck-lang-context";
import { NetworkSlideShell, SlideHeading } from "../shared/network-slide-shell";

/* A1 — Appendix: Rulebook detail. Full seven commitments and the ten
   published items. Two-column list, no diagram. Budget: 120 words max —
   this appendix intentionally exceeds per-slide budgets as the reference
   slide (prompt allows 120 words for the appendix). */

export function NetworkRulebookAppendixSlide() {
  const { content } = useDeckContent();
  const t = content.rulebookAppendix;

  return (
    <NetworkSlideShell>
      <SlideHeading label={t.sectionLabel} headline={t.headline} />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* left — seven commitments */}
        <div>
          <div className="font-mono text-[11px] tracking-widest text-muted-foreground uppercase">{t.commitmentsTitle}</div>
          <div className="mt-3 flex flex-col gap-2">
            {t.commitments.map((c) => (
              <div key={c.title} className="rounded-lg border border-border bg-card px-3 py-2">
                <div className="text-sm font-semibold">{c.title}</div>
                <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{c.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* right — published items */}
        <div className="flex flex-col gap-6">
          <div>
            <div className="font-mono text-[11px] tracking-widest text-muted-foreground uppercase">{t.publishesTitle}</div>
            <ul className="mt-3 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
              {t.publishes.map((p) => (
                <li key={p} className="rounded-lg border border-dashed border-border px-3 py-2 text-xs text-muted-foreground">
                  {p}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <p className="mt-5 text-center text-[11px] text-muted-foreground">{t.note}</p>
    </NetworkSlideShell>
  );
}
