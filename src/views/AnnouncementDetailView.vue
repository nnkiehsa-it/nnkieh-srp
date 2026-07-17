<template>
  <div class="min-h-0">
    <DetailRouteState
      :allowed="isAllowedUser"
      :loading="sessionLoading || loading"
      loading-label="text.f7cc9db84484"
      :problem="sessionLoadingHasProblem"
      :problem-title="sessionProblemTitle"
      :problem-description="sessionProblemDescription"
      :problem-retry-disabled="!sessionOnline"
      @retry-problem="reloadPage"
    >
      <AnnouncementDetailPagePanel
        v-if="announcement"
        :announcement="announcement"
        :can-manage="isAdmin"
        :initial-tab="initialTab"
        :focus-comment-id="focusCommentId"
        :liking="liking"
        @back="goBack"
        @content-unavailable="goBack"
        @delete="openDeleteDialog"
        @share="copyUrl"
        @toggle-like="toggleLike"
        @comment-count-changed="updateCommentCount"
      />
    </DetailRouteState>

    <ConfirmDialog
      :open="deleteDialogOpen"
      title="text.06c04e55b00b"
      message="text.1beff74e806c"
      confirm-label="text.1d63b95811eb"
      :busy="deleting"
      @cancel="closeDeleteDialog"
      @confirm="confirmDelete"
    />
  </div>
</template>

<script setup lang="ts">
import AnnouncementDetailPagePanel from '@/components/AnnouncementDetailPagePanel.vue';
import ConfirmDialog from '@/components/ConfirmDialog.vue';
import DetailRouteState from '@/components/ui/DetailRouteState.vue';
import { useAnnouncementDetail } from '@/composables/useAnnouncementDetail';
import { useAuthenticatedDetailState } from '@/composables/useAuthenticatedDetailState';
import { resetAppConnection } from '@/lib/reconnect';
const {
  canLoad: canLoadAnnouncement,
  isAllowedUser,
  sessionLoading,
  sessionLoadingHasProblem,
  sessionOnline,
  sessionProblemDescription,
  sessionProblemTitle,
} = useAuthenticatedDetailState();
const {
  announcement,
  closeDeleteDialog,
  confirmDelete,
  copyUrl,
  deleteDialogOpen,
  deleting,
  focusCommentId,
  goBack,
  initialTab,
  isAdmin,
  liking,
  loading,
  openDeleteDialog,
  toggleLike,
  updateCommentCount,
} = useAnnouncementDetail(canLoadAnnouncement);

async function reloadPage() {
  await resetAppConnection();
  window.location.reload();
}
</script>
