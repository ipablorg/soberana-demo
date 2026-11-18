// Translation types for type-safe i18n
export type Language = 'en' | 'es' | 'pt' | 'fr' | 'de' | 'it' | 'ja';

export interface CommonTranslations {
  loading: string;
  save: string;
  cancel: string;
  submit: string;
  confirm: string;
  delete: string;
  edit: string;
  close: string;
  search: string;
  filter: string;
  export: string;
  import: string;
  download: string;
  upload: string;
  actions: string;
  status: string;
  date: string;
  amount: string;
  currency: string;
  description: string;
  total: string;
  balance: string;
  success: string;
  error: string;
  warning: string;
  info: string;
  viewDetails: string;
  learnMore: string;
  getStarted: string;
  continue: string;
  back: string;
  next: string;
  finish: string;
  yes: string;
  no: string;
  copiedToClipboard: string;
  new: string;
  conversation: string;
  today: string;
  yesterday: string;
  last7Days: string;
}

export interface LandingTranslations {
  tagline: string;
  hero: {
    move: string;
    change: string;
    control: string;
    mainTitle: string;
    subtitle: string;
    autonomousTitle?: string;
    buildDeployGovern?: string;
    joinWaitlist: string;
    scheduleDemo: string;
    explorePlatform: string;
    signIn: string;
    getStarted: string;
    trustedByBadge: string;
  };
  nav: {
    suite: string;
    ifaas: string;
    features: string;
    usecases: string;
    pricing: string;
    docs: string;
    login: string;
    signUp: string;
  };
  dashboard: {
    title: string;
    subtitle: string;
  };
  suiteSection: {
    title: string;
    subtitle: string;
  };
  products: {
    move: { name: string; description: string };
    change: { name: string; description: string };
    account: { name: string; description: string };
    vaults: { name: string; description: string };
    card: { name: string; description: string };
    pos: { name: string; description: string };
  };
  ifaasSection: {
    title: string;
    subtitle: string;
    routesOptimizer: {
      title: string;
      badge: string;
      description: string;
      feature1: string;
      feature2: string;
      feature3: string;
    };
    workflowBuilder: {
      title: string;
      badge: string;
      description: string;
      feature1: string;
      feature2: string;
      feature3: string;
    };
    unifiedPlatform: {
      title: string;
      badge: string;
      description: string;
      feature1: string;
      feature2: string;
      feature3: string;
    };
    connectors: {
      description: string;
      badge1: string;
      badge2: string;
      badge3: string;
    };
  };
  agent: {
    title: string;
    subtitle: string;
    preview: {
      description: string;
      badge1: string;
      badge2: string;
      badge3: string;
    };
    conversational: {
      title: string;
      badge: string;
      description: string;
      feature1: string;
      feature2: string;
      feature3: string;
    };
    optimization: {
      title: string;
      badge: string;
      description: string;
      feature1: string;
      feature2: string;
      feature3: string;
    };
    deployment: {
      title: string;
      badge: string;
      description: string;
      feature1: string;
      feature2: string;
      feature3: string;
    };
  };
  features: {
    title: string;
    subtitle: string;
    multiRail: {
      title: string;
      description: string;
    };
    workflows: {
      title: string;
      description: string;
    };
    unified: {
      title: string;
      description: string;
    };
    vaultsCard: {
      title: string;
      description: string;
    };
  };
  cardPro: {
    title: string;
    subtitle: string;
    apr: {
      title: string;
      description: string;
    };
    optimizer: {
      title: string;
      description: string;
    };
    ltv: {
      title: string;
      description: string;
    };
  };
  detailedFeatures: {
    title: string;
    subtitle: string;
    oneClick: {
      title: string;
      description: string;
      feature1: string;
      feature2: string;
      feature3: string;
    };
    treasury: {
      title: string;
      description: string;
      feature1: string;
      feature2: string;
      feature3: string;
    };
    monitoring: {
      title: string;
      description: string;
      feature1: string;
      feature2: string;
      feature3: string;
    };
  };
  useCases: {
    title: string;
    subtitle: string;
    global: {
      title: string;
      description: string;
      feature1: string;
      feature2: string;
      feature3: string;
    };
    fintechs: {
      title: string;
      description: string;
      feature1: string;
      feature2: string;
      feature3: string;
    };
    merchants: {
      title: string;
      description: string;
      feature1: string;
      feature2: string;
      feature3: string;
    };
    funds: {
      title: string;
      description: string;
      feature1: string;
      feature2: string;
      feature3: string;
    };
  };
  rails: {
    title: string;
    subtitle: string;
  };
  technology: {
    title: string;
    subtitle: string;
    security: {
      title: string;
      description: string;
    };
    compliance: {
      title: string;
      description: string;
    };
    performance: {
      title: string;
      description: string;
      uptime: string;
      support: string;
    };
  };
  cta: {
    title: string;
    subtitle: string;
    getStarted: string;
    contactSales: string;
  };
  socialProof: {
    title: string;
    companies: string;
    companiesLabel: string;
    volume: string;
    volumeLabel: string;
    uptime: string;
    uptimeLabel: string;
    latency: string;
    latencyLabel: string;
    trustedBy: string;
  };
  featuredIn: {
    title: string;
    subtitle: string;
  };
  cardProBanner: {
    badge: string;
    title: string;
    subtitle: string;
    cta: string;
  };
  cardProSection: {
    badge: string;
    title: string;
    subtitle: string;
    feature1: {
      title: string;
      description: string;
    };
    feature2: {
      title: string;
      description: string;
    };
    feature3: {
      title: string;
      description: string;
    };
    feature4: {
      title: string;
      description: string;
    };
    benefit1: string;
    benefit2: string;
    benefit3: string;
    benefit4: string;
    benefit5: string;
    cta: string;
  };
  faq: {
    title: string;
    subtitle: string;
    questions: {
      q1: { question: string; answer: string };
      q2: { question: string; answer: string };
      q3: { question: string; answer: string };
      q4: { question: string; answer: string };
      q5: { question: string; answer: string };
      q6: { question: string; answer: string };
      q7: { question: string; answer: string };
      q8: { question: string; answer: string };
    };
  };
  testimonials: {
    title: string;
    subtitle: string;
  };
  security: {
    title: string;
    subtitle: string;
    iso27001: string;
    soc2: string;
    pci: string;
    gdpr: string;
  };
  demoForm: {
    title: string;
    subtitle: string;
    fullName: string;
    fullNamePlaceholder: string;
    email: string;
    emailPlaceholder: string;
    company: string;
    companyPlaceholder: string;
    country: string;
    countryPlaceholder: string;
    phone: string;
    phonePlaceholder: string;
    volume: string;
    useCase: string;
    button: string;
    privacy: string;
    privacyLink: string;
    successTitle: string;
    successMessage: string;
  };
  footer: {
    description: string;
    products: string;
    resources: string;
    company: string;
    documentation: string;
    apiReference: string;
    guides: string;
    blog: string;
    helpCenter: string;
    about: string;
    careers: string;
    contact: string;
    privacy: string;
    terms: string;
    copyright: string;
    socCompliant: string;
    pciDss: string;
  };
}

