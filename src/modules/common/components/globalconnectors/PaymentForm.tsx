/**
 * PaymentForm Component
 * 
 * Form to collect payment details for international transfers
 */

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, User, Mail } from '@/shared/components/animated-icons';
import { useGraphQLMutation } from '@/shared/hooks/use-graphql-mutation';
import { CREATE_PAYMENT_FLOW } from '@/graphql/mutations/globalconnectors';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { globalConnectorsValidators } from '@/shared/lib/validators/globalconnectors.validators';
import { useAuth } from '@/shared/hooks/use-auth';
import { setCompanyHeader } from '@/shared/lib/graphql-client';
import { useAuthStore } from '@/shared/stores/auth-store';
import { mapGlobalConnectorsError, extractKycLinkFromError } from '@/shared/lib/error-mappers/globalconnectors-errors';
import type { Corridor, CreatePaymentFlowInput, PaymentFlowResponse, AccountType } from '@/shared/types/globalconnectors.types';

interface PaymentFormProps {
  corridor: Corridor;
  onSuccess: (result: PaymentFlowResponse) => void;
}

interface FormData {
  customerEmail: string;
  customerName: string;
  destinationFirstName: string;
  destinationLastName: string;
  destinationAccountOwnerName: string;
  destinationBankName: string;
  // ACH fields
  routingNumber?: string;
  accountNumber?: string;
  accountType?: AccountType;
  // SEPA fields
  iban?: string;
  bic?: string;
  // SPEI fields
  clabe?: string;
  // PIX fields
  pixKey?: string;
}

interface CreatePaymentResponse {
  globalconnectors_createPaymentFlow: PaymentFlowResponse;
}

