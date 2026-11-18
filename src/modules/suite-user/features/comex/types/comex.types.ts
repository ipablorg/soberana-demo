/**
 * COMEX Module - Type Definitions
 * 
 * Foreign Trade operations with regulatory compliance for Colombian international payments.
 * Complies with DCIN-83 (Banco de la República) and DIAN regulations.
 */

// ============================================
// ENUMS & CONSTANTS
// ============================================

export type ComexOperationType = 'import' | 'export' | 'services';

export type CurrencyCode = 'COP' | 'USD' | 'EUR' | 'MXN' | 'BRL' | 'CNY' | 'USDT';

export type CurrencyPair = `${CurrencyCode}-${CurrencyCode}`;

export type Incoterm =
    | 'FOB'
    | 'CIF'
    | 'EXW'
    | 'DDP'
    | 'FCA'
    | 'DAP';

export type CountryCode =
    | 'CO' // Colombia
    | 'US' // USA
    | 'CN' // China
    | 'BR' // Brazil
    | 'MX' // Mexico
    | 'EU'; // European Union

// Payment Term (Momento de Pago)
export type PaymentTerm =
    | 'advance'        // Anticipo (Antes de embarque)
    | 'open_account';  // Pago contra embarque / Vencido (Goods already in Colombia)

export type DocumentType =
    | 'invoice'
    | 'vuce_registry'
    | 'service_contract'
    | 'internal_note'
    | 'customs_declaration'
    | 'certificate_origin'
    | 'transfer_pricing_study'; // Mexico related party transactions

// ============================================
// TRANSACTION DATA
// ============================================

export interface TransactionDetails {
    amount: number;
    sourceCurrency: string;
    targetCurrency: string;
    pair: CurrencyPair;
    paymentTerm: PaymentTerm; // Momento de Pago (DCIN-83)
    beneficiaryId?: string;
    beneficiaryName?: string;
    exchangeRate?: number;
    estimatedTotal?: number;
}

// ============================================
// COMPLIANCE DATA
// ============================================

export interface ComplianceDetails {
    operationType: ComexOperationType;
    paymentPurpose: string;
    paymentPurposeCode?: string;
    incoterm?: Incoterm;
    isRelatedParty: boolean; // Precios de transferencia
    originCountry: CountryCode;
    destinationCountry: CountryCode;
    hsCode?: string; // Subpartida Arancelaria (10 digits) - DIAN
    customsDeclarationNumber?: string; // Declaración de Importación (D.I.)
}

// ============================================
// DOCUMENT REQUIREMENTS
// ============================================

export interface DocumentRequirement {
    type: DocumentType;
    label: string;
    description: string;
    required: boolean;
    maxSizeMB: number;
    acceptedFormats: string[];
}

export interface UploadedDocument {
    id: string;
    type: DocumentType;
    file: File;
    uploadedAt: Date;
    status: 'pending' | 'uploaded' | 'validated' | 'rejected';
}

// ============================================
// TAX BREAKDOWN
// ============================================

export interface TaxBreakdown {
    baseAmount: number;
    gmf: number; // Gravamen a los Movimientos Financieros (4x1000)
    retencion?: number; // Retención en la fuente
    totalTaxes: number;
    netAmount: number;
}

// ============================================
// WIZARD STATE
// ============================================

export interface ComexWizardStep {
    id: number;
    title: string;
    description: string;
    completed: boolean;
}

export interface ComexState {
    // Wizard control
    currentStep: number;
    steps: ComexWizardStep[];

    // Transaction data
    transaction: Partial<TransactionDetails>;

    // Compliance data
    compliance: Partial<ComplianceDetails>;

    // Documents
    documents: Record<DocumentType, UploadedDocument | null>;
    requiredDocuments: DocumentRequirement[];

    // Tax calculation
    taxBreakdown?: TaxBreakdown;

    // Submission
    isSubmitting: boolean;
    submitError?: string;
}

// ============================================
// STORE ACTIONS
// ============================================

export interface ComexActions {
    // Navigation
    nextStep: () => void;
    prevStep: () => void;
    goToStep: (step: number) => void;

