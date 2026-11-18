/**
 * Review Summary - Step 4
 * 
 * Final review screen with transaction summary and tax breakdown.
 */

import { useEffect } from 'react';
import { ArrowLeft, Send, FileText, Shield, DollarSign } from '@/shared/components/animated-icons';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useLingui } from '@lingui/react/macro';

import { Button } from '@/shared/components/ui/button';
import { Separator } from '@/shared/components/ui/separator';
import { Badge } from '@/shared/components/ui/badge';
import { Card } from '@/shared/components/ui/card';

import { useComexStore } from '../hooks/useComexStore';
import { CURRENCIES, PAYMENT_PURPOSES, type PaymentPurpose, type UploadedDocument, type DocumentRequirement } from '../types/comex.types';

export function ReviewSummary() {
    const {
        transaction,
        compliance,
        documents,
        requiredDocuments,
        taxBreakdown,
        calculateTaxes,
        submitOperation,
        isSubmitting,
        prevStep,
    } = useComexStore();
    const { t } = useLingui();

    // Calculate taxes on mount
    useEffect(() => {
        calculateTaxes();
    }, [calculateTaxes]);

    const handleSubmit = async () => {
        try {
            await submitOperation();
            toast.success(t`Operación registrada`, {
                description: t`Tu solicitud está siendo procesada`,
            });
        } catch (error) {
            toast.error(t`No pudimos crear la operación`, {
                description: error instanceof Error ? error.message : t`Intenta nuevamente`,
            });
        }
    };

    const sourceCurrency = CURRENCIES[transaction.sourceCurrency || 'COP'];
    const targetCurrency = CURRENCIES[transaction.targetCurrency || 'USD'];
    const paymentPurpose = PAYMENT_PURPOSES.find((p: PaymentPurpose) => p.code === compliance.paymentPurpose);

    const uploadedDocsCount = Object.values(documents).filter((d) => d !== null).length;

    return (
        <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -20, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
        >
            {/* Header */}
            <div className="space-y-2">
                <h3 className="text-2xl font-heading text-foreground">Revisión Final</h3>
                <p className="text-muted-foreground">
                    Verifica los detalles de tu operación antes de confirmar
                </p>
            </div>

            {/* Transaction Summary */}
            <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="rounded-full bg-primary/10 p-2">
                        <DollarSign className="w-5 h-5 text-primary" />
                    </div>
                    <h4 className="font-heading text-lg text-foreground">Detalles de la Transacción</h4>
                </div>

                <div className="space-y-3">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Par de Divisas</span>
                        <span className="font-semibold text-foreground">
                            {sourceCurrency?.flag} {transaction.sourceCurrency} → {targetCurrency?.flag}{' '}
                            {transaction.targetCurrency}
                        </span>
                    </div>

                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Monto</span>
                        <span className="font-semibold font-mono tabular-nums text-foreground">
                            {sourceCurrency?.symbol}
                            {transaction.amount?.toLocaleString('es-CO', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            })}
                        </span>
                    </div>

                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Tasa de Cambio</span>
                        <span className="font-semibold font-mono tabular-nums text-foreground">
                            {transaction.exchangeRate?.toLocaleString('es-CO', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            })}
                        </span>
                    </div>

                    {transaction.beneficiaryName && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Beneficiario</span>
                            <span className="font-semibold text-foreground">{transaction.beneficiaryName}</span>
                        </div>
                    )}
                </div>
            </Card>

            {/* Compliance Summary */}
            <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="rounded-full bg-primary/10 p-2">
                        <Shield className="w-5 h-5 text-primary" />
                    </div>
                    <h4 className="font-heading text-lg text-foreground">Información Regulatoria</h4>
                </div>

                <div className="space-y-3">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Tipo de Operación</span>
                        <Badge variant="secondary">
                            {compliance.operationType === 'import'
                                ? 'Importación'
                                : compliance.operationType === 'export'
                                    ? 'Exportación'
                                    : 'Servicios'}
                        </Badge>
                    </div>

                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Motivo de Pago</span>
                        <span className="font-semibold text-foreground">{paymentPurpose?.label}</span>
                    </div>

                    {compliance.incoterm && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Incoterm</span>
                            <Badge variant="outline">{compliance.incoterm}</Badge>
                        </div>
                    )}

                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Parte Relacionada</span>
                        <Badge variant={compliance.isRelatedParty ? 'destructive' : 'secondary'}>
                            {compliance.isRelatedParty ? 'Sí' : 'No'}
                        </Badge>
                    </div>
                </div>
            </Card>

            {/* Documents Summary */}
            <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="rounded-full bg-primary/10 p-2">
                        <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <h4 className="font-heading text-lg text-foreground">Documentos</h4>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Documentos Cargados</span>
                        <span className="font-semibold font-mono tabular-nums text-foreground">
                            {uploadedDocsCount} / {requiredDocuments.filter((d) => d.required).length}
                        </span>
                    </div>

                    {Object.values(documents)
                        .filter((d): d is UploadedDocument => d !== null)
                        .map((doc) => {
                            const requirement = requiredDocuments.find((r: DocumentRequirement) => r.type === doc.type);
                            return (
                                <div
                                    key={doc.id}
                                    className="flex items-center justify-between p-2 rounded-xl bg-muted/50"
                                >
                                    <span className="text-sm text-foreground">{requirement?.label}</span>
                                    <Badge variant="secondary" className="text-xs">
                                        {(doc.file.size / 1024).toFixed(2)} KB
                                    </Badge>
                                </div>
                            );
                        })}
                </div>
            </Card>

            {/* Tax Breakdown */}
            {taxBreakdown && (
                <Card className="border border-border">
                    <h4 className="font-heading text-lg text-foreground mb-4">Desglose de Impuestos</h4>

                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Monto Base</span>
                            <span className="font-semibold font-mono tabular-nums text-foreground">
                                {sourceCurrency?.symbol}
                                {taxBreakdown.baseAmount.toLocaleString('es-CO', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                })}
                            </span>
                        </div>

                        <div className="flex justify-between">
                            <span className="text-muted-foreground">GMF (4x1000)</span>
                            <span className="font-semibold font-mono tabular-nums text-warning">
                                {sourceCurrency?.symbol}
                                {taxBreakdown.gmf.toLocaleString('es-CO', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                })}
                            </span>
                        </div>

                        {taxBreakdown.retencion && taxBreakdown.retencion > 0 && (
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Retención en la Fuente</span>
                                <span className="font-semibold font-mono tabular-nums text-warning">
                                    {sourceCurrency?.symbol}
                                    {taxBreakdown.retencion.toLocaleString('es-CO', {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                    })}
                                </span>
                            </div>
                        )}

                        <Separator />

                        <div className="flex justify-between items-center">
                            <span className="text-lg font-heading text-foreground">Total a Pagar</span>
                            <span className="text-2xl font-heading font-mono tabular-nums text-primary">
                                {sourceCurrency?.symbol}
                                {taxBreakdown.netAmount.toLocaleString('es-CO', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                })}
                            </span>
                        </div>
                    </div>
                </Card>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-4">
                <Button type="button" variant="outline" onClick={prevStep} className="gap-2">
                    <ArrowLeft className="w-4 h-4" />
                    Atrás
                </Button>
                <Button
                    type="button"
                    variant="gradient"
                    size="lg"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="gap-2"
                >
                    {isSubmitting ? t`Un momento...` : t`Confirmar y Enviar`}
                    <Send className="w-4 h-4" />
                </Button>
            </div>
        </motion.div>
    );
}
