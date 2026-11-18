/**
 * Amazonas + Soberana page content (ES/EN)
 * Hero, integration map, roadmap, Sovy/Vaults integration, scalability, CTA.
 */

import type { Language } from './sidebar-content';

export interface AmazonasSoberanaContent {
  hero: {
    title: string;
    subtitle: string;
    tagline: string;
    fomo: string;
  };
  integrationMap: {
    title: string;
    core: string;
    layer: string;
    soberana: string;
  };
  roadmap: {
    title: string;
    phase0: { title: string; desc: string; deliverables: string[] };
    phase1: { title: string; desc: string; deliverables: string[] };
    phase2: { title: string; desc: string; deliverables: string[] };
    phase3: { title: string; desc: string; deliverables: string[] };
  };
  sovy: {
    title: string;
    body: string;
  };
  vaults: {
    title: string;
    body: string;
  };
  scalability: {
    title: string;
    body: string;
  };
  contact: {
    title: string;
    sub: string;
    teamHeading: string;
    chatWhatsApp: string;
  };
  flows: {
    flow1Title: string;
    flow2Title: string;
    flow3Title: string;
    flow4Title: string;
  };
}

const content: Record<Language, AmazonasSoberanaContent> = {
  es: {
    hero: {
      title: 'Amazonas + Soberana',
      subtitle: 'La alianza que llevará la banca de Ecuador y LATAM al futuro',
      tagline: 'Banca Personal y Empresarial que hace más fácil tu vida. Calificación AA+ (Class International Rating).',
      fomo: 'El primer banco en adoptar esta tecnología tendrá ventaja insuperable. Banco Amazonas puede ser ese banco.',
    },
    integrationMap: {
      title: 'Mapa de integración',
      core: 'Core bancario',
      layer: 'Capa de integración',
      soberana: 'Soberana (Zentinel + Vaults)',
    },
    roadmap: {
      title: 'Roadmap 3–4 meses',
      phase0: {
        title: 'Fase 0 — Discovery & API',
        desc: 'Semanas 1-2. Mapeo de core bancario, definición de APIs, PoC Zentinel con datos mock.',
        deliverables: ['Mapeo de core bancario', 'Definición de APIs', 'PoC Zentinel'],
      },
      phase1: {
        title: 'Fase 1 — Conectores',
        desc: 'Semanas 3-6. Integración Bridge.xyz (KYC, wallets), Pay-in/Pay-out, Zentinel con datos reales.',
        deliverables: ['Bridge.xyz (KYC, wallets)', 'Pay-in/Pay-out', 'Zentinel datos reales'],
      },
      phase2: {
        title: 'Fase 2 — Vaults & Yield',
        desc: 'Semanas 7-10. Despliegue Vaults Soberana, integración con core, dashboard.',
        deliverables: ['Vaults Soberana', 'Integración core', 'Dashboard'],
      },
      phase3: {
        title: 'Fase 3 — Go-Live',
        desc: 'Semanas 11-14. Producción, monitoreo, optimización, escalabilidad.',
        deliverables: ['Producción', 'Monitoreo', 'Escalabilidad'],
      },
    },
    sovy: {
      title: 'Cómo se integra Zentinel',
      body: 'Zentinel se conecta al core y a los sistemas de tesorería para ofrecer inteligencia conversacional, ejecución de órdenes y visibilidad en tiempo real. Los equipos de Banco Amazonas podrán consultar posiciones, riesgos y ejecutar acciones mediante lenguaje natural.',
    },
    vaults: {
      title: 'Cómo se integran los Vaults',
      body: 'Los Vaults de Soberana gestionan liquidez de forma autónoma con estrategias de yield institucional. Se integran con las cuentas y productos del banco para optimizar rendimientos sin alterar la experiencia del cliente ni la regulación vigente.',
    },
    scalability: {
      title: 'Proyección de escalabilidad global',
      body: 'La arquitectura Soberana está diseñada para escalar de Ecuador a toda LATAM y más allá. Misma tecnología, mismos estándares de seguridad y cumplimiento, con capacidad de adaptación local por país y regulador.',
    },
    contact: {
      title: 'Agenda una cita con los fundadores que van a transformar el futuro de la banca',
      sub: 'Conversemos sobre la alianza Amazonas + Soberana. Elige con quién agendar:',
      teamHeading: '',
      chatWhatsApp: 'Agendar cita por WhatsApp',
    },
    flows: {
      flow1Title: 'Integración Core ↔ Soberana',
      flow2Title: 'Flujo de inversión en Vaults (cliente final)',
      flow3Title: 'Zentinel en acción (tesorería)',
      flow4Title: 'Roadmap visual',
    },
  },
  en: {
    hero: {
      title: 'Amazonas + Soberana',
      subtitle: 'The partnership that will take banking in Ecuador and LATAM into the future',
      tagline: 'Personal and Business Banking that makes your life easier. AA+ Rating (Class International Rating).',
      fomo: 'The first bank to adopt this technology will have an unbeatable advantage. Banco Amazonas can be that bank.',
    },
    integrationMap: {
      title: 'Integration map',
      core: 'Banking core',
      layer: 'Integration layer',
      soberana: 'Soberana (Zentinel + Vaults)',
    },
    roadmap: {
      title: '3–4 month roadmap',
      phase0: {
        title: 'Phase 0 — Discovery & API',
        desc: 'Weeks 1-2. Core banking mapping, API definition, Zentinel PoC with mock data.',
        deliverables: ['Core mapping', 'API definition', 'Zentinel PoC'],
      },
      phase1: {
        title: 'Phase 1 — Connectors',
        desc: 'Weeks 3-6. Bridge.xyz integration (KYC, wallets), Pay-in/Pay-out, Zentinel with real data.',
        deliverables: ['Bridge.xyz (KYC, wallets)', 'Pay-in/Pay-out', 'Zentinel real data'],
      },
      phase2: {
        title: 'Phase 2 — Vaults & Yield',
        desc: 'Weeks 7-10. Soberana Vaults deployment, core integration, dashboard.',
        deliverables: ['Soberana Vaults', 'Core integration', 'Dashboard'],
      },
      phase3: {
        title: 'Phase 3 — Go-Live',
        desc: 'Weeks 11-14. Production, monitoring, optimization, scale.',
        deliverables: ['Production', 'Monitoring', 'Scale'],
      },
    },
    sovy: {
      title: 'How Zentinel integrates',
      body: 'Zentinel connects to the core and treasury systems to deliver conversational intelligence, order execution, and real-time visibility. Banco Amazonas teams will be able to query positions, risks, and execute actions using natural language.',
    },
    vaults: {
      title: 'How Vaults integrate',
      body: 'Soberana Vaults manage liquidity autonomously with institutional-grade yield strategies. They integrate with the bank\'s accounts and products to optimize returns without changing the customer experience or existing regulation.',
    },
    scalability: {
      title: 'Global scalability outlook',
      body: 'The Soberana architecture is designed to scale from Ecuador to all of LATAM and beyond. Same technology, same security and compliance standards, with the ability to adapt locally by country and regulator.',
    },
    contact: {
      title: 'Schedule a call with the founders who will transform the future of banking',
      sub: 'Let\'s talk about the Amazonas + Soberana partnership. Choose who to schedule with:',
      teamHeading: '',
      chatWhatsApp: 'Schedule via WhatsApp',
    },
    flows: {
      flow1Title: 'Core ↔ Soberana integration',
      flow2Title: 'Vaults investment flow (end client)',
      flow3Title: 'Zentinel in action (treasury)',
      flow4Title: 'Visual roadmap',
    },
  },
};

export function getAmazonasSoberanaContent(lang: Language): AmazonasSoberanaContent {
  return content[lang] ?? content.en;
}
