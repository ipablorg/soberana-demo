import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useLingui } from '@lingui/react/macro';
import { CheckCircle2, Loader2 } from '@/shared/components/animated-icons';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { usePaymentLinksStore, type PaymentLinkData } from '@/shared/stores/usePaymentLinksStore';
import { useMockBalanceStore } from '@/shared/stores/useMockBalanceStore';
import { useMultiCurrencyBalanceStore } from '@/shared/stores/useMultiCurrencyBalanceStore';

type PageStep = 'pay' | 'processing' | 'success' | 'not-found' | 'already-paid';

export default function PayLinkPage() {
  const { t } = useLingui();
  const { id } = useParams<{ id: string }>();
  const link = usePaymentLinksStore((s) => (id ? s.links[id] : undefined));
  const markAsPaid = usePaymentLinksStore((s) => s.markAsPaid);
  const addPayment = useMockBalanceStore((s) => s.addPayment);

  const [step, setStep] = useState<PageStep>('pay');
  const [customAmount, setCustomAmount] = useState('');

  const resolvedAmount = link?.amount || customAmount;
  const canPay = !!resolvedAmount && parseFloat(resolvedAmount) > 0;

  const handlePay = async () => {
    if (!id || !link || !canPay) return;
    setStep('processing');

    await new Promise((r) => setTimeout(r, 2000));

    markAsPaid(id);
    const amount = parseFloat(resolvedAmount);

    if (link.destination) {
      const multi = useMultiCurrencyBalanceStore.getState();
      switch (link.destination.type) {
        case 'fiat-box':
          multi.addBalance(link.destination.currency.toLowerCase(), amount);
          break;
        case 'stablecoin':
          multi.addBalance(link.destination.currency.toLowerCase(), amount);
          break;
        case 'ucoin':
          multi.addBalance('ucoin', amount);
          break;
      }
    } else {
      addPayment(amount);
    }

    setStep('success');
  };

  const effectiveStep = !link ? 'not-found' : link.status === 'paid' && step === 'pay' ? 'already-paid' : step;

  if (effectiveStep === 'not-found') {
    return <Shell><NotFound /></Shell>;
  }

  if (effectiveStep === 'already-paid') {
    return <Shell><AlreadyPaid link={link!} /></Shell>;
  }

  return (
    <Shell>
      <AnimatePresence mode="wait">
        {effectiveStep === 'pay' && (
          <PayForm
            key="pay"
            link={link!}
            customAmount={customAmount}
            setCustomAmount={setCustomAmount}
            canPay={canPay}
            onPay={handlePay}
          />
        )}

        {effectiveStep === 'processing' && <Processing key="processing" />}

        {effectiveStep === 'success' && (
          <Success key="success" amount={resolvedAmount} currency={link!.currency} />
        )}
      </AnimatePresence>

      <footer className="mt-12 text-center">
        <p className="text-xs text-muted-foreground/60">
          Powered by <span className="font-semibold text-muted-foreground/80">Loopay Soberana</span>
        </p>
      </footer>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}

interface PayFormProps {
  link: PaymentLinkData;
  customAmount: string;
  setCustomAmount: (v: string) => void;
  canPay: boolean;
  onPay: () => void;
}

function PayForm({ link, customAmount, setCustomAmount, canPay, onPay }: PayFormProps) {
  const { t } = useLingui();
  const isFlexible = !link.amount;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex justify-center">
        {link.logo ? (
          <img src={link.logo} alt="Logo" className="w-16 h-16 object-contain" />
        ) : (
          <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center">
            <span className="text-2xl font-heading font-bold text-primary">L</span>
          </div>
        )}
      </div>

      {/* Payment Card */}
      <div
        className="rounded-xl border border-border/30 p-8 text-center space-y-4"
        style={{
          background: `linear-gradient(135deg, ${link.color}12 0%, ${link.color}06 100%)`,
        }}
      >
        {isFlexible ? (
          <p className="text-lg font-semibold text-muted-foreground">{t`Flexible amount`}</p>
        ) : (
          <p className="text-4xl font-heading font-bold text-foreground font-mono tabular-nums">
            {parseFloat(link.amount!).toLocaleString()} {link.currency}
          </p>
        )}

        {link.description && (
          <p className="text-sm text-muted-foreground">{link.description}</p>
        )}

        <div
          className="h-1 w-16 mx-auto rounded-full"
          style={{ backgroundColor: link.color }}
        />
      </div>

      {/* Flexible amount input */}
      {isFlexible && (
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase">
            {t`Amount (${link.currency})`}
          </label>
          <Input
            type="number"
            placeholder="0.00"
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value)}
            className="h-14 text-2xl font-bold text-center font-mono tabular-nums"
            min={0}
            step="0.01"
          />
        </div>
      )}

      {/* Pay Button */}
      <Button
        onClick={onPay}
        disabled={!canPay}
        className="w-full h-14 text-base font-semibold rounded-lg text-primary-foreground"
        style={{
          background: canPay
            ? `linear-gradient(135deg, ${link.color} 0%, ${link.color}CC 100%)`
            : undefined,
        }}
      >
        {t`Pay with USDC`}
      </Button>
    </motion.div>
  );
}

function Processing() {
  const { t } = useLingui();
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center py-20"
    >
      <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
      <p className="text-lg font-semibold text-foreground">{t`One moment...`}</p>
      <p className="text-sm text-muted-foreground mt-1">{t`This will take a moment`}</p>
    </motion.div>
  );
}

function Success({ amount, currency }: { amount: string; currency: string }) {
  const { t } = useLingui();
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, duration: 0.2, ease: 'easeOut' }}
        className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mb-6"
      >
        <CheckCircle2 className="w-10 h-10 text-success" />
      </motion.div>

      <h2 className="text-2xl font-heading font-bold text-foreground mb-2">{t`Payment complete`}</h2>
      <p className="text-3xl font-bold font-mono tabular-nums text-foreground mb-1">
        {parseFloat(amount).toLocaleString()} {currency}
      </p>
      <p className="text-sm text-muted-foreground mt-4">
        {t`The merchant has been notified.`}
      </p>
    </motion.div>
  );
}

function NotFound() {
  const { t } = useLingui();
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
        <span className="text-2xl">🔗</span>
      </div>
      <h2 className="text-xl font-heading font-bold text-foreground mb-2">{t`Link not found`}</h2>
      <p className="text-sm text-muted-foreground">
        {t`This payment link doesn't exist or has expired.`}
      </p>
    </div>
  );
}

function AlreadyPaid({ link }: { link: PaymentLinkData }) {
  const { t } = useLingui();
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mb-4">
        <CheckCircle2 className="w-8 h-8 text-success" />
      </div>
      <h2 className="text-xl font-heading font-bold text-foreground mb-2">{t`Already paid`}</h2>
      {link.amount && (
        <p className="text-lg font-bold font-mono tabular-nums text-foreground">
          {parseFloat(link.amount).toLocaleString()} {link.currency}
        </p>
      )}
      <p className="text-sm text-muted-foreground mt-2">
        {t`This payment link has already been used.`}
      </p>
    </div>
  );
}
