---
name: graphql
description: Connects a mocked feature to the real GraphQL API. Use when replacing mock/hardcoded data with live backend calls. References docs/GRAPHQL_INTEGRATION.md as the single source of truth for operations, field names, and types.
argument-hint: operation or feature (e.g., wallets_list, transaction_create, beneficiaries)
allowed-tools: [Read, Glob, Grep, Edit, Write]
---

# GraphQL Integrator — Mock → Real API

You are connecting the feature **`$ARGUMENTS`** to the real GraphQL backend. The source of truth for all operations is `docs/GRAPHQL_INTEGRATION.md`.

## Context — Current Mock Files

!`grep -rl "mock\|Mock\|MOCK\|hardcoded\|placeholder\|fake\|dummy" src/modules/suite-user/ --include="*.ts" --include="*.tsx" -l 2>/dev/null | head -15`

## Process

### PASO 1 — Find the Spec

Read `docs/GRAPHQL_INTEGRATION.md` and locate the operation(s) for `$ARGUMENTS`. Extract:
- Operation name (e.g., `wallets_listByCustomer`)
- Query or Mutation type
- Input type definition (field names, types, required/optional)
- Response type definition
- Auth requirements (Firebase token, etc.)
- Sandbox notes

### PASO 2 — Create/Update API File

Create or update `api/$ARGUMENTS.graphql.ts`:

```tsx
import { gql } from "graphql-request";

// Operation name MUST match docs/GRAPHQL_INTEGRATION.md exactly
export const OPERATION_NAME_QUERY = gql`
  query operation_name($input: InputType!) {
    operation_name(input: $input) {
      field_one        // snake_case per backend convention
      field_two
      nested_object {
        sub_field
      }
    }
  }
`;

// TypeScript types matching the GraphQL response
export interface OperationResponse {
  operation_name: {
    field_one: string;
    field_two: number;
    nested_object: {
      sub_field: string;
    };
  };
}

export interface OperationInput {
  field_one: string;
  field_two?: number;  // optional fields marked with ?
}
```

### PASO 3 — Create/Update Hook

Create or update the TanStack Query hook:

```tsx
import { useQuery } from "@tanstack/react-query";  // or useMutation
import { graphqlClient } from "@/shared/lib/graphql-client";
import { OPERATION_QUERY, type OperationResponse, type OperationInput } from "../api/$ARGUMENTS.graphql";

export function useOperation(input: OperationInput) {
  return useQuery<OperationResponse>({
    queryKey: ["$ARGUMENTS", input],
    queryFn: () => graphqlClient.request(OPERATION_QUERY, { input }),
  });
}
```

For mutations:
```tsx
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useCreateOperation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: OperationInput) =>
      graphqlClient.request(OPERATION_MUTATION, { input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["$ARGUMENTS"] });
    },
    onError: (error) => {
      // For auth mutations: use mapError(error) from @/shared/lib/error-mapper.ts
    },
  });
}
```

### PASO 4 — Replace Mock Data in Components

For each component consuming mock data:
1. Find the mock: `const mockData = [...]` or `useState(hardcodedValue)`
2. Replace with hook: `const { data, isLoading } = useOperation(...)`
3. Add loading state: `if (isLoading) return <Skeleton />`
4. Remove mock imports and files

### PASO 5 — Verify

1. **Type check:** `npx tsc --noEmit` — zero errors
2. **Mock removal:** `grep -r "mock\|Mock\|MOCK" <feature-files>` — zero results in connected files
3. **Snake case:** All GraphQL field names use snake_case
4. **Operation names:** Match docs/GRAPHQL_INTEGRATION.md exactly

## Key Rules

- **Field names are snake_case** — the backend uses snake_case. Do NOT convert to camelCase in queries.
- **Operation names must match spec** — `wallets_listByCustomer`, not `WalletsListByCustomer`
- **Auth errors use mapError()** — import from `@/shared/lib/error-mapper.ts`, NEVER use raw `error.message`
- **No `any` types** — every field must be explicitly typed

## Deliverable

```markdown
## GraphQL Integration: $ARGUMENTS

### Operations Connected
| Operation | Type | File |
|-----------|------|------|
| operation_name | Query | api/file.graphql.ts |

### Mock Data Removed
| File | Lines Removed | Replaced With |
|------|---------------|---------------|
| component.tsx | 15-30 | useOperation() hook |

### Verification
- tsc --noEmit: PASS/FAIL
- Mock grep: N results (should be 0)
- Score: N/N operations connected
```
