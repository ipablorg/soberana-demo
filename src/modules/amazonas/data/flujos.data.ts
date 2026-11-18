/**
 * Loopay Business Plan financial data — parsed from CSV sources.
 * Source: flujos_docs/Business plan Loopay (1).xlsx
 */

import type {
  FinancialPeriod,
  FinancialRow,
  IncomeStatementData,
  BalanceSheetData,
  CashFlowData,
  ChartTimeSeries,
  RevenueBreakdownPoint,
  FlujosKpiSummary,
} from '@/modules/amazonas/types/flujos.types';

const PERIODS: FinancialPeriod[] = [
  { key: '2021', label: '2021', isAnnual: true },
  { key: '2022', label: '2022', isAnnual: true },
  { key: '2023', label: '2023', isAnnual: true },
  { key: '2024', label: '2024', isAnnual: true },
  { key: 'Q1_2025', label: 'Q1 2025', isAnnual: false },
  { key: 'Q2_2025', label: 'Q2 2025', isAnnual: false },
  { key: 'Q3_2025', label: 'Q3 2025', isAnnual: false },
  { key: 'Q4_2025', label: 'Q4 2025', isAnnual: false },
  { key: 'Q1_2026', label: 'Q1 2026', isAnnual: false },
  { key: 'Q2_2026', label: 'Q2 2026', isAnnual: false },
  { key: 'Q3_2026', label: 'Q3 2026', isAnnual: false },
  { key: 'Q4_2026', label: 'Q4 2026', isAnnual: false },
  { key: 'Q1_2027', label: 'Q1 2027', isAnnual: false },
  { key: 'Q2_2027', label: 'Q2 2027', isAnnual: false },
  { key: 'Q3_2027', label: 'Q3 2027', isAnnual: false },
  { key: 'Q4_2027', label: 'Q4 2027', isAnnual: false },
  { key: 'Q1_2028', label: 'Q1 2028', isAnnual: false },
  { key: 'Q2_2028', label: 'Q2 2028', isAnnual: false },
  { key: 'Q3_2028', label: 'Q3 2028', isAnnual: false },
  { key: 'Q4_2028', label: 'Q4 2028', isAnnual: false },
  { key: 'Q1_2029', label: 'Q1 2029', isAnnual: false },
  { key: 'Q2_2029', label: 'Q2 2029', isAnnual: false },
  { key: 'Q3_2029', label: 'Q3 2029', isAnnual: false },
  { key: 'Q4_2029', label: 'Q4 2029', isAnnual: false },
  { key: 'Q1_2030', label: 'Q1 2030', isAnnual: false },
  { key: 'Q2_2030', label: 'Q2 2030', isAnnual: false },
  { key: 'Q3_2030', label: 'Q3 2030', isAnnual: false },
  { key: 'Q4_2030', label: 'Q4 2030', isAnnual: false },
];

function row(
  metric: string,
  vals: (number | null)[],
  opts?: { isHighlight?: boolean; indent?: boolean }
): FinancialRow {
  const values: Record<string, number | null> = {};
  PERIODS.forEach((p, i) => {
    values[p.key] = vals[i] ?? null;
  });
  return { metric, values, ...opts };
}

function sep(): FinancialRow {
  return { metric: '', values: {}, isSeparator: true };
}

// ---------------------------------------------------------------------------
// Income Statement
// ---------------------------------------------------------------------------

