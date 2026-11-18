import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLingui } from '@lingui/react/macro';

const CX = 200;
const CY = 200;
const RADIUS = 150;
const NODE_R = 8;

function polarToXY(angleDeg: number, r: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) };
}

function labelPosition(angle: number, x: number, y: number) {
  const isBottom = angle > 30 && angle < 150;
  const isTop = angle > 210 && angle < 330;
  const dy = isBottom ? 24 : isTop ? -18 : 4;
  return { lx: x, ly: y + dy };
}

const NODE_COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
  'var(--chart-1)',
];

export function InfrastructureGraph() {
  const { t } = useLingui();
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const services = [
    {
      label: 'Cross-border',
      angle: 0,
      desc: t`International payments in seconds. +45 countries, +50 currencies.`,
    },
    {
      label: 'On/Off Ramp',
      angle: 60,
      desc: t`Fiat to crypto and back. One step. Integrated KYC.`,
    },
    {
      label: 'Cards',
      angle: 120,
      desc: t`Virtual and physical corporate cards. Real-time control.`,
    },
    {
      label: 'Smart Treasury',
      angle: 180,
      desc: t`Automated treasury. Optimize liquidity, minimize FX risk.`,
    },
    {
      label: 'Vaults',
      angle: 240,
      desc: t`Your capital never stops. Yields up to 12% annually. Institutional custody.`,
    },
    {
      label: 'FX Engine',
      angle: 300,
      desc: t`Real-time exchange rates. Multi-currency conversion.`,
    },
  ];

  return (
    <div className="w-full h-full flex items-center justify-center relative">
      <svg
        viewBox="0 0 400 400"
        className="w-full h-full"
        fill="none"
      >
        {/* Pulse rings */}
        {[0, 1, 2].map((i) => (
          <motion.circle
            key={`pulse-${i}`}
            cx={CX}
            cy={CY}
            r={16}
            className="stroke-foreground/4"
            strokeWidth={1}
            fill="none"
            initial={{ r: 16, opacity: 0.4 }}
            animate={{ r: 70, opacity: 0 }}
            transition={{
              duration: 3.5,
              ease: 'easeOut',
              repeat: Infinity,
              delay: i * 1.2,
            }}
          />
        ))}

        {/* Outer orbit ring */}
        <motion.circle
          cx={CX}
          cy={CY}
          r={RADIUS}
          className="stroke-border/20"
          strokeWidth={1}
          strokeDasharray="3 6"
          fill="none"
          initial={{ opacity: 0, pathLength: 0 }}
          animate={{ opacity: 1, pathLength: 1 }}
          transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
        />

        {/* Connection lines */}
        {services.map((s, i) => {
          const { x, y } = polarToXY(s.angle, RADIUS);
          const isHovered = hoveredIdx === i;
          return (
            <motion.line
              key={`line-${i}`}
              x1={CX}
              y1={CY}
              x2={x}
              y2={y}
              stroke={isHovered ? NODE_COLORS[i] : undefined}
              className={isHovered ? undefined : 'stroke-border/40'}
              strokeWidth={isHovered ? 1.5 : 0.5}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{
                duration: 0.8,
                ease: 'easeOut',
                delay: 0.6 + i * 0.12,
              }}
            />
          );
        })}

        {/* Service nodes */}
        {services.map((s, i) => {
          const { x, y } = polarToXY(s.angle, RADIUS);
          const { lx, ly } = labelPosition(s.angle, x, y);
          const isHovered = hoveredIdx === i;

          return (
            <motion.g
              key={s.label}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 0.4,
                ease: 'easeOut',
                delay: 1 + i * 0.1,
              }}
              style={{ transformOrigin: `${x}px ${y}px`, cursor: 'pointer' }}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              {/* Hover glow ring */}
              <circle
                cx={x}
                cy={y}
                r={NODE_R + 6}
                fill={isHovered ? NODE_COLORS[i] : 'transparent'}
                opacity={isHovered ? 0.1 : 0}
                style={{ transition: 'opacity 150ms, fill 150ms' }}
              />

              {/* Node outer */}
              <circle
                cx={x}
                cy={y}
                r={NODE_R}
                fill={NODE_COLORS[i]}
                opacity={isHovered ? 0.3 : 0.15}
                style={{ transition: 'opacity 150ms' }}
              />

              {/* Node inner */}
              <circle
                cx={x}
                cy={y}
                r={3.5}
                fill={NODE_COLORS[i]}
                opacity={isHovered ? 1 : 0.7}
                style={{ transition: 'opacity 150ms' }}
              />

              {/* Label */}
              <text
                x={lx}
                y={ly}
                textAnchor="middle"
                fill={isHovered ? NODE_COLORS[i] : undefined}
                className={isHovered ? 'font-mono' : 'fill-muted-foreground font-mono'}
                fontSize={9}
                fontWeight={isHovered ? 600 : 400}
                letterSpacing="0.03em"
                style={{ transition: 'fill 150ms' }}
              >
                {s.label}
              </text>
            </motion.g>
          );
        })}

        {/* Center hub */}
        <motion.g
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut', delay: 0.3 }}
          style={{ transformOrigin: `${CX}px ${CY}px` }}
        >
          <circle cx={CX} cy={CY} r={24} className="fill-foreground" />
          <text
            x={CX}
            y={CY + 1}
            textAnchor="middle"
            dominantBaseline="central"
            className="fill-background font-heading"
            fontSize={7.5}
            fontWeight={600}
            letterSpacing="0.12em"
          >
            SOBERANA
          </text>
        </motion.g>

        {/* Traveling data dots */}
        {services.map((s, i) => {
          const { x, y } = polarToXY(s.angle, RADIUS);
          return (
            <motion.circle
              key={`dot-${i}`}
              r={2}
              fill={NODE_COLORS[i]}
              initial={{ cx: CX, cy: CY, opacity: 0 }}
              animate={{
                cx: [CX, x, CX],
                cy: [CY, y, CY],
                opacity: [0, 0.8, 0],
              }}
              transition={{
                duration: 3 + i * 0.4,
                ease: 'easeInOut',
                repeat: Infinity,
                delay: 1.8 + i * 0.5,
              }}
            />
          );
        })}
      </svg>

      {/* Tooltip — positioned outside SVG */}
      <AnimatePresence>
        {hoveredIdx !== null && (
          <motion.div
            key={hoveredIdx}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-64 rounded-lg border border-border bg-card p-3 shadow-md"
          >
            <p className="font-heading text-xs font-semibold text-foreground mb-1">
              {services[hoveredIdx].label}
            </p>
            <p className="font-body text-xs text-muted-foreground leading-relaxed">
              {services[hoveredIdx].desc}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
