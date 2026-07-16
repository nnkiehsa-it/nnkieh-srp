import { createRemoteJWKSet, jwtVerify } from 'jose';
import type { Env } from './types';

const firebaseKeys = createRemoteJWKSet(
  new URL('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com'),
);

export async function requireFirebaseUid(request: Request, env: Env) {
  const authorization = request.headers.get('authorization') ?? '';
  const match = /^Bearer\s+(.+)$/iu.exec(authorization);
  if (!match) throw new Error('unauthenticated');
  try {
    const { payload } = await jwtVerify(match[1], firebaseKeys, {
      audience: env.FIREBASE_PROJECT_ID,
      issuer: `https://securetoken.google.com/${env.FIREBASE_PROJECT_ID}`,
    });
    if (typeof payload.sub !== 'string' || !payload.sub) throw new Error('unauthenticated');
    return payload.sub;
  } catch {
    throw new Error('unauthenticated');
  }
}
