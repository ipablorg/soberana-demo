/**
 * GraphQL Mutations - Root Barrel Export
 *
 * Centralized export for all GraphQL mutations organized by backend modules.
 * admin-loopay mutations are NOT re-exported here — they are imported directly
 * by the backoffice module to keep the customer bundle free of backoffice code.
 */

export * as authMutations from './auth';
export * as managementMutations from './management';
export * as paymentMutations from './payment';
export * as aiMutations from './ai';
export * as soberanaMutations from './soberana';
