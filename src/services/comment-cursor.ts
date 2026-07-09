import { normalizeDate } from '@/services/issues-core';

export type CommentCursor = { id: string; createdAtMs: number } | null;

export function normalizeCommentCursor(data: unknown): CommentCursor {
  if (!data || typeof data !== 'object') return null;
  const record = data as Record<string, unknown>;
  const id = typeof record.id === 'string' ? record.id : '';
  const createdAt = normalizeDate(record.createdAtMs ?? record.created_at);
  return id && createdAt ? { id, createdAtMs: createdAt.getTime() } : null;
}
