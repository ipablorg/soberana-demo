import { useDeckContent } from "../../data/deck-lang-context";
import { NetworkSlideShell, SlideHeading } from "../shared/network-slide-shell";

/* Slide 12 — How to join. Left: four-step stepper. Right: seven commitment
   chips in a bounded box with precedent labels. Bottom: strip "What the
   network publishes" + Apply button (mailto).
   Build: 1 stepper · 2 chips · 3 strip · 4 buttons. */

export function NetworkJoinSlide() {
  const { content } = useDeckContent();
  const t = content.join;

  return (
    <NetworkSlideShell steps={4}>
      <SlideHeading label={t.sectionLabel} headline={t.headline} />

      <div className="mt-2 grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        {/* 1 — stepper */}
        <div className="flex flex-col gap-3">
          {t.steps.map((s, i) => (
            <div key={s.n} className="flex items-start gap-4 rounded-lg border border-border bg-card p-4" data-build={1}>
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border font-mono text-xs">
                {i + 1}
              </div>
              <div>
                <div className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">{s.n}</div>
                <div className="text-base font-semibold">{s.title}</div>
              </div>
            </div>
          ))}
        </div>

        {/* 2 — commitments */}
        <div className="rounded-xl border border-border bg-card p-5" data-build={2}>
          <div className="font-mono text-[11px] tracking-widest text-muted-foreground uppercase">
            {t.commitmentsLabel}
          </div>
          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {t.commitments.map((c) => (
              <div key={c.title} className="rounded-lg border border-border px-3 py-2.5">
                <div className="text-sm font-medium">{c.title}</div>
                <div className="mt-0.5 font-mono text-[10px] text-muted-foreground">{c.precedent}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3 — publishes strip */}
      <div className="mt-5 rounded-lg border border-dashed border-border px-5 py-4" data-build={3}>
        <div className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">{t.publishesLabel}</div>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{t.publishes}</p>
      </div>

      {/* 4 — CTA */}
      <div className="mt-6 flex justify-center" data-build={4}>
        <a
          href={t.applyMailto}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-transform duration-150 ease-out hover:translate-y-[-1px]"
        >
          {t.applyCta}
        </a>
      </div>
    </NetworkSlideShell>
  );
}
