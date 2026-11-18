/**
 * Rate Timer Hook
 * 
 * Manages timers for:
 * - Rate updates (polling)
 * - Rate request countdown
 * - Elapsed time display
 */

import { useEffect, useState, useCallback } from 'react';
import { useBridgeStore } from '../stores/useBridgeStore';
import { useRateRequestStore } from '../stores/useRateRequestStore';
import { BridgeProduct } from '../types/bridge';

interface UseRateTimerProps {
  enableRatePolling?: boolean;
}

export function useRateTimer({ enableRatePolling = true }: UseRateTimerProps = {}) {
  const { selectedProduct, selectedPair, lastRateUpdate, updateRate } = useBridgeStore();
  const { activeRequest, timeRemaining, isExpired, updateTimer } = useRateRequestStore();
  
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [countdownDisplay, setCountdownDisplay] = useState('');
  
  // Calculate rate update interval based on product
  const getRateUpdateInterval = useCallback((product: BridgeProduct | null): number => {
    if (!product) return 180000; // 3 minutes default
    
    // Express products (time = 0) update every 5 seconds
    if (product.time === 0) {
      return 5000;
    }
    
    // Other products update every 3 minutes
    return 180000;
  }, []);
  
  // Poll rate updates
  useEffect(() => {
    if (!enableRatePolling || !selectedProduct || !selectedPair) return;
    
    const interval = getRateUpdateInterval(selectedProduct);
    
    const timer = setInterval(() => {
      // Simulate rate fluctuation (±0.1%)
      const currentRate = selectedPair.rate;
      const fluctuation = (Math.random() - 0.5) * currentRate * 0.001;
      const newRate = currentRate + fluctuation;
      
      updateRate(newRate);
    }, interval);
    
    return () => clearInterval(timer);
  }, [enableRatePolling, selectedProduct, selectedPair, getRateUpdateInterval, updateRate]);
  
  // Update elapsed time since last rate update
  useEffect(() => {
    if (!lastRateUpdate) return;
    
    const timer = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor((now - lastRateUpdate.getTime()) / 1000);
      setElapsedSeconds(elapsed);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [lastRateUpdate]);
  
  // Update countdown for active request
  useEffect(() => {
    if (!activeRequest || isExpired) {
      setCountdownDisplay('');
      return;
    }
    
    const timer = setInterval(() => {
      updateTimer(activeRequest);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [activeRequest, isExpired, updateTimer]);
  
  // Update countdown display
  useEffect(() => {
    if (timeRemaining <= 0) {
      setCountdownDisplay('Expirado');
      return;
    }
    
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    setCountdownDisplay(`${minutes}:${seconds.toString().padStart(2, '0')}`);
  }, [timeRemaining]);
  
  // Format elapsed time display
  const getElapsedDisplay = useCallback((): string => {
    if (elapsedSeconds < 60) {
      return `${elapsedSeconds}s`;
    }
    
    const minutes = Math.floor(elapsedSeconds / 60);
    if (minutes < 60) {
      return `${minutes}m`;
    }
    
    const hours = Math.floor(minutes / 60);
    return `${hours}h`;
  }, [elapsedSeconds]);
  
  // Get next update time
  const getNextUpdateIn = useCallback((): number => {
    if (!selectedProduct) return 0;
    
    const interval = getRateUpdateInterval(selectedProduct);
    const elapsed = elapsedSeconds * 1000;
    return Math.max(0, interval - elapsed);
  }, [selectedProduct, elapsedSeconds, getRateUpdateInterval]);
  
  return {
    // Rate update timing
    elapsedSeconds,
    elapsedDisplay: getElapsedDisplay(),
    nextUpdateIn: getNextUpdateIn(),
    
    // Countdown for active request
    timeRemaining,
    countdownDisplay,
    isExpired,
    
    // Computed
    hasActiveCountdown: activeRequest !== null && !isExpired,
    updateInterval: getRateUpdateInterval(selectedProduct),
  };
}

