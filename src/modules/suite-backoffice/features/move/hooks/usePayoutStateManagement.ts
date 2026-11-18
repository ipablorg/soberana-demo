/**
 * usePayoutStateManagement Hook
 *
 * Custom hook for managing payout state transitions with batch support
 */

import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useGraphQLMutation } from '@/shared/hooks/use-graphql-mutation';
import { UpdatePayoutsStateDocument } from '@/graphql/mutations/payment';
import { useCountryStore } from '@/shared/stores/useCountryStore';
import { mapError } from '@/shared/lib/error-mapper';
import { toast } from 'sonner';
import type { StatePayout } from '@/graphql/generated/graphql';
import type { PayOut } from '../types';
import {
  getAvailablePayoutStates,
  getCommonAvailableStates,
  isValidPayoutTransition,
  PAYOUT_STATE_LABELS,
} from '../types/payout-state';

interface StateChangeModal {
  open: boolean;
  targetState: StatePayout | null;
  payoutsToUpdate: PayOut[];
}

interface UsePayoutStateManagementProps {
  onSuccess?: () => void;
}

export function usePayoutStateManagement({ onSuccess }: UsePayoutStateManagementProps = {}) {
  const queryClient = useQueryClient();
  const countryId = useCountryStore((state) => state.getSelectedCountryId());

  const [stateChangeModal, setStateChangeModal] = useState<StateChangeModal>({
    open: false,
    targetState: null,
    payoutsToUpdate: [],
  });

  // Mutation
  const { mutate, isPending } = useGraphQLMutation(
    UpdatePayoutsStateDocument,
    {
      onSuccess: (data) => {
        const { success, updatedCount, failedIds, message } = data.payout_updateManyStates;

        if (success && failedIds.length === 0) {
          // Éxito total
          toast.success(`${updatedCount} payout(s) actualizados`);
        } else if (updatedCount > 0 && failedIds.length > 0) {
          // Éxito parcial
          toast.warning(
            `${updatedCount} actualizados. ${failedIds.length} fallaron.`,
            { description: message || 'Algunos payouts no pudieron ser actualizados' }
          );
        } else {
          // Fallo total
          toast.error('No se pudo actualizar ningún payout', {
            description: message || 'Verifica los permisos y el estado de los payouts'
          });
        }

        // Invalidar cache de payouts
        queryClient.invalidateQueries({ queryKey: ['payouts', 'list', countryId] });

        // Callback personalizado
        onSuccess?.();

        // Cerrar modal
        closeModal();
      },
      onError: (error) => {
        toast.error('No pudimos actualizar los estados', {
          description: mapError(error).message
        });
      },
    }
  );

  /**
   * Inicia el flujo de cambio de estado
   */
  const initiateStateChange = useCallback((targetState: StatePayout, payouts: PayOut[]) => {
    if (payouts.length === 0) {
      toast.error('Selecciona al menos un payout');
      return;
    }

    // Validar que todos los payouts puedan hacer la transición
    const invalidPayouts = payouts.filter(
      payout => !isValidPayoutTransition(payout.state as StatePayout, targetState)
    );

    if (invalidPayouts.length > 0) {
      toast.error(
        `${invalidPayouts.length} payout(s) no pueden cambiar a ${PAYOUT_STATE_LABELS[targetState]}`,
        { description: 'Verifica el estado actual de los payouts seleccionados' }
      );
      return;
    }

    // Validar límite de 1000 payouts
    if (payouts.length > 1000) {
      toast.error('Solo puedes actualizar hasta 1000 payouts a la vez');
      return;
    }

    // Abrir modal de confirmación
    setStateChangeModal({
      open: true,
      targetState,
      payoutsToUpdate: payouts,
    });
  }, []);

  /**
   * Confirma y ejecuta el cambio de estado
   */
  const confirmStateChange = useCallback((_reason?: string) => {
    const { targetState, payoutsToUpdate } = stateChangeModal;

    if (!targetState || payoutsToUpdate.length === 0) return;

    // Ejecutar mutation
    mutate({
      input: {
        payoutIds: payoutsToUpdate.map(p => p.id),
        state: targetState,
      },
    });

    // Nota: El reason no se usa en el backend actual, pero se podría agregar
    // para auditoría en el futuro
  }, [stateChangeModal, mutate]);

  /**
   * Cierra el modal
   */
  const closeModal = useCallback(() => {
    setStateChangeModal({
      open: false,
      targetState: null,
      payoutsToUpdate: [],
    });
  }, []);

  /**
   * Obtiene estados disponibles para un payout individual
   */
  const getAvailableStatesForPayout = useCallback((payout: PayOut): StatePayout[] => {
    return getAvailablePayoutStates(payout.state as StatePayout);
  }, []);

  /**
   * Obtiene estados disponibles comunes para múltiples payouts
   */
  const getCommonAvailableStatesForPayouts = useCallback((payouts: PayOut[]): StatePayout[] => {
    if (payouts.length === 0) return [];
    return getCommonAvailableStates(payouts.map(p => p.state as StatePayout));
  }, []);

  return {
    // State
    stateChangeModal,
    isUpdating: isPending,

    // Actions
    initiateStateChange,
    confirmStateChange,
    closeModal,

    // Helpers
    getAvailableStatesForPayout,
    getCommonAvailableStatesForPayouts,
  };
}
