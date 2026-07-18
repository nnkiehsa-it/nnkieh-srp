<template>
  <component
    :is="as"
    class="inline-message"
    :class="[`inline-message--${tone}`, `inline-message--${size}`]"
    :role="role"
    :aria-live="live"
  >
    <slot />
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue';

type MessageTone = 'error' | 'muted' | 'success' | 'warning';

const props = withDefaults(defineProps<{
  as?: 'div' | 'p' | 'span';
  size?: 'sm' | 'xs';
  tone?: MessageTone;
}>(), {
  as: 'p',
  size: 'xs',
  tone: 'error',
});

const role = computed(() => props.tone === 'error' || props.tone === 'warning' ? 'alert' : 'status');
const live = computed(() => props.tone === 'error' ? 'assertive' : 'polite');
</script>
