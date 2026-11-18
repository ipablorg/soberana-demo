/**
 * Compliance Details Form - Step 2
 * 
 * Regulatory information with conditional Incoterm field.
 */

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowRight, ArrowLeft, Shield } from '@/shared/components/animated-icons';
import { motion } from 'framer-motion';

import { Button } from '@/shared/components/ui/button';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/shared/components/ui/form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/shared/components/ui/select';
import { Switch } from '@/shared/components/ui/switch';
import { Input } from '@/shared/components/ui/input';

import { useComexStore } from '../../hooks/useComexStore';
import { useRegulatoryValidation } from '../../hooks/useRegulatoryValidation';
import type { Incoterm, CountryCode } from '../../types/comex.types';
import { CURRENCIES } from '../../types/comex.types';

// ============================================
// VALIDATION SCHEMA
// ============================================

const complianceSchema = z.object({
    operationType: z.enum(['import', 'export', 'services']),
    paymentPurpose: z.string().min(1, 'Elige el motivo de pago'),
    incoterm: z.string().optional(),
    isRelatedParty: z.boolean(),
    hsCode: z.string().optional(),
    customsDeclarationNumber: z.string().optional(),
});

type ComplianceFormData = z.infer<typeof complianceSchema>;

// ============================================
// INCOTERM OPTIONS
// ============================================

const INCOTERMS: { value: Incoterm; label: string; description: string }[] = [
    { value: 'FOB', label: 'FOB', description: 'Free On Board' },
    { value: 'CIF', label: 'CIF', description: 'Cost, Insurance and Freight' },
    { value: 'EXW', label: 'EXW', description: 'Ex Works' },
    { value: 'DDP', label: 'DDP', description: 'Delivered Duty Paid' },
    { value: 'FCA', label: 'FCA', description: 'Free Carrier' },
    { value: 'DAP', label: 'DAP', description: 'Delivered At Place' },
];

// ============================================
// COMPONENT
// ============================================

