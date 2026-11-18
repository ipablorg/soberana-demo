/**
 * ConversionForm Component
 * 
 * Handles conversion form based on product type:
 * - instant: Input amount + immediate submit
 * - freeze: Just freeze button (no amount)
 * - close/prefund: Input amount + close button
 */

import { useState } from 'react';
import { Trans, useLingui } from '@lingui/react/macro';
import { ArrowRight, Snowflake, Zap } from '@/shared/components/animated-icons';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { cn } from '@/shared/lib/utils';
import { useBridgeStore } from '../stores/useBridgeStore';
import { useRateCalculation } from '../hooks/useRateCalculation';
import { useRateRequest } from '../hooks/useRateRequest';
import { mockAccounts } from '@/shared/lib/mock-data';

const PANEL_CLASS = 'relative overflow-hidden rounded-xl border border-border bg-background/30 backdrop-blur-2xl shadow-sm';

export function ConversionForm() {
  const { t } = useLingui();
  const { selectedProduct, selectedPair } = useBridgeStore();
  const { calculateFromUsdt, formatCurrency, hasCalculation } = useRateCalculation();
  const { submitRequest, isSubmitting, canSubmitRequest } = useRateRequest();
  
  const [usdtInput, setUsdtInput] = useState('');
  
  if (!selectedProduct || !selectedPair) {
    return null;
  }
  
  const fiatAccounts = mockAccounts.filter(acc => acc.type === 'bank');
  const walletAccounts = mockAccounts.filter(acc => acc.type === 'wallet');
  
  const handleUsdtChange = (value: string) => {
    setUsdtInput(value);
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue > 0) {
      calculateFromUsdt(numValue);
    }
  };
  
  const handleSubmit = async () => {
    const amount = parseFloat(usdtInput);
    
    // For freeze products, amount is not required
    const params = selectedProduct.type === 'freeze'
      ? {}
      : { amount };
    
    const result = await submitRequest(params);
    
    if (result) {
      // Clear form on success
      setUsdtInput('');
    }
  };
  
  // Freeze products: Just show freeze button
  if (selectedProduct.type === 'freeze') {
    return (
      <Card className="relative overflow-hidden rounded-xl border border-border shadow-sm">
        <Card className="relative z-10 border-none bg-transparent shadow-none">
        <CardContent className="p-6 space-y-4">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-xl bg-primary/10 backdrop-blur-sm flex items-center justify-center mx-auto">
              <Snowflake className="w-8 h-8 text-primary" />
            </div>
            <div>
            <h3 className="text-lg font-semibold"><Trans>Congelar Tasa</Trans></h3>
            <p className="text-sm text-muted-foreground mt-1">
                <Trans>Congela la tasa actual por {selectedProduct.time} minutos</Trans>
              </p>
            </div>
          </div>
          
          <Button
            onClick={handleSubmit}
            disabled={!canSubmitRequest || isSubmitting}
            className="w-full"
            size="lg"
            variant="gradient"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                <Trans>Un momento...</Trans>
              </>
            ) : (
              <>
                <Snowflake className="w-4 h-4 mr-2" />
                <Trans>Congelar por {selectedProduct.time} minutos</Trans>
              </>
            )}
          </Button>
        </CardContent>
        </Card>
      </Card>
    );
  }
  
  // Instant, close, and prefund products: Show full form
  return (
    <Card className="relative overflow-hidden rounded-xl border border-border shadow-sm">
      <CardContent className="relative p-6 space-y-6 z-10">
        {/* Amount input with currency badge */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="usdt-amount" className="text-base font-semibold">
              <Trans>Monto a convertir</Trans>
            </Label>
            <span className="text-xs text-muted-foreground">
              <Trans>Ingresa la cantidad en USDT</Trans>
            </span>
          </div>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-primary/10 backdrop-blur-sm border border-primary/20 z-10">
              <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                ₮
              </div>
              <span className="text-sm font-semibold text-primary">USDT</span>
            </div>
            <Input
              id="usdt-amount"
              type="number"
              placeholder={t`Ingresa el monto (ej: 100.00)`}
              value={usdtInput}
              onChange={(e) => handleUsdtChange(e.target.value)}
              className={cn(
                "pl-32 pr-4 h-16 text-xl font-semibold font-mono tabular-nums rounded-xl",
                "border border-border bg-background/40 backdrop-blur-md",
                "focus:bg-background/60 transition-colors duration-150",
                "placeholder:text-muted-foreground/40",
                usdtInput 
                  ? "border-primary/40 shadow-sm" 
                  : "border-border/30 hover:border-border/50"
              )}
              min="0"
              step="0.01"
            />
          </div>
          <p className="text-xs text-muted-foreground/70 flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-primary/60" />
            <Trans>La conversión se realizará al tipo de cambio actual</Trans>
          </p>
        </div>
        
        {/* Calculation preview */}
        {hasCalculation && usdtInput && (
          <Card className="border-none bg-background/20 backdrop-blur-md">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground"><Trans>Recibirás (aprox.)</Trans></span>
                <span className="font-semibold text-lg font-mono tabular-nums">
                  {formatCurrency(
                    parseFloat(usdtInput) * (selectedPair?.rate || 0) * 0.998,
                    selectedPair?.to || 'COP'
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground"><Trans>Comisión</Trans></span>
                <span className="font-medium font-mono tabular-nums">0.2%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground"><Trans>Tiempo estimado</Trans></span>
                <span className="font-medium text-success">
                  {selectedProduct.type === 'instant' ? t`Instantáneo` : `${selectedProduct.time} min`}
                </span>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Submit button */}
        <Button
          onClick={handleSubmit}
          disabled={!canSubmitRequest || isSubmitting || !usdtInput || parseFloat(usdtInput) <= 0}
          className="w-full"
          size="lg"
          variant="gradient"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
              <Trans>Un momento...</Trans>
            </>
          ) : selectedProduct.type === 'instant' ? (
            <>
              <Zap className="w-4 h-4 mr-2" />
              <Trans>Enviar Instantáneo</Trans>
            </>
          ) : (
            <>
              <Snowflake className="w-4 h-4 mr-2" />
              <Trans>Cerrar Tasa por {selectedProduct.time} min</Trans>
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

