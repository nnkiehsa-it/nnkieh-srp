import { getLocale } from '@/i18n';

export function formatDate(value: Date | null): string {
  if (!value) {
    return '';
  }

  return new Intl.DateTimeFormat(getLocale(), {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(value);
}

export function formatDateOnly(value: Date | null): string {
  if (!value) {
    return '';
  }

  return new Intl.DateTimeFormat(getLocale(), {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(value);
}

export function stripMarkdownImages(text: string): string {
  return text.replace(/!\[[^\]]*]\((\S+?)(?:\s+["'][^"']*["'])?\)/g, '');
}

