/**
 * Agentic Engine - Core routing and execution logic
 * Inspired by Stripe + OpenAI agentic commerce protocol
 */

import { connectors } from './suite-data';

export interface RoutingContext {
  fromCurrency: string;
  toCurrency: string;
  amount: number;
  fromAccount?: string;
  toAccount?: string;
  priority: 'speed' | 'cost' | 'optimal';
  useCase?: 'collect' | 'payout' | 'convert' | 'swap';
}

export interface RoutingOption {
  id: string;
  name: string;
  description: string;
  route: string[];
  fee: number;
  feePercent: number;
  etaMinutes: number;
  confidence: number;
  reason: string;
  providers: string[];
  badges: { label: string; variant: 'default' | 'secondary' | 'outline' }[];
}

export interface ExecutionStep {
  id: string;
  title: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  timestamp: Date;
  details?: string;
  metadata?: Record<string, any>;
}

// Real Colombia use cases from user input
const COLOMBIA_ROUTES = {
  // Op USD / COP - Wire to Brex
  'usd-cop-brex': {
    options: [
      {
        name: 'Loopay Plus (Iris)',
        provider: 'iris',
        fee: 0.008,
        etaMinutes: 30,
        description: 'Producto automatizado vía Iris - Óptimo para montos grandes',
        confidence: 0.95,
        automation: 'full',
      },
      {
        name: 'Estándar (Minteo)',
        provider: 'minteo',
        fee: 0.012,
        etaMinutes: 60,
        description: 'Ruta estándar vía Minteo - Balanceado',
        confidence: 0.90,
        automation: 'partial',
      },
      {
        name: 'Óptimo Pro (Movii)',
        provider: 'movii',
        fee: 0.015,
        etaMinutes: 45,
        description: 'Producto óptimo vía Movii - Compliance plus',
        confidence: 0.88,
        automation: 'partial',
      },
    ],
  },
  // Op SWAP - USDT to USD
  'usdt-usd-swap': {
    options: [
      {
        name: 'Bridge → Brex (USA)',
        provider: 'bridge-brex',
        fee: 0.005,
        etaMinutes: 15,
        description: 'USDT desde Bridge, USD wire a USA por Brex',
        confidence: 0.95,
        automation: 'full',
      },
      {
        name: 'Bridge → Mandioca (HK)',
        provider: 'bridge-mandioca',
        fee: 0.006,
        etaMinutes: 20,
        description: 'USDT desde Bridge, USD a Hong Kong vía partner Mandioca',
        confidence: 0.92,
        automation: 'full',
      },
    ],
  },
  // USDT variants
  'usdt-cop-ramp': {
    options: [
      {
        name: 'USDT (Bridge) → COP',
        provider: 'bridge',
        fee: 0.007,
        etaMinutes: 25,
        description: 'Off-ramp desde Bridge a COP local',
        confidence: 0.93,
        automation: 'full',
      },
      {
        name: 'USDT (Vita) → COP',
        provider: 'vita',
        fee: 0.008,
        etaMinutes: 30,
        description: 'Off-ramp desde Vita a COP local',
        confidence: 0.90,
        automation: 'full',
      },
    ],
  },
};

