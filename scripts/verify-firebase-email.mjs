#!/usr/bin/env node
/*
 * Mark a Firebase user's email as verified (or revoke it).
 *
 * Use case: manually-provisioned accounts (e.g. custodial investor wallets)
 * where the team controls the identity out-of-band and the standard email
 * verification flow is not meaningful. This unblocks the sign-in email
 * verification gate (auth-enforcement.ts) without touching the frontend.
 *
 * Default behavior is safe by design:
 * - dry-run unless `--apply` is provided
 * - verifies the email unless `--revoke` is provided
 *
 * Usage:
 *   node scripts/verify-firebase-email.mjs --email user@example.com
 *   node scripts/verify-firebase-email.mjs --email user@example.com --apply
 *   node scripts/verify-firebase-email.mjs --uid firebase-uid --apply
 *   node scripts/verify-firebase-email.mjs --email user@example.com --apply --revoke
 *   node scripts/verify-firebase-email.mjs --email user@example.com --service-account ./service-account.json --apply
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
Mark a Firebase user's email as verified (or revoke it).

Usage:
  node scripts/verify-firebase-email.mjs --email user@example.com [--apply]
  node scripts/verify-firebase-email.mjs --uid firebase-uid [--apply]

Options:
  --email <email>              Target user email
  --uid <uid>                  Target Firebase UID
  --project-id <projectId>     Explicit Firebase project id
  --apply                      Apply the change (default is dry-run)
  --revoke                     Mark the email as UNVERIFIED (default is to verify)
  --service-account <path>     Explicit service account JSON path
  --help                       Show this help

Notes:
  - Dry-run is the default.
  - Without --revoke, sets emailVerified = true.
  - With --revoke, sets emailVerified = false (use to undo a mistake).
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
  const revoke = hasFlag('--revoke');

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

  const desired = !revoke;
  console.log(`User: ${user.email ?? '(no email)'} (${user.uid})`);
  console.log(`Current emailVerified: ${user.emailVerified}`);

  if (user.emailVerified === desired) {
    console.log(
      desired
        ? 'Email is already verified. Nothing to do.'
        : 'Email is already unverified. Nothing to do.',
    );
    exit(EXIT.NOOP);
  }

  console.log(`\nPlanned change: emailVerified -> ${desired}`);

  if (!apply) {
    console.log('\nDry-run only. Re-run with --apply to persist the change.');
    exit(EXIT.OK);
  }

  await auth.updateUser(user.uid, { emailVerified: desired });

  const updated = await auth.getUser(user.uid);
  console.log(`\nUpdate applied. emailVerified is now ${updated.emailVerified}.`);
  exit(EXIT.OK);
}

void main().catch((error) => {
  console.error('\nEmail verification update failed.');
  console.error(error instanceof Error ? error.stack ?? error.message : error);
  exit(EXIT.FAIL);
});
