import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { useDeckContent } from "../../data/deck-lang-context";
import { NetworkSlideShell, SlideHeading } from "../shared/network-slide-shell";

/* Slide 8 — The flywheel. Faithful port of the landing's #flywheel-sec
   into ONE React component: single <svg viewBox="0 0 560 400">, dashed
   track (280,200) r=148, .fly-arcs with arrowhead marker, self-drawing
   .fw-draw circle (dasharray 928), .fw-comet, centre text, five SVG pills.
   Continuous rotation uses SVG <animateTransform from="0 280 200" to="360
   280 200"> on each rotating group — origin-safe in every browser and React.
   The entrance sequence (CSS) is unchanged. Under prefers-reduced-motion and
   in print the animateTransform elements are not rendered, arcs rest at their
   natural path positions. Max width 640px, centred. */

const PILL_CSS = `
.nd-fw-svg .fw-draw { opacity: 0; }
.nd-fw-live .nd-fw-svg .fw-draw { opacity: 1; animation: nd-fw-draw 1.6s cubic-bezier(.05,.7,.1,1) .9s forwards; stroke-dashoffset: 928; }
.nd-fw-svg .fw-comet { opacity: 0; }
.nd-fw-live .nd-fw-svg .fw-comet { opacity: 1; animation-delay: .9s; }
.nd-fw-svg .fly-arcs { opacity: 0; }
.nd-fw-live .nd-fw-svg .fly-arcs { opacity: 0; animation: nd-fly-arcs-in .6s ease-out 2.2s forwards; }
@keyframes nd-fw-draw { to { stroke-dashoffset: 0; } }
@keyframes nd-fly-arcs-in { to { opacity: .85; } }
.nd-fw-svg .fw-title { opacity: 0; }
.nd-fw-live .nd-fw-svg .fw-title { animation: nd-fw-title-in .4s ease-out .85s forwards; }
@keyframes nd-fw-title-in { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
.nd-fw-svg .fw-word { opacity: 0; }
.nd-fw-live .nd-fw-svg .fw-word { animation: nd-fw-word-rise .9s cubic-bezier(.2,.7,.3,1) forwards; }
.nd-fw-live .nd-fw-svg .fw-word:nth-of-type(1) { animation-delay: 1.4s; }
.nd-fw-live .nd-fw-svg .fw-word:nth-of-type(2) { animation-delay: 1.55s; }
.nd-fw-live .nd-fw-svg .fw-word:nth-of-type(3) { animation-delay: 1.7s; }
.nd-fw-live .nd-fw-svg .fw-word:nth-of-type(4) { animation-delay: 1.85s; }
.nd-fw-live .nd-fw-svg .fw-word:nth-of-type(5) { animation-delay: 2s; }
@keyframes nd-fw-word-rise {
  0% { opacity: 0; transform: translateY(16px) scale(.94); }
  60% { opacity: 1; }
  100% { opacity: 1; transform: translateY(0) scale(1); }
}
.nd-fw-svg .fw-pill rect, .nd-fw-svg .fw-pill text { opacity: 0; }
.nd-fw-live .nd-fw-svg .fw-pill rect, .nd-fw-live .nd-fw-svg .fw-pill text { animation: nd-fw-pill-in .4s ease-out forwards; }
.nd-fw-live .nd-fw-svg .fw-pill:nth-of-type(1) rect, .nd-fw-live .nd-fw-svg .fw-pill:nth-of-type(1) text { animation-delay: 2.4s; }
.nd-fw-live .nd-fw-svg .fw-pill:nth-of-type(2) rect, .nd-fw-live .nd-fw-svg .fw-pill:nth-of-type(2) text { animation-delay: 2.55s; }
.nd-fw-live .nd-fw-svg .fw-pill:nth-of-type(3) rect, .nd-fw-live .nd-fw-svg .fw-pill:nth-of-type(3) text { animation-delay: 2.7s; }
.nd-fw-live .nd-fw-svg .fw-pill:nth-of-type(4) rect, .nd-fw-live .nd-fw-svg .fw-pill:nth-of-type(4) text { animation-delay: 2.85s; }
.nd-fw-live .nd-fw-svg .fw-pill:nth-of-type(5) rect, .nd-fw-live .nd-fw-svg .fw-pill:nth-of-type(5) text { animation-delay: 3s; }
@keyframes nd-fw-pill-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
.nd-fw-svg .fw-pill ellipse { opacity: 0; }
.nd-fw-live .nd-fw-svg .fw-pill ellipse { animation: nd-pill-breathe 3.4s ease-in-out 3.1s infinite, nd-fw-pill-in .4s ease-out 3.1s forwards; }
@keyframes nd-pill-breathe { 0%,100% { opacity: .55; transform: scale(1); } 50% { opacity: 1; transform: scale(1.06); } }
.fw-pill { transform-box: fill-box; transform-origin: center; }
.fw-word { transform-box: fill-box; }
@media (prefers-reduced-motion: reduce) {
  .nd-fw-svg .fw-title, .nd-fw-svg .fw-pill rect, .nd-fw-svg .fw-pill text, .nd-fw-svg .fw-pill ellipse, .nd-fw-svg .fw-word { animation: none !important; opacity: 1 !important; }
  .nd-fw-svg .fw-draw { animation: none !important; stroke-dashoffset: 0 !important; opacity: 1 !important; }
  .nd-fw-svg .fw-comet { animation: none !important; opacity: 0 !important; }
  .nd-fw-svg .fly-arcs { animation: none !important; opacity: .85 !important; }
}
@media print {
  .nd-fw-svg .fw-title, .nd-fw-svg .fw-pill rect, .nd-fw-svg .fw-pill text, .nd-fw-svg .fw-pill ellipse, .nd-fw-svg .fw-word { animation: none !important; opacity: 1 !important; }
  .nd-fw-svg .fw-draw { animation: none !important; stroke-dashoffset: 0 !important; opacity: 1 !important; }
  .nd-fw-svg .fw-comet { opacity: 0 !important; }
  .nd-fw-svg .fly-arcs { opacity: .85 !important; }
}
`;

