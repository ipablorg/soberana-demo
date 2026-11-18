#!/usr/bin/env node
/*
 * Enable Firebase TOTP MFA at the project level.
 *
 * Default behavior is safe by design:
 * - dry-run unless `--apply` is provided
 * - preserves existing MFA provider configs and only upserts the TOTP provider
 *
 * Usage:
 *   node scripts/enable-firebase-totp.mjs
 *   node scripts/enable-firebase-totp.mjs --apply
 *   node scripts/enable-firebase-totp.mjs --adjacent-intervals 3 --apply
 *   node scripts/enable-firebase-totp.mjs --project-id loopay-v2 --service-account ./service-account.json --apply
 *
 * Credentials:
 *   - Preferred: `GOOGLE_APPLICATION_CREDENTIALS=/abs/path/service-account.json`
 *   - Or pass `--service-account ./service-account.json`
 */

import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { argv, env, exit } from 'node:process';
import { applicationDefault, cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

const EXIT = {
  OK: 0,
  USAGE: 2,
  NOOP: 3,
  FAIL: 10,
};

function usage() {
  console.log(`
Enable Firebase TOTP MFA for the current project.

Usage:
  node scripts/enable-firebase-totp.mjs [--apply]

Options:
  --project-id <projectId>        Explicit Firebase project id
  --adjacent-intervals <number>   Allowed TOTP adjacent intervals (default: 5)
  --apply                         Apply the change (default is dry-run)
  --service-account <path>        Explicit service account JSON path
  --help                          Show this help

Notes:
  - Dry-run is the default.
  - This script preserves existing MFA provider configs and upserts TOTP only.
  - Credentials can also come from GOOGLE_APPLICATION_CREDENTIALS.
  - When using gcloud user credentials, Firebase Admin needs an explicit project id.
`);
}

function hasFlag(name) {
  return argv.includes(name);
}

function readOption(name) {
  const exact = argv.find((arg) => arg.startsWith(`${name}=`));
  if (exact) return exact.slice(name.length + 1);
  const index = argv.indexOf(name);
  if (index >= 0 && index + 1 < argv.length) return argv[index + 1];
  return null;
}

async function tryReadProjectIdFromEnvFile(path) {
  try {
    const raw = await readFile(resolve(path), 'utf8');
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const match = trimmed.match(/^VITE_LOOPAYX_FIREBASE_PROJECT_ID\s*=\s*(.+)$/);
      if (!match) continue;
      const value = match[1].trim().replace(/^['"]|['"]$/g, '');
      return value || null;
    }
  } catch {
    return null;
  }

  return null;
}

async function resolveProjectId(projectIdArg, serviceAccountPath) {
  if (projectIdArg) return projectIdArg;
  if (env.FIREBASE_PROJECT_ID) return env.FIREBASE_PROJECT_ID;
  if (env.GOOGLE_CLOUD_PROJECT) return env.GOOGLE_CLOUD_PROJECT;
  if (env.GCLOUD_PROJECT) return env.GCLOUD_PROJECT;
  if (env.VITE_LOOPAYX_FIREBASE_PROJECT_ID) return env.VITE_LOOPAYX_FIREBASE_PROJECT_ID;

  if (serviceAccountPath) {
    try {
      const raw = await readFile(resolve(serviceAccountPath), 'utf8');
      const serviceAccount = JSON.parse(raw);
      if (typeof serviceAccount.project_id === 'string' && serviceAccount.project_id) {
        return serviceAccount.project_id;
      }
    } catch {
      // Leave final validation to initAdmin/use-site error handling.
    }
  }

  for (const candidate of ['.env.local', '.env.production', '.env']) {
    const value = await tryReadProjectIdFromEnvFile(candidate);
    if (value) return value;
  }

  return null;
}

async function initAdmin(serviceAccountPath, projectId) {
  if (getApps().length > 0) return getApps()[0];

  if (serviceAccountPath) {
    const raw = await readFile(resolve(serviceAccountPath), 'utf8');
    const serviceAccount = JSON.parse(raw);
    return initializeApp({
      credential: cert(serviceAccount),
      projectId: projectId ?? serviceAccount.project_id,
    });
  }

  return initializeApp({
    credential: applicationDefault(),
    projectId: projectId ?? undefined,
  });
}

function parseAdjacentIntervals(value) {
  if (value == null) return 5;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 0 || parsed > 10) {
    throw new Error('--adjacent-intervals must be an integer between 0 and 10.');
  }

  return parsed;
}

function buildTotpProviderConfig(adjacentIntervals) {
  return {
    state: 'ENABLED',
    totpProviderConfig: {
      adjacentIntervals,
    },
  };
}

function upsertTotpProviderConfig(providerConfigs, adjacentIntervals) {
  const configs = Array.isArray(providerConfigs) ? [...providerConfigs] : [];
  const totpIndex = configs.findIndex((config) => config?.totpProviderConfig);
  const nextTotpConfig = buildTotpProviderConfig(adjacentIntervals);

  if (totpIndex >= 0) {
    configs[totpIndex] = {
      ...configs[totpIndex],
      ...nextTotpConfig,
    };
    return configs;
  }

  return [...configs, nextTotpConfig];
}

function summarizeProjectConfig(config) {
  return {
    multiFactorConfig: config?.multiFactorConfig
      ? {
          state: config.multiFactorConfig.state ?? null,
          providerConfigs: config.multiFactorConfig.providerConfigs ?? [],
        }
      : null,
  };
}

async function main() {
  if (hasFlag('--help')) {
    usage();
    exit(EXIT.OK);
  }

  const projectIdArg = readOption('--project-id');
  const serviceAccountPath = readOption('--service-account');
  const apply = hasFlag('--apply');

  let adjacentIntervals;
  try {
    adjacentIntervals = parseAdjacentIntervals(readOption('--adjacent-intervals'));
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    usage();
    exit(EXIT.USAGE);
  }

  const projectId = await resolveProjectId(projectIdArg, serviceAccountPath);

  if (!projectId) {
    console.error(
      'Could not resolve Firebase project id. Pass --project-id, set FIREBASE_PROJECT_ID/GOOGLE_CLOUD_PROJECT, or keep VITE_LOOPAYX_FIREBASE_PROJECT_ID in a local .env file and/or use a service account JSON with project_id.',
    );
    exit(EXIT.USAGE);
  }

  await initAdmin(serviceAccountPath, projectId);
  const projectConfigManager = getAuth().projectConfigManager();
  const currentConfig = await projectConfigManager.getProjectConfig();
  const nextProviderConfigs = upsertTotpProviderConfig(
    currentConfig.multiFactorConfig?.providerConfigs,
    adjacentIntervals,
  );
  const nextConfig = {
    multiFactorConfig: {
      state: 'ENABLED',
      providerConfigs: nextProviderConfigs,
    },
  };

  console.log(`Firebase project: ${projectId}`);
  console.log('Current project MFA config:');
  console.log(JSON.stringify(summarizeProjectConfig(currentConfig), null, 2));
  console.log('\nPlanned project MFA config:');
  console.log(JSON.stringify(nextConfig, null, 2));

  const currentTotpConfig = currentConfig.multiFactorConfig?.providerConfigs?.find(
    (config) => config?.totpProviderConfig,
  );
  const alreadyEnabled =
    currentConfig.multiFactorConfig?.state === 'ENABLED' &&
    currentTotpConfig?.state === 'ENABLED' &&
    currentTotpConfig?.totpProviderConfig?.adjacentIntervals === adjacentIntervals;

  if (alreadyEnabled) {
    console.log('\nTOTP is already enabled with the requested configuration.');
    exit(EXIT.NOOP);
  }

  if (!apply) {
    console.log('\nDry-run only. Re-run with --apply to persist the change.');
    exit(EXIT.OK);
  }

  const updatedConfig = await projectConfigManager.updateProjectConfig(nextConfig);

  console.log('\nTOTP MFA enabled successfully.');
  console.log('Updated project MFA config:');
  console.log(JSON.stringify(summarizeProjectConfig(updatedConfig), null, 2));
  exit(EXIT.OK);
}

void main().catch((error) => {
  console.error('\nTOTP enablement failed.');
  console.error(error instanceof Error ? error.stack ?? error.message : error);
  exit(EXIT.FAIL);
});