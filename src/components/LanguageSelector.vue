<template>
  <DropdownMenu
    class="!block w-full"
    :fallback-height="languageOptions.length * 48 + 48"
    panel-class="max-w-[calc(100vw-2rem)]"
    :width="240"
  >
    <template #trigger="{ open, toggle }">
      <ListSurfaceRow
        class="settings-row"
        interactive
        aria-haspopup="listbox"
        :aria-expanded="open"
        @click="toggle"
      >
        <span class="min-w-0 flex-1">
          <span class="block text-sm font-semibold text-ink-900 dark:text-ink-100">
            {{ t(currentLanguage.label) }}
          </span>
          <span class="mt-0.5 block text-xs text-ink-500 dark:text-ink-400">
            {{ t('settings.changeTheInterfaceLanguage') }}
          </span>
        </span>
        <AppIcon
          name="chevron-down"
          :size="4"
          class="shrink-0 text-ink-400 transition-transform"
          :class="{ 'rotate-180': open }"
        />
      </ListSurfaceRow>
    </template>

    <template #default="{ close }">
      <div class="dropdown-label mb-1">{{ t('settings.language') }}</div>
      <div role="listbox" :aria-label="t('settings.language')" class="space-y-0.5">
        <button
          v-for="option in languageOptions"
          :key="option.value"
          type="button"
          role="option"
          class="dropdown-item justify-between"
          :class="{ 'button-toolbar--active': locale === option.value }"
          :aria-selected="locale === option.value"
          @click="selectLanguage(option.value, close)"
        >
          <span>{{ t(option.label) }}</span>
          <SelectionMark :selected="locale === option.value" />
        </button>
      </div>
    </template>
  </DropdownMenu>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import AppIcon from '@/components/ui/atoms/AppIcon.vue';
import SelectionMark from '@/components/ui/atoms/SelectionMark.vue';
import DropdownMenu from '@/components/ui/molecules/DropdownMenu.vue';
import ListSurfaceRow from '@/components/ui/molecules/ListSurfaceRow.vue';
import { useI18n, type AppLocale } from '@/i18n';

const { locale, setLocale, t } = useI18n();
const languageOptions: Array<{ label: string; value: AppLocale }> = [
  { label: 'settings.traditionalChinese', value: 'zh-TW' },
  { label: 'settings.english', value: 'en' },
];
const currentLanguage = computed(
  () => languageOptions.find((option) => option.value === locale.value) ?? languageOptions[0],
);

function selectLanguage(value: AppLocale, close: () => void) {
  setLocale(value);
  close();
}
</script>
