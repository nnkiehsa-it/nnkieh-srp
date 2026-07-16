import type { User } from 'firebase/auth';
import { hasSupabaseConfig } from '@/lib/supabase';
import { withRequestTimeout } from '@/lib/request';
import { apiGatewayUrl, hasApiGatewayConfig } from '@/lib/api-gateway';

interface SyncUserResponse {
  error?: string;
  ok?: boolean;
  role?: string;
}

const PROFILE_SYNC_INTERVAL_MS = 24 * 60 * 60 * 1_000;
const PROFILE_SYNC_KEY_PREFIX = 'novae:profile-synced-at:';

function wasRecentlySynced(uid: string) {
  try {
    const syncedAt = Number.parseInt(localStorage.getItem(`${PROFILE_SYNC_KEY_PREFIX}${uid}`) ?? '0', 10);
    return Number.isFinite(syncedAt) && Date.now() - syncedAt < PROFILE_SYNC_INTERVAL_MS;
  } catch {
    return false;
  }
}

function rememberSync(uid: string) {
  try {
    localStorage.setItem(`${PROFILE_SYNC_KEY_PREFIX}${uid}`, String(Date.now()));
  } catch {
    // A blocked storage API should not prevent authentication.
  }
}

export async function ensureSupabaseAuthenticatedRole(user: User) {
  if (!hasSupabaseConfig() || !hasApiGatewayConfig()) return;

  const token = await withRequestTimeout(
    () => user.getIdTokenResult(),
    { label: 'Supabase 登入初始化' },
  );
  if (token.claims.role === 'authenticated' && wasRecentlySynced(user.uid)) return;

  const response = await withRequestTimeout(
    (signal) => fetch(apiGatewayUrl('/v1/auth/sync'), {
      method: 'POST',
      body: JSON.stringify({ email: user.email }),
      headers: {
        Authorization: `Bearer ${token.token}`,
        'Content-Type': 'application/json',
      },
      signal,
    }),
    { label: 'Supabase 登入初始化' },
  );
  let data: SyncUserResponse | null = null;
  try {
    data = await response.json() as SyncUserResponse;
  } catch {
    // Use the HTTP fallback below.
  }

  if (!response.ok || data?.ok !== true) {
    throw new Error(data?.error || `Supabase 登入初始化失敗（${response.status}）。`);
  }
  rememberSync(user.uid);

  if (token.claims.role !== 'authenticated') {
    let refreshedToken = await withRequestTimeout(
      () => user.getIdTokenResult(true),
      { label: 'Supabase 登入更新' },
    );
    let attempts = 0;
    while (refreshedToken.claims.role !== 'authenticated' && attempts < 3) {
      await new Promise((resolve) => setTimeout(resolve, 800));
      refreshedToken = await withRequestTimeout(
        () => user.getIdTokenResult(true),
        { label: 'Supabase 登入更新重試' },
      );
      attempts++;
    }
    if (refreshedToken.claims.role !== 'authenticated') {
      throw new Error('Supabase 登入初始化尚未完成。');
    }
  }
}
