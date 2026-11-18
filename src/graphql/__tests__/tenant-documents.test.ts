/**
 * tenant document contract
 *
 * The tenant backoffice documents are hand-written. This test proves that each
 * one parses into a single operation, selects only `tenant_*` root fields that
 * exist in the back's committed schema (`apps/suite-loopay-back/src/schema.gql`,
 * the same file codegen reads) and validates against that schema (arguments,
 * variable types, selections).
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import {
  buildSchema,
  Kind,
  validate,
  type DocumentNode,
  type OperationDefinitionNode,
} from 'graphql';
import { describe, expect, it } from 'vitest';

import * as tenantQueries from '@/graphql/queries/tenant';
import * as tenantMutations from '@/graphql/mutations/tenant';

const schema = buildSchema(
  readFileSync(resolve(process.cwd(), '../suite-loopay-back/src/schema.gql'), 'utf8')
);

function isDocument(value: unknown): value is DocumentNode {
  return (
    typeof value === 'object' &&
    value !== null &&
    (value as { kind?: unknown }).kind === Kind.DOCUMENT
  );
}

const documents = [...Object.entries(tenantQueries), ...Object.entries(tenantMutations)].filter(
  (entry): entry is [string, DocumentNode] => isDocument(entry[1])
);

/** Phase B root fields the tenant screens call (`tenant_railsByCountry` is not used by any screen). */
const PHASE_B_OPERATIONS = [
  'tenant_listBeneficiaries',
  'tenant_getBeneficiary',
  'tenant_createBeneficiary',
  'tenant_updateBeneficiary',
  'tenant_deleteBeneficiary',
  'tenant_deactivateBeneficiary',
  'tenant_reactivateBeneficiary',
  'tenant_quoteRate',
  'tenant_createQuote',
  'tenant_getQuote',
  'tenant_listRails',
  'tenant_railCatalogue',
  'tenant_requestVirtualAccount',
  'tenant_virtualAccountReceiveOptions',
  'tenant_listWebhooks',
  'tenant_createWebhook',
  'tenant_updateWebhook',
  'tenant_deleteWebhook',
  'tenant_testWebhook',
  'tenant_webhookEventTypes',
  'tenant_webhookLogs',
  'tenant_webhookLog',
] as const;

function operationOf(document: DocumentNode): OperationDefinitionNode {
  const [definition] = document.definitions;

  return definition as OperationDefinitionNode;
}

function rootFields(document: DocumentNode): string[] {
  return operationOf(document).selectionSet.selections.flatMap((selection) =>
    selection.kind === Kind.FIELD ? [selection.name.value] : []
  );
}

describe('tenant GraphQL documents', () => {
  it('exports every tenant operation the backoffice uses', () => {
    expect(documents.length).toBeGreaterThanOrEqual(26);
  });

  it('covers the phase B operations (beneficiaries, quotes, rails, virtual accounts, webhooks)', () => {
    const selected = new Set(documents.flatMap(([, document]) => rootFields(document)));

    for (const field of PHASE_B_OPERATIONS) {
      expect(selected).toContain(field);
    }
  });

  it.each(documents)('%s is one operation over tenant_* root fields', (_name, document) => {
    expect(document.definitions).toHaveLength(1);
    expect(operationOf(document).kind).toBe(Kind.OPERATION_DEFINITION);

    const fields = rootFields(document);
    expect(fields.length).toBeGreaterThan(0);
    for (const field of fields) {
      expect(field.startsWith('tenant_')).toBe(true);
    }
  });

  it.each(documents)('%s names operations present in the back schema', (_name, document) => {
    const operation = operationOf(document);
    const rootType =
      operation.operation === 'mutation' ? schema.getMutationType() : schema.getQueryType();
    const available = rootType?.getFields() ?? {};

    for (const field of rootFields(document)) {
      expect(Object.keys(available)).toContain(field);
    }
  });

  it.each(documents)('%s validates against the back schema', (_name, document) => {
    expect(validate(schema, document).map((error) => error.message)).toEqual([]);
  });
});
