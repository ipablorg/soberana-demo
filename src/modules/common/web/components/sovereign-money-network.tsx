// Canvas 2D — Approved Literal Color Exception per CLAUDE.md §6 (Canvas 2D rendering context)

import { useEffect, useRef } from 'react';

// ── Color helpers ─────────────────────────────────────────────────────────────

const WARM_R = 0xe8, WARM_G = 0x70, WARM_B = 0x3a; // #E8703A
const COOL_R = 0x7c, COOL_G = 0x6f, COOL_B = 0xcd; // #7C6FCD

function lerpColor(t: number, alpha = 1): string {
  const r = Math.round(WARM_R + (COOL_R - WARM_R) * t);
  const g = Math.round(WARM_G + (COOL_G - WARM_G) * t);
  const b = Math.round(WARM_B + (COOL_B - WARM_B) * t);
  return `rgba(${r},${g},${b},${alpha})`;
}

const C = {
  mapStroke:  'rgba(255,255,255,0.07)',
  nodeFill:   '#ffffff',
  nodeAura:   'rgba(255,255,255,0.18)',
  arcRest:    'rgba(255,255,255,0.05)',
  warm:       '#E8703A',
  cool:       '#7C6FCD',
} as const;

// ── City nodes ───────────────────────────────────────────────────────────────

interface CityNode { lat: number; lng: number }

const ALL_NODES: CityNode[] = [
  /* 0  NY  */ { lat:  40.7, lng:  -74.0 },
  /* 1  MIA */ { lat:  25.8, lng:  -80.2 },
  /* 2  LON */ { lat:  51.5, lng:   -0.1 },
  /* 3  FRA */ { lat:  50.1, lng:    8.7 },
  /* 4  DXB */ { lat:  25.2, lng:   55.3 },
  /* 5  SIN */ { lat:   1.4, lng:  103.8 },
  /* 6  HKG */ { lat:  22.3, lng:  114.2 },
  /* 7  TYO */ { lat:  35.7, lng:  139.7 },
  /* 8  GRU */ { lat: -23.5, lng:  -46.6 },
  /* 9  BOG */ { lat:   4.7, lng:  -74.1 },
  /* 10 MEX */ { lat:  19.4, lng:  -99.1 },
  /* 11 LOS */ { lat:   6.5, lng:    3.4 },
  /* 12 NBO */ { lat:  -1.3, lng:   36.8 },
  /* 13 CAI */ { lat:  30.0, lng:   31.2 },
  /* 14 BOM */ { lat:  19.1, lng:   72.9 },
  /* 15 SYD */ { lat: -33.9, lng:  151.2 },
  /* 16 YYZ */ { lat:  43.7, lng:  -79.4 },
  /* 17 ZRH */ { lat:  47.4, lng:    8.5 },
  /* 18 AMS */ { lat:  52.4, lng:    4.9 },
  /* 19 IST */ { lat:  41.0, lng:   29.0 },
  /* 20 EZE */ { lat: -34.6, lng:  -58.4 },
  /* 21 LIM */ { lat: -12.0, lng:  -77.0 },
  /* 22 MNL */ { lat:  14.6, lng:  121.0 },
];

// 12-node subset for mobile (same original indices used in route arrays)
const MOBILE_NODE_IDX = [0, 2, 3, 4, 5, 7, 8, 9, 11, 13, 14, 15];

// ── Routes (35 corridors, prioritising real high-volume lanes) ────────────────

const ALL_ROUTES: [number, number][] = [
  // US ↔ LatAm
  [0, 9], [0, 8], [1, 10], [1, 20], [1, 21],
  // US ↔ Europe
  [0, 2], [0, 3], [16, 18],
  // Europe ↔ Africa
  [2, 11], [3, 13], [18, 12],
  // UAE ↔ Asia
  [4, 14], [4, 5], [4, 6],
  // Asia ↔ Pacific
  [5, 7], [5, 15], [6, 7], [22, 5],
  // Europe ↔ Asia
  [2, 4], [3, 19], [17, 4],
  // LatAm internal
  [9, 8], [10, 9], [21, 8],
  // Africa internal
  [11, 12], [11, 13],
  // Cross-Pacific
  [0, 7], [1, 15], [7, 15],
  // Additional
  [14, 2], [19, 4], [13, 4], [3, 7], [8, 2],
];

