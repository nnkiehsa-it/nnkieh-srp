<template>
  <component
    :is="as"
    class="inline-alert"
    :class="[`inline-alert--${tone}`, { 'inline-alert--compact': compact }]"
    :role="role"
    :aria-live="live"
  >
    <slot />
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue';

type AlertTone = 'error' | 'info' | 'success' | 'warning';

const props = withDefaults(defineProps<{
  as?: 'div' | 'p';
  compact?: boolean;
  tone?: AlertTone;
}>(), {
  as: 'div',
  compact: false,
  tone: 'info',
});

const role = computed(() => props.tone === 'error' || props.tone === 'warning' ? 'alert' : 'status');
const live = computed(() => props.tone === 'error' ? 'assertive' : 'polite');
</script>
