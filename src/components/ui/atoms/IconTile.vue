<template>
  <component
    :is="as"
    class="icon-tile"
    :class="[
      `icon-tile--${size}`,
      `icon-tile--${tone}`,
      elevation === 'none' ? '' : `icon-tile--elevation-${elevation}`,
    ]"
  >
    <slot />
  </component>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  as?: 'div' | 'span';
  elevation?: 'card' | 'control' | 'none';
  size?: 'lg' | 'md' | 'xl';
  tone?: 'danger' | 'info' | 'inverse' | 'neutral' | 'surface' | 'warning';
}>(), {
  as: 'span',
  elevation: 'control',
  size: 'md',
  tone: 'neutral',
});
</script>
