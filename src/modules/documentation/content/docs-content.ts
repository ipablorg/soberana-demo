/**
 * Documentation Content - Multilingual
 * 
 * Contains all documentation content in multiple languages.
 * Currently supports: Spanish (es) and English (en)
 */

export type Language = 'en' | 'es';

export interface DocContent {
  hero: {
    title: string;
    subtitle: string;
    description: string;
  };
  manifesto: {
    title: string;
    subtitle: string;
    content: {
      intro: string;
      quote: string;
      principle: string;
      conclusion: string;
    };
  };
  principles: {
    title: string;
    subtitle: string;
    sovereignty: {
      title: string;
      description: string[];
    };
    activeCapital: {
      title: string;
      description: string[];
    };
    agenticTreasury: {
      title: string;
      description: string[];
    };
  };
  cardPro: {
    title: string;
    subtitle: string;
    intro: string;
    atomicFlow: {
      title: string;
      callout: string;
      steps: {
        signal: { title: string; description: string };
        solvency: { title: string; description: string };
        atomic: { title: string; description: string };
        approval: { title: string; description: string };
      };
      result: string;
    };
    vaults: {
      title: string;
      description: string;
      strategies: { title: string; description: string };
      hybrid: { title: string; description: string };
    };
  };
  sovy: {
    title: string;
    subtitle: string;
    intro: string;
    capabilities: {
      title: string;
      callout: string;
      gas: { title: string; description: string };
      liquidity: { title: string; description: string };
      risk: { title: string; description: string };
    };
    naturalLanguage: {
      title: string;
      intro: string;
      userMessage: string;
      botResponse: {
        intro: string;
        available: string;
        payables: string;
        yield: string;
        projection: string;
      };
    };
  };
  links: {
    title: string;
    subtitle: string;
    intro: string;
    softOnboarding: {
      title: string;
      callout: string;
      steps: {
        creation: { title: string; description: string };
        identity: { title: string; description: string };
        capture: { title: string; description: string };
        registration: { title: string; description: string };
      };
    };
    useCases: {
      title: string;
      creators: { title: string; description: string };
      gig: { title: string; description: string };
    };
  };
  infrastructure: {
    title: string;
    subtitle: string;
    callout: string;
    deployment: {
      title: string;
      description: string;
      components: {
        ledger: { title: string; description: string };
        switch: { title: string; description: string };
        sovy: { title: string; description: string };
      };
    };
    dockerCompose: {
      title: string;
    };
    sovereignty: {
      title: string;
      callout: string;
    };
  };
  security: {
    title: string;
    subtitle: string;
    intro: string;
    deterministic: { title: string; description: string };
    cryptography: { title: string; description: string };
    compliance: { title: string; description: string };
  };
  cta: {
    title: string;
    subtitle: string;
    buttons: {
      build: string;
      deploy: string;
      govern: string;
    };
  };
}

