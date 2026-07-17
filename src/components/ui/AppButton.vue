<template>
  <button
    :type="type"
    :class="[variantClass, sizeClass, { 'w-full': block }]"
    :disabled="disabled"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';

type ButtonSize = 'sm' | 'md' | 'lg';
type ButtonVariant = 'contextual' | 'danger' | 'icon' | 'icon-filled' | 'primary' | 'secondary' | 'toolbar';

const props = withDefaults(defineProps<{
  block?: boolean;
  disabled?: boolean;
  size?: ButtonSize;
  type?: 'button' | 'reset' | 'submit';
  variant?: ButtonVariant;
}>(), {
  block: false,
  disabled: false,
  size: 'md',
  type: 'button',
  variant: 'secondary',
});

const variantClass = computed(() => ({
  contextual: 'button-contextual',
  danger: 'button-danger',
  icon: 'button-icon',
  'icon-filled': 'button-icon-filled',
  primary: 'button-primary',
  secondary: 'button-secondary',
  toolbar: 'button-toolbar',
})[props.variant]);

const sizeClass = computed(() => ({
  sm: props.variant === 'toolbar' ? 'h-8 min-h-8 text-xs' : 'h-9 min-h-9 text-xs',
  md: '',
  lg: 'min-h-12 px-5',
})[props.size]);
</script>
