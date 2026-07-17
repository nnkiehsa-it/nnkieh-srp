<template>
  <component
    :is="as"
    :class="[surfaceClass, paddingClass, { 'surface-card--interactive': interactive }]"
  >
    <slot />
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue';

type SurfacePadding = 'none' | 'sm' | 'md' | 'lg';
type SurfaceVariant = 'card' | 'control' | 'floating' | 'inset' | 'list';

const props = withDefaults(defineProps<{
  as?: 'article' | 'div' | 'section';
  interactive?: boolean;
  padding?: SurfacePadding;
  variant?: SurfaceVariant;
}>(), {
  as: 'div',
  interactive: false,
  padding: 'none',
  variant: 'card',
});

const surfaceClass = computed(() => ({
  card: 'surface-card',
  control: 'surface-control',
  floating: 'surface-floating',
  inset: 'surface-inset',
  list: 'list-surface',
})[props.variant]);

const paddingClass = computed(() => ({
  none: '',
  sm: 'surface-pad-sm',
  md: 'surface-pad-md',
  lg: 'surface-pad-lg',
})[props.padding]);
</script>
