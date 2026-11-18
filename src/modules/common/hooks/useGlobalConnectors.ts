/**
 * useGlobalConnectors Hook
 * 
 * Custom hook for managing GlobalConnectors state and actions
 */

import { useState, useCallback } from 'react';
import type { Corridor, PaymentFlowResponse } from '@/shared/types/globalconnectors.types';

interface UseGlobalConnectorsReturn {
  selectedCorridor: Corridor | null;
  paymentResult: PaymentFlowResponse | null;
  setSelectedCorridor: (corridor: Corridor | null) => void;
  setPaymentResult: (result: PaymentFlowResponse | null) => void;
  reset: () => void;
}

/**
 * Hook to manage GlobalConnectors flow state
 * 
 * @example
 * ```tsx
 * function PaymentFlow() {
 *   const { selectedCorridor, paymentResult, setSelectedCorridor, reset } = useGlobalConnectors();
 *   
 *   return (
 *     <div>
 *       {!selectedCorridor && <CorridorSelector onSelect={setSelectedCorridor} />}
 *       {selectedCorridor && !paymentResult && <PaymentForm corridor={selectedCorridor} />}
 *       {paymentResult && <DepositInstructions paymentFlow={paymentResult} />}
 *     </div>
 *   );
 * }
 * ```
 */
export function useGlobalConnectors(): UseGlobalConnectorsReturn {
  const [selectedCorridor, setSelectedCorridor] = useState<Corridor | null>(null);
  const [paymentResult, setPaymentResult] = useState<PaymentFlowResponse | null>(null);

  const reset = useCallback(() => {
    setSelectedCorridor(null);
    setPaymentResult(null);
  }, []);

  return {
    selectedCorridor,
    paymentResult,
    setSelectedCorridor,
    setPaymentResult,
    reset,
  };
}

