<template>
  <DetailActionGroup
    :compact="compact"
    delete-title="text.1316a91ba454"
    :show-delete="canManage"
    @delete="emit('delete')"
    @share="emit('share')"
  >
    <template #primary>
      <DetailActionButton
        :active="announcement.currentUserLiked"
        :disabled="liking"
        :label="String(announcement.like_count)"
        :compact="compact"
        :title="announcement.currentUserLiked ? 'text.f4843575c10a' : 'text.48a72e6a669a'"
        :aria-label="announcement.currentUserLiked ? 'text.f4843575c10a' : 'text.48a72e6a669a'"
        @click="emit('toggleLike')"
      >
        <AppIcon name="thumbs-up" />
      </DetailActionButton>
    </template>
  </DetailActionGroup>
</template>

<script setup lang="ts">
import DetailActionButton from '@/components/ui/DetailActionButton.vue';
import DetailActionGroup from '@/components/ui/DetailActionGroup.vue';
import AppIcon from '@/components/ui/AppIcon.vue';
import type { AnnouncementRecord } from '@/types';

defineProps<{
  announcement: AnnouncementRecord;
  canManage: boolean;
  compact?: boolean;
  liking: boolean;
}>();

const emit = defineEmits<{
  delete: [];
  share: [];
  toggleLike: [];
}>();
</script>
