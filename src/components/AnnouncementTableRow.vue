<template>
  <ContentCardShell
    :author-name="announcement.author_name"
    :author-photo-url="announcement.author_photo_url"
    :author-uid="announcement.author_uid"
    status-class="bg-ink-100/70 text-ink-700 dark:bg-ink-800 dark:text-ink-300"
    status-label="text.3f9569532847"
    :time-label="dateLabel"
    :title="announcement.title"
    @open="emit('open', announcement)"
  >
    <template v-if="canManage" #admin>
      <CompactActionMenu title="text.4b2d0f9ab93a" @delete="emit('delete', announcement)" />
    </template>

    <template #actions>
      <button
        type="button"
        class="button-toolbar h-8 w-8 rounded-full p-0"
        :title="t('text.888828602ebd')"
        :aria-label="t('text.888828602ebd')"
        @click.stop="emit('openComments', announcement)"
      >
        <AppIcon name="comment" />
      </button>
      <button
        type="button"
        :class="[
          announcement.currentUserLiked ? 'button-icon-pill-filled' : 'button-icon-pill',
          '!h-8 !gap-1 !px-2.5 text-xs',
        ]"
        :disabled="liking"
        :title="t(announcement.currentUserLiked ? 'text.f4843575c10a' : 'text.fdc799ca76ed')"
        :aria-label="t(announcement.currentUserLiked ? 'text.f4843575c10a' : 'text.fdc799ca76ed')"
        @click.stop="emit('toggleLike', announcement)"
      >
        <AppIcon name="thumbs-up" />
        <span class="text-sm font-semibold leading-none tabular-nums">{{ announcement.like_count }}</span>
      </button>
    </template>
  </ContentCardShell>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { AnnouncementRecord } from '@/types';
import CompactActionMenu from '@/components/CompactActionMenu.vue';
import AppIcon from '@/components/ui/AppIcon.vue';
import ContentCardShell from '@/components/ui/ContentCardShell.vue';
import { formatDateOnly } from '@/lib/format';
import { useI18n } from '@/i18n';

const props = defineProps<{
  announcement: AnnouncementRecord;
  canManage?: boolean;
  liking?: boolean;
}>();
const { t } = useI18n();

const emit = defineEmits<{
  delete: [announcement: AnnouncementRecord];
  open: [announcement: AnnouncementRecord];
  openComments: [announcement: AnnouncementRecord];
  toggleLike: [announcement: AnnouncementRecord];
}>();

const dateLabel = computed(() => formatDateOnly(props.announcement.published_at));
</script>
