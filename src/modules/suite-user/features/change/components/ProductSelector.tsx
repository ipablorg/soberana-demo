/**
 * ProductSelector Component
 * 
 * Grid of product chips for selection
 * Shows product icon, name, active badge, and selection indicator
 */

import { CheckCircle, Snowflake } from '@/shared/components/animated-icons';
import { motion } from 'framer-motion';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';
import { useBridgeStore } from '../stores/useBridgeStore';
import { useRateRequestStore } from '../stores/useRateRequestStore';
import { BridgeProduct } from '../types/bridge';

export function ProductSelector() {
  const { products, selectedProduct, selectProduct } = useBridgeStore();
  const { history } = useRateRequestStore();
  
  const hasActiveRequest = (product: BridgeProduct): boolean => {
    return history.some(
      req => req.productId === product.id && req.requestState === 'initial'
    );
  };
  
  if (products.length === 0) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-24 rounded-xl bg-background/20 backdrop-blur-md animate-pulse"
          />
        ))}
      </div>
    );
  }
  
  return (
    <div className="flex items-center justify-center gap-4 flex-wrap">
      {products.map((product) => {
        const isSelected = selectedProduct?.id === product.id;
        const isActive = hasActiveRequest(product);
        
        return (
          <Button
            key={product.id}
            variant="ghost"
            onClick={() => selectProduct(product.id)}
            className={cn(
              'relative group h-auto p-0 flex flex-col items-center',
              'hover:bg-transparent',
              'transition-colors duration-150'
            )}
          >
            {/* Active request badge */}
            {isActive && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-6 h-6 rounded-lg bg-primary border-2 border-background flex items-center justify-center z-10"
              >
                <Snowflake className="w-3 h-3 text-primary-foreground" />
              </motion.div>
            )}
            
            {/* Circular button */}
            <div
              className={cn(
                'w-20 h-20 rounded-xl',
                'border transition-colors duration-150',
                'flex flex-col items-center justify-center',
                'bg-background/30 backdrop-blur-md',
                'group-hover:bg-background/50',
                isSelected
                  ? 'border-primary shadow-sm'
                  : 'border-border group-hover:border-primary/40'
              )}
            >
              {/* Selection indicator */}
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-6 h-6 rounded-lg bg-primary border-2 border-background flex items-center justify-center z-10"
                >
                  <CheckCircle className="w-4 h-4 text-primary-foreground" />
                </motion.div>
              )}
              
              {/* Product icon/image */}
              <div className="relative w-10 h-10 flex items-center justify-center">
                {product.img ? (
                  <>
                    <img
                      src={product.img}
                      alt={product.name}
                      className="w-10 h-10 object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const fallback = target.nextElementSibling as HTMLElement;
                        if (fallback) {
                          fallback.style.display = 'flex';
                        }
                      }}
                    />
                    {/* Fallback */}
                    <div className="hidden w-full h-full items-center justify-center text-foreground font-bold text-xl">
                      {product.name.charAt(0)}
                    </div>
                  </>
                ) : (
                  <div className="text-foreground font-bold text-xl">
                    {product.name.charAt(0)}
                  </div>
                )}
              </div>
            </div>
            
            {/* Product name below */}
            <p className={cn(
              'text-xs font-medium mt-2 text-center transition-colors',
              isSelected ? 'text-primary font-semibold' : 'text-muted-foreground group-hover:text-foreground'
            )}>
              {product.name}
            </p>
          </Button>
        );
      })}
    </div>
  );
}

