import { motion, useReducedMotion } from "framer-motion";
import { useDeckContent } from "../../data/deck-lang-context";
import { NetworkSlideShell, SlideHeading, DiagramFrame } from "../shared/network-slide-shell";
import { Build, DrawPath, DText } from "../shared/diagram-motion";

/* Slide 3 — The problem (Fix 3). Two columns in ONE exhibit.
   Left: six operator nodes on a regular hexagon (15 links clipped to
   circle edges), four cost dots per node, one legend, one callout on the
   top node. Right: "when the rails get bought" ledger panel with US$0.
   Build: 1 nodes · 2 links draw · 3 callout + dots + legend · 4 panel. */

const CX = 380;
const CY = 330;
const R_HEX = 200;
const R_NODE = 52;

// Regular hexagon: angles 90, 30, −30, −90, −150, 150 (degrees).
const NODES = [90, 30, -30, -90, -150, 150].map((deg) => {
  const rad = (deg * Math.PI) / 180;
  return { x: CX + R_HEX * Math.cos(rad), y: CY - R_HEX * Math.sin(rad) };
});

const NODE_LABELS = ["Operator CO", "Operator MX", "Operator BR", "Operator PE", "Operator EC", "Operator US"];

// Cost dot colors from the brand gradient family (orange, red, blue, sky).
const COST_COLORS = ["#c77d45", "#b23b2f", "#4a7dc4", "#6ba3e8"];

/** Link between two nodes, clipped to circle edges (r + 4 margin). */
function clippedLink(a: { x: number; y: number }, b: { x: number; y: number }) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy);
  const ux = dx / len;
  const uy = dy / len;
  const m = R_NODE + 4;
  return `M ${a.x + ux * m} ${a.y + uy * m} L ${b.x - ux * m} ${b.y - uy * m}`;
}

const LINKS: string[] = [];
for (let i = 0; i < NODES.length; i++) {
  for (let j = i + 1; j < NODES.length; j++) {
    LINKS.push(clippedLink(NODES[i], NODES[j]));
  }
}

export function NetworkProblemSlide() {
  const { content } = useDeckContent();
  const t = content.problem;
  const reduced = useReducedMotion();
  const deals = content.whyNow.deals;

  const topNode = NODES[0]; // 90° node

  return (
    <NetworkSlideShell steps={4}>
      <SlideHeading label={t.sectionLabel} headline={t.headline} />
      <DiagramFrame>
        {/* 2 — 15 links draw (behind nodes) */}
        {LINKS.map((d, i) => (
          <DrawPath key={d} step={2} i={i} d={d} length={400} stroke="currentColor" strokeWidth={1} opacity={0.22} />
        ))}

        {/* 1 — six nodes */}
        {NODES.map((n, i) => (
          <Build key={NODE_LABELS[i]} step={1} i={i}>
            <circle cx={n.x} cy={n.y} r={R_NODE} fill="rgba(255,255,255,.07)" stroke="url(#loopay-gradient)" strokeWidth={1.5} />
            <DText x={n.x} y={n.y + 5} size={15} anchor="middle">
              {NODE_LABELS[i]}
            </DText>
          </Build>
        ))}

        {/* 3 — four cost dots inside every node */}
        {NODES.map((n, i) => (
          <Build key={`dots-${NODE_LABELS[i]}`} step={3} i={i}>
            {COST_COLORS.map((c, ci) => (
              <circle key={c} cx={n.x - 18 + ci * 12} cy={n.y + 24} r={4} fill={c} />
            ))}
          </Build>
        ))}

        {/* 3 — callout with the four cost chips, next to the top node */}
        <Build step={3}>
          <path d={`M${topNode.x + R_NODE + 4} ${topNode.y} L470 96 L470 68`} fill="none" stroke="currentColor" strokeWidth={1} opacity={0.35} />
          <rect x={470} y={40} width={200} height={112} rx={10} fill="rgba(255,255,255,.05)" stroke="currentColor" strokeWidth={1} opacity={0.35} />
          {t.costChips.map((chip, i) => (
            <g key={chip}>
              <rect x={482} y={50 + i * 26} width={176} height={22} rx={11} fill="none" stroke="currentColor" strokeWidth={1} opacity={0.3} />
              <DText x={570} y={65 + i * 26} size={13} anchor="middle" fill="currentColor" opacity={0.8}>
                {chip}
              </DText>
            </g>
          ))}
        </Build>

        {/* 3 — link legend + cost legend */}
        <Build step={3}>
          <DText x={40} y={620} size={13} fill="currentColor" opacity={0.6} mono>
            15 links for 6 operators
          </DText>
          <g>
            {t.costChips.map((chip, i) => (
              <g key={`leg-${chip}`}>
                <circle cx={40 + i * 168 + 190} cy={616} r={4} fill={COST_COLORS[i]} />
                <DText x={40 + i * 168 + 200} y={620} size={13} fill="currentColor" opacity={0.6} mono>
                  {chip}
                </DText>
              </g>
            ))}
            <DText x={40 + 4 * 168 + 190} y={620} size={13} fill="currentColor" opacity={0.6} mono>
              · rebuilt per operator
            </DText>
          </g>
        </Build>

        {/* 4 — right ledger panel */}
        <Build step={4}>
          <motion.g
            initial={reduced ? false : { x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <rect x={760} y={60} width={400} height={540} rx={16} fill="rgba(255,255,255,.03)" stroke="currentColor" strokeWidth={1} opacity={0.3} />
            <DText x={788} y={92} size={12} fill="currentColor" opacity={0.6} mono>
              WHEN THE RAILS GET BOUGHT
            </DText>
            {deals.map((d, i) => (
              <g key={d.deal}>
                <DText x={788} y={140 + i * 44} size={16} fill="currentColor" opacity={0.85}>
                  {d.deal}
                </DText>
                <DText x={1132} y={140 + i * 44} size={16} anchor="end" fill="currentColor" opacity={0.85} mono>
                  {d.amount}
                </DText>
                <path d={`M788 ${152 + i * 44} L1132 ${152 + i * 44}`} stroke="currentColor" strokeWidth={1} opacity={0.12} />
              </g>
            ))}
            <path d="M788 270 L1132 270" stroke="currentColor" strokeWidth={1} opacity={0.2} />
            <DText x={788} y={330} size={16} fill="currentColor" opacity={0.85}>
              The operators who
            </DText>
            <DText x={788} y={352} size={16} fill="currentColor" opacity={0.85}>
              carried the flows
            </DText>
            <motion.text
              x={788}
              y={420}
              fontSize={64}
              fontWeight={700}
              fill="currentColor"
              fontFamily="var(--font-mono, ui-monospace, monospace)"
              initial={reduced ? false : { opacity: 0.4 }}
              animate={{ opacity: [0.4, 1, 0.9] }}
              transition={{ duration: 0.6 }}
            >
              US$0
            </motion.text>
            <DText x={788} y={480} size={13} fill="currentColor" opacity={0.55}>
              No local player exits alone
            </DText>
            <DText x={788} y={498} size={13} fill="currentColor" opacity={0.55}>
              at Bridge speed.
            </DText>
          </motion.g>
        </Build>
      </DiagramFrame>
    </NetworkSlideShell>
  );
}
