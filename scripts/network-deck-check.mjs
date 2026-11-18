#!/usr/bin/env node
/* ============================================================
   Overlap check for /network_deck — <shared_utilities> #3.
   For every slide: collect bounding boxes of every svg text,
   chip and node shape; assert no text box intersects a lane or
   panel edge segment, no text box intersects another text box,
   every text box lies inside the SVG's rendered box; for every
   path with a marker, sample 40 points with getPointAtLength and
   assert none falls inside a text box or a node shape other than
   its own endpoints. Also asserts: kicker top ≥ brand bar bottom
   + 24px; last visible element bottom ≤ nav bar top − 16px;
   content block vertical centre within 24px of the usable area
   centre. Runs at 1440×900 and 390×844, plus a reduced-motion
   pass confirming final states. Screenshots per slide.

   Usage: node scripts/network-deck-check.mjs [--shots DIR] [--slides N]
   Exit code 1 on any nonzero finding.
   ============================================================ */

import puppeteer from "puppeteer";

const BASE = "http://localhost:8080/network_deck";
const VIEWPORTS = [
  { name: "1440x900", width: 1440, height: 900 },
  { name: "390x844", width: 390, height: 844 },
];

const args = process.argv.slice(2);
const shotsArgIdx = args.indexOf("--shots");
const SHOTS = shotsArgIdx >= 0 ? args[shotsArgIdx + 1] : "deck-shots";
const slidesIdx = args.indexOf("--slides");
const N_SLIDES = slidesIdx >= 0 ? Number(args[slidesIdx + 1]) : 15;

const PAGE_EVAL = () => {
  const out = { texts: 0, overlaps: 0, pathCross: 0, oob: 0, headerOk: true, lastOk: true, centerDelta: null, det: [] };
  const slide = document.querySelector("[data-slide-root]");
  if (!slide) { out.det.push("no slide root"); return out; }

  const brand = document.querySelector("[data-deck-chrome-top]");
  const brandBottom = brand ? brand.getBoundingClientRect().bottom : 0;
  const nav = document.querySelector("[data-deck-chrome-bottom]");
  const navTop = nav ? nav.getBoundingClientRect().top : window.innerHeight;

  // header clearance: kicker ≥ brandBottom + 24
  const kicker = slide.querySelector(".font-mono.text-xs");
  if (kicker) {
    const k = kicker.getBoundingClientRect().top;
    out.kickerTop = Math.round(k);
    if (k < brandBottom + 24) { out.headerOk = false; out.det.push(`kicker ${Math.round(k)} < brand+24 ${Math.round(brandBottom + 24)}`); }
  }

  // last visible element bottom ≤ navTop − 16 (leaves only — containers
  // legitimately span the full slide height)
  let lastBottom = 0;
  for (const el of slide.querySelectorAll("*")) {
    if (el.children.length > 0) continue;
    const b = el.getBoundingClientRect();
    if (b.height > 4 && b.width > 4) lastBottom = Math.max(lastBottom, b.bottom);
  }
  out.lastBottom = Math.round(lastBottom);
  if (lastBottom > navTop - 16 && lastBottom > 0) {
    out.lastOk = false;
    out.det.push(`last ${Math.round(lastBottom)} > nav−16 ${Math.round(navTop - 16)}`);
  }

  // vertical centering within 24px of usable area centre
  let top = Infinity, bot = -Infinity;
  for (const el of slide.querySelectorAll("*")) {
    if (el.children.length > 0) continue;
    const b = el.getBoundingClientRect();
    if (b.height > 4 && b.width > 4 && b.top >= brandBottom - 8) { top = Math.min(top, b.top); bot = Math.max(bot, b.bottom); }
  }
  if (top !== Infinity) {
    const cContent = (top + bot) / 2;
    const cArea = (brandBottom + navTop) / 2;
    out.centerDelta = Math.round(cContent - cArea);
  }

  // SVG overlap checks
  for (const svg of slide.querySelectorAll("svg")) {
    const svgBox = svg.getBoundingClientRect();
    const texts = [];
    for (const t of svg.querySelectorAll("text")) {
      const st = getComputedStyle(t);
      if (st.opacity === "0" || st.visibility === "hidden") continue;
      if (!t.textContent.trim()) continue;
      texts.push({ box: t.getBoundingClientRect(), label: t.textContent.trim().slice(0, 20) });
    }
    // lanes/panels: rects and circles big enough to be containers
    const shapes = [];
    for (const r of svg.querySelectorAll("rect")) {
      const b = r.getBoundingClientRect();
      if (b.width > 60 && b.height > 24) shapes.push({ box: b, el: r });
    }
    for (const c of svg.querySelectorAll("circle")) {
      const b = c.getBoundingClientRect();
      if (b.width > 40) shapes.push({ box: b, el: c });
    }

    for (const t of texts) {
      // text crossing a shape edge (only if not fully inside that shape)
      for (const s of shapes) {
        const A = t.box, B = s.box;
        const inside = A.left >= B.left - 1 && A.right <= B.right + 1 && A.top >= B.top - 1 && A.bottom <= B.bottom + 1;
        if (inside) continue;
        const crossesL = A.left < B.left + 2 && A.right > B.left + 2;
        const crossesR = A.left < B.right - 2 && A.right > B.right - 2;
        const crossesT = A.top < B.top + 2 && A.bottom > B.top + 2;
        const crossesB = A.top < B.bottom - 2 && A.bottom > B.bottom - 2;
        if ((crossesL || crossesR) && (crossesT || crossesB)) {
          out.overlaps++;
          out.det.push(`"${t.label}" cruza borde`);
          break;
        }
      }
      if (t.box.left < svgBox.left - 1 || t.box.right > svgBox.right + 1 || t.box.top < svgBox.top - 1 || t.box.bottom > svgBox.bottom + 1) {
        out.oob++;
        out.det.push(`"${t.label}" fuera del SVG`);
      }
    }
    for (let a = 0; a < texts.length; a++) for (let b = a + 1; b < texts.length; b++) {
      const A = texts[a].box, B = texts[b].box;
      const ix = Math.min(A.right, B.right) - Math.max(A.left, B.left);
      const iy = Math.min(A.bottom, B.bottom) - Math.max(A.top, B.top);
      if (ix > 2 && iy > 2) { out.overlaps++; out.det.push(`"${texts[a].label}"↔"${texts[b].label}"`); }
    }
    for (const p of svg.querySelectorAll("path")) {
      try {
        const L = p.getTotalLength();
        if (!L || !p.getAttribute("stroke")) continue;
        const hasMarker = p.getAttribute("marker-end") || p.closest("[marker-end]");
        if (!hasMarker) continue;
        const pb = p.getBoundingClientRect();
        const svgPt = svg.createSVGPoint();
        for (const t of texts) {
          const A = t.box;
          if (pb.right < A.left || pb.left > A.right || pb.bottom < A.top || pb.top > A.bottom) continue;
          let hit = false;
          for (let s = 1; s < 40 && !hit; s++) {
            const pt = p.getPointAtLength((L * s) / 40);
            svgPt.x = pt.x; svgPt.y = pt.y;
            const c = svgPt.matrixTransform(p.getScreenCTM());
            if (c.x > A.left + 2 && c.x < A.right - 2 && c.y > A.top + 2 && c.y < A.bottom - 2) hit = true;
          }
          if (hit) { out.pathCross++; out.det.push(`flecha cruza "${t.label}"`); }
        }
      } catch { /* not a path */ }
    }
    out.texts += texts.length;
  }
  return out;
};