const MOBILE_ROUTES: [number, number][] = [
  [0, 2], [0, 8], [2, 4], [4, 5],
  [5, 7], [7, 15], [2, 11], [4, 14],
  [0, 9], [3, 13], [5, 15], [9, 8],
];

// ── World map — simplified continent outlines [lat, lng] ─────────────────────

const CONTINENTS: [number, number][][] = [
  [ // North America
    [71,-168],[70,-135],[62,-92],[47,-53],[43,-66],[41,-70],
    [25,-80],[18,-88],[9,-79],[9,-84],[15,-88],[22,-105],
    [23,-110],[32,-117],[49,-124],[60,-140],[71,-168],
  ],
  [ // South America
    [12,-71],[10,-63],[5,-52],[0,-50],[-5,-35],[-15,-39],
    [-23,-43],[-34,-52],[-42,-62],[-55,-68],[-55,-65],
    [-18,-70],[-5,-81],[0,-78],[8,-77],[12,-71],
  ],
  [ // Europe
    [71,26],[60,30],[56,24],[57,10],[58,5],[51,3],[44,-9],
    [36,-9],[36,-5],[37,3],[38,15],[40,20],[46,14],[37,23],
    [42,28],[46,30],[48,24],[50,30],[71,26],
  ],
  [ // Africa
    [37,10],[37,12],[30,32],[15,42],[11,43],[4,43],[1,34],
    [-11,34],[-26,34],[-35,20],[-34,26],[-20,35],[0,9],
    [5,2],[15,-17],[37,10],
  ],
  [ // Asia
    [71,26],[71,68],[72,140],[68,168],[50,150],[40,140],
    [35,127],[25,121],[20,110],[1,104],[5,100],[10,80],
    [20,72],[25,57],[30,50],[27,36],[37,36],[40,36],
    [40,30],[46,30],[48,24],[50,30],[71,26],
  ],
  [ // Australia / Oceania
    [-17,122],[-22,114],[-32,116],[-35,138],[-38,147],
    [-38,149],[-22,150],[-15,145],[-12,136],[-12,130],[-17,122],
  ],
];

// ── Geometry ─────────────────────────────────────────────────────────────────

function project(lat: number, lng: number, w: number, h: number) {
  // Fix aspect ratio to ~1.8 (similar to 16:9) to prevent distortion
  const MAP_ASPECT = 1.8;
  
  let mapW = w;
  let mapH = w / MAP_ASPECT;
  
  // On desktop or ultrawide screens, if height is the constraint, fit by height
  if (mapH > h) {
    mapH = h;
    mapW = h * MAP_ASPECT;
  }
  
  // On mobile screens, scale the map slightly (1.15x) so it isn't too small,
  // while ensuring all mobile nodes (e.g. SYD at lng 151) stay inside the viewport.
  const isMobile = w < 768;
  if (isMobile) {
    const scale = 1.15;
    mapW *= scale;
    mapH *= scale;
  }
  
  // Center the map in the container
  const ox = (w - mapW) / 2;
  const oy = (h - mapH) / 2;
  
  return { 
    x: ox + ((lng + 180) / 360) * mapW, 
    y: oy + ((90 - lat) / 180) * mapH 
  };
}

function ctrlPt(x0: number, y0: number, x1: number, y1: number) {
  const mx = (x0 + x1) / 2;
  const my = (y0 + y1) / 2;
  const d = Math.hypot(x1 - x0, y1 - y0);
  return { cx: mx, cy: my - d * 0.35 };
}

function bezierAt(
  x0: number, y0: number, cx: number, cy: number,
  x1: number, y1: number, t: number,
) {
  const u = 1 - t;
  return { x: u*u*x0 + 2*u*t*cx + t*t*x1, y: u*u*y0 + 2*u*t*cy + t*t*y1 };
}

