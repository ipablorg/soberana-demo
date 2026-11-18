import {
  AlertTriangle,
  Clock,
  Globe,
  Code2,
  Brain,
  TrendingUp,
  Store,
  Users,
  Layers,
  Zap,
  DollarSign,
  BarChart3,
  Network,
  Package,
  ArrowRight,
  Cpu,
  type LucideIcon,
} from "lucide-react";

export interface GtmPainPoint {
  icon: LucideIcon;
  headline: string;
  description: string;
}

export interface GtmMarketStat {
  value: string;
  label: string;
  source: string;
}

export interface GtmPillar {
  icon: LucideIcon;
  name: string;
  headline: string;
  description: string;
}

export interface CompetitorEntry {
  name: string;
  focus: string;
  strengths: string;
  weaknesses: string;
  highlight?: boolean;
}

export interface GtmApproach {
  icon: LucideIcon;
  title: string;
  headline: string;
  description: string;
}

export interface GtmPartner {
  name: string;
  category: string;
  description: string;
  icon: LucideIcon;
}

export interface PartnershipTier {
  tier: string;
  name: string;
  headline: string;
  description: string;
  benefits: string[];
}

export interface ZentinelFunction {
  function: string;
  impact: string;
  technology: string;
}

export interface GtmTractionMetric {
  value: string;
  label: string;
}

export interface GtmRevenueStream {
  icon: LucideIcon;
  name: string;
  description: string;
  mechanic: string;
}

export interface RoadmapPhase {
  phase: string;
  period: string;
  objective: string;
  actions: string[];
  milestone: string;
}

export interface RiskEntry {
  risk: string;
  mitigation: string;
}

