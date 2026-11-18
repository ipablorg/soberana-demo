import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { useDeckContent } from "../../data/deck-lang-context";
import { NetworkSlideShell, SlideHeading, DiagramFrame } from "../shared/network-slide-shell";
import { Build, DrawPath, DText } from "../shared/diagram-motion";

/* Slide 5 — How a transfer moves (Fix 5). Two rows in ONE exhibit.
   Top: "ONE TRANSFER" — four cards connected left→right (pay in → hub once
   → netting → paid out locally) + the "Alone" contrast line.
   Bottom: "WHY IT COSTS LESS · NETTING (ILLUSTRATIVE)" — gross triangle
   (6 flows, 400) collapses to net triangle (3 flows, 60), counter 400 → 60.
   Build: 1 cards + Alone · 2 arrows draw · 3 gross panel · 4 arrow + net +
   counter. viewBox 1200×640. */

const CARD_X = [40, 330, 620, 910];
const CARD_Y = 80;
const CARD_W = 250;
const CARD_H = 200;

const STEPS_DATA = [
  { n: "01", title: "Customer pays in", line: "Local currency, at Member A", chip: "KYC passport · no re-onboarding" },
  { n: "02", title: "Hub, once", line: "Compliance check and FX, one time", chip: "1 FX spread, not one per hop" },
  { n: "03", title: "Netting", line: "Obligations between members offset", chip: "only the residual moves" },
  { n: "04", title: "Paid out locally", line: "Member B's rail: PIX · SPEI · ACH", chip: "seconds, no prefunding" },
];

// Triangle nodes for gross (left) and net (right, +620 x).
const TRI = [
  { x: 150, y: 450 },
  { x: 450, y: 450 },
  { x: 300, y: 600 },
];
const TRI_LABELS = ["Member CO", "Member MX", "Member BR"];
const R_TRI = 40;

// Gross flows: [from, to, amount]
const GROSS: Array<[number, number, number]> = [
  [0, 1, 100], [1, 0, 80],
  [1, 2, 60], [2, 1, 50],
  [2, 0, 40], [0, 2, 70],
];
// Net flows: CO→MX 20, MX→BR 10, CO→BR 30
const NET: Array<[number, number, number]> = [
  [0, 1, 20], [1, 2, 10], [0, 2, 30],
];

/** Unit vector from a to b. */
function unit(a: { x: number; y: number }, b: { x: number; y: number }) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy);
  return { ux: dx / len, uy: dy / len, len };
}

/** Arrow between two nodes offset perpendicular by `off`, clipped to r+4.
 *  `dx` shifts the whole arrow (used for the netting panel). */
function flowArrow(a: { x: number; y: number }, b: { x: number; y: number }, off: number, r = R_TRI, dx = 0) {
  const { ux, uy } = unit(a, b);
  const px = -uy;
  const py = ux;
  const m = r + 4;
  const ax = a.x + ux * m + px * off + dx;
  const ay = a.y + uy * m + py * off;
  const bx = b.x - ux * m + px * off + dx;
  const by = b.y - uy * m + py * off;
  return { d: `M ${ax} ${ay} L ${bx} ${by}`, mx: (ax + bx) / 2 + px * 14, my: (ay + by) / 2 + py * 14 };
}

function useCountDown(from: number, to: number, run: boolean, reduced: boolean | null) {
  const [v, setV] = useState(reduced ? to : from);
  useEffect(() => {
    if (!run || reduced) { if (reduced) setV(to); return; }
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - t0) / 500, 1);
      setV(Math.round(from + (to - from) * p));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [run, reduced, from, to]);
  return v;
}