    // Data updates
    updateTransaction: (data: Partial<TransactionDetails>) => void;
    updateCompliance: (data: Partial<ComplianceDetails>) => void;

    // Documents
    addDocument: (type: DocumentType, file: File) => void;
    removeDocument: (type: DocumentType) => void;
    updateRequiredDocuments: (requirements: DocumentRequirement[]) => void;

    // Tax calculation
    calculateTaxes: () => void;

    // Submission
    submitOperation: () => Promise<void>;

    // Reset
    reset: () => void;
}

// ============================================
// PAYMENT PURPOSE OPTIONS (DCIN-83 NUMERALES CAMBIARIOS)
// ============================================

/**
 * Regulatory Mode: Determines which jurisdiction's rules apply
 */
export type RegulatoryMode =
    | 'COLOMBIA_DCIN'           // Colombia: DCIN-83 strict rules
    | 'BRAZIL_BACEN'            // Brazil: BACEN regulations
    | 'INTERNATIONAL_STANDARD'; // All others: Simplified

/**
 * Jurisdiction: Country-specific regulatory framework
 */
export type Jurisdiction = 'CO' | 'BR' | 'INT';

export interface PaymentPurpose {
    code: string; // Official regulatory code or internal code
    label: string;
    operationType: ComexOperationType[];
    paymentTerm?: PaymentTerm[]; // Only for Colombia DCIN-83
    jurisdiction: Jurisdiction; // NEW: Determines which regulatory framework
}

/**
 * Official Numerales Cambiarios - Banco de la República (DCIN-83)
 * Source: Resolución Externa 1 de 2018 - Régimen Cambiario
 * 
 * NOTE: These codes ONLY apply when Colombia is involved in the transaction
 * Jurisdiction: 'CO' (Colombia)
 */
export const PAYMENT_PURPOSES: PaymentPurpose[] = [
    // ============================================
    // COLOMBIA - IMPORTS (Importaciones)
    // ============================================

    // Giro Ordinario (Standard payment after shipment)
    {
        code: '2015',
        label: '2015 - Giro Ordinario de Importaciones',
        operationType: ['import'],
        paymentTerm: ['open_account'],
        jurisdiction: 'CO'
    },

    // Anticipo (Advance payment before shipment)
    {
        code: '2017',
        label: '2017 - Pago Anticipado de Importaciones',
        operationType: ['import'],
        paymentTerm: ['advance'],
        jurisdiction: 'CO'
    },

    // Financiación > 1 mes (Financing over 1 month)
    {
        code: '2022',
        label: '2022 - Financiación de Importaciones (>1 mes)',
        operationType: ['import'],
        paymentTerm: ['open_account'],
        jurisdiction: 'CO'
    },

    // ============================================
    // COLOMBIA - EXPORTS (Exportaciones)
    // ============================================

    // Reintegro de Exportación de Bienes
    {
        code: '1000',
        label: '1000 - Reintegro de Exportación de Bienes',
        operationType: ['export'],
        jurisdiction: 'CO'
    },

    // Reintegro de Exportación de Servicios
    {
        code: '1510',
        label: '1510 - Reintegro de Exportación de Servicios',
        operationType: ['export', 'services'],
        jurisdiction: 'CO'
    },

    // ============================================
    // COLOMBIA - SERVICES (Servicios)
    // ============================================

    // Servicios Técnicos y Profesionales
    {
        code: '1840',
        label: '1840 - Servicios Técnicos, Profesionales y de Consultoría',
        operationType: ['services'],
        jurisdiction: 'CO'
    },

    // Comisiones
    {
        code: '1704',
        label: '1704 - Comisiones por Operaciones de Comercio Exterior',
        operationType: ['services'],
        jurisdiction: 'CO'
    },

    // Regalías y Licencias
    {
        code: '1842',
        label: '1842 - Regalías y Licencias',
        operationType: ['services'],
        jurisdiction: 'CO'
    },
];

// ============================================
// BRAZIL - BACEN PAYMENT PURPOSES (Natureza do Câmbio)
// ============================================