export const docsContent: Record<Language, DocContent> = {
  es: {
    hero: {
      title: "Loopay Soberana",
      subtitle: "El Sistema Operativo de Tesorería Autónoma",
      description: "Donde el capital de trabajo nunca se detiene. La convergencia definitiva entre generación de rendimiento descentralizado y ubicuidad de pagos globales, orquestada por inteligencia artificial autónoma.",
    },
    manifesto: {
      title: "Manifiesto de Arquitectura",
      subtitle: "Rediseñando la pila tecnológica financiera",
      content: {
        intro: "El sistema financiero heredado opera bajo la ineficiencia del capital estático: fondos atrapados en cuentas de liquidación T+2, erosionados por la inflación y fragmentados en silos bancarios.",
        quote: "Loopay Soberana no es una pasarela de pagos; es un Sistema Operativo (OS) diseñado para la Finalidad del Capital Soberano.",
        principle: "El capital de trabajo nunca debe detenerse.",
        conclusion: "Nuestra arquitectura representa la convergencia definitiva entre la generación de rendimiento descentralizado (Yield) y la ubicuidad de los rieles de pago globales (Spend), orquestada por inteligencia artificial autónoma.",
      },
    },
    principles: {
      title: "I. Principios de Diseño",
      subtitle: "Los fundamentos de la tesorería autónoma",
      sovereignty: {
        title: "La Soberanía como Estándar",
        description: [
          "La custodia no es negociable. Loopay elimina el riesgo de contraparte mediante el uso de Smart Wallets con Abstracción de Cuenta (ERC-4337).",
          "Usted mantiene las llaves; nosotros proveemos los rieles. Su infraestructura financiera reside en sus servidores, bajo sus reglas criptográficas.",
        ],
      },
      activeCapital: {
        title: "Capital Activo (Zero Idle Capital)",
        description: [
          "En el OS Loopay, el concepto de \"saldo disponible\" se redefine. El capital no se \"estaciona\" para ser gastado; se invierte hasta el microsegundo exacto de su utilización.",
          "La liquidez es Just-In-Time (JIT).",
        ],
      },
      agenticTreasury: {
        title: "Tesorería Agéntica",
        description: [
          "La gestión manual es obsoleta. Loopay Zentinel, nuestro núcleo de IA, no es un dashboard pasivo; es un agente activo que predice flujos de caja, rebalancea posiciones de liquidez y mitiga riesgos de protocolo en tiempo real.",
        ],
      },
    },
    cardPro: {
      title: "II. Loopay Card Pro: El Motor de Gasto JIT",
      subtitle: "De centro de costos a instrumento de generación de rendimiento",
      intro: "La Loopay Card Pro transforma su tarjeta corporativa de un centro de costos a un instrumento de generación de rendimiento. A diferencia de las tarjetas prepagadas tradicionales que requieren fondeo manual, Card Pro opera contra una Bóveda de Rendimiento activa.",
      atomicFlow: {
        title: "2.1. Flujo de Liquidación Atómica (Atomic JIT Settlement)",
        callout: "Cuando ocurre una transacción en el mundo real (un pago de AWS, una cena de negocios), el OS ejecuta una secuencia de operaciones en milisegundos:",
        steps: {
          signal: {
            title: "La Señal (t=0ms)",
            description: "La red Visa/Mastercard envía una solicitud de autorización al nodo Loopay.",
          },
          solvency: {
            title: "La Verificación de Solvencia (t=50ms)",
            description: "Loopay Zentinel verifica el valor colateral de sus activos en el Vault (ej. posiciones en Aave, Morpho o Bonos del Tesoro Tokenizados).",
          },
          atomic: {
            title: "El Deshacer Atómico (t=200ms)",
            description: "El sistema liquida programáticamente solo la fracción exacta de los activos necesarios para cubrir el cargo.",
          },
          approval: {
            title: "La Aprobación (t=800ms)",
            description: "La transacción se aprueba en el punto de venta.",
          },
        },
        result: "El 99.9% restante de su capital siguió generando interés durante la transacción.",
      },
      vaults: {
        title: "2.2. Arquitectura de Bóvedas (Loopay Vaults)",
        description: "Las Vaults son contenedores inteligentes basados en el estándar ERC-4626.",
        strategies: {
          title: "Estrategias Componibles",
          description: "Configure Vaults que asignen capital automáticamente entre protocolos de préstamo (Lending), RWA (Real World Assets) y pools de liquidez, optimizando el APY según su perfil de riesgo.",
        },
        hybrid: {
          title: "Rieles Híbridos",
          description: "Integración nativa con Monerium para la emisión de IBANs en cadena. Esto permite que su Vault tenga una dirección de contrato inteligente y un número de cuenta bancaria SEPA totalmente compatible.",
        },
      },
    },
    sovy: {
      title: "III. Loopay Zentinel: Inteligencia de Tesorería",
      subtitle: "El agente de IA autónomo residente en su infraestructura",
      intro: "La complejidad de gestionar liquidez fragmentada y vaults DeFi se abstrae mediante Zentinel, nuestro agente de IA autónomo residente en su infraestructura.",
      capabilities: {
        title: "3.1. Capacidades Agénticas",
        callout: "Zentinel no solo reporta; actúa bajo parámetros predefinidos de gobernanza:",
        gas: {
          title: "Optimización de Gas Predictiva",
          description: "Analiza la mempool para programar transacciones de mantenimiento de Vaults en momentos de baja congestión.",
        },
        liquidity: {
          title: "Gestión de Liquidez Preventiva",
          description: "Utiliza modelos predictivos para anticipar sus necesidades de flujo de caja (nómina, facturación recurrente) y asegura que haya suficiente liquidez líquida disponible sin intervención humana.",
        },
        risk: {
          title: "Mitigación de Riesgo en Tiempo Real",
          description: "Monitorea la salud de los protocolos subyacentes. Si un protocolo DeFi muestra signos de desvinculación (de-peg) o inestabilidad, Zentinel puede ejecutar un \"Freno de Emergencia\", retirando fondos a una bóveda de seguridad (Cold Storage) automáticamente.",
        },
      },
      naturalLanguage: {
        title: "3.2. Interfaz de Lenguaje Natural",
        intro: "Interactúe con su tesorería como lo haría con un CFO:",
        userMessage: "Zentinel, ¿cuál es mi posición de efectivo proyectada para el próximo viernes considerando las cuentas por pagar pendientes y el rendimiento actual de la Vault?",
        botResponse: {
          intro: "Basándome en tus datos actuales:",
          available: "Liquidez disponible: $47,320 USD",
          payables: "Cuentas por pagar (viernes): $12,500 USD",
          yield: "Rendimiento proyectado Vault: +$890 USD",
          projection: "Proyección: Dispondrás de $35,710 USD el viernes. Tu posición es saludable. ✓",
        },
      },
    },
    links: {
      title: "IV. Soberana Elements: Adquisición de Fricción Cero",
      subtitle: "La capa de entrada de capital reimaginada",
      intro: "Para la capa de entrada de capital (On-ramping / Cobros), Soberana Elements elimina la barrera cognitiva del registro previo. Inspirado en la simplicidad de los agregadores de enlaces sociales, aplicado a la infraestructura de pagos global.",
      softOnboarding: {
        title: "4.1. El Paradigma \"Soft Onboarding\"",
        callout: "El usuario comienza a recibir valor antes de registrarse.",
        steps: {
          creation: {
            title: "Creación Instantánea",
            description: "Un usuario llega a links.loopay.com, configura un enlace de pago y comienza a recibir fondos globalmente en segundos.",
          },
          identity: {
            title: "Identidad Provisional",
            description: "El sistema genera una \"Cuenta Sombra\" (Shadow Account) segura vinculada a la sesión y huella digital del dispositivo.",
          },
          capture: {
            title: "Captura de Valor",
            description: "Los fondos se acumulan en una cuenta escrow segura.",
          },
          registration: {
            title: "Registro Diferido (Lazy Registration)",
            description: "Solo se solicita KYC y credenciales completas en el momento de la retirada o gestión avanzada de fondos.",
          },
        },
      },
      useCases: {
        title: "4.2. Casos de Uso",
        creators: {
          title: "Economía de Creadores",
          description: "Enlaces de \"bio\" que son terminales de punto de venta reales. Creadores pueden recibir pagos instantáneos sin configurar infraestructura compleja.",
        },
        gig: {
          title: "Gig Economy",
          description: "Freelancers generando facturas cobrables instantáneamente sin configurar una pasarela compleja. Pago global, sin fronteras.",
        },
      },
    },
    infrastructure: {
      title: "V. Infraestructura Soberana (Self-Hosted)",
      subtitle: "El verdadero poder de Loopay reside en su portabilidad",
      callout: "No somos un SaaS; somos el código que impulsa su banco. Ofrecemos nuestra tecnología como Infraestructura Fintech Soberana (SFI). Usted posee la infraestructura, usted posee los datos, usted posee el rendimiento.",
      deployment: {
        title: "5.1. Despliegue Dockerizado",
        description: "Entregamos el núcleo de Loopay como un conjunto de contenedores Docker orquestados, listos para desplegarse en su propia nube (AWS, GCP, Azure) o servidores bare-metal.",
        components: {
          ledger: {
            title: "Loopay Ledger",
            description: "Base de datos de contabilidad de doble entrada inmutable (basada en TigerBeetle/Postgres) para una integridad financiera absoluta.",
          },
          switch: {
            title: "Payment Switch",
            description: "Router de pagos inteligente para orquestación y failover entre múltiples proveedores.",
          },
          sovy: {
            title: "Zentinel Node",
            description: "El contenedor de IA para la gestión autónoma.",
          },
        },
      },
      dockerCompose: {
        title: "5.2. Archivo de Referencia docker-compose.yml",
      },
      sovereignty: {
        title: "5.3. Soberanía de Datos",
        callout: "En el modelo SFI, los datos financieros de sus usuarios, las claves de API de sus proveedores bancarios y sus estrategias de Vault nunca tocan los servidores de Loopay Inc. Usted posee la infraestructura. Usted posee los datos. Usted posee el rendimiento.",
      },
    },
    security: {
      title: "VI. Seguridad y Cumplimiento: Confianza Visual",
      subtitle: "La seguridad trasciende la encriptación; es una experiencia de usuario",
      intro: "Implementamos Visual Trust en cada interfaz.",
      deterministic: {
        title: "Diseño Determinista",
        description: "La UI no deja espacio a la ambigüedad. Los estados de transacción son binarios y claros.",
      },
      cryptography: {
        title: "Criptografía Transparente",
        description: "Firmas criptográficas verificables para cada movimiento de fondos.",
      },
      compliance: {
        title: "Cumplimiento Programable",
        description: "Reglas de KYC/AML codificadas en el nivel de contrato inteligente y API, asegurando que la soberanía no comprometa la legalidad.",
      },
    },
    cta: {
      title: "Loopay Soberana.",
      subtitle: "La infraestructura financiera ha dejado de ser un servicio para convertirse en su propiedad.",
      buttons: {
        build: "Construya",
        deploy: "Despliegue",
        govern: "Gobierne",
      },
    },
  },
  en: {
    hero: {
      title: "Loopay Sovereign",
      subtitle: "The Autonomous Treasury Operating System",
      description: "Where working capital never stops. The definitive convergence between decentralized yield generation and global payment rail ubiquity, orchestrated by autonomous artificial intelligence.",
    },
    manifesto: {
      title: "Architecture Manifesto",
      subtitle: "Redesigning the financial technology stack",
      content: {
        intro: "The legacy financial system operates under the inefficiency of static capital: funds trapped in T+2 settlement accounts, eroded by inflation, and fragmented in banking silos.",
        quote: "Loopay Sovereign is not a payment gateway; it's an Operating System (OS) designed for Sovereign Capital Finality.",
        principle: "Working capital must never stop.",
        conclusion: "Our architecture represents the definitive convergence between decentralized yield generation (Yield) and the ubiquity of global payment rails (Spend), orchestrated by autonomous artificial intelligence.",
      },
    },
    principles: {
      title: "I. Design Principles",
      subtitle: "The foundations of autonomous treasury",
      sovereignty: {
        title: "Sovereignty as Standard",
        description: [
          "Custody is non-negotiable. Loopay eliminates counterparty risk through the use of Smart Wallets with Account Abstraction (ERC-4337).",
          "You hold the keys; we provide the rails. Your financial infrastructure resides on your servers, under your cryptographic rules.",
        ],
      },
      activeCapital: {
        title: "Active Capital (Zero Idle Capital)",
        description: [
          "In the Loopay OS, the concept of \"available balance\" is redefined. Capital doesn't \"park\" to be spent; it's invested until the exact microsecond of its utilization.",
          "Liquidity is Just-In-Time (JIT).",
        ],
      },
      agenticTreasury: {
        title: "Agentic Treasury",
        description: [
          "Manual management is obsolete. Loopay Zentinel, our AI core, is not a passive dashboard; it's an active agent that predicts cash flows, rebalances liquidity positions, and mitigates protocol risks in real-time.",
        ],
      },
    },
    cardPro: {
      title: "II. Loopay Card Pro: The JIT Spending Engine",
      subtitle: "From cost center to yield-generating instrument",
      intro: "Loopay Card Pro transforms your corporate card from a cost center to a yield-generating instrument. Unlike traditional prepaid cards that require manual funding, Card Pro operates against an active Yield Vault.",
      atomicFlow: {
        title: "2.1. Atomic JIT Settlement Flow",
        callout: "When a real-world transaction occurs (an AWS payment, a business dinner), the OS executes a sequence of operations in milliseconds:",
        steps: {
          signal: {
            title: "The Signal (t=0ms)",
            description: "The Visa/Mastercard network sends an authorization request to the Loopay node.",
          },
          solvency: {
            title: "Solvency Check (t=50ms)",
            description: "Loopay Zentinel verifies the collateral value of your Vault assets (e.g., positions in Aave, Morpho, or Tokenized Treasury Bonds).",
          },
          atomic: {
            title: "Atomic Undo (t=200ms)",
            description: "The system programmatically liquidates only the exact fraction of assets needed to cover the charge.",
          },
          approval: {
            title: "Approval (t=800ms)",
            description: "The transaction is approved at the point of sale.",
          },
        },
        result: "The remaining 99.9% of your capital continued earning interest during the transaction.",
      },
      vaults: {
        title: "2.2. Vault Architecture (Loopay Vaults)",
        description: "Vaults are smart containers based on the ERC-4626 standard.",
        strategies: {
          title: "Composable Strategies",
          description: "Configure Vaults that automatically allocate capital between lending protocols, RWA (Real World Assets), and liquidity pools, optimizing APY according to your risk profile.",
        },
        hybrid: {
          title: "Hybrid Rails",
          description: "Native integration with Monerium for on-chain IBAN issuance. This allows your Vault to have both a smart contract address and a fully compliant SEPA bank account number.",
        },
      },
    },
    sovy: {
      title: "III. Loopay Zentinel: Treasury Intelligence",
      subtitle: "The autonomous AI agent resident in your infrastructure",
      intro: "The complexity of managing fragmented liquidity and DeFi vaults is abstracted through Zentinel, our autonomous AI agent resident in your infrastructure.",
      capabilities: {
        title: "3.1. Agentic Capabilities",
        callout: "Zentinel doesn't just report; it acts under predefined governance parameters:",
        gas: {
          title: "Predictive Gas Optimization",
          description: "Analyzes the mempool to schedule Vault maintenance transactions during low congestion periods.",
        },
        liquidity: {
          title: "Preventive Liquidity Management",
          description: "Uses predictive models to anticipate your cash flow needs (payroll, recurring billing) and ensures sufficient liquid liquidity is available without human intervention.",
        },
        risk: {
          title: "Real-Time Risk Mitigation",
          description: "Monitors the health of underlying protocols. If a DeFi protocol shows signs of de-peg or instability, Zentinel can execute an \"Emergency Brake\", withdrawing funds to a safety vault (Cold Storage) automatically.",
        },
      },
      naturalLanguage: {
        title: "3.2. Natural Language Interface",
        intro: "Interact with your treasury as you would with a CFO:",
        userMessage: "Zentinel, what is my projected cash position for next Friday considering pending accounts payable and current Vault yield?",
        botResponse: {
          intro: "Based on your current data:",
          available: "Available liquidity: $47,320 USD",
          payables: "Accounts payable (Friday): $12,500 USD",
          yield: "Projected Vault yield: +$890 USD",
          projection: "Projection: You'll have $35,710 USD on Friday. Your position is healthy. ✓",
        },
      },
    },
    links: {
      title: "IV. Soberana Elements: Zero-Friction Acquisition",
      subtitle: "The capital entry layer reimagined",
      intro: "For the capital entry layer (On-ramping / Collections), Soberana Elements eliminates the cognitive barrier of prior registration. Inspired by the simplicity of social link aggregators, applied to global payment infrastructure.",
      softOnboarding: {
        title: "4.1. The \"Soft Onboarding\" Paradigm",
        callout: "The user starts receiving value before registering.",
        steps: {
          creation: {
            title: "Instant Creation",
            description: "A user arrives at links.loopay.com, sets up a payment link, and starts receiving funds globally in seconds.",
          },
          identity: {
            title: "Provisional Identity",
            description: "The system generates a secure \"Shadow Account\" linked to the session and device fingerprint.",
          },
          capture: {
            title: "Value Capture",
            description: "Funds accumulate in a secure escrow account.",
          },
          registration: {
            title: "Deferred Registration (Lazy Registration)",
            description: "KYC and full credentials are only requested at the time of withdrawal or advanced fund management.",
          },
        },
      },
      useCases: {
        title: "4.2. Use Cases",
        creators: {
          title: "Creator Economy",
          description: "\"Bio\" links that are real point-of-sale terminals. Creators can receive instant payments without setting up complex infrastructure.",
        },
        gig: {
          title: "Gig Economy",
          description: "Freelancers generating instantly billable invoices without setting up a complex gateway. Global payment, borderless.",
        },
      },
    },
    infrastructure: {
      title: "V. Sovereign Infrastructure (Self-Hosted)",
      subtitle: "Loopay's true power lies in its portability",
      callout: "We're not a SaaS; we're the code that powers your bank. We offer our technology as Sovereign Fintech Infrastructure (SFI). You own the infrastructure, you own the data, you own the yield.",
      deployment: {
        title: "5.1. Dockerized Deployment",
        description: "We deliver the Loopay core as a set of orchestrated Docker containers, ready to deploy on your own cloud (AWS, GCP, Azure) or bare-metal servers.",
        components: {
          ledger: {
            title: "Loopay Ledger",
            description: "Immutable double-entry accounting database (based on TigerBeetle/Postgres) for absolute financial integrity.",
          },
          switch: {
            title: "Payment Switch",
            description: "Smart payment router for orchestration and failover across multiple providers.",
          },
          sovy: {
            title: "Zentinel Node",
            description: "The AI container for autonomous management.",
          },
        },
      },
      dockerCompose: {
        title: "5.2. docker-compose.yml Reference File",
      },
      sovereignty: {
        title: "5.3. Data Sovereignty",
        callout: "In the SFI model, your users' financial data, your banking providers' API keys, and your Vault strategies never touch Loopay Inc.'s servers. You own the infrastructure. You own the data. You own the yield.",
      },
    },
    security: {
      title: "VI. Security and Compliance: Visual Trust",
      subtitle: "Security transcends encryption; it's a user experience",
      intro: "We implement Visual Trust in every interface.",
      deterministic: {
        title: "Deterministic Design",
        description: "The UI leaves no room for ambiguity. Transaction states are binary and clear.",
      },
      cryptography: {
        title: "Transparent Cryptography",
        description: "Verifiable cryptographic signatures for every fund movement.",
      },
      compliance: {
        title: "Programmable Compliance",
        description: "KYC/AML rules encoded at the smart contract and API level, ensuring that sovereignty doesn't compromise legality.",
      },
    },
    cta: {
      title: "Loopay Sovereign.",
      subtitle: "Financial infrastructure has ceased to be a service to become your property.",
      buttons: {
        build: "Build",
        deploy: "Deploy",
        govern: "Govern",
      },
    },
  },
};

export function getDocsContent(language: Language): DocContent {
  return docsContent[language] || docsContent.es;
}

