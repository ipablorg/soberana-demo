import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Trans, useLingui } from '@lingui/react/macro';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Button } from '@/shared/components/ui/button';
import { toast } from '@/shared/components/ui/sonner';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { Link, Copy, Check, Loader2, ExternalLink, Clock } from '@/shared/components/animated-icons';
import { useCreatePaymentLink } from '@/shared/hooks/use-create-payment-link';
import { useAuth } from '@/shared/hooks/use-auth';
import { mapError } from '@/shared/lib/error-mapper';
import {
  isMaintenanceCode,
  readServerErrorCode,
} from '@/modules/suite-user/features/beneficiaries/lib/rail-maintenance';
import { buildPaymentLinkInput } from '@/modules/suite-user/features/receive/components/payment-link-contract';

function useCountdown(expiresAt: string | null) {
  const [remaining, setRemaining] = useState('');

  useEffect(() => {
    if (!expiresAt) return;

    function update() {
      const diff = new Date(expiresAt!).getTime() - Date.now();
      if (diff <= 0) {
        setRemaining('');
        return;
      }
      const mins = Math.floor(diff / 60_000);
      const secs = Math.floor((diff % 60_000) / 1_000);
      setRemaining(
        mins > 0 ? `${mins}m ${String(secs).padStart(2, '0')}s` : `${secs}s`,
      );
    }

    update();
    const id = setInterval(update, 1_000);
    return () => clearInterval(id);
  }, [expiresAt]);

  return remaining;
}

interface PaymentLinkFormValues {
  amount: string;
  currency: string;
}

interface PaymentLinkFormProps {
  receiveWalletId: string | undefined;
  /** When provided, pre-fills and locks the currency field. */
  currency?: string;
  /** Payment method / rail code (e.g. co_breb, pix, spei). */
  paymentMethod?: string;
  /** Stablecoin label from the selected runtime wallet, when available. */
  walletCurrency?: string | null;
}

export function PaymentLinkForm({
  receiveWalletId,
  currency: fixedCurrency,
  paymentMethod,
  walletCurrency,
}: PaymentLinkFormProps) {
  const { t } = useLingui();
  const { user } = useAuth();
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const countdown = useCountdown(expiresAt);

  const customerId = user?.customer_profile_id;

  const createPaymentLink = useCreatePaymentLink();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PaymentLinkFormValues>({
    defaultValues: {
      amount: '',
      currency: fixedCurrency ?? '',
    },
  });

  function onSubmit(data: PaymentLinkFormValues) {
    if (!customerId || !receiveWalletId) return;

    setGeneratedUrl(null);
    createPaymentLink.mutate(
      {
        input: buildPaymentLinkInput({
          amount: data.amount,
          currency: data.currency,
          customerId,
          receiveWalletId,
          paymentMethod,
        }),
      },
      {
        onSuccess: (result) => {
          const url = result.transactions_createPaymentLink?.payment_url;
          const expires = (result.transactions_createPaymentLink as { expires_at?: string } | undefined)?.expires_at;
          if (url) {
            setGeneratedUrl(url);
            setExpiresAt(expires ?? null);
            toast.success(t`Enlace de pago generado`);
          }
        },
        onError: (error) => {
          if (isMaintenanceCode(readServerErrorCode(error))) {
            toast.error(t`Los links de pago están en mantenimiento. Pronto los habilitamos.`);
          } else {
            toast.error(mapError(error).message);
          }
        },
      },
    );
  }

  async function handleCopyUrl() {
    if (!generatedUrl) return;
    try {
      await navigator.clipboard.writeText(generatedUrl);
      setCopied(true);
      toast.success(t`Enlace copiado al portapapeles`);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(t`No se pudo copiar`);
    }
  }

  function handleNewLink() {
    setGeneratedUrl(null);
    setExpiresAt(null);
    setCopied(false);
    reset();
  }

  const isReady = !!customerId && !!receiveWalletId;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
            <Link className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <CardTitle className="text-base">
              <Trans>Enlace de pago</Trans>
            </CardTitle>
            <CardDescription>
              {walletCurrency
                ? t`Genera un enlace para recibir depósitos fiat y acreditarlos en ${walletCurrency}.`
                : t`Genera un enlace para recibir depósitos fiat.`}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {!isReady ? (
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-2/3" />
          </div>
        ) : generatedUrl ? (
          <div className="space-y-3">
            {/* Expiration countdown */}
            {expiresAt && countdown && (
              <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2">
                <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                <p className="text-xs text-muted-foreground">
                  <Trans>Expira en</Trans>{' '}
                  <span className="font-mono tabular-nums text-foreground">
                    {countdown}
                  </span>
                </p>
              </div>
            )}
            {expiresAt && !countdown && (
              <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2">
                <Clock className="h-4 w-4 text-destructive shrink-0" />
                <p className="text-xs text-destructive">
                  <Trans>Enlace expirado</Trans>
                </p>
              </div>
            )}

            {/* URL display */}
            <div className="rounded-lg border border-border bg-muted/50 p-4">
              <p className="mb-1 text-xs text-muted-foreground">
                <Trans>Enlace generado</Trans>
              </p>
              <p className="truncate text-sm font-mono text-foreground">
                {generatedUrl}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleCopyUrl}
              >
                {copied ? (
                  <><Check className="mr-2 h-4 w-4 text-success" /><Trans>Copiado</Trans></>
                ) : (
                  <><Copy className="mr-2 h-4 w-4" /><Trans>Copiar enlace</Trans></>
                )}
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => window.open(generatedUrl, '_blank', 'noopener,noreferrer')}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                <Trans>Abrir enlace</Trans>
              </Button>
            </div>
            <Button
              variant="ghost"
              className="w-full"
              onClick={handleNewLink}
            >
              <Trans>Generar otro</Trans>
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pl-amount"><Trans>Monto</Trans></Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <Input
                  id="pl-amount"
                  type="number"
                  placeholder="0.00"
                  className="h-12 pl-8 font-mono tabular-nums"
                  step="0.01"
                  min="0"
                  {...register('amount', {
                    required: t`Ingresa un monto`,
                    validate: (v) => {
                      const n = parseFloat(v);
                      if (isNaN(n) || n <= 0) return t`El monto debe ser mayor a 0`;
                      return true;
                    },
                  })}
                />
              </div>
              {errors.amount && (
                <p className="text-xs text-destructive">{errors.amount.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="pl-currency"><Trans>Moneda</Trans></Label>
              <Input
                id="pl-currency"
                className="h-12"
                readOnly={!!fixedCurrency}
                {...register('currency', {
                  required: t`Ingresa la moneda`,
                })}
              />
              {errors.currency && (
                <p className="text-xs text-destructive">{errors.currency.message}</p>
              )}
            </div>

            <Button
              type="submit"
              variant="gradient"
              className="w-full"
              size="lg"
              disabled={createPaymentLink.isPending}
            >
              {createPaymentLink.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <Trans>Generando…</Trans>
                </>
              ) : (
                <Trans>Generar enlace de pago</Trans>
              )}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