const INCOME_ROWS: FinancialRow[] = [
  row('Revenue – Cross-Border', [0, 0, 0, 52325, 238249, 537783, 941120, 1646960, 2470440, 3705659, 5558489, 8337734, 10422167, 13027709, 16284636, 20355795, 22900270, 25762803, 28983154, 32606048, 34643926, 36809171, 39109745, 41554104, 44151235, 46910687, 49842605, 52957768], { indent: true }),
  row('Revenue – PayIn', [0, 0, 0, 3607, 2742, 18, 32, 56, 84, 126, 189, 284, 355, 444, 555, 694, 780, 878, 988, 1111, 1181, 1254, 1333, 1416, 1504, 1598, 1698, 1805], { indent: true }),
  row('Revenue – PayOut', [0, 24695, 455169, 353029, 148070, 322670, 564672, 988176, 1482264, 2223396, 3335093, 5002640, 6253300, 7816625, 9770782, 12213477, 13740162, 15457682, 17389892, 19563629, 20786356, 22085503, 23465847, 24932462, 26490741, 28146412, 29905563, 31774661], { indent: true }),
  row('Revenue – Asset Management', [0, 0, 0, 63522, 0, 0, 0, 0, 1000, 1360, 1850, 2515, 3421, 4653, 6328, 8605, 11703, 15917, 21647, 29439, 40037, 54451, 74053, 100713, 136969, 186278, 253338, 344540], { indent: true }),
  row('Revenue – BaaS/White-Label', [0, 0, 0, 35353, 7282, 60000, 81600, 110976, 150927, 205261, 279155, 379651, 516326, 702203, 954996, 1069595, 1197947, 1341700, 1502704, 1683029, 1884992, 2111191, 2364534, 2648278, 2966072, 3322000, 3720640, 4167117], { indent: true }),
  row('Total Revenue', [0, 24695, 455169, 507836, 396343, 920471, 1587424, 2746168, 4104715, 6135803, 9174777, 13722825, 17195569, 21551634, 27017296, 33648167, 37850862, 42578980, 47898384, 53883256, 57356492, 61061571, 65015512, 69236973, 73746521, 78566976, 83723845, 89245890], { isHighlight: true }),
  sep(),
  row('COGS', [0, 16052, 227584, 94927, 24048, 55850, 96318, 166626, 249057, 372295, 556688, 832645, 1043357, 1307665, 1639299, 2041633, 2296635, 2583518, 2906278, 3269415, 3480157, 3704966, 3944875, 4201016, 4474637, 4767122, 5080020, 5415075]),
  row('Gross Profit', [0, 8643, 227584, 412909, 372294, 864620, 1491105, 2579542, 3855658, 5763507, 8618089, 12890180, 16152212, 20243969, 25377997, 31606534, 35554227, 39995462, 44992107, 50613841, 53876335, 57356605, 61070637, 65035957, 69271885, 73799854, 78643825, 83830815], { isHighlight: true }),
  sep(),
  row('Operating Expenses', [0, 221049, 243099, 215098, 196735, 456900, 787959, 1363132, 2037482, 3045665, 4554139, 6811681, 8535468, 10697714, 13410737, 16702142, 18788260, 21135184, 23775609, 26746355, 28470386, 30309498, 32272140, 34367572, 36606004, 38998762, 41558508, 44299518]),
  row('EBITDA', [0, -212406, -15515, 197811, 175559, 407721, 703146, 1216410, 1818176, 2717842, 4063950, 6078499, 7616745, 9546255, 11967260, 14904391, 16765967, 18860278, 21216498, 23867485, 25405949, 27047106, 28798497, 30668385, 32665881, 34801092, 37085318, 39531297], { isHighlight: true }),
  sep(),
  row('D&A', [0, 7792, 1654, 18631, 2435, 5655, 9753, 16872, 25218, 37696, 56367, 84309, 105644, 132406, 165986, 206723, 232543, 261591, 294272, 331041, 352380, 375142, 399434, 425370, 453075, 482690, 514372, 548298]),
  row('EBIT', [0, -220198, -17169, 179180, 173124, 402066, 693394, 1199538, 1792958, 2680146, 4007583, 5994190, 7511101, 9413849, 11801274, 14697668, 16533424, 18598687, 20922226, 23536444, 25053569, 26671964, 28399063, 30243015, 32212806, 34318402, 36570945, 38982999], { isHighlight: true }),
  sep(),
  row('Interest Expense', [0, 0, 0, 1762, 19737, 104940, 180978, 313083, 467967, 699525, 1045989, 1564499, 1960416, 2457039, 3080163, 3836129, 4315266, 4854305, 5460754, 6143072, 6539045, 6961450, 7412228, 7893504, 8407624, 8957190, 9545110, 10174662]),
  row('Net Income', [0, -220198, -17169, 177418, 153387, 297126, 512416, 886456, 1324991, 1980621, 2961594, 4429691, 5550684, 6956810, 8721112, 10861539, 12218158, 13744382, 15461472, 17393372, 18514524, 19710513, 20986835, 22349511, 23805182, 25361212, 27025835, 28808337], { isHighlight: true }),
];

export const incomeStatementData: IncomeStatementData = {
  periods: PERIODS,
  rows: INCOME_ROWS,
};

// ---------------------------------------------------------------------------
// Balance Sheet
// ---------------------------------------------------------------------------