export function NetworkTransferSlide() {
  const { content } = useDeckContent();
  const t = content.transfer;
  const reduced = useReducedMotion();
  const [netOn, setNetOn] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (reduced) { setNetOn(true); return; }
    timerRef.current = setTimeout(() => setNetOn(true), 400);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [reduced]);

  const counter = useCountDown(400, 60, netOn, reduced);

  return (
    <NetworkSlideShell steps={4}>
      <SlideHeading label={t.sectionLabel} headline={t.headline} />
      <DiagramFrame>
        {/* ─── TOP ROW: ONE TRANSFER ─── */}
        <DText x={40} y={56} size={12} fill="currentColor" opacity={0.6} mono>
          ONE TRANSFER
        </DText>
        {STEPS_DATA.map((s, i) => (
          <Build key={s.n} step={1} i={i}>
            <g>
              <rect x={CARD_X[i]} y={CARD_Y} width={CARD_W} height={CARD_H} rx={16} fill="rgba(255,255,255,.07)" stroke="url(#loopay-gradient)" strokeWidth={1.5} />
              <DText x={CARD_X[i] + 214} y={CARD_Y + 36} size={12} anchor="end" fill="currentColor" opacity={0.5} mono>
                {s.n}
              </DText>
              <circle cx={CARD_X[i] + 38} cy={CARD_Y + 38} r={14} fill="none" stroke="url(#loopay-gradient)" strokeWidth={1.5} />
              <DText x={CARD_X[i] + 38} y={CARD_Y + 43} size={14} anchor="middle" fill="currentColor" opacity={0.8}>
                {i === 0 ? "$" : i === 1 ? "◉" : i === 2 ? "⇄" : "→"}
              </DText>
              <DText x={CARD_X[i] + 24} y={CARD_Y + 92} size={18} weight={600}>
                {s.title}
              </DText>
              <DText x={CARD_X[i] + 24} y={CARD_Y + 118} size={14} fill="currentColor" opacity={0.65}>
                {s.line}
              </DText>
              <rect x={CARD_X[i] + 24} y={CARD_Y + 152} width={202} height={26} rx={13} fill="none" stroke="currentColor" strokeWidth={1} opacity={0.35} />
              <DText x={CARD_X[i] + 125} y={CARD_Y + 169} size={12} anchor="middle" fill="currentColor" opacity={0.8} mono>
                {s.chip}
              </DText>
            </g>
          </Build>
        ))}
        {/* contrast line */}
        <Build step={1}>
          <DText x={40} y={300} size={13} fill="currentColor" opacity={0.55} mono>
            Alone: correspondent or aggregator · FX at every hop · prefunded accounts · days.
          </DText>
        </Build>

        {/* 2 — three straight arrows between cards */}
        {[0, 1, 2].map((i) => (
          <DrawPath
            key={`arr-${i}`}
            step={2}
            i={i}
            d={`M${CARD_X[i] + CARD_W} 180 L${CARD_X[i + 1]} 180`}
            length={40}
            strokeWidth={2.5}
            markerEnd="url(#deck-arrow)"
          />
        ))}

        {/* ─── BOTTOM ROW: NETTING ─── */}
        <DText x={40} y={356} size={12} fill="currentColor" opacity={0.6} mono>
          WHY IT COSTS LESS · NETTING (ILLUSTRATIVE)
        </DText>

        {/* 3 — gross triangle */}
        <Build step={3}>
          {TRI.map((n, i) => (
            <g key={TRI_LABELS[i]}>
              <circle cx={n.x} cy={n.y} r={R_TRI} fill="rgba(255,255,255,.07)" stroke="currentColor" strokeWidth={1.5} opacity={0.4} />
              <DText x={n.x} y={n.y + 4} size={13} anchor="middle">
                {TRI_LABELS[i]}
              </DText>
            </g>
          ))}
          {GROSS.map(([a, b, amt], i) => {
            const f = flowArrow(TRI[a], TRI[b], i % 2 === 0 ? 10 : -10);
            return (
              <g key={`gross-${i}`}>
                <path d={f.d} fill="none" stroke="url(#loopay-gradient)" strokeWidth={1.5} markerEnd="url(#deck-arrow)" />
                <rect x={f.mx - 16} y={f.my - 9} width={32} height={15} rx={7} fill="rgba(0,0,0,.55)" stroke="currentColor" strokeWidth={0.6} opacity={0.8} />
                <DText x={f.mx} y={f.my + 2} size={11} anchor="middle" fill="currentColor" mono>
                  {String(amt)}
                </DText>
              </g>
            );
          })}
          <rect x={40} y={600} width={168} height={22} rx={11} fill="none" stroke="currentColor" strokeWidth={1} opacity={0.35} />
          <DText x={124} y={615} size={12} anchor="middle" fill="currentColor" opacity={0.8} mono>
            6 transfers · 400 gross
          </DText>
        </Build>

        {/* 4 — big central arrow */}
        <DrawPath step={4} d="M580 500 L640 500" length={60} strokeWidth={3} markerEnd="url(#deck-arrow)" />

        {/* 4 — net triangle (shifted +620) */}
        <Build step={4}>
          {TRI.map((n, i) => (
            <g key={`net-${TRI_LABELS[i]}`}>
              <circle cx={n.x + 620} cy={n.y} r={R_TRI} fill="rgba(255,255,255,.07)" stroke="currentColor" strokeWidth={1.5} opacity={0.4} />
              <DText x={n.x + 620} y={n.y + 4} size={13} anchor="middle">
                {TRI_LABELS[i]}
              </DText>
            </g>
          ))}
          {NET.map(([a, b, amt], i) => {
            const f = flowArrow(TRI[a], TRI[b], 0, R_TRI, 620);
            return (
              <g key={`netflow-${i}`}>
                <path d={f.d} fill="none" stroke="url(#loopay-gradient)" strokeWidth={1.8} markerEnd="url(#deck-arrow)" />
                <rect x={f.mx - 16} y={f.my - 9} width={32} height={15} rx={7} fill="rgba(0,0,0,.55)" stroke="currentColor" strokeWidth={0.6} opacity={0.8} />
                <DText x={f.mx} y={f.my + 2} size={11} anchor="middle" fill="currentColor" mono>
                  {String(amt)}
                </DText>
              </g>
            );
          })}
          <rect x={660} y={600} width={160} height={22} rx={11} fill="none" stroke="currentColor" strokeWidth={1} opacity={0.35} />
          <DText x={740} y={615} size={12} anchor="middle" fill="currentColor" opacity={0.8} mono>
            3 transfers · 60 net
          </DText>
        </Build>

        {/* counter — above the net triangle's top node (top y=410) */}
        <Build step={4}>
          <rect x={880} y={300} width={270} height={64} rx={12} fill="rgba(255,255,255,.05)" stroke="currentColor" strokeWidth={1} opacity={0.35} />
          <DText x={905} y={326} size={22} weight={700} mono>
            {`400 → ${counter}`}
          </DText>
          <DText x={905} y={350} size={11} fill="currentColor" opacity={0.65} mono>
            85% less cash · illustrative
          </DText>
        </Build>
      </DiagramFrame>
    </NetworkSlideShell>
  );
}
