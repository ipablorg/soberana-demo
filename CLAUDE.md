# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.


## Project

**Suite Loopay** (Soberana by Loopay) — Fintech SPA for crypto ↔ fiat cross-border payments. React 18 + TypeScript strict, Vite 5, Tailwind v4 (CSS-first), Framer Motion, TanStack Query v5, React Hook Form + Zod, Zustand, Lingui i18n, Radix UI (shadcn pattern). Package manager: **npm**.

## Commands

```bash
npm run dev              # codegen:safe + i18n:compile + vite (port 8080)
npm run build            # i18n:compile + vite build
npm run build:dev        # build with --mode development (sourcemaps on)
npm run preview          # serve built dist
npm run type-check       # tsc --noEmit (strict mode)
npm run lint             # eslint . --max-warnings 0  (CI gate)
npm run lint:fix
npm run test             # vitest
npm run test:ui          # vitest --ui
npm run test:coverage
npx vitest run path/to/file.test.ts   # single test file

# GraphQL types from backend schema at http://localhost:3000/graphql
npm run codegen          # fails if backend down
npm run codegen:safe     # falls back to existing generated types (used by dev)
npm run codegen:watch

# i18n (Lingui — locales: en, es, pt, fr, de, it, ja; source: en)
npm run i18n             # extract + compile
npm run i18n:extract
npm run i18n:compile
npm run i18n:verify      # scripts/verify-i18n.sh

npm run zentinel:smoke   # scripts/zentinel-smoke.mjs — Zentinel client smoke test
npm run firebase:mfa-reset  # scripts/reset-firebase-mfa.mjs — clear a user's Firebase MFA enrollment
```

Node `>=18`, npm `>=9`. Dev server proxies `/api/vaults-live` → `http://internal-backend.example:8080`.

Prettier (`.prettierrc`) runs via editor/IDE — there is no `format` npm script. ESLint is the CI gate.

### Env files

Vite picks `.env.{mode}` based on the `--mode` flag (default `development` for `dev`, `production` for `build`). Files present: `.env`, `.env.local`, `.env.development`, `.env.demo`, `.env.production`. `build:dev` forces development mode against a production build (sourcemaps on). `.env.production.example` documents the full prod variable set.

### Deployment

Container image is built via root `Dockerfile`; the runtime image serves the SPA with `nginx.frontend.conf` (`*.template` for envsubst). `deploy.sh` is the prod deploy entry point (used by CI / operators — read it before invoking manually).

## Path Aliases (tsconfig + vite.config.ts — keep in sync)

```
@/*              src/*
@app/*           src/app/*
@modules/*       src/modules/*
@shared/*        src/shared/*
@assets/*        src/assets/*
@styles/*        src/styles/*
@suite-user/*    src/modules/suite-user/*
@suite-backoffice/*  src/modules/suite-backoffice/*
@common/*        src/modules/common/*
```

Use absolute imports only (no `../../..`).

## Workspaces

This is an npm monorepo (`"workspaces": ["packages/*"]`). The main SPA lives at the repo root (`src/`); one published workspace exists:

- **`packages/elements-react`** → `@soberana/elements-react` — embeddable payment widgets consumed by external sites. Has its own `tsconfig.json` and bundles with **tsup** (not Vite) to `dist/`. Build/watch from inside the package: `cd packages/elements-react && npm run build` (or `npm run dev`). The root scripts do **not** build it and root CI does **not** run its tests/lint — treat it as an independent publishable package. Keep it decoupled from the SPA's `src/` — it must not import from `@/`, `@shared/`, `@modules/`, or `@app/`.

## Architecture

```
src/
├── app/        providers (App/Theme/Zentinel), routes (lazy-loaded route groups)
├── modules/    feature modules — see Module Boundaries below
├── shared/     reusable components/, hooks/, stores/, lib/, layouts/, i18n/, providers/
├── graphql/    queries/, mutations/, generated/ (codegen output — do not edit)
├── styles/     index.css — SINGLE source of truth for design tokens (OKLCH)
└── data/       static JSON playbooks
```

