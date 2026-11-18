import { Trans } from '@lingui/react/macro';
import { motion } from 'framer-motion';
import { ArrowLeftRight, ArrowUpCircle, ArrowDownCircle, RefreshCw } from '@/shared/components/animated-icons';
import { cn } from '@/shared/lib/utils';
import { useClientIntakeStore } from '../../stores/client-intake-store';
import { getAvailableProductTypes, COUNTRY_FLAGS } from '../../data/wizard.data';

interface StepProductTypeProps {
  onNext: () => void;
}

const PRODUCT_ICONS: Record<string, React.ElementType> = {
  Crossborder: ArrowLeftRight,
  'On Ramp': ArrowUpCircle,
  'Off Ramp': ArrowDownCircle,
  Swap: RefreshCw,
  Recaudo: ArrowDownCircle,
  Dispersiones: ArrowUpCircle,
};

const PRODUCT_DESCRIPTIONS: Record<string, string> = {
  Crossborder: 'Pagos internacionales fiat-a-fiat',
  'On Ramp': 'Conversión de fiat a crypto (USDT)',
  'Off Ramp': 'Conversión de crypto (USDT) a fiat',
  Swap: 'Conversión entre divisas o crypto',
  Recaudo: 'Recaudo nacional',
  Dispersiones: 'Dispersiones nacionales',
};

export function StepProductType({ onNext }: StepProductTypeProps) {
  const { clientCountry, destinationCountry, setProductType } = useClientIntakeStore();
  const products = getAvailableProductTypes(clientCountry ?? '', destinationCountry ?? '');

  const handleSelect = (product: string) => {
    setProductType(product);
    onNext();
  };

  if (products.length === 0) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-12 text-center">
        <p className="text-sm text-muted-foreground">
          <Trans>Sin productos disponibles para este corredor</Trans>
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-8">
      <div className={cn(
        'grid w-full gap-3',
        products.length === 1 ? 'max-w-xs' : 'sm:grid-cols-2',
      )}>
        {products.map((product) => {
          const Icon = PRODUCT_ICONS[product] ?? ArrowLeftRight;

          return (
            <motion.button
              key={product}
              onClick={() => handleSelect(product)}
              className={cn(
                'flex items-center gap-4 rounded-xl border-2 border-border bg-card p-5',
                'transition-colors duration-150 hover:border-primary',
              )}
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <Icon className="h-6 w-6 text-primary" />
              </div>
              <div className="text-left">
                <p className="font-heading text-sm font-semibold text-foreground">
                  {product}
                </p>
                <p className="text-xs text-muted-foreground">
                  {PRODUCT_DESCRIPTIONS[product] ?? ''}
                </p>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
