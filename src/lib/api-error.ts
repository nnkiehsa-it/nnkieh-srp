import { API_ERRORS, isApiErrorCode, type ApiErrorCode } from '@/generated/api-errors';
import { t } from '@/i18n';

export interface ApiErrorBody {
  code?: unknown;
  retryAfterSeconds?: unknown;
}

export interface ApiErrorResponse {
  error?: ApiErrorBody;
  requestId?: unknown;
}

export class ApiRequestError extends Error {
  readonly code: ApiErrorCode;
  readonly messageKey: (typeof API_ERRORS)[ApiErrorCode]['messageKey'];
  readonly requestId?: string;
  readonly retryAfterSeconds?: number;

  constructor(response: ApiErrorResponse) {
    const code = isApiErrorCode(response.error?.code) ? response.error.code : 'internal-error';
    const messageKey = API_ERRORS[code].messageKey;
    const requestId = typeof response.requestId === 'string' && response.requestId.trim()
      ? response.requestId.trim()
      : undefined;
    const retryAfterSeconds = typeof response.error?.retryAfterSeconds === 'number'
      && Number.isFinite(response.error.retryAfterSeconds)
      && response.error.retryAfterSeconds > 0
      ? Math.ceil(response.error.retryAfterSeconds)
      : undefined;
    super(requestId ? t('service.errorTrackingCode', { message: t(messageKey), requestId }) : messageKey);
    this.name = 'ApiRequestError';
    this.code = code;
    this.messageKey = messageKey;
    this.requestId = requestId;
    this.retryAfterSeconds = retryAfterSeconds;
  }
}
