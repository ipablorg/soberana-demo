/**
 * Tipos para el módulo de Payouts por Compañía
 */

/**
 * Direcciones de ordenamiento
 */
export type OrderDirection = 'ASC' | 'DESC';

/**
 * Campos disponibles para ordenar payouts
 */
export type PayoutOrderBy = 'CREATED_AT' | 'AMOUNT' | 'BENEFICIARY_NAME' | 'STATE';

/**
 * Estados posibles de un payout
 */
export type PayoutState =
  | 'pending'
  | 'onHold'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled';

/**
 * Rango de fechas para filtros
 */
export interface DateRange {
  from: Date;
  to: Date;
}

/**
 * Filtros para la query de payouts por compañía
 */
export interface PayoutCompanyFilters {
  bankBaseIds?: number[];
  productIds?: number[];
  state?: PayoutState | 'all';
  searchText?: string;
  createdFrom?: Date;
  createdTo?: Date;
  orderBy?: PayoutOrderBy;
  orderDirection?: OrderDirection;
  page?: number;
  pageSize?: number;
}

/**
 * Datos de un payout individual
 */
export interface Payout {
  id: number;
  uid: string;
  state: string;
  Amount: number;
  createdAt: string;
  beneficiaryName: string;
  documentNumber?: string;
  email?: string;
  phone?: string;
  externalIdentifier?: string;
  gateway?: string;
  fixedFee?: number;
  percentageFee?: number;
  companyName?: string;
  bankName?: string;
  productName?: string;
  currencyCode?: string;
  countryCode?: string;
}

/**
 * Información de paginación
 */
export interface PaginationInfo {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  hasMore: boolean;
}

/**
 * Respuesta de la query de payouts
 */
export interface PayoutsResponse {
  payouts: Payout[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasMore: boolean;
}

/**
 * Opciones para el hook usePayoutsByCompany
 */
export interface UsePayoutsByCompanyOptions {
  companyId: number;
  initialPageSize?: number;
  enabled?: boolean;
}

/**
 * Resultado del hook usePayoutsByCompany
 */
export interface UsePayoutsByCompanyResult {
  payouts: Payout[];
  totalCount: number;
  isLoading: boolean;
  isFetching: boolean;
  error: Error | null;
  pagination: PaginationInfo;
  filters: PayoutCompanyFilters;
  setSearch: (searchText: string) => void;
  setStateFilter: (state: PayoutState | 'all') => void;
  setBankFilter: (bankIds: number[]) => void;
  setProductFilter: (productIds: number[]) => void;
  setDateRange: (from?: Date, to?: Date) => void;
  setOrderBy: (orderBy: PayoutOrderBy) => void;
  setOrderDirection: (direction: OrderDirection) => void;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  refetch: () => void;
}

/**
 * Props para el componente PayoutsTable
 */
export interface PayoutsTableProps {
  payouts: Payout[];
  isLoading?: boolean;
  pagination?: PaginationInfo;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  onSort?: (orderBy: PayoutOrderBy, direction: OrderDirection) => void;
  currentOrderBy?: PayoutOrderBy;
  currentOrderDirection?: OrderDirection;
}
