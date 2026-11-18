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
  type LucideIcon,
} from "lucide-react";

export interface PainPoint {
  icon: LucideIcon;
  headline: string;
  description: string;
}

export interface MarketStat {
  value: string;
  label: string;
  source: string;
}

export interface ExitCase {
  company: string;
  acquirer: string;
  value: string;
  year: string;
  description: string;
  initial: string;
  acquirerLogo: "capital-one" | "mastercard" | "corpay" | "ripple" | "transnetwork";
}

export interface AsiaStat {
  value: string;
  label: string;
}

export interface Pillar {
  icon: LucideIcon;
  name: string;
  headline: string;
  description: string;
}

export interface ArchitectureLayer {
  label: string;
  items: string[];
}

export interface WorkflowAsCode {
  headline: string;
  description: string;
  features: string[];
}

export interface VaultStep {
  step: number;
  title: string;
  description: string;
}

export interface YieldComparison {
  instrument: string;
  yield: string;
  risk: string;
  highlight?: boolean;
}

export interface VaultTechFact {
  label: string;
  value: string;
}

export interface HedgeScenario {
  direction: string;
  poolEffect: string;
  hedgeAction: string;
  poolLoss: string;
  hedgeGain: string;
  feesEarned: string;
  netResult: string;
}

export interface MarketRegime {
  regime: string;
  behavior: string;
}

export interface EmergencyBreaker {
  name: string;
  threshold: string;
  action: string;
  color: "destructive" | "warning" | "secondary";
}

export interface ExpertAgent {
  name: string;
  codename: string;
  avatar: string;
  domain: string;
  description: string;
}

export type ZentinelCapability = string;

export interface ZentinelComparison {
  dimension: string;
  chatbot: string;
  zentinel: string;
}

export interface ZentinelImpact {
  task: string;
  before: string;
  after: string;
}

export interface ZentinelTechFact {
  label: string;
  value: string;
}

export interface ComputationCycleStep {
  label: string;
  time: string;
  description: string;
}

export interface TrustPrinciple {
  name: string;
  description: string;
}

export interface ComputationStep {
  step: string;
  description: string;
}

export interface ComputationEngine {
  headline: string;
  description: string;
  steps: ComputationStep[];
}

export interface ClientSegment {
  icon: LucideIcon;
  name: string;
  headline: string;
  description: string;
}

export interface RevenueStream {
  icon: LucideIcon;
  name: string;
  description: string;
}

export interface TenXMultiplier {
  lever: string;
  multiplier: string;
  description: string;
}

export interface TenXPath {
  headline: string;
  description: string;
  multipliers: TenXMultiplier[];
}

export interface TractionMetric {
  value: string;
  label: string;
  placeholder: boolean;
}

export interface UseOfFundsAllocation {
  category: string;
  percentage: number;
  amount: string;
  items: string[];
}

export interface UseOfFunds {
  sectionLabel: string;
  headline: string;
  totalRaise: string;
  allocations: UseOfFundsAllocation[];
  milestones: string[];
}

export interface TeamMember {
  name: string;
  role: string;
  bio: string;
  placeholder: boolean;
}

export interface InflationCountry {
  country: string;
  flag: string;
  currency: string;
  loss: string;
  year: string;
}

export interface ShieldComparison {
  label: string;
  loss: string;
  color: "destructive" | "warning" | "success";
}

export interface ShieldMechanism {
  step: string;
  title: string;
  description: string;
}

export interface DevaluationProduct {
  id: string;
  name: string;
  tagline: string;
  description: string;
  stat: { value: string; label: string };
  screenshotAlt: string;
}

