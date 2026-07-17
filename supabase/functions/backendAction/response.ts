import { errorStatus, publicErrorBody } from "../_shared/http.ts";
import type { ApiErrorCode } from "../_shared/api-errors.ts";

export interface ApiErrorBody {
  code: ApiErrorCode;
  retryAfterSeconds?: number;
}

export interface ApiSuccessEnvelope<TData> {
  data: TData;
  requestId: string;
  success: true;
}

export interface ApiErrorEnvelope {
  error: ApiErrorBody;
  requestId: string;
  success: false;
}

function envelopeHeaders(init: ResponseInit = {}) {
  return {
    ...init,
    headers: {
      "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Origin": "*",
      ...(init.headers ?? {}),
    },
  };
}

export function successEnvelope<TData>(data: TData, requestId: string): ApiSuccessEnvelope<TData> {
  return { data, requestId, success: true };
}

export function errorEnvelope(error: unknown, requestId: string): ApiErrorEnvelope {
  return {
    error: publicErrorBody(error),
    requestId,
    success: false,
  };
}

export function successResponse<TData>(data: TData, requestId: string, init: ResponseInit = {}) {
  return Response.json(successEnvelope(data, requestId), envelopeHeaders(init));
}

export function errorResponse(error: unknown, requestId: string, init: ResponseInit = {}) {
  const envelope = errorEnvelope(error, requestId);
  const retryAfterSeconds = envelope.error.retryAfterSeconds;
  return Response.json(
    envelope,
    envelopeHeaders({
      ...init,
      headers: {
        ...(init.headers ?? {}),
        ...(retryAfterSeconds ? { "Retry-After": String(retryAfterSeconds) } : {}),
      },
      status: init.status ?? errorStatus(error),
    }),
  );
}
