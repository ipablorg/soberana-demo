/**
 * COMEX Zustand Store
 * 
 * Global state management for the COMEX wizard flow.
 * Handles transaction data, compliance info, documents, and wizard navigation.
 */

import { create } from 'zustand';
import type {
    ComexState,
    ComexActions,
    TransactionDetails,
    ComplianceDetails,
    DocumentType,
    DocumentRequirement,
    UploadedDocument,
    TaxBreakdown,
} from '../types/comex.types';

const WIZARD_STEPS = [
    {
        id: 1,
        title: 'Cotización',
        description: 'Selecciona el par de divisas y monto',
        completed: false,
    },
    {
        id: 2,
        title: 'Cumplimiento',
        description: 'Información regulatoria',
        completed: false,
    },
    {
        id: 3,
        title: 'Documentos',
        description: 'Carga los documentos requeridos',
        completed: false,
    },
    {
        id: 4,
        title: 'Revisión',
        description: 'Confirma y firma la operación',
        completed: false,
    },
];

const initialState: ComexState = {
    currentStep: 1,
    steps: WIZARD_STEPS,
    transaction: {
        paymentTerm: 'open_account', // Default: Pago contra embarque
    },
    compliance: {},
    documents: {
        invoice: null,
        vuce_registry: null,
        service_contract: null,
        internal_note: null,
        customs_declaration: null,
        certificate_origin: null,
        transfer_pricing_study: null, // Mexico related party
    },
    requiredDocuments: [],
    isSubmitting: false,
};

export const useComexStore = create<ComexState & ComexActions>((set, get) => ({
    ...initialState,

    // ============================================
    // NAVIGATION
    // ============================================

    nextStep: () => {
        const { currentStep, steps } = get();
        if (currentStep < steps.length) {
            set((state) => ({
                currentStep: currentStep + 1,
                steps: state.steps.map((step) =>
                    step.id === currentStep ? { ...step, completed: true } : step
                ),
            }));
        }
    },

    prevStep: () => {
        const { currentStep } = get();
        if (currentStep > 1) {
            set({ currentStep: currentStep - 1 });
        }
    },

    goToStep: (step: number) => {
        const { steps } = get();
        if (step >= 1 && step <= steps.length) {
            set({ currentStep: step });
        }
    },

    // ============================================
    // DATA UPDATES
    // ============================================

    updateTransaction: (data: Partial<TransactionDetails>) => {
        set((state) => ({
            transaction: { ...state.transaction, ...data },
        }));
    },

    updateCompliance: (data: Partial<ComplianceDetails>) => {
        set((state) => ({
            compliance: { ...state.compliance, ...data },
        }));
    },

    // ============================================
    // DOCUMENTS
    // ============================================

    addDocument: (type: DocumentType, file: File) => {
        const uploadedDoc: UploadedDocument = {
            id: `${type}-${Date.now()}`,
            type,
            file,
            uploadedAt: new Date(),
            status: 'uploaded',
        };

        set((state) => ({
            documents: {
                ...state.documents,
                [type]: uploadedDoc,
            },
        }));
    },

    removeDocument: (type: DocumentType) => {
        set((state) => ({
            documents: {
                ...state.documents,
                [type]: null,
            },
        }));
    },

    updateRequiredDocuments: (requirements: DocumentRequirement[]) => {
        set({ requiredDocuments: requirements });
    },

    // ============================================
    // TAX CALCULATION
    // ============================================

    calculateTaxes: () => {
        const { transaction } = get();
        const amount = transaction.amount || 0;

        // GMF: 4x1000 = 0.4%
        const gmf = amount * 0.004;

        // Retención: Simplified calculation (2.5% for services, 1% for goods)
        // In real implementation, this would be based on compliance.operationType
        const retencion = amount * 0.01;

        const totalTaxes = gmf + retencion;
        const netAmount = amount + totalTaxes;

        const taxBreakdown: TaxBreakdown = {
            baseAmount: amount,
            gmf,
            retencion,
            totalTaxes,
            netAmount,
        };

        set({ taxBreakdown });
    },

    // ============================================
    // SUBMISSION
    // ============================================

    submitOperation: async () => {
        set({ isSubmitting: true, submitError: undefined });

        try {
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 2000));

            // In real implementation, this would call the API
            // const result = await comexAdapter.createOperation(get());

            // Success: Reset state
            set({
                ...initialState,
                isSubmitting: false,
            });

            return Promise.resolve();
        } catch (error) {
            set({
                isSubmitting: false,
                submitError: error instanceof Error ? error.message : 'Error desconocido',
            });
            return Promise.reject(error);
        }
    },

    // ============================================
    // RESET
    // ============================================

    reset: () => {
        set(initialState);
    },
}));
