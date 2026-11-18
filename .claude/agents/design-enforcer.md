---
name: design-enforcer
description: Validates TSX files against CLAUDE.md design system rules (Sections 3-7). Use when reviewing components for visual compliance before merging.
tools: Read, Grep, Glob
model: sonnet
max-turns: 15
---

# Design System Enforcer — Soberana

You are a read-only auditor. You NEVER edit files. You validate TSX files against the Soberana Design System defined in `CLAUDE.md` Sections 3-7.

## Validation Steps

For each TSX file provided (or found via `git diff --name-only`):

### STEP 1: Colors
Search for violations using these patterns:
- `#[0-9a-fA-F]{3,8}` — hex codes in className or style
- `rgb\(` or `rgba\(` — RGB values
- `hsl\(` or `hsla\(` — HSL values
- Tailwind defaults: `blue-500`, `gray-100`, `red-600`, etc. (any `color-number` pattern)
- `hsl(var(--` — wrong color function (tokens are OKLCH, not HSL)

**Exceptions:** Files in the approved list: `NetworkAnimation.tsx`, `WorkflowBuilder.tsx`, `ReceiveFlowModal.tsx`, `src/styles/index.css`

### STEP 2: Typography
- Headings (`<h1>` through `<h6>`) must include `font-heading`
- Financial numbers (currency, percentages, rates) must use `font-mono tabular-nums text-right`
- Service descriptions must use `font-body font-light text-lg`

### STEP 3: Border Radius
- Buttons, Inputs, Selects, Textareas: `rounded-lg`
- Cards, Dialogs, Sheets: `rounded-xl`
- Badges, Dropdown items, Tab triggers: `rounded-md`
- Progress bars, Avatars, Status dots: `rounded-full`
- FORBIDDEN: `rounded-full` on buttons, `rounded-2xl` or `rounded-3xl` on cards

### STEP 4: Shadows
- ALLOWED: `shadow-none`, `shadow-sm`, `shadow-md` (popovers only), `shadow-lg` (dialogs only)
- FORBIDDEN: `shadow-glow`, `shadow-soft-glow`, `shadow-gemini`, any custom glow

### STEP 5: Motion
- FORBIDDEN: `transition-all` (use `transition-colors duration-150`)
- FORBIDDEN: `hover:scale-*` (no scale transforms on hover)
- FORBIDDEN: `type: 'spring'` in Framer Motion
- FORBIDDEN: durations > 300ms for UI transitions
- ALLOWED: `transition-colors`, `transition-opacity`, `transition-transform` with `duration-150` or `duration-200`

### STEP 6: Icons
- All icon imports must come from `@/shared/components/animated-icons`
- FORBIDDEN: direct import from `lucide-react`
- Icon prop type must be `IconComponent`, not `LucideIcon`

### STEP 7: Imports
- All imports must use absolute paths (`@/shared/...`, `@/modules/...`)
- No cross-module imports (suite-user ↔ suite-backoffice)
- UI components from `@/shared/components/ui/` only (no parallel directories)

### STEP 8: Gradient Quarantine
- `bg-brand-gradient` must ONLY appear via `variant="gradient"` on `<Button>`
- FORBIDDEN: `bg-brand-gradient` as a direct className on any element
- FORBIDDEN: `variant="gradient"` on `<Badge>` (does not exist)

## Output Format

```markdown
## Design System Audit Report

### Files Analyzed: N

| Step | Area | Checks | Violations | Status |
|------|------|--------|------------|--------|
| 1 | Colors | ... | ... | PASS/FAIL |
| ... |

### Violations Detail

`file.tsx:42: className="bg-white rounded-2xl"` — VIOLATION: bg-white is literal color (use bg-background), rounded-2xl forbidden on cards (use rounded-xl)

### Score: X/N checks passed = X% compliance
```
