<template>
  <div
    class="flex flex-wrap text-xs text-ink-500 dark:text-ink-400"
    :class="compact ? 'gap-x-3 gap-y-1' : 'gap-x-4 gap-y-2'"
  >
    <div
      v-for="item in items"
      :key="item.label"
      class="flex items-center gap-1"
      :class="{ 'shrink-0': compact }"
    >
      <span class="font-semibold text-ink-400">{{ compact ? `${t(item.shortLabel)}:` : `${t(item.label)}:` }}</span>
      <span class="font-medium text-ink-700 dark:text-ink-300">{{ t(item.valueLabel) }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { OperationTimeListItem } from '@/types';
import { useI18n } from '@/i18n';

const { t } = useI18n();

withDefaults(defineProps<{
  compact?: boolean;
  items: OperationTimeListItem[];
}>(), {
  compact: false,
});
</script>
