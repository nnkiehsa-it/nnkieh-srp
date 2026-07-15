<template>
  <section class="relative mx-auto flex h-full min-h-0 w-full max-w-7xl flex-col gap-5">
    <BoardControls
      v-model:status-tab="bucket"
      v-model:search-query="query"
      v-model:sort-option="sort"
      v-model:facility-status="status"
      mode="facility"
      active-filter=""
      active-category-label="設備"
      :search-hint="searchHint"
    />

    <div class="scrollbar-none min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain pb-4">
      <PageLoadFailure
        v-if="error && facilities.length === 0"
        title="設備讀取失敗"
        :description="error"
        @retry="load()"
      />
      <EmptyStatePanel
        v-else-if="!loading && facilities.length === 0"
        title="沒有符合條件的設備"
        :description="emptyDescription"
        icon="inbox"
      />
      <template v-else>
        <FacilityTable
          :facilities="facilities"
          :loading="loading"
          :highlight-query="query"
          @open-details="openDetails"
          @toggle-affected="toggleAffected"
        />
        <div v-if="error" class="rounded-xl border border-error/20 bg-error-container px-4 py-3 text-sm font-semibold text-on-error-container">{{ error }}</div>
        <FeedLoadMoreControl :has-more="hasMore" :loading="loadingMore" :error="Boolean(error)" @load-more="load(true)" />
      </template>
    </div>

    <FacilityComposer :open="composerOpen" @close="composerOpen = false" @submitted="handleSubmitted" />
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import BoardControls from '@/components/BoardControls.vue';
import FacilityComposer from '@/components/FacilityComposer.vue';
import FacilityTable from '@/components/FacilityTable.vue';
import EmptyStatePanel from '@/components/ui/EmptyStatePanel.vue';
import FeedLoadMoreControl from '@/components/ui/FeedLoadMoreControl.vue';
import PageLoadFailure from '@/components/ui/PageLoadFailure.vue';
import { useFacilities } from '@/composables/useFacilities';
import { CREATE_ENTRY_QUERY_KEY, CREATE_FACILITY_QUERY_VALUE, registerCreateFacilityHandler } from '@/composables/useCreateEntryActions';
import type { FacilityRecord, FacilitySummary } from '@/types';

const route = useRoute();
const router = useRouter();
const composerOpen = ref(false);
const { bucket, error, facilities, hasMore, load, loading, loadingMore, query, sort, status, toggleAffected } = useFacilities();
const searchHint = computed(() => query.value.trim() ? `正在搜尋「${query.value.trim()}」` : '可搜尋設備標題或地點。');
const emptyDescription = computed(() => query.value.trim()
  ? `沒有找到與「${query.value.trim()}」相關的設備。`
  : `目前沒有${bucket.value === 'closed' ? '已結案' : '處理中'}設備。`);

registerCreateFacilityHandler(() => { composerOpen.value = true; });
watch(() => route.query[CREATE_ENTRY_QUERY_KEY], (value) => {
  if (value !== CREATE_FACILITY_QUERY_VALUE) return;
  composerOpen.value = true;
  const nextQuery = { ...route.query };
  delete nextQuery[CREATE_ENTRY_QUERY_KEY];
  void router.replace({ query: nextQuery });
}, { immediate: true });

function openDetails(facility: FacilitySummary) {
  void router.push({ name: 'facility-detail', params: { facilityId: facility.id } });
}

function handleSubmitted(facility: FacilityRecord) {
  facilities.value.unshift(facility);
}
</script>
