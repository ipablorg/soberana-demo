/**
 * Load and parse txdata.csv — values must match source exactly.
 */

import type { TxRow, TxSummary, VolumeByMonth, VolumeByAsset } from '@/modules/amazonas/types/txdata.types';

const CSV_URL = '/data/txdata.csv';

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') inQuotes = !inQuotes;
    else if (inQuotes) current += c;
    else if (c === ',') {
      result.push(current.trim());
      current = '';
    } else current += c;
  }
  result.push(current.trim());
  return result;
}

function mapRow(cols: string[]): TxRow {
  return {
    customerName: cols[0] ?? '',
    region: cols[1] ?? '',
    segment: cols[2] ?? '',
    businessType: cols[3] ?? '',
    csm: cols[4] ?? '',
    sdr: cols[5] ?? '',
    tenantId: cols[6] ?? '',
    date: cols[7] ?? '',
    asset: cols[8] ?? '',
    txDirection: cols[9] ?? '',
    operation: cols[10] ?? '',
    measureNames: cols[11] ?? '',
    measureValues: cols[12] ?? '',
    mes: cols[13] ?? '',
  };
}

function parseMeasureValue(s: string): number {
  const cleaned = s.replace(/,/g, '').trim();
  if (!cleaned) return 0;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

export function formatWithThousands(n: number): string {
  const fixed = n.toFixed(2);
  const [intPart, decPart] = fixed.split('.');
  const withCommas = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return decPart ? `${withCommas}.${decPart}` : withCommas;
}

export async function fetchTxData(): Promise<TxRow[]> {
  const res = await fetch(CSV_URL);
  if (!res.ok) throw new Error(`Failed to load txdata: ${res.status}`);
  const text = await res.text();
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];
  const colCount = parseCsvLine(lines[0]).length;
  const rows: TxRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i]);
    const firstCol = (cols[0] ?? '').trim();
    if (firstCol === 'Total' || firstCol === '') continue;
    if (cols.length >= colCount) rows.push(mapRow(cols));
  }
  return rows;
}

export function computeSummary(rows: TxRow[]): TxSummary {
  let totalVolume = 0;
  let countWithValue = 0;
  const assets = new Set<string>();
  const operations: Record<string, number> = {};
  let dateMin = '';
  let dateMax = '';
  for (const r of rows) {
    if (r.asset) assets.add(r.asset);
    if (r.operation) operations[r.operation] = (operations[r.operation] ?? 0) + 1;
    const val = parseMeasureValue(r.measureValues);
    if (r.measureValues.trim() !== '') countWithValue += 1;
    totalVolume += val;
    if (r.date) {
      if (!dateMin || r.date < dateMin) dateMin = r.date;
      if (!dateMax || r.date > dateMax) dateMax = r.date;
    }
  }
  return {
    totalOutboundVolume: totalVolume,
    totalOutboundFormatted: formatWithThousands(totalVolume),
    transactionCount: countWithValue,
    uniqueAssetsCount: assets.size,
    dateMin,
    dateMax,
    operationCounts: operations,
  };
}

export function computeVolumeByMonth(rows: TxRow[]): VolumeByMonth[] {
  const byMes: Record<string, number> = {};
  for (const r of rows) {
    const vol = parseMeasureValue(r.measureValues);
    if (r.mes) byMes[r.mes] = (byMes[r.mes] ?? 0) + vol;
  }
  const order = [...new Set(rows.map((r) => r.mes).filter(Boolean))].sort((a, b) => {
    const [ma, ya] = a.split('/').map(Number);
    const [mb, yb] = b.split('/').map(Number);
    if (ya !== yb) return ya - yb;
    return ma - mb;
  });
  return order.map((mes) => ({ mes, totalVolume: byMes[mes] ?? 0, label: mes }));
}

export function computeVolumeByAsset(rows: TxRow[]): VolumeByAsset[] {
  const byAsset: Record<string, number> = {};
  for (const r of rows) {
    if (!r.asset) continue;
    const vol = parseMeasureValue(r.measureValues);
    byAsset[r.asset] = (byAsset[r.asset] ?? 0) + vol;
  }
  return Object.entries(byAsset)
    .map(([asset, totalVolume]) => ({ asset, totalVolume, formatted: formatWithThousands(totalVolume) }))
    .sort((a, b) => b.totalVolume - a.totalVolume);
}

export function buildCsvForExport(rows: TxRow[]): string {
  const header =
    'Customer Name,Region,Segment,Business Type,CSM,SDR,Tenant Id,Date,Asset,Tx Direction,Operation,Measure Names,Measure Values,mes';
  const escape = (v: string) => (v.includes(',') ? `"${v.replace(/"/g, '""')}"` : v);
  const lines = rows.map((r) =>
    [
      r.customerName,
      r.region,
      r.segment,
      r.businessType,
      r.csm,
      r.sdr,
      r.tenantId,
      r.date,
      r.asset,
      r.txDirection,
      r.operation,
      r.measureNames,
      r.measureValues,
      r.mes,
    ]
      .map(escape)
      .join(',')
  );
  return [header, ...lines].join('\n');
}
