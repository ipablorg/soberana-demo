/**
 * Hook: useLiquidationRoutes
 * 
 * Manages liquidation routes (payment routes) for Bridge API
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/shared/stores/auth-store';
import {
  getLiquidationRoutes,
  getExternalAccounts,
  createLiquidationRoute,
  deleteLiquidationRoute,
} from '../api/liquidation-routes.api';
import type {
  CreateLiquidationRouteRequest,
  VaultWallet,
} from '../types/liquidation-routes.types';
import { toast } from 'sonner';
import { useBridgeVirtualAccounts } from '../pages/payins/hooks/useBridgeVirtualAccounts';

export function useLiquidationRoutes() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);

  // Get Bridge virtual accounts (same pattern as PayinFlow)
  const { virtualAccounts, isLoading: isLoadingVirtualAccounts } = useBridgeVirtualAccounts();
  
  // Extract Bridge customer ID from virtual accounts (same as PayinFlow)
  const bridgeCustomerId = virtualAccounts[0]?.customerId || null;

  const vaultWallets: VaultWallet[] = (user as any)?.company_user?.[0]?.company?.vault?.Wallet || [];

  // Query: Get liquidation routes
  const {
    data: routes = [],
    isLoading: isLoadingRoutes,
    error: routesError,
    refetch: refetchRoutes,
  } = useQuery({
    queryKey: ['liquidation-routes', bridgeCustomerId],
    queryFn: () => getLiquidationRoutes(bridgeCustomerId!),
    enabled: !!bridgeCustomerId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Query: Get external accounts
  const {
    data: externalAccounts = [],
    isLoading: isLoadingAccounts,
    error: accountsError,
  } = useQuery({
    queryKey: ['external-accounts', bridgeCustomerId],
    queryFn: () => getExternalAccounts(bridgeCustomerId!),
    enabled: !!bridgeCustomerId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Mutation: Create liquidation route
  const createRouteMutation = useMutation({
    mutationFn: (request: CreateLiquidationRouteRequest) => {
      if (!bridgeCustomerId) {
        throw new Error('Bridge customer ID not found');
      }
      return createLiquidationRoute(bridgeCustomerId, request);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['liquidation-routes', bridgeCustomerId] });
      toast.success('Ruta de liquidación creada');
    },
    onError: (error: Error) => {
      toast.error(`No pudimos crear la ruta: ${error.message}`);
    },
  });

  // Mutation: Delete liquidation route
  const deleteRouteMutation = useMutation({
    mutationFn: (routeId: string) => {
      if (!bridgeCustomerId) {
        throw new Error('Bridge customer ID not found');
      }
      return deleteLiquidationRoute(bridgeCustomerId, routeId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['liquidation-routes', bridgeCustomerId] });
      toast.success('Ruta eliminada');
    },
    onError: (error: Error) => {
      toast.error(`No pudimos eliminar la ruta: ${error.message}`);
    },
  });

  return {
    // Data
    routes,
    externalAccounts,
    vaultWallets,
    bridgeCustomerId,

    // Loading states
    isLoadingRoutes,
    isLoadingAccounts,
    isLoading: isLoadingRoutes || isLoadingAccounts || isLoadingVirtualAccounts,

    // Errors
    routesError,
    accountsError,
    error: routesError || accountsError,

    // Actions
    createRoute: createRouteMutation.mutate,
    deleteRoute: deleteRouteMutation.mutate,
    refetchRoutes,

    // Mutation states
    isCreating: createRouteMutation.isPending,
    isDeleting: deleteRouteMutation.isPending,
  };
}

