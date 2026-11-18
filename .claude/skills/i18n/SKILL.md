---
name: i18n
description: Verifies internationalization coverage. Finds hardcoded user-facing strings that are missing Trans or t() wrappers from Lingui. Use before release or after adding new UI text.
argument-hint: scope (e.g., "suite-user", file path, or leave empty for changed files)
context: fork
agent: Explore
allowed-tools: [Read, Glob, Grep]
---

# i18n Coverage Checker — Lingui

You are auditing internationalization coverage for Soberana. The project uses **Lingui** (`@lingui/macro`, `@lingui/react`) with 7 locales.

## Target Files

!`git diff --name-only HEAD~3 -- '*.tsx' 2>/dev/null | head -20`

If `$ARGUMENTS` is provided, scope to that path instead.

## What to Check

### 1. Hardcoded Strings in JSX

Search for text content directly in JSX that should be wrapped:

```tsx
// VIOLATION — hardcoded user-facing string
<p>No transactions found</p>
<Button>Continue</Button>
<span>Loading...</span>
placeholder="Enter amount"
title="Transaction details"

// CORRECT — wrapped with Lingui
<p><Trans>No transactions found</Trans></p>
<Button><Trans>Continue</Trans></Button>
<span>{t`Loading...`}</span>
placeholder={t`Enter amount`}
title={t`Transaction details`}
```

### 2. Valid Exceptions (Do NOT Flag)

These are intentionally NOT translated:
- **Product names:** Soberana, Zentinel, Loopay, Smart Treasury, Vaults, Cross-border, On/Off Ramp
- **Technical identifiers:** API keys, URLs, email addresses, GraphQL operation names
- **Code values:** Status enums, currency codes (USD, COP, EUR), country codes
- **Component props that aren't user-facing:** className, key, id, data-testid
- **Console.log messages** — not shown to users
- **Empty strings** and single characters

### 3. Import Verification

For files that use `t()` or `<Trans>`:
- Verify `t` is imported from `@lingui/react/macro` (NOT `@lingui/macro` — project uses react macro)
- Verify `Trans` is imported from `@lingui/react/macro`
- Verify `useLingui` is imported if using `i18n` object directly

### 4. Attribute Coverage

Check these attributes for hardcoded strings:
- `placeholder="..."` — should be `placeholder={t`...`}`
- `title="..."` — should be `title={t`...`}`
- `aria-label="..."` — should be `aria-label={t`...`}`
- `alt="..."` — should be `alt={t`...`}`

## Output Format

```markdown
## i18n Coverage Report

**Scope:** $ARGUMENTS
**Files analyzed:** N

### Summary
| Status | Count |
|--------|-------|
| Wrapped (correct) | N |
| Missing wrapper | N |
| Valid exception | N |

### Missing Wrappers

| File | Line | String | Context | Fix |
|------|------|--------|---------|-----|
| send.tsx | 42 | "Send money" | Button label | `<Trans>Send money</Trans>` |
| dashboard.tsx | 15 | "No data" | Empty state text | `{t`No data`}` |

### Import Issues
| File | Issue |
|------|-------|
| file.tsx | Uses `t` but import is from `@lingui/macro` (should be `@lingui/react/macro`) |

### Coverage: N/(N+M) strings wrapped = X%
```
