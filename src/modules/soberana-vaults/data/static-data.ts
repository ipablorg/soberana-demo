/**
 * Soberana Vaults — Static Content Data
 * All hardcoded content for explanatory sections.
 * Based on CoverageLiquidityBot documentation (real production system).
 */

// ─── Journey / Timeline ────────────────────────────────────────────────────
export interface JourneyPhase {
  id: string;
  date: string;
  title: string;
  description: string;
  result: string;
  status: 'completed' | 'active';
  icon: string;
}

export const JOURNEY_PHASES: JourneyPhase[] = [
  {
    id: 'phase-design',
    date: 'Nov 2025',
    title: 'Diseño de Arquitectura',
    description:
      'Diseño completo del sistema: motor de riesgo, lógica LONG/SHORT, zonas de cobertura, integración Orca Whirlpool + Hyperliquid. Documentación de 20+ módulos.',
    result: 'Arquitectura modular validada, 38 tests unitarios escritos.',
    status: 'completed',
    icon: '📐',
  },
  {
    id: 'phase-sandbox',
    date: 'Dic 2025',
    title: 'Prueba Sandbox (1 hora)',
    description:
      '1,240 ciclos de monitoreo en testnet. 99.35% tasa de éxito. 13 hedges activados sin fallos. Identificación y corrección de bugs críticos.',
    result: 'Sistema validado en condiciones reales de mercado simulado.',
    status: 'completed',
    icon: '🧪',
  },
  {
    id: 'phase-seed',
    date: '13 Mar 2026',
    title: 'Producción Semilla',
    description:
      'Primera inversión real: $470.21 USD en capital semilla. Bot desplegado en GCP. Precio SOL leído directamente del pool Whirlpool on-chain. Auto-compound activado.',
    result: 'Capital semilla operando 24/7 en Solana mainnet.',
    status: 'completed',
    icon: '🌱',
  },
  {
    id: 'phase-scale',
    date: '16 Mar 2026',
    title: 'Ampliación de Capital',
    description:
      'Inyección de capital adicional: +$363.25 USD en dos cashflows. Capital total escala a $1,409.41 USD. 73+ informes acumulados. Posición LP ajustada.',
    result: 'Equity en $1,424.94 USD (+1.1% ROI). Fees LP: $2.56 acumulados.',
    status: 'completed',
    icon: '📈',
  },
  {
    id: 'phase-qa',
    date: '17 Mar 2026',
    title: 'QA Pasado — Producción Full',
    description:
      'Auditoría integral: matemáticas financieras verificadas, 38 tests pasados, 5 endpoints API validados, dashboard verificado. 0 bugs activos en producción.',
    result: '✅ QA PASSED. Sistema certificado para operación continua.',
    status: 'active',
    icon: '🏆',
  },
];

// ─── Technology Stack ──────────────────────────────────────────────────────
export interface TechComponent {
  name: string;
  role: string;
  description: string;
  badge: string;
  icon: string;
  color: 'primary' | 'success' | 'warning' | 'destructive';
}

export const TECH_COMPONENTS: TechComponent[] = [
  {
    name: 'Price Monitor',
    role: 'Oráculo de Precio',
    description:
      'Lee el precio de SOL directamente del sqrt_price del pool Whirlpool en Solana. Fallback a Pyth Network si falla. Cache de 120 segundos. Polling cada 30s.',
    badge: 'Python + Solana RPC',
    icon: '📡',
    color: 'primary',
  },
  {
    name: 'Risk Engine',
    role: 'Motor de Decisiones',
    description:
      'Evalúa distancia al rango LP, calcula zonas (DEAD_ZONE, VIGILANCIA, HEDGE_LONG, HEDGE_SHORT), decide si activar cobertura, calcula tamaño dinámico.',
    badge: 'Python + Lógica Propia',
    icon: '🧠',
    color: 'warning',
  },
  {
    name: 'Orca Manager',
    role: 'Gestión LP',
    description:
      'Lee estado on-chain de la posición LP: valor, cantidades SOL/USDC, fees no reclamados (tick arrays). Auto-compound cada 24h reinvirtiendo fees como liquidez.',
    badge: 'Orca Whirlpool SDK',
    icon: '🐋',
    color: 'success',
  },
  {
    name: 'Hyperliquid Executor',
    role: 'Ejecución de Hedges',
    description:
      'Abre/cierra posiciones LONG o SHORT en Hyperliquid según instrucciones del Risk Engine. Verifica ejecución, trackea P&L realizado y no realizado.',
    badge: 'Hyperliquid API',
    icon: '⚡',
    color: 'destructive',
  },
];

