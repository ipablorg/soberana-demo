---
paths:
  - "src/modules/**/pages/**"
---

# Page Component Conventions

## Required Pattern

```tsx
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/shared/components/ui/skeleton";

export default function FeaturePage() {
  const { data, isLoading, error } = useQuery({ ... });

  if (isLoading) return <FeaturePageSkeleton />;
  if (error) return <ErrorState error={error} />;

  return ( /* page content */ );
}

function FeaturePageSkeleton() {
  return ( /* skeleton that mimics final layout */ );
}
```

## Rules

- **Default export** — pages are lazy-loaded via React.lazy in route definitions
- **TanStack Query** for ALL data fetching — NEVER useEffect + fetch
- **Skeleton loading** — every page must have a Skeleton that mirrors its final layout
- **Error state** — handle query errors with proper UI feedback
- **No direct API calls** — use hooks from the feature's `hooks/` directory
- **Absolute imports** — `@/shared/...`, `@/modules/...` — never relative paths outside the feature
- **No cross-module imports** — suite-user cannot import from suite-backoffice or vice versa
- **Icons** — import from `@/shared/components/animated-icons`, never from `lucide-react`
