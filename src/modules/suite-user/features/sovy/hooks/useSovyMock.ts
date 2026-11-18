import { useState, useCallback } from 'react';
import { ChatMessage, SovyResponse } from '../types';

export const ENABLE_SOVY_MOCK = true;

// Pattern matchers for intelligent response detection
interface ResponsePattern {
  patterns: RegExp[];
  response: SovyResponse;
  priority?: number; // Higher priority patterns checked first
}

// Mock responses database for treasury-related queries
const MOCK_RESPONSES: Record<string, SovyResponse> = {
  greeting: {
    message: '¡Hola! Soy Zentinel, tu asistente de tesorería con IA. Puedo ayudarte a analizar flujos de caja, predecir necesidades de liquidez, gestionar riesgos cambiarios y optimizar tu gestión financiera. ¿En qué puedo asistirte hoy?',
    suggestions: [
      '¿Cuál es mi posición de liquidez actual?',
      'Muéstrame el flujo de caja proyectado',
      'Analiza mi exposición cambiaria',
      'Necesito optimizar pagos a proveedores'
    ]
  },
  liquidity: {
    message: 'Analizando tu posición de liquidez actual...\n\n💰 **Resumen Ejecutivo:**\n• Saldo disponible: $2,450,000 USD\n• Pagos programados (próximos 7 días): $890,000 USD\n• Ingresos esperados (próximos 7 días): $1,200,000 USD\n• Ratio de liquidez: 2.75 (Saludable ✓)\n\n📊 **Análisis de Tendencia:**\nTu liquidez ha aumentado un 18% respecto al mes anterior. El ratio está por encima del mínimo recomendado de 1.5.\n\n💡 **Recomendación Inteligente:**\nCon $1.56M de exceso de liquidez, considera:\n1. Invertir en instrumentos de corto plazo (90 días) con rendimiento del 4.2%\n2. Adelantar pagos con descuento (ahorro potencial: $12,300)\n3. Mantener $500K como buffer estratégico',
    suggestions: [
      'Ver detalle de pagos programados',
      'Proyección a 30 días',
      'Opciones de inversión disponibles',
      '¿Cómo mejorar mi ratio de liquidez?'
    ],
    actions: [
      { type: 'navigate', label: 'Ver Dashboard de Tesorería', data: { route: '/suite/dashboard' } },
      { type: 'export', label: 'Exportar Reporte PDF', data: { format: 'pdf' } }
    ]
  },
  cashflow: {
    message: 'Generando proyección de flujo de caja con análisis predictivo...\n\n📊 **Flujo de Caja Proyectado (próximos 30 días):**\n\n```\nSemana 1: +$310,000 USD (Confianza: 95%)\nSemana 2: -$85,000 USD (Confianza: 88%)\nSemana 3: +$425,000 USD (Confianza: 82%)\nSemana 4: +$190,000 USD (Confianza: 78%)\n```\n\n**Balance proyectado:** +$840,000 USD\n\n⚠️ **Alertas Identificadas:**\n1. Déficit temporal en semana 2 por concentración de pagos\n2. Cliente XYZ histórico en retrasos (riesgo en semana 3)\n\n🎯 **Plan de Acción Sugerido:**\n• Activar línea de crédito de $100K como contingencia\n• Adelantar cobros de clientes prioritarios\n• Reprogramar 3 pagos no críticos para semana 3',
    suggestions: [
      'Ver detalle semana por semana',
      'Escenarios alternativos (optimista/pesimista)',
      'Configurar alertas automáticas',
      '¿Qué pasa si retraso pagos de semana 2?'
    ],
    actions: [
      { type: 'filter', label: 'Filtrar pagos críticos', data: { type: 'critical' } }
    ]
  },
  fx_exposure: {
    message: 'Analizando tu exposición cambiaria con datos en tiempo real...\n\n💱 **Exposición FX por Moneda:**\n\n• **EUR:** €450,000 (exposición larga) | Δ +2.3% esta semana\n• **MXN:** $5,200,000 (exposición corta) | Δ -1.8% esta semana ⚠️\n• **BRL:** R$1,800,000 (exposición larga) | Δ +0.5% esta semana\n• **GBP:** £120,000 (exposición corta) | Δ -0.3% esta semana\n\n🔴 **Riesgos Críticos Detectados:**\n1. **MXN:** Alta volatilidad esperada por decisión de Banxico el jueves\n2. **EUR:** Evento BCE podría generar movimientos del 1-2%\n\n💡 **Estrategia Recomendada:**\n• Hedging del 70% posición MXN mediante forward a 30 días (costo: 0.8%)\n• Monitorear EUR antes de BCE (miércoles 14:00 CET)\n• Mantener posición BRL sin cobertura (volatilidad baja)\n\n📈 **Ahorro Potencial:** $23,400 USD evitando pérdidas por volatilidad',
    suggestions: [
      'Cotizar forwards para MXN ahora',
      'Ver análisis de volatilidad histórica',
      'Configurar alertas de tipo de cambio',
      '¿Cuál es el costo de no hacer hedging?',
      'Simular escenario de devaluación 5%'
    ],
    actions: [
      { type: 'navigate', label: 'Ir a Change FX', data: { route: '/suite/convert/fx' } },
      { type: 'create', label: 'Crear Forward MXN', data: { currency: 'MXN', amount: 5200000 } }
    ]
  },
  payments: {
    message: 'Optimizando estrategia de pagos con IA...\n\n📋 **Análisis Completo:**\n• **Total pagos pendientes:** 45 operaciones\n• **Monto total:** $1,340,000 USD\n• **Proveedores con descuento:** 12 (26.7%)\n• **Promedio días de pago:** 38 días\n\n💰 **Oportunidades Identificadas:**\n\n**1. Descuentos por pronto pago:**\nPagando antes del 15 dic → Ahorro: $18,500 USD (1.38%)\n\n**2. Optimización de cash pooling:**\nConsolidar pagos en USD → Ahorro FX: $3,200 USD\n\n**3. Negociación con top proveedores:**\n4 proveedores (60% del volumen) → Potencial descuento adicional: $8,900 USD\n\n✅ **Plan Óptimo Generado:**\n1. Pagar $780K antes del 15 dic (descuentos)\n2. Negociar extensión de $200K a 60 días\n3. Consolidar $360K en pago único USD\n\n🎯 **Impacto Total:** Ahorro de $30,600 + Mejora 12 días DPO',
    suggestions: [
      'Ver lista priorizada de pagos',
      'Calcular ahorro total posible',
      'Programar pagos automáticos',
      '¿Cómo negocio mejores términos?',
      'Comparar con mes anterior'
    ],
    actions: [
      { type: 'navigate', label: 'Ir a Pagos', data: { route: '/suite/move/payouts' } },
      { type: 'export', label: 'Exportar Plan de Pagos', data: { format: 'xlsx' } }
    ]
  },
  collections: {
    message: 'Analizando tu estrategia de cobros...\n\n📥 **Status de Cobros:**\n• **Cuentas por cobrar:** $3,240,000 USD\n• **DSO Actual:** 42 días (Industria: 35 días) ⚠️\n• **Facturas vencidas:** 18 ($420,000 USD)\n• **Clientes morosos:** 7 clientes\n\n🔴 **Alertas Críticas:**\n• Cliente ABC: $180K vencido hace 60 días (alto riesgo)\n• Cliente DEF: $95K vencido hace 45 días (riesgo medio)\n\n💡 **Acciones Recomendadas:**\n1. **Inmediato:** Contactar 7 clientes morosos (recovery $420K)\n2. **Corto plazo:** Implementar descuento 2% por pago anticipado\n3. **Estratégico:** Revisar política de crédito para nuevos clientes\n\n🎯 **Objetivo:** Reducir DSO a 35 días = Liberar $315K en capital de trabajo',
    suggestions: [
      'Ver detalle de facturas vencidas',
      'Generar cartas de cobro automáticas',
      'Analizar histórico de clientes morosos',
      '¿Cómo mejoro mi DSO?',
      'Simular impacto de descuentos'
    ],
    actions: [
      { type: 'navigate', label: 'Ir a Cobros', data: { route: '/suite/move/collect' } },
      { type: 'create', label: 'Crear Campaña de Cobro', data: { type: 'collection' } }
    ]
  },
  investments: {
    message: 'Analizando oportunidades de inversión para tu exceso de liquidez...\n\n💎 **Capital Disponible para Invertir:** $1,560,000 USD\n\n📊 **Opciones Recomendadas (Perfil Conservador):**\n\n**1. Fondos del Mercado Monetario**\n• Rendimiento: 4.2% anual\n• Liquidez: Inmediata\n• Riesgo: Muy bajo\n• Monto sugerido: $800K\n\n**2. Bonos Corporativos AAA (90 días)**\n• Rendimiento: 5.1% anual\n• Liquidez: 90 días\n• Riesgo: Bajo\n• Monto sugerido: $500K\n\n**3. CETES 28 días (México)**\n• Rendimiento: 10.5% anual\n• Liquidez: 28 días\n• Riesgo: Muy bajo\n• Monto sugerido: $260K\n\n💰 **Rendimiento Proyectado Anual:** $73,420 USD\n\n⚡ **Importante:** Mantener $500K como buffer de liquidez estratégico',
    suggestions: [
      'Ver más opciones de inversión',
      'Calcular rendimientos a diferentes plazos',
      'Comparar con histórico',
      '¿Qué pasa si necesito liquidez antes?',
      'Ver perfil de riesgo moderado'
    ],
    actions: [
      { type: 'navigate', label: 'Ir a Marketplace', data: { route: '/suite/marketplace' } }
    ]
  },
  transactions: {
    message: 'Consultando tus transacciones recientes...\n\n📊 **Últimas 24 horas:**\n• Total operaciones: 23\n• Volumen: $456,300 USD\n• Pagos: 12 ($234,500)\n• Cobros: 8 ($198,800)\n• Conversiones FX: 3 ($23,000)\n\n📈 **Tendencias:**\n• Volumen +15% vs ayer\n• Transacciones internacionales: 34%\n• Mayor actividad: 10:00-12:00 hrs\n\n🔍 **Top Transacciones:**\n1. Pago Provider XYZ - $78,500 USD\n2. Cobro Cliente ABC - $65,000 USD\n3. Conversión USD→EUR - €15,000\n\n💡 Detecté 2 transacciones con tarifas subóptimas. ¿Quieres que te muestre cómo optimizarlas?',
    suggestions: [
      'Ver todas las transacciones',
      'Filtrar por tipo de operación',
      'Analizar costos de transacción',
      'Exportar reporte mensual',
      '¿Cómo reduzco costos de transacción?'
    ],
    actions: [
      { type: 'navigate', label: 'Ver Historial Completo', data: { route: '/suite/dashboard' } }
    ]
  },
  analytics: {
    message: 'Generando análisis avanzado de tu tesorería...\n\n📊 **KPIs Principales (Último Mes):**\n\n**Liquidez:**\n• Ratio promedio: 2.45 (↑ 8%)\n• Días de caja: 68 días (↑ 5 días)\n• Capital de trabajo: $2.1M (↑ 12%)\n\n**Eficiencia:**\n• DSO: 42 días (↓ 3 días) ✓\n• DPO: 38 días (↑ 2 días) ✓\n• Ciclo de conversión: 28 días (↓ 5 días) ✓\n\n**FX Performance:**\n• Ganancias FX: +$18,400\n• Pérdidas evitadas (hedging): $23,100\n• ROI estrategia FX: 3.2%\n\n**Optimización:**\n• Ahorros en pagos: $45,200\n• Ingresos por inversiones: $12,800\n• Reducción costos transacción: $3,400\n\n🎯 **Score General:** 87/100 (Excelente) ⭐⭐⭐⭐',
    suggestions: [
      'Ver análisis detallado por categoría',
      'Comparar con trimestre anterior',
      'Benchmarking vs industria',
      '¿Cómo llego a 95/100?',
      'Exportar dashboard ejecutivo'
    ],
    actions: [
      { type: 'navigate', label: 'Ir a Analytics', data: { route: '/suite/analytics' } },
      { type: 'export', label: 'Exportar Dashboard', data: { format: 'pdf' } }
    ]
  },
  alerts: {
    message: '🔔 **Centro de Alertas Inteligentes**\n\n**Alertas Activas: 4**\n\n🔴 **Críticas (1):**\n• Ratio de liquidez bajará a 1.2 en 5 días (umbral: 1.5)\n\n🟡 **Importantes (2):**\n• Cliente XYZ: Factura $85K vencida hace 45 días\n• Volatilidad MXN: Evento macro el jueves (Banxico)\n\n🟢 **Informativas (1):**\n• Oportunidad: 3 proveedores con descuento hasta mañana\n\n⚙️ **Alertas Configuradas:**\n• Liquidez < 1.5x\n• Facturas vencidas > 30 días\n• Volatilidad FX > 2%\n• Oportunidades de ahorro\n\n💡 ¿Quieres que configure más alertas personalizadas?',
    suggestions: [
      'Ver detalle de alertas críticas',
      'Configurar nueva alerta',
      'Desactivar alertas informativas',
      '¿Qué alertas recomiendas?',
      'Ver histórico de alertas'
    ]
  },
  help: {
    message: '🤝 **Centro de Ayuda - Zentinel**\n\n**¿Qué puedo hacer por ti?**\n\n**💰 Análisis Financiero:**\n• Liquidez y solvencia\n• Flujo de caja y proyecciones\n• Capital de trabajo\n• Ratios financieros\n\n**💱 Gestión FX:**\n• Exposición cambiaria\n• Cotizaciones en tiempo real\n• Estrategias de hedging\n• Análisis de volatilidad\n\n**💸 Optimización:**\n• Pagos a proveedores\n• Cobros y DSO\n• Inversiones de corto plazo\n• Reducción de costos\n\n**📊 Inteligencia:**\n• Analytics y KPIs\n• Reportes personalizados\n• Alertas automáticas\n• Recomendaciones IA\n\n**Ejemplos de preguntas:**\n"¿Cuánto dinero tengo disponible?"\n"Muéstrame transacciones de hoy"\n"¿Cómo optimizo mis pagos?"\n"Analiza mi exposición en EUR"',
    suggestions: [
      '¿Cuál es mi posición de liquidez?',
      'Muéstrame el flujo de caja',
      'Analiza mi exposición FX',
      'Ver mis alertas activas',
      'Genera un reporte completo'
    ]
  },
  thanks: {
    message: '¡De nada! Es un placer asistirte. 😊\n\nEstoy aquí 24/7 para ayudarte con tu gestión de tesorería. Si necesitas cualquier análisis, reporte o recomendación, solo pregúntame.\n\n💡 **Tip del día:** Revisa tu exposición cambiaria al menos una vez por semana para identificar oportunidades de optimización.',
    suggestions: [
      '¿Qué más puedes hacer?',
      'Muéstrame un análisis general',
      'Ver alertas activas',
      'Generar reporte del mes'
    ]
  },
  capabilities: {
    message: '🚀 **Capacidades de Zentinel**\n\nSoy tu asistente de tesorería potenciado con IA. Estas son mis principales funcionalidades:\n\n**🧠 Análisis Inteligente:**\n• Procesamiento en lenguaje natural\n• Análisis predictivo de flujos\n• Detección automática de riesgos\n• Recomendaciones personalizadas\n\n**📊 Datos en Tiempo Real:**\n• Monitoreo continuo de liquidez\n• Cotizaciones FX actualizadas\n• Alertas proactivas\n• KPIs automatizados\n\n**💼 Optimización:**\n• Estrategias de pago/cobro\n• Gestión de riesgo cambiario\n• Oportunidades de inversión\n• Reducción de costos\n\n**🤖 Automatización:**\n• Reportes programados\n• Alertas configurables\n• Proyecciones automáticas\n• Integración con tu suite\n\n**🎯 En desarrollo:**\n• Integración con WhatsApp/Telegram\n• Comandos por voz\n• Análisis de documentos\n• Recomendaciones más avanzadas',
    suggestions: [
      'Hazme un análisis completo',
      '¿Qué problemas puedes resolver?',
      'Muéstrame casos de uso',
      'Ver roadmap futuro'
    ]
  },
  default: {
    message: 'Entiendo tu consulta. Como asistente de tesorería, puedo ayudarte con:\n\n• 💧 Análisis de liquidez y flujo de caja\n• 💱 Gestión de riesgo cambiario\n• 📈 Proyecciones financieras\n• 💸 Optimización de pagos y cobros\n• 🎯 Recomendaciones estratégicas\n• 📊 Analytics y reportes\n• 🔔 Alertas inteligentes\n\n¿Sobre cuál de estos temas te gustaría que te ayude?',
    suggestions: [
      'Analizar liquidez',
      'Proyección de flujo',
      'Exposición cambiaria',
      'Optimizar pagos',
      'Ver alertas activas',
      '¿Qué puedes hacer?'
    ]
  }
};

