---
name: feature
description: Scaffolds a complete feature module following Soberana architecture. Use when creating a new page or feature from scratch inside suite-user, suite-backoffice, or any module.
argument-hint: feature-name (e.g., beneficiaries, quotes, settlements)
allowed-tools: [Read, Glob, Grep, Edit, Write, Bash]
---

# Feature Scaffolder — Soberana Architecture

You are scaffolding a new feature called **`$ARGUMENTS`** following the exact patterns established in this project.

## Context — Existing Features

!`ls -d src/modules/suite-user/features/*/ 2>/dev/null | head -8`

## Before You Start

1. **Search first** (CLAUDE.md Golden Rule #0): Check if this feature or something similar already exists:
   - `src/shared/components/` — reusable components
   - `src/modules/suite-user/features/` — existing features
   - `src/modules/common/` — cross-module features

2. If it exists, **extend it** instead of creating a new one.

## Scaffold Structure

Generate the following files inside `src/modules/suite-user/features/$ARGUMENTS/`:

```
$ARGUMENTS/
├── pages/
│   └── $ARGUMENTS.tsx          # Main page (default export, lazy-loadable)
├── components/
│   └── (feature-specific components)
├── hooks/
│   └── use$ARGUMENTS.ts        # Data fetching hook (TanStack Query)
├── api/
│   └── $ARGUMENTS.graphql.ts   # GraphQL queries/mutations + types
└── types/
    └── $ARGUMENTS.types.ts     # Feature-specific TypeScript interfaces
```

## File Patterns

### Page (`pages/$ARGUMENTS.tsx`)

```tsx
import { Skeleton } from "@/shared/components/ui/skeleton";
// import feature hook
// import feature components

export default function FeaturePage() {
  const { data, isLoading, error } = useFeatureData();

  if (isLoading) return <FeaturePageSkeleton />;

  return (
    <div className="space-y-6">
      {/* page content using semantic tokens */}
    </div>
  );
}

function FeaturePageSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  );
}
```

### Hook (`hooks/use$ARGUMENTS.ts`)

```tsx
import { useQuery } from "@tanstack/react-query";
import { graphqlClient } from "@/shared/lib/graphql-client";
import { FEATURE_QUERY } from "../api/$ARGUMENTS.graphql";
import type { FeatureResponse } from "../types/$ARGUMENTS.types";

export function useFeatureData() {
  return useQuery<FeatureResponse>({
    queryKey: ["$ARGUMENTS"],
    queryFn: () => graphqlClient.request(FEATURE_QUERY),
  });
}
```

### API (`api/$ARGUMENTS.graphql.ts`)

```tsx
import { gql } from "graphql-request";

export const FEATURE_QUERY = gql`
  query feature_list {
    feature_list {
      id
      // fields from docs/GRAPHQL_INTEGRATION.md
    }
  }
`;
```

### Types (`types/$ARGUMENTS.types.ts`)

```tsx
export interface FeatureItem {
  id: string;
  // typed fields matching GraphQL response (snake_case)
}

export interface FeatureResponse {
  feature_list: FeatureItem[];
}
```

## Route Registration

After scaffolding, add the lazy route to the appropriate routes file:

```tsx
const FeaturePage = lazy(() => import("@/modules/suite-user/features/$ARGUMENTS/pages/$ARGUMENTS"));
```

## Verification Checklist (CLAUDE.md Section 7)

- [ ] All imports use absolute paths (`@/shared/...`, `@/modules/...`)
- [ ] No `any` types — all interfaces explicitly defined
- [ ] Skeleton loading state that mimics final layout
- [ ] Semantic tokens only (no hex/rgb/hsl)
- [ ] Icons from `@/shared/components/animated-icons` barrel
- [ ] UI components from `@/shared/components/ui/` only
- [ ] TanStack Query for data fetching (not useEffect)
- [ ] GraphQL fields use snake_case

## Deliverable

Report:
```
Feature: $ARGUMENTS
Files created: N
- path/to/file.tsx (page)
- path/to/file.ts (hook)
- ...
Route added: /suite/$ARGUMENTS
Compilation: tsc --noEmit result
```
