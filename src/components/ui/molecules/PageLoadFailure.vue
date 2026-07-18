<template>
  <SurfacePanel padding="lg" class="flex w-full min-w-0 flex-col items-center py-14 text-center">
    <IconTile size="lg" tone="warning" aria-hidden="true">
      <AppIcon name="circle-alert" :size="7" :stroke-width="1.7" />
    </IconTile>
    <h2 class="mt-5 text-xl font-semibold tracking-[0.015em] text-ink-950 dark:text-ink-50">{{ t(title) }}</h2>
    <p class="mt-2 text-sm text-ink-500 dark:text-ink-400">{{ t(description) }}</p>
    <AppButton variant="secondary" class="mt-5" :disabled="retryDisabled" @click="emit('retry')">
      {{ t(actionLabel) }}
    </AppButton>
  </SurfacePanel>
</template>

<script setup lang="ts">
import AppButton from '@/components/ui/atoms/AppButton.vue';
import AppIcon from '@/components/ui/atoms/AppIcon.vue';
import IconTile from '@/components/ui/atoms/IconTile.vue';
import SurfacePanel from '@/components/ui/molecules/SurfacePanel.vue';
import { useI18n } from '@/i18n';

const { t } = useI18n();

withDefaults(defineProps<{
  actionLabel?: string;
  description?: string;
  retryDisabled?: boolean;
  title?: string;
}>(), {
  actionLabel: 'dashboard.refresh',
  description: 'common.loadTimeout',
  retryDisabled: false,
  title: 'common.thereSeemsToBeAProblemWithTheNetwork',
});

const emit = defineEmits<{
  retry: [];
}>();
</script>
