/**
 * Rate Request Store
 * 
 * Manages rate requests state:
 * - Active rate request
 * - Request history
 * - Timer management
 * - Request operations (create, cancel, check)
 */

import { create } from 'zustand';
import { RateRequest, RateRequestPayload, RateRequestHistory } from '../types/bridge';
import { mockRateRequests } from '../api/bridge-products-mock';

interface RateRequestState {
  // Active request
  activeRequest: RateRequest | null;
  isSubmitting: boolean;
  isCancelling: boolean;
  
  // History
  history: RateRequest[];
  historyPage: number;
  historyLimit: number;
  hasMoreHistory: boolean;
  totalHistory: number;
  isLoadingHistory: boolean;
  
  // Timer
  timeRemaining: number; // seconds
  isExpired: boolean;
  
  // Actions
  createRateRequest: (payload: RateRequestPayload) => Promise<RateRequest>;
  cancelRateRequest: (requestId: string) => Promise<void>;
  loadHistory: (page?: number, limit?: number) => Promise<void>;
  checkActiveRequest: (productId: string) => Promise<RateRequest | null>;
  updateTimer: (request: RateRequest) => void;
  clearActiveRequest: () => void;
  reset: () => void;
}

export const useRateRequestStore = create<RateRequestState>((set, get) => ({
  // Initial state
  activeRequest: null,
  isSubmitting: false,
  isCancelling: false,
  
  history: [],
  historyPage: 1,
  historyLimit: 5,
  hasMoreHistory: false,
  totalHistory: 0,
  isLoadingHistory: false,
  
  timeRemaining: 0,
  isExpired: false,
  
  // Create rate request
  createRateRequest: async (payload: RateRequestPayload) => {
    set({ isSubmitting: true });
    
    try {
      // TODO: Replace with API call
      // const request = await submitRateRequest(payload);
      
      // Mock request creation
      const now = Math.floor(Date.now() / 1000);
      const expiresAt = payload.productTime > 0 
        ? new Date(Date.now() + payload.productTime * 60 * 1000)
        : undefined;
      
      const request: RateRequest = {
        id: `req-${Date.now()}`,
        productId: payload.productId,
        productName: payload.productName,
        productType: payload.productType as 'instant' | 'freeze' | 'close' | 'prefund',
        productTime: payload.productTime,
        clientId: payload.clientId,
        phone: payload.phone,
        currencyPair: payload.currencyPair,
        initialAmount: payload.initialAmount,
        finalRate: payload.finalRate,
        totalFiat: payload.totalFiat,
        walletAddress: payload.walletAddress,
        fromAccountId: payload.fromAccountId,
        toAccountId: payload.toAccountId,
        requestState: 'initial',
        createdAt: {
          _seconds: now,
          _nanoseconds: 0,
        },
        expiresAt,
      };
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      set({ 
        activeRequest: request,
        isSubmitting: false,
        timeRemaining: payload.productTime * 60,
        isExpired: false,
      });
      
      // Add to history
      const { history } = get();
      set({ 
        history: [request, ...history],
        totalHistory: history.length + 1,
      });
      
      return request;
    } catch (error) {
      console.error('Failed to create rate request:', error);
      set({ isSubmitting: false });
      throw error;
    }
  },
  
  // Cancel rate request
  cancelRateRequest: async (requestId: string) => {
    set({ isCancelling: true });
    
    try {
      // TODO: Replace with API call
      // await cancelRateRequest(requestId);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update request state in history
      set(state => ({
        activeRequest: state.activeRequest?.id === requestId ? null : state.activeRequest,
        history: state.history.map(req =>
          req.id === requestId
            ? { ...req, requestState: 'cancelled' as const }
            : req
        ),
        isCancelling: false,
        timeRemaining: 0,
        isExpired: false,
      }));
    } catch (error) {
      console.error('Failed to cancel rate request:', error);
      set({ isCancelling: false });
      throw error;
    }
  },
  
  // Load request history
  loadHistory: async (page = 1, limit = 5) => {
    set({ isLoadingHistory: true });
    
    try {
      // TODO: Replace with API call
      // const result = await fetchRateRequestHistory(page, limit);
      
      // Mock history loading with pagination
      const allRequests = mockRateRequests;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedRequests = allRequests.slice(startIndex, endIndex);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      set({
        history: page === 1 ? paginatedRequests : [...get().history, ...paginatedRequests],
        historyPage: page,
        historyLimit: limit,
        hasMoreHistory: endIndex < allRequests.length,
        totalHistory: allRequests.length,
        isLoadingHistory: false,
      });
    } catch (error) {
      console.error('Failed to load history:', error);
      set({ isLoadingHistory: false });
    }
  },
  
  // Check for active request for a product
  checkActiveRequest: async (productId: string) => {
    try {
      // TODO: Replace with API call
      // const activeRequest = await fetchActiveRequest(productId);
      
      // Mock: Check if there's an active request in history
      const { history } = get();
      const activeRequest = history.find(
        req => req.productId === productId && req.requestState === 'initial'
      );
      
      if (activeRequest) {
        // Calculate time remaining
        const now = Date.now();
        const createdAt = activeRequest.createdAt._seconds * 1000;
        const elapsedSeconds = Math.floor((now - createdAt) / 1000);
        const totalSeconds = activeRequest.productTime * 60;
        const remaining = Math.max(0, totalSeconds - elapsedSeconds);
        
        set({
          activeRequest,
          timeRemaining: remaining,
          isExpired: remaining === 0,
        });
        
        return activeRequest;
      }
      
      return null;
    } catch (error) {
      console.error('Failed to check active request:', error);
      return null;
    }
  },
  
  // Update timer (called every second)
  updateTimer: (request: RateRequest) => {
    if (!request.expiresAt) return;
    
    const now = Date.now();
    const expiresAt = request.expiresAt.getTime();
    const remaining = Math.max(0, Math.floor((expiresAt - now) / 1000));
    
    set({
      timeRemaining: remaining,
      isExpired: remaining === 0,
    });
    
    // Auto-expire if time is up
    if (remaining === 0 && request.requestState === 'initial') {
      set(state => ({
        activeRequest: null,
        history: state.history.map(req =>
          req.id === request.id
            ? { ...req, requestState: 'expired' as const }
            : req
        ),
      }));
    }
  },
  
  // Clear active request
  clearActiveRequest: () => {
    set({
      activeRequest: null,
      timeRemaining: 0,
      isExpired: false,
    });
  },
  
  // Reset store
  reset: () => {
    set({
      activeRequest: null,
      isSubmitting: false,
      isCancelling: false,
      history: [],
      historyPage: 1,
      hasMoreHistory: false,
      totalHistory: 0,
      timeRemaining: 0,
      isExpired: false,
    });
  },
}));

