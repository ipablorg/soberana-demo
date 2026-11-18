/**
 * Create Payment Link Flow
 * 
 * Multi-step conversational workflow for creating payment links
 * Replicates the UX from the Suite's collect workflow
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, 
  Link as LinkIcon,
  QrCode,
  Wallet,
  CreditCard,
  Coins,
  Save,
  CheckCircle2,
  Sparkles,
} from '@/shared/components/animated-icons';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { cn } from '@/shared/lib/utils';
import { toast } from '@/shared/hooks/use-toast';
import { TypewriterText } from '@/shared/components/common/TypewriterText';
import { useLinksStore } from '../stores/useLinksStore';
import { useDynamicIslandStore } from '../stores/useDynamicIslandStore';
import { DynamicIsland } from './DynamicIsland';
import { ClaimLinkButton } from './ClaimLinkButton';
import type { Currency } from '../types';

interface CreatePaymentLinkFlowProps {
  onComplete?: () => void;
  onCancel?: () => void;
  showClaimButton?: boolean;
}

const CURRENCY_ICONS: Record<string, string> = {
  USD: '🇺🇸',
  COP: '🇨🇴',
  USDT: '💎',
  USDC: '💠',
};

const COLLECTION_METHODS = [
  { id: 'link', label: 'Link de Pago', icon: LinkIcon, description: 'Comparte un link' },
  { id: 'qr', label: 'Código QR', icon: QrCode, description: 'Escaneable' },
];

const SETTLEMENT_OPTIONS = [
  { id: 'vault', label: 'Loopay Vault (USDC)', icon: Wallet, description: 'Instant settlement', crypto: true },
  { id: 'bank', label: 'Local Bank', icon: CreditCard, description: '1-2 business days', crypto: false },
  { id: 'convert', label: 'Convertir a Crypto', icon: Coins, description: 'Auto-convert on payment', crypto: true },
];

const CRYPTO_OPTIONS = [
  { id: 'USDC', label: 'USDC', icon: '💠' },
  { id: 'USDT', label: 'USDT', icon: '💎' },
  { id: 'BTC', label: 'Bitcoin', icon: '₿' },
  { id: 'ETH', label: 'Ethereum', icon: 'Ξ' },
];

export function CreatePaymentLinkFlow({ onComplete, onCancel, showClaimButton }: CreatePaymentLinkFlowProps) {
  const { addLink, updateProfile, profile } = useLinksStore();
  const { setStep, reset: resetIsland } = useDynamicIslandStore();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [username, setUsername] = useState(profile.name || 'loopayuser');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<Currency>('USD');
  const [title, setTitle] = useState('');
  const [collectionMethod, setCollectionMethod] = useState<'link' | 'qr'>('link');
  const [settlement, setSettlement] = useState<'vault' | 'bank' | 'convert'>('vault');
  const [targetCrypto, setTargetCrypto] = useState('USDC');

  // Steps: 0=Username, 1=Amount, 2=Title/Concept, 3=Method, 4=Settlement
  // Step 5: If convert → Crypto Selection, else → Summary
  // Step 6: If convert → Summary
  const isConvertFlow = settlement === 'convert';
  const totalSteps = isConvertFlow ? 7 : 6;
  const summaryStep = isConvertFlow ? 6 : 5;

  // Update profile name in real-time as user types
  useEffect(() => {
    if (username.trim()) {
      updateProfile({ name: username.trim() });
    }
  }, [username, updateProfile]);

  // Update Dynamic Island when step changes
  useEffect(() => {
    setStep(currentStep, totalSteps, getStepName(currentStep));
  }, [currentStep, totalSteps, setStep]);

  // Reset island on unmount
  useEffect(() => {
    return () => resetIsland();
  }, [resetIsland]);

  // Step messages
  const getStepMessage = () => {
    switch (currentStep) {
      case 0:
        return '¿Cuál será tu nombre de usuario?';
      case 1:
        return username 
          ? `Perfecto @${username}. ¿Cuánto vas a cobrar?`
          : '¿Cuánto vas a cobrar?';
      case 2:
        return amount 
          ? `Genial, ${CURRENCY_ICONS[currency]} ${currency} ${parseFloat(amount.replace(/,/g, '')).toLocaleString('en-US', { minimumFractionDigits: 2 })} confirmado. ¿Qué estás cobrando?`
          : '¿Qué estás cobrando?';
      case 3:
        return title 
          ? `Perfecto, "${title}". ¿Cómo quieres cobrar?`
          : '¿Cómo quieres cobrar?';
      case 4:
        return '¿Qué quieres hacer cuando se fondee la cuenta?';
      case 5:
        if (settlement === 'convert') {
          return '¿A qué criptomoneda quieres convertir?';
        }
        return '¡Perfecto! Revisa el resumen';
      case 6:
        return '¡Perfecto! Revisa el resumen';
      default:
        return '';
    }
  };

  const getStepName = (step: number): string => {
    switch (step) {
      case 0: return 'Usuario';
      case 1: return 'Monto';
      case 2: return 'Concepto';
      case 3: return 'Método';
      case 4: return 'Settlement';
      case 5: 
        if (isConvertFlow) return 'Crypto';
        return 'Resumen';
      case 6: return 'Resumen';
      default: return '';
    }
  };

  // Validate current step
  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return username.trim().length > 0;
      case 1:
        return amount && parseFloat(amount) > 0;
      case 2:
        return title.trim().length > 0;
      case 3:
        return collectionMethod !== null;
      case 4:
        return settlement !== null;
      case 5:
        return settlement !== 'convert' || targetCrypto !== null;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (canProceed()) {
      if (currentStep === summaryStep) {
        // Generate link
        handleGenerateLink();
      } else {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleGenerateLink = () => {
    const numericAmount = parseFloat(amount.replace(/,/g, ''));
    
    addLink({
      title: title.trim(),
      amount: numericAmount,
      currency: currency,
      active: true,
      icon: '💰',
      settlementStrategy: settlement === 'vault' || settlement === 'convert' ? 'CRYPTO_WALLET' : 'FIAT_BANK',
      receiveCurrency: settlement === 'convert' ? targetCrypto : settlement === 'vault' ? 'USDC' : currency,
    });

    toast({
      title: '✅ Payment Button Created!',
      description: `${title} - ${CURRENCY_ICONS[currency]} ${currency} ${numericAmount.toFixed(2)}`,
      duration: 4000,
    });

    // Reset form to create another link
    setTimeout(() => {
      resetForm();
      onComplete?.();
    }, 1500);
  };

  const resetForm = () => {
    setCurrentStep(1); // Start at step 1 (amount) for next link, username already set
    setAmount('');
    setCurrency('USD');
    setTitle('');
    setCollectionMethod('link');
    setSettlement('vault');
    setTargetCrypto('USDC');
  };

  // Format amount as user types
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/,/g, '');
    if (/^\d*\.?\d{0,2}$/.test(value)) {
      setAmount(value);
    }
  };

  return (
    <div className="w-full min-h-[60vh] flex flex-col justify-center space-y-8">
      {/* Dynamic Island - Only visible in this flow */}
      <DynamicIsland showBalance={false} />

      {/* Question with Typewriter Effect */}
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
              text={getStepMessage()}
              speed={30}
              delay={0}
            />
          </h2>
        </motion.div>
      </AnimatePresence>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="space-y-8 py-8"
        >
          {/* Step 0: Username */}
          {currentStep === 0 && (
            <div className="flex justify-center">
              <div className="w-full max-w-xl space-y-4">
                <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm">
                  <span className="font-mono">links.loopay.com/</span>
                </div>
                <Input
                  value={username}
                  onChange={(e) => {
                    const value = e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, '');
                    setUsername(value);
                  }}
                  placeholder="username"
                  className="text-2xl h-16 text-center font-medium font-mono"
                  autoFocus
                />
                <p className="text-xs text-center text-muted-foreground">
                  Solo letras, números, guiones y guión bajo
                </p>
              </div>
            </div>
          )}

          {/* Step 1: Amount & Currency */}
          {currentStep === 1 && (
            <div className="flex gap-4 max-w-xl mx-auto items-center">
              <div className="relative flex-1">
                {/* Currency Icon */}
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl pointer-events-none z-10">
                  {CURRENCY_ICONS[currency] || '💰'}
                </div>
                
                <Input
                  type="text"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={amount}
                  onChange={handleAmountChange}
                  className="text-2xl h-16 text-center font-semibold pl-14 border-foreground/20 focus-visible:border-foreground/40 bg-transparent rounded-lg"
                  autoFocus
                />
              </div>
              <motion.div
                transition={{ duration: 0.15 }}
              >
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger className="w-[140px] h-16 border-foreground/20 bg-transparent rounded-lg hover:border-foreground/40 transition-colors duration-150">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-[400px]">
                    <SelectItem value="USD">🇺🇸 USD</SelectItem>
                    <SelectItem value="COP">🇨🇴 COP</SelectItem>
                    <SelectItem value="USDT">💎 USDT</SelectItem>
                    <SelectItem value="USDC">💠 USDC</SelectItem>
                  </SelectContent>
                </Select>
              </motion.div>
            </div>
          )}

          {/* Step 2: Title/Concept */}
          {currentStep === 2 && (
            <div className="flex justify-center">
              <div className="w-full max-w-xl">
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej: Consultoría, Producto, Servicio..."
                  className="text-2xl h-16 text-center font-medium"
                  autoFocus
                />
              </div>
            </div>
          )}

          {/* Step 3: Collection Method */}
          {currentStep === 3 && (
            <div className="flex items-center justify-center gap-8 max-w-3xl mx-auto flex-wrap">
              {COLLECTION_METHODS.map((method) => {
                const isSelected = collectionMethod === method.id;
                const MethodIcon = method.icon;
                return (
                  <motion.button
                    key={method.id}
                    onClick={() => setCollectionMethod(method.id as any)}
                    className="group relative flex flex-col items-center gap-1.5 outline-none focus-visible:outline-none transition-colors duration-150"
                  >
                    <motion.div 
                      className={cn(
                        'relative h-16 w-16 rounded-full border-2 flex items-center justify-center bg-transparent transition-colors duration-150',
                        isSelected ? 'border-primary' : 'border-foreground/20 group-hover:border-foreground/40'
                      )}
                      whileHover={{ scale: 1 }}
                    >
                      <motion.div
                        className="absolute inset-0 rounded-full bg-foreground/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        initial={false}
                      />
                      <MethodIcon className={cn(
                        'h-6 w-6 transition-colors duration-200 relative z-10',
                        isSelected ? 'text-primary' : 'text-foreground/60 group-hover:text-foreground'
                      )} />
                      {isSelected && (
                        <motion.div
                          layoutId="selected-collection"
                          className="absolute inset-0 rounded-full border-2 border-primary"
                          transition={{ duration: 0.2, ease: 'easeOut' }}
                        />
                      )}
                    </motion.div>
                    <p className={cn(
                      'text-xs transition-colors duration-200',
                      isSelected ? 'text-primary font-medium' : 'text-muted-foreground group-hover:text-foreground'
                    )}>
                      {method.label}
                    </p>
                  </motion.button>
                );
              })}
            </div>
          )}

          {/* Step 4: Settlement */}
          {currentStep === 4 && (
            <div className="flex items-center justify-center gap-8 max-w-3xl mx-auto flex-wrap">
              {SETTLEMENT_OPTIONS.map((option) => {
                const isSelected = settlement === option.id;
                const OptionIcon = option.icon;
                return (
                  <motion.button
                    key={option.id}
                    onClick={() => setSettlement(option.id as any)}
                    className="group relative flex flex-col items-center gap-1.5 outline-none focus-visible:outline-none transition-colors duration-150"
                  >
                    <motion.div 
                      className={cn(
                        'relative h-16 w-16 rounded-full border-2 flex items-center justify-center bg-transparent transition-colors duration-150',
                        isSelected ? 'border-primary' : 'border-foreground/20 group-hover:border-foreground/40'
                      )}
                      whileHover={{ scale: 1 }}
                    >
                      <motion.div
                        className="absolute inset-0 rounded-full bg-foreground/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        initial={false}
                      />
                      <OptionIcon className={cn(
                        'h-6 w-6 transition-colors duration-200 relative z-10',
                        isSelected ? 'text-primary' : 'text-foreground/60 group-hover:text-foreground'
                      )} />
                      {isSelected && (
                        <motion.div
                          layoutId="selected-settlement"
                          className="absolute inset-0 rounded-full border-2 border-primary"
                          transition={{ duration: 0.2, ease: 'easeOut' }}
                        />
                      )}
                    </motion.div>
                    <p className={cn(
                      'text-xs transition-colors duration-200',
                      isSelected ? 'text-primary font-medium' : 'text-muted-foreground group-hover:text-foreground'
                    )}>
                      {option.label}
                    </p>
                  </motion.button>
                );
              })}
            </div>
          )}

          {/* Step 5: Crypto Selection (if converting) OR Summary (if not) */}
          {currentStep === 5 && isConvertFlow && (
            <div className="flex items-center justify-center gap-8 max-w-3xl mx-auto flex-wrap">
              {CRYPTO_OPTIONS.map((crypto) => {
                const isSelected = targetCrypto === crypto.id;
                return (
                  <motion.button
                    key={crypto.id}
                    onClick={() => setTargetCrypto(crypto.id)}
                    className="group relative flex flex-col items-center gap-1.5 outline-none focus-visible:outline-none transition-colors duration-150"
                  >
                    <motion.div 
                      className={cn(
                        'relative h-16 w-16 rounded-full border-2 flex items-center justify-center bg-transparent transition-colors duration-150',
                        isSelected ? 'border-primary' : 'border-foreground/20 group-hover:border-foreground/40'
                      )}
                      whileHover={{ scale: 1 }}
                    >
                      <motion.div
                        className="absolute inset-0 rounded-full bg-foreground/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        initial={false}
                      />
                      <span className={cn(
                        'text-2xl transition-colors duration-150 relative z-10',
                        isSelected ? 'scale-110' : ''
                      )}>
                        {crypto.icon}
                      </span>
                      {isSelected && (
                        <motion.div
                          layoutId="selected-crypto"
                          className="absolute inset-0 rounded-full border-2 border-primary"
                          transition={{ duration: 0.2, ease: 'easeOut' }}
                        />
                      )}
                    </motion.div>
                    <p className={cn(
                      'text-xs transition-colors duration-200',
                      isSelected ? 'text-primary font-medium' : 'text-muted-foreground group-hover:text-foreground'
                    )}>
                      {crypto.label}
                    </p>
                  </motion.button>
                );
              })}
            </div>
          )}

          {/* Summary Step */}
          {currentStep === summaryStep && (
            <div className="bg-card border-2 border-border rounded-xl p-6 space-y-4 max-w-2xl mx-auto">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-primary" />
                <h3 className="font-heading text-lg font-bold">Resumen del Link</h3>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Tu Link</span>
                  <span className="font-mono text-xs text-primary">links.loopay.com/{username}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Concepto</span>
                  <span className="font-semibold text-sm">{title}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Monto</span>
                  <span className="font-bold text-lg font-mono tabular-nums">
                    {CURRENCY_ICONS[currency]} {currency} {parseFloat(amount).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Método</span>
                  <span className="font-semibold text-sm capitalize">{collectionMethod === 'link' ? 'Link De Pago' : 'Código QR'}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Recibir en</span>
                  <span className="font-semibold text-sm">
                    {settlement === 'vault' && 'USDT'}
                    {settlement === 'bank' && 'Local Bank'}
                    {settlement === 'convert' && `${targetCrypto}`}
                  </span>
                </div>
              </div>

              <div className="bg-success/10 border border-success/20 rounded-xl p-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                <p className="text-xs text-success">
                  <strong>0% Fees</strong> · Instant settlement · No setup required
                </p>
              </div>

              {/* Claim Link Button - Show after first link is created */}
              {showClaimButton && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="pt-4 border-t border-border"
                >
                  <ClaimLinkButton />
                </motion.div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation - Limited width to match inputs */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mt-12 flex gap-4 max-w-xl mx-auto w-full"
      >
        {currentStep > 0 && (
          <Button
            variant="outline"
            size="lg"
            onClick={handleBack}
            className="flex-1"
          >
            Atrás
          </Button>
        )}
        <Button
          size="lg"
          onClick={handleNext}
          disabled={!canProceed()}
          variant="gradient"
          className="flex-1"
        >
          {currentStep === summaryStep ? (
            <>
              <Sparkles className="w-5 h-5 mr-2" />
              Generar Link
            </>
          ) : (
            <>
              Continuar
              <ArrowRight className="w-5 h-5 ml-2" />
            </>
          )}
        </Button>
      </motion.div>
    </div>
  );
}

