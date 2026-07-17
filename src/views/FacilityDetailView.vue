<template>
  <div class="min-h-0">
    <DetailRouteState
      :allowed="isAllowedUser"
      :loading="sessionLoading || loading"
      loading-label="text.33bd01546f0c"
      :problem="sessionLoadingHasProblem"
      :problem-title="sessionProblemTitle"
      :problem-description="sessionProblemDescription"
      :problem-retry-disabled="!sessionOnline"
      :error="error"
      error-title="text.a4a8f255b50c"
      @retry-problem="reloadPage"
      @retry-error="retryFacility"
    >
      <FacilityDetailPagePanel
        v-if="facility"
        :affecting="affecting"
        :closed="closed"
        :facility="facility"
        :next-status-action-label="nextStatusActionLabel"
        :operation-time-items="operationTimeItems"
        :status-class="statusClass"
        :status-label="t(FACILITY_STATUS_LABELS[facility.status])"
        @back="goBackToFacilities"
        @delete="openDeleteDialog"
        @manage-status="statusOpen = true"
        @share="copyFacilityUrl"
        @toggle-affected="handleToggleAffected"
      />
    </DetailRouteState>

    <FacilityStatusDialog
      v-if="facility"
      :open="statusOpen"
      :current-status="facility.status"
      :saving="statusSaving"
      :error="statusError"
      @close="closeStatusDialog"
      @submit="submitStatus"
    />

    <ConfirmDialog
      :open="deleteDialogOpen"
      title="text.6a09e03ffa6a"
      message="text.97ac026665a6"
      confirm-label="text.1d63b95811eb"
      :busy="deleting"
      @cancel="closeDeleteDialog"
      @confirm="confirmDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import ConfirmDialog from '@/components/ConfirmDialog.vue';
import FacilityDetailPagePanel from '@/components/FacilityDetailPagePanel.vue';
import FacilityStatusDialog from '@/components/FacilityStatusDialog.vue';
import DetailRouteState from '@/components/ui/DetailRouteState.vue';
import { useActionFeedback } from '@/composables/useActionFeedback';
import { useAuthenticatedDetailState } from '@/composables/useAuthenticatedDetailState';
import { useFacilityDetail } from '@/composables/useFacilityDetail';
import { useShareUrl } from '@/composables/useShareUrl';
import { useStatusStyling } from '@/composables/useStatusStyling';
import { FACILITY_STATUS_LABELS, isFacilityClosed } from '@/constants/statuses';
import { useI18n } from '@/i18n';
import { formatDate } from '@/lib/format';
import { resetAppConnection } from '@/lib/reconnect';
import type { FacilityStatus, OperationTimeListItem } from '@/types';

const router = useRouter();
const {
  canLoad: canLoadFacility,
  isAllowedUser,
  sessionLoading,
  sessionLoadingHasProblem,
  sessionOnline,
  sessionProblemDescription,
  sessionProblemTitle,
} = useAuthenticatedDetailState();
const { copyRouteUrl } = useShareUrl();
const { show, start } = useActionFeedback();
const { t } = useI18n();

const {
  affecting,
  changeStatus,
  error,
  facility,
  load,
  loading,
  remove,
  toggleAffected,
} = useFacilityDetail(canLoadFacility);

const statusOpen = ref(false);
const statusSaving = ref(false);
const statusError = ref('');
const deleteDialogOpen = ref(false);
const deleting = ref(false);
const closed = computed(() => facility.value ? isFacilityClosed(facility.value.status) : false);
const nextStatusActionLabel = computed(() =>
  facility.value?.status === 'pending' ? 'text.fe9a26f3f1a6' : 'text.e6206856f534',
);
const operationTimeItems = computed<OperationTimeListItem[]>(() => {
  if (!facility.value) return [];
  const items: OperationTimeListItem[] = [];
  if (facility.value.created_at) {
    items.push({
      label: 'text.7a149ac0b37c',
      shortLabel: 'text.11ba133668d8',
      valueLabel: formatDate(facility.value.created_at),
    });
  }
  if (facility.value.started_at) {
    items.push({
      label: 'text.e4e4bfef2b0e',
      shortLabel: 'text.fda275e0bcc3',
      valueLabel: formatDate(facility.value.started_at),
    });
  }
  if (facility.value.closed_at) {
    const unable = facility.value.status === 'unable-to-handle';
    items.push({
      label: unable ? 'text.ed8904acabca' : 'text.96cd624b9223',
      shortLabel: unable ? 'text.900950604945' : 'text.33246f6a5e5b',
      valueLabel: formatDate(facility.value.closed_at),
    });
  }
  return items;
});
const status = computed(() => facility.value?.status ?? 'pending');
const { statusClass } = useStatusStyling(status, 'dialog');

function goBackToFacilities() {
  void router.replace({ name: 'facilities' });
}

function copyFacilityUrl() {
  if (!facility.value) return;
  void copyRouteUrl({
    name: 'facility-detail',
    params: { facilityId: facility.value.id },
  });
}

async function handleToggleAffected() {
  try {
    await toggleAffected();
  } catch (caught) {
    show(caught instanceof Error ? caught.message : 'text.d624cbb8862d', 'error');
  }
}

function closeStatusDialog() {
  if (!statusSaving.value) {
    statusOpen.value = false;
    statusError.value = '';
  }
}

async function submitStatus(nextStatus: FacilityStatus, result: string) {
  if (statusSaving.value) return;
  statusSaving.value = true;
  statusError.value = '';
  const feedback = start('text.25575ef1477d');
  try {
    await changeStatus(nextStatus, result);
    statusOpen.value = false;
    feedback.succeed('text.b4b0f8ae9dca');
  } catch (caught) {
    statusError.value = caught instanceof Error ? caught.message : 'text.e45a87db77dc';
    feedback.fail(statusError.value);
  } finally {
    statusSaving.value = false;
  }
}

function openDeleteDialog() {
  deleteDialogOpen.value = true;
}

function closeDeleteDialog() {
  if (!deleting.value) deleteDialogOpen.value = false;
}

async function confirmDelete() {
  if (!facility.value || deleting.value) return;
  deleting.value = true;
  const feedback = start('text.6dc42c349e2a');
  try {
    await remove();
    deleteDialogOpen.value = false;
    feedback.succeed('text.43d22c84476a');
    goBackToFacilities();
  } catch (caught) {
    feedback.fail(caught instanceof Error ? caught.message : 'text.eef3c65bda12');
  } finally {
    deleting.value = false;
  }
}

async function retryFacility() {
  await resetAppConnection();
  await load();
}

async function reloadPage() {
  await resetAppConnection();
  window.location.reload();
}
</script>
