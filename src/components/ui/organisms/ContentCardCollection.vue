<template>
  <div class="issue-table overflow-visible" role="list" :aria-label="t(listLabel)">
    <slot v-if="loading && empty" name="loading" />

    <InlineMessage v-else-if="error" as="div" size="sm" class="px-4 py-8 text-center">
      {{ t(error) }}
    </InlineMessage>

    <div v-else-if="empty" class="px-4 py-12 text-center text-sm text-ink-500 dark:text-ink-400">
      {{ t(emptyLabel) }}
    </div>

    <div v-else class="issue-card-grid" role="presentation">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '@/i18n';
import InlineMessage from '@/components/ui/atoms/InlineMessage.vue';

const { t } = useI18n();

withDefaults(defineProps<{
  empty: boolean;
  emptyLabel: string;
  error?: string;
  listLabel: string;
  loading?: boolean;
}>(), {
  error: '',
  loading: false,
});

defineSlots<{
  default(): unknown;
  loading(): unknown;
}>();
</script>
