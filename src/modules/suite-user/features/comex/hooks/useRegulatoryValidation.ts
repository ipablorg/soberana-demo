/**
 * COMEX Regulatory Validation Hook
 * 
 * Provides business logic for document requirements based on:
 * - Origin/Destination countries
 * - Transaction amount
 * - Operation type
 * 
 * Implements DCIN-83 and DIAN compliance rules.
 */

import { useMemo } from 'react';
import type {
    DocumentRequirement,
    CountryCode,
    ComexOperationType,
    PaymentPurpose,
    RegulatoryMode,
} from '../types/comex.types';
import { PAYMENT_PURPOSES, INTERNATIONAL_PAYMENT_PURPOSES, BRAZIL_PAYMENT_PURPOSES } from '../types/comex.types';

interface ValidationParams {
    originCountry: CountryCode;
    destinationCountry: CountryCode;
    amount: number;
    operationType: ComexOperationType;
    isRelatedParty?: boolean; // For Mexico transfer pricing
}

/**
 * Regulatory Router: Determines which jurisdiction's rules apply
 * 
 * CRITICAL: This is the gatekeeper that prevents regulatory leaks
 * 
 * Returns:
 * - 'COLOMBIA_DCIN': If EITHER origin OR destination is Colombia
 *   → Activates: DCIN-83 codes, Payment Term filtering, D.I. requirement
 * 
 * - 'BRAZIL_BACEN': If EITHER origin OR destination is Brazil (and NOT Colombia)
 *   → Activates: BACEN codes, Brazilian regulations
 * 
 * - 'INTERNATIONAL_STANDARD': All other cases
 *   → Activates: Generic INT_* codes, no payment term filtering
 */
export function getRegulatoryMode(origin: CountryCode, destination: CountryCode): RegulatoryMode {
    // Colombia takes precedence
    if (origin === 'CO' || destination === 'CO') {
        return 'COLOMBIA_DCIN';
    }

    // Brazil (if Colombia not involved)
    if (origin === 'BR' || destination === 'BR') {
        return 'BRAZIL_BACEN';
    }

    // All others
    return 'INTERNATIONAL_STANDARD';
}