export const deckContent = {
  title: {
    headline: "The Money That\nCan't Be Devalued.",
    subtitle:
      "Soberana is the financial infrastructure that protects corporate capital from inflation, devaluation, and monetary disorder — anywhere in the world.",
    tagline: "Built for every market where money loses its value.",
  },

  problem: {
    sectionLabel: "THE PROBLEM",
    headline: "Three Trillion-Dollar Gaps.",
    painPoints: [
      {
        icon: TrendingDown,
        headline: "Inflation is a silent tax. Everywhere.",
        description:
          "In 2023, more than 60% of emerging market economies experienced double-digit inflation. Argentina: 211%. Turkey: 64%. Nigeria: 33%. Egypt: 35%. Every week of inaction costs real money.",
      },
      {
        icon: Clock,
        headline: "Idle capital is a liability, not an asset.",
        description:
          "Corporate cash sitting in local bank accounts earns 0–1% annually while local currencies lose 10–200% of purchasing power. The gap is not a coincidence. It's a design failure.",
      },
      {
        icon: Shield,
        headline: "There was no infrastructure for monetary sovereignty.",
        description:
          "Until now, only institutions with direct access to global money markets could protect their capital from devaluation. Mid-market companies had no equivalent — they absorbed every currency shock as an unavoidable cost of doing business.",
      },
    ] satisfies PainPoint[],
  },

  market: {
    sectionLabel: "MARKET OPPORTUNITY",
    headline: "A $552B Market. Growing Fast.",
    stats: [
      {
        value: "$552.72B",
        label: "Global cross-border payments market by 2033",
        source: "SNS Insider",
      },
      {
        value: "$3.99T",
        label: "APAC digital payments transaction value, 2025",
        source: "Payment Asia",
      },
      {
        value: "$23.8T",
        label: "APAC payments projected by 2032",
        source: "FXC Intel / Money20/20",
      },
      {
        value: "$400B",
        label: "B2C cross-border in Asia-Pacific, 2025",
        source: "Asian Banking & Finance",
      },
    ] satisfies MarketStat[],
    apacGrowth: {
      from: "32.2%",
      to: "36.8%",
      label: "APAC share of global payment flows",
      period: "2024 → 2032",
      source: "FXC Intel",
    },
  },

  exits: {
    sectionLabel: "EXITS & LANDSCAPE",
    headline: "The Market Is Consolidating.",
    subheadline: "Infrastructure players command premium exits.",
    cases: [
      {
        company: "Brex",
        acquirer: "Capital One",
        value: "$5.15B",
        year: "2026",
        description:
          "AI-native corporate cards + expense management. Originally valued at $12.3B.",
        initial: "B",
        acquirerLogo: "capital-one",
      },
      {
        company: "BVNK",
        acquirer: "Mastercard",
        value: "Up to $1.8B",
        year: "2026",
        description:
          "Stablecoin infrastructure connecting on-chain payments with fiat rails for cross-border.",
        initial: "BV",
        acquirerLogo: "mastercard",
      },
      {
        company: "Alpha Group",
        acquirer: "Corpay",
        value: "$2.4B",
        year: "2025",
        description: "B2B cross-border FX tools for mid-market companies.",
        initial: "AG",
        acquirerLogo: "corpay",
      },
      {
        company: "Rail",
        acquirer: "Ripple",
        value: "$200M",
        year: "2025",
        description:
          "Connecting stablecoins with fiat for B2B cross-border payments.",
        initial: "R",
        acquirerLogo: "ripple",
      },
      {
        company: "Inswitch",
        acquirer: "TransNetwork",
        value: "Undisclosed",
        year: "2024",
        description:
          "Embedded finance + cross-border payments infrastructure in LATAM.",
        initial: "IN",
        acquirerLogo: "transnetwork",
      },
    ] satisfies ExitCase[],
  },

  asia: {
    sectionLabel: "ASIA OPPORTUNITY",
    headline: "The Next Frontier.",
    subheadline:
      "Asia-Pacific is the fastest-growing payments region. The infrastructure isn't ready.",
    stats: [
      { value: "93%", label: "expect significant infrastructure change by 2035" },
      { value: "88%", label: "say interoperability is critical" },
      { value: "86%", label: "say regulation is the key driver" },
      { value: "66%", label: "identify real-time payments as essential" },
    ] satisfies AsiaStat[],
    opportunities: [
      "CBDCs gaining traction across Southeast Asia",
      "Multilateral payment linkages expanding",
      "Blockchain integration becoming institutional standard",
    ],
    positioning:
      "Loopay's multi-rail infrastructure connects fiat and crypto rails — ready for CBDC integration from day one.",
  },

  solution: {
    sectionLabel: "THE SOLUTION",
    headline: "One API. Every Rail. Every Border.",
    pillars: [
      {
        icon: Globe,
        name: "Cross-border Payments",
        headline: "Move money to 45+ countries.",
        description:
          "SWIFT, local rails, and blockchain — unified under a single API. Fast settlement, full visibility.",
      },
      {
        icon: TrendingUp,
        name: "Smart Treasury · Vaults",
        headline: "Idle funds, always earning.",
        description:
          "Corporate treasury deployed into institutional-grade DeFi yields with automated hedging and 24/7 monitoring.",
      },
      {
        icon: Brain,
        name: "Zentinel",
        headline: "Your virtual CFO.",
        description:
          "AI-powered treasury intelligence. Ask questions in plain language. Get answers grounded in real data.",
      },
    ] satisfies Pillar[],
  },

  architecture: {
    sectionLabel: "PRODUCT ARCHITECTURE",
    headline: "Platform, Not Product.",
    subheadline: "A full financial operating system — modular, extensible, API-first.",
    layers: [
      {
        label: "Client Applications",
        items: ["Banks", "Fintechs", "Wallets", "Enterprises"],
      },
      {
        label: "Soberana API",
        items: ["REST API", "Webhooks", "SDKs", "Dashboard"],
      },
      {
        label: "Core Modules",
        items: [
          "Payments",
          "Treasury",
          "Compliance",
          "Cards",
          "On/Off Ramp",
        ],
      },
      {
        label: "Payment Rails",
        items: ["SWIFT", "ACH", "SEPA", "SEPA Instant", "PIX", "SPEI", "UPI", "Faster Payments", "FedNow", "RTP", "PromptPay", "PayNow", "DuitNow", "BI-FAST", "CHAPS", "TARGET2", "Blockchain"],
      },
    ] satisfies ArchitectureLayer[],
    workflowAsCode: {
      headline: "Workflow as Code",
      description: "Every payment flow, compliance check, and product behavior is defined as a configurable workflow. Clients go live by composing rules — not writing code. New rails, new countries, new products: configuration, not engineering cycles.",
      features: [
        "Declarative payment orchestration",
        "Rule-based compliance engine",
        "Instant product configuration",
        "Zero-code client onboarding",
      ],
    },
  },

  vaultsOverview: {
    sectionLabel: "VAULTS",
    headline: "Your Treasury. Always Earning.",
    analogy: "Think of it as a digital exchange desk that operates 24/7, earning a fee on every trade — with built-in insurance that protects it when markets move against it.",
    steps: [
      {
        step: 1,
        title: "Deposit",
        description: "Idle corporate funds enter a Vault. Capital is concentrated in a specific price range where trading volume is highest — like positioning an exchange desk at the busiest airport terminal.",
      },
      {
        step: 2,
        title: "Earn & Protect",
        description: "Every trade that passes through the pool generates fees automatically. Simultaneously, a hedging engine opens derivative positions that offset directional risk. What the pool loses on price movement, the hedge recovers.",
      },
      {
        step: 3,
        title: "Compound",
        description: "Fees are automatically reinvested every 12 hours — compounding returns like interest on interest. Withdraw anytime. Capital preservation is the first priority, yield is the second.",
      },
    ] satisfies VaultStep[],
    yieldComparison: [
      { instrument: "Savings Account", yield: "0.5 – 2%", risk: "Minimal" },
      { instrument: "Treasury Bonds", yield: "4 – 5%", risk: "Low" },
      { instrument: "Soberana Vaults (conservative)", yield: "5 – 8%", risk: "Medium-low", highlight: true },
      { instrument: "S&P 500 (historical)", yield: "8 – 10%", risk: "High" },
      { instrument: "Unhedged Crypto", yield: "-50% to +200%", risk: "Very high" },
    ] satisfies YieldComparison[],
    philosophy: "Designed with a conservative banking philosophy: preserve capital first, then generate yield.",
  },

  vaultsDeepDive: {
    sectionLabel: "VAULTS — DEEP DIVE",
    headline: "The Engine Under the Hood.",
    performanceBadges: [
      "+57.83% backtest (6mo)",
      "~117% APR",
      "Solana · Orca CLMM",
      "Hyperliquid hedging",
      "38+ tests",
      "Every 5 min analysis",
    ],
    hedgeMechanism: {
      headline: "The Shield: How Hedging Works",
      description: "When price moves, the pool loses on one side. The hedge recovers it on the other. The net result: capital preserved, fees kept.",
      scenarios: [
        {
          direction: "Price drops",
          poolEffect: "Pool accumulates more of the depreciating asset",
          hedgeAction: "Bot opens a SHORT (bet against price)",
          poolLoss: "~$180",
          hedgeGain: "~$170",
          feesEarned: "+$15",
          netResult: "+$5 net gain",
        },
        {
          direction: "Price rises",
          poolEffect: "Pool sells the appreciating asset too early",
          hedgeAction: "Bot opens a LONG (bet in favor of price)",
          poolLoss: "~$160",
          hedgeGain: "~$150",
          feesEarned: "+$15",
          netResult: "+$5 net gain",
        },
      ] satisfies HedgeScenario[],
    },
    decisionEngine: {
      headline: "The Brain: 30-Second Decision Loop",
      description: "Like an autopilot on a commercial aircraft. Every 30 seconds, the bot reads the market, evaluates risk, and decides whether to act or wait.",
      steps: ["Read price", "Evaluate risk", "Dead zone check", "Activate protection", "Report status"],
      regimes: [
        { regime: "Sideways", behavior: "Relax thresholds, collect fees calmly" },
        { regime: "Bullish", behavior: "Adjust upward protection" },
        { regime: "Bearish", behavior: "Tighten protection, act faster" },
        { regime: "High volatility", behavior: "Maximum caution, wider hedges" },
      ] satisfies MarketRegime[],
      steinInsight: "Uses the Stein signal to distinguish real trends from noise. Reduces unnecessary interventions by up to 67%.",
    },
    emergencyBreakers: {
      headline: "Emergency Breakers",
      description: "Like circuit breakers in an electrical system. Three independent fuses protect the capital:",
      breakers: [
        { name: "Kill Switch", threshold: "10% cumulative loss", action: "Total system shutdown. No more operations.", color: "destructive" },
        { name: "Max Drawdown", threshold: "15% from peak", action: "All open hedges closed immediately.", color: "warning" },
        { name: "Equity Floor", threshold: "Minimum capital reserve", action: "Like a bank reserve ratio — never risked beyond this minimum.", color: "secondary" },
      ] satisfies EmergencyBreaker[],
      additionalProtections: [
        "5-min cooldown after loss",
        "Anomaly detection (>10% spikes ignored)",
        "Max leverage: 2x",
        "Hedge ratio: 50%–120%",
      ],
    },
    expertAgents: [
      {
        name: "LVR & Gamma Expert",
        codename: "Chitra/Lipton",
        avatar: "\u0393",
        domain: "Loss-Versus-Rebalancing",
        description: "Monitors the core viability of the liquidity position. Calculates gamma exposure and fee-to-LVR ratio to ensure the pool earns more than it loses to adverse selection.",
      },
      {
        name: "Stochastic Hedging Expert",
        codename: "Lipton/Sepp",
        avatar: "\u0394",
        domain: "Delta Hedging",
        description: "Ensures hedge coverage stays within the 80\u2013120% analytical delta band. Tracks mismatch between the bot\u2019s hedge and the theoretically optimal position.",
      },
      {
        name: "DRL & Impulse Control Expert",
        codename: "Anchuri/M\u00f6ykkynen",
        avatar: "\u03A9",
        domain: "Ornstein-Uhlenbeck & Mean Reversion",
        description: "Applies \u2018intelligent laziness\u2019 \u2014 determines when NOT to trade. Regresses price dynamics to detect mean reversion and prevent short-lived, costly hedges.",
      },
      {
        name: "Asymmetric Rebalance Expert",
        codename: "Neutra/Goblin",
        avatar: "\u03A3",
        domain: "Range Optimization",
        description: "Calculates optimal asymmetric LP bounds based on momentum and volatility. Ensures the concentrated liquidity range captures maximum fee density.",
      },
      {
        name: "Risk Matrix Auditor",
        codename: "5 Vectors",
        avatar: "\u03A8",
        domain: "Microstructure Risk",
        description: "Scans five risk vectors simultaneously: oracle/price risk, funding asymmetry, MEV exposure, Brownian whipsaw, and cascade/drawdown thresholds.",
      },
      {
        name: "Capital Maximizer",
        codename: "Master Orchestrator",
        avatar: "\u03A6",
        domain: "Portfolio-Level PnL",
        description: "The master view. Tracks equity, ROI, APR, Sharpe ratio, and net PnL across the entire stack. Proposes parameter optimizations for maximum capital efficiency.",
      },
    ] satisfies ExpertAgent[],
    formula: "\u222Bfees \u2212 \u222BLVR \u2212 \u222Bhedge_costs > 0",
  },

  zentinelOverview: {
    sectionLabel: "ZENTINEL",
    headline: "Your Virtual CFO. Powered by AI.",
    description:
      "Imagine a senior financial analyst available 24/7 — one who knows every transaction, every balance, every trend in your treasury.",
    coreDistinction: {
      headline: "Not a chatbot. A financial analyst.",
      comparison: [
        { dimension: "Data source", chatbot: "Generic internet text", zentinel: "YOUR real treasury data, queried live" },
        { dimension: "Computation", chatbot: "None — repeats scripted answers", zentinel: "Precise financial calculations on current data" },
        { dimension: "Reasoning", chatbot: "Fixed script: if A, answer B", zentinel: "Analyzes the question, decides what data it needs, fetches it, builds the answer" },
        { dimension: "Adaptability", chatbot: "Same answer every time", zentinel: "Every answer is unique, based on data at that moment" },
      ] satisfies ZentinelComparison[],
    },
    impactTable: [
      { task: "Consolidated liquidity check", before: "15–30 min (3-4 systems, manual spreadsheet)", after: "5 seconds" },
      { task: "Cash flow projection (90 days)", before: "2–4 hours", after: "8 seconds" },
      { task: "FX exposure assessment", before: "1–2 hours", after: "6 seconds" },
      { task: "Committee report generation", before: "Half day to full day", after: "10–15 seconds" },
      { task: "File reconciliation", before: "4–8 hours (line by line)", after: "Seconds" },
    ] satisfies ZentinelImpact[],
    capabilities: [
      "Liquidity summary",
      "Cash flow projections",
      "FX exposure analysis",
      "Payment tracking",
      "Vault performance",
      "Treasury alerts (5 types, real-time)",
      "Formal report generation",
      "Transaction trends",
      "Period comparison",
      "CSV query & reconciliation",
      "Natural language queries",
    ] satisfies ZentinelCapability[],
  },

  zentinelDeepDive: {
    sectionLabel: "ZENTINEL — DEEP DIVE",
    headline: "Intelligence, Not Hallucination.",
    subheadline:
      "Every financial figure comes from a verified database query — never fabricated.",
    techStackLine: "NestJS 11 · LangChain/LangGraph · Claude · PostgreSQL Multi-tenant · JWT + RBAC · SSE Streaming · Full Audit Logging",
    computationCycle: {
      headline: "The Computation Cycle",
      description: "What happens in 5 seconds when a CFO asks a question:",
      steps: [
        { label: "Authenticate", time: "~200ms", description: "Verify bank identity, load conversation history" },
        { label: "Reason", time: "~500ms", description: "AI reads the question: What data do I need? Which tools should I use?" },
        { label: "Query", time: "~100ms", description: "Specialized tool queries the bank's real financial records" },
        { label: "Compute", time: "~50ms", description: "Aggregations, FX conversions, projections — calculated, not estimated" },
        { label: "Construct", time: "~3s", description: "Build response using EXCLUSIVELY the data just obtained" },
        { label: "Audit", time: "~100ms", description: "Save full trace: tool used, parameters, result. Immutable." },
      ] satisfies ComputationCycleStep[],
      totalTime: "~5 seconds total",
    },
    trustPrinciples: {
      headline: "Five Reasons to Trust the Answers",
      principles: [
        { name: "Real Data Only", description: "Every number comes from YOUR records, queried live. Never fabricated." },
        { name: "Transparent Methodology", description: "Always declares: data window, methodology, assumptions, sources. No black boxes." },
        { name: "Full Audit Trail", description: "Every interaction logged immutably: who asked, tools used, parameters, result, timestamp." },
        { name: "Human Confirmation", description: "Never executes a sensitive action without explicit user approval." },
        { name: "Honest Limitations", description: "If a question is beyond its capabilities, it says so clearly. No guessing." },
      ] satisfies TrustPrinciple[],
    },
    liveExample: {
      query: "Give me a summary of our current liquidity position",
      response: "Total consolidated liquidity: $429,188.51 USD. Highest concentration in USD (57.3%), followed by EUR (22.0%) and MXN (20.7%).",
      responseTime: "5 seconds",
    },
  },

  clients: {
    sectionLabel: "CLIENTS",
    headline: "Who Adopts Soberana.",
    subheadline: "From integration to live in weeks, not months.",
    segments: [
      {
        icon: Landmark,
        name: "Banks",
        headline: "Modernize without rebuilding.",
        description:
          "Upgrade cross-border infrastructure from 18-month builds to weeks. Plug in, go live.",
      },
      {
        icon: Layers,
        name: "Fintechs",
        headline: "Focus on product, not plumbing.",
        description:
          "Multi-rail payments and treasury via API. Ship faster. Scale globally.",
      },
      {
        icon: CreditCard,
        name: "Wallets",
        headline: "Real financial utility.",
        description:
          "Add fiat on/off ramps and yield products. Differentiate where it matters.",
      },
      {
        icon: Building2,
        name: "Enterprises",
        headline: "Stop leaving money on the table.",
        description:
          "Automate treasury, earn on idle funds, and move money globally — all from one dashboard.",
      },
    ] satisfies ClientSegment[],
    regions: ["Latin America", "North America", "Europe", "Asia"],
  },

  businessModel: {
    sectionLabel: "BUSINESS MODEL",
    headline: "Three Revenue Streams. Compounding.",
    streams: [
      {
        icon: ArrowLeftRight,
        name: "Transaction Fees",
        description:
          "Per-payment commission on every cross-border transaction processed through our rails.",
      },
      {
        icon: Server,
        name: "Platform Fees",
        description:
          "Monthly and annual licensing for access to the Soberana API and infrastructure.",
      },
      {
        icon: BarChart3,
        name: "Vault Management Fees",
        description:
          "Performance-based fees on yield generated through treasury vaults.",
      },
    ] satisfies RevenueStream[],
    networkEffect:
      "Every new client multiplies revenue across all three streams. More clients → more liquidity → better rates → more clients.",
    tenXPath: {
      headline: "The Path to 10x.",
      description: "Every product line compounds the others. Stripe grew non-payment revenue to 35% of total by layering Treasury, Capital, and Issuing on top of payments. Soberana follows the same playbook.",
      multipliers: [
        { lever: "Cross-border volume", multiplier: "3x", description: "Expand from 45 to 100+ countries. Add Asia-Pacific, Africa." },
        { lever: "Vault AUM", multiplier: "5x", description: "Scale institutional vaults. Each $1M in TVL generates recurring management fees." },
        { lever: "Platform licensing", multiplier: "4x", description: "Banks and fintechs pay per-seat + per-transaction. Revenue compounds with client growth." },
        { lever: "Embedded products", multiplier: "8x", description: "Cards, FX, On/Off Ramp, Compliance — each product cross-sells to existing clients at near-zero acquisition cost." },
      ],
    },
  },

  traction: {
    sectionLabel: "TRACTION",
    headline: "Momentum.",
    metrics: [
      { value: "+45", label: "Countries", placeholder: false },
      { value: "+1M", label: "Transactions", placeholder: false },
      { value: "2B USD", label: "Volume Moved", placeholder: false },
    ] satisfies TractionMetric[],
    placeholderNote: "",
  },

  team: {
    sectionLabel: "TEAM",
    headline: "Operators. Builders. From the Trenches.",
    description:
      "Led by operators and builders from leading banks, fintechs, and technology companies.",
    members: [
      {
        name: "[Name]",
        role: "CEO & Co-Founder",
        bio: "[Bio — background, relevant experience]",
        placeholder: true,
      },
      {
        name: "[Name]",
        role: "CTO & Co-Founder",
        bio: "[Bio — background, relevant experience]",
        placeholder: true,
      },
      {
        name: "[Name]",
        role: "Head of Product",
        bio: "[Bio — background, relevant experience]",
        placeholder: true,
      },
      {
        name: "[Name]",
        role: "Head of Growth",
        bio: "[Bio — background, relevant experience]",
        placeholder: true,
      },
    ] satisfies TeamMember[],
    placeholderNote: "[TEAM PHOTOS AND BIOS TO BE ADDED]",
  },

  useOfFunds: {
    sectionLabel: "USE OF FUNDS",
    headline: "$10M. 24 Months. Global Scale.",
    totalRaise: "$10,000,000",
    allocations: [
      {
        category: "Technology & Product",
        percentage: 40,
        amount: "$4.0M",
        items: ["Soberana platform consolidation", "Vaults engine scaling", "Zentinel AI expansion", "New payment rail integrations"],
      },
      {
        category: "Asia-Pacific Expansion",
        percentage: 25,
        amount: "$2.5M",
        items: ["Regulatory licensing (Singapore, Hong Kong)", "Local partnerships & banking relationships", "Regional team hiring"],
      },
      {
        category: "Growth & Sales",
        percentage: 20,
        amount: "$2.0M",
        items: ["Enterprise sales team", "Strategic partnerships with banks", "Brand positioning in key markets", "Developer community & docs"],
      },
      {
        category: "Operations & Compliance",
        percentage: 15,
        amount: "$1.5M",
        items: ["Multi-jurisdiction compliance", "Security audits & certifications", "Legal & corporate structure"],
      },
    ],
    milestones: [
      "Q1-Q2: Consolidate Soberana + Vaults + Zentinel into unified platform",
      "Q3-Q4: Launch in 2 Asian markets (Singapore, Philippines)",
      "Y2 Q1-Q2: 10 enterprise clients, $500M+ vault TVL target",
      "Y2 Q3-Q4: Path to profitability, prepare Series B",
    ],
  } satisfies UseOfFunds,

  ask: {
    sectionLabel: "THE ASK",
    headline: "Invest in the Rails,\nNot the App.",
    whyNow: [
      {
        icon: TrendingUp,
        text: "Market consolidation creating $1.8B–$5.15B exits in 2025–2026 alone.",
      },
      {
        icon: Globe,
        text: "Asia-Pacific payments growing from $12.8T to $23.8T by 2032.",
      },
      {
        icon: Shield,
        text: "DeFi yields becoming institutional-grade, bridging TradFi and crypto.",
      },
    ],
    unlocks: [
      "Geographic expansion — Asia-Pacific focus",
      "Product deepening — more vault strategies, more rails",
      "Team growth — engineering, compliance, sales",
    ],
    financialPlaceholder: "[CONFIDENTIAL — TO BE COMPLETED]",
  },

  inflationData: {
    sectionLabel: "THE INVISIBLE TAX",
    headline: "Every Currency Is Losing.\nSome Faster Than Others.",
    subheadline:
      "Inflation is not a Latin American problem. It's a global condition that destroys corporate capital while treasurers sleep.",
    stat: {
      value: "60%+",
      label: "of emerging market economies had double-digit inflation in 2022–2023",
      source: "IMF World Economic Outlook",
    },
    countries: [
      { country: "Argentina", flag: "🇦🇷", currency: "ARS", loss: "211%",  year: "2023" },
      { country: "Venezuela", flag: "🇻🇪", currency: "VES", loss: "400%+", year: "2023" },
      { country: "Turkey",    flag: "🇹🇷", currency: "TRY", loss: "85%",   year: "2022" },
      { country: "Lebanon",   flag: "🇱🇧", currency: "LBP", loss: "200%+", year: "2023" },
      { country: "Sri Lanka", flag: "🇱🇰", currency: "LKR", loss: "70%",   year: "2022" },
      { country: "Ghana",     flag: "🇬🇭", currency: "GHS", loss: "54%",   year: "2022" },
      { country: "Egypt",     flag: "🇪🇬", currency: "EGP", loss: "35%",   year: "2023" },
      { country: "Pakistan",  flag: "🇵🇰", currency: "PKR", loss: "38%",   year: "2023" },
      { country: "Nigeria",   flag: "🇳🇬", currency: "NGN", loss: "33%",   year: "2024" },
      { country: "Colombia",  flag: "🇨🇴", currency: "COP", loss: "13%",   year: "2023" },
      { country: "Euro Zone", flag: "🇪🇺", currency: "EUR", loss: "10.6%", year: "2022" },
      { country: "USA",       flag: "🇺🇸", currency: "USD", loss: "9.1%",  year: "2022" },
    ] satisfies InflationCountry[],
    punchline: "Even the dollar lost 20% of its purchasing power between 2020 and 2024.",
  },

  monetarySovereignty: {
    sectionLabel: "THE SOBERANA SHIELD",
    headline: "Something Stronger\nThan the Dollar.",
    subheadline:
      "For the first time, any company — anywhere — can hold capital that appreciates instead of depreciates.",
    comparison: [
      { label: "Argentine peso (2023)",  loss: "-211%", color: "destructive" },
      { label: "Turkish lira (2023)",    loss: "-64%",  color: "destructive" },
      { label: "Nigerian naira (2024)",  loss: "-33%",  color: "destructive" },
      { label: "Egyptian pound (2023)",  loss: "-35%",  color: "destructive" },
      { label: "US Dollar (2022 peak)",  loss: "-9.1%", color: "warning"     },
      { label: "Soberana Vaults (USDC)", loss: "+5–8%", color: "success"     },
    ] satisfies ShieldComparison[],
    mechanism: [
      {
        step: "1",
        title: "Convert to USDC",
        description:
          "Capital moves instantly from any local currency to USDC — pegged to the dollar, settled on-chain.",
      },
      {
        step: "2",
        title: "Deploy to Vaults",
        description:
          "Idle USDC earns 5–8% annual yield through institutional DeFi strategies with automated hedging.",
      },
      {
        step: "3",
        title: "Shield activates",
        description:
          "While local currencies lose value, your capital appreciates. The devaluation tax becomes optional.",
      },
    ] satisfies ShieldMechanism[],
    punchline: "Capital in Soberana doesn't devalue. It appreciates.",
    punchlineES: "El capital en Soberana no se devalúa. Se aprecia.",
  },

  devaluationProducts: {
    sectionLabel: "THE SOBERANA ANSWER",
    headline: "Four Products.\nOne Mission.",
    subheadline:
      "Every product in Soberana was built to answer the same question: how does a company protect its capital when its government can't?",
    products: [
      {
        id: "wallet",
        name: "USDC Wallet",
        tagline: "Your capital, immune to local devaluation.",
        description:
          "Convert any local currency to USDC instantly. Your balance lives on blockchain rails — not in a bank that can freeze, restrict, or devalue your money overnight.",
        stat: { value: "< 3 sec", label: "conversion to USDC" },
        screenshotAlt: "Soberana USDC Wallet dashboard",
      },
      {
        id: "multicurrency",
        name: "Multi-Currency Shield",
        tagline: "13 currencies. One account. No concentration risk.",
        description:
          "Hold, receive, and convert across MXN, BRL, EUR, COP, USD, and 8 more currencies — each automatically convertible to USDC. One devaluation can't take everything.",
        stat: { value: "13+", label: "currencies and rails" },
        screenshotAlt: "Soberana multi-currency selector",
      },
      {
        id: "zentinel",
        name: "Zentinel",
        tagline: "The CFO that monitors 50 currencies while you sleep.",
        description:
          "Zentinel tracks FX exposure, vault positions, and devaluation risk in real time — 24/7, across every currency you hold. It proposes. You decide. Nothing moves without your approval.",
        stat: { value: "24/7", label: "real-time FX surveillance" },
        screenshotAlt: "Zentinel AI treasury agent",
      },
      {
        id: "workflow",
        name: "Workflow Composer",
        tagline: "Automate your capital defense. No engineers needed.",
        description:
          "Set rules once: if MXN drops 5%, convert to USDC. If USDC balance exceeds $100K, deploy to Vaults. If Vault drawdown hits 8%, close position. The workflow executes. You sleep.",
        stat: { value: "0", label: "manual interventions required" },
        screenshotAlt: "Workflow Composer visual pipeline",
      },
    ] satisfies DevaluationProduct[],
    closing:
      "This is not a payments platform that happens to protect value. It is a capital protection platform that happens to move money.",
  },

  closing: {
    tagline: "From Latin America. For the World.",
    contacts: [
      { name: "Diego Muñoz", role: "CEO", email: "dm@loopay.com" },
      { name: "Carlos Ortegon", role: "CTO", email: "co@loopay.com" },
    ],
    website: "loopay.com",
  },
};

export type DeckContent = typeof deckContent;

export const TOTAL_SLIDES = 20;
