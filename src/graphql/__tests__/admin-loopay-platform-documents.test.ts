/**
 * admin-loopay platform config document contract.
 *
 * Hand-written documents for the PLATFORM_ADMIN section: this proves they parse
 * into one operation and use the argument and input type names the backend
 * resolvers declare.
 */

import { print } from 'graphql';
import { describe, expect, it } from 'vitest';

import {
  GetClientDocument,
  ListClientProviderRailsDocument,
  ListPaymentRailsDocument,
  ListProviderPaymentRailsDocument,
  ListProvidersDocument,
  PlatformReadinessDocument,
} from '@/graphql/queries/admin-loopay';
import {
  CreateClientProviderRailDocument,
  CreatePaymentRailDocument,
  CreateProviderDocument,
  CreateProviderPaymentRailDocument,
  CutoverDeactivateDeadProviderCatalogDocument,
  CutoverDeactivateDeadProvidersDocument,
  CutoverFlagLegacyTransactionsDocument,
  UpdateClientDocument,
  UpdateClientProviderRailDocument,
  UpdatePaymentRailDocument,
  UpdateProviderDocument,
  UpdateProviderPaymentRailDocument,
} from '@/graphql/mutations/admin-loopay';

const DOCUMENTS_BY_ROOT_FIELD = {
  adminLoopay_platformReadiness: PlatformReadinessDocument,
  adminLoopay_listProviders: ListProvidersDocument,
  adminLoopay_listPaymentRails: ListPaymentRailsDocument,
  adminLoopay_listProviderPaymentRails: ListProviderPaymentRailsDocument,
  adminLoopay_listClientProviderRails: ListClientProviderRailsDocument,
  adminLoopay_getClient: GetClientDocument,
  adminLoopay_createProvider: CreateProviderDocument,
  adminLoopay_updateProvider: UpdateProviderDocument,
  adminLoopay_createPaymentRail: CreatePaymentRailDocument,
  adminLoopay_updatePaymentRail: UpdatePaymentRailDocument,
  adminLoopay_createProviderPaymentRail: CreateProviderPaymentRailDocument,
  adminLoopay_updateProviderPaymentRail: UpdateProviderPaymentRailDocument,
  adminLoopay_createClientProviderRail: CreateClientProviderRailDocument,
  adminLoopay_updateClientProviderRail: UpdateClientProviderRailDocument,
  adminLoopay_updateClient: UpdateClientDocument,
  adminLoopay_cutoverDeactivateDeadProviders: CutoverDeactivateDeadProvidersDocument,
  adminLoopay_cutoverDeactivateDeadProviderCatalog:
    CutoverDeactivateDeadProviderCatalogDocument,
  adminLoopay_cutoverFlagLegacyTransactions: CutoverFlagLegacyTransactionsDocument,
} as const;

describe('admin-loopay platform config documents', () => {
  it.each(Object.entries(DOCUMENTS_BY_ROOT_FIELD))(
    'parses %s into a single executable operation',
    (rootField, document) => {
      const definitions = (document as unknown as { definitions: unknown[] })
        .definitions;

      expect(definitions).toHaveLength(1);
      expect(print(document)).toContain(rootField);
    },
  );

  it('asks the readiness matrix for every column of the backend entity', () => {
    const printed = print(PlatformReadinessDocument);

    for (const field of [
      'client_id',
      'client_name',
      'wallet_defaults_set',
      'active_providers',
      'active_junction_count',
      'missing_pairings',
      'dead_provider_junctions_active',
      'status',
      'issues',
    ]) {
      expect(printed).toContain(field);
    }
  });

  it('declares the cutover inputs with the backend input type names', () => {
    expect(print(CutoverDeactivateDeadProvidersDocument)).toContain(
      '$input: AdminCutoverDeactivateDeadProvidersInput!',
    );
    expect(print(CutoverDeactivateDeadProviderCatalogDocument)).toContain(
      '$reason: String!',
    );
    expect(print(CutoverFlagLegacyTransactionsDocument)).toContain(
      '$input: AdminCutoverFlagLegacyTransactionsInput!',
    );
  });

  it('filters client provider rails through the where argument', () => {
    const printed = print(ListClientProviderRailsDocument);

    expect(printed).toContain('$where: ClientProviderRailFiltersInput');
    expect(printed).toContain('default_attributes');
  });
});
