/**
 * Post-codegen patch: keep the safe gql() runtime fallback.
 *
 * The client-preset regenerates `export function gql(source) { return
 * (documents as any)[source] ?? {}; }` — the silent `{}` that serializes as
 * "[object Object]" on the wire (and briefly a throw that crashed the whole
 * app at module load). This script restores the safe version after every
 * codegen run: registry miss → parse the document at runtime + console.error.
 *
 * The guard test (src/graphql/__tests__/gql-registry.test.ts) fails if this
 * patch is ever missing, so the two enforce each other.
 */
import { readFileSync, writeFileSync } from 'node:fs';

const GQL_PATH = new URL('../src/graphql/generated/gql.ts', import.meta.url);

const SAFE_FALLBACK = `export function gql(source: string) {
  const document = (documents as any)[source];
  if (document) {
    return document;
  }

  // Registry miss (document excluded from codegen, or stale registry). Never
  // return \`{}\` — it serializes as "[object Object]" on the wire — and never
  // throw: some excluded documents are used at module load and a throw kills
  // the whole render tree. Parse the source instead: the operation runs
  // correctly when the backend resolver exists and fails through the normal
  // GraphQL error path when it does not.
  console.error(
    \`[graphql] codegen registry miss — parsing at runtime: \${source.slice(0, 80)}\`,
  );
  return parse(source);
}`;

let source = readFileSync(GQL_PATH, 'utf8');

if (source.includes('codegen registry miss')) {
  console.log('[patch-gql-runtime] safe fallback already present — nothing to do.');
  process.exit(0);
}

const regenerated =
  /export function gql\(source: string\) \{[\s\S]*?\n\}/.exec(source);

if (!regenerated) {
  console.error(
    '[patch-gql-runtime] could not find the generated gql() function — update this script after a codegen preset upgrade.',
  );
  process.exit(1);
}

source = source.replace(regenerated[0], SAFE_FALLBACK);

if (!source.includes("import { parse } from 'graphql';")) {
  source = source.replace(
    "import * as types from './graphql';",
    "import * as types from './graphql';\nimport { parse } from 'graphql';",
  );
}

writeFileSync(GQL_PATH, source, 'utf8');
console.log('[patch-gql-runtime] safe gql() fallback restored.');
