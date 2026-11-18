/**
 * Documentation Sidebar Content
 * 
 * Contains navigation structures for both general docs and API reference.
 */

// ============================================
// GENERAL DOCUMENTATION (DocsLayout)
// ============================================

export type Language = 'en' | 'es';

export interface SidebarContent {
  title: string;
  items: {
    title: string;
    href: string;
  }[];
}

export const sidebarContent: Record<Language, SidebarContent> = {
  es: {
    title: "Manifiesto v2",
    items: [
      { title: "El sistema está roto", href: "#el-problema" },
      { title: "El dinero no descansa", href: "#la-promesa" },
      { title: "Sobre la soberanía", href: "#soberania" },
      { title: "Una arquitectura, tres pilares", href: "#la-arquitectura" },
      { title: "Los instrumentos", href: "#los-instrumentos" },
      { title: "El horizonte técnico", href: "#el-horizonte-tecnico" },
      { title: "El diseño como principio", href: "#el-diseno" },
      { title: "A quién hablamos", href: "#audiencias" },
      { title: "2030", href: "#el-futuro" },
    ],
  },
  en: {
    title: "Manifesto v2",
    items: [
      { title: "The system is broken", href: "#el-problema" },
      { title: "Money never rests", href: "#la-promesa" },
      { title: "On sovereignty", href: "#soberania" },
      { title: "One architecture, three pillars", href: "#la-arquitectura" },
      { title: "The instruments", href: "#los-instrumentos" },
      { title: "The technical horizon", href: "#el-horizonte-tecnico" },
      { title: "Design as principle", href: "#el-diseno" },
      { title: "Who we speak to", href: "#audiencias" },
      { title: "2030", href: "#el-futuro" },
    ],
  },

};

export function getSidebarContent(language: Language): SidebarContent {
  return sidebarContent[language] || sidebarContent.en;
}

// ============================================
// VAULTS DOCUMENTATION SIDEBAR
// ============================================

export interface DocsSidebarSection {
  title: string;
  items: {
    title: string;
    href: string;
  }[];
}

const vaultsSidebarContent: Record<Language, DocsSidebarSection[]> = {
  en: [
    {
      title: 'VAULTS',
      items: [
        { title: 'The Vault Architecture', href: '#vault-architecture' },
        { title: 'How It Works', href: '#how-it-works' },
        { title: 'Strategy Engine', href: '#strategy-engine' },
        { title: 'Fees', href: '#fees' },
        { title: 'Risks & Safeguards', href: '#risks' },
        { title: 'Example', href: '#example' },
        { title: 'FAQ', href: '#faq' },
        { title: 'Glossary', href: '#glossary' },
      ],
    },
    {
      title: '',
      items: [
        { title: '← Back to Docs', href: '/docs' },
      ],
    },
  ],
  es: [
    {
      title: 'VAULTS',
      items: [
        { title: 'Arquitectura del Vault', href: '#vault-architecture' },
        { title: 'Cómo Funciona', href: '#how-it-works' },
        { title: 'Motor de Estrategia', href: '#strategy-engine' },
        { title: 'Fees', href: '#fees' },
        { title: 'Riesgos y Salvaguardas', href: '#risks' },
        { title: 'Ejemplo', href: '#example' },
        { title: 'Preguntas Frecuentes', href: '#faq' },
        { title: 'Glosario', href: '#glossary' },
      ],
    },
    {
      title: '',
      items: [
        { title: '← Volver a Docs', href: '/docs' },
      ],
    },
  ],
};

export function getVaultsSidebarSections(language: Language): DocsSidebarSection[] {
  return vaultsSidebarContent[language] || vaultsSidebarContent.en;
}

// ============================================
// SOVY DOCUMENTATION SIDEBAR
// ============================================

