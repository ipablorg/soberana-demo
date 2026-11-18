---
name: audit
description: Deep design system audit against CLAUDE.md Sections 3-7. Reports violations with file:line:content format and severity levels. Use for pre-release validation or when reviewing unfamiliar code.
argument-hint: file paths or glob (e.g., "src/modules/suite-user/features/send/**")
context: fork
agent: Explore
allowed-tools: [Read, Glob, Grep]
---

# Design System Audit — Deep Compliance Check

You are auditing files for full compliance with the Soberana Design System defined in `CLAUDE.md` Sections 3-7. This is a **read-only** deep analysis.

## Target Files

If `$ARGUMENTS` is provided, audit those files/paths.
Otherwise, audit recently changed TSX files:

!`git diff --name-only main -- '*.tsx' 2>/dev/null | head -20`

## 8-Step Validation

For EACH file, run ALL steps:

### STEP 1: Colors (CLAUDE.md 3.1)

Search for literal color values that violate the OKLCH-only rule:

| Pattern | What It Catches |
|---------|----------------|
| `#[0-9a-fA-F]{3,8}` | Hex codes |
| `rgb\(` or `rgba\(` | RGB values |
| `hsl\(` or `hsla\(` | HSL values |
| `hsl(var(--` | Wrong color function (tokens are OKLCH) |
| `blue-\d`, `gray-\d`, `red-\d`, `green-\d`, `yellow-\d`, `purple-\d`, `orange-\d`, `pink-\d` | Tailwind default palette |
| `bg-white`, `bg-black`, `text-white`, `text-black` | Literal B&W (use bg-background, text-foreground) |

**Approved exceptions:** `NetworkAnimation.tsx` (Canvas2D), `WorkflowBuilder.tsx` (ReactFlow), `ReceiveFlowModal.tsx` (color picker), `src/styles/index.css` (gradient definitions), `text-white` inside `variant="gradient"` Button.

### STEP 2: Typography (CLAUDE.md 3.2)

| Check | Rule |
|-------|------|
| `<h1>` through `<h6>` | Must include `font-heading` |
| Currency amounts, percentages | Must use `font-mono tabular-nums text-right` |
| Service descriptions | Should use `font-body font-light text-lg` |

### STEP 3: Border Radius (CLAUDE.md 3.3)

| Element | Required | Forbidden |
|---------|----------|-----------|
| Buttons, Inputs, Selects | `rounded-lg` | `rounded-full`, `rounded-xl` |
| Cards, Dialogs, Sheets | `rounded-xl` | `rounded-2xl`, `rounded-3xl` |
| Badges, Dropdown items | `rounded-md` | — |
| Progress, Avatars, Dots | `rounded-full` | — |

### STEP 4: Shadows (CLAUDE.md 3.4)

| Allowed | Context |
|---------|---------|
| `shadow-none` | Default for most elements |
| `shadow-sm` | Subtle elevation |
| `shadow-md` | Popovers and dropdowns only |
| `shadow-lg` | Dialogs only |

**FORBIDDEN:** `shadow-glow`, `shadow-glow-*`, `shadow-soft-glow`, `shadow-gemini`, any custom glow shadow.

### STEP 5: Motion (CLAUDE.md 3.5)

| Pattern | Status |
|---------|--------|
| `transition-all` | FORBIDDEN — use `transition-colors`, `transition-opacity`, `transition-transform` |
| `hover:scale-*` | FORBIDDEN — no scale on hover |
| `type: 'spring'` | FORBIDDEN — use `ease` or `ease-out` |
| `duration-[4-9]\d\d` or higher | FORBIDDEN — max 300ms for UI |
| `transition-colors duration-150` | CORRECT hover pattern |

### STEP 6: Icons (CLAUDE.md 2, 7)

| Check | Rule |
|-------|------|
| `from 'lucide-react'` | FORBIDDEN — use `@/shared/components/animated-icons` |
| `from "lucide-react"` | FORBIDDEN |
| `LucideIcon` in type | Should be `IconComponent` |

### STEP 7: Import Boundaries (CLAUDE.md 2)

| Check | Rule |
|-------|------|
| Relative imports `../../` | Should use absolute `@/shared/...` |
| Cross-module | suite-user cannot import from suite-backoffice |
| Parallel dirs | No imports from `context7/`, `glass/` (deleted) |
| UI source | Components from `ui/` only (not parallel directories) |

### STEP 8: Gradient Quarantine (CLAUDE.md 6)

| Check | Rule |
|-------|------|
| `bg-brand-gradient` in className | FORBIDDEN — must use `variant="gradient"` on `<Button>` |
| `variant="gradient"` on Badge | FORBIDDEN — gradient variant only exists on Button |
| Brand gradient in dashboard/forms/tables | FORBIDDEN — gradient only for CTAs and marketing moments |

## Output Format

```markdown
## Design System Audit Report

**Date:** YYYY-MM-DD
**Files audited:** N
**Scope:** $ARGUMENTS

### Summary Table

| Step | Area | Checks | Violations | Status |
|------|------|--------|------------|--------|
| 1 | Colors | N | N | PASS/FAIL |
| 2 | Typography | N | N | PASS/FAIL |
| 3 | Border Radius | N | N | PASS/FAIL |
| 4 | Shadows | N | N | PASS/FAIL |
| 5 | Motion | N | N | PASS/FAIL |
| 6 | Icons | N | N | PASS/FAIL |
| 7 | Imports | N | N | PASS/FAIL |
| 8 | Gradients | N | N | PASS/FAIL |

### Violations (sorted by severity)

`file.tsx:42: className="bg-white rounded-2xl shadow-glow"` — STEP 1: bg-white (use bg-background) | STEP 3: rounded-2xl (use rounded-xl) | STEP 4: shadow-glow (forbidden)

### Approved Exceptions Found
- `NetworkAnimation.tsx` uses canvas hex colors — APPROVED (Canvas2D has no token support)

### Score: X/Y total checks = X% compliance
### Rating: PASS (>95%) | NEEDS FIXES (80-95%) | FAIL (<80%)
```
