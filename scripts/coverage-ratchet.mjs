/**
 * Coverage ratchet: fails when global coverage drops below the committed
 * baseline (.coverage-baseline.json). Raise the baseline as coverage
 * improves — target 90; lower it only with an explicit architecture
 * decision, never to make a PR pass.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const summaryPath = resolve('coverage', 'coverage-summary.json');
const baselinePath = resolve('.coverage-baseline.json');

let summary;
try {
  summary = JSON.parse(readFileSync(summaryPath, 'utf8'));
} catch {
  console.error(`[coverage-ratchet] missing ${summaryPath} — did the coverage run execute?`);
  process.exit(1);
}

const baseline = JSON.parse(readFileSync(baselinePath, 'utf8'));
const totals = summary.total ?? {};
const metrics = ['statements', 'branches', 'functions', 'lines'];

let failed = false;
for (const metric of metrics) {
  const pct = totals[metric]?.pct ?? 0;
  const floor = baseline[metric];

  const mark = pct >= floor ? 'PASS' : 'FAIL';
  if (pct < floor) failed = true;

  console.log(`${mark}  ${metric.padEnd(10)} ${pct.toFixed(2)}%  (floor ${floor}%)`);
}

if (failed) {
  console.error(
    '[coverage-ratchet] coverage dropped below the committed floor. Raise coverage or, as a last resort, update .coverage-baseline.json with an explicit justification.',
  );
  process.exit(1);
}

console.log('[coverage-ratchet] coverage at or above the floor.');