const ARCS = [
  "M330.6 60.9 A148 148 0 0 1 396.6 108.9",
  "M427.9 205.2 A148 148 0 0 1 402.7 282.8",
  "M320.8 342.3 A148 148 0 0 1 239.2 342.3",
  "M157.3 282.8 A148 148 0 0 1 132.1 205.2",
  "M163.4 108.9 A148 148 0 0 1 229.4 60.9",
];

// [rectX, rectY, rectW, cx, text, needsWiden]
const PILLS: Array<[number, number, number, number, string]> = [
  [205, 28, 150, 280, "More members"],
  [418, 132, 136, 486, "More volume"],
  [404, 268, 164, 486, "Better pricing & liquidity"],
  [196, 352, 168, 280, "Stronger product"],
  [12, 200, 152, 88, "More inbound clients"],
];

export function NetworkFlywheelSlide() {
  const { content } = useDeckContent();
  const t = content.flywheel;
  const reduced = useReducedMotion();
  const [live, setLive] = useState(false);

  // Fire the CSS entrance sequence when the slide mounts.
  // Continuous rotation is handled by SVG animateTransform (origin-safe).
  useEffect(() => {
    if (reduced) return;
    setLive(true);
  }, [reduced]);

  const words = t.centerWords.length === 5 ? t.centerWords : ["each", "member", "compounds", "the value", "of every other"];
  const pills = t.steps.length === 5 ? t.steps : PILLS.map((p) => p[4]);

  return (
    <NetworkSlideShell>
      <SlideHeading label={t.sectionLabel} headline={t.headline} />
      <style>{PILL_CSS}</style>
      <div
        className={`nd-flywheel ${live ? "nd-fw-live" : ""} mx-auto flex w-full max-w-[640px] flex-1 items-center justify-center`}
        style={{ minHeight: 0 }}
      >
        <svg
          className="nd-fw-svg block h-auto w-full"
          viewBox="0 0 560 400"
          xmlns="http://www.w3.org/2000/svg"
          role="img"
        >
          <defs>
            <marker id="fly-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0 0 L10 5 L0 10 z" fill="#c77d45" />
            </marker>
            <linearGradient id="fly-grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#c77d45" />
              <stop offset="50%" stopColor="#b23b2f" />
              <stop offset="80%" stopColor="#4a7dc4" />
              <stop offset="100%" stopColor="#6ba3e8" />
            </linearGradient>
            <filter id="fly-glow" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="3.5" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <radialGradient id="pill-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#c77d45" stopOpacity=".38" />
              <stop offset="55%" stopColor="#4a7dc4" stopOpacity=".16" />
              <stop offset="100%" stopColor="#4a7dc4" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* circular track */}
          <circle cx="280" cy="200" r="148" fill="none" stroke="rgba(255,255,255,.07)" strokeWidth="1.5" strokeDasharray="4 7" />
          {/* five arcs with arrow marker — continuous rotation via animateTransform (origin-safe) */}
          <g className="fly-arcs" fill="none" stroke="#c77d45" strokeWidth="2" markerEnd="url(#fly-arrow)">
            {!reduced && (
              <animateTransform attributeName="transform" type="rotate" from="0 280 200" to="360 280 200" dur="26s" repeatCount="indefinite" />
            )}
            {ARCS.map((d) => (
              <path key={d} d={d} />
            ))}
          </g>
          {/* self-drawing energy ring — continuous rotation via animateTransform */}
          <circle className="fw-draw" cx="280" cy="200" r="148" fill="none" stroke="url(#fly-grad)" strokeWidth="2.4" strokeLinecap="round" strokeDasharray="928" strokeDashoffset="928">
            {!reduced && (
              <animateTransform attributeName="transform" type="rotate" from="0 280 200" to="360 280 200" dur="26s" repeatCount="indefinite" />
            )}
          </circle>
          {/* comet — continuous rotation via animateTransform */}
          <circle className="fw-comet" cx="280" cy="200" r="148" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeDasharray="10 918" filter="url(#fly-glow)">
            {!reduced && (
              <animateTransform attributeName="transform" type="rotate" from="0 280 200" to="360 280 200" dur="26s" repeatCount="indefinite" />
            )}
          </circle>

          {/* centre label */}
          <text className="fw-title" x="280" y="192" textAnchor="middle" fill="#fff" fontFamily="ui-monospace,monospace" fontSize="15" fontWeight="700" letterSpacing="1">
            {t.centerTitle}
          </text>
          <g className="fw-words" fontFamily="Geist, sans-serif" fontSize="11.5" fill="#9aa1ad" textAnchor="middle">
            {words.map((w, i) => (
              <text key={w + i} className="fw-word" x="280" y={214 + i * 17}>
                {w}
              </text>
            ))}
          </g>

          {/* five pills at exact landing positions */}
          <g fontFamily="Geist, sans-serif" fontWeight="600" textAnchor="middle">
            {PILLS.map(([, ry, rw, cx, fallback], i) => {
              const label = pills[i] ?? fallback;
              // "Better pricing & liquidity" is longer: smaller font + wider box, capped inside viewBox 560
              const long = label.length > 20;
              const width = long ? 168 : rw;
              const fontSize = long ? 11 : 13;
              const x = cx - width / 2;
              return (
                <g className="fw-pill" key={label}>
                  <ellipse cx={cx} cy={ry + 20} rx={width / 2 + 16} ry={34} fill="url(#pill-glow)" />
                  <rect x={x} y={ry} width={width} height={40} rx={20} fill="#151515" stroke="rgba(255,255,255,.1)" />
                  <text x={cx} y={ry + 25} fill="#fff" fontSize={fontSize}>
                    {label}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
      </div>
      <p className="shrink-0 pt-3 text-center text-sm text-muted-foreground">
        Every member makes the network stronger and cheaper for the ones already in.
      </p>
    </NetworkSlideShell>
  );
}
