<template>
  <ListSurfaceRow :as="as" :interactive="interactive" class="gap-3">
    <span class="flex min-w-0 flex-1 items-center gap-3">
      <span class="flex h-9 w-9 shrink-0 items-center justify-center text-ink-500 dark:text-ink-300">
        <AppIcon :name="icon" :size="4" :stroke-width="2" />
      </span>
      <span class="min-w-0">
        <span class="block text-sm font-semibold text-ink-900 dark:text-ink-100">{{ label }}</span>
        <span v-if="description" class="mt-0.5 block text-xs leading-5 text-ink-500 dark:text-ink-400">
          {{ description }}
        </span>
      </span>
    </span>
    <slot name="trailing">
      <AppIcon name="chevron-right" :size="4" class="shrink-0 text-ink-400" :stroke-width="2.2" />
    </slot>
  </ListSurfaceRow>
</template>

<script setup lang="ts">
import type { Component } from 'vue';
import AppIcon, { type AppIconName } from '@/components/ui/atoms/AppIcon.vue';
import ListSurfaceRow from '@/components/ui/molecules/ListSurfaceRow.vue';

withDefaults(defineProps<{
  as?: 'a' | 'button' | 'div' | Component;
  description?: string;
  icon: AppIconName;
  interactive?: boolean;
  label: string;
}>(), {
  as: 'button',
  description: '',
  interactive: true,
});
</script>