// ─── Risk Safeguards ───────────────────────────────────────────────────────
export interface RiskItem {
  title: string;
  description: string;
  safeguard: string;
  safeguardDetail: string;
  severity: 'low' | 'medium' | 'high';
  icon: string;
}

export const RISK_ITEMS: RiskItem[] = [
  {
    title: 'Pérdida No Permanente (Impermanent Loss)',
    description:
      'En LP concentrada, cuando el precio se aleja del centro del rango, la composición cambia: más del token que baja. Esto puede resultar en pérdida vs. mantener los tokens.',
    safeguard: 'Cobertura Delta-Neutral',
    safeguardDetail:
      'Cuando el precio se acerca a un límite (>threshold), el bot abre un hedge en Hyperliquid en la misma dirección del movimiento. El P&L del hedge compensa la IL del LP.',
    severity: 'medium',
    icon: '📊',
  },
  {
    title: 'Kill Switch — Pérdida Máxima',
    description:
      'Si el drawdown o la pérdida acumulada superan los umbrales configurados, existe riesgo de pérdida significativa antes de que el sistema pueda reaccionar.',
    safeguard: 'Kill Switch Automático',
    safeguardDetail:
      'Si drawdown > 8% desde equity pico, o pérdida acumulada > 5% desde inicio: el bot detiene TODAS las operaciones inmediatamente y envía alerta. Requiere intervención manual para reactivar.',
    severity: 'high',
    icon: '🔴',
  },
  {
    title: 'Riesgo de Protocolo (Smart Contract)',
    description:
      'Orca Whirlpool y Hyperliquid son protocolos con código auditable pero no perfecto. Un exploit o fallo podría afectar los fondos.',
    safeguard: 'Diversificación de Custodia',
    safeguardDetail:
      'Los fondos LP están en Orca (DeFi, no custodial). Los fondos de cobertura están en Hyperliquid (CeDeFi). Ningún único punto de fallo compromete todo el capital.',
    severity: 'medium',
    icon: '📝',
  },
  {
    title: 'Riesgo de Oráculo de Precio',
    description:
      'Si la fuente de precio falla o es manipulada, el bot podría tomar decisiones incorrectas sobre cuándo activar coberturas.',
    safeguard: 'Fuente Primaria + Fallback',
    safeguardDetail:
      'Precio primario leído directamente del pool Whirlpool on-chain (no puede manipularse sin costo económico real). Fallback automático a Pyth Network si la lectura on-chain falla.',
    severity: 'low',
    icon: '🔮',
  },
  {
    title: 'Riesgo de Infraestructura',
    description:
      'Si el servidor cae, el bot deja de monitorear precios y no puede activar coberturas durante ese tiempo.',
    safeguard: 'GCP + SQLite + Docker',
    safeguardDetail:
      'Desplegado en Google Cloud Platform con reinicio automático. Estado persistido en SQLite (state.db). Informes generados cada 30 minutos para auditoría. Backups automáticos.',
    severity: 'low',
    icon: '☁️',
  },
  {
    title: 'Volatilidad Extrema de Mercado',
    description:
      'En eventos de alta volatilidad (flash crash, pump extremo), el precio puede salir del rango LP antes de que el bot pueda actuar en el siguiente ciclo de 30s.',
    safeguard: 'Cooldown + Gestión de Posición',
    safeguardDetail:
      'El risk guard incluye trailing stop y cooldown dinámico. Si hay >5 hedges recientes, el cooldown aumenta para prevenir over-hedging. El bot prioriza protección del capital sobre rentabilidad.',
    severity: 'medium',
    icon: '🌪️',
  },
];

