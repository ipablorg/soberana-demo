---
name: qa
description: Runs comprehensive QA on changed files. Validates types, imports, design tokens, motion, accessibility, and i18n coverage. Use after implementing a feature, fixing a bug, or before committing.
argument-hint: scope (e.g., "suite-user/features/send", or leave empty for recent changes)
context: fork
agent: Explore
allowed-tools: [Read, Glob, Grep]
---

# QA Runner — Soberana Quality Gate

Run a comprehensive quality check on recently changed files. This is a **read-only** analysis — no files are modified.

## Target Files

!`git diff --name-only HEAD~3 -- '*.tsx' '*.ts' 2>/dev/null | head -25`

If `$ARGUMENTS` is provided, scope to that path instead.

## 8 Validation Checks

For EACH target file, run all 8 checks:

### CHECK 1: TypeScript Safety
- [ ] No `: any` type annotations
- [ ] No `as any` type assertions
- [ ] Interfaces/types are exported where consumed externally
- [ ] No `@ts-ignore` or `@ts-expect-error` without explanation

**Search pattern:** `any`, `@ts-ignore`, `@ts-expect-error`

### CHECK 2: Import Discipline
- [ ] All imports use absolute paths (`@/shared/`, `@/modules/`)
- [ ] No cross-module imports (suite-user ↔ suite-backoffice)
- [ ] UI components from `@/shared/components/ui/` only
- [ ] Icons from `@/shared/components/animated-icons` only (never `lucide-react`)
- [ ] No imports from deleted directories (`context7/`, `glass/`)

**Search pattern:** `from '../../`, `from "../../`, `from 'lucide-react'`, `from "lucide-react"`, `context7/`, `glass/`

### CHECK 3: Color Tokens
- [ ] No hex codes (`#xxx`, `#xxxxxx`)
- [ ] No `rgb(`, `rgba(`, `hsl(`, `hsla(`
- [ ] No Tailwind defaults (`blue-500`, `gray-100`, `red-600`, etc.)
- [ ] No `hsl(var(--` (tokens are OKLCH)
- [ ] Only semantic tokens: `bg-background`, `text-foreground`, `border-border`, etc.

**Search pattern:** `#[0-9a-fA-F]`, `rgb(`, `hsl(`, `blue-`, `gray-`, `red-`, `green-`, `yellow-`, `purple-`

**Exceptions:** Files in approved list (NetworkAnimation.tsx, WorkflowBuilder.tsx, ReceiveFlowModal.tsx, index.css)

### CHECK 4: Border Radius
- [ ] Buttons/inputs: `rounded-lg`
- [ ] Cards/dialogs: `rounded-xl`
- [ ] Badges/items: `rounded-md`
- [ ] `rounded-full` only on progress bars, avatars, status dots (NOT buttons)
- [ ] No `rounded-2xl` or `rounded-3xl`

### CHECK 5: Motion & Transitions
- [ ] No `transition-all` (use `transition-colors`, `transition-opacity`, or `transition-transform`)
- [ ] No `hover:scale-*`
- [ ] No `type: 'spring'` in Framer Motion
- [ ] No durations > 300ms for UI transitions
- [ ] Hover states use `duration-150`

**Search pattern:** `transition-all`, `hover:scale`, `spring`, `duration-[4-9]00`, `duration-1000`

### CHECK 6: Shadows
- [ ] No `shadow-glow`, `shadow-soft-glow`, `shadow-gemini`
- [ ] `shadow-md` only on popovers/dropdowns
- [ ] `shadow-lg` only on dialogs

### CHECK 7: Accessibility
- [ ] Images have `alt` attribute
- [ ] Interactive elements have `aria-label` or visible label
- [ ] Form inputs have associated labels
- [ ] Color is not the only indicator (icons or text accompany status colors)

### CHECK 8: i18n Coverage
- [ ] No hardcoded user-facing strings in JSX (`>English text<`)
- [ ] Strings wrapped in `<Trans>` or `t()` from `@lingui/react/macro`
- [ ] Exceptions: product names (Soberana, Zentinel, Loopay), URLs, technical identifiers

**Search pattern:** `>` followed by alphabetic text that isn't a component

## Output Format

```markdown
## QA Report

### Scope: [files analyzed]
### Date: [current date]

| File | C1:Types | C2:Imports | C3:Colors | C4:Radius | C5:Motion | C6:Shadows | C7:A11y | C8:i18n |
|------|----------|------------|-----------|-----------|-----------|------------|---------|---------|
| file1.tsx | PASS | PASS | FAIL | PASS | PASS | PASS | WARN | PASS |
| file2.tsx | PASS | FAIL | PASS | PASS | PASS | PASS | PASS | FAIL |

### Violations

**file1.tsx:42** — C3:Colors — `className="text-gray-500"` should be `text-muted-foreground`
**file2.tsx:15** — C2:Imports — `from '../../shared/lib'` should use absolute `@/shared/lib`

### Score: X/Y checks passed across N files = X% compliance

### Rating
- 95-100%: SHIP IT
- 85-94%: NEEDS MINOR FIXES
- 70-84%: NEEDS WORK
- <70%: BLOCKED — fix critical issues before proceeding
```