const sovySidebarContent: Record<Language, DocsSidebarSection[]> = {
  en: [
    {
      title: 'ZENTINEL',
      items: [
        { title: 'Overview', href: '#overview' },
        { title: 'What Can Zentinel Do?', href: '#capabilities' },
        { title: 'See it in Action', href: '#see-it-in-action' },
        { title: 'How it Works', href: '#how-it-works' },
        { title: 'Zentinel + Vaults', href: '#sovy-vaults' },
        { title: 'Zentinel + Payments', href: '#sovy-payments' },
        { title: 'Tool System', href: '#tools' },
        { title: 'Security & Privacy', href: '#security' },
        { title: "What's Coming", href: '#roadmap' },
        { title: 'FAQ', href: '#faq' },
      ],
    },
    {
      title: '',
      items: [
        { title: '← Back to Docs', href: '/docs' },
      ],
    },
  ],
  es: [
    {
      title: 'ZENTINEL',
      items: [
        { title: 'Descripción General', href: '#overview' },
        { title: '¿Qué puede hacer?', href: '#capabilities' },
        { title: 'Míralo en Acción', href: '#see-it-in-action' },
        { title: 'Cómo Funciona', href: '#how-it-works' },
        { title: 'Zentinel + Vaults', href: '#sovy-vaults' },
        { title: 'Zentinel + Pagos', href: '#sovy-payments' },
        { title: 'Sistema de Herramientas', href: '#tools' },
        { title: 'Seguridad y Privacidad', href: '#security' },
        { title: 'Próximamente', href: '#roadmap' },
        { title: 'FAQ', href: '#faq' },
      ],
    },
    {
      title: '',
      items: [
        { title: '← Volver a Docs', href: '/docs' },
      ],
    },
  ],
};

export function getSovySidebarSections(language: Language): DocsSidebarSection[] {
  return sovySidebarContent[language] || sovySidebarContent.en;
}

// ============================================
// AMAZONAS + SOBERANA SIDEBAR
// ============================================

const amazonasSoberanaSidebarContent: Record<Language, DocsSidebarSection[]> = {
  en: [
    {
      title: 'AMAZONAS + SOBERANA',
      items: [
        { title: 'Hero', href: '#hero' },
        { title: 'Integration Map', href: '#integration-map' },
        { title: 'Flow: Core ↔ Soberana', href: '#flow-core-soberana' },
        { title: 'Flow: Vaults Investment', href: '#flow-vaults' },
        { title: 'Flow: Zentinel in Action', href: '#flow-sovy' },
        { title: 'Flow: Roadmap Timeline', href: '#flow-roadmap-visual' },
        { title: 'Roadmap', href: '#roadmap' },
        { title: 'Zentinel Integration', href: '#sovy-integration' },
        { title: 'Vaults Integration', href: '#vaults-integration' },
        { title: 'Global Scalability', href: '#scalability' },
        { title: 'Contact', href: '#contact' },
      ],
    },
    {
      title: '',
      items: [
        { title: '← Back to Docs', href: '/docs' },
      ],
    },
  ],
  es: [
    {
      title: 'AMAZONAS + SOBERANA',
      items: [
        { title: 'Presentación', href: '#hero' },
        { title: 'Mapa de Integración', href: '#integration-map' },
        { title: 'Flujo: Core ↔ Soberana', href: '#flow-core-soberana' },
        { title: 'Flujo: Inversión Vaults', href: '#flow-vaults' },
        { title: 'Flujo: Zentinel en acción', href: '#flow-sovy' },
        { title: 'Flujo: Roadmap visual', href: '#flow-roadmap-visual' },
        { title: 'Roadmap', href: '#roadmap' },
        { title: 'Integración Zentinel', href: '#sovy-integration' },
        { title: 'Integración Vaults', href: '#vaults-integration' },
        { title: 'Escalabilidad Global', href: '#scalability' },
        { title: 'Contacto', href: '#contact' },
      ],
    },
    {
      title: '',
      items: [
        { title: '← Volver a Docs', href: '/docs' },
      ],
    },
  ],
};

export function getAmazonasSoberanaSidebarSections(language: Language): DocsSidebarSection[] {
  return amazonasSoberanaSidebarContent[language] || amazonasSoberanaSidebarContent.en;
}

// ============================================
// SOBERANA VAULTS DOCUMENTATION SIDEBAR
// ============================================