// ─── FAQ ───────────────────────────────────────────────────────────────────
export interface FaqItem {
  question: string;
  answer: string;
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: '¿Qué es exactamente Soberana Vaults?',
    answer:
      'Es un motor de inversión automatizado que coloca capital en una posición de liquidez concentrada (LP) en Orca Whirlpool (Solana) y cubre el riesgo de precio usando posiciones en Hyperliquid. Funciona 24/7 sin intervención humana, genera fees LP y reinvierte automáticamente.',
  },
  {
    question: '¿Cómo gana dinero el vault?',
    answer:
      'Principalmente de dos fuentes: (1) Fees LP — cada operación que ocurre dentro del rango de precios genera una comisión que va a la posición LP. (2) Ganancias del hedge — cuando el precio se mueve y el bot abre un hedge, si el movimiento continúa, el hedge genera P&L positivo que compensa la pérdida de impermanent loss.',
  },
  {
    question: '¿Qué son las zonas de cobertura?',
    answer:
      'El rango LP tiene 4 zonas: DEAD_ZONE (precio lejos de ambos límites, precio seguro), VIGILANCIA (precio se acerca al 30% del límite), HEDGE_LONG (precio a menos del 20% del límite superior, se abre LONG), HEDGE_SHORT (precio a menos del 20% del límite inferior, se abre SHORT). El bot actúa solo cuando sale de la DEAD_ZONE.',
  },
  {
    question: '¿Qué significa "delta-neutral"?',
    answer:
      'Una estrategia delta-neutral intenta ser indiferente a la dirección del precio. En un LP, cuando el precio sube, la posición se convierte más en USDC (perdiendo exposición a SOL). El hedge LONG en Hyperliquid reestablece esa exposición. Resultado: el P&L total depende más de los fees generados que de la dirección del precio.',
  },
  {
    question: '¿Cuáles son los resultados de backtesting?',
    answer:
      'En 12 meses de datos reales SOL/USDC: LP+Hedge generó +225% vs +2.33% solo LP. En 6 meses: +57.83% (APR 117%) vs +2.23% solo LP. En 3 meses: +17.46% (APR 70.85%). Los resultados pasados no garantizan resultados futuros.',
  },
  {
    question: '¿Qué pasa si el precio sale del rango LP?',
    answer:
      'Si el precio sale del rango, el LP deja de generar fees. En ese punto la posición está en 100% SOL (si salió por abajo) o 100% USDC (si salió por arriba). El hedge activo protege contra pérdidas adicionales. El bot puede reposicionar el rango LP si se configura con rebalanceo activo.',
  },
  {
    question: '¿Cuándo se activa el kill switch?',
    answer:
      'El kill switch se activa automáticamente si: (1) el drawdown actual supera el 8% desde el equity máximo alcanzado, o (2) la pérdida acumulada desde el inicio supera el 5%. Una vez activado, el bot detiene TODA operación y requiere revisión manual antes de continuar.',
  },
  {
    question: '¿Qué es el auto-compound?',
    answer:
      'Cada 24 horas, el bot reclama automáticamente los fees LP acumulados (en SOL y USDC) y los reinvierte aumentando la liquidez de la posición. Esto crea un efecto de interés compuesto: los fees generan más liquidez que genera más fees.',
  },
  {
    question: '¿El bot opera con dinero real?',
    answer:
      'Sí. El capital semilla es real (actualmente ~$1,409 USD), operando en Solana mainnet. Las transacciones son on-chain, verificables y auditable públicamente. El código es propietario de Loopay pero los resultados son transparentes a través de la API en producción.',
  },
  {
    question: '¿Qué tecnología usa internamente?',
    answer:
      'Python 3.10 + FastAPI (API REST), SQLite (persistencia de estado), Docker (containerización), Google Cloud Platform (infraestructura). On-chain: Orca Whirlpool SDK para LP, Solana RPC para precios. Off-chain: Hyperliquid API para hedges perpetuos.',
  },
];