export const gtmContent = {
  title: {
    eyebrow: "SOBERANA ELEMENTS",
    headline: "El estándar de liquidación\nglobal instantánea.",
    subtitle:
      "Marketplaces, plataformas gig y ecosistemas de e-commerce liquidan a sus vendedores en minutos — no en días.",
    tagline: "Marketplace Payouts as a Service",
    label: "GTM Strategy 2026–2027",
  },

  problem: {
    sectionLabel: "EL PROBLEMA",
    headline: "La fragmentación financiera asfixia a los marketplaces.",
    subheadline:
      "Los mejores vendedores abandonan las plataformas por culpa de la infraestructura, no del producto.",
    painPoints: [
      {
        icon: Clock,
        headline: "Fricción operativa endémica.",
        description:
          "KYC manual y recolección de documentos fiscales retrasan el onboarding de vendedores en semanas. Cada día sin liquidación es un vendedor perdido.",
      },
      {
        icon: DollarSign,
        headline: "Costos ocultos que devoran el margen.",
        description:
          "Transferencias SWIFT y FX consumen hasta el 7% del margen del vendedor en mercados andinos. Un costo invisible para el marketplace, devastador para el proveedor.",
      },
      {
        icon: AlertTriangle,
        headline: "La brecha de Stripe en la región andina.",
        description:
          "Los líderes del mercado no tienen infraestructura de payout completa en Colombia, Perú ni Ecuador. Las plataformas globales venden aquí, pero no pueden pagar aquí.",
      },
    ] satisfies GtmPainPoint[],
  },

  market: {
    sectionLabel: "OPORTUNIDAD DE MERCADO",
    headline: "Un mercado de $1.74 billones. Creciendo al 18.6% anual.",
    stats: [
      {
        value: "$1.74T",
        label: "Volumen global de e-commerce transfronterizo proyectado para 2026",
        source: "Coherent Market Insights",
      },
      {
        value: "$215B",
        label: "Mercado de e-commerce de América Latina en 2026",
        source: "Investing.com",
      },
      {
        value: "$455B",
        label: "Volumen de economía gig en América Latina (2025)",
        source: "Market Mind Partners",
      },
      {
        value: "78%",
        label: "Cuota de marketplaces en ventas online de América Latina",
        source: "nocnoc / 2026",
      },
    ] satisfies GtmMarketStat[],
    insight: {
      from: "52.4%",
      label: "Penetración de billeteras digitales en LatAm",
      note:
        "El 70% de los consumidores latinoamericanos rechazan plataformas sin métodos de pago locales. La localización del pago es la puerta de entrada — y los payouts, el diferenciador.",
      source: "J.P. Morgan Fintech 2026",
    },
    tamSamSom: {
      headline: "TAM · SAM · SOM",
      tam: { value: "$1.74T", label: "TAM — E-commerce transfronterizo global 2026" },
      sam: { value: "$215B", label: "SAM — E-commerce América Latina 2026" },
      som: { value: "Corredor andino", label: "SOM — CO · PE · EC + plataformas gig LatAm" },
    },
  },

  solution: {
    sectionLabel: "LA SOLUCIÓN",
    headline: "Liquidaciones globales en\nuna sola línea de código.",
    subheadline:
      "Elements convierte infraestructura compleja de payouts en un widget configurable que cualquier plataforma puede incrustar en minutos.",
    pillars: [
      {
        icon: Code2,
        name: "Widget Studio",
        headline: "Configura. Copia. Listo.",
        description:
          "Interfaz visual de bajo código: configura branding, rieles de pago y features. Genera un snippet listo para incrustar en cualquier plataforma, sin ingeniería propia.",
      },
      {
        icon: Zap,
        name: "Stablecoin Rails",
        headline: "Liquidación 24/7 sobre USDC.",
        description:
          "El movimiento de dinero ocurre sobre rieles de stablecoins (USDC/USDT). El vendedor recibe moneda local en su cuenta bancaria. La complejidad cripto queda totalmente abstraída.",
      },
      {
        icon: Brain,
        name: "Zentinel AI",
        headline: "Cumplimiento fiscal como código.",
        description:
          "IA que automatiza la extracción de tax forms, validación ante DIAN/SUNAT/SRI y generación de certificados de retención. Escala sin aumentar el equipo legal.",
      },
    ] satisfies GtmPillar[],
    cryptoInvisible:
      "\"Recibe tu dinero en 15 minutos en tu cuenta bancaria de siempre\" — las stablecoins son el riel invisible. El vendedor nunca ve una wallet address.",
  },

  competitors: {
    sectionLabel: "BENCHMARK COMPETITIVO",
    headline: "Superando los límites de los incumbentes.",
    subheadline:
      "El mercado está polarizado entre soluciones empresariales complejas y servicios para freelancers con altos márgenes. Soberana ocupa el espacio vacío.",
    entries: [
      {
        name: "Tipalti",
        focus: "Grandes corporaciones",
        strengths: "Automatización masiva AP, cumplimiento fiscal profundo",
        weaknesses: "Costo mensual $99+, implementación lenta, enfocado en ERPs",
        highlight: false,
      },
      {
        name: "Payoneer",
        focus: "Freelancers y SMBs",
        strengths: "Alcance en 200+ países, tarjetas de débito",
        weaknesses: "FX hasta 3.5%, costos por inactividad, KYC manual lento",
        highlight: false,
      },
      {
        name: "dLocal",
        focus: "Grandes comerciantes en emergentes",
        strengths: "Conocimiento profundo de rails locales LatAm/Asia",
        weaknesses: "Integraciones pesadas, barreras para marketplaces medianos",
        highlight: false,
      },
      {
        name: "Stripe Connect",
        focus: "SaaS y plataformas tech",
        strengths: "API superior, experiencia developer excelente",
        weaknesses: "Brechas en región andina (CO/PE/EC), 0.25% por transferencia cross-border",
        highlight: false,
      },
      {
        name: "Soberana Elements",
        focus: "Marketplaces next-gen",
        strengths: "Widgets plug-and-play, liquidación vía stablecoins, Zentinel AI fiscal",
        weaknesses: "Enfoque inicial en región andina, adopción de billeteras digitales en curso",
        highlight: true,
      },
    ] satisfies CompetitorEntry[],
    conclusion:
      "Soberana no compite en el modelo de adquirencia horizontal. Es una capa de infraestructura embebida que resuelve el 'Andean Gap' que Stripe y Adyen han dejado desatendido durante años.",
  },

  gtmStrategy: {
    sectionLabel: "ESTRATEGIA GTM",
    headline: "El Caballo de Troya:\nPlataforma sobre Plataforma.",
    subheadline:
      "En lugar de vender directo a miles de comercios, Soberana se convierte en el motor invisible que potencia a las plataformas de mayor escala.",
    approaches: [
      {
        icon: Store,
        title: "App Store Integration",
        headline: "Distribución sin CAC.",
        description:
          "Plugin oficial en VTEX App Store, Shopify Plus y BigCommerce. Acceso instantáneo a miles de marketplaces que ya enfrentan el problema de payouts globales — sin vendedores directos.",
      },
      {
        icon: Package,
        title: "Co-Branded Widget",
        headline: "Tu marca. Nuestra infraestructura.",
        description:
          "El marketplace usa Widget Studio para crear una experiencia de onboarding personalizada con su branding. Soberana opera los rails, el compliance y la liquidación en segundo plano.",
      },
      {
        icon: Network,
        title: "API-Only Enterprise",
        headline: "Control total. Complejidad cero.",
        description:
          "Para plataformas de escala masiva que mantienen su propia UI pero delegan la complejidad de stablecoin rails y cumplimiento fiscal a Soberana.",
      },
    ] satisfies GtmApproach[],
    keyInsight:
      "Cada marketplace integrado multiplica el volumen sin multiplicar el costo. El efecto de red: más plataformas → más liquidez → mejores rates → más plataformas.",
  },

  partners: {
    sectionLabel: "ALIANZAS ESTRATÉGICAS",
    headline: "Los ecosistemas que mueven\nel dinero de América Latina.",
    subheadline:
      "Diez plataformas de alto impacto identificadas como objetivos de partnership en Fase 1–3.",
    targets: [
      {
        name: "VTEX",
        category: "E-commerce OS",
        description: "Sistema operativo del comercio digital en LatAm. Piloto en curso. Acceso a miles de marketplaces en CO, PE, EC.",
        icon: Store,
      },
      {
        name: "Workana",
        category: "Freelance LatAm",
        description: "Marketplace líder de freelancing en América Latina. Liquidaciones en múltiples jurisdicciones con monedas inestables.",
        icon: Users,
      },
      {
        name: "Rappi",
        category: "Super App / Delivery",
        description: "Gigante del delivery con flota de repartidores y restaurantes asociados en toda la región andina que demandan pago inmediato.",
        icon: Zap,
      },
      {
        name: "Mercado Libre",
        category: "Marketplace",
        description: "Vendedores de Mercado Shops buscan flexibilidad para liquidar fondos transfronterizos fuera del ecosistema propietario.",
        icon: Globe,
      },
      {
        name: "Linio / Falabella",
        category: "Retail Marketplace",
        description: "Uno de los marketplaces más relevantes de Chile, Perú y Colombia. Necesita unificar su estrategia de payouts regionales.",
        icon: Package,
      },
      {
        name: "Upwork",
        category: "Freelance Global",
        description: "Plataforma global de conocimiento con millones de transacciones pequeñas donde fees bancarios tradicionales son prohibitivos.",
        icon: Brain,
      },
      {
        name: "Glovo",
        category: "Gig Economy",
        description: "Operando en múltiples mercados donde la tesorería unificada vía stablecoins daría ventajas operativas significativas.",
        icon: TrendingUp,
      },
      {
        name: "Dafiti",
        category: "Fashion Marketplace",
        description: "Gestiona proveedores internacionales de moda que requieren liquidaciones en divisas fuertes con alta frecuencia.",
        icon: Layers,
      },
      {
        name: "Shopify Plus",
        category: "E-commerce Platform",
        description: "Plugin certificado en App Store para expandir la red a merchants globales con operaciones en LatAm.",
        icon: Store,
      },
      {
        name: "Uber Eats",
        category: "Gig Economy",
        description: "Industria de márgenes delgados donde reducir costos de transacción en desembolsos a restaurantes es prioridad estratégica.",
        icon: DollarSign,
      },
    ] satisfies GtmPartner[],
  },

  partnershipTiers: {
    sectionLabel: "MODELO DE PARTNERSHIP",
    headline: "Tres niveles. Una sola infraestructura.",
    subheadline:
      "El modelo escalonado incentiva a las plataformas a adoptar Soberana como su capa de liquidación preferida — y a profundizar el compromiso con el tiempo.",
    tiers: [
      {
        tier: "TIER 1",
        name: "Preferred Partner",
        headline: "Integración Nativa.",
        description:
          "Soberana aparece como la opción predeterminada de payouts en el dashboard de administración de la plataforma. Máxima visibilidad, máxima tracción.",
        benefits: [
          "Revenue share por volumen transaccionado",
          "Dashboards de cumplimiento automatizado",
          "Soporte dedicado de integración",
          "Co-marketing y caso de éxito conjunto",
        ],
      },
      {
        tier: "TIER 2",
        name: "Co-Branded Widget",
        headline: "Tu marca, nuestra tecnología.",
        description:
          "El marketplace usa Widget Studio para crear una experiencia de onboarding personalizada con su identidad visual. Soberana opera la infraestructura en segundo plano.",
        benefits: [
          "White-label completo vía Widget Studio",
          "Revenue share estándar",
          "Acceso a rieles de stablecoins y Zentinel",
          "Onboarding técnico asistido",
        ],
      },
      {
        tier: "TIER 3",
        name: "API-Only Integration",
        headline: "Control total, sin complejidad.",
        description:
          "Para plataformas de escala masiva que mantienen control total sobre la UI pero delegan la complejidad de rails de stablecoins y cumplimiento fiscal a Soberana.",
        benefits: [
          "Acceso completo a API de Elements",
          "SDKs para React, Vue, Vanilla, Web Components",
          "Dokumentación técnica y sandbox dedicado",
          "SLA empresarial",
        ],
      },
    ] satisfies PartnershipTier[],
  },

  zentinel: {
    sectionLabel: "ZENTINEL AI",
    headline: "Cumplimiento fiscal automatizado a escala.",
    subheadline:
      "La pesadilla del cumplimiento fiscal en marketplaces resuelta con inteligencia artificial. Sin aumentar el equipo contable.",
    description:
      "En 2026, el G20 prioriza la transparencia fiscal en plataformas digitales. Zentinel convierte el cumplimiento en una ventaja competitiva, no en un cuello de botella.",
    functions: [
      {
        function: "Extracción de Tax Forms",
        impact: "Reducción del 90% en entrada manual de datos",
        technology: "Modelos IDP (Intelligent Document Processing) + GPT-4.1",
      },
      {
        function: "Validación ante Autoridades",
        impact: "Eliminación de pagos a cuentas inhabilitadas o fraudulentas",
        technology: "Conectores API: DIAN Colombia, SUNAT Perú, SRI Ecuador",
      },
      {
        function: "Generación de Facturas",
        impact: "Invoices automáticas en múltiples monedas, 70+ regulaciones",
        technology: "Motor de plantillas dinámicas + validación por jurisdicción",
      },
      {
        function: "Cálculo de Retenciones",
        impact: "Retenciones correctas desde el primer pago (EC 5%, CO 4%, MX 10%)",
        technology: "Motor fiscal parametrizable por país y régimen tributario",
      },
      {
        function: "Detección de Fraude Fiscal",
        impact: "Identificación de inconsistencias en TINs antes de pagar",
        technology: "Algoritmos ML para análisis de grafos de identidad fiscal",
      },
    ] satisfies ZentinelFunction[],
    differentiator:
      "Stripe Tax ofrece cumplimiento fiscal genérico. Zentinel se especializa en las minucias de retenciones locales y facturación legal en emergentes — algo que Stripe evita por el mantenimiento operativo intenso que requiere.",
  },

  traction: {
    sectionLabel: "TRACCIÓN",
    headline: "Validado por líderes del sector.",
    subheadline: "El product-market fit confirmado en el ecosistema más exigente de la región.",
    vtexPilot: {
      headline: "Piloto VTEX",
      description:
        "Integración exitosa en un ecosistema que mueve miles de millones de dólares anuales en América Latina.",
      results: [
        { value: "−60%", label: "Reducción en costos de liquidación vs. SWIFT" },
        { value: "×3", label: "Aceleración del onboarding de vendedores" },
        { value: "<15min", label: "Tiempo de liquidación promedio" },
      ] satisfies GtmTractionMetric[],
    },
    platformMetrics: [
      { value: "+45", label: "Países con capacidad de liquidación" },
      { value: "+1M", label: "Transacciones procesadas en la red Soberana" },
      { value: "$2B+", label: "Volumen movilizado en la plataforma" },
    ] satisfies GtmTractionMetric[],
    nextMilestone: "Procesar los primeros $10M en volumen de payout mensual a través de Elements",
  },

  businessModel: {
    sectionLabel: "MODELO DE NEGOCIO",
    headline: "Tres fuentes de ingreso. Compoundando.",
    streams: [
      {
        icon: BarChart3,
        name: "Revenue Share",
        description: "Comisión por cada dólar liquidado a través de la plataforma.",
        mechanic: "Una fracción de cada payout — escalable con el volumen de la plataforma partner.",
      },
      {
        icon: ArrowRight,
        name: "FX Spread",
        description: "Captura de valor en la conversión de stablecoins a moneda local.",
        mechanic: "Red de liquidez optimizada que reduce el FX al mínimo para el vendedor y captura el diferencial.",
      },
      {
        icon: Cpu,
        name: "Zentinel SaaS",
        description: "Tarifa por el uso de automatización avanzada de impuestos y facturación.",
        mechanic: "Modelo por tier según volumen de facturas generadas y jurisdicciones activas.",
      },
    ] satisfies GtmRevenueStream[],
    networkEffect:
      "Cada nueva plataforma multiplica el ingreso en los tres flujos simultáneamente. Más plataformas → más liquidez → mejores rates → más plataformas. El moat crece con el volumen.",
    unit: {
      headline: "Unit Economics.",
      note: "A medida que el volumen de liquidación escala, el costo marginal por transacción decrece, mientras el spread y las fees permanecen constantes. Margen compoundante.",
    },
  },

  roadmap: {
    sectionLabel: "ROADMAP",
    headline: "De payouts a sistema operativo\nfinanciero completo.",
    subheadline:
      "Tres fases diseñadas para construir el caso de éxito, escalar el ecosistema y convertir Soberana en el estándar de facto.",
    phases: [
      {
        phase: "FASE 1",
        period: "Meses 1–4",
        objective: "Consolidación y Optimización",
        actions: [
          "Lanzamiento oficial en VTEX App Store: soporte CO, PE, EC",
          "Integración Zentinel AI para retenciones locales específicas",
          "Campaña a los 100 principales marketplaces VTEX LatAm",
          "Apertura de dashboard de analítica para plataformas partner",
        ],
        milestone: "Primeros $10M en volumen de payout mensual",
      },
      {
        phase: "FASE 2",
        period: "Meses 5–8",
        objective: "Expansión de Ecosistemas",
        actions: [
          "Plugin certificado en Shopify Plus y BigCommerce App Store",
          "Estrategia de Partnership Tier para agencias de implementación",
          "Corredor de liquidación hacia Brasil con Pix como riel de salida",
          "Lanzamiento de programa de referidos para agencias VTEX",
        ],
        milestone: "500 marketplaces activos en la plataforma",
      },
      {
        phase: "FASE 3",
        period: "Meses 9–12",
        objective: "Verticalización y Gig Economy",
        actions: [
          "Contratos exclusivos con ≥2 plataformas gig del Top 10 (Rappi / Workana)",
          "Zentinel AI para nóminas y contratos flexibles en gig economy",
          "Earned Wage Access (EWA): pagos diarios a trabajadores embebidos en widget",
          "Exploración de servicios de crédito y tesorería basados en flujos de payout",
        ],
        milestone: "Riel de pago preferido para trabajadores digitales en región andina",
      },
    ] satisfies RoadmapPhase[],
  },

  risks: {
    sectionLabel: "ANÁLISIS DE RIESGOS",
    headline: "Construyendo el foso defensivo.",
    subheadline:
      "Los tres riesgos principales — y cómo Soberana los convierte en ventajas competitivas.",
    entries: [
      {
        risk: "Replicación por Stripe",
        mitigation:
          "Stripe evita el cumplimiento local intensivo por su complejidad operativa. Zentinel se especializa en las minucias fiscales de mercados emergentes — un mantenimiento que Stripe no quiere sostener. Cuanto más profundo en la vertical de 'Local Tax Intelligence', más difícil de replicar.",
      },
      {
        risk: "Riesgo regulatorio de stablecoins",
        mitigation:
          "Operamos bajo modelo de Bifurcación Estructural: solo stablecoins con licencias EMI (MiCA, FinCEN). Custodia institucional con proveedores regulados. A medida que MiCA establece el estándar global en 2026, estar ya en compliance es una barrera de entrada para nuevos competidores.",
      },
      {
        risk: "Resistencia a adopción cripto",
        mitigation:
          "Diseño UX: el vendedor nunca ve una wallet address ni interactúa con un exchange. La propuesta de valor es '15 minutos en tu cuenta bancaria de siempre'. Las stablecoins son el riel invisible. La capa cripto es completamente abstraída del usuario final.",
      },
    ] satisfies RiskEntry[],
  },

  closing: {
    sectionLabel: "EL PITCH",
    headline: "Invierte en los rieles,\nno en la app.",
    whyNow: [
      "E-commerce transfronterizo creciendo al 18.6% anual — la infraestructura no escala al mismo ritmo.",
      "Stripe y Adyen han dejado el 'Andean Gap' desatendido durante años. La ventana es ahora.",
      "Stablecoins alcanzaron $1T+ en volumen mensual — la adopción institucional es un hecho.",
      "Zentinel AI convierte el cumplimiento fiscal en ventaja competitiva, no en costo.",
    ],
    ask: {
      use: [
        "Acelerar despliegue de Zentinel AI y expansión de licencias operativas",
        "Integración en ecosistemas de Shopify Plus y BigCommerce",
        "Equipo de enterprise sales para cerrar los primeros 10 contratos Tier 1",
        "Certificaciones regulatorias en nuevos mercados (Brasil, Chile, México)",
      ],
    },
    contact: {
      email: "pablo@loopay.com",
    },
    tagline: "Desde América Latina. Para el Mundo.",
  },
};

export type GtmContent = typeof gtmContent;
export const TOTAL_GTM_SLIDES = 13;
