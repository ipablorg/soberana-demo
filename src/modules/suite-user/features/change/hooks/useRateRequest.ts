/**
 * Rate Request Hook
 * 
 * Handles rate request operations:
 * - Submit rate request
 * - Cancel rate request
 * - Check active requests
 * - Validation
 */

import { useCallback } from 'react';
import { useLingui } from '@lingui/react/macro';
import { toast } from 'sonner';
import { useBridgeStore } from '../stores/useBridgeStore';
import { useRateRequestStore } from '../stores/useRateRequestStore';
import { RateRequestPayload } from '../types/bridge';

interface SubmitRateRequestParams {
  amount?: number;
  fromAccountId?: string;
  toAccountId?: string;
  walletAddress?: string;
}

export function useRateRequest() {
  const { t } = useLingui();
  const {
    selectedProduct,
    selectedPair,
    calculation,
  } = useBridgeStore();
  
  const {
    activeRequest,
    isSubmitting,
    isCancelling,
    createRateRequest,
    cancelRateRequest,
    checkActiveRequest,
  } = useRateRequestStore();
  
  // Validate request before submission
  const validateRequest = useCallback((params: SubmitRateRequestParams): {
    isValid: boolean;
    error?: string;
  } => {
    if (!selectedProduct) {
      return { isValid: false, error: t`Elige un producto` };
    }
    
    if (!selectedPair) {
      return { isValid: false, error: t`Elige un par de monedas` };
    }
    
    // For non-freeze products, amount is required
    if (selectedProduct.type !== 'freeze') {
      if (!params.amount || params.amount <= 0) {
        return { isValid: false, error: t`Ingresa un monto válido` };
      }
      
      if (!calculation) {
        return { isValid: false, error: t`Aún no tenemos el cálculo listo` };
      }
    }
    
    // For instant products, wallet address is required
    if (selectedProduct.type === 'instant' && !params.walletAddress) {
      return { isValid: false, error: t`Ingresa la dirección de wallet` };
    }
    
    return { isValid: true };
    }, [selectedProduct, selectedPair, calculation, t]);
  
  // Submit rate request
  const submitRequest = useCallback(async (params: SubmitRateRequestParams) => {
    const validation = validateRequest(params);
    
    if (!validation.isValid) {
      toast.error(validation.error);
      return null;
    }
    
    if (!selectedProduct || !selectedPair) return null;
    
    try {
      const payload: RateRequestPayload = {
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        productType: selectedProduct.type,
        productTime: selectedProduct.time,
        clientId: 'mock-client-id', // TODO: Get from auth context
        phone: '+573001234567', // TODO: Get from user profile
        currencyPair: `${selectedPair.from}-${selectedPair.to}`,
        initialAmount: params.amount || 0,
        finalRate: selectedPair.rate,
        totalFiat: calculation?.fiatAmount || 0,
        walletAddress: params.walletAddress,
        fromAccountId: params.fromAccountId,
        toAccountId: params.toAccountId,
      };
      
      const request = await createRateRequest(payload);
      
      // Show success message based on product type
      let message = '';
      if (selectedProduct.type === 'freeze') {
        message = t`Tasa congelada por ${selectedProduct.time} minutos`;
      } else if (selectedProduct.type === 'instant') {
        message = t`Operación iniciada — Transferencia instantánea`;
      } else {
        message = t`Tasa cerrada por ${selectedProduct.time} minutos`;
      }
      
      toast.success(message, {
        description: t`Tasa: ${selectedPair.rate.toFixed(2)} ${selectedPair.to}`,
      });
      
      return request;
    } catch (error) {
      console.error('Error submitting rate request:', error);
      toast.error(t`No pudimos crear la solicitud`, {
        description: t`Intenta de nuevo en unos segundos`,
      });
      return null;
    }
  }, [
    validateRequest,
    selectedProduct,
    selectedPair,
    calculation,
    createRateRequest,
    t,
  ]);
  
  // Cancel active request
  const cancelRequest = useCallback(async () => {
    if (!activeRequest) return;
    
    try {
      await cancelRateRequest(activeRequest.id);
      
      const actionText = selectedProduct?.type === 'freeze' ? t`Tasa descongelada` : t`Solicitud cancelada`;
      toast.success(actionText);
    } catch (error) {
      console.error('Error cancelling request:', error);
      toast.error(t`No pudimos cancelar la solicitud`);
    }
  }, [activeRequest, selectedProduct, cancelRateRequest, t]);
  
  // Check if product has active request
  const checkIfActive = useCallback(async (productId: string) => {
    return await checkActiveRequest(productId);
  }, [checkActiveRequest]);
  
  // Determine if product can submit new request
  const canSubmitRequest = useCallback((): boolean => {
    if (!selectedProduct) return false;
    
    // Multi-close products (close, prefund) allow multiple requests
    if (selectedProduct.type === 'close' || selectedProduct.type === 'prefund') {
      return true;
    }
    
    // Other products require no active request
    return activeRequest === null;
  }, [selectedProduct, activeRequest]);
  
  return {
    // State
    activeRequest,
    isSubmitting,
    isCancelling,
    canSubmitRequest: canSubmitRequest(),
    
    // Actions
    submitRequest,
    cancelRequest,
    checkIfActive,
    validateRequest,
  };
}

