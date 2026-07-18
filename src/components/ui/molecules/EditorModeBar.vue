<template>
  <div class="editor-mode-bar">
    <span>{{ label }}</span>
    <AppButton variant="toolbar" class="gap-1 !min-h-0 !px-2 !py-0.5" @click="emit('action')">
      <AppIcon :name="actionIcon" :size="3" />
      <span>{{ actionLabel }}</span>
    </AppButton>
  </div>
</template>

<script setup lang="ts">
import AppButton from '@/components/ui/atoms/AppButton.vue';
import AppIcon from '@/components/ui/atoms/AppIcon.vue';

withDefaults(defineProps<{
  actionIcon?: 'edit';
  actionLabel: string;
  label: string;
}>(), {
  actionIcon: 'edit',
});

const emit = defineEmits<{
  action: [];
}>();
</script>
