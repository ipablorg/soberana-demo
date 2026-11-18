/**
 * Guided prompts for agentic flows
 * Based on real Loopay Colombia use cases
 */

export interface GuidedPrompt {
  id: string;
  category: 'colombia' | 'brazil' | 'multi' | 'treasury';
  title: string;
  description: string;
  prompt: string;
  icon: string;
}

export const GUIDED_PROMPTS: GuidedPrompt[] = [
  // Colombia - Real use cases
  {
    id: 'co-usd-cop-brex',
    category: 'colombia',
    title: 'USD → COP vía Brex',
    description: 'Recibe wire en Brex, convierte a COP con Iris/Minteo/Movii',
    prompt: 'Convertir $5,000 USD a COP desde Brex, prioridad óptima',
    icon: '🇨🇴',
  },
  {
    id: 'co-usdt-usd-swap',
    category: 'colombia',
    title: 'USDT → USD Swap',
    description: 'USDT desde Bridge, USD wire a USA o Hong Kong',
    prompt: 'Swap $10,000 USDT a USD wire destino USA',
    icon: '💱',
  },
  {
    id: 'co-usdt-cop-ramp',
    category: 'colombia',
    title: 'USDT → COP Off-ramp',
    description: 'Stablecoin a pesos colombianos (Bridge o Vita)',
    prompt: 'Convertir $3,000 USDT a COP desde Bridge',
    icon: '📉',
  },
  {
    id: 'co-collect-breb',
    category: 'colombia',
    title: 'Cobrar con BRE-B',
    description: 'Recibir pagos instantáneos en Colombia',
    prompt: 'Recibir $500,000 COP vía BRE-B urgente',
    icon: '💰',
  },
  
  // Brazil
  {
    id: 'br-pix-collect',
    category: 'brazil',
    title: 'Cobrar con Pix',
    description: 'Recibir BRL instantáneo en Brasil',
    prompt: 'Recibir R$5,000 BRL vía Pix',
    icon: '🇧🇷',
  },
  {
    id: 'br-pix-payout',
    category: 'brazil',
    title: 'Pagar con Pix',
    description: 'Dispersión masiva en Brasil',
    prompt: 'Pagar nómina R$50,000 BRL masivo vía Pix',
    icon: '💸',
  },
  {
    id: 'br-brl-usdc-hedge',
    category: 'brazil',
    title: 'Hedge BRL → USDC',
    description: 'Protege tu tesorería de volatilidad',
    prompt: 'Convertir R$10,000 BRL a USDC para cobertura',
    icon: '🛡️',
  },
  
  // Multi-currency
  {
    id: 'multi-account-create',
    category: 'multi',
    title: 'Cuenta Multi-moneda',
    description: 'Una cuenta para USD, EUR, BRL',
    prompt: 'Crear cuenta multi-moneda USD EUR BRL',
    icon: '🌍',
  },
  {
    id: 'multi-card-virtual',
    category: 'multi',
    title: 'Tarjeta Virtual',
    description: 'Tarjeta desechable o recurrente',
    prompt: 'Crear tarjeta virtual $500 USD single-use',
    icon: '💳',
  },
  
  // Treasury automation
  {
    id: 'treasury-rebalance',
    category: 'treasury',
    title: 'Rebalance Automático',
    description: 'Mantén proporciones objetivo',
    prompt: 'Configurar rebalance diario 30/30/40 USD/BRL/USDC',
    icon: '⚖️',
  },
  {
    id: 'treasury-hedge-trigger',
    category: 'treasury',
    title: 'Hedge Automático',
    description: 'Protección contra devaluación',
    prompt: 'Activar hedge BRL → USDC si cae >1%',
    icon: '🎯',
  },
];

export function getPromptsByCategory(category: string): GuidedPrompt[] {
  return GUIDED_PROMPTS.filter(p => p.category === category);
}

export function getAllPrompts(): GuidedPrompt[] {
  return GUIDED_PROMPTS;
}
