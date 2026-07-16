import type { Env, JsonRecord } from './types';

export const MAX_BODY_BYTES = 64 * 1024;

export function allowedOrigins(env: Env) {
  return new Set(env.ALLOWED_ORIGINS.split(',').map((value) => value.trim()).filter(Boolean));
}

export function corsHeaders(request: Request, env: Env) {
  const origin = request.headers.get('origin') ?? '';
  return {
    'access-control-allow-headers': 'authorization, content-type',
    'access-control-allow-methods': 'POST, OPTIONS',
    'access-control-allow-origin': allowedOrigins(env).has(origin) ? origin : 'null',
    'access-control-max-age': '86400',
    'vary': 'Origin',
  };
}

export function jsonResponse(request: Request, env: Env, data: unknown, status = 200, headers: HeadersInit = {}) {
  return Response.json(data, {
    status,
    headers: {
      ...corsHeaders(request, env),
      'cache-control': 'no-store',
      ...headers,
    },
  });
}

export function actionError(
  request: Request,
  env: Env,
  requestId: string,
  status: number,
  code: string,
  message: string,
  headers: HeadersInit = {},
) {
  return jsonResponse(request, env, { error: { code, message }, requestId, success: false }, status, headers);
}

export function simpleError(request: Request, env: Env, status: number, message: string, headers: HeadersInit = {}) {
  return jsonResponse(request, env, { error: message, ok: false }, status, headers);
}

export async function readBody(request: Request) {
  const declared = Number(request.headers.get('content-length') ?? 0);
  if (Number.isFinite(declared) && declared > MAX_BODY_BYTES) throw new Error('request-too-large');
  const body = new Uint8Array(await request.arrayBuffer());
  if (body.byteLength > MAX_BODY_BYTES) throw new Error('request-too-large');
  return body;
}

export function parseJsonRecord(body: Uint8Array): JsonRecord {
  try {
    const value = JSON.parse(new TextDecoder().decode(body)) as unknown;
    return value && typeof value === 'object' && !Array.isArray(value) ? value as JsonRecord : {};
  } catch {
    throw new Error('invalid-json');
  }
}

export function isAllowedBrowserRequest(request: Request, env: Env) {
  const origin = request.headers.get('origin');
  return Boolean(origin && allowedOrigins(env).has(origin));
}
