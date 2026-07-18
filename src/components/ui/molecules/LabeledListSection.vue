<template>
  <section :aria-label="label">
    <p class="list-section-label">{{ label }}</p>
    <SurfacePanel variant="list">
      <slot />
    </SurfacePanel>
  </section>
</template>

<script setup lang="ts">
import SurfacePanel from '@/components/ui/molecules/SurfacePanel.vue';

defineProps<{
  label: string;
}>();
</script>
