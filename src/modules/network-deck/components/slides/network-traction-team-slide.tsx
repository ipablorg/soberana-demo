import { useDeckContent } from "../../data/deck-lang-context";
import { NetworkSlideShell, SlideHeading } from "../shared/network-slide-shell";

/* Slide 7 — Founders. Up to 5 founder cards in a responsive grid.
   Photos live in public/ (e.g. public/founder-diego.png). If a photo
   fails to load the card shows the founder's initials as a fallback. */

function initials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function NetworkTractionTeamSlide() {
  const { content } = useDeckContent();
  const t = content.founders;

  return (
    <NetworkSlideShell>
      <SlideHeading label={t.sectionLabel} headline={t.headline} />

      {/* 2-col for ≤2 founders, 3-col for 3+, auto-fills rows */}
      <div className={`mt-5 grid gap-4 ${t.founders.length <= 2 ? "md:grid-cols-2" : "md:grid-cols-3"}`}>
        {t.founders.map((f) => (
          <div
            key={f.name}
            className="flex items-start gap-4 rounded-xl border border-border bg-card p-4"
          >
            {/* photo with initials fallback */}
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-border bg-muted">
              <img
                src={`/${f.photo}`}
                alt={`${f.name}, ${f.role}`}
                loading="lazy"
                className="h-full w-full object-cover"
                onError={(e) => {
                  const img = e.currentTarget as HTMLImageElement;
                  img.style.display = "none";
                  const fb = img.nextElementSibling as HTMLElement | null;
                  if (fb) fb.style.display = "flex";
                }}
              />
              <div
                className="absolute inset-0 hidden items-center justify-center font-mono text-sm font-semibold text-muted-foreground"
              >
                {initials(f.name)}
              </div>
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold leading-tight">{f.name}</div>
              <div className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">{f.role}</div>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{f.bio}</p>
              <div className="mt-2 inline-flex rounded-md border border-border px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
                {f.proofChip}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* "+30 people" team-size chip */}
      {t.teamNote && (
        <div className="mt-4 flex shrink-0 items-center justify-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(199,125,69,.4)] bg-[rgba(199,125,69,.08)] px-4 py-1.5 font-mono text-xs text-[#c77d45]">
            <span className="text-base leading-none">+</span>
            {t.teamNote}
          </span>
        </div>
      )}

    </NetworkSlideShell>
  );
}
