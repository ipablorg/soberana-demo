/**
 * Payout State Management Types
 *
 * Defines state transitions, labels, and validation logic for payout states
 */

// Backend enum values (removed from codegen output)
type StatePayout = 'received' | 'onHold' | 'scheduled' | 'cancelled' | 'rejected' | 'delivered';

/**
 * Transiciones válidas de estado según reglas de negocio del backend
 */
export const PAYOUT_STATE_TRANSITIONS: Record<StatePayout, StatePayout[]> = {
  received: ['delivered', 'onHold', 'rejected'],
  onHold: ['delivered', 'rejected'],
  scheduled: ['delivered', 'onHold', 'rejected'],
  cancelled: [],
  rejected: ['onHold'],
  delivered: ['onHold'],
};

/**
 * Labels en español para cada estado
 */
export const PAYOUT_STATE_LABELS: Record<StatePayout, string> = {
  received: 'Recibido',
  scheduled: 'Programado',
  onHold: 'En Espera',
  delivered: 'Dispersado',
  rejected: 'Rechazado',
  cancelled: 'Cancelado',
};

/**
 * Descripciones de acciones para cada estado (verbos)
 */
export const PAYOUT_STATE_ACTION_LABELS: Record<StatePayout, string> = {
  received: 'Recibir',
  scheduled: 'Programar',
  onHold: 'Poner en espera',
  delivered: 'Dispersar',
  rejected: 'Rechazar',
  cancelled: 'Cancelar',
};

/**
 * Obtiene los estados disponibles para transición desde un estado dado
 */
export function getAvailablePayoutStates(currentState: StatePayout): StatePayout[] {
  return PAYOUT_STATE_TRANSITIONS[currentState] || [];
}

/**
 * Valida si una transición de estado es válida
 */
export function isValidPayoutTransition(from: StatePayout, to: StatePayout): boolean {
  return PAYOUT_STATE_TRANSITIONS[from]?.includes(to) ?? false;
}

/**
 * Obtiene estados comunes disponibles para múltiples payouts
 */
export function getCommonAvailableStates(states: StatePayout[]): StatePayout[] {
  if (states.length === 0) return [];

  const firstStates = getAvailablePayoutStates(states[0]);

  return firstStates.filter(state =>
    states.every(currentState =>
      getAvailablePayoutStates(currentState).includes(state)
    )
  );
}
