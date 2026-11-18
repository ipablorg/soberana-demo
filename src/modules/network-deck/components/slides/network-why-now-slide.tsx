import { motion, useReducedMotion } from "framer-motion";
import { useDeckContent } from "../../data/deck-lang-context";
import { NetworkSlideShell, SlideHeading, DiagramFrame } from "../shared/network-slide-shell";
import { Build, DrawPath, DText } from "../shared/diagram-motion";
import bridgeLogo from "../../assets/bridge.svg";
import stripeLogo from "../../assets/stripe.svg";
import bvnkLogo from "../../assets/bvnk.svg";
import mastercardLogo from "../../assets/mastercard.svg";
import payoneerLogo from "../../assets/payoneer.svg";
import nuveiLogo from "../../assets/nuvei.svg";

/* Slide 2 — Why now (Fix 2). Four equal cards on a timeline; the
   proportion lives in a bar inside each card, not in the container size.
   Cards 1-3: acquisition logo pair → amount → pair name → proportional
   bar → date. Card 4 (dashed): the operators who carried the flows: US$0.
   Build: 1 chips+timeline · 2 three cards stagger · 3 bars fill · 4 dashed
   card + US$0 pulse. viewBox 1200×640. */

// Logo map: acquired → acquirer.
const DEAL_LOGOS: Record<string, [string, string]> = {
  "Bridge → Stripe": [bridgeLogo, stripeLogo],
  "BVNK → Mastercard": [bvnkLogo, mastercardLogo],
  "Payoneer → Nuvei": [payoneerLogo, nuveiLogo],
};

const CARD_X = [60, 340, 620, 900];
const CARD_Y = 180;
const CARD_W = 240;
const CARD_H = 320;

function LogoBox({ x, y, src, name }: { x: number; y: number; src: string | undefined; name: string }) {
  if (!src) {
    return (
      <DText x={x + 44} y={y + 21} size={13} anchor="middle" weight={600} opacity={0.85}>
        {name}
      </DText>
    );
  }
  return (
    <image
      href={src}
      x={x}
      y={y}
      height={24}
      width={88}
      preserveAspectRatio="xMidYMid meet"
    />
  );
}

