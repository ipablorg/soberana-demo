/**
 * Transaction Details Form - Step 1
 * 
 * Currency pair selection and amount input with live rate simulation.
 */

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowRight, TrendingUp } from '@/shared/components/animated-icons';
import { motion } from 'framer-motion';

import { Button } from '@/shared/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/shared/components/ui/form';
import { Input } from '@/shared/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/shared/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/shared/components/ui/radio-group';
import { Card } from '@/shared/components/ui/card';

import { useComexStore } from '../../hooks/useComexStore';
import { useRegulatoryValidation } from '../../hooks/useRegulatoryValidation';
import { CURRENCIES, type CurrencyPair, type CountryCode } from '../../types/comex.types';

// ============================================
// VALIDATION SCHEMA
// ============================================

const transactionSchema = z.object({
    sourceCurrency: z.string().min(1, 'Elige la moneda de origen'),
    targetCurrency: z.string().min(1, 'Elige la moneda de destino'),
    amount: z.number().min(1, 'Ingresa un monto mayor a 0'),
    paymentTerm: z.enum(['advance', 'open_account']).optional(), // Made optional - will be validated conditionally
    beneficiaryName: z.string().optional(),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

// ============================================
// COMPONENT
// ============================================

export function TransactionDetailsForm() {
    const { transaction, updateTransaction, nextStep } = useComexStore();
    const { getRegulatoryMode } = useRegulatoryValidation();

    const form = useForm<TransactionFormData>({
        resolver: zodResolver(transactionSchema),
        defaultValues: {
            sourceCurrency: transaction.sourceCurrency || 'USD', // Changed from COP to USD
            targetCurrency: transaction.targetCurrency || 'COP', // Changed from USD to COP
            amount: transaction.amount || undefined, // Changed from 0 to undefined (no default)
            paymentTerm: transaction.paymentTerm || 'open_account',
            beneficiaryName: transaction.beneficiaryName || '',
        },
    });

    const sourceCurrency = form.watch('sourceCurrency');
    const targetCurrency = form.watch('targetCurrency');
    const amount = form.watch('amount');

    // Geo-Fencing: Determine regulatory mode
    const originCountry = CURRENCIES[sourceCurrency]?.country || 'CO';
    const destinationCountry = CURRENCIES[targetCurrency]?.country || 'US';
    const regulatoryMode = getRegulatoryMode(originCountry as CountryCode, destinationCountry as CountryCode);

    // Payment Term selector ONLY visible for Colombia
    const showPaymentTerm = regulatoryMode === 'COLOMBIA_DCIN';

    // Simulate exchange rate (in real app, fetch from API)
    const exchangeRate = 4250; // COP to USD example
    const estimatedTotal = amount * exchangeRate;

    // Update store when form changes
    useEffect(() => {
        const pair = `${sourceCurrency}-${targetCurrency}` as CurrencyPair;
        updateTransaction({
            sourceCurrency,
            targetCurrency,
            pair,
            amount,
            exchangeRate,
            estimatedTotal,
        });
    }, [sourceCurrency, targetCurrency, amount, exchangeRate, estimatedTotal, updateTransaction]);

    const onSubmit = (data: TransactionFormData) => {
        // Conditional validation: paymentTerm is required ONLY for Colombian transactions
        if (regulatoryMode === 'COLOMBIA_DCIN' && !data.paymentTerm) {
            form.setError('paymentTerm', {
                type: 'manual',
                message: 'Elige el momento de pago',
            });
            return;
        }

        updateTransaction({
            ...data,
            pair: `${data.sourceCurrency}-${data.targetCurrency}` as CurrencyPair,
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
                    {/* Currency Pair Selection */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Source Currency */}
                        <FormField
                            control={form.control}
                            name="sourceCurrency"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="font-heading text-foreground">Moneda de Origen</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="bg-background border-border">
                                                <SelectValue placeholder="Elige moneda" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {Object.entries(CURRENCIES).map(([code, currency]) => (
                                                <SelectItem key={code} value={code}>
                                                    <div className="flex items-center gap-2">
                                                        <span>{currency.flag}</span>
                                                        <span>{code}</span>
                                                        <span className="text-muted-foreground">- {currency.name}</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Target Currency */}
                        <FormField
                            control={form.control}
                            name="targetCurrency"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="font-heading text-foreground">Moneda de Destino</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="bg-background border-border">
                                                <SelectValue placeholder="Elige moneda" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {Object.entries(CURRENCIES)
                                                .filter(([code]) => code !== sourceCurrency)
                                                .map(([code, currency]) => (
                                                    <SelectItem key={code} value={code}>
                                                        <div className="flex items-center gap-2">
                                                            <span>{currency.flag}</span>
                                                            <span>{code}</span>
                                                            <span className="text-muted-foreground">- {currency.name}</span>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* Amount Input */}
                    <FormField
                        control={form.control}
                        name="amount"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="font-heading text-foreground">Monto</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        placeholder="0.00"
                                        className="font-mono tabular-nums text-lg bg-background border-border"
                                        {...field}
                                        value={field.value || ''}
                                        onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Payment Term (Momento de Pago) - DCIN-83 */}
                    {/* Only show for Colombia-regulated transactions */}
                    {showPaymentTerm && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <FormField
                                control={form.control}
                                name="paymentTerm"
                                render={({ field }) => (
                                    <FormItem className="space-y-3">
                                        <FormLabel className="font-heading text-foreground">
                                            Momento de Pago (DCIN-83)
                                        </FormLabel>
                                        <FormControl>
                                            <RadioGroup
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                                className="grid grid-cols-1 md:grid-cols-2 gap-4"
                                            >
                                                <motion.div transition={{ duration: 0.2 }}>
                                                    <Card
                                                        className={`cursor-pointer transition-colors duration-150 border ${field.value === 'advance'
                                                            ? 'border-border'
                                                            : 'border-transparent hover:bg-muted/30'
                                                            }`}
                                                    >
                                                        <div className="flex items-center space-x-3 p-2">
                                                            <RadioGroupItem value="advance" id="advance" />
                                                            <label
                                                                htmlFor="advance"
                                                                className="flex-1 cursor-pointer"
                                                            >
                                                                <p className="font-semibold text-foreground">
                                                                    Anticipo
                                                                </p>
                                                                <p className="text-sm text-muted-foreground">
                                                                    Pago antes de embarque
                                                                </p>
                                                            </label>
                                                        </div>
                                                    </Card>
                                                </motion.div>

                                                <motion.div transition={{ duration: 0.2 }}>
                                                    <Card
                                                        className={`cursor-pointer transition-colors duration-150 border ${field.value === 'open_account'
                                                            ? 'border-border'
                                                            : 'border-transparent hover:bg-muted/30'
                                                            }`}
                                                    >
                                                        <div className="flex items-center space-x-3 p-2">
                                                            <RadioGroupItem value="open_account" id="open_account" />
                                                            <label
                                                                htmlFor="open_account"
                                                                className="flex-1 cursor-pointer"
                                                            >
                                                                <p className="font-semibold text-foreground">
                                                                    Pago Contra Embarque / Vencido
                                                                </p>
                                                                <p className="text-sm text-muted-foreground">
                                                                    Mercancía ya en Colombia
                                                                </p>
                                                            </label>
                                                        </div>
                                                    </Card>
                                                </motion.div>
                                            </RadioGroup>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </motion.div>
                    )}

                    {/* Beneficiary (Optional) */}
                    <FormField
                        control={form.control}
                        name="beneficiaryName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="font-heading text-foreground">
                                    Beneficiario (Opcional)
                                </FormLabel>
                                <FormControl>
                                    <Input placeholder="Nombre del beneficiario" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Live Rate Card */}
                    {amount > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <Card className="border border-border">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-1">Tasa de Cambio</p>
                                        <p className="text-2xl font-heading font-mono tabular-nums text-foreground">
                                            {CURRENCIES[sourceCurrency].symbol}1 ={' '}
                                            {CURRENCIES[targetCurrency].symbol}
                                            {exchangeRate.toLocaleString('es-CO', {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            })}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 text-success">
                                        <TrendingUp className="w-5 h-5" />
                                        <span className="text-sm font-semibold">Live</span>
                                    </div>
                                </div>

                                <div className="mt-4 pt-4 border-t border-border/30">
                                    <p className="text-sm text-muted-foreground mb-1">Total Estimado</p>
                                    <p className="text-3xl font-heading font-mono tabular-nums text-foreground">
                                        {CURRENCIES[targetCurrency].symbol}
                                        {estimatedTotal.toLocaleString('es-CO', {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                        })}
                                    </p>
                                </div>
                            </Card>
                        </motion.div>
                    )}

                    {/* Submit Button */}
                    <div className="flex justify-end pt-4">
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