const soberanaVaultsSidebarContent: Record<Language, DocsSidebarSection[]> = {
  es: [
    {
      title: 'SOBERANA VAULTS',
      items: [
        { title: 'Hero', href: '#hero' },
        { title: '¿Qué es un Vault?', href: '#what-is-a-vault' },
        { title: '¿Cómo funciona?', href: '#how-it-works' },
        { title: 'Motor de Estrategia', href: '#strategy-engine' },
        { title: 'Stack Tecnológico', href: '#tech-stack' },
        { title: 'Dashboard en Vivo', href: '#live-dashboard' },
        { title: 'El Journey', href: '#journey-timeline' },
        { title: 'Deep Dive Técnico', href: '#technical-deep-dive' },
        { title: 'Proyección de Crecimiento', href: '#growth-projection' },
        { title: 'Riesgos y Salvaguardas', href: '#risks-safeguards' },
        { title: 'Estructura de Fees', href: '#fees-breakdown' },
        { title: 'FAQ', href: '#faq' },
      ],
    },
    {
      title: '',
      items: [
        { title: '← Volver a Docs', href: '/docs' },
      ],
    },
  ],
  en: [
    {
      title: 'SOBERANA VAULTS',
      items: [
        { title: 'Hero', href: '#hero' },
        { title: 'What is a Vault?', href: '#what-is-a-vault' },
        { title: 'How It Works', href: '#how-it-works' },
        { title: 'Strategy Engine', href: '#strategy-engine' },
        { title: 'Tech Stack', href: '#tech-stack' },
        { title: 'Live Dashboard', href: '#live-dashboard' },
        { title: 'The Journey', href: '#journey-timeline' },
        { title: 'Technical Deep Dive', href: '#technical-deep-dive' },
        { title: 'Growth Projection', href: '#growth-projection' },
        { title: 'Risks & Safeguards', href: '#risks-safeguards' },
        { title: 'Fees Breakdown', href: '#fees-breakdown' },
        { title: 'FAQ', href: '#faq' },
      ],
    },
    {
      title: '',
      items: [
        { title: '← Back to Docs', href: '/docs' },
      ],
    },
  ],
};

export function getSoberanaVaultsSidebarSections(language: Language): DocsSidebarSection[] {
  return soberanaVaultsSidebarContent[language] || soberanaVaultsSidebarContent.es;
}

// ============================================
// API DOCUMENTATION (ApiDocsLayout)
// ============================================

export interface ApiSidebarSection {
  /**
   * Section title (e.g., "GETTING STARTED", "CUSTOMERS")
   */
  title: string;
  
  /**
   * HTTP method badge for endpoint items (optional)
   */
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  
  /**
   * Navigation items within this section
   */
  items: {
    /**
     * Display title
     */
    title: string;
    
    /**
     * Route path
     */
    href: string;
    
    /**
     * HTTP method for this specific endpoint (overrides section method)
     */
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  }[];
}

/**
 * Complete API sidebar structure
 * 
 * Organized exactly as shown in Lumx.io reference:
 * https://docs.lumx.io/api-reference/customers/read-all-customers
 */
