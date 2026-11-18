import type { NetworkDeckContent } from "./network-deck-content.types";

/* ============================================================
   Soberana Network — Investor Deck (ES)
   Espejo fiel de network-deck-content-en.ts — mismas claves.
   ============================================================ */

export const networkDeckContentEs: NetworkDeckContent = {
  title: {
    kicker: "Para fintechs y PSPs con licencia",
    headline: "La red de pagos stablecoin que pertenece a sus miembros.",
    positioning:
      "Un operador licenciado por país y por riel, compartiendo una API, un pasaporte de compliance y el exit.",
    oneLiner: "Toda red te paga fees. Soberana te paga en la red.",
    number: "US$2.2B",
    numberLabel: "movilizados en rieles de los fundadores",
    contactHint: "contact@soberana.network",
  },

  whyNow: {
    sectionLabel: "Por qué ahora",
    headline: "Los gigantes pagaron miles de millones. Los operadores, nada.",
    deals: [
      { year: "2025", amount: "US$1.1B", deal: "Bridge → Stripe", source: "Stripe" },
      { year: "2026", amount: "US$1.8B", deal: "BVNK → Mastercard", source: "Mastercard" },
      { year: "2026", amount: "US$2.75B", deal: "Payoneer → Nuvei", source: "Nuvei" },
    ],
    emptyLabel: "los operadores:",
    emptyValue: "US$0",
    regChips: ["GENIUS Act", "MiCA", "BCB Brasil"],
  },

  problem: {
    sectionLabel: "El problema",
    headline: "Cada operador reconstruye lo mismo cuatro veces, solo.",
    nodeLabel: "Operador",
    costChips: ["compliance", "custodia", "liquidez", "distribución"],
    perCorridorLabel: "por corredor · 15 enlaces para 6 operadores",
  },

  model: {
    sectionLabel: "El modelo",
    headline: "Una red. Propiedad de los operadores que la corren.",
    precedentLead:
      "El IPO 2008 de Visa pagó US$13.4B a miembros.",
    hubLabel: "SOBERANA",
    hubSub: "PROPIEDAD DE MIEMBROS",
    hubDetail: "API · netting",
    ownRingLabel: "propiedad de los asientos",
    members: [
      { label: "Miembro", country: "MX" },
      { label: "Miembro", country: "BR" },
      { label: "Miembro", country: "US" },
      { label: "Miembro", country: "CO" },
      { label: "Miembro", country: "EU" },
      { label: "Miembro", country: "SG" },
      { label: "Miembro", country: "IN" },
      { label: "Miembro", country: "PE" },
    ],
    keepLabel: "Conservas",
    keepChips: ["tu licencia", "tu marca y clientes", "tu pricing"],
    gainLabel: "Ganas",
    gainChips: ["equity de la red", "todos los mercados", "el exit"],
  },

  transfer: {
    sectionLabel: "Cómo se mueve una transferencia",
    headline: "La plata toca el hub una vez. El netting elimina el costo.",
    lanes: [
      { label: "MIEMBRO ORIGEN", actor: "Tu cliente", sub: "KYC · wallet" },
      { label: "LA RED", actor: "Hub Soberana", sub: "compliance · FX" },
      { label: "NETTING", actor: "Netting multilateral", sub: "compensa · residual" },
      { label: "MIEMBRO DESTINO", actor: "Riel de destino", sub: "PIX · SPEI · ACH" },
    ],
    stampLabel: "en segundos",
  },

  proof: {
    sectionLabel: "La prueba",
    headline: "Corre hoy, en cuatro rieles, con volumen real.",
    number: "US$2.2B",
    numberLabel: "movilizados por los fundadores",
    rails: [
      { market: "Estados Unidos", rails: "ACH, Wire" },
      { market: "México", rails: "SPEI" },
      { market: "Brasil", rails: "PIX" },
      { market: "Colombia", rails: "co-ACH, Bre-B" },
    ],
    nextChip: "tu mercado",
    nextSub: "reclama el asiento",
    stats: [
      { value: "1–5M", label: "por día" },
      { value: "37", label: "endpoints REST" },
    ],
    clientsLabel: "Flujos live para",
    clients: [
      "Prix", "Alivio", "Bitxchange", "Ágil Cash", "Glosa",
      "Glosa Perú", "Fully Lemon", "Arkana", "Arcore", "Global Coin", "DoPayment",
    ],
  },

  founders: {
    sectionLabel: "Fundadores",
    headline: "Construido por operadores que ya lo hicieron.",
    founders: [
      {
        name: "Diego Muñoz",
        role: "CEO",
        bio: "Fundador de Loopay. Pagos cross-border y licencias, región andina.",
        proofChip: "500 Global · Draper University",
        photo: "founder-diego.jpg",
      },
      {
        name: "Carlos Ortegón",
        role: "CTO",
        bio: "Arquitecto de Soberana: 37 endpoints live, rieles en 4 mercados.",
        proofChip: "500 Global · Draper University",
        photo: "founder-carlos.png",
      },
      {
        name: "Pablo Ramírez",
        role: "Director, Soberana",
        bio: "Estrategia de producto y crecimiento de la red.",
        proofChip: "Loopay Network",
        photo: "founder-pablo.png",
      },
      {
        name: "Juan José Muñoz",
        role: "Country Manager Colombia",
        bio: "Ecosistema y comunidad de operadores.",
        proofChip: "Loopay Network",
        photo: "founder-juanjo.jpg",
      },
      {
        name: "César Espinosa",
        role: "Country Manager Ecuador",
        bio: "Desarrollo de negocio y alianzas estratégicas.",
        proofChip: "Loopay Network",
        photo: "founder-cesar.jpg",
      },
    ],
    photoDiego: "founder-diego.jpg",
    photoCarlos: "founder-carlos.png",
    teamNote: "+30 personas construyendo Soberana.",
    awardNote: "Reconocidos por programas de 500 Global y Draper University.",
  },

  flywheel: {
    sectionLabel: "El flywheel",
    headline: "Cada miembro potencia a los demás.",
    centerTitle: "EL FLYWHEEL",
    centerWords: ["cada", "miembro", "potencia", "el valor", "de todos los demás"],
    steps: ["Más miembros", "Más volumen", "Mejor pricing y liquidez", "Producto más fuerte", "Más clientes entrantes"],
    note: "Cada miembro hace la red más barata para los que ya están dentro.",
  },

  alternatives: {
    sectionLabel: "Las alternativas",
    headline: "Solo el asiento es propiedad de los operadores locales.",
    columns: ["COMPLIANCE", "CUSTODIA", "DISTRIBUCIÓN", "DUEÑO DEL CLIENTE", "DUEÑO DE LA RED", "EXIT"],
    rows: [
      {
        label: "Construir solo",
        cells: ["half", "half", "empty", "full", "empty", "empty"],
      },
      {
        label: "Plataforma global",
        sublabel: "",
        cells: ["full", "full", "empty", "empty", "full", "bad"],
      },
      {
        label: "Agregador",
        sublabel: "",
        cells: ["half", "dot", "empty", "bad", "full", "bad"],
      },
      {
        label: "Consorcio bancario",
        sublabel: "Open Standard · BankChain",
        cells: ["full", "full", "half", "empty", "half", "bad"],
      },
      {
        label: "El asiento",
        cells: ["seat", "seat", "seat", "seat", "seat", "seat"],
      },
    ],
    closingChip: "Ninguna red hace al licenciatario local accionista",
  },

  market: {
    sectionLabel: "El mercado",
    headline: "Los stablecoins ya son infraestructura de pagos.",
    circles: [
      { value: "US$27B", year: "2024", source: "spark.money" },
      { value: "US$226B", year: "2025 · +733%", source: "McKinsey × Artemis" },
      { value: ">US$1T", year: "proyección 2030", source: "McKinsey" },
    ],
    regionalChips: [
      { label: "Bre-B", value: "782M+ transacciones" },
      { label: "PIX", value: "79.8B transacciones, 2025" },
    ],
  },

  seats: {
    sectionLabel: "Los asientos",
    headline: "Un asiento por país. Por riel. Nunca se revende.",
    seats: [
      { market: "Colombia", rails: "co-ACH · Bre-B", taken: true },
      { market: "Ecuador", rails: "SRI", taken: true },
      { market: "Perú", rails: "Yape · PagoEfectivo", taken: true },
      { market: "Brasil", rails: "PIX", taken: false },
      { market: "México", rails: "SPEI", taken: false },
      { market: "Estados Unidos", rails: "ACH · Wire", taken: false },
      { market: "Canadá, Panamá, CR", rails: "—", taken: false, dim: true },
      { market: "Europa", rails: "SEPA · UK FPS", taken: false },
      { market: "India", rails: "UPI", taken: false },
      { market: "Singapur", rails: "PayNow", taken: false },
      { market: "EAU", rails: "UPTS", taken: false },
      { market: "África, Medio Oriente", rails: "—", taken: false },
    ],
    honestLine: "Ilustrativo más allá de lo live. Asientos condicionados al desempeño.",
    routes: [
      { tag: "Ruta A · Fundadores", title: "SAFE de doble vía", detail: "Fintechs y PSPs licenciados." },
      { tag: "Ruta B · Institucional", title: "Compromiso de capital", detail: "Bancos, aseguradoras, IF reguladas." },
    ],
  },

  join: {
    sectionLabel: "Cómo entrar",
    headline: "Un camino corto y estándar, con reglas públicas.",
    steps: [
      { n: "PASO 1", title: "Aplicar", detail: "Licencia, cuestionario, financieros." },
      { n: "PASO 2", title: "Due diligence", detail: "Compliance, seguridad, capital." },
      { n: "PASO 3", title: "Integrar", detail: "Sandbox, custodia, netting." },
      { n: "PASO 4", title: "Firmar y salir", detail: "SAFE, bond, acuerdo." },
    ],
    commitmentsLabel: "A qué se compromete un miembro",
    commitments: [
      { title: "Capital y bond", precedent: "Visa" },
      { title: "Pasaporte de compliance", precedent: "FATF · Wolfsberg" },
      { title: "Línea base de seguridad", precedent: "SWIFT CSP" },
      { title: "Transparencia", precedent: "Circle" },
      { title: "Niveles de servicio", precedent: "Pix" },
      { title: "Un voto por asiento", precedent: "MakerDAO" },
      { title: "Suspensión y salida", precedent: "Visa" },
    ],
    publishesLabel: "Lo que publica la red",
    publishes: "Rulebook, registro, atestaciones, volumen, seguridad, incidentes, votos, auditorías",
    applyCta: "Aplicar a un asiento",
    applyMailto: "mailto:contact@soberana.network",
  },

  ask: {
    sectionLabel: "La propuesta",
    headline: "[TBD: tamaño de ronda] para cerrar los primeros diez asientos.",
    terms: "[CONFIDENCIAL]",
    fundsLabel: "Uso de fondos (ilustrativo)",
    funds: [
      { label: "Red", pct: 30 },
      { label: "Liquidez", pct: 25 },
      { label: "Producto", pct: 25 },
      { label: "Compliance", pct: 12 },
      { label: "Ops", pct: 8 },
    ],
    milestonesLabel: "Hitos (ilustrativos)",
    milestones: [
      { period: "Q1–Q2", milestone: "Asientos BR, MX, US firmados." },
      { period: "Q3–Q4", milestone: "Netting live. 7–8 asientos." },
      { period: "A2 Q1–Q2", milestone: "Primer banco miembro. 10 asientos." },
      { period: "A2 Q3–Q4", milestone: "10–12 asientos. Rentable." },
    ],
    edgeLine: "La última milla, propiedad de la última milla.",
    contactCta: "contact@soberana.network",
    docsCta: "prod.soberana.network/docs",
  },

  closing: {
    sectionLabel: "El cierre",
    headline: "Colombia está tomada. El resto del mapa está abierto — hasta que deje de estarlo.",
    edgeLine: "Toda red te paga fees. Soberana te paga en la red.",
    contactEmail: "contact@soberana.network",
    docsUrl: "prod.soberana.network/docs",
    disclaimer:
      "No es una oferta de valores. Cifras ilustrativas pendientes de acuerdos.",
  },

  rulebookAppendix: {
    sectionLabel: "Apéndice",
    headline: "El rulebook, completo.",
    commitmentsTitle: "Siete compromisos (v0.1)",
    commitments: [
      {
        title: "1 · Capital y bond",
        body: "Bond de liquidación al net debit cap.",
        precedent: "Visa · Ethereum",
      },
      {
        title: "2 · Pasaporte de compliance",
        body: "KYC, KYB, KYT FATF; Travel Rule en transfers.",
        precedent: "FATF · Wolfsberg",
      },
      {
        title: "3 · Línea base de seguridad",
        body: "SOC 2 o ISO 27001; llaves MPC/HSM; aviso 4h.",
        precedent: "SWIFT CSP · DORA",
      },
      {
        title: "4 · Transparencia",
        body: "Atestación mensual de reservas; financieros auditados.",
        precedent: "Circle · Chainlink",
      },
      {
        title: "5 · Niveles de servicio",
        body: "99.9% uptime API; 99.5% final en 20s.",
        precedent: "Bre-B · Pix",
      },
      {
        title: "6 · Gobernanza",
        body: "Un voto por asiento; cambios por dos tercios.",
        precedent: "Optimism · MakerDAO",
      },
      {
        title: "7 · Suspensión y salida",
        body: "Cura 5–30 días; salida con aviso de 90 días.",
        precedent: "Visa · Lido",
      },
    ],
    whoQualifiesTitle: "Quién califica",
    whoQualifies: [
      "PSP, EMI, institución de pago, VASP/CASP o banco licenciado — en todo momento.",
      "Distribución real en su mercado: pagos, remesas, nómina, wallets.",
      "Dos clases: Principal (liquidación directa) y Afiliado.",
    ],
    publishesTitle: "Publicado para verificación pública",
    publishes: [
      "Rulebook y fees",
      "Registro",
      "Reservas",
      "Reservas on-chain",
      "Volumen",
      "Seguridad",
      "Log de incidentes",
      "Votos",
      "Auditorías",
      "Bug bounty",
    ],
    note: "Ilustrativos hasta acuerdos.",
  },
};
