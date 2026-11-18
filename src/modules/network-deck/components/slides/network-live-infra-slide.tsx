import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { useDeckContent } from "../../data/deck-lang-context";
import { NetworkSlideShell, SlideHeading } from "../shared/network-slide-shell";

/* Slide 6 — Proof. Rail chain: four live rail chips on a flowing dashed
   line, fifth dashed chip "your market"; the number counts up; client names
   below. The count-up runs once on mount; reduced motion shows the final
   number immediately. */

const CHIP_X = [40, 290, 530, 770];
const CHIP_W = 180;
const NEXT_X = 985;

function useCountUp(target: number, reduced: boolean | null) {
  const [value, setValue] = useState(reduced ? target : 0);
  useEffect(() => {
    if (reduced) {
      setValue(target);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const dur = 800;
    const tick = (now: number) => {
      const p = Math.min((now - start) / dur, 1);
      setValue(p * target);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduced, target]);
  return value;
}

export function NetworkProofSlide() {
  const { content } = useDeckContent();
  const t = content.proof;
  const reduced = useReducedMotion();
  const count = useCountUp(2.2, reduced);

  return (
    <NetworkSlideShell steps={4}>
      <SlideHeading label={t.sectionLabel} headline={t.headline} />

      {/* The number counts up */}
      <div className="flex flex-col items-center">
        <div className="font-mono text-5xl font-bold tracking-tight tabular-nums md:text-6xl">
          US${count.toFixed(1)}B
        </div>
        <div className="mt-1 text-sm text-muted-foreground">{t.numberLabel}</div>
      </div>

      {/* Rail chain */}
      <div className="relative mt-10 w-full overflow-x-auto">
        <svg viewBox="0 0 1160 90" className="h-auto w-full min-w-[720px]" role="img" xmlns="http://www.w3.org/2000/svg">
          {/* flowing dashed connectors */}
          {[0, 1, 2].map((i) => (
            <path
              key={i}
              className="conndash"
              d={`M${CHIP_X[i] + CHIP_W} 45 C ${CHIP_X[i] + CHIP_W + 40} 45, ${CHIP_X[i + 1] - 40} 45, ${CHIP_X[i + 1]} 45`}
              fill="none"
              stroke="url(#loopay-gradient)"
              strokeWidth={2}
            />
          ))}
          <path
            className="conndash"
            d={`M${CHIP_X[3] + CHIP_W} 45 C ${CHIP_X[3] + CHIP_W + 20} 45, ${NEXT_X - 20} 45, ${NEXT_X} 45`}
            fill="none"
            stroke="url(#loopay-gradient)"
            strokeWidth={2}
          />
          {t.rails.map((r, i) => (
            <g key={r.market}>
              <rect x={CHIP_X[i]} y={15} width={CHIP_W} height={60} rx={12} fill="var(--card)" stroke="url(#loopay-gradient)" strokeWidth={1.6} />
              <text x={CHIP_X[i] + CHIP_W / 2} y={40} textAnchor="middle" fontSize={16} fontWeight={600} fill="currentColor">
                {r.market}
              </text>
              <text x={CHIP_X[i] + CHIP_W / 2} y={60} textAnchor="middle" fontSize={13} fill="currentColor" opacity={0.65}>
                {r.rails}
              </text>
            </g>
          ))}
          <g>
            <rect x={NEXT_X} y={15} width={150} height={60} rx={12} fill="none" stroke="var(--color-ring, #c77d45)" strokeWidth={1.6} strokeDasharray="6 5" />
            <text x={NEXT_X + 75} y={40} textAnchor="middle" fontSize={15} fill="var(--color-ring, #c77d45)">
              {t.nextChip}
            </text>
            <text x={NEXT_X + 75} y={60} textAnchor="middle" fontSize={13} fill="var(--color-ring, #c77d45)">
              {t.nextSub}
            </text>
          </g>
        </svg>
      </div>

      {/* client band */}
      <div className="mt-10 border-t border-border pt-6">
        <div className="text-center font-mono text-xs tracking-widest text-muted-foreground uppercase">
          {t.clientsLabel}
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {t.clients.map((c) => (
            <span key={c} className="text-sm font-medium text-foreground/80">
              {c}
            </span>
          ))}
        </div>
      </div>
    </NetworkSlideShell>
  );
}