export const apiSidebarSections: ApiSidebarSection[] = [
  // ============================================
  // GETTING STARTED
  // ============================================
  {
    title: 'GETTING STARTED',
    items: [
      { 
        title: 'Introduction', 
        href: '/globalconnectors/api' 
      },
      { 
        title: 'Authentication', 
        href: '/globalconnectors/api/authentication' 
      },
      { 
        title: 'Errors', 
        href: '/globalconnectors/api/errors' 
      },
      { 
        title: 'Idempotency', 
        href: '/globalconnectors/api/idempotency' 
      },
      { 
        title: 'Rate Limits', 
        href: '/globalconnectors/api/rate-limits' 
      },
    ],
  },

  // ============================================
  // CUSTOMERS
  // ============================================
  {
    title: 'CUSTOMERS',
    items: [
      { 
        title: 'Read all customers', 
        href: '/globalconnectors/api/customers/list',
        method: 'GET'
      },
      { 
        title: 'Create a customer', 
        href: '/globalconnectors/api/customers/create',
        method: 'POST'
      },
      { 
        title: 'Read a customer', 
        href: '/globalconnectors/api/customers/get',
        method: 'GET'
      },
      { 
        title: 'Read a verification', 
        href: '/globalconnectors/api/customers/verification',
        method: 'GET'
      },
    ],
  },

  // ============================================
  // BANK ACCOUNTS
  // ============================================
  {
    title: 'BANK ACCOUNTS',
    items: [
      { 
        title: 'Read all bank accounts', 
        href: '/globalconnectors/api/bank-accounts/list',
        method: 'GET'
      },
      { 
        title: 'Create a bank account', 
        href: '/globalconnectors/api/bank-accounts/create',
        method: 'POST'
      },
      { 
        title: 'Read a bank account', 
        href: '/globalconnectors/api/bank-accounts/get',
        method: 'GET'
      },
    ],
  },

  // ============================================
  // EXCHANGE RATES
  // ============================================
  {
    title: 'EXCHANGE RATES',
    items: [
      { 
        title: 'Get an exchange rate', 
        href: '/globalconnectors/api/exchange-rates/get',
        method: 'POST'
      },
    ],
  },

  // ============================================
  // TRANSACTIONS
  // ============================================
  {
    title: 'TRANSACTIONS',
    items: [
      { 
        title: 'Read all transactions', 
        href: '/globalconnectors/api/transactions/list',
        method: 'GET'
      },
      { 
        title: 'Read a transaction', 
        href: '/globalconnectors/api/transactions/get',
        method: 'GET'
      },
      { 
        title: 'On-ramp', 
        href: '/globalconnectors/api/transactions/on-ramp',
        method: 'POST'
      },
      { 
        title: 'Off-ramp', 
        href: '/globalconnectors/api/transactions/off-ramp',
        method: 'POST'
      },
      { 
        title: 'Transfer', 
        href: '/globalconnectors/api/transactions/transfer',
        method: 'POST'
      },
    ],
  },

  // ============================================
  // PARTNER FEES
  // ============================================
  {
    title: 'PARTNER FEES',
    items: [
      { 
        title: 'Read all partner fees', 
        href: '/globalconnectors/api/partner-fees/list',
        method: 'GET'
      },
      { 
        title: 'Create a partner fee', 
        href: '/globalconnectors/api/partner-fees/create',
        method: 'POST'
      },
      { 
        title: 'Read a partner fee', 
        href: '/globalconnectors/api/partner-fees/get',
        method: 'GET'
      },
    ],
  },

  // ============================================
  // WEBHOOKS
  // ============================================
  {
    title: 'WEBHOOKS',
    items: [
      { 
        title: 'Overview', 
        href: '/globalconnectors/api/webhooks' 
      },
      { 
        title: 'Event Types', 
        href: '/globalconnectors/api/webhooks/events' 
      },
    ],
  },

  // ============================================
  // CHANGELOG (No section, standalone)
  // ============================================
  {
    title: 'CHANGELOG',
    items: [
      { 
        title: 'Changelog', 
        href: '/globalconnectors/api/changelog' 
      },
    ],
  },
];

/**
 * Get flattened list of all API routes for navigation utilities
 */
export function getAllApiRoutes(): string[] {
  return apiSidebarSections.flatMap(section => 
    section.items.map(item => item.href)
  );
}

/**
 * Get previous and next routes for pagination navigation
 */
export function getAdjacentRoutes(currentPath: string): {
  previous: { title: string; href: string } | null;
  next: { title: string; href: string } | null;
} {
  const allRoutes: Array<{ title: string; href: string }> = [];
  
  // Flatten all routes
  apiSidebarSections.forEach(section => {
    section.items.forEach(item => {
      allRoutes.push({ title: item.title, href: item.href });
    });
  });
  
  const currentIndex = allRoutes.findIndex(route => route.href === currentPath);
  
  return {
    previous: currentIndex > 0 ? allRoutes[currentIndex - 1] : null,
    next: currentIndex < allRoutes.length - 1 ? allRoutes[currentIndex + 1] : null,
  };
}

