/**
 * Bridge Store
 * 
 * Manages bridge products state:
 * - Products list
 * - Selected product
 * - Currency pairs
 * - Rate updates
 * - Conversion calculations
 */

import { create } from 'zustand';
import { BridgeProduct, CurrencyPair, RateCalculation } from '@/shared/types/bridge';
import { mockBridgeProducts, mockCurrencyPairs } from './bridge-products-mock';

interface BridgeState {
  // Products
  products: BridgeProduct[];
  selectedProduct: BridgeProduct | null;
  isLoadingProducts: boolean;
  
  // Currency pairs
  currencyPairs: CurrencyPair[];
  selectedPair: CurrencyPair | null;
  
  // Rate updates
  lastRateUpdate: Date | null;
  isUpdatingRate: boolean;
  
  // Conversion calculation
  usdtAmount: number;
  fiatAmount: number;
  calculation: RateCalculation | null;
  
  // Actions
  loadProducts: () => Promise<void>;
  selectProduct: (productId: string) => void;
  selectCurrencyPair: (from: string, to: string) => void;
  updateRate: (newRate: number) => void;
  calculateConversion: (amount: number, direction: 'usdt-to-fiat' | 'fiat-to-usdt') => void;
  reset: () => void;
}

export const useBridgeStore = create<BridgeState>((set, get) => ({
  // Initial state
  products: [],
  selectedProduct: null,
  isLoadingProducts: false,
  
  currencyPairs: [],
  selectedPair: null,
  
  lastRateUpdate: null,
  isUpdatingRate: false,
  
  usdtAmount: 0,
  fiatAmount: 0,
  calculation: null,
  
  // Load products from API (currently mock)
  loadProducts: async () => {
    set({ isLoadingProducts: true });
    
    try {
      // TODO: Replace with API call
      // const products = await fetchBridgeProducts();
      const products = mockBridgeProducts;
      const pairs = mockCurrencyPairs;
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      set({
        products,
        currencyPairs: pairs,
        selectedProduct: products[0] || null,
        selectedPair: pairs[0] || null,
        isLoadingProducts: false,
        lastRateUpdate: new Date(),
      });
    } catch (error) {
      console.error('Failed to load bridge products:', error);
      set({ isLoadingProducts: false });
    }
  },
  
  // Select a product
  selectProduct: (productId: string) => {
    const { products } = get();
    const product = products.find(p => p.id === productId);
    
    if (product) {
      set({ 
        selectedProduct: product,
        // Reset calculation when changing product
        usdtAmount: 0,
        fiatAmount: 0,
        calculation: null,
      });
    }
  },
  
  // Select currency pair
  selectCurrencyPair: (from: string, to: string) => {
    const { currencyPairs } = get();
    const pair = currencyPairs.find(p => p.from === from && p.to === to);
    
    if (pair) {
      set({ 
        selectedPair: pair,
        lastRateUpdate: new Date(),
        // Reset calculation when changing pair
        usdtAmount: 0,
        fiatAmount: 0,
        calculation: null,
      });
    }
  },
  
  // Update rate (simulates real-time rate updates)
  updateRate: (newRate: number) => {
    const { selectedPair } = get();
    
    if (selectedPair) {
      const updatedPair: CurrencyPair = {
        ...selectedPair,
        rate: newRate,
        lastUpdated: new Date(),
      };
      
      set(state => ({
        selectedPair: updatedPair,
        currencyPairs: state.currencyPairs.map(p =>
          p.from === selectedPair.from && p.to === selectedPair.to
            ? updatedPair
            : p
        ),
        lastRateUpdate: new Date(),
        isUpdatingRate: false,
      }));
      
      // Recalculate if there's an amount
      const { usdtAmount } = get();
      if (usdtAmount > 0) {
        get().calculateConversion(usdtAmount, 'usdt-to-fiat');
      }
    }
  },
  
  // Calculate conversion
  calculateConversion: (amount: number, direction: 'usdt-to-fiat' | 'fiat-to-usdt') => {
    const { selectedPair, selectedProduct } = get();
    
    if (!selectedPair || amount <= 0) {
      set({
        usdtAmount: 0,
        fiatAmount: 0,
        calculation: null,
      });
      return;
    }
    
    const rate = selectedPair.rate;
    const feePercentage = 0.002; // 0.2% fee
    
    let usdtAmount: number;
    let fiatAmount: number;
    
    if (direction === 'usdt-to-fiat') {
      usdtAmount = amount;
      fiatAmount = amount * rate * (1 - feePercentage);
    } else {
      fiatAmount = amount;
      usdtAmount = (amount / rate) * (1 - feePercentage);
    }
    
    const fee = direction === 'usdt-to-fiat' 
      ? amount * rate * feePercentage
      : (amount / rate) * feePercentage;
    
    // Estimate time based on product type
    let estimatedTime = '10-15 min';
    if (selectedProduct) {
      if (selectedProduct.type === 'instant') {
        estimatedTime = 'Instantáneo';
      } else if (selectedProduct.type === 'freeze') {
        estimatedTime = `${selectedProduct.time} minutos`;
      } else if (selectedProduct.type === 'close' || selectedProduct.type === 'prefund') {
        estimatedTime = `Hasta ${selectedProduct.time} minutos`;
      }
    }
    
    const calculation: RateCalculation = {
      usdtAmount,
      fiatAmount,
      rate,
      fee,
      feePercentage,
      estimatedTime,
      settlementType: selectedPair.settlementType || 'SD',
    };
    
    set({
      usdtAmount,
      fiatAmount,
      calculation,
    });
  },
  
  // Reset state
  reset: () => {
    set({
      usdtAmount: 0,
      fiatAmount: 0,
      calculation: null,
    });
  },
}));

