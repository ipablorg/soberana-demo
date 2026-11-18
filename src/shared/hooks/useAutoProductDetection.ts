import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useActiveProductStore, type ActiveProduct } from '@/shared/stores/useActiveProductStore';

const ROUTE_TO_PRODUCT: Record<string, ActiveProduct> = {
  '/suite/move': 'local-payments',
  '/suite/convert': 'loopay-x',
  '/suite/comex': 'loopay-x',
  '/suite/account/cards': 'wallet',
  '/suite/account/card-pro': 'wallet',
  '/suite/settings/branding': 'wallet',
};

export function useAutoProductDetection() {
  const location = useLocation();
  const { activeProduct, setActiveProduct } = useActiveProductStore();

  useEffect(() => {
    const path = location.pathname;

    for (const [prefix, product] of Object.entries(ROUTE_TO_PRODUCT)) {
      if (path.startsWith(prefix)) {
        if (activeProduct !== product) {
          setActiveProduct(product);
        }
        return;
      }
    }
  }, [location.pathname, activeProduct, setActiveProduct]);
}