export function useRegulatoryValidation() {
    /**
     * Get required documents based on transaction parameters
     * 
     * Document Matrix Logic:
     * - CO → CN + >$1000: Invoice + VUCE Registry
     * - CO → US + Services: Invoice + Service Contract
     * - Latam Internal: Internal Note
     * - All imports >$5000: Customs Declaration
     */
    const getRequiredDocuments = useMemo(() => {
        return (params: ValidationParams): DocumentRequirement[] => {
            const { originCountry, destinationCountry, amount, operationType } = params;
            const requirements: DocumentRequirement[] = [];

            // Base document: Invoice (always required for imports/exports)
            if (operationType === 'import' || operationType === 'export') {
                requirements.push({
                    type: 'invoice',
                    label: 'Factura Comercial',
                    description: 'Factura original del proveedor o cliente',
                    required: true,
                    maxSizeMB: 5,
                    acceptedFormats: ['application/pdf', 'image/jpeg', 'image/png'],
                });
            }

            // China-specific requirements
            if (destinationCountry === 'CN' && amount > 1000) {
                requirements.push({
                    type: 'vuce_registry',
                    label: 'Registro VUCE',
                    description: 'Ventanilla Única de Comercio Exterior',
                    required: true,
                    maxSizeMB: 5,
                    acceptedFormats: ['application/pdf'],
                });
            }

            // USA Services requirements
            if (destinationCountry === 'US' && operationType === 'services') {
                requirements.push({
                    type: 'service_contract',
                    label: 'Contrato de Servicios',
                    description: 'Contrato firmado entre las partes',
                    required: true,
                    maxSizeMB: 10,
                    acceptedFormats: ['application/pdf'],
                });
            }

            // Latam internal operations
            const latamCountries: CountryCode[] = ['BR', 'MX'];
            if (latamCountries.includes(destinationCountry)) {
                requirements.push({
                    type: 'internal_note',
                    label: 'Nota Interna',
                    description: 'Justificación de la operación',
                    required: true,
                    maxSizeMB: 3,
                    acceptedFormats: ['application/pdf', 'application/msword'],
                });
            }

            // Mexico Transfer Pricing (Related Party Transactions)
            // CRITICAL: SAT requires transfer pricing study for related party transactions
            if (destinationCountry === 'MX' && params.isRelatedParty) {
                requirements.push({
                    type: 'transfer_pricing_study',
                    label: 'Estudio de Precios de Transferencia (Anexo SAT)',
                    description: 'Estudio requerido por SAT para operaciones con partes relacionadas',
                    required: true,
                    maxSizeMB: 10,
                    acceptedFormats: ['application/pdf'],
                });
            }

            // High-value imports: Customs declaration
            if (operationType === 'import' && amount > 5000) {
                requirements.push({
                    type: 'customs_declaration',
                    label: 'Declaración de Importación',
                    description: 'Documento de aduana (DUI)',
                    required: true,
                    maxSizeMB: 5,
                    acceptedFormats: ['application/pdf'],
                });
            }

            // Certificate of Origin (for all exports)
            if (operationType === 'export') {
                requirements.push({
                    type: 'certificate_origin',
                    label: 'Certificado de Origen',
                    description: 'Certificado emitido por autoridad competente',
                    required: amount > 2000,
                    maxSizeMB: 5,
                    acceptedFormats: ['application/pdf'],
                });
            }

            return requirements;
        };
    }, []);

    /**
     * Get filtered payment purposes based on regulatory mode
     * 
     * STRICT GEO-FENCING LOGIC:
     * - COLOMBIA_DCIN → Use DCIN-83 codes with payment term filtering
     * - BRAZIL_BACEN → Use BACEN codes (future implementation)
     * - INTERNATIONAL_STANDARD → Use generic INT_* codes (no payment term filtering)
     * 
     * CRITICAL: Payment term filtering ONLY applies to Colombia
     */
    const getPaymentPurposes = useMemo(() => {
        return (
            operationType: ComexOperationType,
            paymentTerm?: string,
            originCountry?: CountryCode,
            destinationCountry?: CountryCode
        ): PaymentPurpose[] => {
            // Determine regulatory mode
            const mode = originCountry && destinationCountry
                ? getRegulatoryMode(originCountry, destinationCountry)
                : 'INTERNATIONAL_STANDARD';

            // Route to appropriate jurisdiction
            switch (mode) {
                case 'COLOMBIA_DCIN':
                    // Colombia: Apply strict DCIN-83 filtering with payment term
                    return PAYMENT_PURPOSES.filter((purpose) => {
                        // Must match operation type
                        if (!purpose.operationType.includes(operationType)) {
                            return false;
                        }

                        // If purpose has payment term restrictions, check them
                        if (purpose.paymentTerm && paymentTerm) {
                            return purpose.paymentTerm.includes(paymentTerm as any);
                        }

                        // If no payment term restriction, include it
                        return true;
                    });

                case 'BRAZIL_BACEN':
                    // Brazil: Use BACEN codes (Natureza do Câmbio)
                    // NO payment term filtering (only Colombia uses this)
                    return BRAZIL_PAYMENT_PURPOSES.filter((purpose) =>
                        purpose.operationType.includes(operationType)
                    );

                case 'INTERNATIONAL_STANDARD':
                default:
                    // International: Use generic codes, NO payment term filtering
                    return INTERNATIONAL_PAYMENT_PURPOSES.filter((purpose) =>
                        purpose.operationType.includes(operationType)
                    );
            }
        };
    }, []);

    /**
     * Validate if Incoterm is required
     */
    const isIncotermRequired = (operationType: ComexOperationType): boolean => {
        return operationType === 'import';
    };

    /**
     * Calculate GMF (Gravamen a los Movimientos Financieros)
     * 4x1000 = 0.4%
     */
    const calculateGMF = (amount: number): number => {
        return amount * 0.004;
    };

    /**
     * Calculate Retención en la Fuente (if applicable)
     * Simplified: 2.5% for services, 1% for goods
     */
    const calculateRetencion = (
        amount: number,
        operationType: ComexOperationType
    ): number => {
        if (operationType === 'services') {
            return amount * 0.025; // 2.5%
        }
        return amount * 0.01; // 1%
    };

    /**
     * Validate compliance data completeness
     */
    const validateCompliance = (data: {
        operationType?: ComexOperationType;
        paymentPurpose?: string;
        incoterm?: string;
        originCountry?: CountryCode;
        destinationCountry?: CountryCode;
    }): { valid: boolean; errors: string[] } => {
        const errors: string[] = [];

        if (!data.operationType) {
            errors.push('Selecciona el tipo de operación');
        }

        if (!data.paymentPurpose) {
            errors.push('Selecciona el motivo de pago');
        }

        if (data.operationType === 'import' && !data.incoterm) {
            errors.push('Selecciona el Incoterm para importaciones');
        }

        if (!data.originCountry || !data.destinationCountry) {
            errors.push('Selecciona el país de origen y destino');
        }

        return {
            valid: errors.length === 0,
            errors,
        };
    };

    return {
        getRequiredDocuments,
        isIncotermRequired,
        getPaymentPurposes,
        getRegulatoryMode, // Export for form components
    };
}