// ─── Fees Structure ────────────────────────────────────────────────────────
export interface FeeItem {
  name: string;
  rate: string;
  description: string;
  who: string;
  frequency: string;
}

export const FEE_ITEMS: FeeItem[] = [
  {
    name: 'Fee LP de Orca',
    rate: '~0.01% por operación',
    description:
      'Comisión que cobra el pool de Orca por cada swap que ocurre dentro del rango LP. Este fee VA A LA POSICIÓN — es ingreso del vault, no un costo.',
    who: 'A FAVOR del vault',
    frequency: 'Por cada swap',
  },
  {
    name: 'Gas de Solana',
    rate: '<$0.001 por transacción',
    description:
      'Costo de transacción en la red Solana. Extremadamente bajo (~$0.001 USD por tx). Se paga al abrir/ajustar posición LP y al reclamar fees.',
    who: 'Costo del vault',
    frequency: 'Por transacción LP',
  },
  {
    name: 'Fees de Hyperliquid',
    rate: '0.025% maker / 0.075% taker',
    description:
      'Comisión de Hyperliquid por abrir/cerrar posiciones de cobertura. A veces hay funding rate (positivo o negativo) según condiciones de mercado.',
    who: 'Costo del vault',
    frequency: 'Por operación de hedge',
  },
  {
    name: 'Fee de Gestión Loopay',
    rate: 'Por definir',
    description:
      'Fee de administración del vault que se cobra sobre el rendimiento generado. Pendiente de definición para clientes externos en futuras versiones del producto.',
    who: 'Revenue de Loopay',
    frequency: 'Periódico sobre rendimiento',
  },
];

// ─── Strategy Engine Zones ─────────────────────────────────────────────────
export interface CoverageZoneInfo {
  id: string;
  name: string;
  description: string;
  action: string;
  color: 'muted' | 'warning' | 'success' | 'destructive';
  threshold: string;
}

export const COVERAGE_ZONES: CoverageZoneInfo[] = [
  {
    id: 'dead-zone',
    name: 'DEAD_ZONE',
    description:
      'El precio está en el centro del rango, lejos de ambos límites (>30% de cada uno). La LP está activa generando fees. No se necesitan coberturas.',
    action: 'Sin acción. Monitoreo pasivo cada 30 segundos.',
    color: 'muted',
    threshold: '>30% de ambos límites',
  },
  {
    id: 'vigilancia',
    name: 'VIGILANCIA',
    description:
      'El precio se acerca a un límite del rango (entre 20-30%). El bot aumenta la atención pero aún no activa cobertura.',
    action: 'Monitoreo activo. Preparando condiciones para posible hedge.',
    color: 'warning',
    threshold: '20-30% del límite',
  },
  {
    id: 'hedge-long',
    name: 'HEDGE_LONG',
    description:
      'El precio está a menos del 20% del límite SUPERIOR. La LP está convirtiendo SOL → USDC. Para mantener exposición a SOL, el bot abre una posición LONG en Hyperliquid.',
    action: 'Abre LONG en Hyperliquid. Confirmación por 2 ciclos antes de ejecutar.',
    color: 'success',
    threshold: '<20% del límite superior',
  },
  {
    id: 'hedge-short',
    name: 'HEDGE_SHORT',
    description:
      'El precio está a menos del 20% del límite INFERIOR. La LP está convirtiendo USDC → SOL. Para reducir exposición excesiva a SOL, el bot abre SHORT en Hyperliquid.',
    action: 'Abre SHORT en Hyperliquid. Confirmación por 2 ciclos antes de ejecutar.',
    color: 'destructive',
    threshold: '<20% del límite inferior',
  },
];

