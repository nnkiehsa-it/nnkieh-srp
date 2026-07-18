<template>
  <component :is="as" class="skeleton-block" aria-hidden="true">
    <slot />
  </component>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    as?: "div" | "span";
  }>(),
  {
    as: "span",
  },
);
</script>
