<template>
  <AppButton
    :variant="danger ? 'danger' : 'secondary'"
    class="button-action"
    :class="[
      active ? 'button-action--active' : '',
      compact ? '!h-8 !min-h-0 !gap-1 !px-2.5 text-xs' : '',
    ]"
    :disabled="disabled"
    :title="t(title || label)"
    :aria-label="t(ariaLabel || label)"
    @click="emit('click')"
  >
    <slot />
    <span>{{ t(label) }}</span>
  </AppButton>
</template>

<script setup lang="ts">
import AppButton from '@/components/ui/atoms/AppButton.vue';
import { useI18n } from '@/i18n';

const { t } = useI18n();

withDefaults(defineProps<{
  active?: boolean;
  ariaLabel?: string;
  danger?: boolean;
  disabled?: boolean;
  label: string;
  title?: string;
  compact?: boolean;
}>(), {
  active: false,
  ariaLabel: '',
  danger: false,
  disabled: false,
  title: '',
  compact: false,
});

const emit = defineEmits<{
  click: [];
}>();
</script>
