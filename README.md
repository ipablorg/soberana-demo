# SOBERANA by Loopay — Demo

**Live demo:** https://ipablorg.github.io/soberana-demo/

SOBERANA is the cross-border payments front end of the Loopay suite: a single-page application that lets a user onboard, KYC, and then move value both ways between crypto and fiat — funding accounts from chains, holding balances, and settling off-ramp to bank accounts across currencies. This repository is the public, portfolio-facing build of that app running entirely on mocked data.

## Tech stack

React 18 + TypeScript strict, Vite, Tailwind v4, TanStack Query, Zustand, Lingui (7 locales), Radix UI primitives under a shadcn-style component pattern, Framer Motion.

## What's mocked

The demo build (`VITE_DEMO_MODE=true`) never touches a backend:

- Auth — session, login, MFA flows resolved from in-memory fixtures
- KYC status — pre-populated verification snapshot
- Beneficiaries and transactions — fixture data served from mock adapters
- GraphQL — operations run against local fixtures instead of the API

No network calls are made from the demo; `src/shared/lib/dev-config.ts` gates every backend integration behind `import.meta.env.VITE_DEMO_MODE`.

## Run it locally

```bash
npm install
VITE_DEMO_MODE=true npx vite build --mode demo
npm run preview
```

Or for development: `npm run dev` — mock mode is enabled by default there.

## Deployment

GitHub Pages via [.github/workflows/deploy.yml](.github/workflows/deploy.yml): on push to `main`, CI installs, compiles the Lingui catalogs, builds with `--base /soberana-demo/`, and deploys `dist/` (with a `404.html` SPA fallback).