export function ComplianceDetailsForm() {
    const { compliance, transaction, updateCompliance, updateRequiredDocuments, nextStep, prevStep } =
        useComexStore();
    const { getPaymentPurposes, isIncotermRequired, getRequiredDocuments, getRegulatoryMode } =
        useRegulatoryValidation();

    const form = useForm<ComplianceFormData>({
        resolver: zodResolver(complianceSchema),
        defaultValues: {
            operationType: compliance.operationType || 'import',
            paymentPurpose: compliance.paymentPurpose || '',
            incoterm: compliance.incoterm || undefined,
            isRelatedParty: compliance.isRelatedParty || false,
            hsCode: compliance.hsCode || '',
            customsDeclarationNumber: compliance.customsDeclarationNumber || '',
        },
    });

    const operationType = form.watch('operationType');
    const isRelatedParty = form.watch('isRelatedParty');
    const showIncoterm = isIncotermRequired(operationType);

    // Derive countries from currency pair FIRST (needed for geo-fencing)
    const sourceCurrency = transaction.sourceCurrency || 'COP';
    const targetCurrency = transaction.targetCurrency || 'USD';
    const originCountry = CURRENCIES[sourceCurrency]?.country || 'CO';
    const destinationCountry = CURRENCIES[targetCurrency]?.country || 'US';

    // Determine regulatory mode for context-aware labels
    const regulatoryMode = getRegulatoryMode(originCountry as CountryCode, destinationCountry as CountryCode);

    // Dynamic label for payment purpose dropdown
    const paymentPurposeLabel = regulatoryMode === 'COLOMBIA_DCIN'
        ? 'Numeral Cambiario (DCIN-83)'
        : regulatoryMode === 'BRAZIL_BACEN'
            ? 'Natureza do Câmbio (BACEN)'
            : 'Propósito del Pago / Payment Purpose';

    // Get payment term from transaction (set in Step 1)
    const paymentTerm = transaction.paymentTerm || 'open_account';

    // Customs Declaration is required ONLY if Colombia AND open_account
    const showCustomsDeclaration = regulatoryMode === 'COLOMBIA_DCIN' &&
        operationType === 'import' &&
        paymentTerm === 'open_account';

    // Get filtered payment purposes (now with payment term AND countries for geo-fencing)
    const paymentPurposes = getPaymentPurposes(
        operationType,
        paymentTerm,
        originCountry as CountryCode,
        destinationCountry as CountryCode
    );

    // Update required documents when compliance data changes
    useEffect(() => {
        if (operationType && transaction.amount) {
            const requirements = getRequiredDocuments({
                originCountry: originCountry as CountryCode,
                destinationCountry: destinationCountry as CountryCode,
                amount: transaction.amount,
                operationType,
                isRelatedParty, // For Mexico transfer pricing
            });
            updateRequiredDocuments(requirements);
        }
    }, [
        operationType,
        transaction.amount,
        originCountry,
        destinationCountry,
        isRelatedParty, // Add to dependencies
        getRequiredDocuments,
        updateRequiredDocuments,
    ]);

    const onSubmit = (data: ComplianceFormData) => {
        updateCompliance({
            ...data,
            incoterm: data.incoterm as Incoterm | undefined,
            originCountry: originCountry as CountryCode,
            destinationCountry: destinationCountry as CountryCode,
        });
        nextStep();
    };

    return (
        <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -20, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
        >
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Compliance Header */}
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/10 border border-primary/20">
                        <Shield className="w-5 h-5 text-primary" />
                        <div>
                            <p className="font-heading text-foreground">Información Regulatoria</p>
                            <p className="text-sm text-muted-foreground">
                                Cumplimiento DCIN-83 y DIAN
                            </p>
                        </div>
                    </div>

                    {/* Operation Type */}
                    <FormField
                        control={form.control}
                        name="operationType"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="font-heading text-foreground">
                                    Tipo de Operación
                                </FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                                <SelectValue placeholder="Elige el tipo" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="import">Importación</SelectItem>
                                        <SelectItem value="export">Exportación</SelectItem>
                                        <SelectItem value="services">Servicios</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Payment Purpose (Filtered by Operation Type) */}
                    <FormField
                        control={form.control}
                        name="paymentPurpose"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="font-heading text-foreground">
                                    {paymentPurposeLabel}
                                </FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                                <SelectValue placeholder="Elige el motivo" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {paymentPurposes.map((purpose) => (
                                            <SelectItem key={purpose.code} value={purpose.code}>
                                                {purpose.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormDescription>
                                    Según el tipo de operación que elegiste
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Incoterm (Conditional: Only for Imports) */}
                    {showIncoterm && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <FormField
                                control={form.control}
                                name="incoterm"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-heading text-foreground">
                                            Incoterm
                                        </FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Elige el Incoterm" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {INCOTERMS.map((incoterm) => (
                                                    <SelectItem key={incoterm.value} value={incoterm.value}>
                                                        <span className="flex items-center gap-2">
                                                            <span className="font-semibold">{incoterm.label}</span>
                                                            <span className="text-muted-foreground">
                                                                - {incoterm.description}
                                                            </span>
                                                        </span>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormDescription>
                                            Requerido para importaciones de bienes
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </motion.div>
                    )}

                    {/* HS Code (Subpartida Arancelaria) - DIAN */}
                    {operationType === 'import' && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <FormField
                                control={form.control}
                                name="hsCode"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-heading text-foreground">
                                            Código HS (Subpartida Arancelaria)
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                type="text"
                                                placeholder="0000.00.00.00"
                                                maxLength={10}
                                                className="tabular-nums"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Código de 10 dígitos para clasificación arancelaria (DIAN)
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </motion.div>
                    )}

                    {/* Declaración de Importación (D.I.) - Conditional */}
                    {showCustomsDeclaration && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <FormField
                                control={form.control}
                                name="customsDeclarationNumber"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-heading text-foreground">
                                            Declaración de Importación (D.I.)
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                type="text"
                                                placeholder="Número de D.I."
                                                className="tabular-nums"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Requerido cuando la mercancía ya está nacionalizada en Colombia
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </motion.div>
                    )}

                    {/* Related Party (Transfer Pricing) */}
                    <FormField
                        control={form.control}
                        name="isRelatedParty"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-xl border-2 border-border p-4">
                                <div className="space-y-0.5">
                                    <FormLabel className="font-heading text-foreground">
                                        Parte Relacionada
                                    </FormLabel>
                                    <FormDescription>
                                        ¿La transacción es con una empresa vinculada? (Precios de transferencia)
                                    </FormDescription>
                                </div>
                                <FormControl>
                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                            </FormItem>
                        )}
                    />

                    {/* Navigation Buttons */}
                    <div className="flex justify-between pt-4">
                        <Button type="button" variant="outline" onClick={prevStep} className="gap-2">
                            <ArrowLeft className="w-4 h-4" />
                            Atrás
                        </Button>
                        <Button type="submit" variant="gradient" size="lg" className="gap-2">
                            Continuar
                            <ArrowRight className="w-4 h-4" />
                        </Button>
                    </div>
                </form>
            </Form>
        </motion.div>
    );
}
