/**
 * Bridge Products Mock Data
 * 
 * Mock data for bridge products based on Firebase structure
 * TODO: Replace with API calls when backend is ready
 */

import { BridgeProduct, CurrencyPair, RateRequest } from '@/shared/types/bridge';

const now = Math.floor(Date.now() / 1000);

export const mockBridgeProducts: BridgeProduct[] = [
  {
    id: 'DdP2LodwZ7DzJi46lgj4',
    name: 'X pres',
    type: 'instant',
    time: 0,
    description: 'Transfiere a la wallet y el cierre será instantáneo.',
    img: 'https://firebasestorage.googleapis.com/v0/b/automations-466716.firebasestorage.app/o/producIcons%2Fxpress.png?alt=media&token=077da877-faef-48b3-ab74-86329e28dbd0',
    createdAt: {
      _seconds: now - 86400 * 30,
      _nanoseconds: 0,
    },
    updatedAt: {
      _seconds: now,
      _nanoseconds: 0,
    },
  },
  {
    id: '3x-product-id',
    name: '3X',
    type: 'close',
    time: 3,
    description: 'Cierra la tasa por 3 minutos para tu operación.',
    img: 'https://firebasestorage.googleapis.com/v0/b/automations-466716.firebasestorage.app/o/producIcons%2F3x.png?alt=media&token=3x-icon-token',
    createdAt: {
      _seconds: now - 86400 * 30,
      _nanoseconds: 0,
    },
    updatedAt: {
      _seconds: now,
      _nanoseconds: 0,
    },
  },
  {
    id: 'xrate-product-id',
    name: 'X Rate',
    type: 'freeze',
    time: 30,
    description: 'Congela la tasa por 30 minutos, opera con cualquier monto.',
    img: 'https://firebasestorage.googleapis.com/v0/b/automations-466716.firebasestorage.app/o/producIcons%2Fxrate.png?alt=media&token=xrate-icon-token',
    createdAt: {
      _seconds: now - 86400 * 30,
      _nanoseconds: 0,
    },
    updatedAt: {
      _seconds: now,
      _nanoseconds: 0,
    },
  },
  {
    id: 'prex-product-id',
    name: 'Pre X',
    type: 'prefund',
    time: 1000,
    description: 'Fondea tu wallet, cierra con USDT disponible.',
    img: 'https://firebasestorage.googleapis.com/v0/b/automations-466716.firebasestorage.app/o/producIcons%2Fprex.png?alt=media&token=prex-icon-token',
    createdAt: {
      _seconds: now - 86400 * 30,
      _nanoseconds: 0,
    },
    updatedAt: {
      _seconds: now,
      _nanoseconds: 0,
    },
  },
];

export const mockCurrencyPairs: CurrencyPair[] = [
  {
    from: 'USDT',
    to: 'COP',
    rate: 4130.50,
    marketRate: 4130.50,
    lastUpdated: new Date(),
    updateInterval: 5000, // 5 seconds for Express, 180000 for others
    settlementType: 'SD',
  },
  {
    from: 'USDT',
    to: 'USD',
    rate: 1.00,
    marketRate: 1.00,
    lastUpdated: new Date(),
    updateInterval: 5000,
    settlementType: 'SD',
  },
  {
    from: 'USDT',
    to: 'MXN',
    rate: 18.50,
    marketRate: 18.50,
    lastUpdated: new Date(),
    updateInterval: 5000,
    settlementType: 'SD',
  },
  {
    from: 'USDT',
    to: 'BRL',
    rate: 5.20,
    marketRate: 5.20,
    lastUpdated: new Date(),
    updateInterval: 5000,
    settlementType: 'SD',
  },
  {
    from: 'USDT',
    to: 'EUR',
    rate: 0.95,
    marketRate: 0.95,
    lastUpdated: new Date(),
    updateInterval: 5000,
    settlementType: 'ND',
  },
  {
    from: 'USDT',
    to: 'ARS',
    rate: 1050.00,
    marketRate: 1050.00,
    lastUpdated: new Date(),
    updateInterval: 5000,
    settlementType: 'SD',
  },
];

// Mock rate requests for history
export const mockRateRequests: RateRequest[] = [
  {
    id: 'req-001',
    productId: 'xrate-product-id',
    productName: 'X Rate',
    productType: 'freeze',
    productTime: 30,
    clientId: 'client-123',
    phone: '+573001234567',
    currencyPair: 'USDT-COP',
    initialAmount: 1000,
    finalRate: 4130.50,
    totalFiat: 4130500,
    requestState: 'completed',
    createdAt: {
      _seconds: now - 86400,
      _nanoseconds: 0,
    },
    walletAddress: '0xA1B2C3D4E5F6789012345678901234567890ABCD',
  },
  {
    id: 'req-002',
    productId: '3x-product-id',
    productName: '3X',
    productType: 'close',
    productTime: 3,
    clientId: 'client-123',
    phone: '+573001234567',
    currencyPair: 'USDT-COP',
    initialAmount: 500,
    finalRate: 4128.00,
    totalFiat: 2064000,
    requestState: 'completed',
    createdAt: {
      _seconds: now - 7200,
      _nanoseconds: 0,
    },
  },
  {
    id: 'req-003',
    productId: 'DdP2LodwZ7DzJi46lgj4',
    productName: 'X pres',
    productType: 'instant',
    productTime: 0,
    clientId: 'client-123',
    phone: '+573001234567',
    currencyPair: 'USDT-USD',
    initialAmount: 250,
    finalRate: 1.00,
    totalFiat: 250,
    requestState: 'completed',
    createdAt: {
      _seconds: now - 3600,
      _nanoseconds: 0,
    },
  },
  {
    id: 'req-004',
    productId: 'xrate-product-id',
    productName: 'X Rate',
    productType: 'freeze',
    productTime: 30,
    clientId: 'client-123',
    phone: '+573001234567',
    currencyPair: 'USDT-MXN',
    initialAmount: 0, // Freeze products don't require specific amount
    finalRate: 18.50,
    totalFiat: 0,
    requestState: 'expired',
    createdAt: {
      _seconds: now - 172800,
      _nanoseconds: 0,
    },
    expiresAt: new Date(Date.now() - 86400000), // Expired yesterday
  },
];