### Module Boundaries (enforced by ESLint `import/no-restricted-paths`)

Layers are **unidirectional**: `shared → modules → app`.
- `shared/` MUST NOT import from `modules/` or `app/`
- `modules/` MUST NOT import from `app/`
- `suite-user` ↔ `suite-backoffice` cannot cross-import — shared code goes in `src/shared/`
- Sibling features under `suite-user/features/*` cannot import from each other (a handful of exceptions are whitelisted in `.eslintrc.json` — check there before adding new cross-feature imports)

**Top-level modules** (`src/modules/`): `common` (landing + public/auth pages), `suite-user` (authenticated client app), `suite-backoffice` (admin), plus standalone surfaces `amazonas`, `documentation`, `elements-gtm`, `investor-deck`, `loopay-links`, `marketplace`, `sales-helper`, `soberana-elements`, `soberana-os`, `soberana-platform`, `soberana-vaults`, `workflow-composer`.

**`suite-user/features/*`** (the cross-import boundary applies between these): `account`, `ai-builder`, `analytics`, `automations`, `beneficiaries`, `bridge-kyc` (legacy name; the KYC wizard, KYC itself is now manual review), `card-pro`, `change`, `comex`, `compliance`, `connectors`, `dashboard`, `loopayx`, `management`, `marketplace`, `move`, `policy`, `receive`, `send`, `settings`, `sovy`, `transactions`.

### Routes (`src/app/routes/index.tsx`)

Top-level route groups, each lazy-loaded:
- `/*` → `CommonRoutes` (landing `/`, `/login`, `/register`, `/forgot-password`)
- `/suite/*` → authenticated client app (`SuiteUserRoutes`, protected via `protected-route.tsx` + `useKYC`)
- `/backoffice/*` → admin (`SuiteBackofficeRoutes`); `/backoffice/commercial/*` (clients, new, :clientId) is the commercial section for `OPS_COMMERCIAL` (`modules/suite-backoffice/features/commercial`, GraphQL in `src/graphql/{queries,mutations}/admin-commercial.ts`)
- `/docs/*`, `/links/*`, `/globalconnectors/*`, `/elements/*`, `/workflow/*`, `/os`, `/platform`, `/slides`, `/elements_gtm`, `/ventas`, `/amazonas`
- `/pay/:id` → public payment link page

When adding a route, use `lazy()` + `Suspense` with `LoadingFallback`.

### State

- **Server state:** TanStack Query v5 via `useGraphQLQuery` (`src/shared/hooks/use-graphql-query.ts`) and `useGraphQLMutation` (`src/shared/hooks/use-graphql-mutation.ts`). Query client is a singleton at `src/shared/lib/query-client.ts`.
- **Client state:** Zustand stores in `src/shared/stores/` (auth, branding, language, mobile, mode, country, suite, tutorial-demo, …). Each store is a single file with a `use*Store` hook.
- **Forms:** React Hook Form + Zod resolvers.

### Auth

- Token: Firebase JWT obtained from `auth_signIn` mutation, stored via `auth-store`. `initializeAuth()` runs on mount in `AppProvider`; `AuthInitializer` fetches `auth_me` whenever a token exists and clears auth on error.
- KYC is a **manual review** by `OPS_KYC` staff in the backoffice; the back calls no external KYC provider. `useKYC` (`src/shared/hooks/useKYC.ts` — note: legacy camelCase filename, exempted from the kebab-case rule) owns status/polling; `useBridgeKYC` is a back-compat shim that re-exports it. KYC UX is the non-blocking `KYCBanner` at `src/modules/suite-user/features/dashboard/components/KYCBanner.tsx`.
- Errors: always map with `mapError()` from `@/shared/lib/error-mapper.ts` — never surface `error.message` directly.

### `/docs` reference

