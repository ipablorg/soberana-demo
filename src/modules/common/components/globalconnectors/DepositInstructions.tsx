/**
 * DepositInstructions Component
 * 
 * Displays deposit instructions after payment flow creation
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { CheckCircle2, Copy, Check, Printer, Save } from '@/shared/components/animated-icons';
import type { PaymentFlowResponse } from '@/shared/types/globalconnectors.types';
import { cn } from '@/shared/lib/utils';

interface DepositInstructionsProps {
  paymentFlow: PaymentFlowResponse;
}

interface InstructionFieldProps {
  label: string;
  value: string;
  onCopy: (value: string) => void;
  copied: string | null;
}

function InstructionField({ label, value, onCopy, copied }: InstructionFieldProps) {
  const isCopied = copied === value;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-border/50"
    >
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-muted-foreground mb-1">{label}</p>
        <p className="font-mono text-base font-semibold text-foreground truncate">
          {value}
        </p>
      </div>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => onCopy(value)}
        className={cn(
          'ml-4 transition-colors',
          isCopied && 'text-success'
        )}
      >
        {isCopied ? (
          <>
            <Check className="h-4 w-4 mr-2" />
            Copiado
          </>
        ) : (
          <>
            <Copy className="h-4 w-4 mr-2" />
            Copiar
          </>
        )}
      </Button>
    </motion.div>
  );
}

// Helper to format payment rail names (remove timing references)
const formatRailName = (rail: string): string => {
  return rail
    .replace(/_next_day|_same_day/gi, '')
    .replace(/_/g, ' ')
    .toUpperCase()
    .trim();
};

export function DepositInstructions({ paymentFlow }: DepositInstructionsProps) {
  const [copied, setCopied] = useState<string | null>(null);
  const { depositInstructions } = paymentFlow;

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(text);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSave = () => {
    // Create a formatted text version
    const instructions = Object.entries(depositInstructions)
      .filter(([_, value]) => value)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');
    
    const blob = new Blob([instructions], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payment-instructions-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Success Banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="border border-border bg-success/5 border-success/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-success/10 rounded-full">
                <CheckCircle2 className="h-6 w-6 text-success" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground">
                  ¡Pago Creado Exitosamente!
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Realiza la transferencia a los datos bancarios que se muestran a continuación.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Deposit Instructions */}
      <Card className="border border-border">
        <CardHeader>
          <CardTitle className="text-xl">
            Instrucciones de Depósito ({formatRailName(depositInstructions.paymentRail)})
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Utiliza estos datos para realizar tu transferencia
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {depositInstructions.iban && (
            <InstructionField
              label="IBAN"
              value={depositInstructions.iban}
              onCopy={copyToClipboard}
              copied={copied}
            />
          )}

          {depositInstructions.bic && (
            <InstructionField
              label="BIC/SWIFT"
              value={depositInstructions.bic}
              onCopy={copyToClipboard}
              copied={copied}
            />
          )}

          {depositInstructions.routingNumber && (
            <InstructionField
              label="Routing Number"
              value={depositInstructions.routingNumber}
              onCopy={copyToClipboard}
              copied={copied}
            />
          )}

          {depositInstructions.accountNumber && (
            <InstructionField
              label="Account Number"
              value={depositInstructions.accountNumber}
              onCopy={copyToClipboard}
              copied={copied}
            />
          )}

          {depositInstructions.clabe && (
            <InstructionField
              label="CLABE"
              value={depositInstructions.clabe}
              onCopy={copyToClipboard}
              copied={copied}
            />
          )}

          {depositInstructions.pixKey && (
            <InstructionField
              label="PIX Key"
              value={depositInstructions.pixKey}
              onCopy={copyToClipboard}
              copied={copied}
            />
          )}

          {depositInstructions.bankName && (
            <div className="p-4 bg-muted/50 rounded-lg border border-border/50">
              <p className="text-xs font-medium text-muted-foreground mb-1">Banco</p>
              <p className="text-base font-semibold text-foreground">
                {depositInstructions.bankName}
              </p>
            </div>
          )}

          {depositInstructions.beneficiaryName && (
            <div className="p-4 bg-muted/50 rounded-lg border border-border/50">
              <p className="text-xs font-medium text-muted-foreground mb-1">Beneficiario</p>
              <p className="text-base font-semibold text-foreground">
                {depositInstructions.beneficiaryName}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          variant="outline"
          onClick={handlePrint}
          className="flex-1"
        >
          <Printer className="h-4 w-4 mr-2" />
          Imprimir
        </Button>
        <Button
          variant="secondary"
          onClick={handleSave}
          className="flex-1"
        >
          <Save className="h-4 w-4 mr-2" />
          Guardar
        </Button>
      </div>

      {/* Additional Info */}
      <Card className="bg-muted/30">
        <CardContent className="pt-6">
          <div className="space-y-3 text-sm text-muted-foreground">
            <p className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Guarda estas instrucciones para realizar el pago desde tu banco.</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>El pago será procesado automáticamente cuando recibamos tu transferencia.</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Te notificaremos cuando el pago se complete.</span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

