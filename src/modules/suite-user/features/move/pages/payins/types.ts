/**
 * Tipos para el módulo de Payins por Compañía
 */

/**
 * Direcciones de ordenamiento
 */
export type OrderDirection = 'ASC' | 'DESC';

/**
 * Campos disponibles para ordenar payins
 */
export type PayinOrderBy = 'CREATED_AT' | 'AMOUNT' | 'STATE' | 'TYPE';

/**
 * Estados posibles de un payin
 */
export type PayinState =
  | 'pending'
  | 'accepted'
  | 'rejected'
  | 'processing'
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
 * Filtros para la query de payins por compañía
 */
export interface PayinCompanyFilters {
  productIds?: number[];
  state?: PayinState | 'all';
  searchText?: string;
  createdFrom?: Date;
  createdTo?: Date;
  orderBy?: PayinOrderBy;
  orderDirection?: OrderDirection;
  page?: number;
  pageSize?: number;
}

/**
 * Datos de un payin individual
 */
export interface Payin {
  id: number;
  uid: string;
  type: string;
  Amount: number;
  state: string;
  active: boolean;
  payInGetWay?: string;
  createdAt: string;
  companyName?: string;
  productName?: string;
  currencyCode?: string;
  countryCode?: string;
  sourceOfPaymentName?: string;
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
 * Respuesta de la query de payins
 */
export interface PayinsResponse {
  items: Payin[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasMore: boolean;
}

/**
 * Opciones para el hook usePayinsByCompany
 */
export interface UsePayinsByCompanyOptions {
  companyId: number;
  initialPageSize?: number;
  enabled?: boolean;
}

/**
 * Resultado del hook usePayinsByCompany
 */
export interface UsePayinsByCompanyResult {
  payins: Payin[];
  totalCount: number;
  isLoading: boolean;
  isFetching: boolean;
  error: Error | null;
  pagination: PaginationInfo;
  filters: PayinCompanyFilters;
  setSearch: (searchText: string) => void;
  setStateFilter: (state: PayinState | 'all') => void;
  setProductFilter: (productIds: number[]) => void;
  setDateRange: (from?: Date, to?: Date) => void;
  setOrderBy: (orderBy: PayinOrderBy) => void;
  setOrderDirection: (direction: OrderDirection) => void;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  refetch: () => void;
}

/**
 * Props para el componente PayinsTable
 */
export interface PayinsTableProps {
  payins: Payin[];
  isLoading?: boolean;
  pagination?: PaginationInfo;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  onSort?: (orderBy: PayinOrderBy, direction: OrderDirection) => void;
  currentOrderBy?: PayinOrderBy;
  currentOrderDirection?: OrderDirection;
}