export interface PlatformTranslations {
  home: string;
  move: string;
  change: string;
  account: string;
  vaults: string;
  treasury: string;
  analytics: string;
  automations: string;
  compliance: string;
  settings: string;
  marketplace: string;
  developers: string;
  mode: {
    operator: string;
    intelligent: string;
    builder: string;
    operatorDesc: string;
    intelligentDesc: string;
    builderDesc: string;
  };
  sidebar: {
    summary: string;
    collect: string;
    pay: string;
    transfer: string;
    fx: string;
    bridge: string;
    accounts: string;
    multiCurrency: string;
    cards: string;
    cardPro: string;
    pos: string;
    automation: string;
    build: string;
    buildAI: string;
    allFlows: string;
    connectors: string;
    products: string;
    recentTransactions: string;
    liveRates: string;
    policy: string;
    invest: string;
  };
  topbar: {
    searchPlaceholder: string;
    notifications: string;
    profile: string;
    logout: string;
    settings: string;
    documentation: string;
    support: string;
  };
}

export interface BackofficeTranslations {
  title: string;
  subtitle: string;
  dashboard: string;
  users: string;
  organizations: string;
  audit: string;
  settings: string;
  compliance: string;
  reports: string;
  logout: string;
  userManagement: {
    title: string;
    addUser: string;
    editUser: string;
    deleteUser: string;
    roles: string;
    permissions: string;
  };
  orgManagement: {
    title: string;
    addOrg: string;
    editOrg: string;
    viewDetails: string;
  };
}