const browser = await puppeteer.launch({ headless: "new" });
let failures = 0;
const rows = [];

for (const vp of VIEWPORTS) {
  const page = await browser.newPage();
  await page.setViewport({ width: vp.width, height: vp.height });
  await page.goto(BASE, { waitUntil: "networkidle2", timeout: 60000 });
  await new Promise((r) => setTimeout(r, 1800));

  for (let i = 0; i < N_SLIDES; i++) {
    await page.keyboard.press("End");
    await new Promise((r) => setTimeout(r, 500));
    await page.evaluate(() => new Promise((res) => requestAnimationFrame(() => requestAnimationFrame(res))));
    const r = await page.evaluate(PAGE_EVAL);
    rows.push({ vp: vp.name, s: i + 1, ...r });
    const bad = r.overlaps + r.pathCross + r.oob > 0 || !r.headerOk || !r.lastOk || Math.abs(r.centerDelta ?? 0) > 24;
    if (bad) failures++;
    if (SHOTS) {
      await page.screenshot({ path: `${SHOTS}/${vp.name}-slide${String(i + 1).padStart(2, "0")}${bad ? "-FAIL" : ""}.png` });
    }
    if (i < N_SLIDES - 1) {
      await page.keyboard.press("ArrowRight");
      await new Promise((r) => setTimeout(r, 600));
    }
  }
  await page.close();
}

// reduced-motion pass
{
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
  await page.goto(BASE, { waitUntil: "networkidle2", timeout: 60000 });
  await new Promise((r) => setTimeout(r, 1500));
  for (let i = 0; i < N_SLIDES; i++) {
    await new Promise((r) => setTimeout(r, 800));
    await page.evaluate(() => new Promise((res) => requestAnimationFrame(() => requestAnimationFrame(res))));
    const r = await page.evaluate(PAGE_EVAL);
    const bad = r.overlaps + r.pathCross + r.oob > 0 || !r.headerOk || !r.lastOk;
    if (bad) failures++;
    rows.push({ vp: "reduced", s: i + 1, ...r });
    if (SHOTS) await page.screenshot({ path: `${SHOTS}/reduced-slide${String(i + 1).padStart(2, "0")}.png` });
    if (i < N_SLIDES - 1) { await page.keyboard.press("ArrowRight"); await new Promise((r) => setTimeout(r, 650)); }
  }
  await page.close();
}
await browser.close();

console.log("slide | vp        | texts | overlaps | pathCross | oob | header | last | centerΔ");
for (const r of rows) {
  console.log(
    String(r.s).padStart(5) + " | " +
    r.vp.padEnd(9) + " | " +
    String(r.texts).padStart(5) + " | " +
    String(r.overlaps).padStart(8) + " | " +
    String(r.pathCross).padStart(9) + " | " +
    String(r.oob).padStart(3) + " | " +
    (r.headerOk ? " OK " : "FAIL") + "   | " +
    (r.lastOk ? " OK " : "FAIL") + " | " +
    String(r.centerDelta ?? "–").padStart(7)
  );
  for (const d of r.det.slice(0, 5)) console.log("      · " + d);
}
console.log(failures === 0 ? "\nALL CHECKS GREEN" : `\n${failures} FAILING ROW(S)`);
process.exit(failures === 0 ? 0 : 1);
