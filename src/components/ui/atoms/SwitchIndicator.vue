<template>
  <span
    class="switch-indicator"
    :class="{ 'switch-indicator--checked': checked }"
    role="switch"
    :aria-checked="checked"
    :aria-disabled="disabled || undefined"
    :aria-label="label"
  >
    <span class="switch-indicator__thumb"></span>
  </span>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  checked: boolean;
  disabled?: boolean;
  label: string;
}>(), {
  disabled: false,
});
</script>
