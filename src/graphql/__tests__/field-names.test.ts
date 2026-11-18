/**
 * GraphQL Field Names Test
 *
 * Validates that GraphQL documents use snake_case field names
 * matching the backend schema convention.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Import documents — these are JSON AST objects from graphql-codegen
// import { SignInDocument } from '@/graphql/mutations/auth/sign-in';
import { SignUpDocument } from '@/graphql/mutations/auth/sign-up';
import { UserRegisterDocument } from '@/graphql/mutations/auth/user-register';
import { AuthMeDocument } from '@/graphql/queries/auth/auth-me';
import { GetKycSnapshotDocument } from '@/graphql/queries/customers/get-kyc-snapshot';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyDoc = any;

/**
 * Extract all field names from a codegen JSON AST DocumentNode's selection sets (recursive).
 * Skips __typename and top-level mutation/query root fields (depth 0).
 */
function extractFieldNames(doc: AnyDoc): string[] {
  const fields: string[] = [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function visitSelections(selections: any[], depth: number) {
    for (const sel of selections) {
      if (sel.kind === 'Field') {
        const name: string = sel.name.value;

        // Skip __typename; depth 0 = the root query/mutation field (e.g. auth_signIn)
        if (name !== '__typename' && depth > 0) {
          fields.push(name);
        }

        if (sel.selectionSet?.selections) {
          visitSelections(sel.selectionSet.selections, depth + 1);
        }
      }
    }
  }

  const definitions = doc?.definitions;
  if (!Array.isArray(definitions)) {
    throw new Error(
      `Document has no definitions array — got ${typeof definitions}. ` +
        'The gql() lookup may have returned {} because the query string changed without updating gql.ts.',
    );
  }

  for (const def of definitions) {
    if (def.kind === 'OperationDefinition' && def.selectionSet?.selections) {
      visitSelections(def.selectionSet.selections, 0);
    }
  }

  return fields;
}

/**
 * Read a source file relative to project root and return its content.
 */
function readSourceFile(relativePath: string): string {
  const fullPath = resolve(__dirname, '../../..', relativePath);
  return readFileSync(fullPath, 'utf-8');
}

/**
 * Known camelCase -> snake_case corrections.
 * If ANY of these camelCase names appear in a document, the test fails.
 */
const FORBIDDEN_CAMEL_CASE_FIELDS = [
  'accessToken',
  'authUid',
  'customerProfileId',
  'kycLink',
  'kycStatus',
  'staffRoles',
  'companyRoles',
  'hasAcceptedLatestTerms',
  'companyUser',
  'companyName',
  'clientId',
];

function assertNoForbiddenCamelCase(
  docName: string,
  doc: AnyDoc,
  expectedForbidden: string[],
) {
  const fields = extractFieldNames(doc);
  const violations = fields.filter((f) => expectedForbidden.includes(f));

  expect(
    violations,
    `${docName} contains camelCase fields that should be snake_case: ${violations.join(', ')}`,
  ).toEqual([]);
}

describe('GraphQL documents use snake_case field names', () => {
  it('SignUpDocument: authUid should be auth_uid', () => {
    assertNoForbiddenCamelCase('SignUpDocument', SignUpDocument, ['authUid']);
  });

  it('UserRegisterDocument: authUid, customerProfileId, kycLink, kycStatus should be snake_case', () => {
    assertNoForbiddenCamelCase('UserRegisterDocument', UserRegisterDocument, [
      'authUid',
      'customerProfileId',
      'kycLink',
      'kycStatus',
    ]);
  });

  it('AuthMeDocument: all auth_me fields should be snake_case', () => {
    assertNoForbiddenCamelCase('AuthMeDocument', AuthMeDocument, [
      'authUid',
      'staffRoles',
      'companyRoles',
      'hasAcceptedLatestTerms',
      'companyUser',
      'customerProfileId',
      'kycStatus',
      'companyName',
      'clientId',
    ]);
  });

  it('no document should contain any known camelCase field', () => {
    const allDocs = [
      { name: 'SignUpDocument', doc: SignUpDocument },
      { name: 'UserRegisterDocument', doc: UserRegisterDocument },
      { name: 'AuthMeDocument', doc: AuthMeDocument },
      { name: 'GetKycSnapshotDocument', doc: GetKycSnapshotDocument },
    ];

    for (const { name, doc } of allDocs) {
      assertNoForbiddenCamelCase(name, doc, FORBIDDEN_CAMEL_CASE_FIELDS);
    }
  });
});

describe('Consumer files use snake_case field names', () => {
  it('auth-store accesses user.staff_roles (not user.staffRoles)', () => {
    const source = readSourceFile('src/shared/stores/auth-store.ts');
    // Must NOT contain user.staffRoles or user.companyUser etc. in executable code
    // (we strip comments/JSDoc lines first)
    const executableLines = source
      .split('\n')
      .filter((line) => !line.trim().startsWith('*') && !line.trim().startsWith('//'))
      .join('\n');

    expect(executableLines).not.toContain('.staffRoles');
    expect(executableLines).toContain('.staff_roles');
  });

  it('use-sign-in does not use accessToken', () => {
    const source = readSourceFile('src/modules/common/auth/api/use-sign-in.ts');
    const executableLines = source
      .split('\n')
      .filter((line) => !line.trim().startsWith('*') && !line.trim().startsWith('//'))
      .join('\n');

    expect(executableLines).not.toMatch(/\baccessToken\b/);
  });

  it('RegistrationData interface uses snake_case fields', () => {
    const source = readSourceFile('src/modules/common/auth/api/use-sign-up.ts');
    // Extract just the RegistrationData interface block
    const interfaceMatch = source.match(
      /export interface RegistrationData \{[\s\S]*?\}/,
    );
    expect(interfaceMatch).not.toBeNull();
    const interfaceBlock = interfaceMatch![0];

    // The rule: backend-mapped fields are snake_case. The interface may
    // evolve (fields added/removed with the contract) — enforce the naming,
    // not a fixed field list.
    const fieldNames = [...interfaceBlock.matchAll(/^\s{2}(\w+)\??:/gm)].map(
      (match) => match[1],
    );
    expect(fieldNames.length).toBeGreaterThan(0);
    expect(fieldNames).toContain('auth_uid');

    const camelCaseFields = fieldNames.filter((name) =>
      /[a-z][A-Z]/.test(name),
    );
    expect(camelCaseFields).toEqual([]);
  });

  it('LoginForm reads user.staff_roles (not user.staffRoles)', () => {
    const source = readSourceFile(
      'src/modules/common/auth/components/login-form.tsx',
    );
    const executableLines = source
      .split('\n')
      .filter((line) => !line.trim().startsWith('*') && !line.trim().startsWith('//'))
      .join('\n');

    expect(executableLines).toContain('staff_roles');
    expect(executableLines).not.toContain('staffRoles');
  });
});
