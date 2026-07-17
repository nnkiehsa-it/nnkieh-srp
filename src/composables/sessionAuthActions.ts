import {
  getRedirectResult,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  type Auth,
} from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { auth, allowedDomain } from '@/lib/firebase';
import type { SessionState } from '@/composables/sessionTypes';
import { RequestFailure, withRequestTimeout } from '@/lib/request';
import { debugLog } from '@/composables/sessionDebug';

const LOGIN_ATTEMPT_KEY = 'novae-login-attempts';
const GOOGLE_REDIRECT_PENDING_KEY = 'novae:google-redirect-pending';
const LOGIN_ATTEMPT_WINDOW_MS = 10 * 60 * 1000;
const LOGIN_ATTEMPT_LIMIT = 30;
const LOGIN_CLICK_COOLDOWN_MS = 2_000;
const REDIRECT_RECOVERY_TIMEOUT_MS = 15_000;
let lastLoginAttemptAt = 0;

function markGoogleRedirectPending() {
  try {
    sessionStorage.setItem(GOOGLE_REDIRECT_PENDING_KEY, '1');
  } catch {
    // Firebase auth state restoration still handles a successful redirect.
  }
}

function hasPendingGoogleRedirect() {
  try {
    return sessionStorage.getItem(GOOGLE_REDIRECT_PENDING_KEY) === '1';
  } catch {
    return false;
  }
}

function clearGoogleRedirectPending() {
  try {
    sessionStorage.removeItem(GOOGLE_REDIRECT_PENDING_KEY);
  } catch {
    // A blocked storage API should not prevent authentication.
  }
}

async function getPendingRedirectResult(firebaseAuth: Auth) {
  let timeoutId = 0;
  const timeout = new Promise<never>((_, reject) => {
    timeoutId = window.setTimeout(() => {
      reject(new RequestFailure('text.5c8678c08dbd', 'timeout'));
    }, REDIRECT_RECOVERY_TIMEOUT_MS);
  });

  try {
    return await Promise.race([getRedirectResult(firebaseAuth), timeout]);
  } finally {
    window.clearTimeout(timeoutId);
  }
}

function claimLoginAttempt() {
  const now = Date.now();
  if (now - lastLoginAttemptAt < LOGIN_CLICK_COOLDOWN_MS) return false;
  lastLoginAttemptAt = now;
  try {
    const parsed = JSON.parse(localStorage.getItem(LOGIN_ATTEMPT_KEY) ?? '[]') as unknown;
    const attempts = Array.isArray(parsed)
      ? parsed.filter((value): value is number => typeof value === 'number' && value > now - LOGIN_ATTEMPT_WINDOW_MS)
      : [];
    if (attempts.length >= LOGIN_ATTEMPT_LIMIT) return false;
    localStorage.setItem(LOGIN_ATTEMPT_KEY, JSON.stringify([...attempts, now]));
  } catch {
    // Storage may be unavailable; the in-memory click cooldown still applies.
  }
  return true;
}

function shouldFallbackToRedirect(error: unknown) {
  return error instanceof FirebaseError && [
    'auth/popup-blocked',
    'auth/cancelled-popup-request',
    'auth/operation-not-supported-in-this-environment',
  ].includes(error.code);
}

function googleProvider(selectAccount = false) {
  const provider = new GoogleAuthProvider();
  if (allowedDomain) {
    provider.setCustomParameters({
      hd: allowedDomain,
      ...(selectAccount ? { prompt: 'select_account' } : {}),
    });
  } else if (selectAccount) {
    provider.setCustomParameters({ prompt: 'select_account' });
  }
  return provider;
}

export async function loginWithGoogle(state: SessionState, options: { selectAccount?: boolean } = {}) {
  debugLog('login requested', {
    allowedDomain,
  });
  state.error = '';
  if (!claimLoginAttempt()) {
    state.error = 'text.d3e3d4992b0f';
    return;
  }
  state.loading = true;

  if (!auth) {
    state.error = 'text.f346c9b8883d';
    state.loading = false;
    return;
  }

  const firebaseAuth = auth;

  try {
    debugLog('starting popup login', {
      customParameters: allowedDomain ? { hd: allowedDomain } : {},
    });
    await signInWithPopup(firebaseAuth, googleProvider(Boolean(options.selectAccount)));
    debugLog('popup login resolved', firebaseAuth.currentUser
      ? {
          uid: firebaseAuth.currentUser.uid,
          email: firebaseAuth.currentUser.email ?? '',
        }
      : null);
  } catch (error) {
    if (shouldFallbackToRedirect(error)) {
      debugLog('popup unavailable, falling back to redirect', error);
      markGoogleRedirectPending();
      try {
        await signInWithRedirect(firebaseAuth, googleProvider(Boolean(options.selectAccount)));
      } catch (redirectError) {
        clearGoogleRedirectPending();
        debugLog('redirect login failed', redirectError);
        state.error = getLoginErrorMessage(redirectError);
      }
      return;
    }

    debugLog('login failed before completion', error);
    state.error = getLoginErrorMessage(error);
  } finally {
    state.loading = false;
  }
}

export async function recoverPendingGoogleRedirect(state: SessionState, firebaseAuth: Auth) {
  if (!hasPendingGoogleRedirect()) return;

  try {
    const result = await getPendingRedirectResult(firebaseAuth);
    debugLog('getRedirectResult resolved', result
      ? {
          uid: result.user.uid,
          email: result.user.email ?? '',
          providerId: result.providerId ?? '',
        }
      : null);
  } catch (error) {
    debugLog('getRedirectResult failed', error);
    try {
      await firebaseAuth.authStateReady();
    } catch {
      // The redirect failure below remains the actionable authentication error.
    }
    if (!firebaseAuth.currentUser && !state.user) {
      state.error = getRedirectRecoveryErrorMessage(error);
    }
  } finally {
    clearGoogleRedirectPending();
  }
}

function getRedirectRecoveryErrorMessage(error: unknown) {
  if (error instanceof RequestFailure && error.code === 'timeout') {
    return 'text.5c8678c08dbd';
  }
  return getLoginErrorMessage(error, 'text.8307998498b9');
}

function getLoginErrorMessage(error: unknown, fallback = 'text.d98f9372b018') {
  if (!(error instanceof FirebaseError)) {
    return fallback;
  }

  if (
    error.code === 'auth/missing-recaptcha-token'
    || error.code === 'auth/invalid-recaptcha-token'
    || error.code === 'auth/invalid-recaptcha-action'
    || error.code === 'auth/recaptcha-not-enabled'
  ) {
    return 'text.3e57546f2cb7';
  }

  if (error.code === 'auth/network-request-failed') {
    return 'text.6146a5032fcc';
  }

  if (error.code === 'auth/popup-closed-by-user') {
    return 'text.e75c0c610540';
  }

  if (error.code === 'auth/popup-blocked') {
    return 'text.5dc9caa90cae';
  }

  if (error.code === 'auth/operation-not-supported-in-this-environment') {
    return 'text.fc85f5e4ed0a';
  }

  if (error.code === 'auth/unauthorized-domain') {
    return 'text.e434bd2a5714';
  }

  if (error.code === 'auth/argument-error') {
    return 'text.4773c4f16a86';
  }

  return fallback;
}

export async function logoutFromFirebase(state: SessionState) {
  if (!auth) {
    state.loading = false;
    return;
  }

  const firebaseAuth = auth;

  state.loading = true;
  try {
    await withRequestTimeout(() => signOut(firebaseAuth), { label: 'text.b7fd2c1683eb' });
  } finally {
    state.loading = false;
  }
}
