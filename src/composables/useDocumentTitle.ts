import { watch, type ComputedRef } from 'vue';
import { useI18n } from '@/i18n';

export function useDocumentTitle(title: ComputedRef<string>, defaultTitle: string) {
  const { locale, t } = useI18n();

  function updateDocumentTitle() {
    document.title = `${t(title.value)} | ${defaultTitle}`;
  }

  watch([title, locale], updateDocumentTitle, { immediate: true });

  function restoreDocumentTitle() {
    document.title = defaultTitle;
  }

  return {
    restoreDocumentTitle,
  };
}