Treat `docs/` as the authoritative knowledge base for feature contracts and design rules. Key files:
- `docs/GRAPHQL_INTEGRATION.md` — schema, operations, field-name conventions (single source of truth)
- `docs/README.md` — index of all docs; `docs/history/` holds archived, non-current material

### GraphQL

- Endpoint: `POST /graphql`. Schema/operations docs: **`docs/GRAPHQL_INTEGRATION.md`** (single source of truth — read before adding/renaming an operation).
- **Field names are `snake_case`** (`access_token`, `customer_profile_id`, `kyc_status`). Country codes are ISO2 internally; convert to ISO3 via `ISO2_TO_ISO3` before calling `signUp`.
- `npm run codegen` generates types into `src/graphql/generated/` from the back's committed schema `apps/suite-loopay-back/src/schema.gql` (set `CODEGEN_SCHEMA=http://localhost:3000/graphql` to introspect a running back instead). `codegen.ts` excludes operations whose resolvers are not yet implemented (globalconnectors, bridge, ai, collection, management, payment, some auth + soberana — see the file). `codegen:safe` (used by `dev`) falls back to the last generated output when backend is offline.
- A `field-names.test.ts` guards snake_case conventions across `src/graphql/`.

### Design System (full rules in `src/styles/index.css` and per-area docs)

- Colors: semantic tokens only (`bg-background`, `text-foreground`, `text-muted-foreground`, …) — **no hex/rgb/hsl in TSX**. Color space is **OKLCH**; reference tokens as `var(--token)` or via `color-mix()`, never `hsl(var(--token))`.
- Radii: buttons `rounded-lg`, cards `rounded-xl`, badges `rounded-md`. Dark mode is primary (`defaultTheme="dark"` in `AppProvider`).
- Motion: 150–200 ms, `ease` / `ease-out`. No `type: 'spring'`, no `hover:scale-*`, no `transition-all`. **Use `framer-motion`** for all new feature/app code — it's the canonical animation library (~292 callsites and the only one chunked in `vendor-animation`). Note: the `motion` package is **not** unused — the ~66 generated icons in `src/shared/components/animated-icons/` import `motion`/`Variants` from `motion/react`. Leave those as-is; just don't reach for `motion` in new feature code.
- Brand gradient: apply via `<Button variant="gradient">` only, never as a raw className. SVG defs for `url(#loopay-gradient)` are injected once in `AppProvider` (`LoopayGradientDefs`).
- Financial numbers: `font-mono tabular-nums text-right`.
- Backoffice detail sidebar: build right-sidebar detail boxes with `DetailCard`, `DetailItem`, `DetailGrid`, `DetailCode`, `DetailIconValue` from `src/modules/suite-backoffice/components/RightSidebarDetailCard.tsx` (semantic tokens only, e.g. `bg-card/50 backdrop-blur-sm border-border/30`; use `text-foreground`, not `text-white`; tinted backgrounds need a dark variant such as `bg-blue-100 dark:bg-blue-500/20`).
- Icons: import from `src/shared/components/animated-icons/`, never from `lucide-react` directly.

### Naming & Files (enforced by `eslint-plugin-check-file`)

- All `.ts`/`.tsx` files: **kebab-case**.
- All folders under `src/` (except `__tests__`): **kebab-case**.
- Test files inside `__tests__/` mirror the **export name** of the unit under test (e.g. `useKYC.test.ts` for the `useKYC` hook) — they aren't required to be kebab-case.

### Code Patterns (path-scoped rules in `.claude/rules/*.md` — auto-loaded by Cursor, not by Claude Code)

These are enforced by convention, not lint — follow them when touching matching paths:
- **`src/shared/components/ui/**`** — shadcn primitive shape: `cva()` for all variants (no ternaries in `className`), `forwardRef` on every component, `cn()` as the only class-merge util, `displayName` set, export both the component and its `*Variants`.
- **`src/modules/**/pages/**`** — pages are `default export` (lazy-loaded in routes). Every page handles `isLoading` with a Skeleton that mirrors the final layout and renders an error state for query failures. No data fetching in pages directly — call the feature's `hooks/`.
- **`src/shared/hooks/**`** — server state is **always** TanStack Query via the `useGraphQLQuery`/`useGraphQLMutation` wrappers; **never** `useEffect` + `useState` + `fetch`/axios. Explicit `queryKey` arrays. Auth hooks map errors with `mapError()`.

