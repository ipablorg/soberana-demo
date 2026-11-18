import { motion, useReducedMotion } from "framer-motion";
import { useDeckContent } from "../../data/deck-lang-context";
import { NetworkSlideShell, SlideHeading, DiagramFrame } from "../shared/network-slide-shell";
import { Build, DrawPath, DText } from "../shared/diagram-motion";
import loopayLogo from "../../assets/loopay-logo-white.png";
import flagCO from "../../assets/flag-co.svg";
import flagEC from "../../assets/flag-ec.svg";
import flagPE from "../../assets/flag-pe.svg";
import flagBR from "../../assets/flag-br.svg";
import flagMX from "../../assets/flag-mx.svg";
import flagUS from "../../assets/flag-us.svg";
import flagEU from "../../assets/flag-eu.svg";
import flagSG from "../../assets/flag-sg.svg";

/* Slide 4 — The model (Fix 4). Circular hub + COMPLETE ownership ring
   (single <circle>), eight member nodes with country flags on radius 250,
   eight radial spokes always drawn node-edge → ring-edge. Taken seats
   (CO, EC, PE) show the Loopay logo + gradient stroke; open seats show
   "open seat". Keep/Gain side columns. Build: 1 hub+ring · 2 nodes ·
   3 spokes · 4 seat status + columns. */

const CX = 600;
const CY = 330;
const R_HUB = 88;
const R_RING = 120;
const R_MEMBERS = 250;

const FLAGS: Record<string, string> = {
  CO: flagCO, EC: flagEC, PE: flagPE, BR: flagBR, MX: flagMX, US: flagUS, EU: flagEU, SG: flagSG,
};

const MEMBERS: Array<{ market: string; cc: string; taken: boolean }> = [
  { market: "Colombia", cc: "CO", taken: true },
  { market: "Brazil", cc: "BR", taken: false },
  { market: "United States", cc: "US", taken: false },
  { market: "Europe", cc: "EU", taken: false },
  { market: "Singapore", cc: "SG", taken: false },
  { market: "Mexico", cc: "MX", taken: false },
  { market: "Peru", cc: "PE", taken: true },
  { market: "Ecuador", cc: "EC", taken: true },
];

const ANGLES = [90, 45, 0, -45, -90, -135, 180, 135];

