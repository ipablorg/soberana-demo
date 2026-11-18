import { motion, useReducedMotion } from "framer-motion";
import { useDeckContent } from "../../data/deck-lang-context";
import { NetworkSlideShell, SlideHeading, DiagramFrame } from "../shared/network-slide-shell";
import { Build, DText } from "../shared/diagram-motion";
import type { HarveyCell } from "../../data/network-deck-content.types";

/* Slide 9 — Alternatives (Fix 7). Harvey-ball matrix with legend, operator
   POV headers, rows with subtitles, six equal columns and the corrected
   cell values (Aggregator × Custody was a broken dot). Build: 1 legend +
   headers + labels · 2 rows fill · 3 seat row highlights · 4 closing chip. */

const COL_X = 350; // first column centre
const COL_W = 135; // six equal columns, gap 0, cell w=123
const ROW_Y = [152, 236, 320, 404, 488];
const BALL_R = 16;

function HarveyBall({ cell, cx, cy }: { cell: HarveyCell; cx: number; cy: number }) {
  const ring = "rgba(255,255,255,.25)";
  switch (cell) {
    case "full":
      return <circle cx={cx} cy={cy} r={BALL_R} fill="#6ba3e8" opacity={0.9} />;
    case "half":
      return (
        <g>
          <circle cx={cx} cy={cy} r={BALL_R} fill="rgba(255,255,255,.06)" stroke={ring} strokeWidth={1.4} />
          <path d={`M${cx - BALL_R} ${cy} A${BALL_R} ${BALL_R} 0 0 1 ${cx + BALL_R} ${cy} Z`} fill="#6ba3e8" opacity={0.85} />
        </g>
      );
    case "bad":
      return <circle cx={cx} cy={cy} r={BALL_R} fill="rgba(224,109,90,.85)" />;
    case "seat":
      return <circle cx={cx} cy={cy} r={BALL_R} fill="url(#loopay-gradient)" />;
    case "dot":
    default:
      return <circle cx={cx} cy={cy} r={BALL_R} fill="rgba(255,255,255,.06)" stroke={ring} strokeWidth={1.4} />;
  }
}

const SUBTITLE =
  "Four ways a local operator reaches every market. Each row shows what the operator itself gets.";

const HEADERS = [
  "Compliance",
  "Custody",
  "Inbound",
  "Keeps the",
  "Owns the",
  "Shares the",
];
const HEADERS2 = ["shared", "included", "clients", "client", "network", "exit"];

const ROW_META: Array<{ label: string; sub: string }> = [
  { label: "Build alone", sub: "you, per market" },
  { label: "Global platform", sub: "Bridge–Stripe class" },
  { label: "Aggregator", sub: "Thunes, TerraPay class" },
  { label: "Bank consortium", sub: "Open Standard, BankChain" },
  { label: "The seat", sub: "Soberana Network" },
];

// Corrected values from the fix list (matches landing alternatives table §7)
const VALUES: HarveyCell[][] = [
  ["empty", "empty", "empty", "full", "empty", "empty"],
  ["half", "half", "empty", "bad", "bad", "bad"],
  ["empty", "empty", "half", "bad", "bad", "bad"],
  ["full", "full", "half", "empty", "half", "bad"],
  ["seat", "seat", "seat", "seat", "seat", "seat"],
];

