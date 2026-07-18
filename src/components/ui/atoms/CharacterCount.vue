<template>
  <span class="font-medium tabular-nums" :class="{ 'text-error': current > warningAt }">
    {{ current }} / {{ max }}
  </span>
</template>

<script setup lang="ts">
defineProps<{
  current: number;
  max: number;
  warningAt: number;
}>();
</script>