// ── Particle ──────────────────────────────────────────────────────────────────

interface Particle { route: number; t: number; speed: number }

function mkParticle(total: number, avoid = -1): Particle {
  let r = Math.floor(Math.random() * total);
  if (r === avoid && total > 1) r = (r + 1) % total;
  return { route: r, t: Math.random(), speed: 0.0008 + Math.random() * 0.0007 };
}

// ── Component ─────────────────────────────────────────────────────────────────

export function SovereignMoneyNetwork({ className, paused = false }: { className?: string, paused?: boolean }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const cvRef  = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const pausedRef = useRef(paused);
  
  // Static elements cache
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    const box = boxRef.current;
    const cv  = cvRef.current;
    if (!box || !cv) return;

    const mobile  = window.innerWidth < 768;
    const nodes   = mobile ? MOBILE_NODE_IDX.map(i => ALL_NODES[i]) : ALL_NODES;
    const routes  = mobile ? MOBILE_ROUTES : ALL_ROUTES;
    const PARTS   = mobile ? 15 : 22;

    // Node pulse state
    const phase  = nodes.map(() => Math.random() * Math.PI * 2);
    const period = nodes.map(() => 120 + Math.random() * 120);

    // Particles
    const parts: Particle[] = Array.from({ length: PARTS }, () =>
      mkParticle(routes.length),
    );

    const renderStaticElements = (width: number, height: number, dpr: number) => {
      if (typeof document === 'undefined') return;
      if (!offscreenCanvasRef.current) {
        offscreenCanvasRef.current = document.createElement('canvas');
      }
      const offCv = offscreenCanvasRef.current;
      offCv.width = width * dpr;
      offCv.height = height * dpr;
      const oCtx = offCv.getContext('2d')!;
      oCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      oCtx.clearRect(0, 0, width, height);

      // ── Continent outlines — Loopay gradient silhouette
      const mapGrad = oCtx.createLinearGradient(0, 0, width, height);
      mapGrad.addColorStop(0, `rgba(${WARM_R},${WARM_G},${WARM_B},0.45)`);
      mapGrad.addColorStop(1, `rgba(${COOL_R},${COOL_G},${COOL_B},0.45)`);
      oCtx.strokeStyle = mapGrad;
      oCtx.lineWidth   = 1.2;
      for (const poly of CONTINENTS) {
        oCtx.beginPath();
        poly.forEach(([lat, lng], i) => {
          const { x, y } = project(lat, lng, width, height);
          i === 0 ? oCtx.moveTo(x, y) : oCtx.lineTo(x, y);
        });
        oCtx.closePath();
        oCtx.stroke();
      }

      // ── Inactive arcs
      oCtx.lineWidth = 0.5;
      for (const [a, b] of routes) {
        const nA = ALL_NODES[a];
        const nB = ALL_NODES[b];
        const A  = project(nA.lat, nA.lng, width, height);
        const B  = project(nB.lat, nB.lng, width, height);
        const { cx, cy } = ctrlPt(A.x, A.y, B.x, B.y);
        oCtx.beginPath();
        oCtx.strokeStyle = C.arcRest;
        oCtx.moveTo(A.x, A.y);
        oCtx.quadraticCurveTo(cx, cy, B.x, B.y);
        oCtx.stroke();
      }
    };

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = box.offsetWidth;
      const h = box.offsetHeight;
      cv.width  = w  * dpr;
      cv.height = h * dpr;
      renderStaticElements(w, h, dpr);
    };
    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(box);

    const onVis = () => { pausedRef.current = document.hidden || paused; };
    document.addEventListener('visibilitychange', onVis);

    const draw = () => {
      if (pausedRef.current) { 
        rafRef.current = requestAnimationFrame(draw); 
        return; 
      }

      const dpr = window.devicePixelRatio || 1;
      const W   = box.offsetWidth;
      const H   = box.offsetHeight;
      const ctx = cv.getContext('2d')!;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);

      // Draw static background (map + inactive arcs)
      if (offscreenCanvasRef.current) {
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform to draw image at pixel scale
        ctx.drawImage(offscreenCanvasRef.current, 0, 0);
        ctx.restore();
      }

      // ── Particle trails + heads
      for (const p of parts) {
        const [a, b] = routes[p.route];
        const A  = project(ALL_NODES[a].lat, ALL_NODES[a].lng, W, H);
        const B  = project(ALL_NODES[b].lat, ALL_NODES[b].lng, W, H);
        const { cx, cy } = ctrlPt(A.x, A.y, B.x, B.y);

        const STEPS      = 30;
        const trailStart = Math.max(0, p.t - 0.28);

        for (let s = 0; s < STEPS; s++) {
          const t0    = trailStart + (p.t - trailStart) * (s / STEPS);
          const t1    = trailStart + (p.t - trailStart) * ((s + 1) / STEPS);
          const alpha = 0.05 + (s / STEPS) * 0.70;
          const pt0   = bezierAt(A.x, A.y, cx, cy, B.x, B.y, t0);
          const pt1   = bezierAt(A.x, A.y, cx, cy, B.x, B.y, t1);
          ctx.beginPath();
          ctx.strokeStyle = lerpColor(p.t, alpha);
          ctx.lineWidth   = 1.5;
          ctx.moveTo(pt0.x, pt0.y);
          ctx.lineTo(pt1.x, pt1.y);
          ctx.stroke();
        }

        // Particle head
        const head = bezierAt(A.x, A.y, cx, cy, B.x, B.y, p.t);
        // Aura instead of shadowBlur for better performance
        ctx.beginPath();
        ctx.arc(head.x, head.y, 7, 0, Math.PI * 2);
        ctx.fillStyle = lerpColor(p.t, 0.2); // semi-transparent
        ctx.fill();

        ctx.beginPath();
        ctx.arc(head.x, head.y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle   = lerpColor(p.t, 1);
        ctx.fill();
      }

      // ── Nodes
      for (let i = 0; i < nodes.length; i++) {
        phase[i] += (Math.PI * 2) / period[i];
        const { x, y } = project(nodes[i].lat, nodes[i].lng, W, H);
        const aura = 8 + 4 * Math.sin(phase[i]);

        ctx.beginPath();
        ctx.arc(x, y, aura, 0, Math.PI * 2);
        ctx.strokeStyle = C.nodeAura;
        ctx.lineWidth   = 1;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fillStyle = C.nodeFill;
        ctx.fill();
      }

      // ── Hexagon core (subtle easter egg — rotates 360° in 20s)
      /* 
      // The background hex core circle has been removed as per prompt #3
      hexRot += (Math.PI * 2) / (20 * 60);
      const hx = W / 2;
      const hy = H / 2;
      const hr = 40;
      const hg = ctx.createLinearGradient(hx - hr, hy - hr, hx + hr, hy + hr);
      hg.addColorStop(0, C.warm + '55'); // ~33% opacity
      hg.addColorStop(1, C.cool + '55');
      ctx.lineWidth = 1.5;
      for (let s = 0; s < 6; s++) {
        const a0 = hexRot + (s * Math.PI) / 3;
        const a1 = hexRot + ((s + 1) * Math.PI) / 3;
        ctx.beginPath();
        ctx.moveTo(hx + hr * Math.cos(a0), hy + hr * Math.sin(a0));
        ctx.arc(hx, hy, hr, a0, a1);
        ctx.strokeStyle = hg;
        ctx.stroke();
      }
      */

      // ── Advance particles
      for (const p of parts) {
        p.t += p.speed;
        if (p.t >= 1) {
          const np = mkParticle(routes.length, p.route);
          p.route = np.route;
          p.t     = 0;
          p.speed = np.speed;
        }
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      if (offscreenCanvasRef.current) {
        offscreenCanvasRef.current.width = 0;
        offscreenCanvasRef.current.height = 0;
        offscreenCanvasRef.current = null;
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div ref={boxRef} className={className}>
      <canvas ref={cvRef} className="w-full h-full" />
    </div>
  );
}
