<template>
  <component :is="as" class="viewport-frame" :class="{ 'viewport-content': content }">
    <slot />
  </component>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  as?: 'div' | 'header' | 'main' | 'section';
  content?: boolean;
}>(), {
  as: 'div',
  content: false,
});
</script>
