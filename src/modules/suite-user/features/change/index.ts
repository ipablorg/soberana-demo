/**
 * Change Feature - Bridge Operations
 * 
 * Public exports for bridge on-ramp/off-ramp operations
 */

// Components
export { ProductSelector } from './components/ProductSelector';
export { RateDisplay } from './components/RateDisplay';
export { ConversionForm } from './components/ConversionForm';
export { ActiveRateRequestCard } from './components/ActiveRateRequestCard';
export { RateRequestHistory as RateRequestHistoryComponent } from './components/RateRequestHistory';
export { SwipeableBalanceCard } from './components/SwipeableBalanceCard';
export { CurrencyPairButton } from './components/CurrencyPairButton';
export { CurrencyPairDrawer } from './components/CurrencyPairDrawer';
export { FloatingRateDisplay } from './components/FloatingRateDisplay';
export { BridgeRightSidebar } from './components/BridgeRightSidebar';
export { HowItWorksDialog } from './components/HowItWorksDialog';

// Stores
export { useBridgeStore } from './stores/useBridgeStore';
export { useRateRequestStore } from './stores/useRateRequestStore';

// Hooks
export { useRateCalculation } from './hooks/useRateCalculation';
export { useRateTimer } from './hooks/useRateTimer';
export { useRateRequest } from './hooks/useRateRequest';

// Types
export type {
  BridgeProduct,
  CurrencyPair,
  RateRequest,
  RateRequestPayload,
  RateCalculation,
  RateRequestHistory,
  ProductType,
  RequestState,
} from './types/bridge';

// API
export * from './api/bridge-api';
