import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { useDeckContent } from "../../data/deck-lang-context";
import { NetworkSlideShell, SlideHeading, DiagramFrame } from "../shared/network-slide-shell";
import { Build, DText } from "../shared/diagram-motion";

/* Slide 13 — The ask (Fix 9). US$10M at US$80M valuation (user-confirmed).
   Pending pre/post → percentage shown as [TBD: pre or post] (post 12.5% /
   pre 11.1%). Left: THE ROUND panel with contacts. Right top: USE OF
   FUNDS segmented bar. Right bottom: MILESTONES 24-month timeline.
   Build: 1 round panel + count 0→10 · 2 bar fills · 3 milestones ·
   4 contacts + footer. */

function useCountTo(target: number, reduced: boolean | null) {
  const [v, setV] = useState(reduced ? target : 0);
  useEffect(() => {
    if (reduced) { setV(target); return; }
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - t0) / 500, 1);
      setV(Math.round(target * p));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduced, target]);
  return v;
}

export function NetworkAskSlide() {
  const { content } = useDeckContent();
  const t = content.ask;
  const reduced = useReducedMotion();
  const count = useCountTo(10, reduced);

  // Use of funds percentages are UNKNOWN → four equal TBD segments.
  const FUNDS = [
    { pct: 25, label: "Network stack · compliance passport, custody, insurance" },
    { pct: 25, label: "Liquidity lines and netting treasury" },
    { pct: 25, label: "Seat recruitment and demand generation" },
    { pct: 25, label: "Team, legal and governance" },
  ];

  const MILESTONES = [
    { period: "Q1–Q2", milestone: "[TBD: seats signed]" },
    { period: "Q3–Q4", milestone: "[TBD: markets live]" },
    { period: "Y2 H1", milestone: "[TBD: volume / netting live]" },
    { period: "Y2 H2", milestone: "[TBD: Series A readiness]" },
  ];

  let acc = 0;
  const segments = FUNDS.map((f) => {
    const start = acc;
    acc += f.pct;
    return { ...f, start };
  });

  return (
    <NetworkSlideShell steps={4}>
      <SlideHeading
        label={t.sectionLabel}
        headline="US$10M to open the next seats."
        subtitle="US$10M at a US$80M [TBD: pre or post-money] valuation. Terms in the data room."
      />
      <DiagramFrame>
        {/* 1 — left: THE ROUND */}
        <Build step={1}>
          <rect x={40} y={40} width={400} height={560} rx={16} fill="rgba(255,255,255,.03)" stroke="currentColor" strokeWidth={1} opacity={0.3} />
          <DText x={68} y={76} size={12} fill="currentColor" opacity={0.6} mono>
            THE ROUND
          </DText>
          <DText x={68} y={170} size={64} weight={700} mono>
            {`US$${count}M`}
          </DText>
          <DText x={68} y={210} size={18} fill="currentColor" opacity={0.85}>
            at US$80M valuation
          </DText>
          <rect x={68} y={234} width={310} height={30} rx={15} fill="none" stroke="currentColor" strokeWidth={1} opacity={0.35} />
          <DText x={223} y={254} size={14} anchor="middle" fill="currentColor" opacity={0.8}>
            [TBD: pre or post] · 12.5% | 11.1%
          </DText>
        </Build>

        {/* 4 — contacts in the left panel */}
        <Build step={4}>
          <DText x={68} y={330} size={14} fill="currentColor" opacity={0.85}>
            Diego Muñoz · CEO
          </DText>
          <DText x={68} y={352} size={14} fill="currentColor" opacity={0.6} mono>
            dm@loopay.com
          </DText>
          <DText x={68} y={396} size={14} fill="currentColor" opacity={0.85}>
            Carlos Ortegón · CTO
          </DText>
          <DText x={68} y={418} size={14} fill="currentColor" opacity={0.6} mono>
            co@loopay.com
          </DText>
          <DText x={68} y={462} size={14} fill="currentColor" opacity={0.6} mono>
            contact@soberana.network
          </DText>
        </Build>

        {/* 2 — USE OF FUNDS: four equal grey TBD segments */}
        <Build step={2}>
          <rect x={480} y={40} width={680} height={290} rx={16} fill="rgba(255,255,255,.03)" stroke="currentColor" strokeWidth={1} opacity={0.3} />
          <DText x={508} y={76} size={12} fill="currentColor" opacity={0.6} mono>
            USE OF FUNDS · [TBD %]
          </DText>
          <rect x={508} y={100} width={624} height={44} rx={8} fill="none" stroke="currentColor" strokeWidth={1} opacity={0.25} />
          {/* segment labels in a 2×2 grid below the bar (avoid overlap) */}
          {segments.map((seg, i) => {
            const col = i % 2;
            const row = Math.floor(i / 2);
            const lx = 530 + col * 320;
            const ly = 190 + row * 40;
            return (
              <g key={seg.label}>
                <rect
                  x={510 + (seg.start / 100) * 624}
                  y={104}
                  width={(seg.pct / 100) * 624 - 4}
                  height={36}
                  rx={6}
                  fill="rgba(255,255,255,.12)"
                />
                <DText x={510 + (seg.start / 100) * 624 + (seg.pct / 100) * 624 / 2} y={127} size={12} anchor="middle" fill="currentColor" opacity={0.5} mono>
                  [TBD %]
                </DText>
                <circle cx={lx - 10} cy={ly - 4} r={3} fill="#6ba3e8" opacity={0.7} />
                <DText x={lx} y={ly} size={11} fill="currentColor" opacity={0.6}>
                  {seg.label.length > 34 ? `${seg.label.slice(0, 33)}…` : seg.label}
                </DText>
              </g>
            );
          })}
        </Build>

        {/* 3 — MILESTONES 24 months */}
        <Build step={3}>
          <rect x={480} y={360} width={680} height={240} rx={16} fill="rgba(255,255,255,.03)" stroke="currentColor" strokeWidth={1} opacity={0.3} />
          <DText x={508} y={396} size={12} fill="currentColor" opacity={0.6} mono>
            MILESTONES · 24 MONTHS
          </DText>
          <path d="M520 470 L1120 470" fill="none" stroke="currentColor" strokeWidth={1} opacity={0.25} />
          {MILESTONES.map((m, i) => {
            const x = 560 + i * 170;
            return (
              <g key={m.period}>
                <circle cx={x} cy={470} r={6} fill="url(#loopay-gradient)" />
                <DText x={x} y={448} size={13} anchor="middle" weight={600} mono>
                  {m.period}
                </DText>
                <DText x={x} y={500} size={11} anchor="middle" fill="currentColor" opacity={0.6}>
                  {m.milestone}
                </DText>
              </g>
            );
          })}
        </Build>
      </DiagramFrame>

      {/* footer */}
      <p className="shrink-0 pt-2 text-center text-xs text-muted-foreground">
        Nothing in this deck is an offer of securities. Figures marked illustrative are placeholders pending member agreements.
      </p>
    </NetworkSlideShell>
  );
}
