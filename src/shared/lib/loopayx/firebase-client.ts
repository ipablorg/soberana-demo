/**
 * Loopay X — Firebase Web SDK lazy bootstrap
 *
 * Firebase is imported dynamically so it lives in its own
 * `vendor-firebase` chunk and never enters the dashboard's initial
 * bundle. The first user that opens `LoopayXConfigModal` pays the
 * download cost; everyone else stays light.
 *
 * The config is read from `VITE_LOOPAYX_FIREBASE_*` env vars. We do
 * NOT ship hardcoded fallbacks — if a key is missing the integration
 * fails fast with a clear error rather than silently misbehaving.
 *
 * `idToken` is never persisted: it's exchanged once at sign-in for
 * the backend's own `accessToken`/`refreshToken` pair (24h/7d) and
 * then discarded.
 */

import type {
  Auth,
  ConfirmationResult,
  RecaptchaVerifier,
} from 'firebase/auth';
import type { FirebaseApp } from 'firebase/app';
import type { Firestore } from 'firebase/firestore';

interface LoopayXFirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  appId: string;
  messagingSenderId: string;
  storageBucket: string;
}

function readConfig(): LoopayXFirebaseConfig {
  const env = import.meta.env;
  const apiKey = env.VITE_LOOPAYX_FIREBASE_API_KEY as string | undefined;
  const authDomain = env.VITE_LOOPAYX_FIREBASE_AUTH_DOMAIN as string | undefined;
  const projectId = env.VITE_LOOPAYX_FIREBASE_PROJECT_ID as string | undefined;
  const appId = env.VITE_LOOPAYX_FIREBASE_APP_ID as string | undefined;
  const messagingSenderId = env.VITE_LOOPAYX_FIREBASE_MESSAGING_SENDER_ID as
    | string
    | undefined;
  const storageBucket = env.VITE_LOOPAYX_FIREBASE_STORAGE_BUCKET as
    | string
    | undefined;

  if (
    !apiKey ||
    !authDomain ||
    !projectId ||
    !appId ||
    !messagingSenderId ||
    !storageBucket
  ) {
    throw new Error(
      'Loopay X Firebase config missing. Set VITE_LOOPAYX_FIREBASE_* vars.',
    );
  }

  return {
    apiKey,
    authDomain,
    projectId,
    appId,
    messagingSenderId,
    storageBucket,
  };
}

let appPromise: Promise<FirebaseApp> | null = null;
let authPromise: Promise<Auth> | null = null;
let dbPromise: Promise<Firestore> | null = null;
let recaptcha: RecaptchaVerifier | null = null;
let confirmation: ConfirmationResult | null = null;

export async function getApp(): Promise<FirebaseApp> {
  if (!appPromise) {
    appPromise = (async () => {
      const { initializeApp, getApps, getApp: getDefaultApp } = await import(
        'firebase/app'
      );
      const existing = getApps();
      if (existing.length > 0) return getDefaultApp();
      return initializeApp(readConfig());
    })();
  }
  return appPromise;
}

export async function getAuth(): Promise<Auth> {
  if (!authPromise) {
    authPromise = (async () => {
      const app = await getApp();
      const { initializeAuth, browserLocalPersistence } = await import('firebase/auth');
      
      // Instead of getAuth, we must use initializeAuth for Identity Platform
      // to ensure it loads the correct underlying APIs for Multi-Factor
      // Check if it's already initialized by trying getAuth first (to prevent double initialization error)
      try {
         const { getAuth: existingAuth } = await import('firebase/auth');
         const authInstance = existingAuth(app);
         return authInstance;
      } catch (e) {
         return initializeAuth(app, {
           persistence: browserLocalPersistence
         });
      }
    })();
  }
  return authPromise;
}

/**
 * Lazy Firestore instance for the Loopay X project. `firebase/firestore`
 * is imported dynamically so it stays in the `vendor-firebase` chunk —
 * same lazy discipline as `getAuth`.
 */
export async function getDb(): Promise<Firestore> {
  if (!dbPromise) {
    dbPromise = (async () => {
      const app = await getApp();
      const { getFirestore } = await import('firebase/firestore');
      return getFirestore(app);
    })();
  }
  return dbPromise;
}

/**
 * Render the invisible reCAPTCHA inside the host element with id
 * `loopayx-recaptcha-container`. The element MUST exist in the DOM
 * before calling this. Idempotent: subsequent calls reuse the same
 * verifier instance.
 */
async function ensureRecaptcha(containerId: string): Promise<RecaptchaVerifier> {
  if (recaptcha) return recaptcha;
  const auth = await getAuth();
  const { RecaptchaVerifier } = await import('firebase/auth');
  recaptcha = new RecaptchaVerifier(auth, containerId, { size: 'invisible' });
  await recaptcha.render();
  return recaptcha;
}

/**
 * Send the SMS OTP. `phoneNumber` MUST be E.164 with no spaces, e.g.
 * `+573112100489`. The backend later validates that this exact string
 * matches the one inside the resulting `idToken`.
 */
export async function sendOtp(
  phoneNumber: string,
  containerId = 'loopayx-recaptcha-container',
): Promise<void> {
  const auth = await getAuth();
  const verifier = await ensureRecaptcha(containerId);
  const { signInWithPhoneNumber } = await import('firebase/auth');
  confirmation = await signInWithPhoneNumber(auth, phoneNumber, verifier);
}

/**
 * Confirm the SMS code and return the freshly minted `idToken`. The
 * `idToken` is short-lived; the caller should immediately exchange it
 * via `POST /api/auth/firebase` and then drop it from memory.
 */
export async function verifyOtp(
  code: string,
  phoneNumber: string,
): Promise<{ idToken: string; phoneNumber: string }> {
  if (!confirmation) {
    throw new Error('OTP_NOT_REQUESTED');
  }
  const cred = await confirmation.confirm(code);
  const idToken = await cred.user.getIdToken(true);
  return { idToken, phoneNumber };
}

/**
 * Drop in-memory verifier and confirmation. Call this after a
 * successful login or on logout to avoid leaking state across
 * sessions.
 */
export function resetFirebaseAuth(): void {
  try {
    recaptcha?.clear();
  } catch {
    // best effort
  }
  recaptcha = null;
  confirmation = null;
  // Firestore has no sign-out state to reset; the promise is reused.
}

export async function signOutFirebase(): Promise<void> {
  try {
    const auth = await getAuth();
    const { signOut } = await import('firebase/auth');
    await signOut(auth);
  } catch {
    // swallow — logout must always succeed locally
  } finally {
    resetFirebaseAuth();
  }
}
