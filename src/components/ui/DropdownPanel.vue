<template>
  <div class="dropdown-panel" :class="sizeClass">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(defineProps<{
  size?: 'compact' | 'default' | 'search';
}>(), {
  size: 'default',
});

const sizeClass = computed(() => ({
  compact: 'w-44',
  default: 'min-w-44',
  search: 'w-80 max-w-[calc(100vw-2rem)] p-3.5',
})[props.size]);
</script>
