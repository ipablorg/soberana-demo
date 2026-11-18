#!/usr/bin/env node
/*
 * Reset Firebase MFA for a specific user.
 *
 * Default behavior is safe by design:
 * - dry-run unless `--apply` is provided
 * - removes only TOTP factors unless `--all-factors` is provided
 *
 * Usage:
 *   node scripts/reset-firebase-mfa.mjs --email user@example.com
 *   node scripts/reset-firebase-mfa.mjs --email user@example.com --apply
 *   node scripts/reset-firebase-mfa.mjs --uid firebase-uid --apply
 *   node scripts/reset-firebase-mfa.mjs --email user@example.com --apply --all-factors
 *   node scripts/reset-firebase-mfa.mjs --email user@example.com --service-account ./service-account.json --apply
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
Reset Firebase MFA for one user.

Usage:
  node scripts/reset-firebase-mfa.mjs --email user@example.com [--apply]
  node scripts/reset-firebase-mfa.mjs --uid firebase-uid [--apply]

Options:
  --email <email>              Target user email
  --uid <uid>                  Target Firebase UID
  --project-id <projectId>     Explicit Firebase project id
  --apply                      Apply the change (default is dry-run)
  --all-factors                Remove all MFA factors, not just TOTP
  --service-account <path>     Explicit service account JSON path
  --help                       Show this help

Notes:
  - Dry-run is the default.
  - Without --all-factors, this script removes only TOTP factors and preserves phone MFA.
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

function factorSummary(factor) {
  return {
    uid: factor.uid,
    factorId: factor.factorId,
    displayName: factor.displayName ?? null,
    phoneNumber: 'phoneNumber' in factor ? factor.phoneNumber ?? null : null,
    enrollmentTime: factor.enrollmentTime ?? null,
  };
}

function toUpdateFactor(factor) {
  if (factor.factorId === 'phone') {
    return {
      uid: factor.uid,
      factorId: factor.factorId,
      displayName: factor.displayName,
      phoneNumber: factor.phoneNumber,
      enrollmentTime: factor.enrollmentTime,
    };
  }

  throw new Error(
    `Cannot preserve unsupported factor type \"${factor.factorId}\". Re-run with --all-factors if you intend to clear every factor.`,
  );
}

async function main() {
  if (hasFlag('--help')) {
    usage();
    exit(EXIT.OK);
  }

  const email = readOption('--email');
  const uid = readOption('--uid');
  const projectIdArg = readOption('--project-id');
  const serviceAccountPath = readOption('--service-account');
  const apply = hasFlag('--apply');
  const removeAllFactors = hasFlag('--all-factors');

  if ((!email && !uid) || (email && uid)) {
    console.error('Provide exactly one target: --email or --uid.');
    usage();
    exit(EXIT.USAGE);
  }

  const projectId = await resolveProjectId(projectIdArg, serviceAccountPath);

  if (!projectId) {
    console.error(
      'Could not resolve Firebase project id. Pass --project-id, set FIREBASE_PROJECT_ID/GOOGLE_CLOUD_PROJECT, or keep VITE_LOOPAYX_FIREBASE_PROJECT_ID in a local .env file. and/or use a service account JSON with project_id.',
    );
    exit(EXIT.USAGE);
  }

  await initAdmin(serviceAccountPath, projectId);
  const auth = getAuth();
  console.log(`Firebase project: ${projectId}`);
  const user = email ? await auth.getUserByEmail(email) : await auth.getUser(uid);
  const enrolledFactors = user.multiFactor?.enrolledFactors ?? [];

  console.log(`User: ${user.email ?? '(no email)'} (${user.uid})`);

  if (enrolledFactors.length === 0) {
    console.log('No enrolled MFA factors found. Nothing to reset.');
    exit(EXIT.NOOP);
  }

  console.log('Current MFA factors:');
  console.log(JSON.stringify(enrolledFactors.map(factorSummary), null, 2));

  const keptFactors = removeAllFactors
    ? []
    : enrolledFactors.filter((factor) => factor.factorId !== 'totp');
  const removedFactors = removeAllFactors
    ? enrolledFactors
    : enrolledFactors.filter((factor) => factor.factorId === 'totp');

  if (removedFactors.length === 0) {
    console.log('No TOTP factors found. Nothing to remove.');
    exit(EXIT.NOOP);
  }

  console.log('\nPlanned removal:');
  console.log(JSON.stringify(removedFactors.map(factorSummary), null, 2));

  if (!apply) {
    console.log('\nDry-run only. Re-run with --apply to persist the change.');
    exit(EXIT.OK);
  }

  await auth.updateUser(user.uid, {
    multiFactor: {
      enrolledFactors: keptFactors.length > 0 ? keptFactors.map(toUpdateFactor) : null,
    },
  });

  const updatedUser = await auth.getUser(user.uid);
  const updatedFactors = updatedUser.multiFactor?.enrolledFactors ?? [];

  console.log('\nMFA reset applied successfully.');
  console.log('Remaining MFA factors:');
  console.log(JSON.stringify(updatedFactors.map(factorSummary), null, 2));
  exit(EXIT.OK);
}

void main().catch((error) => {
  console.error('\nMFA reset failed.');
  console.error(error instanceof Error ? error.stack ?? error.message : error);
  exit(EXIT.FAIL);
});
