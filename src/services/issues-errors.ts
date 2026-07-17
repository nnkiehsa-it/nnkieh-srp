import { RequestFailure } from '@/lib/request';

export function toReadableBackendError(error: unknown) {
  if (error instanceof RequestFailure) return error;
  const message = error instanceof Error ? error.message : '';
  if (message.includes('is not configured')) {
    return new Error('text.2f74589a8ebd', { cause: error });
  }
  if (message.includes('text.bd337f7de26b')) {
    return new Error(message);
  }
  if (isContentUnavailableError(error)) {
    return new Error(message || 'text.26158fb8a421');
  }
  const code = error && typeof error === 'object' && 'code' in error ? String(error.code) : '';
  if (code === 'permission-denied' || code === '42501') {
    return new Error('text.76c577b4c59c');
  }
  if (code === 'unauthenticated' || code === '401') {
    return new Error('text.42cdd29fe940');
  }
  if (/backend|provider|session/i.test(message)) {
    return new Error('text.400748fa9644');
  }
  return new Error(message || 'text.400748fa9644');
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
  const message = error instanceof Error ? error.message : String(error ?? '');
  return message.includes('text.c0170f6750e4') || message.includes('text.f7b3d91861b4');
}
