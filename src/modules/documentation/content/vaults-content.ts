import type { Language } from './sidebar-content';

export interface VaultPillar {
  title: string;
  description: string;
  icon: 'automation' | 'neutral' | 'safeguard';
}

export interface VaultStep {
  title: string;
  description: string;
  detail?: string;
  icon: 'wallet' | 'certificate' | 'rocket' | 'chart' | 'redeem';
}

export interface VaultStrategy {
  title: string;
  hook: string;
  description: string;
  detail: string;
}

export interface VaultFee {
  name: string;
  rate: string;
  appliedTo: string;
}

export interface VaultFeeExample {
  investment: string;
  duration: string;
  grossReturn: string;
  grossAmount: string;
  managementFee: string;
  managementCalc: string;
  performanceFee: string;
  performanceCalc: string;
  netReturn: string;
  netYield: string;
}

export interface VaultRisk {
  risk: string;
  riskDescription: string;
  safeguard: string;
  safeguardDescription: string;
}

export interface VaultJourneyStep {
  label: string;
  title: string;
  items: string[];
}

export interface VaultFAQItem {
  question: string;
  answer: string;
}

export interface VaultGlossaryTerm {
  term: string;
  definition: string;
}

export interface VaultsContent {
  hero: {
    title: string;
    subtitle: string;
    description: string;
  };
  architecture: {
    title: string;
    subtitle: string;
    intro: string;
    pillars: VaultPillar[];
    callout: string;
  };
  howItWorks: {
    title: string;
    subtitle: string;
    intro: string;
    invest: VaultStep;
    track: VaultStep;
    redeem: VaultStep;
  };
  strategy: {
    title: string;
    subtitle: string;
    intro: string;
    cashCarry: VaultStrategy;
    lp: VaultStrategy;
    hedging: VaultStrategy;
  };
  fees: {
    title: string;
    subtitle: string;
    intro: string;
    table: VaultFee[];
    example: VaultFeeExample;
    alignment: string;
  };
  risks: {
    title: string;
    subtitle: string;
    intro: string;
    items: VaultRisk[];
  };
  journey: {
    title: string;
    subtitle: string;
    intro: string;
    steps: VaultJourneyStep[];
  };
  faq: {
    title: string;
    items: VaultFAQItem[];
  };
  glossary: {
    title: string;
    terms: VaultGlossaryTerm[];
  };
  cta: {
    title: string;
    subtitle: string;
    buttons: {
      explore: string;
      kyc: string;
      manifesto: string;
    };
  };
}

