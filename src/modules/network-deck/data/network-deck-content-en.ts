import type { NetworkDeckContent } from "./network-deck-content.types";

/* ============================================================
   Soberana Network — Investor Deck (EN)
   13 main slides + A1 appendix. Verified facts only.
   ============================================================ */

export const networkDeckContentEn: NetworkDeckContent = {
  title: {
    kicker: "For licensed fintechs, PSPs",
    headline: "The member-owned stablecoin payment network.",
    positioning:
      "One licensed operator per country per rail, sharing an API, a compliance passport and the exit.",
    oneLiner: "Every network pays you fees. Soberana pays you in the network.",
    number: "US$2.2B",
    numberLabel: "mobilised on founders' rails",
    contactHint: "contact@soberana.network",
  },

  whyNow: {
    sectionLabel: "Why now",
    headline: "The giants paid billions. The operators got nothing.",
    deals: [
      { year: "2025", amount: "US$1.1B", deal: "Bridge → Stripe", source: "Stripe" },
      { year: "2026", amount: "US$1.8B", deal: "BVNK → Mastercard", source: "Mastercard" },
      { year: "2026", amount: "US$2.75B", deal: "Payoneer → Nuvei", source: "Nuvei" },
    ],
    emptyLabel: "the operators:",
    emptyValue: "US$0",
    regChips: ["GENIUS Act", "MiCA", "Brazil BCB"],
  },

  problem: {
    sectionLabel: "The problem",
    headline: "Every operator rebuilds the same four things, alone.",
    nodeLabel: "Operator",
    costChips: ["compliance", "custody", "liquidity", "distribution"],
    perCorridorLabel: "per corridor · 15 links for 6 operators",
  },

  model: {
    sectionLabel: "The model",
    headline: "One network. Owned by the operators who run it.",
    precedentLead:
      "Visa's 2008 IPO paid members US$13.4B.",
    hubLabel: "SOBERANA",
    hubSub: "MEMBER-OWNED",
    hubDetail: "API · netting",
    ownRingLabel: "owned by the seats",
    members: [
      { label: "Member", country: "MX" },
      { label: "Member", country: "BR" },
      { label: "Member", country: "US" },
      { label: "Member", country: "CO" },
      { label: "Member", country: "EU" },
      { label: "Member", country: "SG" },
      { label: "Member", country: "IN" },
      { label: "Member", country: "PE" },
    ],
    keepLabel: "Keep",
    keepChips: ["your licence", "your brand & clients", "your pricing"],
    gainLabel: "Gain",
    gainChips: ["network equity", "every market", "the exit"],
  },

  transfer: {
    sectionLabel: "How a transfer moves",
    headline: "Money touches the hub once. Netting removes the cost.",
    lanes: [
      { label: "SENDER MEMBER", actor: "Your customer", sub: "KYC · wallet" },
      { label: "NETWORK", actor: "Soberana hub", sub: "compliance · FX" },
      { label: "NETTING", actor: "Multilateral netting", sub: "offset · residual" },
      { label: "RECEIVING MEMBER", actor: "Destination rail", sub: "PIX · SPEI · ACH" },
    ],
    stampLabel: "in seconds",
  },

  proof: {
    sectionLabel: "Proof",
    headline: "It runs today, on four rails, with real volume.",
    number: "US$2.2B",
    numberLabel: "mobilised by the founders",
    rails: [
      { market: "United States", rails: "ACH, Wire" },
      { market: "Mexico", rails: "SPEI" },
      { market: "Brazil", rails: "PIX" },
      { market: "Colombia", rails: "co-ACH, Bre-B" },
    ],
    nextChip: "your market",
    nextSub: "claim the seat",
    stats: [
      { value: "1–5M", label: "per day" },
      { value: "37", label: "REST endpoints" },
    ],
    clientsLabel: "Live flows for",
    clients: [
      "Prix", "Alivio", "Bitxchange", "Ágil Cash", "Glosa",
      "Glosa Perú", "Fully Lemon", "Arkana", "Arcore", "Global Coin", "DoPayment",
    ],
  },

  founders: {
    sectionLabel: "Founders",
    headline: "Built by operators who already did it.",
    founders: [
      {
        name: "Diego Muñoz",
        role: "CEO",
        bio: "Founder of Loopay. Cross-border payments and licensing, Andean region.",
        proofChip: "500 Global · Draper University",
        photo: "founder-diego.jpg",
      },
      {
        name: "Carlos Ortegón",
        role: "CTO",
        bio: "Architect of Soberana: 37 endpoints live, rails in 4 markets.",
        proofChip: "500 Global · Draper University",
        photo: "founder-carlos.png",
      },
      {
        name: "Pablo Ramírez",
        role: "Director, Soberana",
        bio: "Product strategy and network growth.",
        proofChip: "Loopay Network",
        photo: "founder-pablo.png",
      },
      {
        name: "Juan José Muñoz",
        role: "Country Manager Colombia",
        bio: "Ecosystem and operator community.",
        proofChip: "Loopay Network",
        photo: "founder-juanjo.jpg",
      },
      {
        name: "César Espinosa",
        role: "Country Manager Ecuador",
        bio: "Business development and strategic partnerships.",
        proofChip: "Loopay Network",
        photo: "founder-cesar.jpg",
      },
    ],
    photoDiego: "founder-diego.jpg",
    photoCarlos: "founder-carlos.png",
    teamNote: "30+ people building Soberana.",
    awardNote: "Recognised by 500 Global and Draper University programs.",
  },

  flywheel: {
    sectionLabel: "The flywheel",
    headline: "Each member compounds the others.",
    centerTitle: "THE FLYWHEEL",
    centerWords: ["each", "member", "compounds", "the value", "of every other"],
    steps: ["More members", "More volume", "Better pricing & liquidity", "Stronger product", "More inbound clients"],
    note: "Every member makes the network cheaper for the ones already in.",
  },

  alternatives: {
    sectionLabel: "The alternatives",
    headline: "Only the seat is owned by local operators.",
    columns: ["COMPLIANCE", "CUSTODY", "DISTRIBUTION", "OWNS CLIENT", "OWNS NETWORK", "EXIT"],
    rows: [
      {
        label: "Build alone",
        cells: ["half", "half", "empty", "full", "empty", "empty"],
      },
      {
        label: "Global platform",
        sublabel: "",
        cells: ["full", "full", "empty", "empty", "full", "bad"],
      },
      {
        label: "Aggregator",
        sublabel: "",
        cells: ["half", "dot", "empty", "bad", "full", "bad"],
      },
      {
        label: "Bank consortium",
        sublabel: "Open Standard · BankChain",
        cells: ["full", "full", "half", "empty", "half", "bad"],
      },
      {
        label: "The seat",
        cells: ["seat", "seat", "seat", "seat", "seat", "seat"],
      },
    ],
    closingChip: "No network makes the local licence-holder a shareholder",
  },

  market: {
    sectionLabel: "The market",
    headline: "Stablecoins became payment infrastructure, fast.",
    circles: [
      { value: "US$27B", year: "2024", source: "spark.money" },
      { value: "US$226B", year: "2025 · +733%", source: "McKinsey × Artemis" },
      { value: ">US$1T", year: "2030 projection", source: "McKinsey" },
    ],
    regionalChips: [
      { label: "Bre-B", value: "782M+ txns" },
      { label: "PIX", value: "79.8B txns, 2025" },
    ],
  },

  seats: {
    sectionLabel: "The seats",
    headline: "One seat per country. Per rail. Never resold.",
    seats: [
      { market: "Colombia", rails: "co-ACH · Bre-B", taken: true },
      { market: "Ecuador", rails: "SRI", taken: true },
      { market: "Peru", rails: "Yape · PagoEfectivo", taken: true },
      { market: "Brazil", rails: "PIX", taken: false },
      { market: "Mexico", rails: "SPEI", taken: false },
      { market: "United States", rails: "ACH · Wire", taken: false },
      { market: "Canada, Panama, CR", rails: "—", taken: false, dim: true },
      { market: "Europe", rails: "SEPA · UK FPS", taken: false },
      { market: "India", rails: "UPI", taken: false },
      { market: "Singapore", rails: "PayNow", taken: false },
      { market: "UAE", rails: "UPTS", taken: false },
      { market: "Africa, Middle East", rails: "—", taken: false },
    ],
    honestLine: "Illustrative beyond live. Seats are performance-conditioned.",
    routes: [
      { tag: "Route A · Founding", title: "Double-sided SAFE", detail: "Licensed fintechs and PSPs." },
      { tag: "Route B · Institutional", title: "Capital commitment", detail: "Banks, insurers, regulated FIs." },
    ],
  },

  join: {
    sectionLabel: "How to join",
    headline: "A short, standard path with public rules.",
    steps: [
      { n: "STEP 1", title: "Apply", detail: "Licence, questionnaire, financials." },
      { n: "STEP 2", title: "Due diligence", detail: "Compliance, security, capital." },
      { n: "STEP 3", title: "Integrate", detail: "Sandbox, custody, netting test." },
      { n: "STEP 4", title: "Sign, go live", detail: "SAFE, bond, agreement." },
    ],
    commitmentsLabel: "What a member commits to",
    commitments: [
      { title: "Capital & bond", precedent: "Visa" },
      { title: "Compliance passport", precedent: "FATF · Wolfsberg" },
      { title: "Security baseline", precedent: "SWIFT CSP" },
      { title: "Transparency", precedent: "Circle · Chainlink" },
      { title: "Service levels", precedent: "Pix" },
      { title: "One vote per seat", precedent: "MakerDAO" },
      { title: "Suspension & exit", precedent: "Visa · Lido" },
    ],
    publishesLabel: "What the network publishes",
    publishes: "Rulebook, registry, attestations, volume, security, incidents, votes, audits",
    applyCta: "Apply for a seat",
    applyMailto: "mailto:contact@soberana.network",
  },

  ask: {
    sectionLabel: "The ask",
    headline: "[TBD: round size] to close the first ten seats.",
    terms: "[CONFIDENTIAL]",
    fundsLabel: "Use of funds (illustrative)",
    funds: [
      { label: "Network", pct: 30 },
      { label: "Liquidity", pct: 25 },
      { label: "Product", pct: 25 },
      { label: "Compliance", pct: 12 },
      { label: "Ops", pct: 8 },
    ],
    milestonesLabel: "Milestones (illustrative)",
    milestones: [
      { period: "Q1–Q2", milestone: "BR, MX, US seats signed." },
      { period: "Q3–Q4", milestone: "Netting live. 7–8 seats." },
      { period: "Y2 Q1–Q2", milestone: "First bank member. 10 seats." },
      { period: "Y2 Q3–Q4", milestone: "10–12 seats. Profitable." },
    ],
    edgeLine: "The last mile, owned by the last mile.",
    contactCta: "contact@soberana.network",
    docsCta: "prod.soberana.network/docs",
  },

  closing: {
    sectionLabel: "The close",
    headline: "Colombia is taken. The rest of the map is open — until it stops.",
    edgeLine: "Every network pays you fees. Soberana pays you in the network.",
    contactEmail: "contact@soberana.network",
    docsUrl: "prod.soberana.network/docs",
    disclaimer:
      "Not an offer of securities. Illustrative figures pending member agreements.",
  },

  rulebookAppendix: {
    sectionLabel: "Appendix",
    headline: "The rulebook, in full.",
    commitmentsTitle: "Seven commitments (v0.1)",
    commitments: [
      {
        title: "1 · Capital and bond",
        body: "Settlement bond at the net debit cap.",
        precedent: "Visa · Ethereum",
      },
      {
        title: "2 · Compliance passport",
        body: "KYC, KYB, KYT to FATF; Travel Rule on transfers.",
        precedent: "FATF · Wolfsberg",
      },
      {
        title: "3 · Security baseline",
        body: "SOC 2 or ISO 27001; MPC/HSM keys; 4-hour notice.",
        precedent: "SWIFT CSP · DORA",
      },
      {
        title: "4 · Transparency",
        body: "Monthly reserve attestation; audited financials.",
        precedent: "Circle · Chainlink",
      },
      {
        title: "5 · Service levels",
        body: "99.9% API uptime; 99.5% final in 20 seconds.",
        precedent: "Bre-B · Pix",
      },
      {
        title: "6 · Governance",
        body: "One vote per seat; changes by two thirds.",
        precedent: "Optimism · MakerDAO",
      },
      {
        title: "7 · Suspension and exit",
        body: "Cure 5–30 days; exit on 90 days' notice.",
        precedent: "Visa · Lido",
      },
    ],
    whoQualifiesTitle: "Who qualifies",
    whoQualifies: [
      "Licensed PSP, EMI, payment institution, VASP/CASP or bank — at all times.",
      "Real in-market distribution: payments, remittances, payroll, wallets.",
      "Two classes: Principal (direct settlement) and Affiliate.",
    ],
    publishesTitle: "Published for anyone to verify",
    publishes: [
      "Rulebook and fee schedule",
      "Member registry",
      "Reserve attestation",
      "Proof of reserves",
      "Volume stats",
      "Security attestations",
      "Incident log",
      "Governance votes",
      "Audits",
      "Bug bounty",
    ],
    note: "Illustrative until agreements.",
  },
};