export interface SuiteUserTranslations {
  move: {
    collect: {
      title: string;
      subtitle: string;
      generateLink: string;
      generateQR: string;
    };
    payout: {
      title: string;
      subtitle: string;
      newPayout: string;
      selectBeneficiary: string;
    };
    transfer: {
      title: string;
      subtitle: string;
      newTransfer: string;
      selectAccount: string;
    };
  };
  change: {
    fx: {
      title: string;
      subtitle: string;
      lockRate: string;
      bestRate: string;
    };
    bridge: {
      title: string;
      subtitle: string;
      onRamp: string;
      offRamp: string;
    };
  };
  account: {
    overview: {
      title: string;
      subtitle: string;
      totalBalance: string;
      availableBalance: string;
    };
    cards: {
      title: string;
      subtitle: string;
      issueCard: string;
      virtualCard: string;
      physicalCard: string;
    };
  };
}

export interface AuthTranslations {
  login: {
    title: string;
    subtitle: string;
    email: string;
    emailPlaceholder: string;
    password: string;
    passwordPlaceholder: string;
    forgotPassword: string;
    rememberMe: string;
    signInButton: string;
    signingIn: string;
    noAccount: string;
    signUp: string;
    orContinueWith: string;
    backButton: string;
    backToHome: string;
    welcome: string;
    welcomeSubtitle: string;
    features: {
      feature1: string;
      feature2: string;
      feature3: string;
      feature4: string;
    };
  };
  register: {
    title: string;
    subtitle: string;
    firstName: string;
    firstNamePlaceholder: string;
    lastName: string;
    lastNamePlaceholder: string;
    email: string;
    emailPlaceholder: string;
    company: string;
    companyPlaceholder: string;
    password: string;
    passwordPlaceholder: string;
    confirmPassword: string;
    passwordMismatch: string;
    createAccountButton: string;
    creatingAccount: string;
    haveAccount: string;
    signIn: string;
    acceptTerms: string;
    terms: string;
    and: string;
    privacyPolicy: string;
    backButton: string;
    backToHome: string;
    welcomeTitle: string;
    welcomeSubtitle: string;
    features: {
      feature1: string;
      feature2: string;
      feature3: string;
      feature4: string;
    };
    trustedBy: string;
    passwordValidation: {
      minLength: string;
      hasUpperCase: string;
      hasLowerCase: string;
      hasNumber: string;
      hasSpecialChar: string;
    };
  };
  social: {
    google: string;
    github: string;
  };
}

export interface OnboardingTranslations {
  welcome: {
    title: string;
    subtitle: string;
    startButton: string;
  };
  selectUseCase: {
    question: string;
    digitalTreasury: string;
    crossborder: string;
    crypto: string;
  };
  digitalTreasury: {
    companyName: string;
    avgCollectionTicket: string;
    avgDispersionTicket: string;
    monthlyTransactions: string;
  };
  crossborder: {
    companyName: string;
    collectionCurrency: string;
    dispersionCurrency: string;
    avgCollectionTicket: string;
    monthlyTransactions: string;
  };
  crypto: {
    companyName: string;
    avgDailyMonetization: string;
  };
  additional: {
    industry: string;
    interestedProducts: string;
    monthlyVolume: string;
    needsApi: string;
    multipleEntities: string;
    automationNeeds: string;
    timeline: string;
    email: string;
    phone: string;
  };
  messages: {
    greeting: string;
    askingQuestion: string;
    thankYou: string;
    processingInfo: string;
    willContact: string;
  };
  placeholders: {
    companyName: string;
    amount: string;
    number: string;
    currency: string;
    email: string;
    phone: string;
    selectOption: string;
  };
  options: {
    yes: string;
    no: string;
    lessThan1M: string;
    between1M10M: string;
    between10M50M: string;
    moreThan50M: string;
    immediate: string;
    oneMonth: string;
    threeMonths: string;
    sixMonths: string;
    retail: string;
    fintech: string;
    ecommerce: string;
    remittances: string;
    corporate: string;
    marketplace: string;
    other: string;
  };
}

export interface Translations {
  common: CommonTranslations;
  landing: LandingTranslations;
  platform: PlatformTranslations;
  backoffice: BackofficeTranslations;
  suiteUser: SuiteUserTranslations;
  auth: AuthTranslations;
  onboarding: OnboardingTranslations;
}

