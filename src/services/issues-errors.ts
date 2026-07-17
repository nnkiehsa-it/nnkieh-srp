import { RequestFailure } from '@/lib/request';
import { ApiRequestError } from '@/lib/api-error';

export function toReadableBackendError(error: unknown) {
  if (error instanceof RequestFailure) return error;
  if (error instanceof ApiRequestError && error.code === 'service-not-configured') {
    return new Error('issue.serviceSetupIncomplete', { cause: error });
  }
  if (isContentUnavailableError(error)) {
    return new Error('issue.theContentNoLongerExists', { cause: error });
  }
  const code = error && typeof error === 'object' && 'code' in error ? String(error.code) : '';
  if (code === 'permission-denied' || code === '42501') {
    return new Error('access.operationForbidden');
  }
  if (code === 'unauthenticated' || code === '401') {
    return new Error('issue.pleaseLogInBeforeContinuing');
  }
  if (error instanceof ApiRequestError) return error;
  return new Error('facility.theOperationFailedPleaseTryAgainLater', { cause: error });
}

export function isContentUnavailableError(error: unknown) {
  if (error && typeof error === 'object') {
    const code = 'code' in error ? String(error.code) : '';
    const details = 'details' in error ? (error.details as Record<string, unknown> | null) : null;
    if (details && (details.reason === 'CONTENT_DELETED' || details.reason === 'CONTENT_NOT_FOUND')) {
      return true;
    }
    if (code === 'not-found' || code === 'PGRST116') {
      return true;
    }
  }
  return false;
}
