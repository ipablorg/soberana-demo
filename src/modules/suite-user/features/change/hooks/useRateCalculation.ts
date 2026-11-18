/**
 * Rate Calculation Hook
 * 
 * Handles conversion calculations with debouncing
 */

import { useEffect, useState, useCallback } from 'react';
import { useBridgeStore } from '../stores/useBridgeStore';

interface UseRateCalculationProps {
  debounceMs?: number;
}

export function useRateCalculation({ debounceMs = 300 }: UseRateCalculationProps = {}) {
  const {
    selectedPair,
    selectedProduct,
    usdtAmount,
    fiatAmount,
    calculation,
    calculateConversion,
  } = useBridgeStore();
  
  const [debouncedUsdtAmount, setDebouncedUsdtAmount] = useState(usdtAmount);
  const [debouncedFiatAmount, setDebouncedFiatAmount] = useState(fiatAmount);
  
  // Debounce USDT input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedUsdtAmount(usdtAmount);
    }, debounceMs);
    
    return () => clearTimeout(handler);
  }, [usdtAmount, debounceMs]);
  
  // Debounce Fiat input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedFiatAmount(fiatAmount);
    }, debounceMs);
    
    return () => clearTimeout(handler);
  }, [fiatAmount, debounceMs]);
  
  // Calculate from USDT to Fiat
  const calculateFromUsdt = useCallback((amount: number) => {
    if (amount > 0) {
      calculateConversion(amount, 'usdt-to-fiat');
    }
  }, [calculateConversion]);
  
  // Calculate from Fiat to USDT
  const calculateFromFiat = useCallback((amount: number) => {
    if (amount > 0) {
      calculateConversion(amount, 'fiat-to-usdt');
    }
  }, [calculateConversion]);
  
  // Validate amount
  const validateAmount = useCallback((amount: number): {
    isValid: boolean;
    error?: string;
  } => {
    if (amount <= 0) {
      return { isValid: false, error: 'El monto debe ser mayor a 0' };
    }
    
    if (amount > 1000000) {
      return { isValid: false, error: 'El monto excede el límite máximo' };
    }
    
    if (!selectedPair) {
      return { isValid: false, error: 'Selecciona un par de moneda' };
    }
    
    return { isValid: true };
  }, [selectedPair]);
  
  // Format currency display
  const formatCurrency = useCallback((amount: number, currency: string): string => {
    const locale = currency === 'COP' ? 'es-CO' : 'en-US';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }, []);
  
  return {
    // State
    selectedPair,
    selectedProduct,
    usdtAmount: debouncedUsdtAmount,
    fiatAmount: debouncedFiatAmount,
    calculation,
    
    // Actions
    calculateFromUsdt,
    calculateFromFiat,
    validateAmount,
    formatCurrency,
    
    // Computed
    hasCalculation: calculation !== null,
    rate: selectedPair?.rate || 0,
    currency: selectedPair?.to || 'COP',
  };
}