// Response patterns with regex matching
const RESPONSE_PATTERNS: ResponsePattern[] = [
  // Greetings
  {
    patterns: [/^(hola|hi|hello|hey|buenos días|buenas tardes|buenas noches)/i],
    response: MOCK_RESPONSES.greeting,
    priority: 10
  },
  // Thanks
  {
    patterns: [/(gracias|thanks|thank you|excelente|perfecto|genial)/i],
    response: MOCK_RESPONSES.thanks,
    priority: 10
  },
  // Help & capabilities
  {
    patterns: [/(ayuda|help|qué puedes hacer|capacidades|funciones|cómo funciona)/i],
    response: MOCK_RESPONSES.help,
    priority: 9
  },
  {
    patterns: [/(puedes|capabilities|features|que sabes|que ofreces)/i],
    response: MOCK_RESPONSES.capabilities,
    priority: 8
  },
  // Liquidity
  {
    patterns: [
      /(liquidez|saldo|disponible|cuánto (dinero|capital|efectivo)|posición de caja|cash position)/i,
      /((tengo|hay|existe) .*(disponible|saldo|efectivo))/i
    ],
    response: MOCK_RESPONSES.liquidity,
    priority: 7
  },
  // Cash flow
  {
    patterns: [
      /(flujo de caja|cash flow|proyecc?ión|forecast|previsión)/i,
      /(cuánto (voy a|tendré)|cómo (va|está) el flujo)/i
    ],
    response: MOCK_RESPONSES.cashflow,
    priority: 7
  },
  // FX exposure
  {
    patterns: [
      /(cambiar|forex|fx|divisa|moneda|tipo de cambio|exchange)/i,
      /(exposición|riesgo) .*(cambiar|fx|divisa|moneda)/i,
      /(euro|dólar|peso|real|libra|eur|usd|mxn|brl|gbp)/i
    ],
    response: MOCK_RESPONSES.fx_exposure,
    priority: 7
  },
  // Payments
  {
    patterns: [
      /(pago|pagar|proveedor|supplier|vendor|accounts payable)/i,
      /(optimiz|mejor).*(pago|proveedor)/i,
      /dpo/i
    ],
    response: MOCK_RESPONSES.payments,
    priority: 7
  },
  // Collections
  {
    patterns: [
      /(cobro|cobrar|cliente|customer|cuentas por cobrar|accounts receivable)/i,
      /(factura|invoice).*(vencid|pendie|cobr)/i,
      /dso/i
    ],
    response: MOCK_RESPONSES.collections,
    priority: 7
  },
  // Investments
  {
    patterns: [
      /(inver|rendimiento|yield|return|interest)/i,
      /(dónde|cómo) (invertir|colocar)/i,
      /(exceso|sobra|extra).*(liquidez|dinero|capital)/i
    ],
    response: MOCK_RESPONSES.investments,
    priority: 6
  },
  // Transactions
  {
    patterns: [
      /(transacc|operac|movimiento)/i,
      /(últim|recien|hoy|ayer).*(transacc|operac|movimiento)/i,
      /(ver|muestra|lista).*(transacc|operac|movimiento)/i
    ],
    response: MOCK_RESPONSES.transactions,
    priority: 6
  },
  // Analytics
  {
    patterns: [
      /(analytic|análisis|reporte|report|kpi|dashboard|métricas)/i,
      /(cómo (va|está|anda)|muestra).*(negocio|empresa|tesorería)/i,
      /(rendimiento|performance|desempeño)/i
    ],
    response: MOCK_RESPONSES.analytics,
    priority: 6
  },
  // Alerts
  {
    patterns: [
      /(alerta|alert|notificac|aviso|warning)/i,
      /(qué|cuál).*(alerta|problema|riesgo|crítico)/i
    ],
    response: MOCK_RESPONSES.alerts,
    priority: 7
  }
];