### i18n

Lingui macro (`@lingui/macro`). All user-facing text uses `<Trans>` or `t\`...\`` — no hardcoded strings. Catalogs live in `src/shared/i18n/locales/{locale}/messages.po`. Two providers wrap the app (`LinguiProvider` + legacy `OldI18nProvider`) during the in-flight migration — wrap new code with the Lingui macros.


### Testing

Vitest. Tests live alongside source in `__tests__/` folders. **The default test environment is `node`, not `jsdom`** (`vitest.config.ts`) — most tests are pure logic (field-name guards, error mappers, payload builders). A component/DOM test that touches the DOM **must** opt in with a docblock at the very top of the file:

```ts
// @vitest-environment jsdom
```

The `verify-identity` test suites are the model. To run JSX render tests you also get a `@lingui/react/macro` → `src/test/lingui-react-macro-mock.tsx` alias, so `<Trans>`/`t` render as plain strings — no i18n setup needed in component tests. Notable tests:
- `src/graphql/__tests__/field-names.test.ts` — snake_case guard
- `src/app/routes/__tests__/protected-route-kyc.test.ts` — KYC gating
- `src/shared/hooks/__tests__/useKYC.test.ts`
- `src/shared/lib/__tests__/{error-mapper,zentinel-client}.test.ts`

## Things that bite

- ESLint `import/no-restricted-paths` will fail CI on cross-module imports — promote shared code to `src/shared/` instead of relaxing the rule.
- `npm run lint` runs with `--max-warnings 0`. Fix warnings, don't silence them.
- Codegen reads the in-repo back schema (`apps/suite-loopay-back/src/schema.gql`) by default, so no running backend is needed; when the back's GraphQL surface changes, regenerate (`npm run codegen`) and commit the generated output with it.
- TS strict flags include `noUnusedLocals` and `noUnusedParameters` — don't suppress with `@ts-ignore`; fix the type.
- Firebase is split into its own vendor chunk (`vendor-firebase`) in `vite.config.ts` to keep the dashboard light — don't add eager top-level Firebase imports outside the integration entry points.
- **Lockfiles:** npm is the source of truth (`package-lock.json`). The stale `pnpm-lock.yaml` was removed when the app moved into the SOBERANA monorepo; do **not** run `pnpm install` here or recreate it. If you touch dependencies, update only `package-lock.json` via `npm install`.
- **Vite React plugin:** `vite.config.ts` uses `@vitejs/plugin-react` (Babel) because the Lingui macro requires `@lingui/babel-plugin-lingui-macro`. The repo also installs `@vitejs/plugin-react-swc` — it is **not** wired in; do not switch to it without a migration plan for the Lingui macro.
- **Loopay X Firebase config is build-time inlined.** The 6 `VITE_LOOPAYX_FIREBASE_*` vars are read by `src/shared/lib/loopayx/firebase-client.ts` via `import.meta.env` and inlined by Vite at build time. They are required for prod login — if missing, the bundle ships with an empty config and every login attempt throws "Loopay X Firebase config missing." (See `0356adb` for the original fix and the follow-up where `deploy.sh` was hardened to inject them inline.) Two failure modes to avoid: (a) deploying from a checkout where `.env.production` is absent — `.env.production` is tracked in git **but is in `.dockerignore`**, so any container-based build path must inject the vars another way (build args / shell env); (b) modifying `deploy.sh` to drop the explicit `VITE_LOOPAYX_FIREBASE_*` inline assignments — keep them even if `.env.production` is also present (belt-and-suspenders, and `deploy.sh` now `grep`s the bundle for the project ID and aborts the deploy if it is missing).