export class AgenticEngine {
  /**
   * Intelligent routing based on context
   */
  static analyzeIntent(userMessage: string): RoutingContext | null {
    const lower = userMessage.toLowerCase();
    
    // Detect currencies
    const currencyMap = {
      usd: ['usd', 'dolar', 'dollar', 'dolares'],
      cop: ['cop', 'peso', 'pesos colombiano', 'colombia'],
      brl: ['brl', 'real', 'reales', 'brasil', 'brazil'],
      mxn: ['mxn', 'peso mexican', 'mexico'],
      eur: ['eur', 'euro', 'euros'],
      usdc: ['usdc', 'stablecoin', 'crypto'],
      usdt: ['usdt', 'tether'],
    };
    
    let fromCurrency = '';
    let toCurrency = '';
    
    for (const [code, keywords] of Object.entries(currencyMap)) {
      if (keywords.some(kw => lower.includes(kw))) {
        if (!fromCurrency) fromCurrency = code.toUpperCase();
        else if (!toCurrency) toCurrency = code.toUpperCase();
      }
    }
    
    // Detect amount
    const amountMatch = userMessage.match(/\$?([0-9,]+(?:\.[0-9]{1,2})?)/);
    const amount = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, '')) : 0;
    
    // Detect priority
    let priority: 'speed' | 'cost' | 'optimal' = 'optimal';
    if (lower.includes('urgente') || lower.includes('rapido') || lower.includes('fast')) {
      priority = 'speed';
    } else if (lower.includes('economico') || lower.includes('barato') || lower.includes('cheap')) {
      priority = 'cost';
    }
    
    // Detect use case
    let useCase: 'collect' | 'payout' | 'convert' | 'swap' | undefined;
    if (lower.includes('cobrar') || lower.includes('recibir') || lower.includes('collect')) {
      useCase = 'collect';
    } else if (lower.includes('pagar') || lower.includes('enviar') || lower.includes('payout')) {
      useCase = 'payout';
    } else if (lower.includes('convertir') || lower.includes('cambiar') || lower.includes('convert')) {
      useCase = 'convert';
    } else if (lower.includes('swap') || lower.includes('intercambiar')) {
      useCase = 'swap';
    }
    
    if (!fromCurrency || !toCurrency || !amount) return null;
    
    return {
      fromCurrency,
      toCurrency,
      amount,
      priority,
      useCase,
    };
  }
  
  /**
   * Generate routing options based on context
   */
  static generateRoutes(context: RoutingContext): RoutingOption[] {
    const routes: RoutingOption[] = [];
    
    // Colombia specific routes
    if (context.fromCurrency === 'USD' && context.toCurrency === 'COP') {
      const coRoutes = COLOMBIA_ROUTES['usd-cop-brex'];
      coRoutes.options.forEach((opt, idx) => {
        const fee = context.amount * opt.fee;
        routes.push({
          id: `co-${idx + 1}`,
          name: opt.name,
          description: opt.description,
          route: ['Brex (Wire USD)', opt.provider, 'COP Local'],
          fee,
          feePercent: opt.fee * 100,
          etaMinutes: opt.etaMinutes,
          confidence: opt.confidence,
          reason: this.generateReason(opt, context),
          providers: ['Brex', opt.provider],
          badges: [
            { label: opt.provider, variant: 'default' },
            { label: `${opt.etaMinutes} min`, variant: 'secondary' },
            { label: `${(opt.fee * 100).toFixed(2)}% fee`, variant: 'outline' },
          ],
        });
      });
    }
    
    // USDT → USD swap
    if (context.fromCurrency === 'USDT' && context.toCurrency === 'USD') {
      const swapRoutes = COLOMBIA_ROUTES['usdt-usd-swap'];
      swapRoutes.options.forEach((opt, idx) => {
        const fee = context.amount * opt.fee;
        routes.push({
          id: `swap-${idx + 1}`,
          name: opt.name,
          description: opt.description,
          route: ['Bridge (USDT)', opt.provider, 'USD Wire'],
          fee,
          feePercent: opt.fee * 100,
          etaMinutes: opt.etaMinutes,
          confidence: opt.confidence,
          reason: this.generateReason(opt, context),
          providers: ['Bridge', opt.provider],
          badges: [
            { label: opt.provider.split('-')[1] || opt.provider, variant: 'default' },
            { label: `${opt.etaMinutes} min`, variant: 'secondary' },
            { label: `${(opt.fee * 100).toFixed(2)}% fee`, variant: 'outline' },
          ],
        });
      });
    }
    
    // USDT → COP
    if (context.fromCurrency === 'USDT' && context.toCurrency === 'COP') {
      const rampRoutes = COLOMBIA_ROUTES['usdt-cop-ramp'];
      rampRoutes.options.forEach((opt, idx) => {
        const fee = context.amount * opt.fee;
        routes.push({
          id: `ramp-${idx + 1}`,
          name: opt.name,
          description: opt.description,
          route: [opt.provider, 'Off-ramp', 'COP Local'],
          fee,
          feePercent: opt.fee * 100,
          etaMinutes: opt.etaMinutes,
          confidence: opt.confidence,
          reason: this.generateReason(opt, context),
          providers: [opt.provider],
          badges: [
            { label: opt.provider, variant: 'default' },
            { label: `${opt.etaMinutes} min`, variant: 'secondary' },
            { label: `${(opt.fee * 100).toFixed(2)}% fee`, variant: 'outline' },
          ],
        });
      });
    }
    
    // Generic fallback using connectors
    if (routes.length === 0) {
      routes.push(...this.generateGenericRoutes(context));
    }
    
    // Sort by priority
    return this.sortByPriority(routes, context.priority);
  }
  
  private static generateGenericRoutes(context: RoutingContext): RoutingOption[] {
    const routes: RoutingOption[] = [];
    
    // Find connectors that support the currencies
    const fromConnectors = connectors.filter(c => 
      c.currencies?.includes(context.fromCurrency)
    );
    const toConnectors = connectors.filter(c => 
      c.currencies?.includes(context.toCurrency)
    );
    
    if (fromConnectors.length > 0 && toConnectors.length > 0) {
      const fromConn = fromConnectors[0];
      const toConn = toConnectors[0];
      
      const baseFee = ((fromConn.costModel?.value ?? 0) + (toConn.costModel?.value ?? 0)) || 0;
      const fee = context.amount * (baseFee / 100);
      const etaMinutes = (fromConn.etaMins?.max || 60) + (toConn.etaMins?.max || 60);
      
      routes.push({
        id: 'generic-1',
        name: `${fromConn.name} → ${toConn.name}`,
        description: `Ruta genérica usando ${fromConn.name} y ${toConn.name}`,
        route: [fromConn.name, 'Bridge', toConn.name],
        fee,
        feePercent: baseFee,
        etaMinutes,
        confidence: 0.75,
        reason: 'Ruta automática basada en conectores disponibles',
        providers: [fromConn.name, toConn.name],
        badges: [
          { label: fromConn.name, variant: 'default' },
          { label: `${etaMinutes} min`, variant: 'secondary' },
        ],
      });
    }
    
    return routes;
  }
  
  private static generateReason(option: any, context: RoutingContext): string {
    if (context.priority === 'speed') {
      return `Recomendado por velocidad. ${option.description}`;
    } else if (context.priority === 'cost') {
      return `Recomendado por costo. ${option.description}`;
    } else {
      return `Recomendado por balance óptimo. ${option.description}`;
    }
  }
  
  private static sortByPriority(routes: RoutingOption[], priority: string): RoutingOption[] {
    if (priority === 'speed') {
      return routes.sort((a, b) => a.etaMinutes - b.etaMinutes);
    } else if (priority === 'cost') {
      return routes.sort((a, b) => a.fee - b.fee);
    } else {
      return routes.sort((a, b) => b.confidence - a.confidence);
    }
  }
  
  /**
   * Execute a flow and generate steps
   */
  static async executeFlow(
    _routeId: string,
    context: RoutingContext,
    onStepUpdate: (step: ExecutionStep) => void
  ): Promise<{ success: boolean; receiptId: string; steps: ExecutionStep[] }> {
    const steps: ExecutionStep[] = [];
    
    // Step 1: Validate
    const step1: ExecutionStep = {
      id: 'step-1',
      title: 'Validando transacción',
      status: 'in-progress',
      timestamp: new Date(),
      details: 'Verificando balances y límites...',
    };
    steps.push(step1);
    onStepUpdate(step1);
    
    await this.delay(800);
    step1.status = 'completed';
    onStepUpdate(step1);
    
    // Step 2: Lock rate (if FX)
    if (context.fromCurrency !== context.toCurrency) {
      const step2: ExecutionStep = {
        id: 'step-2',
        title: 'Bloqueando tasa FX',
        status: 'in-progress',
        timestamp: new Date(),
        details: `Cotización: 1 ${context.fromCurrency} = 4,234 ${context.toCurrency}`,
      };
      steps.push(step2);
      onStepUpdate(step2);
      
      await this.delay(1000);
      step2.status = 'completed';
      onStepUpdate(step2);
    }
    
    // Step 3: Execute route
    const step3: ExecutionStep = {
      id: 'step-3',
      title: 'Ejecutando ruta optimizada',
      status: 'in-progress',
      timestamp: new Date(),
      details: 'Procesando a través de conectores...',
    };
    steps.push(step3);
    onStepUpdate(step3);
    
    await this.delay(1500);
    step3.status = 'completed';
    onStepUpdate(step3);
    
    // Step 4: Confirm
    const step4: ExecutionStep = {
      id: 'step-4',
      title: 'Confirmando transacción',
      status: 'in-progress',
      timestamp: new Date(),
      details: 'Esperando confirmación final...',
    };
    steps.push(step4);
    onStepUpdate(step4);
    
    await this.delay(800);
    step4.status = 'completed';
    onStepUpdate(step4);
    
    const receiptId = `TX-${Date.now().toString(36).toUpperCase()}`;
    
    return { success: true, receiptId, steps };
  }
  
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  /**
   * Compare with competitors
   */
  static compareWithCompetitors(
    context: RoutingContext,
    selectedRoute: RoutingOption
  ): {
    competitor: string;
    fee: number;
    savings: number;
    savingsPercent: number;
  }[] {
    const competitors = [
      { name: 'dLocal', avgFee: 0.035 },
      { name: 'Kushki', avgFee: 0.029 },
      { name: 'EBANX', avgFee: 0.032 },
      { name: 'Tribal', avgFee: 0.025 },
    ];
    
    return competitors.map(comp => {
      const compFee = context.amount * comp.avgFee;
      const savings = compFee - selectedRoute.fee;
      const savingsPercent = (savings / compFee) * 100;
      
      return {
        competitor: comp.name,
        fee: compFee,
        savings,
        savingsPercent,
      };
    });
  }
}
