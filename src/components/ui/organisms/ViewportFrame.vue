<template>
  <component :is="as" class="viewport-frame">
    <slot />
  </component>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  as?: 'div' | 'header' | 'main' | 'section';
}>(), {
  as: 'div',
});
</script>
