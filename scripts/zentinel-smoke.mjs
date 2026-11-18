#!/usr/bin/env node
/*
 * Zentinel production smoke test.
 *
 * Hits the two public health endpoints of the Zentinel deployment that
 * the frontend will embed at build time and fails loudly if either
 * does not respond as expected. Run this locally before every prod
 * deploy, or from CI after `vite build` to prevent shipping a bundle
 * pinned to a dead backend.
 *
 * Usage:
 *   node scripts/zentinel-smoke.mjs                   # reads .env.production
 *   VITE_ZENTINEL_API_URL=<url> node scripts/zentinel-smoke.mjs
 *
 * Exits non-zero on:
 *   - Missing VITE_ZENTINEL_API_URL
 *   - Network error to /health or /health/info
 *   - Non-200 response
 *   - `soberana_bridge !== true` in /health/info (the AI tools need
 *     the Soberana GraphQL bridge to be wired — see
 *     docs/zentinel_docs/FRONTEND_PRODUCTION_CHECKLIST.md §10).
 *
 * This script is intentionally dependency-free (node:20+, stdlib only)
 * so it can run in minimal CI images without `npm ci`.
 */

import { readFile } from 'node:fs/promises';
import { argv, env, exit } from 'node:process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const repoRoot = resolve(__dirname, '..');

const EXIT = { OK: 0, USAGE: 2, HEALTH_FAIL: 10, BRIDGE_OFF: 11 };

function logHeader(message) {
  console.log(`\n━━━ ${message} ━━━`);
}

async function readEnvFile(path) {
  try {
    const raw = await readFile(path, 'utf8');
    const map = new Map();
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq < 0) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      map.set(key, value);
    }
    return map;
  } catch {
    return new Map();
  }
}

async function resolveApiUrl() {
  if (env.VITE_ZENTINEL_API_URL) return env.VITE_ZENTINEL_API_URL;
  const explicit = argv.find((a) => a.startsWith('--env='));
  const envFile = explicit
    ? resolve(repoRoot, explicit.slice('--env='.length))
    : resolve(repoRoot, '.env.production');
  const map = await readEnvFile(envFile);
  return map.get('VITE_ZENTINEL_API_URL') ?? null;
}

async function hit(url, { expect_bridge = false } = {}) {
  logHeader(`GET ${url}`);
  let res;
  try {
    res = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
  } catch (err) {
    console.error(`Network error: ${err.message ?? err}`);
    exit(EXIT.HEALTH_FAIL);
  }
  if (!res.ok) {
    console.error(`Status ${res.status} ${res.statusText}`);
    exit(EXIT.HEALTH_FAIL);
  }
  const body = await res.json();
  console.log(JSON.stringify(body, null, 2));
  if (expect_bridge) {
    const bridge = body?.features?.soberana_bridge === true;
    if (!bridge) {
      console.error(
        '\n✗ soberana_bridge is NOT true — Zentinel cannot reach the Soberana GraphQL.',
      );
      exit(EXIT.BRIDGE_OFF);
    }
  }
  return body;
}

async function main() {
  const base = await resolveApiUrl();
  if (!base) {
    console.error('Missing VITE_ZENTINEL_API_URL (env var or .env.production).');
    exit(EXIT.USAGE);
  }
  const baseClean = base.replace(/\/+$/, '');
  console.log(`Target: ${baseClean}`);
  await hit(`${baseClean}/health`);
  await hit(`${baseClean}/health/info`, { expect_bridge: true });
  console.log('\n✓ Zentinel smoke OK.');
  exit(EXIT.OK);
}

void main();
