import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/shared/lib/utils";

/**
 * Card variants.
 *
 * - `default` — canonical Soberana card: `border-border` + `bg-card`.
 *   Identical to the pre-CVA implementation; existing consumers see
 *   no visual change.
 * - `gradient-thin` — paints the 1px Loopay gradient rim around the
 *   card via `gradient-border-thin-always` (mask-trick utility from
 *   `index.css`). The utility is **standalone**: it ships its own
 *   `::before` with `inset:-1px` and the mask composite that carves
 *   the ring. We deliberately do NOT pair it with `gradient-border`
 *   — that companion sets `opacity: 0` on `::before` (it's meant for
 *   `gradient-border-show-hover` / `gradient-border-always`) and
 *   would render the ring invisible. The base of the variant drops
 *   `bg-card` so the utility's own `background: var(--color-background)`
 *   wins, keeping the rim visible against the dock backdrop.
 */
const cardVariants = cva(
  "rounded-xl text-card-foreground transition-colors duration-150",
  {
    variants: {
      variant: {
        default: "border border-border bg-card",
        "gradient-thin": "gradient-border-thin-always",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, ...props }, ref) => (
    <div ref={ref} className={cn(cardVariants({ variant }), className)} {...props} />
  ),
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
  ),
);
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn("text-2xl font-semibold leading-none tracking-tight", className)} {...props} />
  ),
);
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
  ),
);
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />,
);
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
  ),
);
CardFooter.displayName = "CardFooter";

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  cardVariants,
};
