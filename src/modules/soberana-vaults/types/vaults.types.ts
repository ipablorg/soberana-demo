/**
 * Soberana Vaults — TypeScript types
 * Mirror of Python src/api/models.py from CoverageLiquidityBot
 */

// ─── Time Series ───────────────────────────────────────────────────────────
export interface TimeSeriesPoint {
  timestamp: string;
  value: number | null;
}

export interface MetricasHistorico {
  equity_total_usd: TimeSeriesPoint[];
  precio_actual_usd: TimeSeriesPoint[];
  roi_pct: TimeSeriesPoint[];
  drawdown_actual_pct: TimeSeriesPoint[];
  distancia_lower_pct: TimeSeriesPoint[];
  distancia_upper_pct: TimeSeriesPoint[];
}

// ─── Health ────────────────────────────────────────────────────────────────
export interface HealthResponse {
  status: string;
  ultimo_informe_timestamp: string | null;
  segundos_desde_ultimo_informe: number | null;
  total_informes: number;
}

// ─── Resumen Ejecutivo ─────────────────────────────────────────────────────
export interface ResumenEjecutivo {
  ultimo_precio_usd: number | null;
  equity_total_usd: number | null;
  roi_pct: number | null;
  drawdown_actual_pct: number | null;

  estado_bot: string | null;
  modo_ejecucion: string | null;
  tiempo_operando_horas: number | null;

  hedge_activo: boolean | null;
  tipo_hedge: string | null;
  tamano_hedge_usd: number | null;

  kill_switch_activo: boolean | null;
  kill_switch_razon: string | null;

  ultimos_errores: string[];

  posicion_lp_usd: number | null;
  fees_acumulados_usd: number | null;
  balance_hyperliquid_usd: number | null;

  ultimo_informe_timestamp: string | null;
  total_informes: number;
}

// ─── Informe Completo — subsecciones ──────────────────────────────────────
export interface MetaSection {
  timestamp_utc: string | null;
  informe_numero: number | null;
  intervalo_segundos: number | null;
}

export interface BotSection {
  estado: string | null;
  inicializado: boolean | null;
  modo_ejecucion: string | null;
  poll_interval_s: number | null;
  inicio_inversion: string | null;
  tiempo_operando_horas: number | null;
}

export interface PrecioSection {
  precio_actual_usd: number | null;
  ultima_actualizacion: string | null;
  precio_min_sesion: number | null;
  precio_max_sesion: number | null;
  rango_lower_bound: number | null;
  rango_upper_bound: number | null;
  precio_en_rango: boolean | null;
  distancia_lower_pct: number | null;
  distancia_upper_pct: number | null;
}

export interface OrcaLpSection {
  position_id: string | null;
  token_a: string | null;
  token_b: string | null;
  valor_posicion_usd: number | null;
  lower_bound: number | null;
  upper_bound: number | null;
  on_chain_valor_usd: number | null;
  token_a_amount: number | null;
  token_b_amount: number | null;
  fees_acumulados: number | null;
  en_rango: boolean | null;
  error_lectura_onchain: string | null;
}

export interface HyperliquidPositionDetail {
  symbol: string | null;
  side: string | null;
  size: number | null;
  entry_price: number | null;
  leverage: number | null;
}

export interface HyperliquidSection {
  hedge_activo: boolean | null;
  tipo_hedge: string | null;
  order_id: string | null;
  tamano_usd: number | null;
  entry_price: number | null;
  hedge_abierto_desde: string | null;
  hedge_duracion_minutos: number | null;
  balance_disponible_usd: number | null;
  pnl_total_realizado_usd: number | null;
  pnl_no_realizado_usd: number | null;
  posiciones_abiertas: number | null;
  detalle_posiciones: HyperliquidPositionDetail[] | null;
  error_balance: string | null;
  error_posiciones: string | null;
}

export interface RiskGuardSection {
  habilitado: boolean | null;
  kill_switch_activo: boolean | null;
  kill_switch_razon: string | null;
  equity_inicial_usd: number | null;
  equity_pico_usd: number | null;
  drawdown_actual_pct: number | null;
  max_drawdown_permitido_pct: number | null;
  perdida_acumulada_pct: number | null;
  kill_switch_loss_limit_pct: number | null;
  ultimo_cooldown: string | null;
}

export interface MetricasSection {
  ciclos_totales: number | null;
  ciclos_exitosos: number | null;
  ciclos_fallidos: number | null;
  tasa_exito_pct: number | null;
  hedges_abiertos_total: number | null;
  hedges_cerrados_total: number | null;
  tiempo_ciclo_promedio_ms: number | null;
  errores_criticos: number | null;
  errores_transitorios: number | null;
}

export interface CompoundAnalysis {
  fees_acumulados_usd: number | null;
  fees_como_pct_de_capital: number | null;
  equity_sin_fees_usd: number | null;
  roi_sin_fees_pct: number | null;
  roi_solo_fees_pct: number | null;
  explicacion: string | null;
}

export interface ResumenSection {
  posicion_lp_usd: number | null;
  fees_acumulados_usd: number | null;
  cashflows_usd: number | null;
  pnl_realizado_usd: number | null;
  pnl_no_realizado_usd: number | null;
  equity_total_usd: number | null;
  capital_invertido_usd: number | null;
  roi_pct: number | null;
  inversion_inicial_usd: number | null;
  inversion_final_usd: number | null;
  ganancia_neta_usd: number | null;
  roi_anualizado_apr_pct: number | null;
  roi_anualizado_apy_pct: number | null;
  roi_extrapolado_24h_pct: number | null;
  interpretacion_roi_anual: string | null;
  compound_analysis: CompoundAnalysis | null;
}

export interface CoverageZonesSection {
  lower_bound: number | null;
  upper_bound: number | null;
  precio_actual: number | null;
  hedge_long_activation_price: number | null;
  hedge_short_activation_price: number | null;
  exit_long_price: number | null;
  exit_short_price: number | null;
  dead_zone_upper_price: number | null;
  dead_zone_lower_price: number | null;
  distancia_a_hedge_long_usd: number | null;
  distancia_a_hedge_short_usd: number | null;
  threshold_upper_pct: number | null;
  threshold_lower_pct: number | null;
  zona_actual: string | null;
}

export interface HedgeHistoryEntry {
  timestamp: string | null;
  type: string | null;
  size_usd: number | null;
  entry_price: number | null;
  exit_price: number | null;
  pnl_usd: number | null;
  duration_min: number | null;
}

export interface AutoCompoundSection {
  enabled: boolean | null;
  total_compounded_usd: number | null;
  compound_count: number | null;
  last_compound_timestamp: string | null;
}

export interface InformeCompleto {
  meta: MetaSection;
  bot: BotSection;
  precio: PrecioSection;
  orca_lp: OrcaLpSection;
  hyperliquid: HyperliquidSection;
  risk_guard: RiskGuardSection;
  metricas: MetricasSection;
  resumen: ResumenSection;
  coverage_zones: CoverageZonesSection;
  equity_serie: unknown[];
  hedge_history: HedgeHistoryEntry[];
  auto_compound: AutoCompoundSection;
}

// ─── Informes List ─────────────────────────────────────────────────────────
export interface InformeSummary {
  informe_numero: number | null;
  timestamp_utc: string | null;
  equity_total_usd: number | null;
  roi_pct: number | null;
  precio_actual_usd: number | null;
  estado_bot: string | null;
  hedge_activo: boolean | null;
  filename: string | null;
  contenido_texto: string | null;
}

export interface InformesListResponse {
  total: number;
  page: number;
  limit: number;
  informes: InformeSummary[];
}
