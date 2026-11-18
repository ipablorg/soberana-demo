---
paths:
  - "src/shared/hooks/**"
---

# Hook Conventions

## Naming

- Always prefix with `use`: `useWallets`, `useCanTransact`, `useKYC`
- Server state hooks: `use<Resource>` or `use<Resource>Query` / `use<Resource>Mutation`
- Client state hooks: `use<Store>Store` (Zustand)

## Server State (TanStack Query)

```tsx
import { useQuery, useMutation } from "@tanstack/react-query";
import { graphqlClient } from "@/shared/lib/graphql-client";

export function useWallets() {
  return useQuery({
    queryKey: ["wallets"],
    queryFn: () => graphqlClient.request(WALLETS_QUERY),
  });
}
```

- ALWAYS use TanStack Query for server state — NEVER useEffect + useState for fetching
- Return the full TanStack Query result (data, isLoading, error, refetch)
- Use explicit queryKey arrays for proper cache invalidation
- GraphQL field names: snake_case (backend convention)

## Client State (Zustand)

```tsx
import { create } from "zustand";

interface StoreState { /* typed state */ }

export const useExampleStore = create<StoreState>((set) => ({
  // state + actions
}));
```

## Rules

- **Typed return** — always define the return type or let TypeScript infer from TanStack Query
- **No `any`** — use explicit interfaces for all data shapes
- **Error mapping** — auth hooks must use `mapError()` from `@/shared/lib/error-mapper.ts`
- **No direct fetch/axios** — use `graphqlClient` for GraphQL, TanStack Query for caching