export function PaymentForm({ corridor, onSuccess }: PaymentFormProps) {
  const { user } = useAuth();
  const authState = useAuthStore.getState();

  // Set company header for the mutation (required by backend)
  useEffect(() => {
    const companyId = authState.user?.company_user?.[0]?.company?.id;
    if (companyId) {
      setCompanyHeader(companyId.toString());
    }
  }, [authState.user]);

  // Helper to normalize rail for comparisons (handles both lowercase and uppercase)
  const isRailType = (rail: string): boolean => {
    const normalized = corridor.destinationRail
      .replace(/_next_day|_same_day/gi, '')
      .toUpperCase();
    return normalized === rail.toUpperCase();
  };

  // Dynamic schema based on payment rail
  const getValidationSchema = () => {
    let baseSchema = z.object({
      customerEmail: z.string().email('Revisa el formato del email').min(1, 'Ingresa tu email'),
      customerName: z.string().min(2, 'Ingresa tu nombre'),
      destinationFirstName: z.string().min(2, 'Ingresa el nombre'),
      destinationLastName: z.string().min(2, 'Ingresa el apellido'),
      destinationAccountOwnerName: z.string().min(2, 'Ingresa el nombre del titular'),
      destinationBankName: z.string().min(2, 'Ingresa el banco'),
    });

    if (isRailType('ACH')) {
      return baseSchema.extend({
        routingNumber: z.string().refine(
          (val) => globalConnectorsValidators.routingNumber(val),
          'El routing number necesita 9 dígitos'
        ),
        accountNumber: z.string().min(1, 'Ingresa el número de cuenta'),
        accountType: z.enum(['CHECKING', 'SAVINGS'], { required_error: 'Selecciona el tipo de cuenta' }),
      });
    }

    if (isRailType('SEPA')) {
      return baseSchema.extend({
        iban: z.string().refine(
          (val) => globalConnectorsValidators.iban(val),
          'Revisa el formato del IBAN'
        ),
        bic: z.string().optional(),
      });
    }

    if (isRailType('SPEI')) {
      return baseSchema.extend({
        clabe: z.string().refine(
          (val) => globalConnectorsValidators.clabe(val),
          'La CLABE necesita 18 dígitos'
        ),
      });
    }

    if (isRailType('PIX')) {
      return baseSchema.extend({
        pixKey: z.string().refine(
          (val) => globalConnectorsValidators.pixKey(val),
          'Revisa el formato de la PIX Key (email, teléfono, CPF o clave aleatoria)'
        ),
      });
    }

    return baseSchema;
  };

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(getValidationSchema()),
    defaultValues: {
      customerEmail: user?.email || '',
      customerName: user?.name || '',
    },
  });

  // Pre-load user data when component mounts or user changes
  useEffect(() => {
    if (user) {
      setValue('customerEmail', user.email);
      setValue('customerName', user.name || user.email);
    }
  }, [user, setValue]);

  const customerEmail = watch('customerEmail');
  const customerName = watch('customerName');

  const createPayment = useGraphQLMutation<CreatePaymentResponse, { input: CreatePaymentFlowInput }>(
    CREATE_PAYMENT_FLOW as never
  );

  const onSubmit = async (data: FormData) => {
    try {
    // Normalize rail value (remove _next_day and convert to uppercase)
    const normalizedRail = corridor.destinationRail
      .replace(/_next_day|_same_day/gi, '')
      .toUpperCase();

    const input: CreatePaymentFlowInput = {
      customerEmail: data.customerEmail,
      customerName: data.customerName,
      customerType: 'INDIVIDUAL' as any,
      sourceCurrency: corridor.sourceCurrency.toUpperCase() as never,
      sourceCountry: corridor.sourceCountry,
      destinationCurrency: corridor.destinationCurrency.toUpperCase(),
      destinationCountry: corridor.destinationCountry,
      destinationAccountOwnerName: data.destinationAccountOwnerName,
      destinationFirstName: data.destinationFirstName,
      destinationLastName: data.destinationLastName,
      destinationBankName: data.destinationBankName,
      destinationPaymentRail: normalizedRail as never,
      destinationAccountDetails: {},
    };

    // Add rail-specific fields
    const railLower = normalizedRail.toLowerCase();
    if (railLower === 'ach') {
      input.destinationAccountDetails = {
        routingNumber: data.routingNumber,
        accountNumber: data.accountNumber,
        accountType: data.accountType as never, // Backend expects UPPERCASE (CHECKING/SAVINGS)
      };
    } else if (railLower === 'sepa') {
      input.destinationAccountDetails = {
        iban: data.iban,
        bic: data.bic,
      };
    } else if (railLower === 'spei') {
      input.destinationAccountDetails = {
        clabe: data.clabe,
      };
    } else if (railLower === 'pix') {
      input.destinationAccountDetails = {
        pixKey: data.pixKey,
      };
    }

      const result = await createPayment.mutateAsync({ input });
      onSuccess(result.globalconnectors_createPaymentFlow);
    } catch (err) {
      // El error ya se maneja en el estado de la mutation
      console.error('Error creating payment flow:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Sender Information - Compact, auto-filled */}
      <div className="p-3 bg-muted/20 rounded-lg border border-border/30 space-y-2">
        {/* Hidden inputs for form submission */}
        <input type="hidden" {...register('customerEmail')} />
        <input type="hidden" {...register('customerName')} />
        
        {/* Title + Badge - First row */}
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-foreground">Información del Remitente</h3>
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5">
            Auto-completado
          </Badge>
        </div>
        
        {/* Compact info display - Second row */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            <Mail className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="font-medium text-foreground truncate">
              {customerEmail}
            </span>
          </div>
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            <User className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="font-medium text-foreground truncate">
              {customerName}
            </span>
          </div>
        </div>
      </div>

      {/* Beneficiary Information */}
      <Card className="border border-border">
        <CardHeader>
          <CardTitle className="text-lg">Beneficiario ({corridor.destinationCountry})</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="destinationFirstName">Nombre</Label>
            <Input
              id="destinationFirstName"
              {...register('destinationFirstName')}
              placeholder="John"
              className={errors.destinationFirstName ? 'border-destructive' : ''}
            />
            {errors.destinationFirstName && (
              <p className="text-xs text-destructive">{errors.destinationFirstName.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="destinationLastName">Apellido</Label>
            <Input
              id="destinationLastName"
              {...register('destinationLastName')}
              placeholder="Doe"
              className={errors.destinationLastName ? 'border-destructive' : ''}
            />
            {errors.destinationLastName && (
              <p className="text-xs text-destructive">{errors.destinationLastName.message}</p>
            )}
          </div>
          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="destinationAccountOwnerName">Nombre del Titular</Label>
            <Input
              id="destinationAccountOwnerName"
              {...register('destinationAccountOwnerName')}
              placeholder="John Doe"
              className={errors.destinationAccountOwnerName ? 'border-destructive' : ''}
            />
            {errors.destinationAccountOwnerName && (
              <p className="text-xs text-destructive">{errors.destinationAccountOwnerName.message}</p>
            )}
          </div>
          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="destinationBankName">Banco</Label>
            <Input
              id="destinationBankName"
              {...register('destinationBankName')}
              placeholder="Chase Bank"
              className={errors.destinationBankName ? 'border-destructive' : ''}
            />
            {errors.destinationBankName && (
              <p className="text-xs text-destructive">{errors.destinationBankName.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Account Details */}
      <Card className="border border-border">
        <CardHeader>
          <CardTitle className="text-lg">Detalles de la Cuenta</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* ACH (USA) */}
          {isRailType('ACH') && (
            <>
              <div className="space-y-2">
                <Label htmlFor="routingNumber">Routing Number</Label>
                <Input
                  id="routingNumber"
                  {...register('routingNumber')}
                  placeholder="021000021"
                  maxLength={9}
                  className={errors.routingNumber ? 'border-destructive' : ''}
                />
                <p className="text-xs text-muted-foreground">9 dígitos</p>
                {errors.routingNumber && (
                  <p className="text-xs text-destructive">{errors.routingNumber.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="accountNumber">Account Number</Label>
                <Input
                  id="accountNumber"
                  {...register('accountNumber')}
                  placeholder="1234567890"
                  className={errors.accountNumber ? 'border-destructive' : ''}
                />
                {errors.accountNumber && (
                  <p className="text-xs text-destructive">{errors.accountNumber.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="accountType">Tipo de Cuenta</Label>
                <Select onValueChange={(value) => setValue('accountType', value as AccountType)}>
                  <SelectTrigger className={errors.accountType ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Seleccionar..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CHECKING">Checking</SelectItem>
                    <SelectItem value="SAVINGS">Savings</SelectItem>
                  </SelectContent>
                </Select>
                {errors.accountType && (
                  <p className="text-xs text-destructive">{errors.accountType.message}</p>
                )}
              </div>
            </>
          )}

          {/* SEPA (Europa) */}
          {isRailType('SEPA') && (
            <>
              <div className="space-y-2">
                <Label htmlFor="iban">IBAN</Label>
                <Input
                  id="iban"
                  {...register('iban')}
                  placeholder="DE89370400440532013000"
                  className={errors.iban ? 'border-destructive' : ''}
                />
                {errors.iban && (
                  <p className="text-xs text-destructive">{errors.iban.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="bic">BIC/SWIFT (opcional)</Label>
                <Input
                  id="bic"
                  {...register('bic')}
                  placeholder="COBADEFFXXX"
                  className={errors.bic ? 'border-destructive' : ''}
                />
              </div>
            </>
          )}

          {/* SPEI (México) */}
          {isRailType('SPEI') && (
            <div className="space-y-2">
              <Label htmlFor="clabe">CLABE</Label>
              <Input
                id="clabe"
                {...register('clabe')}
                placeholder="012345678901234567"
                maxLength={18}
                className={errors.clabe ? 'border-destructive' : ''}
              />
              <p className="text-xs text-muted-foreground">18 dígitos</p>
              {errors.clabe && (
                <p className="text-xs text-destructive">{errors.clabe.message}</p>
              )}
            </div>
          )}

          {/* PIX (Brasil) */}
          {isRailType('PIX') && (
            <div className="space-y-2">
              <Label htmlFor="pixKey">PIX Key</Label>
              <Input
                id="pixKey"
                {...register('pixKey')}
                placeholder="+5511987654321"
                className={errors.pixKey ? 'border-destructive' : ''}
              />
              <p className="text-xs text-muted-foreground">
                Puede ser: teléfono, email, CPF, o clave aleatoria
              </p>
              {errors.pixKey && (
                <p className="text-xs text-destructive">{errors.pixKey.message}</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error */}
      {createPayment.error && (() => {
        const mappedError = mapGlobalConnectorsError(createPayment.error);
        const kycLink = extractKycLinkFromError(createPayment.error);
        
        // Determine card styling based on severity
        const cardClassName = {
          error: 'border-destructive/50 bg-destructive/5',
          warning: 'border-warning/50 bg-warning/5',
          info: 'border-primary/50 bg-primary/5',
        }[mappedError.severity];
        
        const titleClassName = {
          error: 'text-destructive',
          warning: 'text-warning',
          info: 'text-primary',
        }[mappedError.severity];
        
        return (
          <Card className={cardClassName}>
            <CardContent className="pt-6 space-y-3">
              <div className="space-y-2">
                <p className={`text-sm font-semibold ${titleClassName}`}>
                  {mappedError.title}
                </p>
                <p className="text-sm text-foreground">
                  {mappedError.message}
                </p>
              </div>
              
              {/* Action button (e.g., Continue KYC) */}
              {mappedError.actionLabel && (
                <Button
                  type="button"
                  variant={mappedError.severity === 'error' ? 'destructive' : 'default'}
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    if (kycLink) {
                      window.open(kycLink, '_blank');
                    } else if (mappedError.actionUrl) {
                      window.open(mappedError.actionUrl, '_blank');
                    }
                  }}
                >
                  {mappedError.actionLabel}
                </Button>
              )}
              
              {/* Technical details (collapsible in dev mode) */}
              {process.env.NODE_ENV === 'development' && mappedError.technicalDetails && (
                <details className="text-xs">
                  <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                    Detalles técnicos (dev)
                  </summary>
                  <code className="block mt-2 p-2 bg-muted rounded text-[10px] font-mono break-all">
                    {mappedError.technicalDetails}
                  </code>
                </details>
              )}
            </CardContent>
          </Card>
        );
      })()}

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={createPayment.isPending}
        className="w-full"
        size="lg"
      >
        {createPayment.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {createPayment.isPending ? 'Un momento...' : 'Crear Pago Internacional'}
      </Button>
    </form>
  );
}

