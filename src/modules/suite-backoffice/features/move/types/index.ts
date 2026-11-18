/**
 * Move Module - Types
 *
 * Frontend types for payouts and payins management
 */

// Tipo interno de la UI (adaptado del backend)
export interface PayOut {
  id: number;
  uid: string;
  state: "received" | "scheduled" | "onHold" | "delivered" | "rejected" | "cancelled";
  createdAt: string;
  scheduledAt?: string;
  transferredAt?: string;  // Corregido del typo "trasnferedAt" del backend
  amount: number;
  company: string;
  product: string;
  beneficiaryName: string;
  documentNumber: string;
  bank: string;
  email?: string;
  phone?: string;
  countryCode?: string;
  currencyCode?: string;
  gateway?: string;
  externalIdentifier?: string;
  fixedFee: number;
  percentageFee: number;
}

// Tipo interno de la UI para PayIns (adaptado del backend)
export interface PayIn {
  id: number;
  uid: string;
  type: "bank_transfer" | "card" | "pse" | "cash";
  state: "initial" | "pending" | "accepted" | "rejected" | "cancelled" | "abandoned";
  createdAt: string;
  amount: number;
  companyName: string;
  productName: string;
  creatorUserName?: string;
  payInGetWay: string;
  active: boolean;
  fileUrl?: string;
}

// Filtros internos de la UI
export interface PayoutFilters {
  searchTerm: string;
  state: string;           // "all" | StatePayout
  companyIds: number[];
  bankIds: number[];
  productIds: number[];
  dateRange?: { from: Date; to: Date };
  orderBy: 'CREATED_AT' | 'AMOUNT';
  orderDirection: 'ASC' | 'DESC';
  page: number;
  pageSize: number;
}

// Filtros internos de la UI para PayIns
export interface PayinFilters {
  searchTerm: string;
  state: string;           // "all" | StatePayIn
  companyIds: number[];
  typeFilter: string;      // "all" | PayInType
  dateRange?: { from: Date; to: Date };
  orderBy: 'CREATED_AT' | 'AMOUNT';
  orderDirection: 'ASC' | 'DESC';
  page: number;
  pageSize: number;
}

// Opciones del hook
export interface UsePayoutsOptions {
  pageSize?: 15 | 25 | 50;
}

// Opciones del hook para PayIns
export interface UsePayinsOptions {
  pageSize?: 10 | 15 | 25 | 50;
}

// Info de paginación
export interface PaginationInfo {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  hasMore: boolean;
}
