<template>
  <component
    :is="as"
    :class="[size === 'sm' ? 'tag-sm' : 'tag', { 'shadow-control': elevated }]"
  >
    <slot />
  </component>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  as?: 'div' | 'span';
  elevated?: boolean;
  size?: 'default' | 'sm';
}>(), {
  as: 'span',
  elevated: false,
  size: 'default',
});
</script>