export function NetworkAlternativesSlide() {
  const { content } = useDeckContent();
  const t = content.alternatives;
  const reduced = useReducedMotion();
  const rows = VALUES;

  return (
    <NetworkSlideShell steps={4}>
      <SlideHeading label={t.sectionLabel} headline={t.headline} subtitle={SUBTITLE} />
      <DiagramFrame>
        {/* 1 — legend */}
        <Build step={1}>
          <g>
            <circle cx={52} cy={35} r={9} fill="#6ba3e8" opacity={0.9} />
            <DText x={68} y={40} size={13} fill="currentColor" opacity={0.7}>
              the operator gets it
            </DText>
            <circle cx={252} cy={35} r={9} fill="rgba(255,255,255,.06)" stroke="rgba(255,255,255,.25)" strokeWidth={1.2} />
            <path d="M243 35 A9 9 0 0 1 261 35 Z" fill="#6ba3e8" opacity={0.85} />
            <DText x={268} y={40} size={13} fill="currentColor" opacity={0.7}>
              partly
            </DText>
            <circle cx={352} cy={35} r={9} fill="rgba(255,255,255,.06)" stroke="rgba(255,255,255,.25)" strokeWidth={1.2} />
            <DText x={368} y={40} size={13} fill="currentColor" opacity={0.7}>
              not provided
            </DText>
            <circle cx={492} cy={35} r={9} fill="rgba(224,109,90,.85)" />
            <DText x={508} y={40} size={13} fill="currentColor" opacity={0.7}>
              kept by the platform or aggregator
            </DText>
          </g>
        </Build>

        {/* 1 — headers (operator POV, two lines, six equal columns) */}
        <Build step={1}>
          {HEADERS.map((h, i) => (
            <g key={h}>
              <DText x={COL_X + i * COL_W + 61} y={90} size={12} anchor="middle" fill="currentColor" opacity={0.6} mono>
                {h}
              </DText>
              <DText x={COL_X + i * COL_W + 61} y={106} size={12} anchor="middle" fill="currentColor" opacity={0.6} mono>
                {HEADERS2[i]}
              </DText>
            </g>
          ))}
        </Build>

        {/* 1 — row labels with subtitles */}
        <Build step={1}>
          {ROW_META.map((r, i) => (
            <g key={r.label}>
              <DText x={40} y={ROW_Y[i] + 30} size={16} weight={600}>
                {r.label}
              </DText>
              <DText x={40} y={ROW_Y[i] + 50} size={12} fill="currentColor" opacity={0.5}>
                {r.sub}
              </DText>
            </g>
          ))}
        </Build>

        {/* 2 — rows fill top to bottom */}
        {rows.slice(0, 4).map((cells, ri) => (
          <Build key={ROW_META[ri].label} step={2} i={ri}>
            {cells.map((cell, ci) => (
              <g key={`${ri}-${ci}`}>
                <rect x={COL_X + ci * COL_W} y={ROW_Y[ri]} width={123} height={64} rx={10} fill="rgba(255,255,255,.03)" stroke="currentColor" strokeWidth={1} opacity={0.18} />
                <HarveyBall cell={cell} cx={COL_X + ci * COL_W + 61.5} cy={ROW_Y[ri] + 32} />
              </g>
            ))}
          </Build>
        ))}

        {/* 3 — seat row highlights */}
        <Build step={3}>
          <rect x={COL_X - 8} y={ROW_Y[4]} width={COL_W * 6 + 16} height={64} rx={12} fill="rgba(199,125,69,.06)" stroke="rgba(199,125,69,.45)" strokeWidth={1.5} />
          {rows[4].map((cell, ci) => (
            <g key={`seat-${ci}`}>
              <rect x={COL_X + ci * COL_W} y={ROW_Y[4]} width={123} height={64} rx={10} fill="none" stroke="url(#loopay-gradient)" strokeWidth={1.2} />
              <HarveyBall cell={cell} cx={COL_X + ci * COL_W + 61.5} cy={ROW_Y[4] + 32} />
            </g>
          ))}
        </Build>
      </DiagramFrame>

      {/* 4 — closing chip */}
      <div className="mt-1 flex shrink-0 justify-center">
        <motion.span
          initial={reduced ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="rounded-md border border-[rgba(199,125,69,.45)] bg-[rgba(199,125,69,.08)] px-4 py-2 text-center text-sm font-medium text-foreground"
        >
          Every other model pays the local operator fees. Only the seat makes it a shareholder with a territory.
        </motion.span>
      </div>
    </NetworkSlideShell>
  );
}