const BALANCE_ROWS: FinancialRow[] = [
  row('Cash & Equivalents', [null, 16348, 105064, 437486, 3396960, 36775965, 64579869, 113227244, 170272660, 255834571, 384168841, 576658555, 723248281, 906502427, 1135593216, 1421936337, 1606324827, 1813760825, 2047125339, 2309659580, 2466055506, 2632263579, 2808902396, 2996630163, 3196147394, 3408199844, 3633581717, 3873139192], { indent: true }),
  row('Investments', [null, null, null, null, null, 0, 0, 0, 1000000, 1360000, 1849600, 2515456, 3421020, 4652587, 6327519, 8605426, 11703379, 15916595, 21646570, 29439335, 40037495, 54450994, 74053351, 100712558, 136969078, 186277947, 253338008, 344539690], { indent: true }),
  row('Accounts Receivable', [null, 296479, 1014838, 232891, 232890, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null], { indent: true }),
  row('Fixed Assets (net)', [null, 2785, 5179, 1132, 1131, 89138, 153725, 265937, 397497, 594186, 888478, 1328907, 1665205, 2087043, 2616333, 3258462, 3665447, 4123315, 4638441, 5218012, 5554357, 5913154, 6296050, 6704853, 7141555, 7608364, 8107751, 8642501], { indent: true }),
  row('Total Assets', [null, 315611, 1125081, 671508, 3630981, 36865103, 64733594, 113493180, 171670157, 257788757, 386906919, 580502919, 728334506, 913242058, 1144537069, 1433800224, 1621693654, 1833800735, 2073410350, 2344316927, 2511647358, 2692627727, 2889251798, 3104047575, 3340258027, 3602086154, 3895027475, 4226321384], { isHighlight: true }),
  sep(),
  row('Short-Term Debt', [null, 477742, 1064004, 559985, 3537770, 36474766, 63830841, 111703972, 167555958, 251333936, 377000905, 565501357, 706876696, 883595870, 1104494838, 1380618548, 1553195866, 1747345349, 1965763518, 2211483958, 2349701705, 2496558061, 2652592940, 2818379999, 2994528749, 3181686796, 3380542221, 3591826109], { indent: true }),
  row('Long-Term Debt', [null, 0, 0, 658865, null, 0, 0, 0, 1000000, 1360000, 1849600, 2515456, 3421020, 4652587, 6327519, 8605426, 11703379, 15916595, 21646570, 29439335, 40037495, 54450994, 74053351, 100712558, 136969078, 186277947, 253338008, 344539690], { indent: true }),
  row('Profit', [null, null, null, null, null, 297126, 512416, 886456, 1324991, 1980621, 2961594, 4429691, 5550684, 6956810, 8721112, 10861539, 12218158, 13744382, 15461472, 17393372, 18514524, 19710513, 20986835, 22349511, 23805182, 25361212, 27025835, 28808337], { indent: true }),
  row("Shareholders' Equity", [null, -162131, 61077, -547342, 93211, 93211, 390337, 902753, 1789209, 3114200, 5094821, 8056414, 12486106, 18036790, 24993600, 33714712, 44576251, 56794409, 70538791, 86000262, 103393635, 121908158, 141618671, 162605506, 184955018, 208760200, 234121411, 261147247], { indent: true }),
  row('Total Liabilities & Equity', [null, 315611, 1125081, 671508, 3630981, 36865103, 64733594, 113493180, 171670157, 257788757, 386906919, 580502919, 728334506, 913242058, 1144537069, 1433800224, 1621693654, 1833800735, 2073410350, 2344316927, 2511647358, 2692627727, 2889251798, 3104047575, 3340258027, 3602086154, 3895027475, 4226321384], { isHighlight: true }),
];

export const balanceSheetData: BalanceSheetData = {
  periods: PERIODS,
  rows: BALANCE_ROWS,
};

// ---------------------------------------------------------------------------
// Cash Flow
// ---------------------------------------------------------------------------

const CASHFLOW_ROWS: FinancialRow[] = [
  row('Net Income', [null, 0, 24695, 455169, 507836, 396343, 920471, 1587424, 2746168, 4104715, 6135803, 9174777, 13722825, 17195569, 21551634, 27017296, 33648167, 37850862, 42578980, 47898384, 53883256, 57356492, 61061571, 65015512, 69236973, 73746521, 78566976, 83723845]),
  row('+ D&A', [0, null, 7792, 1654, 18631, 2435, 5655, 9753, 16872, 25218, 37696, 56367, 84309, 105644, 132406, 165986, 206723, 232543, 261591, 294272, 331041, 352380, 375142, 399434, 425370, 453075, 482690, 514372]),
  row('– Δ Working Capital', [0, -642657, -1008105, -1108459, -3379955, 301199, 749028, 1523272, 2716702, 4500634, 7167936, 11157198, 16371585, 22906557, 31098378, 41317789, 53128961, 66415476, 81361821, 98175623, 116353801, 135705518, 156309456, 178250164, 201618645, 226513048, 253039496, 281313083]),
];

