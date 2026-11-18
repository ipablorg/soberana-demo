/**
 * GraphQL Queries - Root Barrel Export
 *
 * Centralized export for all GraphQL queries organized by backend modules.
 * admin-loopay queries are NOT re-exported here — they are imported directly
 * by the backoffice module to keep the customer bundle free of backoffice code.
 */

export * as authQueries from './auth';
export * as managementQueries from './management';
export * as paymentQueries from './payment';
export * as collectionQueries from './collection';
export * as soberanaQueries from './soberana';