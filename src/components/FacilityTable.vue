<template>
  <ContentCardCollection
    :empty="facilities.length === 0"
    empty-label="text.36dab298501f"
    list-label="text.2640ca8c10c8"
    :loading="loading"
  >
    <template #loading>
      <SkeletonTable :show-author="true" :is-admin="false" />
    </template>

    <FacilityTableRow
      v-for="facility in facilities"
      :key="facility.id"
      :facility="facility"
      :highlight-query="highlightQuery"
      :affecting="affectingFacilityId === facility.id"
      @open-details="emit('open-details', $event)"
      @toggle-affected="emit('toggle-affected', $event)"
      @manage-status="emit('manage-status', $event)"
      @delete="emit('delete', $event)"
    />
  </ContentCardCollection>
</template>

<script setup lang="ts">
import FacilityTableRow from '@/components/FacilityTableRow.vue';
import ContentCardCollection from '@/components/ui/ContentCardCollection.vue';
import SkeletonTable from '@/components/ui/SkeletonTable.vue';
import type { FacilitySummary } from '@/types';

withDefaults(defineProps<{
  affectingFacilityId?: string;
  facilities: FacilitySummary[];
  loading: boolean;
  highlightQuery?: string;
}>(), {
  affectingFacilityId: '',
  highlightQuery: '',
});
const emit = defineEmits<{
  'open-details': [facility: FacilitySummary];
  'toggle-affected': [facility: FacilitySummary];
  'manage-status': [facility: FacilitySummary];
  delete: [facility: FacilitySummary];
}>();
</script>
