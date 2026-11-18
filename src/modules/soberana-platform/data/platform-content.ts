import { useLingui } from '@lingui/react/macro';
import {
  ArrowLeftRight,
  ArrowUpRight,
  Zap,
  Layers,
  Sparkles,
  Globe,
  Building2,
  Landmark,
  Wallet,
  Vault,
  Webhook,
  Brain,
  Users,
  Briefcase,
  CreditCard,
  TrendingUp,
  DollarSign,
  Rocket,
  MapPin,
  CheckCircle,
} from '@/shared/components/animated-icons';
import type {
  ClientTypeInfo,
  ProductModule,
  ComparisonRow,
  FlowStep,
  PlatformMetric,
  RegionalCountry,
  PlatformNavSection,
  ProductCategory,
} from '../types/platform.types';

export const SECTION_IDS = [
  'hero', 'metrics', 'comparison', 'products', 'how-it-works', 'clients', 'coverage', 'cta',
] as const;

export const REGIONAL_COUNTRIES: RegionalCountry[] = [
  {
    name: 'Brazil',
    flag: '🇧🇷',
    status: 'live',
    capabilities: ['Pix', 'TED/TEF', 'On/Off Ramp', 'Cross-Border', 'Cards'],
  },
  {
    name: 'Colombia',
    flag: '🇨🇴',
    status: 'live',
    capabilities: ['Bre-B', 'PSE', 'Cross-Border', 'FX Engine', 'Pay-in/out'],
  },
  {
    name: 'Peru',
    flag: '🇵🇪',
    status: 'live',
    capabilities: ['Interbank', 'BCRP Rails', 'Cross-Border', 'Wallet Engine'],
  },
  {
    name: 'Ecuador',
    flag: '🇪🇨',
    status: 'live',
    capabilities: ['SPI', 'Cross-Border', 'USD Settlement', 'Pay-in/out'],
  },
  {
    name: 'Mexico',
    flag: '🇲🇽',
    status: 'coming-soon',
    capabilities: ['SPEI', 'CoDi', 'Cross-Border', 'On/Off Ramp'],
  },
  {
    name: 'Chile',
    flag: '🇨🇱',
    status: 'coming-soon',
    capabilities: ['TEF', 'Fintoc', 'Cross-Border', 'FX Engine'],
  },
  {
    name: 'United States',
    flag: '🇺🇸',
    status: 'live',
    capabilities: ['ACH', 'FedWire', 'SWIFT', 'USD Settlement'],
  },
  {
    name: 'European Union',
    flag: '🇪🇺',
    status: 'coming-soon',
    capabilities: ['SEPA', 'EUR Settlement', 'Cross-Border'],
  },
];

