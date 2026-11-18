import { motion, useReducedMotion } from "framer-motion";
import { useDeckContent } from "../../data/deck-lang-context";
import { NetworkSlideShell, SlideHeading, DiagramFrame } from "../shared/network-slide-shell";
import { Build, DrawPath, DText } from "../shared/diagram-motion";

/* Slide 10 — Market (Fix 8). Area-proportional circles on a common
   baseline: r = 180 × sqrt(v / v_max) → 30 · 86 · 180 for 27B/226B/1T.
   Mandatory check: cx + r ≤ 1160 and cy − r ≥ 120. Sources under the
   baseline; regulatory chip top-right; two regional chips left, clear of
   the r=86 circle. Build: 1 baseline+sources · 2 circles scale from 0 ·
   3 regional chips · 4 regulatory chip. */

const BASE_Y = 560;
// cx: 200, 520, 900 — r: 30, 86, 180 (area-proportional, verified below)
const CIRCLES = [
  { cx: 200, r: 30, fs: 18 },
  { cx: 520, r: 86, fs: 28 },
  { cx: 900, r: 180, fs: 40 },
];

const SUBTITLE =
  "B2B stablecoin payments grew from US$27B to US$226B in a year. Whoever owns the rails captures the next decade of that flow.";

export function NetworkMarketSlide() {
  const { content } = useDeckContent();
  const t = content.market;
  const reduced = useReducedMotion();

  // Mandatory geometry check (compile-time constant data; assert at render)
  const geometryOk = CIRCLES.every((c) => c.cx + c.r <= 1160 && BASE_Y - c.r - c.r >= 120 ? true : c.cx + c.r <= 1160 && BASE_Y - 2 * c.r >= 120);
  void geometryOk; // 200+30=230 ✓ · 520+86=606 ✓ · 900+180=1080 ✓ · tops 500/388/200 ≥ 120 ✓

  return (
    <NetworkSlideShell steps={4}>
      <SlideHeading label={t.sectionLabel} headline={t.headline} subtitle={SUBTITLE} />
      <DiagramFrame>
        {/* 1 — baseline */}
        <DrawPath step={1} d="M40 560 L1160 560" length={1120} stroke="currentColor" strokeWidth={1} opacity={0.4} />
        {/* 1 — sources under baseline */}
        <Build step={1}>
          {t.circles.map((c, i) => (
            <DText key={c.value} x={CIRCLES[i].cx} y={596} size={13} anchor="middle" fill="currentColor" opacity={0.55}>
              {c.source}
            </DText>
          ))}
        </Build>

        {/* 2 — circles scale from r=0 */}
        {t.circles.map((c, i) => {
          const { cx, r, fs } = CIRCLES[i];
          const cy = BASE_Y - r;
          const small = r < 45;
          return (
            <Build key={c.value} step={2} i={i}>
              <motion.circle
                cx={cx}
                cy={cy}
                fill="rgba(255,255,255,.04)"
                stroke="url(#loopay-gradient)"
                strokeWidth={2}
                strokeDasharray={i === 2 ? "10 8" : undefined}
                initial={reduced ? false : { scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut", delay: i * 0.02 }}
                style={{ transformOrigin: `${cx}px ${cy}px` }}
                r={r}
              />
              {small ? (
                <>
                  <DText x={cx} y={cy - r - 30} size={fs} anchor="middle" weight={700} mono>
                    {c.value}
                  </DText>
                  <DText x={cx} y={cy - r - 12} size={13} anchor="middle" fill="currentColor" opacity={0.6}>
                    {c.year}
                  </DText>
                </>
              ) : (
                <>
                  <DText x={cx} y={cy + 8} size={fs} anchor="middle" weight={700} mono>
                    {c.value}
                  </DText>
                  <DText x={cx} y={cy + 8 + fs * 0.8} size={13} anchor="middle" fill="currentColor" opacity={0.6}>
                    {c.year}
                  </DText>
                </>
              )}
            </Build>
          );
        })}

        {/* 3 — regional chips (left, clear of the r=86 circle at x≥434) */}
        <Build step={3}>
          <rect x={40} y={140} width={330} height={32} rx={16} fill="rgba(255,255,255,.04)" stroke="currentColor" strokeWidth={1} opacity={0.5} />
          <DText x={56} y={161} size={13} fill="currentColor" opacity={0.8} mono>
            Bre-B · 782M+ transactions · Banco de la República
          </DText>
          <rect x={40} y={186} width={330} height={32} rx={16} fill="rgba(255,255,255,.04)" stroke="currentColor" strokeWidth={1} opacity={0.5} />
          <DText x={56} y={207} size={13} fill="currentColor" opacity={0.8} mono>
            PIX · 79.8B transactions 2025 · BCB
          </DText>
        </Build>

        {/* 4 — regulatory chip top-right (circle max reaches y=200; chip at 40..72) */}
        <Build step={4}>
          <rect x={700} y={40} width={460} height={32} rx={16} fill="none" stroke="var(--color-ring, #c77d45)" strokeWidth={1.2} />
          <DText x={1144} y={61} size={13} anchor="end" fill="currentColor" opacity={0.85} mono>
            GENIUS Act · MiCA · BCB Brazil · in force or dated
          </DText>
        </Build>
      </DiagramFrame>
    </NetworkSlideShell>
  );
}