/**
 * Brazilian Central Bank (BACEN) payment purpose codes
 * Source: Circular BACEN 3.691/2013 - Natureza do Câmbio
 * 
 * NOTE: These codes ONLY apply when Brazil is involved in the transaction
 * Jurisdiction: 'BR' (Brazil)
 */
export const BRAZIL_PAYMENT_PURPOSES: PaymentPurpose[] = [
    // Imports
    {
        code: '12345',
        label: '12345 - Importação de Mercadorias',
        operationType: ['import'],
        jurisdiction: 'BR'
    },
    {
        code: '12346',
        label: '12346 - Importação de Serviços',
        operationType: ['import', 'services'],
        jurisdiction: 'BR'
    },

    // Exports
    {
        code: '22318',
        label: '22318 - Exportação de Mercadorias',
        operationType: ['export'],
        jurisdiction: 'BR'
    },
    {
        code: '22319',
        label: '22319 - Exportação de Serviços',
        operationType: ['export', 'services'],
        jurisdiction: 'BR'
    },

    // Services
    {
        code: '31100',
        label: '31100 - Serviços Técnicos e Profissionais',
        operationType: ['services'],
        jurisdiction: 'BR'
    },
    {
        code: '31200',
        label: '31200 - Royalties e Licenças',
        operationType: ['services'],
        jurisdiction: 'BR'
    },
];

// ============================================
// INTERNATIONAL PAYMENT PURPOSES (Non-Colombia, Non-Brazil)
// ============================================

/**
 * Generic international payment purposes for transactions NOT involving Colombia or Brazil
 * These are simplified codes for SWIFT/ISO compliance and general fintech use
 * Jurisdiction: 'INT' (International)
 */
export const INTERNATIONAL_PAYMENT_PURPOSES: PaymentPurpose[] = [
    // Imports
    {
        code: 'INT_GOODS',
        label: 'Payment for Goods / Pago de Mercancías',
        operationType: ['import'],
        jurisdiction: 'INT'
    },
    {
        code: 'INT_RAW_MATERIALS',
        label: 'Payment for Raw Materials / Pago de Materias Primas',
        operationType: ['import'],
        jurisdiction: 'INT'
    },

    // Exports
    {
        code: 'INT_EXPORT_GOODS',
        label: 'Export of Goods / Exportación de Bienes',
        operationType: ['export'],
        jurisdiction: 'INT'
    },

    // Services
    {
        code: 'INT_SERVICES',
        label: 'Payment for Services / Pago de Servicios',
        operationType: ['services'],
        jurisdiction: 'INT'
    },
    {
        code: 'INT_CONSULTING',
        label: 'Consulting Services / Servicios de Consultoría',
        operationType: ['services'],
        jurisdiction: 'INT'
    },
    {
        code: 'INT_ROYALTIES',
        label: 'Royalties and Licenses / Regalías y Licencias',
        operationType: ['services'],
        jurisdiction: 'INT'
    },
];

// ============================================
// CURRENCY METADATA
// ============================================

export interface CurrencyMetadata {
    symbol: string;
    name: string;
    flag: string;
    country: CountryCode;
}

export const CURRENCIES: Record<string, CurrencyMetadata> = {
    COP: {
        name: 'Colombian Peso',
        symbol: '$',
        country: 'CO',
        flag: '🇨🇴',
    },
    USD: {
        name: 'US Dollar',
        symbol: '$',
        country: 'US',
        flag: '🇺🇸',
    },
    EUR: {
        name: 'Euro',
        symbol: '€',
        country: 'EU',
        flag: '🇪🇺',
    },
    MXN: {
        name: 'Mexican Peso',
        symbol: '$',
        country: 'MX',
        flag: '🇲🇽',
    },
    BRL: {
        name: 'Brazilian Real',
        symbol: 'R$',
        country: 'BR',
        flag: '🇧🇷',
    },
    CNY: {
        name: 'Chinese Yuan',
        symbol: '¥',
        country: 'CN',
        flag: '🇨🇳',
    },
    USDT: {
        name: 'Tether (USDT)',
        symbol: '₮',
        country: 'US', // Mapped to US for regulatory purposes (stablecoin pegged to USD)
        flag: '💲',
    },
};
