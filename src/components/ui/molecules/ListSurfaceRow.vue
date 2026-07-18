<template>
  <component
    :is="as"
    class="list-surface-row"
    :class="{ 'list-surface-row--interactive': interactive }"
    :type="as === 'button' ? type : undefined"
  >
    <slot />
  </component>
</template>

<script setup lang="ts">
import type { Component } from 'vue';

withDefaults(defineProps<{
  as?: 'a' | 'button' | 'div' | Component;
  interactive?: boolean;
  type?: 'button' | 'reset' | 'submit';
}>(), {
  as: 'button',
  interactive: false,
  type: 'button',
});
</script>
