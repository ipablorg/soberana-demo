import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover';
import { Button } from '@/shared/components/ui/button';
import {
  LayoutGrid,
  ArrowDownRight,
  Globe,
  Wallet,
} from '@/shared/components/animated-icons';
import {
  useActiveProductStore,
  type ActiveProduct,
} from '@/shared/stores/useActiveProductStore';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { cn } from '@/shared/lib/utils';

interface ProductItem {
  id: ActiveProduct;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

export function ProductSwitcher() {
  const [open, setOpen] = useState(false);
  const { activeProduct, setActiveProduct } = useActiveProductStore();
  const { t } = useLingui();

  const products: ProductItem[] = [
    {
      id: 'local-payments',
      name: 'Local Payments',
      description: t`Pagos, cobros y transferencias locales`,
      icon: ArrowDownRight,
    },
    {
      id: 'loopay-x',
      name: 'Loopay X',
      description: t`FX, bridge y operaciones cross-border`,
      icon: Globe,
    },
    {
      id: 'wallet',
      name: 'Wallet',
      description: t`Tarjetas, cuentas y gestión de fondos`,
      icon: Wallet,
    },
  ];

  const handleSelect = (productId: ActiveProduct) => {
    setActiveProduct(activeProduct === productId ? null : productId);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          aria-label={t`Cambiar producto`}
        >
          <LayoutGrid className="w-4 h-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-[320px] rounded-xl border border-border bg-card shadow-lg p-4"
      >
        <div className="grid grid-cols-3 gap-2">
          {products.map((product) => {
            const isActive = activeProduct === product.id;
            const Icon = product.icon;

            return (
              <button
                key={product.id}
                onClick={() => handleSelect(product.id)}
                className={cn(
                  'rounded-lg p-3 transition-colors duration-150 cursor-pointer flex flex-col items-center gap-2 text-center',
                  isActive
                    ? 'bg-muted ring-1 ring-border'
                    : 'hover:bg-muted'
                )}
              >
                <div
                  className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center',
                    isActive ? 'bg-primary text-primary-foreground' : 'bg-muted'
                  )}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium text-foreground leading-tight">
                  {product.name}
                </span>
                <span className="text-xs text-muted-foreground leading-tight">
                  {product.description}
                </span>
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