export function useSovyMock() {
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get initial system message
  const getInitialMessage = useCallback((): ChatMessage => {
    return {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: MOCK_RESPONSES.greeting.message,
      timestamp: new Date(),
      status: 'sent'
    };
  }, []);

  // Simulate typing delay based on message length
  const simulateTypingDelay = useCallback((messageLength: number = 100): Promise<void> => {
    // Longer messages take more time
    const baseDelay = 1000;
    const lengthDelay = Math.min(messageLength * 2, 2000);
    const randomDelay = Math.random() * 500;
    const totalDelay = baseDelay + lengthDelay + randomDelay;
    
    return new Promise(resolve => setTimeout(resolve, totalDelay));
  }, []);

  // Determine which mock response to use based on user message with pattern matching
  const getMockResponse = useCallback((userMessage: string): SovyResponse => {
    // Sort patterns by priority
    const sortedPatterns = [...RESPONSE_PATTERNS].sort((a, b) => 
      (b.priority || 0) - (a.priority || 0)
    );

    // Try to match patterns
    for (const pattern of sortedPatterns) {
      for (const regex of pattern.patterns) {
        if (regex.test(userMessage)) {
          return pattern.response;
        }
      }
    }
    
    // Fallback to default response
    return MOCK_RESPONSES.default;
  }, []);

  // Send mock message and get response
  const sendMockMessage = useCallback(async (userMessage: string): Promise<ChatMessage> => {
    if (!ENABLE_SOVY_MOCK) {
      throw new Error('Zentinel mock is disabled. Real integration not available yet.');
    }

    try {
      setIsTyping(true);
      setError(null);

      // Get appropriate mock response
      const response = getMockResponse(userMessage);

      // Simulate network delay based on response length
      await simulateTypingDelay(response.message.length);

      // Create assistant message
      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response.message,
        timestamp: new Date(),
        status: 'sent'
      };

      return assistantMessage;
    } catch (err) {
      setError('No pudimos procesar tu mensaje. Intenta de nuevo.');
      throw err;
    } finally {
      setIsTyping(false);
    }
  }, [getMockResponse, simulateTypingDelay]);

  // Get suggestions for a message
  const getSuggestions = useCallback((userMessage?: string): string[] => {
    if (!userMessage) {
      return MOCK_RESPONSES.greeting.suggestions || [];
    }
    
    const response = getMockResponse(userMessage);
    return response.suggestions || [];
  }, [getMockResponse]);

  // Get actions for a message
  const getActions = useCallback((userMessage?: string) => {
    if (!userMessage) return [];
    
    const response = getMockResponse(userMessage);
    return response.actions || [];
  }, [getMockResponse]);

  return {
    getInitialMessage,
    sendMockMessage,
    simulateTypingDelay,
    getSuggestions,
    getActions,
    isTyping,
    error,
    isMockEnabled: ENABLE_SOVY_MOCK
  };
}
