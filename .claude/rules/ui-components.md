---
paths:
  - "src/shared/components/ui/**"
---

# UI Component Conventions (Shadcn Pattern)

Every file in `ui/` follows this exact structure:

## Required Pattern

```tsx
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/shared/lib/utils";

const componentVariants = cva("base-classes", {
  variants: { /* named variants */ },
  defaultVariants: { /* defaults */ },
});

export interface ComponentProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof componentVariants> {
  // additional props
}

const Component = React.forwardRef<HTMLElement, ComponentProps>(
  ({ className, variant, ...props }, ref) => (
    <element className={cn(componentVariants({ variant, className }))} ref={ref} {...props} />
  ),
);
Component.displayName = "Component";

export { Component, componentVariants };
```

## Rules

- **forwardRef** on every component — no exceptions
- **CVA** for all variant logic — never ternaries in className
- **cn()** as the ONLY className merge utility
- **Semantic tokens only** — `bg-card` not `bg-white`, `text-foreground` not `text-black`
- **No hex, rgb, hsl** in any className or style prop
- **Export both** the component and its variants function
- **displayName** must match the component name
- Radius: `rounded-lg` for inputs/buttons, `rounded-xl` for cards/dialogs, `rounded-md` for badges/items
- Transitions: `transition-colors duration-150` — NEVER `transition-all`
