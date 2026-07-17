<template>
  <section class="route-page space-y-5">
    <div class="flex items-center justify-end gap-3 md:justify-between">
      <h2 class="hidden shrink-0 text-2xl font-semibold tracking-[0.015em] text-ink-950 dark:text-ink-50 md:block">{{ t('text.3f9569532847') }}</h2>
      <button
        v-if="isAdmin"
        type="button"
        class="button-contextual h-8 w-8 min-w-8 shrink-0 p-0"
        :aria-label="t('text.e9cf7e935c45')"
        :title="t('text.e9cf7e935c45')"
        @click="openComposer"
      >
        <AppIcon name="plus" :size="4" />
      </button>
    </div>

    <ContentListState
      :empty="announcements.length === 0"
      empty-description="text.0e2feb058100"
      empty-icon="chart"
      empty-title="text.ed642d8a7837"
      :error="error"
      error-title="text.865ab62b6ac2"
      :has-more="hasMore"
      :loading="visibleAnnouncementLoading"
      :loading-has-problem="announcementLoadingHasProblem"
      :loading-more="loadingMore"
      :panel-key="announcementPanelKey"
      :problem-description="announcementProblemDescription"
      :problem-title="announcementProblemTitle"
      :retry-disabled="!announcementOnline"
      spacing-class="space-y-3"
      :unavailable="!isAllowedUser"
      unavailable-description="text.4feee24a57f9"
      unavailable-title="text.928ccceeceec"
      @load-more="loadMoreAnnouncements"
      @retry="retryAnnouncements"
    >
      <template #loading>
        <SkeletonAnnouncementList :can-manage="isAdmin" />
      </template>

      <AnnouncementTable
        :announcements="announcements"
        :can-manage="isAdmin"
        :liking-announcement-id="likingAnnouncementId"
        @delete="handleListDelete"
        @open="openAnnouncementDetails"
        @open-comments="(announcement) => openAnnouncementDetails(announcement, 'comments')"
        @toggle-like="handleToggleLike"
      />

      <template #sentinel>
        <div ref="loadMoreSentinel" class="h-1" aria-hidden="true"></div>
      </template>
    </ContentListState>

    <AnnouncementComposerDialog
      :error="composerError"
      :open="composerOpen"
      :submitting="saving"
      @close="closeComposer"
      @save="publishAnnouncement"
    />

    <ConfirmDialog
      :open="Boolean(deletePendingAnnouncement)"
      title="text.06c04e55b00b"
      message="text.1beff74e806c"
      confirm-label="text.1d63b95811eb"
      :busy="deleting"
      @cancel="closeDeleteDialog"
      @confirm="confirmDelete"
    />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import AnnouncementComposerDialog from '@/components/AnnouncementComposerDialog.vue';
import AnnouncementTable from '@/components/AnnouncementTable.vue';
import ConfirmDialog from '@/components/ConfirmDialog.vue';
import AppIcon from '@/components/ui/AppIcon.vue';
import ContentListState from '@/components/ui/ContentListState.vue';
import SkeletonAnnouncementList from '@/components/ui/SkeletonAnnouncementList.vue';
import { useAnnouncementManagement } from '@/composables/useAnnouncementManagement';
import { useContentListRuntime } from '@/composables/useContentListRuntime';
import { useI18n } from '@/i18n';

const {
  announcements,
  loading,
  loadingMore,
  error,
  hasMore,
  loadMoreAnnouncements,
  refreshAnnouncements,
  composerError,
  composerOpen,
  likingAnnouncementId,
  saving,
  deleting,
  deletePendingAnnouncement,
  sessionLoading,
  isAdmin,
  isAllowedUser,
  openAnnouncementDetails,
  openComposer,
  closeComposer,
  publishAnnouncement,
  handleListDelete,
  closeDeleteDialog,
  confirmDelete,
  handleToggleLike,
} = useAnnouncementManagement();

const { t } = useI18n();
const rawAnnouncementLoading = computed(() => sessionLoading.value || loading.value);
const announcementPanelKey = 'announcements';
const {
  isOnline: announcementOnline,
  loadMoreSentinel,
  loadingHasProblem: announcementLoadingHasProblem,
  problemDescription: announcementProblemDescription,
  problemTitle: announcementProblemTitle,
  retry: retryAnnouncements,
  visibleLoading: visibleAnnouncementLoading,
} = useContentListRuntime({
  canLoad: isAllowedUser,
  error,
  hasMore,
  loadMore: loadMoreAnnouncements,
  loading: rawAnnouncementLoading,
  loadingMore,
  refresh: refreshAnnouncements,
  refreshFeedback: {
    error: 'text.a5226452666e',
    loading: 'text.82410863c281',
    success: 'text.a31f733e2c84',
  },
});
</script>
