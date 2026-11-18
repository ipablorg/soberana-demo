import {
  Globe,
  Clock,
  Building2,
  TrendingUp,
  TrendingDown,
  Shield,
  Brain,
  CreditCard,
  ArrowLeftRight,
  BarChart3,
  Layers,
  Landmark,
  Server,
} from "lucide-react";

import type {
  PainPoint,
  MarketStat,
  ExitCase,
  AsiaStat,
  Pillar,
  ArchitectureLayer,
  VaultStep,
  YieldComparison,
  HedgeScenario,
  MarketRegime,
  EmergencyBreaker,
  ExpertAgent,
  ZentinelCapability,
  ZentinelComparison,
  ZentinelImpact,
  ComputationCycleStep,
  TrustPrinciple,
  ClientSegment,
  RevenueStream,
  TractionMetric,
  TeamMember,
  UseOfFunds,
  InflationCountry,
  ShieldComparison,
  ShieldMechanism,
  DevaluationProduct,
} from "./deck-content";

export const deckContentEs = {
  title: {
    headline: "El Dinero Que\nNo Puede Devaluarse.",
    subtitle:
      "Soberana es la infraestructura financiera que protege el capital corporativo de la inflación, la devaluación y el desorden monetario — en cualquier parte del mundo.",
    tagline: "Construido para cada mercado donde el dinero pierde su valor.",
  },

  problem: {
    sectionLabel: "EL PROBLEMA",
    headline: "Tres Brechas Billonarias.",
    painPoints: [
      {
        icon: TrendingDown,
        headline: "La inflación es un impuesto silencioso. En todas partes.",
        description:
          "En 2023, más del 60% de las economías emergentes experimentaron inflación de dos dígitos. Argentina: 211%. Turquía: 64%. Nigeria: 33%. Egipto: 35%. Cada semana de inacción cuesta dinero real.",
      },
      {
        icon: Clock,
        headline: "El capital dormido es un pasivo, no un activo.",
        description:
          "El efectivo corporativo en cuentas bancarias locales genera 0–1% anual mientras las monedas locales pierden 10–200% de poder adquisitivo. La brecha no es una coincidencia. Es un fallo de diseño.",
      },
      {
        icon: Shield,
        headline: "No existía infraestructura para la soberanía monetaria.",
        description:
          "Hasta ahora, solo las instituciones con acceso directo a los mercados monetarios globales podían proteger su capital de la devaluación. Las empresas del mercado medio no tenían equivalente — absorbían cada shock cambiario como un costo inevitable.",
      },
    ] satisfies PainPoint[],
  },

  market: {
    sectionLabel: "OPORTUNIDAD DE MERCADO",
    headline: "Un Mercado de $552B. Creciendo Rápido.",
    stats: [
      {
        value: "$552.72B",
        label: "Mercado global de pagos transfronterizos para 2033",
        source: "SNS Insider",
      },
      {
        value: "$3.99T",
        label: "Valor de transacciones de pagos digitales APAC, 2025",
        source: "Payment Asia",
      },
      {
        value: "$23.8T",
        label: "Pagos APAC proyectados para 2032",
        source: "FXC Intel / Money20/20",
      },
      {
        value: "$400B",
        label: "B2C transfronterizo en Asia-Pacífico, 2025",
        source: "Asian Banking & Finance",
      },
    ] satisfies MarketStat[],
    apacGrowth: {
      from: "32.2%",
      to: "36.8%",
      label: "Participación de APAC en flujos globales de pagos",
      period: "2024 → 2032",
      source: "FXC Intel",
    },
  },

  exits: {
    sectionLabel: "EXITS Y PANORAMA",
    headline: "El Mercado Se Está Consolidando.",
    subheadline: "Los jugadores de infraestructura obtienen exits premium.",
    cases: [
      {
        company: "Brex",
        acquirer: "Capital One",
        value: "$5.15B",
        year: "2026",
        description:
          "Tarjetas corporativas y gestión de gastos con IA. Valuación original de $12.3B.",
        initial: "B",
        acquirerLogo: "capital-one",
      },
      {
        company: "BVNK",
        acquirer: "Mastercard",
        value: "Hasta $1.8B",
        year: "2026",
        description:
          "Infraestructura de stablecoins conectando pagos on-chain con rieles fiat para cross-border.",
        initial: "BV",
        acquirerLogo: "mastercard",
      },
      {
        company: "Alpha Group",
        acquirer: "Corpay",
        value: "$2.4B",
        year: "2025",
        description: "Herramientas B2B de FX transfronterizo para empresas medianas.",
        initial: "AG",
        acquirerLogo: "corpay",
      },
      {
        company: "Rail",
        acquirer: "Ripple",
        value: "$200M",
        year: "2025",
        description:
          "Conectando stablecoins con fiat para pagos B2B transfronterizos.",
        initial: "R",
        acquirerLogo: "ripple",
      },
      {
        company: "Inswitch",
        acquirer: "TransNetwork",
        value: "No divulgado",
        year: "2024",
        description:
          "Finanzas embebidas + infraestructura de pagos transfronterizos en LATAM.",
        initial: "IN",
        acquirerLogo: "transnetwork",
      },
    ] satisfies ExitCase[],
  },

  asia: {
    sectionLabel: "OPORTUNIDAD EN ASIA",
    headline: "La Próxima Frontera.",
    subheadline:
      "Asia-Pacífico es la región de pagos de mayor crecimiento. La infraestructura no está lista.",
    stats: [
      { value: "93%", label: "esperan cambios significativos en infraestructura para 2035" },
      { value: "88%", label: "dicen que la interoperabilidad es crítica" },
      { value: "86%", label: "dicen que la regulación es el driver clave" },
      { value: "66%", label: "identifican los pagos en tiempo real como esenciales" },
    ] satisfies AsiaStat[],
    opportunities: [
      "CBDCs ganando tracción en el Sudeste Asiático",
      "Vínculos de pago multilaterales en expansión",
      "Integración blockchain como estándar institucional",
    ],
    positioning:
      "La infraestructura multi-rail de Loopay conecta rieles fiat y crypto — lista para integración con CBDCs desde el día uno.",
  },

  solution: {
    sectionLabel: "LA SOLUCIÓN",
    headline: "Una API. Cada Riel. Cada Frontera.",
    pillars: [
      {
        icon: Globe,
        name: "Cross-border Payments",
        headline: "Mueve dinero a 45+ países.",
        description:
          "SWIFT, rieles locales y blockchain — unificados bajo una sola API. Liquidación rápida, visibilidad total.",
      },
      {
        icon: TrendingUp,
        name: "Smart Treasury · Vaults",
        headline: "Fondos ociosos, siempre generando.",
        description:
          "Tesorería corporativa desplegada en rendimientos DeFi de grado institucional con hedging automatizado y monitoreo 24/7.",
      },
      {
        icon: Brain,
        name: "Zentinel",
        headline: "Tu CFO virtual.",
        description:
          "Inteligencia de tesorería con IA. Haz preguntas en lenguaje natural. Obtén respuestas basadas en datos reales.",
      },
    ] satisfies Pillar[],
  },

  architecture: {
    sectionLabel: "ARQUITECTURA DE PRODUCTO",
    headline: "Plataforma, No Producto.",
    subheadline: "Un sistema operativo financiero completo — modular, extensible, API-first.",
    layers: [
      {
        label: "Aplicaciones Cliente",
        items: ["Bancos", "Fintechs", "Wallets", "Empresas"],
      },
      {
        label: "Soberana API",
        items: ["REST API", "Webhooks", "SDKs", "Dashboard"],
      },
      {
        label: "Módulos Core",
        items: [
          "Pagos",
          "Tesorería",
          "Compliance",
          "Tarjetas",
          "On/Off Ramp",
        ],
      },
      {
        label: "Rieles de Pago",
        items: ["SWIFT", "ACH", "SEPA", "SEPA Instant", "PIX", "SPEI", "UPI", "Faster Payments", "FedNow", "RTP", "PromptPay", "PayNow", "DuitNow", "BI-FAST", "CHAPS", "TARGET2", "Blockchain"],
      },
    ] satisfies ArchitectureLayer[],
    workflowAsCode: {
      headline: "Workflow as Code",
      description: "Cada flujo de pago, verificación de compliance y comportamiento de producto se define como un workflow configurable. Los clientes salen a producción componiendo reglas — no escribiendo código. Nuevos rieles, nuevos países, nuevos productos: configuración, no ciclos de ingeniería.",
      features: [
        "Orquestación de pagos declarativa",
        "Motor de compliance basado en reglas",
        "Configuración de productos instantánea",
        "Onboarding de clientes sin código",
      ],
    },
  },

  vaultsOverview: {
    sectionLabel: "VAULTS",
    headline: "Tu Tesorería. Siempre Generando.",
    analogy: "Piénselo como una casa de cambio digital que opera 24/7, cobrando una comisión por cada operación — con un seguro incorporado que la protege si el mercado se mueve en su contra.",
    steps: [
      {
        step: 1,
        title: "Depositar",
        description: "Los fondos corporativos ociosos entran a un Vault. El capital se concentra en un rango de precio específico donde el volumen de trading es mayor — como posicionar una casa de cambio en la terminal más transitada del aeropuerto.",
      },
      {
        step: 2,
        title: "Ganar y Proteger",
        description: "Cada operación que pasa por el pool genera comisiones automáticamente. Simultáneamente, un motor de cobertura abre posiciones en derivados que compensan el riesgo direccional. Lo que el pool pierde por movimiento de precio, la cobertura lo recupera.",
      },
      {
        step: 3,
        title: "Componer",
        description: "Las comisiones se reinvierten automáticamente cada 12 horas — generando interés compuesto sobre interés. Retira cuando quieras. Preservar el capital es la primera prioridad, el rendimiento es la segunda.",
      },
    ] satisfies VaultStep[],
    yieldComparison: [
      { instrument: "Cuenta de Ahorro", yield: "0.5 – 2%", risk: "Mínimo" },
      { instrument: "Bonos del Tesoro", yield: "4 – 5%", risk: "Bajo" },
      { instrument: "Soberana Vaults (conservador)", yield: "5 – 8%", risk: "Medio-bajo", highlight: true },
      { instrument: "S&P 500 (histórico)", yield: "8 – 10%", risk: "Alto" },
      { instrument: "Crypto sin cobertura", yield: "-50% a +200%", risk: "Muy alto" },
    ] satisfies YieldComparison[],
    philosophy: "Diseñado con filosofía bancaria conservadora: primero preservar el capital, luego generar rendimiento.",
  },

  vaultsDeepDive: {
    sectionLabel: "VAULTS — EN PROFUNDIDAD",
    headline: "El Motor Bajo el Capó.",
    performanceBadges: [
      "+57.83% backtest (6mo)",
      "~117% APR",
      "Solana · Orca CLMM",
      "Hyperliquid hedging",
      "38+ tests",
      "Análisis cada 5 min",
    ],
    hedgeMechanism: {
      headline: "El Escudo: Cómo Funciona la Cobertura",
      description: "Cuando el precio se mueve, el pool pierde por un lado. La cobertura lo recupera por el otro. Resultado neto: capital preservado, comisiones en el bolsillo.",
      scenarios: [
        {
          direction: "Precio baja",
          poolEffect: "El pool acumula más del activo que se deprecia",
          hedgeAction: "El bot abre un SHORT (apuesta contra el precio)",
          poolLoss: "~$180",
          hedgeGain: "~$170",
          feesEarned: "+$15",
          netResult: "+$5 ganancia neta",
        },
        {
          direction: "Precio sube",
          poolEffect: "El pool vende el activo que se aprecia demasiado pronto",
          hedgeAction: "El bot abre un LONG (apuesta a favor del precio)",
          poolLoss: "~$160",
          hedgeGain: "~$150",
          feesEarned: "+$15",
          netResult: "+$5 ganancia neta",
        },
      ] satisfies HedgeScenario[],
    },
    decisionEngine: {
      headline: "El Cerebro: Ciclo de Decisión cada 30 Segundos",
      description: "Como un piloto automático en un avión comercial. Cada 30 segundos, el bot lee el mercado, evalúa riesgo y decide si actuar o esperar.",
      steps: ["Leer precio", "Evaluar riesgo", "Verificar zona muerta", "Activar protección", "Reportar estado"],
      regimes: [
        { regime: "Lateral", behavior: "Relaja umbrales, cobra comisiones tranquilamente" },
        { regime: "Alcista", behavior: "Ajusta protección al alza" },
        { regime: "Bajista", behavior: "Endurece protección, actúa más rápido" },
        { regime: "Alta volatilidad", behavior: "Máxima cautela, coberturas más amplias" },
      ] satisfies MarketRegime[],
      steinInsight: "Usa la señal de Stein para distinguir tendencias reales del ruido. Reduce intervenciones innecesarias hasta un 67%.",
    },
    emergencyBreakers: {
      headline: "Fusibles de Emergencia",
      description: "Como los disyuntores de un sistema eléctrico. Tres fusibles independientes protegen el capital:",
      breakers: [
        { name: "Kill Switch", threshold: "10% pérdida acumulada", action: "Apagado total del sistema. Sin más operaciones.", color: "destructive" },
        { name: "Max Drawdown", threshold: "15% desde máximo", action: "Todas las coberturas abiertas se cierran inmediatamente.", color: "warning" },
        { name: "Piso de Capital", threshold: "Reserva mínima de capital", action: "Como el encaje bancario — nunca se arriesga más allá de este mínimo.", color: "secondary" },
      ] satisfies EmergencyBreaker[],
      additionalProtections: [
        "Enfriamiento de 5 min tras pérdida",
        "Detección de anomalías (picos >10% ignorados)",
        "Apalancamiento máx: 2x",
        "Ratio de hedge: 50%–120%",
      ],
    },
    expertAgents: [
      {
        name: "Experto LVR y Gamma",
        codename: "Chitra/Lipton",
        avatar: "\u0393",
        domain: "Loss-Versus-Rebalancing",
        description: "Monitorea la viabilidad central de la posición de liquidez. Calcula la exposición gamma y el ratio de comisiones vs. LVR para asegurar que el pool gana más de lo que pierde por selección adversa.",
      },
      {
        name: "Experto en Hedging Estocástico",
        codename: "Lipton/Sepp",
        avatar: "\u0394",
        domain: "Delta Hedging",
        description: "Asegura que la cobertura de hedge se mantenga dentro de la banda analítica de delta 80\u2013120%. Rastrea el desajuste entre el hedge del bot y la posición teóricamente óptima.",
      },
      {
        name: "Experto DRL y Control de Impulso",
        codename: "Anchuri/Möykkynen",
        avatar: "\u03A9",
        domain: "Ornstein-Uhlenbeck y Reversión a la Media",
        description: "Aplica 'pereza inteligente' — determina cuándo NO operar. Regresiona dinámicas de precio para detectar reversión a la media y prevenir hedges costosos de corta duración.",
      },
      {
        name: "Experto en Rebalanceo Asimétrico",
        codename: "Neutra/Goblin",
        avatar: "\u03A3",
        domain: "Optimización de Rango",
        description: "Calcula los límites LP asimétricos óptimos basados en momentum y volatilidad. Asegura que el rango de liquidez concentrada capture la máxima densidad de comisiones.",
      },
      {
        name: "Auditor de Matriz de Riesgo",
        codename: "5 Vectors",
        avatar: "\u03A8",
        domain: "Riesgo de Microestructura",
        description: "Escanea cinco vectores de riesgo simultáneamente: riesgo oracle/precio, asimetría de funding, exposición MEV, whipsaw Browniano y umbrales de cascada/drawdown.",
      },
      {
        name: "Maximizador de Capital",
        codename: "Master Orchestrator",
        avatar: "\u03A6",
        domain: "PnL a Nivel Portafolio",
        description: "La vista maestra. Rastrea equity, ROI, APR, ratio de Sharpe y PnL neto en todo el stack. Propone optimizaciones de parámetros para máxima eficiencia de capital.",
      },
    ] satisfies ExpertAgent[],
    formula: "\u222Bfees \u2212 \u222BLVR \u2212 \u222Bhedge_costs > 0",
  },

  zentinelOverview: {
    sectionLabel: "ZENTINEL",
    headline: "Tu CFO Virtual. Potenciado por IA.",
    description:
      "Imagina un analista financiero senior disponible 24/7 — uno que conoce cada transacción, cada saldo, cada tendencia de tu tesorería.",
    coreDistinction: {
      headline: "No es un chatbot. Es un analista financiero.",
      comparison: [
        { dimension: "Fuente de datos", chatbot: "Texto genérico de internet", zentinel: "TUS datos reales de tesorería, consultados en vivo" },
        { dimension: "Cálculo", chatbot: "Ninguno — repite respuestas fijas", zentinel: "Cálculos financieros precisos sobre datos actuales" },
        { dimension: "Razonamiento", chatbot: "Guión fijo: si A, responde B", zentinel: "Analiza la pregunta, decide qué datos necesita, los obtiene, construye la respuesta" },
        { dimension: "Adaptabilidad", chatbot: "Misma respuesta siempre", zentinel: "Cada respuesta es única, basada en los datos del momento" },
      ] satisfies ZentinelComparison[],
    },
    impactTable: [
      { task: "Consulta de liquidez consolidada", before: "15–30 min (3-4 sistemas, hoja de cálculo)", after: "5 segundos" },
      { task: "Proyección de flujo de caja (90 días)", before: "2–4 horas", after: "8 segundos" },
      { task: "Evaluación de exposición FX", before: "1–2 horas", after: "6 segundos" },
      { task: "Generación de reporte para comité", before: "Medio día a día completo", after: "10–15 segundos" },
      { task: "Conciliación de archivos", before: "4–8 horas (línea por línea)", after: "Segundos" },
    ] satisfies ZentinelImpact[],
    capabilities: [
      "Resumen de liquidez",
      "Proyecciones de flujo de caja",
      "Análisis de exposición FX",
      "Seguimiento de pagos",
      "Rendimiento de Vaults",
      "Alertas de tesorería (5 tipos, tiempo real)",
      "Generación de reportes formales",
      "Tendencias de transacciones",
      "Comparación de períodos",
      "Consulta y conciliación CSV",
      "Consultas en lenguaje natural",
    ] satisfies ZentinelCapability[],
  },

  zentinelDeepDive: {
    sectionLabel: "ZENTINEL — EN PROFUNDIDAD",
    headline: "Inteligencia, No Alucinación.",
    subheadline:
      "Cada cifra financiera proviene de una consulta verificada a la base de datos — nunca fabricada.",
    techStackLine: "NestJS 11 · LangChain/LangGraph · Claude · PostgreSQL Multi-tenant · JWT + RBAC · SSE Streaming · Auditoría Completa",
    computationCycle: {
      headline: "El Ciclo de Computación",
      description: "Lo que ocurre en 5 segundos cuando un CFO hace una pregunta:",
      steps: [
        { label: "Autenticar", time: "~200ms", description: "Verificar identidad del banco, cargar historial de conversación" },
        { label: "Razonar", time: "~500ms", description: "La IA lee la pregunta: ¿qué datos necesito? ¿Qué herramientas debo usar?" },
        { label: "Consultar", time: "~100ms", description: "Herramienta especializada consulta los registros financieros reales del banco" },
        { label: "Computar", time: "~50ms", description: "Agregaciones, conversiones FX, proyecciones — calculadas, no estimadas" },
        { label: "Construir", time: "~3s", description: "Construir respuesta usando EXCLUSIVAMENTE los datos recién obtenidos" },
        { label: "Auditar", time: "~100ms", description: "Guardar traza completa: herramienta usada, parámetros, resultado. Inmutable." },
      ] satisfies ComputationCycleStep[],
      totalTime: "~5 segundos en total",
    },
    trustPrinciples: {
      headline: "Cinco Razones para Confiar en las Respuestas",
      principles: [
        { name: "Solo Datos Reales", description: "Cada número viene de TUS registros, consultados en vivo. Nunca fabricado." },
        { name: "Metodología Transparente", description: "Siempre declara: ventana de datos, metodología, supuestos, fuentes. Sin cajas negras." },
        { name: "Trazabilidad Completa", description: "Cada interacción registrada inmutablemente: quién preguntó, herramientas usadas, parámetros, resultado, timestamp." },
        { name: "Confirmación Humana", description: "Nunca ejecuta una acción sensible sin aprobación explícita del usuario." },
        { name: "Limitaciones Honestas", description: "Si una pregunta está fuera de sus capacidades, lo dice claramente. Sin adivinanzas." },
      ] satisfies TrustPrinciple[],
    },
    liveExample: {
      query: "Dame un resumen de nuestra posición de liquidez actual",
      response: "Liquidez consolidada total: $429,188.51 USD. Mayor concentración en USD (57.3%), seguido de EUR (22.0%) y MXN (20.7%).",
      responseTime: "5 segundos",
    },
  },

  clients: {
    sectionLabel: "CLIENTES",
    headline: "Quién Adopta Soberana.",
    subheadline: "De integración a producción en semanas, no meses.",
    segments: [
      {
        icon: Landmark,
        name: "Bancos",
        headline: "Modernizar sin reconstruir.",
        description:
          "Actualiza infraestructura cross-border de 18 meses de desarrollo a semanas. Conecta y sal a producción.",
      },
      {
        icon: Layers,
        name: "Fintechs",
        headline: "Enfócate en tu producto, no en la plomería.",
        description:
          "Pagos multi-rail y tesorería vía API. Lanza más rápido. Escala globalmente.",
      },
      {
        icon: CreditCard,
        name: "Wallets",
        headline: "Utilidad financiera real.",
        description:
          "Agrega rampas fiat on/off y productos de rendimiento. Diferénciate donde importa.",
      },
      {
        icon: Building2,
        name: "Empresas",
        headline: "Deja de perder oportunidades.",
        description:
          "Automatiza tesorería, genera rendimiento sobre fondos ociosos y mueve dinero globalmente — todo desde un dashboard.",
      },
    ] satisfies ClientSegment[],
    regions: ["Latinoamérica", "Norteamérica", "Europa", "Asia"],
  },

  businessModel: {
    sectionLabel: "MODELO DE NEGOCIO",
    headline: "Tres Fuentes de Ingreso. Compuestas.",
    streams: [
      {
        icon: ArrowLeftRight,
        name: "Comisiones por Transacción",
        description:
          "Comisión por pago en cada transacción transfronteriza procesada a través de nuestros rieles.",
      },
      {
        icon: Server,
        name: "Licencias de Plataforma",
        description:
          "Licenciamiento mensual y anual por acceso a la API e infraestructura de Soberana.",
      },
      {
        icon: BarChart3,
        name: "Comisiones de Vaults",
        description:
          "Comisiones basadas en rendimiento sobre el yield generado en los vaults de tesorería.",
      },
    ] satisfies RevenueStream[],
    networkEffect:
      "Cada nuevo cliente multiplica ingresos en las tres fuentes. Más clientes → más liquidez → mejores tasas → más clientes.",
    tenXPath: {
      headline: "El Camino a 10x.",
      description: "Cada línea de producto potencia las demás. Stripe creció sus ingresos no-pagos al 35% del total al integrar Treasury, Capital e Issuing sobre pagos. Soberana sigue el mismo playbook.",
      multipliers: [
        { lever: "Volumen cross-border", multiplier: "3x", description: "Expandir de 45 a 100+ países. Sumar Asia-Pacífico, África." },
        { lever: "AUM en Vaults", multiplier: "5x", description: "Escalar vaults institucionales. Cada $1M en TVL genera comisiones de gestión recurrentes." },
        { lever: "Licencias de plataforma", multiplier: "4x", description: "Bancos y fintechs pagan por usuario + por transacción. Los ingresos se componen con el crecimiento del cliente." },
        { lever: "Productos embebidos", multiplier: "8x", description: "Tarjetas, FX, On/Off Ramp, Compliance — cada producto genera cross-sell a clientes existentes con costo de adquisición casi cero." },
      ],
    },
  },

  traction: {
    sectionLabel: "TRACCIÓN",
    headline: "Momentum.",
    metrics: [
      { value: "+45", label: "Países", placeholder: false },
      { value: "+1M", label: "Transacciones", placeholder: false },
      { value: "2B USD", label: "Movilizados", placeholder: false },
    ] satisfies TractionMetric[],
    placeholderNote: "",
  },

  team: {
    sectionLabel: "EQUIPO",
    headline: "Operadores. Constructores. Desde las Trincheras.",
    description:
      "Liderado por operadores y constructores de bancos, fintechs y empresas de tecnología líderes.",
    members: [
      {
        name: "[Nombre]",
        role: "CEO & Co-Fundador",
        bio: "[Bio — experiencia, trayectoria relevante]",
        placeholder: true,
      },
      {
        name: "[Nombre]",
        role: "CTO & Co-Fundador",
        bio: "[Bio — experiencia, trayectoria relevante]",
        placeholder: true,
      },
      {
        name: "[Nombre]",
        role: "Head de Producto",
        bio: "[Bio — experiencia, trayectoria relevante]",
        placeholder: true,
      },
      {
        name: "[Nombre]",
        role: "Head de Crecimiento",
        bio: "[Bio — experiencia, trayectoria relevante]",
        placeholder: true,
      },
    ] satisfies TeamMember[],
    placeholderNote: "[FOTOS Y BIOS DEL EQUIPO POR AGREGAR]",
  },

  useOfFunds: {
    sectionLabel: "USO DE FONDOS",
    headline: "$10M. 24 Meses. Escala Global.",
    totalRaise: "$10,000,000",
    allocations: [
      {
        category: "Tecnología y Producto",
        percentage: 40,
        amount: "$4.0M",
        items: ["Consolidación plataforma Soberana", "Escalamiento motor de Vaults", "Expansión IA de Zentinel", "Nuevas integraciones de rieles de pago"],
      },
      {
        category: "Expansión Asia-Pacífico",
        percentage: 25,
        amount: "$2.5M",
        items: ["Licencias regulatorias (Singapur, Hong Kong)", "Partnerships locales y relaciones bancarias", "Contratación equipo regional"],
      },
      {
        category: "Crecimiento y Ventas",
        percentage: 20,
        amount: "$2.0M",
        items: ["Equipo de ventas enterprise", "Partnerships estratégicos con bancos", "Posicionamiento de marca en mercados clave", "Comunidad de desarrolladores y documentación"],
      },
      {
        category: "Operaciones y Compliance",
        percentage: 15,
        amount: "$1.5M",
        items: ["Compliance multi-jurisdicción", "Auditorías de seguridad y certificaciones", "Estructura legal y corporativa"],
      },
    ],
    milestones: [
      "Q1-Q2: Consolidar Soberana + Vaults + Zentinel en plataforma unificada",
      "Q3-Q4: Lanzamiento en 2 mercados asiáticos (Singapur, Filipinas)",
      "Y2 Q1-Q2: 10 clientes enterprise, objetivo $500M+ TVL en vaults",
      "Y2 Q3-Q4: Camino a rentabilidad, preparar Serie B",
    ],
  } satisfies UseOfFunds,

  ask: {
    sectionLabel: "LA PROPUESTA",
    headline: "Invierte en los Rieles,\nNo en la App.",
    whyNow: [
      {
        icon: TrendingUp,
        text: "Consolidación del mercado generando exits de $1.8B–$5.15B solo en 2025–2026.",
      },
      {
        icon: Globe,
        text: "Pagos en Asia-Pacífico creciendo de $12.8T a $23.8T para 2032.",
      },
      {
        icon: Shield,
        text: "Rendimientos DeFi alcanzando grado institucional, uniendo TradFi y crypto.",
      },
    ],
    unlocks: [
      "Expansión geográfica — foco en Asia-Pacífico",
      "Profundización de producto — más estrategias de vaults, más rieles",
      "Crecimiento del equipo — ingeniería, compliance, ventas",
    ],
    financialPlaceholder: "[CONFIDENCIAL — POR COMPLETAR]",
  },

  inflationData: {
    sectionLabel: "EL IMPUESTO INVISIBLE",
    headline: "Todas las Monedas Pierden.\nAlgunas Más Rápido que Otras.",
    subheadline:
      "La inflación no es un problema latinoamericano. Es una condición global que destruye el capital corporativo mientras los tesoreros duermen.",
    stat: {
      value: "60%+",
      label: "de las economías emergentes tuvieron inflación de dos dígitos en 2022–2023",
      source: "FMI World Economic Outlook",
    },
    countries: [
      { country: "Argentina", flag: "🇦🇷", currency: "ARS", loss: "211%",  year: "2023" },
      { country: "Venezuela", flag: "🇻🇪", currency: "VES", loss: "400%+", year: "2023" },
      { country: "Turquía",   flag: "🇹🇷", currency: "TRY", loss: "85%",   year: "2022" },
      { country: "Líbano",    flag: "🇱🇧", currency: "LBP", loss: "200%+", year: "2023" },
      { country: "Sri Lanka", flag: "🇱🇰", currency: "LKR", loss: "70%",   year: "2022" },
      { country: "Ghana",     flag: "🇬🇭", currency: "GHS", loss: "54%",   year: "2022" },
      { country: "Egipto",    flag: "🇪🇬", currency: "EGP", loss: "35%",   year: "2023" },
      { country: "Pakistán",  flag: "🇵🇰", currency: "PKR", loss: "38%",   year: "2023" },
      { country: "Nigeria",   flag: "🇳🇬", currency: "NGN", loss: "33%",   year: "2024" },
      { country: "Colombia",  flag: "🇨🇴", currency: "COP", loss: "13%",   year: "2023" },
      { country: "Zona Euro", flag: "🇪🇺", currency: "EUR", loss: "10.6%", year: "2022" },
      { country: "EE.UU.",    flag: "🇺🇸", currency: "USD", loss: "9.1%",  year: "2022" },
    ] satisfies InflationCountry[],
    punchline: "Incluso el dólar perdió el 20% de su poder adquisitivo entre 2020 y 2024.",
  },

  monetarySovereignty: {
    sectionLabel: "EL ESCUDO SOBERANA",
    headline: "Algo Más Fuerte\nQue el Dólar.",
    subheadline:
      "Por primera vez, cualquier empresa — en cualquier lugar — puede mantener capital que se aprecia en lugar de depreciarse.",
    comparison: [
      { label: "Peso argentino (2023)",  loss: "-211%", color: "destructive" },
      { label: "Lira turca (2023)",      loss: "-64%",  color: "destructive" },
      { label: "Naira nigeriana (2024)", loss: "-33%",  color: "destructive" },
      { label: "Libra egipcia (2023)",   loss: "-35%",  color: "destructive" },
      { label: "Dólar USD (pico 2022)",  loss: "-9.1%", color: "warning"     },
      { label: "Soberana Vaults (USDC)", loss: "+5–8%", color: "success"     },
    ] satisfies ShieldComparison[],
    mechanism: [
      {
        step: "1",
        title: "Convertir a USDC",
        description:
          "El capital se mueve instantáneamente de cualquier moneda local a USDC — anclado al dólar, liquidado on-chain.",
      },
      {
        step: "2",
        title: "Desplegar a Vaults",
        description:
          "El USDC inactivo genera 5–8% de rendimiento anual mediante estrategias DeFi institucionales con cobertura automatizada.",
      },
      {
        step: "3",
        title: "El Escudo se activa",
        description:
          "Mientras las monedas locales pierden valor, tu capital se aprecia. El impuesto de devaluación se vuelve opcional.",
      },
    ] satisfies ShieldMechanism[],
    punchline: "El capital en Soberana no se devalúa. Se aprecia.",
    punchlineES: "El capital en Soberana no se devalúa. Se aprecia.",
  },

  devaluationProducts: {
    sectionLabel: "LA RESPUESTA SOBERANA",
    headline: "Cuatro Productos.\nUna Misión.",
    subheadline:
      "Cada producto de Soberana fue construido para responder la misma pregunta: ¿cómo protege una empresa su capital cuando su gobierno no puede?",
    products: [
      {
        id: "wallet",
        name: "USDC Wallet",
        tagline: "Tu capital, inmune a la devaluación local.",
        description:
          "Convierte cualquier moneda local a USDC en segundos. Tu saldo vive en rails de blockchain — no en un banco que puede congelar, restringir o devaluar tu dinero de un decreto al siguiente.",
        stat: { value: "< 3 seg", label: "conversión a USDC" },
        screenshotAlt: "Dashboard USDC Wallet de Soberana",
      },
      {
        id: "multicurrency",
        name: "Escudo Multi-Moneda",
        tagline: "13 monedas. Una cuenta. Cero riesgo de concentración.",
        description:
          "Mantén, recibe y convierte entre MXN, BRL, EUR, COP, USD y 8 más — cada una convertible automáticamente a USDC. Una devaluación no puede llevarse todo.",
        stat: { value: "13+", label: "monedas y rieles" },
        screenshotAlt: "Selector multi-moneda de Soberana",
      },
      {
        id: "zentinel",
        name: "Zentinel",
        tagline: "El CFO que monitorea 50 monedas mientras duermes.",
        description:
          "Zentinel rastrea exposición FX, posiciones en Vaults y riesgo de devaluación en tiempo real — 24/7, en todas las monedas que mantienes. Propone. Tú decides. Nada se mueve sin tu aprobación.",
        stat: { value: "24/7", label: "vigilancia FX en tiempo real" },
        screenshotAlt: "Agente de tesorería IA Zentinel",
      },
      {
        id: "workflow",
        name: "Workflow Composer",
        tagline: "Automatiza la defensa de tu capital. Sin ingenieros.",
        description:
          "Define reglas una vez: si el MXN cae 5%, convierte a USDC. Si el saldo USDC supera $100K, despliega a Vaults. Si el drawdown del Vault llega al 8%, cierra posición. El workflow ejecuta. Tú duermes.",
        stat: { value: "0", label: "intervenciones manuales requeridas" },
        screenshotAlt: "Pipeline visual del Workflow Composer",
      },
    ] satisfies DevaluationProduct[],
    closing:
      "Esta no es una plataforma de pagos que por accidente protege valor. Es una plataforma de protección de capital que por accidente mueve dinero.",
  },

  closing: {
    tagline: "Desde Latinoamérica. Para el Mundo.",
    contacts: [
      { name: "Diego Muñoz", role: "CEO", email: "dm@loopay.com" },
      { name: "Carlos Ortegon", role: "CTO", email: "co@loopay.com" },
    ],
    website: "loopay.com",
  },
};
