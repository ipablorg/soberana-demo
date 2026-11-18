import type { Language } from './sidebar-content';

export interface SovyCapability {
  icon: string;
  title: string;
  askExample: string;
  description: string;
}

export interface SovyTool {
  icon: string;
  name: string;
  description: string;
  example: string;
}

export interface SovyFAQItem {
  question: string;
  answer: string;
}

export interface SovyRoadmapPhase {
  phase: string;
  title: string;
  status: 'done' | 'building' | 'planned';
  description: string;
}

export interface SovySecurityPillar {
  icon: string;
  title: string;
  description: string;
}

export interface ConversationMessage {
  role: 'user' | 'sovy';
  content: string;
}

export interface SovyContent {
  hero: {
    title: string;
    subtitle: string;
    description: string;
  };
  capabilities: {
    title: string;
    items: SovyCapability[];
  };
  seeItInAction: {
    title: string;
    annotations: Array<{ x: string; y: string; label: string }>;
  };
  howItWorks: {
    title: string;
    steps: Array<{ icon: string; title: string; description: string }>;
  };
  sovyVaults: {
    title: string;
    description: string;
    conversations: ConversationMessage[][];
  };
  sovyPayments: {
    title: string;
    description: string;
    payInStates: Array<{ label: string; status: 'completed' | 'active' | 'pending' }>;
    payOutStates: Array<{ label: string; status: 'completed' | 'active' | 'pending' }>;
    conversation: ConversationMessage[];
  };
  tools: {
    title: string;
    subtitle: string;
    items: SovyTool[];
  };
  security: {
    title: string;
    pillars: SovySecurityPillar[];
  };
  roadmap: {
    title: string;
    phases: SovyRoadmapPhase[];
  };
  faq: {
    title: string;
    items: SovyFAQItem[];
  };
  cta: {
    title: string;
    buttonLabel: string;
    buttonHref: string;
  };
}

