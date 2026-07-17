import { readonly, ref } from 'vue';
import en from '@/i18n/messages/en';
import zhTW from '@/i18n/messages/zh-TW';

export type AppLocale = 'zh-TW' | 'en';
export type TranslationParams = Record<string, string | number>;
export type MessageKey = keyof typeof zhTW;

const LOCALE_STORAGE_KEY = 'novae:locale';
const supportedLocales = new Set<AppLocale>(['zh-TW', 'en']);
const localeState = ref<AppLocale>('zh-TW');
const sourceKeyLookup = new Map<string, MessageKey>(
  Object.entries(zhTW).map(([key, value]) => [value, key as MessageKey]),
);
let initialized = false;

function normalizeLocale(value: string | null | undefined): AppLocale | null {
  if (!value) return null;
  if (supportedLocales.has(value as AppLocale)) return value as AppLocale;
  return value.toLowerCase().startsWith('en') ? 'en' : 'zh-TW';
}

function detectSystemLocale(): AppLocale {
  if (typeof navigator === 'undefined') return 'zh-TW';
  for (const language of navigator.languages ?? [navigator.language]) {
    const normalized = normalizeLocale(language);
    if (normalized === 'en') return 'en';
  }
  return 'zh-TW';
}

function applyDocumentLocale(locale: AppLocale) {
  if (typeof document !== 'undefined') document.documentElement.lang = locale;
}

function interpolate(message: string, params: TranslationParams) {
  return message.replace(/\{(\w+)\}/g, (match, key: string) => (
    Object.prototype.hasOwnProperty.call(params, key) ? String(params[key]) : match
  ));
}

export function initializeI18n() {
  if (initialized) return;
  initialized = true;

  let storedLocale: AppLocale | null = null;
  try {
    storedLocale = normalizeLocale(window.localStorage.getItem(LOCALE_STORAGE_KEY));
  } catch {
    // Storage can be unavailable in restricted browser contexts.
  }

  const initialLocale = storedLocale ?? detectSystemLocale();
  localeState.value = initialLocale;
  applyDocumentLocale(initialLocale);

  if (!storedLocale) {
    try {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, initialLocale);
    } catch {
      // Storage can be unavailable in restricted browser contexts.
    }
  }
}

export function setLocale(locale: AppLocale) {
  localeState.value = locale;
  applyDocumentLocale(locale);
  try {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    // The in-memory selection remains usable when persistence is unavailable.
  }
}

export function t(source: string, params: TranslationParams = {}) {
  const messages: Record<string, string> = localeState.value === 'en' ? en : zhTW;
  const resolvedKey = messages[source] ? source : sourceKeyLookup.get(source);
  const message = (resolvedKey ? messages[resolvedKey] : undefined) ?? source;
  return interpolate(message, params);
}

export function getLocale() {
  return localeState.value;
}

export function useI18n() {
  return {
    locale: readonly(localeState),
    setLocale,
    t,
  };
}
