#!/usr/bin/env node
/**
 * Generates the BaaS commercial proposal PDF for the Fedegan/Paynet ecosystem
 * (Indra – BeMySelf), in Loopay brand voice and visual identity.
 *
 * Output: docs/proposals/loopay-baas-fedegan-paynet.pdf (A4, 2 pages, Spanish)
 *
 * Dependencies: puppeteer (already used by generate-product-pdfs.mjs)
 * Usage: node scripts/generate-baas-proposal-pdf.mjs
 */

import { readFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import puppeteer from 'puppeteer';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const OUT_DIR = join(ROOT, 'docs', 'proposals');
const LOGO_BLACK = join(ROOT, 'src', 'shared', 'assets', 'loopay_logos', 'Loopay-LogoBlack.png');

// Brand palette — same validated set as generate-investor-onepager.mjs
const C = {
  blue: '#4a7dc4',
  red: '#b23b2f',
  orange: '#c77d45',
  navy: '#2f5f9e',
  ink: '#111111',
  ink2: '#444444',
  muted: '#777777',
  hairline: '#e5e5e5',
  wash: '#f7f6f4',
};

function toBase64(filePath) {
  return readFileSync(filePath).toString('base64');
}

// ── Money-flow diagram (afiliado → Paynet → Loopay → marketplace) ───────────
function moneyFlow() {
  const W = 720, H = 74;
  const boxes = [
    { x: 8, t: 'Afiliado Fedegan', s: 'compra dentro del ecosistema', dark: false },
    { x: 190, t: 'Wallet Paynet', s: 'BeMySelf (BMS) · Indra', dark: false },
    { x: 372, t: 'Loopay BaaS', s: 'holding · dispersión TED', accent: true, dark: false },
    { x: 554, t: 'Marketplace y aliados', s: 'pago completado', dark: true },
  ];
  const bw = 158, bh = 46, by = 14;

  const rects = boxes
    .map(
      (b) => `
    <rect x="${b.x}" y="${by}" width="${bw}" height="${bh}" rx="8" fill="${b.dark ? C.ink : C.wash}" stroke="${b.dark ? C.ink : b.accent ? C.orange : C.hairline}" stroke-width="${b.accent ? 2 : 1}"/>
    <text x="${b.x + bw / 2}" y="${by + 20}" text-anchor="middle" font-size="10.5" font-weight="700" fill="${b.dark ? '#ffffff' : C.ink}">${b.t}</text>
    <text x="${b.x + bw / 2}" y="${by + 34}" text-anchor="middle" font-size="8" fill="${b.dark ? '#bbbbbb' : C.muted}">${b.s}</text>`
    )
    .join('');

  const arrows = boxes
    .slice(0, -1)
    .map((b, i) => {
      const x1 = b.x + bw + 4;
      const x2 = boxes[i + 1].x - 4;
      const ym = by + bh / 2;
      return `
    <line x1="${x1}" y1="${ym}" x2="${x2 - 5}" y2="${ym}" stroke="${C.orange}" stroke-width="1.5"/>
    <polygon points="${x2},${ym} ${x2 - 5},${ym - 3.5} ${x2 - 5},${ym + 3.5}" fill="${C.orange}"/>`;
    })
    .join('');

  return `
  <svg viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="Flujo del dinero: del afiliado, por la wallet Paynet, a través de los rieles de Loopay, hasta el marketplace y aliados">
    ${rects}
    ${arrows}
  </svg>`;
}

// ── HTML template — two A4 pages, light, print-first ───────────────────────
function buildHTML(logoBase64) {
  const banks = [
    'Grupo Aval',
    'Banco de Bogotá',
    'Itaú',
    'Banco Cooperativo Coopcentral',
    'BBVA',
    'Davivienda',
    'Scotiabank',
    'Bancolombia',
    'Transfiya + Bre-B',
  ];
  const bankChips = banks.map((b) => `<span class="bank-chip">${b}</span>`).join('');

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8" />
<title>Loopay — Propuesta Comercial BaaS · Fedegan/Paynet</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  @page { size: A4 portrait; margin: 0; }
  html, body { width: 210mm; }
  body { font-family: 'Inter', -apple-system, 'Segoe UI', sans-serif; color: ${C.ink}; background: #ffffff; }
  .page {
    height: 297mm; overflow: hidden; display: flex; flex-direction: column;
    padding: 9mm 10mm 8mm 10mm;
  }
  .page + .page { page-break-before: always; }

  /* ── Header ── */
  header {
    display: flex; justify-content: space-between; align-items: center;
    padding-bottom: 8px; border-bottom: 2px solid ${C.ink};
  }
  header img { height: 22px; width: auto; }
  .header-meta { font-size: 7pt; color: ${C.muted}; letter-spacing: 0.12em; text-transform: uppercase; font-weight: 600; text-align: right; line-height: 1.5; }

  /* ── Hero ── */
  .hero { padding: 10px 0 9px 0; }
  .hero h1 { font-size: 24pt; font-weight: 800; letter-spacing: -0.03em; line-height: 1.04; }
  .hero h1 em { font-style: normal; color: ${C.red}; }
  .hero .sub { font-size: 10pt; font-weight: 600; color: ${C.ink}; margin-top: 6px; }
  .hero p { font-size: 9.5pt; color: ${C.ink2}; margin-top: 5px; line-height: 1.5; max-width: 165mm; }

  /* ── Stat strip ── */
  .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin: 4px 0 10px 0; }
  .stat { border: 1px solid ${C.hairline}; border-radius: 8px; padding: 8px 10px 7px 10px; background: ${C.wash}; }
  .stat.dark { background: ${C.ink}; border-color: ${C.ink}; }
  .stat b { display: block; font-size: 15pt; font-weight: 800; letter-spacing: -0.02em; line-height: 1.1; }
  .stat.dark b { color: #ffffff; }
  .stat span { display: block; font-size: 6.6pt; color: ${C.muted}; letter-spacing: 0.08em; text-transform: uppercase; font-weight: 600; margin-top: 3px; line-height: 1.4; }
  .stat.dark span { color: #999999; }

  /* ── Sections ── */
  section { min-height: 0; }
  h2 {
    font-size: 8pt; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase;
    color: ${C.red}; margin-bottom: 6px;
  }
  h2 .num { color: ${C.muted}; font-weight: 600; margin-right: 5px; }
  p.body { font-size: 8.4pt; color: ${C.ink2}; line-height: 1.55; }
  p.body + p.body { margin-top: 5px; }
  p.body strong { color: ${C.ink}; font-weight: 600; }

  ul.tight { list-style: none; }
  ul.tight li { font-size: 8.2pt; color: ${C.ink2}; line-height: 1.5; padding-left: 12px; position: relative; margin-bottom: 4px; }
  ul.tight li::before { content: ''; position: absolute; left: 0; top: 6px; width: 5px; height: 5px; border-radius: 1.5px; background: ${C.red}; }
  ul.tight li strong { color: ${C.ink}; font-weight: 600; }

  .grid { display: grid; gap: 10px; }
  .cols-2 { grid-template-columns: 1fr 1fr; }

  /* ── Scope cards ── */
  .scope-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 8px; }
  .scope-card { border: 1px solid ${C.hairline}; border-radius: 8px; padding: 9px 10px; background: #ffffff; }
  .scope-card b { display: block; font-size: 9.5pt; font-weight: 700; letter-spacing: -0.01em; }
  .scope-card i { display: block; font-style: normal; font-size: 7pt; color: ${C.red}; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; margin: 2px 0 4px 0; }
  .scope-card p { font-size: 7.8pt; color: ${C.ink2}; line-height: 1.45; }

  .out-of-scope { background: ${C.wash}; border-left: 3px solid ${C.muted}; border-radius: 0 7px 7px 0; padding: 7px 10px; font-size: 7.8pt; color: ${C.ink2}; line-height: 1.5; }
  .out-of-scope strong { color: ${C.ink}; font-weight: 700; }

  .flow-box { border: 1px solid ${C.hairline}; border-radius: 8px; padding: 6px 8px 2px 8px; background: ${C.wash}; }

  /* ── Page 2: phases ── */
  .phase-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 10px; }
  .phase-card { border: 1px solid ${C.hairline}; border-radius: 8px; padding: 10px 11px; background: #ffffff; }
  .phase-card .phase-tag { display: inline-block; font-size: 6.6pt; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #ffffff; background: ${C.navy}; border-radius: 4px; padding: 2.5px 7px; margin-bottom: 6px; }
  .phase-card.accent .phase-tag { background: ${C.red}; }
  .phase-card b { display: block; font-size: 10pt; font-weight: 700; letter-spacing: -0.01em; margin-bottom: 3px; }
  .phase-card p { font-size: 8pt; color: ${C.ink2}; line-height: 1.5; }

  /* ── Bank chips ── */
  .bank-chips { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px; }
  .bank-chip {
    font-size: 7.6pt; font-weight: 600; color: ${C.ink};
    border: 1px solid ${C.hairline}; background: #ffffff; border-radius: 999px; padding: 4px 11px;
  }

  /* ── Pricing table ── */
  table.pricing { width: 100%; border-collapse: collapse; margin-top: 2px; }
  table.pricing th {
    font-size: 6.8pt; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: ${C.muted};
    text-align: left; padding: 4px 8px; border-bottom: 1.5px solid ${C.ink};
  }
  table.pricing td { font-size: 8pt; padding: 7px 8px; border-bottom: 1px solid ${C.hairline}; vertical-align: top; }
  table.pricing tr:last-child td { border-bottom: none; }
  table.pricing td.concept { font-weight: 700; color: ${C.ink}; }
  table.pricing td.value { font-weight: 800; color: ${C.navy}; white-space: nowrap; font-variant-numeric: tabular-nums; }
  table.pricing td.detail { color: ${C.ink2}; line-height: 1.45; }
  table.pricing tr.loopay-row td { background: ${C.wash}; }
  table.pricing tr.loopay-row td:first-child { border-left: 3px solid ${C.red}; border-radius: 3px 0 0 3px; }

  /* ── Docs links ── */
  .doc-boxes { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  .doc-box { border: 1px solid ${C.hairline}; border-radius: 8px; padding: 9px 11px; background: #ffffff; }
  .doc-box b { display: block; font-size: 8pt; font-weight: 700; color: ${C.ink}; }
  .doc-box span { display: block; font-size: 9.5pt; font-weight: 700; color: ${C.navy}; margin-top: 3px; font-variant-numeric: tabular-nums; }
  .doc-box i { display: block; font-style: normal; font-size: 7pt; color: ${C.muted}; margin-top: 2px; }

  /* ── Next steps (dark) ── */
  .next-steps { background: ${C.ink}; color: #ffffff; border-radius: 10px; padding: 12px 14px; margin-top: auto; }
  .next-steps h2 { color: ${C.orange}; }
  .steps { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
  .step { font-size: 8pt; color: #cccccc; line-height: 1.5; }
  .step .n { display: block; font-size: 14pt; font-weight: 800; color: ${C.orange}; margin-bottom: 3px; }
  .step strong { color: #ffffff; font-weight: 600; }

  /* ── Footer ── */
  footer {
    margin-top: 8px; padding-top: 7px; border-top: 1px solid ${C.hairline};
    display: flex; justify-content: space-between; align-items: center; font-size: 7pt; color: ${C.muted};
  }
  footer .who { display: flex; gap: 14px; }
  footer .who b { color: ${C.ink}; font-weight: 600; }
  footer .who span { color: ${C.muted}; }
</style>
</head>
<body>

<!-- ═══════════════ PAGE 1 ═══════════════ -->
<div class="page">

  <header>
    <img src="data:image/png;base64,${logoBase64}" alt="Loopay" />
    <div class="header-meta">Propuesta Comercial · Banking as a Service<br/>Confidencial — Bogotá, Colombia · Septiembre 2026</div>
  </header>

  <div class="hero">
    <h1>Su ecosistema. <em>Nuestra infraestructura.</em></h1>
    <div class="sub">Loopay BaaS para el ecosistema Fedegan / Paynet (Indra – BeMySelf)</div>
    <p>Loopay opera como proveedor de infraestructura financiera (BaaS) del ecosistema Fedegan/Paynet: holding de los fondos del afiliado y dispersión de pagos hacia el marketplace y aliados — todo mediante una sola integración.</p>
  </div>

  <div class="stats">
    <div class="stat dark"><b>100%</b><span>Cobertura de bancos de salida en Colombia</span></div>
    <div class="stat"><b>1</b><span>API multi-moneda: cuentas, wallets y pagos</span></div>
    <div class="stat"><b>2</b><span>Fases: marketplace hoy, Google/Apple Pay después</span></div>
  </div>

  <section>
    <h2><span class="num">01</span>Contexto</h2>
    <p class="body">Fedegan busca poner al servicio de sus afiliados (ganaderos) un ecosistema digital con e-commerce, aliados comerciales y una wallet de dinero con crédito y capacidad de compra. El ecosistema opera sobre la plataforma <strong>Paynet</strong>, propiedad de <strong>BeMySelf (BMS)</strong>, con <strong>Indra</strong> como cara comercial y operativa frente a Fedegan.</p>
    <p class="body">Dentro de esta arquitectura, <strong>Loopay habilita los movimientos de dinero</strong> que requiere la wallet del afiliado:</p>
    <div class="flow-box">${moneyFlow()}</div>
  </section>

  <section style="margin-top: 10px;">
    <h2><span class="num">02</span>Alcance de la propuesta</h2>
    <p class="body" style="margin-bottom: 6px;">Esta propuesta cubre el servicio de BaaS para que el afiliado pueda pagar (<strong>Pay Out</strong>) dentro del ecosistema Fedegan/Paynet. La operación de Loopay se limita a:</p>
    <div class="scope-cards">
      <div class="scope-card">
        <b>Holding de recursos</b>
        <i>Custodia</i>
        <p>Custodia de los fondos del afiliado dentro de la infraestructura de Loopay.</p>
      </div>
      <div class="scope-card">
        <b>Dispersión de fondos</b>
        <i>Pay Out</i>
        <p>Ejecución de los pagos hacia el marketplace y aliados mediante transferencia (tipo TED).</p>
      </div>
    </div>
    <div class="out-of-scope"><strong>Fuera del alcance — a cargo de Indra/BeMySelf:</strong> onboarding y validación de identidad del afiliado (KYC) · cumplimiento y gestión de riesgo · motor de crédito y fondeo (Indra/BMS fondean la operación).</div>
  </section>

  <section style="margin-top: 10px;">
    <h2><span class="num">03</span>Modelo de servicio: API Service</h2>
    <p class="body" style="margin-bottom: 5px;">Loopay ofrece su BaaS bajo dos modelos: <strong>White Label</strong> y <strong>API Service</strong>. Para este proyecto se propone el modelo <strong>API Service</strong>, que permite:</p>
    <ul class="tight">
      <li><strong>Una sola integración, todo el dinero:</strong> acceso multi-moneda a cuentas, wallets y pagos instantáneos.</li>
      <li><strong>Servicios financieros dentro de Paynet:</strong> integrados directamente en la plataforma, vía infraestructura y APIs de Loopay.</li>
      <li><strong>Dispersión automatizada de principio a fin:</strong> el pago del afiliado llega a su destino sin intervención manual.</li>
    </ul>
  </section>

  <footer>
    <div class="who">
      <div><b>Diego Muñoz</b> <span>CEO · dm@loopay.com</span></div>
      <div><b>Carlos Ortegon</b> <span>CTO · co@loopay.com</span></div>
    </div>
    <div>loopay.com · Soberana by Loopay</div>
  </footer>

</div>

<!-- ═══════════════ PAGE 2 ═══════════════ -->
<div class="page">

  <header>
    <img src="data:image/png;base64,${logoBase64}" alt="Loopay" />
    <div class="header-meta">Propuesta Comercial · BaaS — Fedegan / Paynet<br/>Página 2 de 2</div>
  </header>

  <section style="margin-top: 12px;">
    <h2><span class="num">04</span>Fases del servicio</h2>
    <div class="phase-cards">
      <div class="phase-card">
        <span class="phase-tag">Fase 1</span>
        <b>Pagos dentro del marketplace</b>
        <p>El afiliado realiza pagos y compras dentro del marketplace de la plataforma Paynet, con dispersión de fondos vía Loopay.</p>
      </div>
      <div class="phase-card accent">
        <span class="phase-tag">Fase 2</span>
        <b>Compras fuera de la plataforma</b>
        <p>El afiliado compra fuera de la plataforma mediante tarjeta, habilitada a través de Google Pay y Apple Pay. Loopay aporta la emisión de la tarjeta Visa.</p>
      </div>
    </div>
  </section>

  <section>
    <h2><span class="num">05</span>Cobertura de pagos locales</h2>
    <p class="body">Loopay cuenta con cobertura de <strong>todos los bancos de salida (disbursement) en Colombia</strong> para la dispersión de fondos hacia el afiliado. Entre las conexiones directas se incluyen:</p>
    <div class="bank-chips">${bankChips}</div>
  </section>

  <section style="margin-top: 12px;">
    <h2><span class="num">06</span>Modelo de pricing</h2>
    <p class="body" style="margin-bottom: 6px;">El cobro se reparte entre las dos partes según el tipo de operación: <strong>Paynet cobra el Pay In</strong> (ingreso de fondos del afiliado) y <strong>Loopay cobra el Pay Out</strong> (dispersión/pago). Cada parte retiene uno de los dos cobros.</p>
    <table class="pricing">
      <thead>
        <tr><th>Concepto</th><th>Valor</th><th>Detalle</th></tr>
      </thead>
      <tbody>
        <tr>
          <td class="concept">Setup inicial</td>
          <td class="value">USD 30.000</td>
          <td class="detail">Pago único por la puesta a punto de los rieles de pago y la integración inicial.</td>
        </tr>
        <tr class="loopay-row">
          <td class="concept">Pay Out (Loopay)</td>
          <td class="value">COP 2.500 + 0,4%</td>
          <td class="detail">Se cobra por transferencia, cada vez que el afiliado realiza una compra (dispersión). Cobro de Loopay.</td>
        </tr>
        <tr>
          <td class="concept">Pay In (Paynet)</td>
          <td class="value">A definir</td>
          <td class="detail">Costo del ingreso de fondos, a cargo y cobrado por Paynet.</td>
        </tr>
      </tbody>
    </table>
  </section>

  <section style="margin-top: 12px;">
    <h2><span class="num">07</span>Documentación técnica</h2>
    <p class="body" style="margin-bottom: 6px;">La documentación completa de las APIs del BaaS de Loopay está disponible para revisión del equipo técnico de Indra/BeMySelf:</p>
    <div class="doc-boxes">
      <div class="doc-box">
        <b>Documentación</b>
        <span>loopay.mintlify.app</span>
        <i>https://loopay.mintlify.app/</i>
      </div>
      <div class="doc-box">
        <b>Ambiente API</b>
        <span>api.loopay.com</span>
        <i>Sandbox y producción</i>
      </div>
    </div>
  </section>

  <div class="next-steps" style="margin-top: 12px;">
    <h2><span class="num">08</span>Próximos pasos</h2>
    <div class="steps">
      <div class="step"><span class="n">1</span><strong>Revisión técnica</strong> de la documentación de APIs por parte de Indra/BeMySelf.</div>
      <div class="step"><span class="n">2</span><strong>Validación conjunta</strong> del flujo de dispersión (Pay Out) sobre el ecosistema Paynet.</div>
      <div class="step"><span class="n">3</span><strong>Cronograma de implementación</strong> para la Fase 1.</div>
    </div>
  </div>

  <footer>
    <div class="who">
      <div><b>Diego Muñoz</b> <span>CEO · dm@loopay.com</span></div>
      <div><b>Carlos Ortegon</b> <span>CTO · co@loopay.com</span></div>
    </div>
    <div>loopay.com · Soberana by Loopay — Bogotá, septiembre 2026</div>
  </footer>

</div>

</body>
</html>`;
}

// ── Main ──────────────────────────────────────────────────────────────────

async function main() {
  const logoBase64 = toBase64(LOGO_BLACK);
  if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--font-render-hinting=none'],
  });

  const page = await browser.newPage();
  await page.setContent(buildHTML(logoBase64), { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 1500));

  const outPath = join(OUT_DIR, 'loopay-baas-fedegan-paynet.pdf');
  await page.pdf({
    path: outPath,
    format: 'A4',
    printBackground: true,
    margin: { top: '0', right: '0', bottom: '0', left: '0' },
  });
  await page.close();
  await browser.close();
  console.log(`✅  Saved → ${outPath}`);
}

main().catch((err) => {
  console.error('❌  PDF generation failed:', err);
  process.exit(1);
});