// ─── Agentic Loop Steps ────────────────────────────────────────────────────
export interface AgentLoopStep {
  step: number;
  name: string;
  description: string;
  detail: string;
  icon: string;
}

export const AGENTIC_LOOP_STEPS: AgentLoopStep[] = [
  {
    step: 1,
    name: 'Price Poll',
    description: 'Lectura de precio',
    detail:
      'Cada 30 segundos, el Price Monitor lee el sqrt_price del pool Whirlpool on-chain. Convierte a precio SOL/USD. Cache de 120s. Fallback a Pyth Network si falla.',
    icon: '📡',
  },
  {
    step: 2,
    name: 'Distance Calc',
    description: 'Cálculo de distancia',
    detail:
      'Calcula distancia_to_lower_pct y distancia_to_upper_pct. Determina en qué zona está el precio (DEAD_ZONE, VIGILANCIA, HEDGE_LONG, HEDGE_SHORT).',
    icon: '📏',
  },
  {
    step: 3,
    name: 'Risk Eval',
    description: 'Evaluación de riesgo',
    detail:
      'El Risk Engine evalúa: ¿precio fuera del rango? ¿cerca del límite superior? ¿cerca del inferior? ¿hay hedge activo ya? ¿está en cooldown? Decide la acción.',
    icon: '🧠',
  },
  {
    step: 4,
    name: 'Hedge Decision',
    description: 'Decisión de cobertura',
    detail:
      'Si se necesita hedge: verifica confirmación (2 ciclos consecutivos). Calcula tamaño dinámico según volatilidad y capital. Verifica costo vs beneficio antes de ejecutar.',
    icon: '⚖️',
  },
  {
    step: 5,
    name: 'Execute',
    description: 'Ejecución',
    detail:
      'Abre posición LONG o SHORT en Hyperliquid via API. Verifica que la orden se ejecutó. Registra en state.db. Actualiza estado del hedge activo.',
    icon: '⚡',
  },
  {
    step: 6,
    name: 'Report',
    description: 'Reportería',
    detail:
      'Cada 30 minutos genera informe JSON + TXT con 20+ campos financieros: equity, ROI, fees, P&L, coverage zones, hedge history. Persistido en informes_vaults/.',
    icon: '📊',
  },
];

// ─── Growth Projection Data ────────────────────────────────────────────────
export interface GrowthScenario {
  id: string;
  name: string;
  apr: number;
  color: string;
  description: string;
  basis: string;
}

export const GROWTH_SCENARIOS: GrowthScenario[] = [
  {
    id: 'conservative',
    name: 'Conservador',
    apr: 30,
    color: 'var(--chart-2)',
    description: 'Mercado lateral, fees LP principalmente',
    basis: 'APR ajustado por riesgo y fees de gestión',
  },
  {
    id: 'moderate',
    name: 'Moderado',
    apr: 70,
    color: 'var(--chart-1)',
    description: 'Resultado backtest 3 meses (mercado real)',
    basis: 'APR 70.85% — Backtest 3M SOL/USDC (Nov 2025 - Feb 2026)',
  },
  {
    id: 'aggressive',
    name: 'Agresivo',
    apr: 117,
    color: 'var(--chart-5)',
    description: 'Resultado backtest 6 meses (mercado real)',
    basis: 'APR 117.34% — Backtest 6M SOL/USDC (Ago 2025 - Feb 2026)',
  },
];

export function computeGrowthTable(
  initialCapital: number,
  scenarios: GrowthScenario[],
  years = 5,
  startYear = 2026,
): Array<{ year: number } & Record<string, number>> {
  const rows: Array<{ year: number } & Record<string, number>> = [];
  for (let y = 0; y <= years; y++) {
    const row: { year: number } & Record<string, number> = { year: startYear + y };
    for (const s of scenarios) {
      row[s.id] = Math.round(initialCapital * Math.pow(1 + s.apr / 100, y));
    }
    rows.push(row);
  }
  return rows;
}
