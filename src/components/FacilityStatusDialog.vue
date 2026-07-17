<template>
  <StatusTransitionDialog
    dialog-title-id="facility-status-dialog-title"
    :open="open"
    :saving="saving"
    :error="error"
    :options="availableOptions"
    :initial-status="availableOptions[0]?.value ?? ''"
    select-title="text.c73fda418c26"
    result-title="text.51930ab090b0"
    result-description="text.e68b6d5dfc78"
    result-input-id="facility-result-content"
    result-label="text.acf9101e8dc4"
    :result-max-length="INPUT_LIMITS.resultContent"
    :result-warning-length="1800"
    result-placeholder="text.5576c3bfdec1"
    result-required-error="text.be8cd119f44e"
    :result-statuses="['completed', 'unable-to-handle']"
    @close="emit('close')"
    @submit="submit"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import StatusTransitionDialog from '@/components/ui/StatusTransitionDialog.vue';
import { INPUT_LIMITS } from '@/constants/input-limits';
import type { FacilityStatus } from '@/types';

const props = withDefaults(defineProps<{
  currentStatus: FacilityStatus;
  error?: string;
  open: boolean;
  saving?: boolean;
}>(), {
  error: '',
  saving: false,
});

const emit = defineEmits<{
  close: [];
  submit: [status: FacilityStatus, result: string];
}>();

const options = [
  { value: 'processing', label: 'text.ae16f4a52d69', description: 'text.f199014cac6d' },
  { value: 'completed', label: 'text.e99b48a29bdf', description: 'text.7c9a4aa731f5' },
  { value: 'unable-to-handle', label: 'text.900950604945', description: 'text.c49fea15cfb7' },
] satisfies Array<{ value: FacilityStatus; label: string; description: string }>;

const availableOptions = computed(() =>
  props.currentStatus === 'pending'
    ? options.filter((option) => option.value === 'processing')
    : options.filter((option) => option.value !== 'processing'),
);

function submit(status: string, result: string) {
  emit('submit', status as FacilityStatus, result);
}
</script>
