import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { Card } from '@/shared/components/ui/card';
import { DynamicIsland } from '@/shared/components/DynamicIsland';
import { useDynamicIslandStore } from '@/shared/stores/useDynamicIslandStore';
import { TypewriterText } from '@/shared/components/common/TypewriterText';
import { PageHeader } from '@/shared/components/common/PageHeader';

import { useComexStore } from '../hooks/useComexStore';
import { TransactionDetailsForm } from '../components/forms/TransactionDetailsForm';
import { ComplianceDetailsForm } from '../components/forms/ComplianceDetailsForm';
import { DocumentUploadZone } from '../components/forms/DocumentUploadZone';
import { ReviewSummary } from '../components/ReviewSummary';
import { useLingui } from '@lingui/react/macro';

export default function NewOperationWizard() {
    const { currentStep } = useComexStore();
    const { setStep: setIslandStep, hide: hideIsland, reset: resetIsland } = useDynamicIslandStore();
    const { t } = useLingui();

    const COMEX_STEP_MESSAGES: Record<number, string> = {
        1: t`¿Qué operación quieres cotizar?`,
        2: t`Completa los datos regulatorios`,
        3: t`Adjunta la documentación requerida`,
        4: t`Revisa y firma la operación`,
    };

    const COMEX_STEP_NAMES: Record<number, string> = {
        1: t`Cotización`,
        2: t`Cumplimiento`,
        3: t`Documentos`,
        4: t`Revisión`,
    };

    useEffect(() => {
        setIslandStep(currentStep - 1, 4, COMEX_STEP_NAMES[currentStep] || '');
        return () => { hideIsland(); resetIsland(); };
    }, []);

    useEffect(() => {
        setIslandStep(currentStep - 1, 4, COMEX_STEP_NAMES[currentStep] || '');
    }, [currentStep, setIslandStep]);

    return (
        <div className="container max-w-4xl mx-auto py-8 px-4">
            <PageHeader
                title={t`Nueva operación COMEX`}
                subtitle={t`Pagos internacionales regulados.`}
            />

            {/* Dynamic Island + TypewriterText */}
            <div className="flex flex-col items-center">
                <DynamicIsland showBalance={false} />
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-center mt-6 mb-8"
                    >
                        <h2 className="font-heading text-2xl font-bold text-foreground">
                            <TypewriterText
                                text={COMEX_STEP_MESSAGES[currentStep] || ''}
                                speed={30}
                                delay={0}
                            />
                        </h2>
                    </motion.div>
                </AnimatePresence>
            </div>

            <Card className="p-8">
                <AnimatePresence mode="wait">
                    {currentStep === 1 && <TransactionDetailsForm key="step-1" />}
                    {currentStep === 2 && <ComplianceDetailsForm key="step-2" />}
                    {currentStep === 3 && <DocumentUploadZone key="step-3" />}
                    {currentStep === 4 && <ReviewSummary key="step-4" />}
                </AnimatePresence>
            </Card>

            <div className="mt-6 text-center">
                <p className="text-xs text-muted-foreground">
                    {t`Tus datos están protegidos con encriptación de extremo a extremo`}
                </p>
            </div>
        </div>
    );
}
