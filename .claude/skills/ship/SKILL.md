---
name: ship
description: Creates a conventional commit with auto-detected type and scope, and optionally a PR with auto-generated summary. Use when ready to commit and push changes.
allowed-tools: [Bash, Read, Glob, Grep]
---

# Ship — Smart Commit & PR

You are creating a well-structured commit (and optionally a PR) for the current changes.

## Current State

!`git status --short`

!`git diff --staged --stat 2>/dev/null; echo "---UNSTAGED---"; git diff --stat 2>/dev/null`

!`git log --oneline -5`

!`git branch --show-current`

## Step 1: Analyze Changes

Examine the diff to determine:

### Commit Type
| Type | When |
|------|------|
| `feat` | New feature or capability |
| `fix` | Bug fix |
| `refactor` | Code change that neither fixes nor adds |
| `chore` | Build, deps, config, tooling |
| `docs` | Documentation only |
| `style` | Formatting, whitespace, design tokens |
| `test` | Adding or fixing tests |
| `perf` | Performance improvement |

### Scope
Determine from file paths:
- `src/modules/suite-user/` → `suite-user`
- `src/modules/suite-backoffice/` → `backoffice`
- `src/modules/common/` → `common`
- `src/shared/components/ui/` → `ui`
- `src/shared/components/common/` → `common`
- `src/shared/hooks/` → `hooks`
- `src/shared/stores/` → `stores`
- `src/styles/` → `styles`
- `.claude/` → `claude`
- `docs/` → `docs`
- Multiple modules → most impactful one, or omit scope

### Description
- Max 72 characters
- Imperative mood: "add", "fix", "update", "remove" (not "added", "fixes")
- Lowercase first letter
- No period at end

## Step 2: Stage Files

Stage relevant files. Be careful:
- Do NOT stage `.env`, credentials, or secrets
- Do NOT stage unrelated changes
- If there are unrelated changes, suggest separate commits

## Step 3: Create Commit

Format:
```
type(scope): description

- bullet point for significant change 1
- bullet point for significant change 2

Made-with: Cursor
```

## Step 4: PR Creation (if applicable)

If the branch is not `main` and there are 3+ commits or significant changes, suggest a PR:

```
gh pr create --title "type(scope): description" --body "$(cat <<'EOF'
## Summary
- Key change 1
- Key change 2
- Key change 3

## Changes
| File | Change |
|------|--------|
| path/file.tsx | Description of change |

## Test Plan
- [ ] Verify feature works as expected
- [ ] Check design system compliance
- [ ] Confirm no regressions

Generated with Cursor Agent
EOF
)"
```

**Always ask for confirmation before pushing or creating a PR.**

## Rules

- Follow the project's existing commit style (check recent commits)
- Keep commit messages concise but descriptive
- Group related changes into one commit
- Separate unrelated changes into multiple commits
- Never force push to main
- Never skip pre-commit hooks (no --no-verify)