const sovyContent: Record<Language, SovyContent> = {
  en: {
    hero: {
      title: 'Meet Zentinel',
      subtitle: 'Your AI Treasury Assistant',
      description:
        'Ask Zentinel anything about your finances. It checks your real accounts, analyzes your data, and gives you clear answers — in seconds. Like having a CFO on speed dial, 24/7.',
    },
    capabilities: {
      title: 'What Can Zentinel Do?',
      items: [
        {
          icon: '💰',
          title: 'Liquidity Analysis',
          askExample: '¿Cuánto dinero tengo disponible?',
          description:
            'Zentinel checks all your accounts in real-time and gives you a complete liquidity summary with ratios and trends.',
        },
        {
          icon: '📊',
          title: 'Cash Flow Projections',
          askExample: 'Show me the cash flow forecast for next month',
          description:
            'Zentinel predicts your inflows and outflows using AI, with confidence scores for each week.',
        },
        {
          icon: '💱',
          title: 'FX Risk Management',
          askExample: "What's my exposure in EUR and MXN?",
          description:
            'Zentinel calculates your foreign exchange risk across all currencies and recommends hedging strategies.',
        },
        {
          icon: '🔔',
          title: 'Smart Alerts',
          askExample: 'Alert me if liquidity drops below $50K',
          description:
            'Zentinel monitors your finances 24/7 and proactively warns you about risks before they become problems.',
        },
      ],
    },
    seeItInAction: {
      title: 'See Zentinel in Action',
      annotations: [
        { x: '75%', y: '10%', label: 'Ask anything in plain language' },
        { x: '15%', y: '25%', label: 'Real data from your accounts' },
        { x: '15%', y: '55%', label: 'Actionable recommendations' },
        { x: '40%', y: '88%', label: 'Quick-reply suggestions' },
      ],
    },
    howItWorks: {
      title: 'How Does Zentinel Work?',
      steps: [
        {
          icon: '💬',
          title: 'You ask a question',
          description:
            'Type your question in natural language. Spanish, English, Portuguese — Zentinel understands.',
        },
        {
          icon: '🧠',
          title: 'Zentinel understands your intent',
          description:
            'AI analyzes what you need: a balance check? A forecast? An action?',
        },
        {
          icon: '🔍',
          title: 'Queries your real financial data',
          description:
            'Zentinel connects to your accounts, wallets, invoices, and market data in real-time.',
        },
        {
          icon: '📊',
          title: 'Analyzes and reasons',
          description:
            'The AI processes the data, runs calculations, identifies risks and opportunities.',
        },
        {
          icon: '✅',
          title: 'Responds with insights',
          description:
            'You get a clear answer with numbers, trends, and actionable recommendations.',
        },
      ],
    },
    sovyVaults: {
      title: 'Zentinel Knows Your Investments',
      description:
        'Zentinel connects directly to your Soberana Vaults. Ask about your positions, yields, or whether you should move capital — and get answers based on real data.',
      conversations: [
        [
          {
            role: 'user',
            content: 'How much did I earn this week from the Vaults?',
          },
          {
            role: 'sovy',
            content:
              'This week, your Vault positions generated:\n\n• SOL/USDC Alpha: +$87.30 (APY: 11.4%)\n• ETH/USDC Beta: +$42.20 (APY: 8.2%)\n\nTotal weekly yield: +$129.50\n\nYour portfolio is performing 15% above the 30-day average. The Alpha vault is outperforming due to high trading volume on Orca this week.',
          },
        ],
        [
          {
            role: 'user',
            content:
              'Should I withdraw from the Beta vault to pay tomorrow\'s payroll?',
          },
          {
            role: 'sovy',
            content:
              'Let me check...\n\nYour available liquidity: $45,000 USDC\nTomorrow\'s payroll: $38,000 USDC\n\n✅ You have enough liquidity without withdrawing from any vault.\n\nRecommendation: Keep your Beta position active — it would cost you ~$12/day in lost yield to withdraw and re-deposit.',
          },
        ],
      ],
    },
    sovyPayments: {
      title: 'Track Every Payment in Real-Time',
      description:
        'Zentinel monitors every incoming and outgoing payment. Ask about the status of any transfer — Zentinel traces it through every step.',
      payInStates: [
        { label: 'INITIATED', status: 'completed' },
        { label: 'PENDING', status: 'completed' },
        { label: 'RECEIVED', status: 'completed' },
        { label: 'CONVERTING', status: 'active' },
        { label: 'CREDITED', status: 'pending' },
        { label: 'COMPLETED', status: 'pending' },
      ],
      payOutStates: [
        { label: 'CREATED', status: 'completed' },
        { label: 'APPROVED', status: 'completed' },
        { label: 'PROCESSING', status: 'active' },
        { label: 'SENT', status: 'pending' },
        { label: 'CONFIRMED', status: 'pending' },
        { label: 'COMPLETED', status: 'pending' },
      ],
      conversation: [
        {
          role: 'user',
          content: 'Did my PIX from Brazil arrive?',
        },
        {
          role: 'sovy',
          content:
            "Yes! Your PIX transfer of R$5,000.00 BRL was received 8 minutes ago.\n\nStatus: Converting to USDC\nEstimated rate: R$5.20 per USDC\nEstimated USDC: ~961.54 USDC\nExpected completion: ~7 more minutes\n\nI'll let you know when it hits your wallet.",
        },
      ],
    },
    tools: {
      title: '12 Financial Tools at Your Service',
      subtitle:
        'Zentinel doesn\'t guess. It uses specialized tools to query real data and execute real actions.',
      items: [
        {
          icon: '💰',
          name: 'Balance Check',
          description: 'Checks all your account balances in real-time',
          example: 'How much do I have available?',
        },
        {
          icon: '📊',
          name: 'Cash Flow Forecast',
          description:
            'Predicts your income and expenses for the coming weeks',
          example: "What's my cash flow for next month?",
        },
        {
          icon: '💱',
          name: 'FX Exposure',
          description:
            'Calculates your risk across different currencies',
          example: "What's my exposure in EUR?",
        },
        {
          icon: '📋',
          name: 'Invoice Tracker',
          description:
            'Shows pending invoices — who owes you, who you owe',
          example: 'Show me overdue invoices over $10K',
        },
        {
          icon: '🏦',
          name: 'Vault Positions',
          description:
            'Shows your investment positions, yields, and P&L',
          example: 'How are my Vaults performing?',
        },
        {
          icon: '📈',
          name: 'Vault Performance',
          description: 'Detailed charts and metrics for any vault',
          example: 'Show me the APY trend for Alpha vault',
        },
        {
          icon: '💸',
          name: 'Execute Payment',
          description:
            'Schedules a payment (asks for confirmation first)',
          example: 'Pay $5,000 to Supplier XYZ tomorrow',
        },
        {
          icon: '🛡️',
          name: 'Create Hedge',
          description:
            'Creates an FX forward contract for protection',
          example: 'Hedge my MXN exposure for 30 days',
        },
        {
          icon: '📄',
          name: 'Generate Report',
          description:
            'Creates a downloadable PDF or Excel report',
          example: 'Generate a full treasury report for February',
        },
        {
          icon: '🔔',
          name: 'Set Alert',
          description:
            'Creates an automated alert for any financial metric',
          example: 'Alert me if liquidity drops below $50K',
        },
        {
          icon: '🔄',
          name: 'Pay-in Status',
          description: 'Tracks incoming payments through every step',
          example: 'Did my transfer from Colombia arrive?',
        },
        {
          icon: '📤',
          name: 'Pay-out Status',
          description: 'Tracks outgoing payments through every step',
          example: 'Where is the payment to my supplier?',
        },
      ],
    },
    security: {
      title: 'Your Data is Sacred',
      pillars: [
        {
          icon: '🔒',
          title: 'Tenant Isolation',
          description:
            'Your financial data is completely separate from every other company. Zentinel can only access YOUR accounts.',
        },
        {
          icon: '📝',
          title: 'Full Audit Trail',
          description:
            'Every question, every answer, every action is logged. Complete transparency for compliance.',
        },
        {
          icon: '🛡️',
          title: 'No Data Training',
          description:
            'Your conversations are never used to train AI models. Zero-day data retention on the AI provider.',
        },
        {
          icon: '⚡',
          title: 'Confirmation Required',
          description:
            'Zentinel always asks for your explicit confirmation before executing any financial action. No surprises.',
        },
      ],
    },
    roadmap: {
      title: "What's Coming Next",
      phases: [
        {
          phase: 'Phase 1',
          title: 'Real-time data',
          status: 'done',
          description:
            'Zentinel answers with real data from your accounts',
        },
        {
          phase: 'Phase 2',
          title: 'Actions',
          status: 'building',
          description:
            'Execute payments, create hedges, manage vaults — via chat',
        },
        {
          phase: 'Phase 3',
          title: 'Predictive AI',
          status: 'planned',
          description:
            'Anomaly detection, predictive alerts, document analysis',
        },
        {
          phase: 'Phase 4',
          title: 'Multi-channel',
          status: 'planned',
          description:
            'Access Zentinel from WhatsApp, Telegram, and Slack',
        },
      ],
    },
    faq: {
      title: 'Frequently Asked Questions',
      items: [
        {
          question: 'Is Zentinel really AI or just scripted?',
          answer:
            'Real AI. Zentinel uses Claude (by Anthropic), one of the most advanced language models. It reasons about your specific data, not generic templates.',
        },
        {
          question: 'Can Zentinel make mistakes?',
          answer:
            'Zentinel always bases answers on real data from your accounts. It never fabricates numbers. For financial decisions, it provides recommendations — the final decision is always yours.',
        },
        {
          question: 'What languages does it understand?',
          answer:
            'Spanish, English, and Portuguese. It detects your language automatically.',
        },
        {
          question: 'Does Zentinel have access to my passwords?',
          answer:
            'Never. Zentinel reads financial data (balances, transactions, invoices) but has zero access to credentials, tokens, or passwords.',
        },
        {
          question: 'How much does it cost?',
          answer:
            'Zentinel is included in your Soberana plan. No additional per-query charges.',
        },
      ],
    },
    cta: {
      title: 'Ready to try Zentinel?',
      buttonLabel: '← Back to Docs',
      buttonHref: '/docs',
    },
  },
  es: {
    hero: {
      title: 'Conoce a Zentinel',
      subtitle: 'Tu Asistente de Tesorería con IA',
      description:
        'Pregúntale a Zentinel lo que quieras sobre tus finanzas. Revisa tus cuentas reales, analiza tus datos y te da respuestas claras — en segundos. Como tener un CFO disponible las 24 horas, los 7 días.',
    },
    capabilities: {
      title: '¿Qué Puede Hacer Zentinel?',
      items: [
        {
          icon: '💰',
          title: 'Análisis de Liquidez',
          askExample: '¿Cuánto dinero tengo disponible?',
          description:
            'Zentinel revisa todas tus cuentas en tiempo real y te da un resumen completo de liquidez con ratios y tendencias.',
        },
        {
          icon: '📊',
          title: 'Proyecciones de Flujo de Caja',
          askExample: 'Muéstrame el pronóstico de flujo de caja del próximo mes',
          description:
            'Zentinel predice tus ingresos y egresos usando IA, con niveles de confianza para cada semana.',
        },
        {
          icon: '💱',
          title: 'Gestión de Riesgo Cambiario',
          askExample: '¿Cuál es mi exposición en EUR y MXN?',
          description:
            'Zentinel calcula tu riesgo cambiario en todas las divisas y recomienda estrategias de cobertura.',
        },
        {
          icon: '🔔',
          title: 'Alertas Inteligentes',
          askExample: 'Avísame si la liquidez baja de $50K',
          description:
            'Zentinel monitorea tus finanzas 24/7 y te avisa proactivamente sobre riesgos antes de que se conviertan en problemas.',
        },
      ],
    },
    seeItInAction: {
      title: 'Mira a Zentinel en Acción',
      annotations: [
        { x: '75%', y: '10%', label: 'Pregunta lo que quieras en lenguaje natural' },
        { x: '15%', y: '25%', label: 'Datos reales de tus cuentas' },
        { x: '15%', y: '55%', label: 'Recomendaciones accionables' },
        { x: '40%', y: '88%', label: 'Sugerencias de respuesta rápida' },
      ],
    },
    howItWorks: {
      title: '¿Cómo Funciona Zentinel?',
      steps: [
        {
          icon: '💬',
          title: 'Haces una pregunta',
          description:
            'Escribe tu pregunta en lenguaje natural. Español, inglés, portugués — Zentinel entiende.',
        },
        {
          icon: '🧠',
          title: 'Zentinel entiende tu intención',
          description:
            'La IA analiza lo que necesitas: ¿una consulta de saldo? ¿Un pronóstico? ¿Una acción?',
        },
        {
          icon: '🔍',
          title: 'Consulta tus datos financieros reales',
          description:
            'Zentinel se conecta a tus cuentas, wallets, facturas y datos de mercado en tiempo real.',
        },
        {
          icon: '📊',
          title: 'Analiza y razona',
          description:
            'La IA procesa los datos, ejecuta cálculos, identifica riesgos y oportunidades.',
        },
        {
          icon: '✅',
          title: 'Responde con insights',
          description:
            'Obtienes una respuesta clara con números, tendencias y recomendaciones accionables.',
        },
      ],
    },
    sovyVaults: {
      title: 'Zentinel Conoce Tus Inversiones',
      description:
        'Zentinel se conecta directamente a tus Soberana Vaults. Pregunta sobre tus posiciones, rendimientos, o si deberías mover capital — y obtén respuestas basadas en datos reales.',
      conversations: [
        [
          {
            role: 'user',
            content: '¿Cuánto gané esta semana con los Vaults?',
          },
          {
            role: 'sovy',
            content:
              'Esta semana, tus posiciones en Vaults generaron:\n\n• SOL/USDC Alpha: +$87.30 (APY: 11.4%)\n• ETH/USDC Beta: +$42.20 (APY: 8.2%)\n\nRendimiento semanal total: +$129.50\n\nTu portafolio está rindiendo 15% por encima del promedio de 30 días. El vault Alpha está superando el rendimiento gracias al alto volumen de trading en Orca esta semana.',
          },
        ],
        [
          {
            role: 'user',
            content:
              '¿Debería retirar del vault Beta para pagar la nómina de mañana?',
          },
          {
            role: 'sovy',
            content:
              'Déjame verificar...\n\nTu liquidez disponible: $45,000 USDC\nNómina de mañana: $38,000 USDC\n\n✅ Tienes suficiente liquidez sin necesidad de retirar de ningún vault.\n\nRecomendación: Mantén tu posición en Beta activa — retirarte y re-depositar te costaría ~$12/día en rendimiento perdido.',
          },
        ],
      ],
    },
    sovyPayments: {
      title: 'Rastrea Cada Pago en Tiempo Real',
      description:
        'Zentinel monitorea cada pago entrante y saliente. Pregunta por el estado de cualquier transferencia — Zentinel la rastrea paso a paso.',
      payInStates: [
        { label: 'INICIADO', status: 'completed' },
        { label: 'PENDIENTE', status: 'completed' },
        { label: 'RECIBIDO', status: 'completed' },
        { label: 'CONVIRTIENDO', status: 'active' },
        { label: 'ACREDITADO', status: 'pending' },
        { label: 'COMPLETADO', status: 'pending' },
      ],
      payOutStates: [
        { label: 'CREADO', status: 'completed' },
        { label: 'APROBADO', status: 'completed' },
        { label: 'PROCESANDO', status: 'active' },
        { label: 'ENVIADO', status: 'pending' },
        { label: 'CONFIRMADO', status: 'pending' },
        { label: 'COMPLETADO', status: 'pending' },
      ],
      conversation: [
        {
          role: 'user',
          content: '¿Llegó mi PIX de Brasil?',
        },
        {
          role: 'sovy',
          content:
            '¡Sí! Tu transferencia PIX de R$5,000.00 BRL fue recibida hace 8 minutos.\n\nEstado: Convirtiendo a USDC\nTasa estimada: R$5.20 por USDC\nUSDC estimados: ~961.54 USDC\nTiempo estimado: ~7 minutos más\n\nTe aviso cuando llegue a tu wallet.',
        },
      ],
    },
    tools: {
      title: '12 Herramientas Financieras a Tu Servicio',
      subtitle:
        'Zentinel no adivina. Usa herramientas especializadas para consultar datos reales y ejecutar acciones reales.',
      items: [
        {
          icon: '💰',
          name: 'Consulta de Saldo',
          description: 'Revisa todos los saldos de tus cuentas en tiempo real',
          example: '¿Cuánto tengo disponible?',
        },
        {
          icon: '📊',
          name: 'Pronóstico de Flujo de Caja',
          description:
            'Predice tus ingresos y gastos para las próximas semanas',
          example: '¿Cuál es mi flujo de caja del próximo mes?',
        },
        {
          icon: '💱',
          name: 'Exposición Cambiaria',
          description:
            'Calcula tu riesgo en diferentes divisas',
          example: '¿Cuál es mi exposición en EUR?',
        },
        {
          icon: '📋',
          name: 'Rastreador de Facturas',
          description:
            'Muestra facturas pendientes — quién te debe, a quién le debes',
          example: 'Muéstrame facturas vencidas mayores a $10K',
        },
        {
          icon: '🏦',
          name: 'Posiciones en Vaults',
          description:
            'Muestra tus posiciones de inversión, rendimientos y P&L',
          example: '¿Cómo van mis Vaults?',
        },
        {
          icon: '📈',
          name: 'Rendimiento de Vaults',
          description: 'Gráficos y métricas detalladas de cualquier vault',
          example: 'Muéstrame la tendencia de APY del vault Alpha',
        },
        {
          icon: '💸',
          name: 'Ejecutar Pago',
          description:
            'Programa un pago (pide confirmación primero)',
          example: 'Paga $5,000 al Proveedor XYZ mañana',
        },
        {
          icon: '🛡️',
          name: 'Crear Cobertura',
          description:
            'Crea un contrato forward de divisas para protección',
          example: 'Cubre mi exposición en MXN por 30 días',
        },
        {
          icon: '📄',
          name: 'Generar Reporte',
          description:
            'Crea un reporte descargable en PDF o Excel',
          example: 'Genera un reporte completo de tesorería de febrero',
        },
        {
          icon: '🔔',
          name: 'Crear Alerta',
          description:
            'Crea una alerta automatizada para cualquier métrica financiera',
          example: 'Avísame si la liquidez baja de $50K',
        },
        {
          icon: '🔄',
          name: 'Estado de Pay-in',
          description: 'Rastrea pagos entrantes paso a paso',
          example: '¿Llegó mi transferencia de Colombia?',
        },
        {
          icon: '📤',
          name: 'Estado de Pay-out',
          description: 'Rastrea pagos salientes paso a paso',
          example: '¿Dónde está el pago a mi proveedor?',
        },
      ],
    },
    security: {
      title: 'Tus Datos Son Sagrados',
      pillars: [
        {
          icon: '🔒',
          title: 'Aislamiento por Empresa',
          description:
            'Tus datos financieros están completamente separados de cualquier otra empresa. Zentinel solo puede acceder a TUS cuentas.',
        },
        {
          icon: '📝',
          title: 'Auditoría Completa',
          description:
            'Cada pregunta, cada respuesta, cada acción queda registrada. Transparencia total para cumplimiento.',
        },
        {
          icon: '🛡️',
          title: 'Sin Entrenamiento de Datos',
          description:
            'Tus conversaciones nunca se usan para entrenar modelos de IA. Retención de datos cero en el proveedor de IA.',
        },
        {
          icon: '⚡',
          title: 'Confirmación Requerida',
          description:
            'Zentinel siempre pide tu confirmación explícita antes de ejecutar cualquier acción financiera. Sin sorpresas.',
        },
      ],
    },
    roadmap: {
      title: 'Lo Que Viene',
      phases: [
        {
          phase: 'Fase 1',
          title: 'Datos en tiempo real',
          status: 'done',
          description:
            'Zentinel responde con datos reales de tus cuentas',
        },
        {
          phase: 'Fase 2',
          title: 'Acciones',
          status: 'building',
          description:
            'Ejecuta pagos, crea coberturas, gestiona vaults — por chat',
        },
        {
          phase: 'Fase 3',
          title: 'IA Predictiva',
          status: 'planned',
          description:
            'Detección de anomalías, alertas predictivas, análisis de documentos',
        },
        {
          phase: 'Fase 4',
          title: 'Multi-canal',
          status: 'planned',
          description:
            'Accede a Zentinel desde WhatsApp, Telegram y Slack',
        },
      ],
    },
    faq: {
      title: 'Preguntas Frecuentes',
      items: [
        {
          question: '¿Zentinel es realmente IA o solo respuestas pre-escritas?',
          answer:
            'IA real. Zentinel usa Claude (de Anthropic), uno de los modelos de lenguaje más avanzados. Razona sobre tus datos específicos, no plantillas genéricas.',
        },
        {
          question: '¿Zentinel puede equivocarse?',
          answer:
            'Zentinel siempre basa sus respuestas en datos reales de tus cuentas. Nunca inventa números. Para decisiones financieras, da recomendaciones — la decisión final siempre es tuya.',
        },
        {
          question: '¿Qué idiomas entiende?',
          answer:
            'Español, inglés y portugués. Detecta tu idioma automáticamente.',
        },
        {
          question: '¿Zentinel tiene acceso a mis contraseñas?',
          answer:
            'Nunca. Zentinel lee datos financieros (saldos, transacciones, facturas) pero tiene cero acceso a credenciales, tokens o contraseñas.',
        },
        {
          question: '¿Cuánto cuesta?',
          answer:
            'Zentinel está incluido en tu plan Soberana. Sin cargos adicionales por consulta.',
        },
      ],
    },
    cta: {
      title: '¿Listo para probar Zentinel?',
      buttonLabel: '← Volver a Docs',
      buttonHref: '/docs',
    },
  },
};

export function getSovyContent(language: Language): SovyContent {
  return sovyContent[language] || sovyContent.es;
}
