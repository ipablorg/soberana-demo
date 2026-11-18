import { useDeckContent } from "../../data/deck-lang-context";
import { NetworkSlideShell, SlideHeading } from "../shared/network-slide-shell";

/* Slide 11 — Seats and routes. Compact seat map (two columns) + two route
   cards + honest line. Kept tight so the block fits the usable area
   without scrolling past the bottom chrome. */

export function NetworkSeatMapSlide() {
  const { content } = useDeckContent();
  const t = content.seats;
  const left = t.seats.slice(0, 6);
  const right = t.seats.slice(6);

  const renderSeat = (seat: (typeof t.seats)[number]) => (
    <div
      key={seat.market}
      className={`flex items-center justify-between rounded-lg border px-3 py-1.5 ${
        seat.taken
          ? "border-[rgba(199,125,69,.45)] bg-[rgba(199,125,69,.08)]"
          : "border-border bg-card"
      } ${seat.dim ? "opacity-60" : ""}`}
    >
      <div className="min-w-0">
        <div className="truncate text-xs font-semibold text-foreground">{seat.market}</div>
        <div className="truncate text-[10px] text-muted-foreground">{seat.rails}</div>
      </div>
      <span
        className={`h-2 w-2 shrink-0 rounded-full ${
          seat.taken ? "bg-[#c77d45]" : "bg-[rgba(107,163,232,.5)]"
        }`}
        aria-label={seat.taken ? "taken" : "open"}
      />
    </div>
  );

  return (
    <NetworkSlideShell steps={3}>
      <SlideHeading label={t.sectionLabel} headline={t.headline} />

      <div className="grid shrink-0 grid-cols-1 gap-1.5 md:grid-cols-2">
        <div className="flex flex-col gap-1.5">{left.map(renderSeat)}</div>
        <div className="flex flex-col gap-1.5">{right.map(renderSeat)}</div>
      </div>

      <div className="mt-4 grid shrink-0 gap-3 md:grid-cols-2">
        {t.routes.map((r) => (
          <div key={r.tag} className="rounded-xl border border-border bg-card p-4">
            <div className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">{r.tag}</div>
            <div className="mt-0.5 text-base font-semibold">{r.title}</div>
          </div>
        ))}
      </div>

      <div className="mt-4 shrink-0 rounded-lg border border-dashed border-border px-4 py-2 text-center text-xs leading-relaxed text-muted-foreground">
        {t.honestLine}
      </div>
    </NetworkSlideShell>
  );
}
