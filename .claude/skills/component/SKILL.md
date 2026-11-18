---
name: component
description: Creates a new UI component following the Soberana Design System. Ensures CVA variants, forwardRef, cn() pattern, semantic tokens, and full CLAUDE.md compliance. Checks for existing components before creating.
argument-hint: ComponentName (e.g., TransactionCard, WalletSelector, AmountInput)
skills: [soberana-ux]
allowed-tools: [Read, Glob, Grep, Edit, Write]
---

# Component Builder — Soberana Design System

You are creating a component called **`$ARGUMENTS`** following the exact Soberana pattern.

## STEP 0 — Golden Rule: Search First

Before creating ANYTHING, verify the component doesn't already exist:

!`find src/shared/components -name "*.tsx" -type f 2>/dev/null | sort`

Search for similar names:
- Exact match in `ui/` or `common/`
- Similar concept (e.g., if building "WalletCard", check if "Card" already handles it with variants)

**If it exists:** Extend the existing component with a new CVA variant. Do NOT create a parallel component.

## STEP 1 — Determine Location

| Component Type | Location | Example |
|---------------|----------|---------|
| Primitive (reusable across all modules) | `src/shared/components/ui/` | button, card, badge, input |
| Composed layout (uses multiple ui/ primitives) | `src/shared/components/common/` | AppSidebar, DataTable |
| Feature-specific (only used in one module) | `src/modules/<module>/components/` | SendConfirmation |

## STEP 2 — Reference Template

Read the canonical pattern from `src/shared/components/ui/button.tsx`:

!`cat src/shared/components/ui/button.tsx`

## STEP 3 — Generate Component

```tsx
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/shared/lib/utils";

const $ARGUMENTSVariants = cva(
  // Base classes — semantic tokens ONLY
  "base-classes-here",
  {
    variants: {
      variant: {
        default: "semantic-token-classes",
        // additional variants as needed
      },
      size: {
        default: "h-N px-N",
        sm: "h-N px-N text-xs",
        lg: "h-N px-N text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface $ARGUMENTSProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof $ARGUMENTSVariants> {
  // Component-specific props with explicit types (NEVER `any`)
}

const $ARGUMENTS = React.forwardRef<HTMLDivElement, $ARGUMENTSProps>(
  ({ className, variant, size, ...props }, ref) => (
    <div
      className={cn($ARGUMENTSVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  ),
);
$ARGUMENTS.displayName = "$ARGUMENTS";

export { $ARGUMENTS, $ARGUMENTSVariants };
```

## STEP 4 — Design System Compliance (CLAUDE.md Sections 3-7)

### Colors
- ONLY semantic tokens: `bg-card`, `text-foreground`, `text-muted-foreground`, `border-border`
- Status: `text-success`, `text-warning`, `text-destructive` with `bg-success/10` etc.
- NEVER: hex, rgb, hsl, Tailwind defaults (blue-500, gray-100)

### Radius
- If this is a button/input: `rounded-lg`
- If this is a card/dialog: `rounded-xl`
- If this is a badge/item: `rounded-md`
- If this is a progress/avatar: `rounded-full`

### Shadows
- Cards: `shadow-none` or `shadow-sm` only
- Popovers/dropdowns: `shadow-md`
- Dialogs: `shadow-lg`
- FORBIDDEN: shadow-glow, shadow-gemini, shadow-soft-glow

### Transitions
- Use: `transition-colors duration-150` for hover states
- NEVER: `transition-all`, `hover:scale-*`, spring animations

### Financial Data
If the component displays money, percentages, or numeric data:
```tsx
<span className="font-mono tabular-nums text-right">
  {formatCurrency(amount)}
</span>
```

### Icons
- Import from `@/shared/components/animated-icons`
- Prop type: `IconComponent` (not `LucideIcon`)

## Verification Checklist

- [ ] Component doesn't duplicate existing ui/ or common/ component
- [ ] Uses CVA for variants (not className ternaries)
- [ ] Uses forwardRef
- [ ] Uses cn() for className merging
- [ ] Semantic tokens only (no hex/rgb/hsl)
- [ ] Correct border-radius for component type
- [ ] No forbidden shadows
- [ ] transition-colors duration-150 (not transition-all)
- [ ] No `any` types
- [ ] displayName set
- [ ] Both component and variants exported

## Deliverable

```
Component: $ARGUMENTS
Location: src/shared/components/{ui|common}/$ARGUMENTS.tsx
Variants: [list of variants]
Props: [list of custom props with types]
Checklist: 11/11 passed
```
