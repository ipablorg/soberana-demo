---
name: refactor
description: Safely refactors code with full dependency analysis. Finds all consumers before changing anything, ensures no broken imports, and verifies compilation. Use for renames, extractions, moves, or reorganizations.
argument-hint: target (e.g., "rename useWallets to useWalletList", "extract PaymentForm from send.tsx", "move utils to shared/lib")
allowed-tools: [Read, Glob, Grep, Edit, Write, Bash]
---

# Safe Refactor — Dependency-Aware

You are performing a refactor: **`$ARGUMENTS`**

This operation MUST be safe. Every consumer must be updated. Nothing can break.

## PASO 1 — Analyze Target

Identify the exact entity being refactored:
- What is it? (function, component, hook, type, file, directory)
- Where is it defined?
- What does it export?
- Is it re-exported from an index/barrel file?

## PASO 2 — Find ALL Consumers

Search exhaustively for every file that imports or references the target:

```
# Direct imports
grep -r "from.*target" src/ --include="*.ts" --include="*.tsx"

# Named usage (in case of barrel re-exports)
grep -r "targetName" src/ --include="*.ts" --include="*.tsx"

# Type references
grep -r "TargetType" src/ --include="*.ts" --include="*.tsx"
```

Build a complete consumer table:

| File | Import Line | Usage Type |
|------|-------------|------------|
| path/file.tsx | `import { X } from "..."` | Direct import |
| path/other.tsx | `import { X } from "../index"` | Barrel re-export |

## PASO 3 — Plan Changes

Create a detailed change plan:

| File | Change | Risk |
|------|--------|------|
| source/file.tsx | Rename function X → Y | LOW (definition) |
| consumer/a.tsx | Update import X → Y | LOW (automated) |
| barrel/index.ts | Update re-export | MEDIUM (affects many consumers) |

**Risk levels:**
- LOW: Simple rename/move with clear mapping
- MEDIUM: Changes that affect barrel exports or shared interfaces
- HIGH: Changes to public API contracts or types used across modules

**STOP AND ASK if:**
- More than 15 consumers found (confirm before proceeding)
- Any HIGH risk changes identified
- Cross-module boundary changes needed

## PASO 4 — Execute Changes

Apply changes in this order:
1. **Definition site** — rename/move/extract the target
2. **Barrel files** — update re-exports (index.ts files)
3. **Consumer files** — update all imports and references
4. **Type files** — update any type references
5. **Test files** — update any test imports/references

**Rules:**
- Each file edit must be atomic (complete the change in that file)
- Use `replace_all` for renaming across a file
- Preserve all existing functionality — only change names/locations
- Do NOT "improve" or refactor surrounding code

## PASO 5 — Verify

Run these verification checks:

### 5a. Compilation
```bash
npx tsc --noEmit
```
Must produce zero errors.

### 5b. Old Name Gone
```bash
grep -r "oldName" src/ --include="*.ts" --include="*.tsx"
```
Must produce zero results (the old name should not exist anywhere).

### 5c. Import Integrity
```bash
grep -r "from.*oldPath" src/ --include="*.ts" --include="*.tsx"
```
Must produce zero results.

## Deliverable

```markdown
## Refactor Report: $ARGUMENTS

### Changes Applied
| # | File | Change | Status |
|---|------|--------|--------|
| 1 | src/shared/hooks/useOld.ts | Renamed to useNew.ts | DONE |
| 2 | src/shared/hooks/index.ts | Updated re-export | DONE |
| ... |

### Consumer Updates: N files
### Compilation: PASS/FAIL
### Old Name References: 0 (verified clean)
### Score: N/N changes applied successfully
```
