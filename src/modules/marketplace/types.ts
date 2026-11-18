/**
 * Marketplace Types
 * 
 * Type definitions for the Global Connectors Marketplace
 * All data comes from JSON files - no hardcoding
 */

export interface PaymentMethod {
  método_pago: string;
  monedas_pago?: string;
  red_participante?: string;
  fuente_fx?: string;
  canales?: string;
  tipos_pago?: string;
  corte_entrega?: string;
  datos_obligatorios?: string[];
  documentos_soporte?: string;
  narrativa_beneficiario?: string;
  prueba_pago?: string;
  notas?: string;
  límites?: {
    B2B?: { min: string; max: string };
    B2P?: { min: string; max: string };
    P2P?: { min: string; max: string };
    P2B?: { min: string; max: string };
  };
}

export interface PayinMethod {
  método_payin: string;
  monedas_payin?: string;
  red_participante?: string;
  fuente_fx?: string;
  canales?: string;
  tipos_transaccion?: string;
  tiempo_liquidacion?: string;
  datos_obligatorios?: string[];
  documentos_soporte?: string;
  narrativa_beneficiario?: string;
  comprobante_transaccion?: string;
  notas?: string;
  límites?: {
    B2B?: { min: string; max: string };
    B2P?: { min: string; max: string };
    B2C?: { min: string; max: string };
    C2B?: { min: string; max: string };
    P2P?: { min: string; max: string };
    P2B?: { min: string; max: string };
  };
  fees?: {
    banco_receptor?: string;
    banco_emisor?: string;
    store_fee?: string;
    correspondent_fee?: string;
    wallet_fee?: string;
    processing_fee?: string;
    mp_fee?: string;
    app_fee?: string;
    loopay_fee?: string;
  };
  horario_operacion?: string;
}

export interface CountryData {
  name: string;
  region: string;
  payoutMethods: PaymentMethod[];
  payinMethods?: PayinMethod[];
  onrampSupport?: OnrampOffRampSupport;
  offrampSupport?: OnrampOffRampSupport;
  localProducts?: LocalProducts;
}

export interface OnrampOffRampSupport {
  available: boolean;
  currency?: string;
  rails?: string[];
  stablecoins?: string[];
  blockchains?: string[];
  description?: string;
  accountType?: string;
  settlementTimes?: Record<string, string>;
  fees?: {
    on_ramp: string;
    off_ramp: string;
    fee_minimo: string;
  };
  tarifasDetalladas?: {
    cashin_corresponsales?: {
      descripcion: string;
      tarifa: string;
      metodos_cash?: string[];
      metodos_ewallet?: string[];
    };
    payin_transferencia?: {
      descripcion: string;
      tarifa: string;
      canales?: string[];
    };
  };
  limits?: Record<string, { min: string; max: string }>;
  limitsByBank?: Record<string, Record<string, string>>;
  operatingHours?: Record<string, string>;
  mainBanks?: string[];
  corresponsalesCash?: string[];
  billeterasDigitales?: string[];
  partner?: string;
  partnerInfo?: {
    nombre: string;
    documento: string;
    fecha_actualizacion: string;
    condiciones_generales: string;
    servicios: string[];
  };
  nota?: string;
}

// Local products (e.g., Colombia)
export interface LocalProducts {
  version: string;
  descripcion: string;
  moneda_base: string;
  productos: Record<string, LocalProduct>;
  tiempos_ach_colombia?: {
    descripcion: string;
    ciclos: Array<{
      ciclo: number;
      corte: string;
      acreditacion: string;
    }>;
    nota?: string;
  };
  bancos_soportados?: {
    principales: string[];
    billeteras_digitales: string[];
    corresponsales: string[];
  };
}

export interface LocalProduct {
  nombre: string;
  descripcion: string;
  estado: string;
  banco_principal?: string;
  proceso: {
    recarga?: {
      metodo?: string;
      metodos?: Array<{
        nombre: string;
        tiempo: string | Record<string, string>;
        nota?: string;
        generacion?: string;
      }>;
      redes_autorizadas?: string[];
      monedas?: string[];
      negociacion_tasa?: boolean;
      disponibilidad?: string;
    };
    dispersion?: Record<string, unknown>;
    generacion_links?: {
      descripcion: string;
      metodos_pago: string[];
    };
    billeteras_habilitadas?: Record<string, unknown>;
  };
  costos: Record<string, unknown>;
  tarifas_minimas?: Record<string, unknown>;
  facturacion: {
    tipo: string;
    corte?: string;
    descuento?: string;
    pago_adicional?: boolean;
    nota?: string;
  };
  aliados: string[];
  mercado_objetivo?: Record<string, string>;
  ventaja_diferencial?: string;
  transfiya?: {
    onboarding_masivo?: Record<string, unknown>;
    validacion_cuentas?: Record<string, unknown>;
    limites?: {
      maxAmountOfTransfer: number;
      dailyCountOfTransfersLimit: number;
      dailySumAmountOfTransfersLimit: number;
    };
  };
}

export interface TransactionFees {
  descripcion: string;
  tipos: {
    loopay_fee: {
      descripcion: string;
      on_ramp: string;
      off_ramp: string;
      transfer: string;
    };
    partner_fee: {
      descripcion: string;
      configuracion: string;
    };
    network_fee: {
      descripcion: string;
      aplica_a: string[];
    };
    lock_premium: {
      descripcion: string;
      rango: string;
    };
  };
  visibilidad: string;
}

export interface RegionGroup {
  name: string;
  countries: CountryData[];
}

export type RegionName = 
  | 'África' 
  | 'Asia' 
  | 'Europa' 
  | 'Norteamérica' 
  | 'Sudamérica' 
  | 'Oceanía'
  | 'Special';

export interface MarketplaceStats {
  totalCountries: number;
  totalPaymentMethods: number;
  totalPayinMethods: number;
  onrampCountries: number;
  offrampCountries: number;
  regions: RegionName[];
}
