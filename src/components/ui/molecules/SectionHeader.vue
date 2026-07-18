<template>
  <header class="flex items-start justify-between gap-4">
    <div class="min-w-0">
      <component :is="headingAs" class="text-base font-semibold tracking-[0.015em] text-ink-950 dark:text-ink-50">
        {{ title }}
      </component>
      <p v-if="description" class="mt-1 text-xs font-normal leading-5 text-ink-500 dark:text-ink-400">
        {{ description }}
      </p>
    </div>
    <slot name="trailing" />
  </header>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  description?: string;
  headingAs?: 'h2' | 'h3';
  title: string;
}>(), {
  description: '',
  headingAs: 'h2',
});
</script>
