<template>
  <component
    :is="as"
    class="editor-surface"
    :class="[`editor-surface--${tone}`, { 'editor-surface--elevated': elevated }]"
  >
    <slot />
  </component>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    as?: "div" | "section";
    elevated?: boolean;
    tone?: "muted" | "surface";
  }>(),
  {
    as: "div",
    elevated: false,
    tone: "surface",
  },
);
</script>