export const cashFlowData: CashFlowData = {
  periods: PERIODS,
  rows: CASHFLOW_ROWS,
};

// ---------------------------------------------------------------------------
// Chart Series (from pre-computed graph CSVs)
// ---------------------------------------------------------------------------

export const grossProfitSeries: ChartTimeSeries[] = [
  { period: '2021', value: 0 },
  { period: '2022', value: 8643 },
  { period: '2023', value: 227584 },
  { period: '2024', value: 395208 },
  { period: 'Q1 2025', value: 372294 },
  { period: 'Q2 2025', value: 864620 },
  { period: 'Q3 2025', value: 1491110 },
  { period: 'Q4 2025', value: 2579540 },
  { period: 'Q1 2026', value: 3855660 },
  { period: 'Q2 2026', value: 5763540 },
  { period: 'Q3 2026', value: 8618170 },
  { period: 'Q4 2026', value: 12890300 },
  { period: 'Q1 2027', value: 16152500 },
  { period: 'Q2 2027', value: 20244500 },
  { period: 'Q3 2027', value: 25378800 },
  { period: 'Q4 2027', value: 31607900 },
  { period: 'Q1 2028', value: 35556300 },
  { period: 'Q2 2028', value: 39998700 },
  { period: 'Q3 2028', value: 44997100 },
  { period: 'Q4 2028', value: 50621300 },
  { period: 'Q1 2029', value: 53887600 },
  { period: 'Q2 2029', value: 57373400 },
  { period: 'Q3 2029', value: 61095500 },
  { period: 'Q4 2029', value: 65072600 },
  { period: 'Q1 2030', value: 69325600 },
  { period: 'Q2 2030', value: 73878400 },
  { period: 'Q3 2030', value: 78758300 },
  { period: 'Q4 2030', value: 83997100 },
];

export const ebitdaSeries: ChartTimeSeries[] = [
  { period: '2021', value: 0 },
  { period: '2022', value: -212406 },
  { period: '2023', value: -15515 },
  { period: '2024', value: 200275 },
  { period: 'Q1 2025', value: 175559 },
  { period: 'Q2 2025', value: 407721 },
  { period: 'Q3 2025', value: 703146 },
  { period: 'Q4 2025', value: 1216410 },
  { period: 'Q1 2026', value: 1818180 },
  { period: 'Q2 2026', value: 2717860 },
  { period: 'Q3 2026', value: 4063990 },
  { period: 'Q4 2026', value: 6078570 },
  { period: 'Q1 2027', value: 7616880 },
  { period: 'Q2 2027', value: 9546490 },
  { period: 'Q3 2027', value: 11967700 },
  { period: 'Q4 2027', value: 14905000 },
  { period: 'Q1 2028', value: 16767000 },
  { period: 'Q2 2028', value: 18861800 },
  { period: 'Q3 2028', value: 21218800 },
  { period: 'Q4 2028', value: 23871000 },
  { period: 'Q1 2029', value: 25411300 },
  { period: 'Q2 2029', value: 27055000 },
  { period: 'Q3 2029', value: 28810200 },
  { period: 'Q4 2029', value: 30685700 },
  { period: 'Q1 2030', value: 32691200 },
  { period: 'Q2 2030', value: 34838100 },
  { period: 'Q3 2030', value: 37139300 },
  { period: 'Q4 2030', value: 39609700 },
];

export const transactionVolumeSeries: ChartTimeSeries[] = [
  { period: 'Q1 2025', value: 80462500 },
  { period: 'Q2 2025', value: 179261000 },
  { period: 'Q3 2025', value: 313707000 },
  { period: 'Q4 2025', value: 548987000 },
  { period: 'Q1 2026', value: 823480000 },
  { period: 'Q2 2026', value: 1235220000 },
  { period: 'Q3 2026', value: 1852830000 },
  { period: 'Q4 2026', value: 2779240000 },
  { period: 'Q1 2027', value: 3474060000 },
  { period: 'Q2 2027', value: 4342570000 },
  { period: 'Q3 2027', value: 5428210000 },
  { period: 'Q4 2027', value: 6785270000 },
  { period: 'Q1 2028', value: 7633420000 },
  { period: 'Q2 2028', value: 8587600000 },
  { period: 'Q3 2028', value: 9661050000 },
  { period: 'Q4 2028', value: 10868700000 },
  { period: 'Q1 2029', value: 11548000000 },
  { period: 'Q2 2029', value: 12269700000 },
  { period: 'Q3 2029', value: 13036600000 },
  { period: 'Q4 2029', value: 13851400000 },
  { period: 'Q1 2030', value: 14717100000 },
  { period: 'Q2 2030', value: 15636900000 },
  { period: 'Q3 2030', value: 16614200000 },
  { period: 'Q4 2030', value: 17652600000 },
];

