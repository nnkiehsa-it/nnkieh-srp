<template>
  <section class="space-y-3">
    <SectionHeader :title="title" :description="description">
      <template #trailing>
        <AppButton type="button" variant="secondary" @click="emit('add')">
          {{ t('categoryAdmin.addCategory') }}
        </AppButton>
      </template>
    </SectionHeader>

    <div class="grid items-start gap-4 lg:grid-cols-[15rem_minmax(0,1fr)]">
      <SurfacePanel variant="list" padding="sm" class="space-y-1">
        <p class="px-2 pb-2 text-xs font-semibold text-ink-500">
          {{ t('adminCenter.categoryListCount', { count: model.length }) }}
        </p>
        <ListSurfaceRow
          v-for="(category, index) in model"
          :key="category.id || `new-${index}`"
          as="button"
          interactive
          class="w-full text-left"
          :class="selectedIndex === index ? 'button-toolbar--active' : ''"
          :aria-current="selectedIndex === index ? 'true' : undefined"
          @click="selectedIndex = index"
        >
          <span class="min-w-0 flex-1">
            <span class="block truncate text-sm font-semibold text-ink-900 dark:text-ink-100">
              {{ category.label || t('categoryAdmin.untitledCategory') }}
            </span>
            <span class="mt-0.5 block truncate text-xs text-ink-500">
              {{ category.id || t('adminCenter.notSavedYet') }}
            </span>
          </span>
        </ListSurfaceRow>
      </SurfacePanel>

      <CategoryEditorCard
        v-if="selectedCategory"
        v-model="model[selectedIndex]"
        flat
        :field-id="`setup-${kind}-${selectedIndex}`"
        :kind="kind"
        :removable="model.length > 1"
        @remove="removeSelected"
      />
    </div>
  </section>
</template>

<script setup lang="ts" generic="T extends IssueCategoryDraft | FacilityCategoryDraft">
import { computed, ref, watch } from 'vue';
import CategoryEditorCard from '@/components/categories/CategoryEditorCard.vue';
import AppButton from '@/components/ui/atoms/AppButton.vue';
import ListSurfaceRow from '@/components/ui/molecules/ListSurfaceRow.vue';
import SectionHeader from '@/components/ui/molecules/SectionHeader.vue';
import SurfacePanel from '@/components/ui/molecules/SurfacePanel.vue';
import { useI18n } from '@/i18n';
import type { FacilityCategoryDraft, IssueCategoryDraft } from '@/types/categories';

defineProps<{
  description: string;
  kind: 'facility' | 'issue';
  title: string;
}>();
const model = defineModel<T[]>({ required: true });
const emit = defineEmits<{ add: [] }>();
const { t } = useI18n();
const selectedIndex = ref(0);
const selectedCategory = computed(() => model.value[selectedIndex.value] ?? null);

watch(() => model.value.length, (length) => {
  if (selectedIndex.value >= length) selectedIndex.value = Math.max(0, length - 1);
});

function removeSelected() {
  if (model.value.length <= 1) return;
  model.value.splice(selectedIndex.value, 1);
}
</script>