export function NetworkModelSlide() {
  const { content } = useDeckContent();
  const t = content.model;
  const reduced = useReducedMotion();

  const positions = ANGLES.map((deg) => {
    const rad = (deg * Math.PI) / 180;
    return { x: CX + R_MEMBERS * Math.cos(rad), y: CY - R_MEMBERS * Math.sin(rad) };
  });

  return (
    <NetworkSlideShell steps={4}>
      <SlideHeading
        label={t.sectionLabel}
        headline={t.headline}
        subtitle="Visa's 2008 IPO raised US$17.9B; US$13.4B redeemed member banks' shares."
      />
      <DiagramFrame>
        {/* 1 — ownership ring: ONE complete circle, dashed, drawn with pathLength */}
        <motion.circle
          cx={CX}
          cy={CY}
          r={R_RING}
          fill="none"
          stroke="url(#loopay-gradient)"
          strokeWidth={2}
          strokeDasharray="8 6"
          pathLength={1}
          strokeDashoffset={1}
          initial={reduced ? false : { strokeDashoffset: 1 }}
          animate={{ strokeDashoffset: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />

        {/* 3 — eight radial spokes: node edge (r+4) → ring edge (r+4) */}
        {ANGLES.map((deg, i) => {
          const rad = (deg * Math.PI) / 180;
          const ux = Math.cos(rad);
          const uy = -Math.sin(rad);
          const x1 = CX + ux * (R_MEMBERS - 64);
          const y1 = CY + uy * (R_MEMBERS - 64);
          const x2 = CX + ux * (R_RING + 4);
          const y2 = CY + uy * (R_RING + 4);
          return <DrawPath key={`spoke-${i}`} step={3} i={i} d={`M${x1} ${y1} L${x2} ${y2}`} length={130} strokeWidth={1.5} />;
        })}

        {/* 1 — hub */}
        <Build step={1}>
          <circle cx={CX} cy={CY} r={R_HUB} fill="rgba(255,255,255,.07)" stroke="url(#loopay-gradient)" strokeWidth={2} />
          <DText x={CX} y={CY - 12} size={22} anchor="middle" weight={700} mono>
            {t.hubLabel}
          </DText>
          <DText x={CX} y={CY + 12} size={12} anchor="middle" fill="#6ba3e8" mono>
            {t.hubSub}
          </DText>
          <DText x={CX} y={CY + 34} size={13} anchor="middle" fill="currentColor" opacity={0.65}>
            API · compliance · netting
          </DText>
        </Build>

        {/* "owned by the seats" chip between ring and top node */}
        <Build step={1}>
          <rect x={CX - 78} y={177} width={156} height={26} rx={13} fill="rgba(255,255,255,.05)" stroke="currentColor" strokeWidth={1} opacity={0.4} />
          <DText x={CX} y={194} size={12} anchor="middle" fill="currentColor" opacity={0.8} mono>
            {t.ownRingLabel}
          </DText>
        </Build>

        {/* 2 — eight member nodes with flags */}
        {positions.map((p, i) => (
          <Build key={MEMBERS[i].market} step={2} i={i}>
            <circle cx={p.x} cy={p.y} r={60} fill="rgba(255,255,255,.07)" stroke="currentColor" strokeWidth={1.5} opacity={0.35} />
            <image href={FLAGS[MEMBERS[i].cc]} x={p.x - 14} y={p.y - 36} width={28} height={20} rx={3} preserveAspectRatio="xMidYMid meet" />
            <DText x={p.x} y={p.y - 6} size={14} anchor="middle">
              {MEMBERS[i].market}
            </DText>
          </Build>
        ))}

        {/* 4 — seat status */}
        {positions.map((p, i) =>
          MEMBERS[i].taken ? (
            <Build key={`taken-${MEMBERS[i].market}`} step={4} i={i}>
              <circle cx={p.x} cy={p.y} r={60} fill="none" stroke="url(#loopay-gradient)" strokeWidth={2} />
              <image href={loopayLogo} x={p.x - 28} y={p.y + 12} height={16} width={56} preserveAspectRatio="xMidYMid meet" />
              <rect x={p.x - 34} y={p.y + 32} width={68} height={14} rx={7} fill="none" stroke="currentColor" strokeWidth={0.8} opacity={0.4} />
              <DText x={p.x} y={p.y + 42.5} size={10} anchor="middle" fill="currentColor" opacity={0.7} mono>
                seat taken
              </DText>
            </Build>
          ) : (
            <Build key={`open-${MEMBERS[i].market}`} step={4} i={i}>
              <rect x={p.x - 30} y={p.y + 32} width={60} height={14} rx={7} fill="none" stroke="currentColor" strokeWidth={0.8} opacity={0.3} />
              <DText x={p.x} y={p.y + 42.5} size={10} anchor="middle" fill="currentColor" opacity={0.55} mono>
                open seat
              </DText>
            </Build>
          ),
        )}

        {/* 4 — Keep column (left) */}
        <Build step={4}>
          <DText x={40} y={220} size={16} weight={600}>
            {t.keepLabel}
          </DText>
          {t.keepChips.map((chip, i) => (
            <g key={chip}>
              <rect x={40} y={236 + i * 46} width={220} height={36} rx={18} fill="rgba(255,255,255,.04)" stroke="currentColor" strokeWidth={1} opacity={0.4} />
              <DText x={150} y={259 + i * 46} size={14} anchor="middle" fill="currentColor" opacity={0.85}>
                {chip}
              </DText>
            </g>
          ))}
        </Build>

        {/* 4 — Gain column (right) */}
        <Build step={4}>
          <DText x={940} y={220} size={16} weight={600}>
            {t.gainLabel}
          </DText>
          {t.gainChips.map((chip, i) => (
            <g key={chip}>
              <rect x={940} y={236 + i * 46} width={220} height={36} rx={18} fill="rgba(255,255,255,.04)" stroke="#6ba3e8" strokeWidth={1.2} opacity={0.9} />
              <DText x={1050} y={259 + i * 46} size={14} anchor="middle">
                {chip}
              </DText>
            </g>
          ))}
        </Build>
      </DiagramFrame>
    </NetworkSlideShell>
  );
}