export const revenueBreakdown: RevenueBreakdownPoint[] = PERIODS
  .filter((p) => !p.isAnnual)
  .map((p) => {
    const cb = INCOME_ROWS[0].values[p.key] ?? 0;
    const pi = INCOME_ROWS[1].values[p.key] ?? 0;
    const po = INCOME_ROWS[2].values[p.key] ?? 0;
    const am = INCOME_ROWS[3].values[p.key] ?? 0;
    const baas = INCOME_ROWS[4].values[p.key] ?? 0;
    const total = INCOME_ROWS[5].values[p.key] ?? 0;
    return {
      period: p.label,
      crossBorder: cb,
      payIn: pi,
      payOut: po,
      assetManagement: am,
      baas: baas,
      total: total,
    };
  });

// ---------------------------------------------------------------------------
// KPI Summary (computed)
// ---------------------------------------------------------------------------

function sumQuarters(row: FinancialRow, year: number): number {
  return (['Q1', 'Q2', 'Q3', 'Q4'] as const).reduce((acc, q) => {
    const key = `${q}_${year}`;
    return acc + (row.values[key] ?? 0);
  }, 0);
}

const totalRevenueRow = INCOME_ROWS[5];
const grossProfitRow = INCOME_ROWS[8];
const ebitdaRow = INCOME_ROWS[11];
const netIncomeRow = INCOME_ROWS[17];
const totalAssetsRow = BALANCE_ROWS[4];

const rev2030 = sumQuarters(totalRevenueRow, 2030);
const rev2029 = sumQuarters(totalRevenueRow, 2029);
const ebitda2030 = sumQuarters(ebitdaRow, 2030);
const ni2030 = sumQuarters(netIncomeRow, 2030);
const gp2030Q4 = grossProfitRow.values['Q4_2030'] ?? 0;
const rev2030Q4 = totalRevenueRow.values['Q4_2030'] ?? 0;

export const flujosKpiSummary: FlujosKpiSummary = {
  revenueAnnual2030: rev2030,
  ebitdaAnnual2030: ebitda2030,
  ebitdaMargin2030: rev2030 > 0 ? (ebitda2030 / rev2030) * 100 : 0,
  netIncomeAnnual2030: ni2030,
  totalAssetsQ42030: totalAssetsRow.values['Q4_2030'] ?? 0,
  txVolumeQ42030: 17652600000,
  grossMarginQ42030: rev2030Q4 > 0 ? (gp2030Q4 / rev2030Q4) * 100 : 0,
  revenueGrowthYoY: rev2029 > 0 ? ((rev2030 - rev2029) / rev2029) * 100 : 0,
};

// ---------------------------------------------------------------------------
// CSV Export helpers
// ---------------------------------------------------------------------------

export function formatFinancialValue(v: number | null): string {
  if (v === null) return '—';
  if (v === 0) return '0';
  const abs = Math.abs(v);
  const sign = v < 0 ? '-' : '';
  const formatted = abs.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  return `${sign}$${formatted}`;
}

export function formatCompactValue(v: number): string {
  const abs = Math.abs(v);
  const sign = v < 0 ? '-' : '';
  if (abs >= 1_000_000_000) return `${sign}$${(abs / 1_000_000_000).toFixed(1)}B`;
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(0)}K`;
  return `${sign}$${abs}`;
}

export function buildFlujosExportCsv(
  data: { periods: FinancialPeriod[]; rows: FinancialRow[] },
  title: string
): string {
  const header = ['Metric', ...data.periods.map((p) => p.label)].join(',');
  const lines = data.rows
    .filter((r) => !r.isSeparator)
    .map((r) => {
      const vals = data.periods.map((p) => {
        const v = r.values[p.key];
        return v !== null && v !== undefined ? String(v) : '';
      });
      const metric = r.metric.includes(',') ? `"${r.metric}"` : r.metric;
      return [metric, ...vals].join(',');
    });
  return [`# ${title}`, header, ...lines].join('\n');
}