export const vaultsContent: Record<Language, VaultsContent> = {
  en: {
    hero: {
      title: 'Loopay Vaults',
      subtitle: 'Autonomous yield, institutional precision.',
      description:
        'Idle capital is a design flaw. Loopay Vaults are autonomous investment vehicles that deploy your USDC into market-neutral strategies — generating yield from structural market inefficiencies, not speculation. You deposit dollars. The algorithm does the rest.',
    },

    architecture: {
      title: 'The Vault Architecture',
      subtitle: 'Autonomous yield, institutional precision.',
      intro:
        'A Vault is an automated investment vehicle. Think of it as a mutual fund where the portfolio manager is an algorithm that operates 24/7 with institutional-grade risk management. You deposit USDC, receive shares that represent your ownership, and the Strategy Engine deploys your capital across yield-generating protocols.',
      pillars: [
        {
          title: 'Automated Deployment',
          description:
            'Capital flows into yield strategies without manual intervention. The engine evaluates market conditions every minute and deploys capital when profitable opportunities are detected.',
          icon: 'automation',
        },
        {
          title: 'Market-Neutral Returns',
          description:
            'Strategies profit from structural inefficiencies in derivatives markets, not from price direction. Whether markets rise or fall, the engine captures yield from funding rate differentials.',
          icon: 'neutral',
        },
        {
          title: 'Institutional Safeguards',
          description:
            'Every algorithm decision is independently validated before execution. Maximum deployment limits, automatic reversals on failure, and multi-layer concurrency protection.',
          icon: 'safeguard',
        },
      ],
      callout: 'Vaults accept USDC deposits. Minimum investment: $10.',
    },

    howItWorks: {
      title: 'How It Works',
      subtitle: 'Three steps. Full transparency.',
      intro:
        'The investor lifecycle is simple by design. Deposit, track, redeem — each step is atomic and reversible when needed.',
      invest: {
        title: 'Invest',
        description:
          'Deposit USDC into any active Vault. You receive shares — fractional ownership units that represent your portion of the Vault\'s total value. Settlement takes minutes. Your capital starts earning from the next strategy cycle.',
        detail:
          'Creation: < 2 seconds. Settlement: 1–30 minutes. Minimum: $10 USD. If the transfer fails, your shares are automatically reversed. You never lose funds in transit.',
        icon: 'wallet',
      },
      track: {
        title: 'Track Returns',
        description:
          'Your returns are reflected in the share price. When the Vault\'s strategies generate yield, the share price increases. The math is simple: if you bought shares at $10.00 and the price is now $10.50, your investment has grown 5%.',
        detail:
          'Your portfolio shows: current value, cost basis, and unrealized P&L — updated in real time as the Vault\'s NAV (Net Asset Value) is recalculated.',
        icon: 'chart',
      },
      redeem: {
        title: 'Redeem',
        description:
          'Request a redemption at any time. Choose to redeem a specific number of shares or a dollar amount. Your USDC is transferred directly to your wallet.',
        detail:
          'If the Vault doesn\'t have sufficient liquid reserves, your shares are restored automatically — you can try again when liquidity is available. You never lose funds.',
        icon: 'redeem',
      },
    },

    strategy: {
      title: 'The Strategy Engine',
      subtitle: 'Market-neutral by design.',
      intro:
        'An algorithmic engine evaluates market conditions every second and executes strategies autonomously. Three complementary strategies work together to generate consistent yield without directional risk.',
      cashCarry: {
        title: 'Cash & Carry',
        hook: 'Profit from the structural spread between spot and futures.',
        description:
          'Cash & Carry exploits a structural feature of perpetual futures markets. The engine simultaneously buys an asset on spot markets and sells the same asset on futures markets. Price movements cancel out. The real yield comes from funding rate payments — a periodic transfer between traders that the engine captures consistently.',
        detail:
          'The strategy is only executed when the spread is profitable after accounting for all entry costs. If market conditions don\'t meet the minimum profitability threshold, the engine waits.',
      },
      lp: {
        title: 'Liquidity Provision',
        hook: 'Earn fees from every trade in the pool.',
        description:
          'The Vault provides liquidity to decentralized exchanges, earning a share of every trade executed within its price range. The engine continuously optimizes this range based on market conditions to maximize capital efficiency.',
        detail:
          'If the price moves outside the configured range, the automated hedging system activates to protect your capital from impermanent loss.',
      },
      hedging: {
        title: 'Automated Hedging',
        hook: 'Real-time insurance for active positions.',
        description:
          'When market conditions threaten an active position, the engine opens protective positions automatically. Think of it as real-time insurance: if liquidity positions lose value due to price movement, the hedge compensates.',
        detail:
          'Every hedge has predefined exit conditions — take-profit, trailing stops, and emergency limits — ensuring the protection doesn\'t become a liability itself.',
      },
    },

    fees: {
      title: 'Fees',
      subtitle: 'Transparent. Predictable. Aligned with your returns.',
      intro:
        'Our fee structure is designed for alignment: we earn more when you earn more. There are no hidden charges.',
      table: [
        { name: 'Management Fee', rate: '2.0% annual', appliedTo: 'Total Vault value (TVL)' },
        { name: 'Performance Fee', rate: '20.0%', appliedTo: 'Generated returns only' },
        { name: 'Network Gas', rate: '~$0.01/tx', appliedTo: 'On-chain operations' },
        { name: 'Settlement Fee', rate: 'Variable', appliedTo: 'Bridge transfer (fiat rails)' },
      ],
      example: {
        investment: '$10,000',
        duration: '1 year',
        grossReturn: '12%',
        grossAmount: '$1,200',
        managementFee: '$200',
        managementCalc: '$10,000 × 2.0%',
        performanceFee: '$240',
        performanceCalc: '$1,200 × 20.0%',
        netReturn: '$760',
        netYield: '7.6%',
      },
      alignment:
        'Performance Fee is only charged on generated returns. If the Vault doesn\'t generate yield, you don\'t pay performance fees. Our incentives are aligned with yours.',
    },

    risks: {
      title: 'Risks & Safeguards',
      subtitle: 'What you should know.',
      intro:
        'No investment is risk-free. Vault strategies are designed to be market-neutral, but structural risks exist. Here\'s what they are and how they\'re addressed.',
      items: [
        {
          risk: 'Market Risk',
          riskDescription:
            'Funding rates can turn negative. If rates reverse, the Cash & Carry strategy pays instead of earning. LP positions can suffer impermanent loss.',
          safeguard: 'Profitability Threshold',
          safeguardDescription:
            'The engine requires a minimum profitability before entering any position. Unprofitable strategies are not executed. Hedging activates automatically when LP positions are at risk.',
        },
        {
          risk: 'Liquidity Risk',
          riskDescription:
            'Capital deployed in DeFi protocols is not immediately available for redemption. During high demand, reserves may be temporarily insufficient.',
          safeguard: 'Cash Reserve Policy',
          safeguardDescription:
            'The Vault maintains liquid reserves at all times. Maximum deployment per cycle is capped at 50% of available cash. If reserves are insufficient for redemption, shares are restored automatically.',
        },
        {
          risk: 'Platform Risk',
          riskDescription:
            'Smart contract bugs, exchange downtime, or protocol failures could impact deployed capital.',
          safeguard: 'Deployment Limits',
          safeguardDescription:
            'Maximum deployment is capped at 50% of liquid reserves per cycle. Emergency kill switches activate after consecutive failures. Capital is never fully exposed to a single protocol.',
        },
        {
          risk: 'Counterparty Risk',
          riskDescription:
            'The Vault depends on third-party infrastructure: settlement rails, DEX protocols, and derivatives exchanges.',
          safeguard: 'Protocol Diversification',
          safeguardDescription:
            'Capital is distributed across multiple protocols and chains. No single counterparty represents a systemic risk. Bridge transfers are atomic: they complete or fully reverse.',
        },
        {
          risk: 'Algorithm Risk',
          riskDescription:
            'The Strategy Engine could make suboptimal decisions under unusual market conditions or edge cases.',
          safeguard: 'Zero Trust Validation',
          safeguardDescription:
            'Every algorithm decision is independently validated by a separate system before execution. If validation fails, the operation is aborted and logged. The algorithm never has direct execution access.',
        },
        {
          risk: 'Settlement Risk',
          riskDescription:
            'Fiat-to-crypto transfers can fail due to network conditions, compliance holds, or provider downtime.',
          safeguard: 'Automatic Reversal',
          safeguardDescription:
            'If a transfer fails at any point, shares are automatically reversed. The investor\'s position is restored to its pre-transaction state. No funds are ever lost in transit.',
        },
      ],
    },

    journey: {
      title: 'Example: The $1,000 Journey',
      subtitle: 'From deposit to redemption, step by step.',
      intro: 'Let\'s walk through a complete investment cycle with real numbers.',
      steps: [
        {
          label: 'DAY 1',
          title: 'Invest',
          items: [
            'You deposit $1,000 USDC into the SOL/USDC Vault.',
            'Current share price: $10.00',
            'You receive: 100 shares',
            'Your capital enters the Strategy Engine.',
          ],
        },
        {
          label: 'DAY 30',
          title: 'Growth',
          items: [
            'The Vault\'s strategies generated returns over 30 days.',
            'New share price: $10.98 (+9.8%)',
            'Your position: 100 shares × $10.98 = $1,098.24',
            'Unrealized return: +$98.24 (+9.82%)',
          ],
        },
        {
          label: 'RESULT',
          title: 'Redeem',
          items: [
            'You redeem all 100 shares.',
            'You receive: $1,098.24 USDC to your wallet.',
            'Net profit: +$98.24',
            'Total return: 9.82% in 30 days.',
          ],
        },
      ],
    },

    faq: {
      title: 'Frequently Asked Questions',
      items: [
        {
          question: 'What is a Vault?',
          answer:
            'An autonomous investment vehicle. Deposit USDC, receive shares, earn yield from market-neutral strategies. The algorithm manages everything — you don\'t need DeFi knowledge, wallet management, or position monitoring.',
        },
        {
          question: 'What is the minimum investment?',
          answer: '$10 USD. There is no maximum.',
        },
        {
          question: 'How long does it take to invest or redeem?',
          answer:
            'Investment creation takes seconds. Settlement depends on the payment rail: typically 1–30 minutes.',
        },
        {
          question: 'Can I lose money?',
          answer:
            'Yes. While strategies are market-neutral by design, risks exist: funding rate reversals, impermanent loss, platform failures. Returns are not guaranteed. See Risks & Safeguards for details.',
        },
        {
          question: 'What is a share?',
          answer:
            'A fractional ownership unit in the Vault. Your number of shares × the current share price = your current value. When the Vault generates yield, the share price increases.',
        },
        {
          question: 'How are returns generated?',
          answer:
            'From funding rate differentials (Cash & Carry), trading fees (Liquidity Provision), and hedging profits. Not from price speculation. The strategies are designed to be profitable regardless of market direction.',
        },
        {
          question: 'What happens if I redeem and the Vault doesn\'t have enough cash?',
          answer:
            'Your shares are automatically restored to your account. No funds are lost. You can try again when the Vault has available reserves.',
        },
        {
          question: 'What are the fees?',
          answer:
            '2% annual management fee on total Vault value + 20% performance fee on generated returns only. If the Vault doesn\'t produce yield, you pay no performance fee.',
        },
        {
          question: 'Do I need to complete KYC?',
          answer:
            'Yes. Identity verification is required before your first investment. The process takes a few minutes and includes document upload and selfie verification.',
        },
        {
          question: 'What blockchain is used?',
          answer:
            'Vaults operate on audited institutional-grade protocols: Protocol 1 (for liquidity strategies) and Protocol 2 (for derivatives). You interact with the system using USDC.',
        },
      ],
    },

    glossary: {
      title: 'Glossary',
      terms: [
        { term: 'Vault', definition: 'An autonomous investment vehicle that deploys capital into yield-generating strategies.' },
        { term: 'Share', definition: 'A fractional ownership unit in a Vault. Represents your proportional claim on the Vault\'s total value.' },
        { term: 'Share Price', definition: 'The current value of one share. Calculated as the Vault\'s total value divided by outstanding shares.' },
        { term: 'NAV', definition: 'Net Asset Value — the total value of all assets held by the Vault, including deployed positions and hedge P&L.' },
        { term: 'TVL', definition: 'Total Value Locked — the total capital deposited in the Vault by all investors.' },
        { term: 'USDC', definition: 'A dollar-pegged stablecoin. The deposit and withdrawal currency for all Vaults.' },
        { term: 'Market-Neutral', definition: 'A strategy that generates returns regardless of whether asset prices go up or down.' },
        { term: 'Funding Rate', definition: 'A periodic payment between futures traders. The basis of Cash & Carry yield generation.' },
        { term: 'Impermanent Loss', definition: 'The reduction in value of a liquidity position when asset prices move significantly outside the configured range.' },
        { term: 'Hedge', definition: 'A protective position opened to offset potential losses from another active position.' },
        { term: 'Redemption', definition: 'The process of converting your Vault shares back to USDC.' },
        { term: 'KYC', definition: 'Know Your Customer — identity verification required by regulation before investing.' },
      ],
    },

    cta: {
      title: 'Your capital should work as hard as you do.',
      subtitle: 'Loopay Vaults make it autonomous.',
      buttons: {
        explore: 'Explore Vaults',
        kyc: 'Complete KYC',
        manifesto: 'Read the Manifesto',
      },
    },
  },

  es: {
    hero: {
      title: 'Loopay Vaults',
      subtitle: 'Rendimiento autónomo, precisión institucional.',
      description:
        'El capital ocioso es un error de diseño. Los Vaults de Loopay son vehículos de inversión autónomos que despliegan tu USDC en estrategias market-neutral — generando rendimiento a partir de ineficiencias estructurales del mercado, no de especulación. Depositas dólares. El algoritmo hace el resto.',
    },

    architecture: {
      title: 'La Arquitectura del Vault',
      subtitle: 'Rendimiento autónomo, precisión institucional.',
      intro:
        'Un Vault es un vehículo de inversión automatizado. Piensa en él como un fondo mutuo donde el gestor de portafolio es un algoritmo que opera 24/7 con gestión de riesgo de grado institucional. Depositas USDC, recibes participaciones (shares) que representan tu propiedad, y el Motor de Estrategia despliega tu capital en protocolos de generación de rendimiento.',
      pillars: [
        {
          title: 'Despliegue Automatizado',
          description:
            'El capital fluye hacia estrategias de rendimiento sin intervención manual. El motor evalúa condiciones de mercado cada minuto y despliega capital cuando detecta oportunidades rentables.',
          icon: 'automation',
        },
        {
          title: 'Rendimientos Market-Neutral',
          description:
            'Las estrategias generan ganancias a partir de ineficiencias estructurales en mercados de derivados, no de la dirección del precio. Ya sea que los mercados suban o bajen, el motor captura rendimiento de diferenciales de funding rate.',
          icon: 'neutral',
        },
        {
          title: 'Salvaguardas Institucionales',
          description:
            'Cada decisión del algoritmo es validada independientemente antes de ejecutarse. Límites máximos de despliegue, reversiones automáticas en caso de fallo y protección de concurrencia multicapa.',
          icon: 'safeguard',
        },
      ],
      callout: 'Los Vaults aceptan depósitos en USDC. Inversión mínima: $10.',
    },

    howItWorks: {
      title: 'Cómo Funciona',
      subtitle: 'Tres pasos. Transparencia total.',
      intro:
        'El ciclo del inversor es simple por diseño. Depositar, monitorear, redimir — cada paso es atómico y reversible cuando es necesario.',
      invest: {
        title: 'Invertir',
        description:
          'Deposita USDC en cualquier Vault activo. Recibes shares — unidades de propiedad fraccionaria que representan tu porción del valor total del Vault. La liquidación toma minutos. Tu capital comienza a generar rendimiento desde el siguiente ciclo de estrategia.',
        detail:
          'Creación: < 2 segundos. Liquidación: 1–30 minutos. Mínimo: $10 USD. Si la transferencia falla, tus shares se revierten automáticamente. Nunca pierdes fondos en tránsito.',
        icon: 'wallet',
      },
      track: {
        title: 'Ver Rendimientos',
        description:
          'Tus rendimientos se reflejan en el precio del share. Cuando las estrategias del Vault generan rendimiento, el precio del share sube. La matemática es simple: si compraste shares a $10.00 y el precio ahora es $10.50, tu inversión creció 5%.',
        detail:
          'Tu portafolio muestra: valor actual, costo base y P&L no realizado — actualizado en tiempo real conforme se recalcula el NAV (Valor Neto de Activos) del Vault.',
        icon: 'chart',
      },
      redeem: {
        title: 'Redimir',
        description:
          'Solicita una redención en cualquier momento. Elige redimir una cantidad específica de shares o un monto en dólares. Tu USDC se transfiere directamente a tu wallet.',
        detail:
          'Si el Vault no tiene reservas líquidas suficientes, tus shares se restauran automáticamente — puedes intentar de nuevo cuando haya liquidez disponible. Nunca pierdes fondos.',
        icon: 'redeem',
      },
    },

    strategy: {
      title: 'El Motor de Estrategia',
      subtitle: 'Market-neutral por diseño.',
      intro:
        'Un motor algorítmico evalúa las condiciones del mercado cada segundo y ejecuta estrategias de forma autónoma. Tres estrategias complementarias trabajan juntas para generar rendimiento consistente sin riesgo direccional.',
      cashCarry: {
        title: 'Cash & Carry',
        hook: 'Ganancias del spread estructural entre spot y futuros.',
        description:
          'Cash & Carry explota una característica estructural de los mercados de futuros perpetuos. El motor compra simultáneamente un activo en mercados spot y vende el mismo activo en mercados de futuros. Los movimientos de precio se cancelan. El rendimiento real viene de los pagos de funding rate — una transferencia periódica entre traders que el motor captura de forma consistente.',
        detail:
          'La estrategia solo se ejecuta cuando el spread es rentable después de contabilizar todos los costos de entrada. Si las condiciones del mercado no cumplen el umbral mínimo de rentabilidad, el motor espera.',
      },
      lp: {
        title: 'Provisión de Liquidez',
        hook: 'Gana fees de cada trade en el pool.',
        description:
          'El Vault provee liquidez a exchanges descentralizados, ganando una porción de cada operación ejecutada dentro de su rango de precios. El motor optimiza continuamente este rango basándose en las condiciones del mercado para maximizar la eficiencia del capital.',
        detail:
          'Si el precio se mueve fuera del rango configurado, el sistema de hedging automatizado se activa para proteger tu capital del impermanent loss.',
      },
      hedging: {
        title: 'Hedging Automatizado',
        hook: 'Seguro en tiempo real para posiciones activas.',
        description:
          'Cuando las condiciones del mercado amenazan una posición activa, el motor abre posiciones protectivas automáticamente. Piensa en ello como un seguro en tiempo real: si las posiciones de liquidez pierden valor debido al movimiento del precio, el hedge compensa.',
        detail:
          'Cada hedge tiene condiciones de salida predefinidas — take-profit, trailing stops y límites de emergencia — asegurando que la protección no se convierta en un pasivo.',
      },
    },

    fees: {
      title: 'Fees',
      subtitle: 'Transparentes. Predecibles. Alineados con tus rendimientos.',
      intro:
        'Nuestra estructura de fees está diseñada para alineación: ganamos más cuando tú ganas más. No hay cargos ocultos.',
      table: [
        { name: 'Management Fee', rate: '2.0% anual', appliedTo: 'Valor total del Vault (TVL)' },
        { name: 'Performance Fee', rate: '20.0%', appliedTo: 'Solo sobre rendimientos generados' },
        { name: 'Gas de Red', rate: '~$0.01/tx', appliedTo: 'Operaciones on-chain' },
        { name: 'Fee de Liquidación', rate: 'Variable', appliedTo: 'Transferencia Bridge (rieles fiat)' },
      ],
      example: {
        investment: '$10,000',
        duration: '1 año',
        grossReturn: '12%',
        grossAmount: '$1,200',
        managementFee: '$200',
        managementCalc: '$10,000 × 2.0%',
        performanceFee: '$240',
        performanceCalc: '$1,200 × 20.0%',
        netReturn: '$760',
        netYield: '7.6%',
      },
      alignment:
        'El Performance Fee solo se cobra sobre rendimientos generados. Si el Vault no genera rendimiento, no pagas performance fee. Nuestros incentivos están alineados con los tuyos.',
    },

    risks: {
      title: 'Riesgos y Salvaguardas',
      subtitle: 'Lo que debes saber.',
      intro:
        'Ninguna inversión está libre de riesgo. Las estrategias del Vault están diseñadas para ser market-neutral, pero existen riesgos estructurales. Estos son cuáles son y cómo se abordan.',
      items: [
        {
          risk: 'Riesgo de Mercado',
          riskDescription:
            'Los funding rates pueden volverse negativos. Si las tasas se revierten, la estrategia Cash & Carry paga en lugar de ganar. Las posiciones LP pueden sufrir impermanent loss.',
          safeguard: 'Umbral de Rentabilidad',
          safeguardDescription:
            'El motor requiere una rentabilidad mínima antes de entrar en cualquier posición. Las estrategias no rentables no se ejecutan. El hedging se activa automáticamente cuando las posiciones LP están en riesgo.',
        },
        {
          risk: 'Riesgo de Liquidez',
          riskDescription:
            'El capital desplegado en protocolos DeFi no está disponible inmediatamente para redención. Durante alta demanda, las reservas pueden ser temporalmente insuficientes.',
          safeguard: 'Política de Reserva de Efectivo',
          safeguardDescription:
            'El Vault mantiene reservas líquidas en todo momento. El despliegue máximo por ciclo está limitado al 50% del efectivo disponible. Si las reservas son insuficientes para redención, los shares se restauran automáticamente.',
        },
        {
          risk: 'Riesgo de Plataforma',
          riskDescription:
            'Bugs en smart contracts, tiempo de inactividad de exchanges o fallos de protocolo podrían impactar el capital desplegado.',
          safeguard: 'Límites de Despliegue',
          safeguardDescription:
            'El despliegue máximo está limitado al 50% de las reservas líquidas por ciclo. Los kill switches de emergencia se activan después de fallos consecutivos. El capital nunca está completamente expuesto a un solo protocolo.',
        },
        {
          risk: 'Riesgo de Contraparte',
          riskDescription:
            'El Vault depende de infraestructura de terceros: rieles de liquidación, protocolos DEX y exchanges de derivados.',
          safeguard: 'Diversificación de Protocolos',
          safeguardDescription:
            'El capital se distribuye entre múltiples protocolos y cadenas. Ninguna contraparte individual representa un riesgo sistémico. Las transferencias Bridge son atómicas: se completan o se revierten completamente.',
        },
        {
          risk: 'Riesgo Algorítmico',
          riskDescription:
            'El Motor de Estrategia podría tomar decisiones subóptimas bajo condiciones de mercado inusuales o casos extremos.',
          safeguard: 'Validación Zero Trust',
          safeguardDescription:
            'Cada decisión del algoritmo es validada independientemente por un sistema separado antes de ejecutarse. Si la validación falla, la operación se aborta y se registra. El algoritmo nunca tiene acceso directo a la ejecución.',
        },
        {
          risk: 'Riesgo de Liquidación',
          riskDescription:
            'Las transferencias fiat-a-crypto pueden fallar debido a condiciones de red, retenciones de compliance o tiempo de inactividad del proveedor.',
          safeguard: 'Reversión Automática',
          safeguardDescription:
            'Si una transferencia falla en cualquier punto, los shares se revierten automáticamente. La posición del inversor se restaura a su estado previo a la transacción. Nunca se pierden fondos en tránsito.',
        },
      ],
    },

    journey: {
      title: 'Ejemplo: El Viaje de $1,000',
      subtitle: 'De depósito a redención, paso a paso.',
      intro: 'Recorramos un ciclo de inversión completo con números reales.',
      steps: [
        {
          label: 'DÍA 1',
          title: 'Invertir',
          items: [
            'Depositas $1,000 USDC en el Vault SOL/USDC.',
            'Precio actual del share: $10.00',
            'Recibes: 100 shares',
            'Tu capital entra al Motor de Estrategia.',
          ],
        },
        {
          label: 'DÍA 30',
          title: 'Crecimiento',
          items: [
            'Las estrategias del Vault generaron rendimientos durante 30 días.',
            'Nuevo precio del share: $10.98 (+9.8%)',
            'Tu posición: 100 shares × $10.98 = $1,098.24',
            'Rendimiento no realizado: +$98.24 (+9.82%)',
          ],
        },
        {
          label: 'RESULTADO',
          title: 'Redimir',
          items: [
            'Redimes tus 100 shares.',
            'Recibes: $1,098.24 USDC en tu wallet.',
            'Ganancia neta: +$98.24',
            'Retorno total: 9.82% en 30 días.',
          ],
        },
      ],
    },

    faq: {
      title: 'Preguntas Frecuentes',
      items: [
        {
          question: '¿Qué es un Vault?',
          answer:
            'Un vehículo de inversión autónomo. Depositas USDC, recibes shares, ganas rendimiento de estrategias market-neutral. El algoritmo gestiona todo — no necesitas conocimiento de DeFi, gestión de wallets ni monitoreo de posiciones.',
        },
        {
          question: '¿Cuál es la inversión mínima?',
          answer: '$10 USD. No hay máximo.',
        },
        {
          question: '¿Cuánto tarda invertir o redimir?',
          answer:
            'La creación de la inversión toma segundos. La liquidación depende del riel de pago: típicamente 1–30 minutos.',
        },
        {
          question: '¿Puedo perder dinero?',
          answer:
            'Sí. Aunque las estrategias son market-neutral por diseño, existen riesgos: reversión de funding rates, impermanent loss, fallos de plataforma. Los rendimientos no están garantizados. Consulta Riesgos y Salvaguardas para más detalles.',
        },
        {
          question: '¿Qué es un share?',
          answer:
            'Una unidad de propiedad fraccionaria en el Vault. Tu número de shares × el precio actual del share = tu valor actual. Cuando el Vault genera rendimiento, el precio del share sube.',
        },
        {
          question: '¿Cómo se generan los rendimientos?',
          answer:
            'De diferenciales de funding rate (Cash & Carry), fees de trading (Provisión de Liquidez) y ganancias de hedging. No de especulación de precios. Las estrategias están diseñadas para ser rentables independientemente de la dirección del mercado.',
        },
        {
          question: '¿Qué pasa si redimo y el Vault no tiene suficiente efectivo?',
          answer:
            'Tus shares se restauran automáticamente en tu cuenta. No se pierde ningún fondo. Puedes intentar de nuevo cuando el Vault tenga reservas disponibles.',
        },
        {
          question: '¿Cuáles son los fees?',
          answer:
            '2% de management fee anual sobre el valor total del Vault + 20% de performance fee solo sobre rendimientos generados. Si el Vault no produce rendimiento, no pagas performance fee.',
        },
        {
          question: '¿Necesito completar KYC?',
          answer:
            'Sí. La verificación de identidad es requerida antes de tu primera inversión. El proceso toma pocos minutos e incluye carga de documento y verificación de selfie.',
        },
        {
          question: '¿Qué blockchain se usa?',
          answer:
            'Los Vaults operan sobre protocolos institucionales auditados: Protocolo 1 (para estrategias de liquidez) y Protocolo 2 (para derivados). Interactúas con el sistema usando USDC.',
        },
      ],
    },

    glossary: {
      title: 'Glosario',
      terms: [
        { term: 'Vault', definition: 'Vehículo de inversión autónomo que despliega capital en estrategias de generación de rendimiento.' },
        { term: 'Share', definition: 'Unidad de propiedad fraccionaria en un Vault. Representa tu derecho proporcional sobre el valor total del Vault.' },
        { term: 'Precio del Share', definition: 'El valor actual de un share. Calculado como el valor total del Vault dividido entre los shares emitidos.' },
        { term: 'NAV', definition: 'Net Asset Value — el valor total de todos los activos del Vault, incluyendo posiciones desplegadas y P&L de hedges.' },
        { term: 'TVL', definition: 'Total Value Locked — el capital total depositado en el Vault por todos los inversores.' },
        { term: 'USDC', definition: 'Stablecoin respaldada por dólares. La moneda de depósito y retiro para todos los Vaults.' },
        { term: 'Market-Neutral', definition: 'Estrategia que genera rendimiento independientemente de si los precios de los activos suben o bajan.' },
        { term: 'Funding Rate', definition: 'Pago periódico entre traders de futuros. La base de generación de rendimiento del Cash & Carry.' },
        { term: 'Impermanent Loss', definition: 'Reducción en el valor de una posición de liquidez cuando los precios se mueven significativamente fuera del rango configurado.' },
        { term: 'Hedge', definition: 'Posición protectiva abierta para compensar pérdidas potenciales de otra posición activa.' },
        { term: 'Redención', definition: 'El proceso de convertir tus shares del Vault de vuelta a USDC.' },
        { term: 'KYC', definition: 'Know Your Customer — verificación de identidad requerida por regulación antes de invertir.' },
      ],
    },

    cta: {
      title: 'Tu capital debería trabajar tan duro como tú.',
      subtitle: 'Los Vaults de Loopay lo hacen autónomo.',
      buttons: {
        explore: 'Explorar Vaults',
        kyc: 'Completar KYC',
        manifesto: 'Leer el Manifiesto',
      },
    },
  },
};

export function getVaultsContent(language: Language): VaultsContent {
  return vaultsContent[language] || vaultsContent.en;
}