export function NetworkWhyNowSlide() {
  const { content } = useDeckContent();
  const t = content.whyNow;
  const reduced = useReducedMotion();

  const deals = t.deals.slice(0, 3);
  const maxAmount = 2.75;

  return (
    <NetworkSlideShell steps={4}>
      <SlideHeading label={t.sectionLabel} headline={t.headline} />
      <DiagramFrame>
        {/* 1 — regulatory chips row */}
        <Build step={1}>
          {t.regChips.map((chip, i) => (
            <g key={chip}>
              <rect x={40 + i * 230} y={24} width={210} height={32} rx={16} fill="rgba(255,255,255,.04)" stroke="currentColor" strokeWidth={1} opacity={0.5} />
              <DText x={145 + i * 230} y={45} size={14} anchor="middle" fill="currentColor" opacity={0.75} mono>
                {chip}
              </DText>
            </g>
          ))}
        </Build>
        {/* 1 — timeline */}
        <DrawPath step={1} d="M40 560 L1160 560" length={1120} stroke="currentColor" strokeWidth={1} opacity={0.4} />
        {/* years under the timeline, centred under each card */}
        <Build step={1}>
          {t.deals.map((d, i) => (
            <DText key={`year-${i}-${d.year}`} x={CARD_X[i] + CARD_W / 2} y={596} size={13} anchor="middle" fill="currentColor" opacity={0.6} mono>
              {d.year}
            </DText>
          ))}
          <DText x={CARD_X[3] + CARD_W / 2} y={596} size={13} anchor="middle" fill="currentColor" opacity={0.6} mono>
            {t.emptyValue === "US$0" ? "2024–2026" : ""}
          </DText>
        </Build>

        {/* 2 — three acquisition cards */}
        {deals.map((deal, i) => {
          const logos = DEAL_LOGOS[deal.deal] ?? [undefined, undefined];
          const [acquiredName, acquirerName] = deal.deal.split(" → ");
          return (
            <Build key={deal.deal} step={2} i={i}>
              <g>
                <rect x={CARD_X[i]} y={CARD_Y} width={CARD_W} height={CARD_H} rx={16} fill="rgba(255,255,255,.07)" stroke="url(#loopay-gradient)" strokeWidth={1.5} />
                {/* logo row */}
                <LogoBox x={CARD_X[i] + 24} y={CARD_Y + 28} src={logos[0]} name={acquiredName ?? ""} />
                <DText x={CARD_X[i] + 120} y={CARD_Y + 45} size={18} anchor="middle" fill="currentColor" opacity={0.6}>
                  →
                </DText>
                <LogoBox x={CARD_X[i] + 128} y={CARD_Y + 28} src={logos[1]} name={acquirerName ?? ""} />
                {/* amount */}
                <DText x={CARD_X[i] + CARD_W / 2} y={CARD_Y + 138} size={34} anchor="middle" weight={700} mono>
                  {deal.amount}
                </DText>
                {/* pair */}
                <DText x={CARD_X[i] + CARD_W / 2} y={CARD_Y + 166} size={14} anchor="middle" fill="currentColor" opacity={0.65}>
                  {deal.deal}
                </DText>
              </g>
            </Build>
          );
        })}
        {deals.map((deal, i) => {
          const amountNum = Number(deal.amount.replace(/[^0-9.]/g, ""));
          const barW = Math.max((192 * amountNum) / maxAmount, 6);
          return (
            <motion.rect
              key={`bar-${deal.deal}`}
              x={CARD_X[i] + 24}
              y={CARD_Y + 210}
              width={barW}
              height={10}
              rx={5}
              fill="url(#loopay-gradient)"
              initial={reduced ? false : { width: 0 }}
              animate={{ width: barW }}
              transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
              opacity={0.9}
            />
          );
        })}
        <Build step={2}>
          {deals.map((deal, i) => (
            <rect key={`track-${deal.deal}`} x={CARD_X[i] + 24} y={CARD_Y + 210} width={192} height={10} rx={5} fill="none" stroke="currentColor" strokeWidth={1} opacity={0.12} />
          ))}
        </Build>
        {/* dates */}
        <Build step={3}>
          {deals.map((deal, i) => (
            <DText key={`date-${deal.deal}`} x={CARD_X[i] + CARD_W / 2} y={CARD_Y + 262} size={13} anchor="middle" fill="currentColor" opacity={0.55} mono>
              {deal.source}
            </DText>
          ))}
        </Build>

        {/* 4 — dashed operators card */}
        <Build step={4}>
          <rect x={CARD_X[3]} y={CARD_Y} width={CARD_W} height={CARD_H} rx={16} fill="rgba(255,255,255,.03)" stroke="currentColor" strokeWidth={1.5} strokeDasharray="6 6" opacity={0.4} />
          <DText x={CARD_X[3] + CARD_W / 2} y={CARD_Y + 112} size={16} anchor="middle" fill="currentColor" opacity={0.85}>
            {t.emptyLabel.replace(":", "")}
          </DText>
          <DText x={CARD_X[3] + CARD_W / 2} y={CARD_Y + 134} size={16} anchor="middle" fill="currentColor" opacity={0.85}>
            US$0
          </DText>
          <motion.g
            initial={reduced ? false : { opacity: 0.4, scale: 0.96 }}
            animate={{ opacity: [0.4, 1, 0.85], scale: 1 }}
            transition={{ duration: 0.6, times: [0, 0.5, 1] }}
            style={{ transformOrigin: `${CARD_X[3] + CARD_W / 2}px ${CARD_Y + 190}px` }}
          >
            <DText x={CARD_X[3] + CARD_W / 2} y={CARD_Y + 200} size={34} anchor="middle" weight={700} mono>
              {t.emptyValue}
            </DText>
          </motion.g>
          <rect x={CARD_X[3] + 24} y={CARD_Y + 230} width={192} height={10} rx={5} fill="none" stroke="currentColor" strokeWidth={1} opacity={0.12} />
        </Build>
      </DiagramFrame>
    </NetworkSlideShell>
  );
}