export function usePlatformContent() {
  const { t } = useLingui();

  const NAV_SECTIONS: PlatformNavSection[] = [
    { id: 'hero', label: t`Overview`, anchor: '#hero', icon: Rocket },
    { id: 'metrics', label: t`By the Numbers`, anchor: '#metrics', icon: TrendingUp },
    { id: 'comparison', label: t`Before vs After`, anchor: '#comparison', icon: ArrowLeftRight },
    { id: 'products', label: t`Products`, anchor: '#products', icon: Layers },
    { id: 'how-it-works', label: t`How It Works`, anchor: '#how-it-works', icon: Zap },
    { id: 'clients', label: t`For Your Business`, anchor: '#clients', icon: Users },
    { id: 'coverage', label: t`Coverage`, anchor: '#coverage', icon: Globe },
    { id: 'cta', label: t`Get Started`, anchor: '#cta', icon: ArrowUpRight },
  ];

  const CLIENT_TYPES: ClientTypeInfo[] = [
    {
      id: 'banks',
      label: t`Banks`,
      icon: Landmark,
      tagline: t`Launch digital financial services without years of development.`,
      painPoint: t`Building cross-border and digital asset capabilities takes 12–18 months and tens of millions in engineering.`,
      solution: t`Soberana provides a fully regulated, white-label infrastructure. Your brand, our rails. Go live in weeks, not years.`,
    },
    {
      id: 'fintechs',
      label: t`Fintechs`,
      icon: Zap,
      tagline: t`Ship faster. Compete harder. Grow without infrastructure bottlenecks.`,
      painPoint: t`Building payments, FX, and crypto infrastructure from scratch burns runway and delays go-to-market.`,
      solution: t`An API-first platform with modular products. Integrate what you need, skip what you don't. From sandbox to production in days.`,
    },
    {
      id: 'wallets',
      label: t`Wallets`,
      icon: Wallet,
      tagline: t`Unlock cross-border and crypto capabilities without rebuilding your core.`,
      painPoint: t`Wallets locked in local currency lose users to platforms that offer multi-currency and crypto access.`,
      solution: t`Embed on/off ramps, FX engine, and multi-currency accounts. Give your users the global wallet they expect.`,
    },
    {
      id: 'money-movers',
      label: t`Money Movers`,
      icon: ArrowLeftRight,
      tagline: t`Move money cheaper, faster, and with zero manual reconciliation.`,
      painPoint: t`Traditional correspondent banking costs 5–10%. Manual reconciliation eats ops margin. Compliance risk is constant.`,
      solution: t`Dual-rail infrastructure (fiat + crypto), AI-powered reconciliation, and 1% total cost. Real-time settlement, every corridor.`,
    },
    {
      id: 'corporates',
      label: t`Corporates`,
      icon: Briefcase,
      tagline: t`One treasury platform for international operations. Powered by AI.`,
      painPoint: t`Managing multi-currency treasury across LATAM means juggling 4–6 banks, FX losses, and zero cash-flow visibility.`,
      solution: t`Smart Treasury consolidates all your holdings, automates FX hedging, and gives you an AI copilot that understands your finances.`,
    },
  ];

  const PRODUCTS: ProductModule[] = [
    {
      id: 'cross-border',
      label: t`Cross-Border Payments`,
      tagline: t`International payments in seconds, not days.`,
      description: t`Send and receive international payments across 40+ corridors with competitive rates, built-in compliance, and real-time settlement via fiat and crypto rails.`,
      features: [
        t`Dual-rail settlement (SWIFT + Blockchain)`,
        t`Sub-30 second end-to-end delivery`,
        t`Built-in KYC/AML compliance engine`,
        t`Multi-currency support (40+ currencies)`,
        t`Real-time FX pricing and locking`,
      ],
      clientBenefits: {
        banks: t`Offer international remittances without a correspondent banking network.`,
        fintechs: t`Launch cross-border payments as a product in days, not quarters.`,
        'money-movers': t`Replace expensive correspondent relationships with direct rails.`,
        corporates: t`Pay suppliers and receive from clients globally at 1% cost.`,
      },
      category: 'payments',
      icon: Globe,
      badge: 'Core',
    },
    {
      id: 'on-off-ramp',
      label: 'On / Off Ramp',
      tagline: t`Fiat ↔ Crypto conversion. Instant, compliant, embedded.`,
      description: t`Seamlessly convert between fiat currencies and crypto assets. Integrated with leading DeFi protocols, with full compliance and 24/7 liquidity.`,
      features: [
        t`Instant fiat-to-stablecoin conversion`,
        t`Integration with Pix, ACH, Wire for on-ramps`,
        t`USDC, USDT, and multi-chain support`,
        t`Automated KYC at every ramp`,
        t`Institutional liquidity depth`,
      ],
      clientBenefits: {
        fintechs: t`Add crypto rails to your product without building compliance infrastructure.`,
        wallets: t`Give users seamless crypto access without a separate integration.`,
        'money-movers': t`Use stablecoins as settlement layer to cut costs and time.`,
        banks: t`Offer digital asset entry points with full regulatory compliance.`,
      },
      category: 'crypto',
      icon: ArrowLeftRight,
    },
    {
      id: 'pay-in-out',
      label: 'Pay-in / Pay-out',
      tagline: t`Local payment collection and disbursement at scale.`,
      description: t`Accept and send money through local payment methods in every market. Pix, ACH, FedWire, Bre-B, SEPA — with guaranteed settlement and automated reconciliation.`,
      features: [
        'Pix (Brazil), ACH/FedWire (USA)',
        'Bre-B (Colombia), SEPA (Europe)',
        t`Virtual accounts per client/transaction`,
        t`Guaranteed settlement SLAs`,
        t`AI-powered reconciliation engine`,
      ],
      clientBenefits: {
        fintechs: t`Collect and disburse in local currency without local banking relationships.`,
        corporates: t`Pay employees and suppliers locally in every market you operate.`,
        banks: t`White-label local payment collection as a service.`,
        'money-movers': t`Replace manual disbursement with automated, real-time payouts.`,
      },
      category: 'payments',
      icon: ArrowUpRight,
      badge: 'New',
    },
    {
      id: 'fx-engine',
      label: 'FX Engine',
      tagline: t`Real-time FX with institutional pricing and crypto flexibility.`,
      description: t`A high-performance foreign exchange engine combining traditional FX markets with crypto settlement optionality. Lock rates, hedge exposure, and settle in the currency of choice.`,
      features: [
        t`Real-time multi-pair pricing`,
        t`Rate locking (up to 72h)`,
        t`Fiat and stablecoin settlement`,
        t`Automated hedging rules`,
        t`Full audit trail and reporting`,
      ],
      clientBenefits: {
        banks: t`Offer FX as a value-added service to corporate clients.`,
        fintechs: t`Embed FX conversion without a treasury desk.`,
        corporates: t`Eliminate FX loss on LATAM operations with automated hedging.`,
        wallets: t`Offer instant multi-currency conversion to wallet holders.`,
      },
      category: 'payments',
      icon: TrendingUp,
    },
    {
      id: 'cards',
      label: t`Cards`,
      tagline: t`Corporate cards with real-time controls and yield generation.`,
      description: t`Virtual and physical corporate cards under your brand. Card Pro generates automatic yields on idle balances. Full spend control, limit management, and white-label issuance.`,
      features: [
        t`Virtual + physical card issuance`,
        t`White-label with client branding`,
        t`Card Pro: automatic yield on idle balances`,
        t`Real-time spend controls and limits`,
        t`Instant card creation via API`,
      ],
      clientBenefits: {
        banks: t`Launch a corporate card program without a card issuer relationship.`,
        fintechs: t`Embed branded cards into your product in days.`,
        wallets: t`Debit card linked to wallet balances, including stablecoin spend.`,
        corporates: t`Issue cards to all employees with centralized spend visibility.`,
      },
      category: 'banking',
      icon: CreditCard,
    },
    {
      id: 'wallet',
      label: 'Wallet (B2B2C)',
      tagline: t`A full-featured digital wallet engine, under your brand.`,
      description: t`Deploy a complete white-label digital wallet for your end users. Multi-currency, crypto-enabled, with debit card, inflation protection via stablecoins, and full B2B2C architecture.`,
      features: [
        t`Multi-currency wallet with crypto support`,
        t`Linked debit card for everyday spending`,
        t`Stablecoin balance for inflation protection`,
        t`Crypto-to-fiat spend at point of sale`,
        t`White-label UI kit included`,
      ],
      clientBenefits: {
        banks: t`Offer a modern digital wallet without internal development.`,
        fintechs: t`Wallet-as-a-service for your end users, fully branded.`,
        wallets: t`Complete engine with ramps, FX, and card — all integrated.`,
        'money-movers': t`Give recipients a wallet to hold, spend, or convert funds.`,
      },
      category: 'banking',
      icon: Wallet,
    },
    {
      id: 'loopay-account',
      label: 'Loopay Account (B2B)',
      tagline: t`The business account built for the global economy.`,
      description: t`A corporate account that holds fiat and digital assets together. Manage treasury, pay globally, integrate with ERP systems, and access Soberana's full product suite from a single account.`,
      features: [
        t`Multi-currency holdings (fiat + crypto)`,
        t`Direct ERP integrations (SAP, Oracle)`,
        t`Corporate treasury management tools`,
        t`Role-based access and approval flows`,
        t`Real-time balance and transaction reporting`,
      ],
      clientBenefits: {
        banks: t`Corporate digital accounts with integrated treasury intelligence.`,
        fintechs: t`Accounts-as-a-service for your business clients.`,
        corporates: t`One account that consolidates all your global financial operations.`,
      },
      category: 'banking',
      icon: Building2,
    },
    {
      id: 'smart-treasury',
      label: 'Smart Treasury',
      tagline: t`AI-powered treasury that optimizes itself.`,
      description: t`An intelligent treasury layer that monitors liquidity, minimizes FX exposure, and predicts cash flow automatically. Includes an AI Copilot that explains every decision in plain language.`,
      features: [
        t`Real-time liquidity optimization`,
        t`AI-driven FX risk minimization`,
        t`Predictive cash-flow forecasting`,
        t`Automated rebalancing rules`,
        'Finance AI Copilot (Soberana OS)',
      ],
      clientBenefits: {
        banks: t`Offer AI-powered treasury management as a premium service.`,
        fintechs: t`Differentiate with AI treasury as a built-in feature.`,
        corporates: t`Stop losing value to currency devaluations. Automate everything.`,
      },
      category: 'intelligence',
      icon: Brain,
      badge: 'AI',
    },
    {
      id: 'vaults',
      label: 'Vaults',
      tagline: t`Institutional-grade custody for digital assets.`,
      description: t`Military-grade custody infrastructure for digital assets. Designed for institutional clients needing secure, flexible access with staking, yield optimization, and full auditability.`,
      features: [
        t`MPC and HSM-based key management`,
        t`Multi-signature approval workflows`,
        t`On-demand access with zero custody lock-in`,
        t`Staking and yield optimization`,
        t`Real-time on-chain monitoring and alerts`,
      ],
      clientBenefits: {
        banks: t`Regulated crypto custody for institutional client assets.`,
        fintechs: t`Vault-as-a-service with enterprise-grade security.`,
        wallets: t`Backend custody infrastructure without building crypto ops.`,
      },
      category: 'crypto',
      icon: Vault,
    },
    {
      id: 'api-connectors',
      label: 'API & Connectors',
      tagline: t`Integration that takes days, not months.`,
      description: t`A marketplace of pre-built connectors and a production-ready API platform. REST, GraphQL, webhooks, and SDKs — all designed for rapid integration with enterprise systems.`,
      features: [
        'REST API + GraphQL',
        t`Real-time webhooks for every event`,
        'SDKs: JS, Python, Go, Ruby',
        t`Pre-built ERP connectors (SAP, Oracle, Netsuite)`,
        t`Sandbox environment with synthetic data`,
      ],
      clientBenefits: {
        banks: t`Connect Soberana to your core banking system via pre-built adapters.`,
        fintechs: t`API-first design: production-ready in days from the sandbox.`,
        corporates: t`Plug directly into SAP or Oracle. No custom integration needed.`,
      },
      category: 'intelligence',
      icon: Webhook,
    },
    {
      id: 'ai-suite',
      label: 'AI Suite',
      tagline: t`Soberana OS: the financial AI that works for your business.`,
      description: t`A suite of AI-powered financial tools including automated reconciliation, real-time fraud detection, cash-flow prediction, and an AI Copilot that you can talk to about your finances.`,
      features: [
        t`Automated transaction reconciliation (MCP)`,
        t`Real-time fraud detection with <50ms response`,
        t`Personalized cash-flow forecasting models`,
        t`Finance Copilot: chat with your financial data`,
        t`Anomaly detection and smart alerts`,
      ],
      clientBenefits: {
        banks: t`Automate compliance, reconciliation, and fraud detection at scale.`,
        fintechs: t`Ship AI-powered financial features without an ML team.`,
        corporates: t`A finance copilot that reduces analyst workload by 60%.`,
      },
      category: 'intelligence',
      icon: Sparkles,
      badge: 'AI',
    },
  ];

  const COMPARISON_ROWS: ComparisonRow[] = [
    {
      dimension: t`Time to market`,
      before: t`12–18 months of development`,
      after: t`Live in weeks with white-label integration`,
    },
    {
      dimension: t`Infrastructure cost`,
      before: t`$5M–$15M in engineering and licensing`,
      after: t`SaaS pricing, zero infrastructure CAPEX`,
    },
    {
      dimension: t`Transaction cost`,
      before: t`5–10% via correspondent banking`,
      after: t`~1% all-in with dual-rail infrastructure`,
    },
    {
      dimension: t`Compliance`,
      before: t`Custom KYC/AML, manual review, legal uncertainty`,
      after: t`Built-in compliance engine, PCI certified, PSP licensed`,
    },
    {
      dimension: t`FX management`,
      before: t`Manual hedging, treasury desk required`,
      after: t`Automated AI hedging with real-time optimization`,
    },
    {
      dimension: t`Reconciliation`,
      before: t`Days of manual spreadsheet work`,
      after: t`AI reconciliation, zero human intervention`,
    },
    {
      dimension: t`Crypto / digital assets`,
      before: t`Not available or months to integrate`,
      after: t`On/Off ramp, vaults, and stablecoins — day one`,
    },
    {
      dimension: t`Analytics`,
      before: t`Fragmented data across 4–6 providers`,
      after: t`Unified dashboard with AI-driven insights`,
    },
  ];

  const FLOW_STEPS: FlowStep[] = [
    {
      step: 1,
      title: t`Connect`,
      description: t`Integrate via REST API or our pre-built connectors. Your sandbox environment is ready in under 10 minutes. No infrastructure setup required.`,
      duration: t`Day 1`,
      icon: Webhook,
    },
    {
      step: 2,
      title: t`Configure`,
      description: t`Select the modules you need. Apply your brand identity with our white-label kit. Set compliance rules, FX policies, and notification workflows.`,
      duration: t`Week 1`,
      icon: Layers,
    },
    {
      step: 3,
      title: t`Go Live`,
      description: t`Deploy to production. Your users see your brand. Soberana's infrastructure operates silently underneath — fully managed, always compliant.`,
      duration: t`Week 2–4`,
      icon: CheckCircle,
    },
  ];

  const PLATFORM_METRICS: PlatformMetric[] = [
    {
      id: 'volume',
      value: '600',
      prefix: '+$',
      suffix: 'M',
      label: t`USD Moved`,
      description: t`Total payment volume processed on Soberana infrastructure`,
      accent: 'primary',
      icon: DollarSign,
    },
    {
      id: 'market',
      value: '108K',
      label: t`Target Enterprises (LatAm SOM)`,
      description: t`Companies in our serviceable obtainable market across Brazil, Colombia, Peru, and Ecuador`,
      accent: 'success',
      icon: Building2,
    },
    {
      id: 'cost',
      value: '~1%',
      label: t`Total Transaction Cost`,
      description: t`vs. 5–10% via traditional correspondent banking`,
      accent: 'warning',
      icon: TrendingUp,
    },
    {
      id: 'ltv',
      value: '$100K',
      label: t`Client LTV`,
      description: t`Average lifetime value per enterprise client. CAC: $650. Gross Margin: 60%.`,
      accent: 'accent',
      icon: Sparkles,
    },
    {
      id: 'tam',
      value: '$7.79T',
      label: t`Global TAM`,
      description: t`Total addressable market for cross-border B2B payments globally`,
      accent: 'primary',
      icon: Globe,
    },
    {
      id: 'sam',
      value: '$3.1T',
      label: 'SAM — The Americas',
      description: t`Serviceable addressable market across North and South America`,
      accent: 'success',
      icon: MapPin,
    },
  ];

  const HERO_STATS = [
    { value: '40+', label: t`Payment corridors` },
    { value: '<30s', label: t`Settlement time` },
    { value: '11', label: t`Modular products` },
    { value: '4', label: t`Countries live` },
  ];

  const CATEGORY_LABELS: Record<ProductCategory, string> = {
    payments: t`Payments`,
    banking: t`Banking`,
    crypto: t`Crypto`,
    intelligence: t`Intelligence`,
  };

  const CATEGORY_FILTERS: Array<{ id: ProductCategory | 'all'; label: string }> = [
    { id: 'all', label: t`All Products` },
    { id: 'payments', label: t`Payments` },
    { id: 'banking', label: t`Banking` },
    { id: 'crypto', label: t`Crypto` },
    { id: 'intelligence', label: t`Intelligence` },
  ];

  return {
    NAV_SECTIONS,
    CLIENT_TYPES,
    PRODUCTS,
    COMPARISON_ROWS,
    FLOW_STEPS,
    PLATFORM_METRICS,
    HERO_STATS,
    CATEGORY_LABELS,
    CATEGORY_FILTERS,
  };
}
