<template>
  <div class="issue-card-grid" :aria-label="t(loadingLabel)" aria-busy="true">
    <SurfacePanel
      v-for="index in CARD_COUNT"
      :key="index"
      as="article"
      class="issue-card skeleton-card"
      :style="{ '--skeleton-card-index': index - 1 }"
    >
      <header class="flex min-w-0 items-center gap-2">
        <span class="skeleton-block h-5 w-14 shrink-0 rounded-full"></span>
        <span class="skeleton-block ml-auto h-3 w-20 rounded"></span>
        <span v-if="showAdmin" class="skeleton-block h-8 w-8 shrink-0 rounded-full"></span>
      </header>

      <div class="mt-3 flex min-w-0 items-center gap-2.5">
        <span v-if="showAuthor" class="skeleton-block h-8 w-8 shrink-0 rounded-full"></span>
        <div class="min-w-0 flex-1 space-y-2">
          <span class="skeleton-block block h-4 w-4/5 rounded"></span>
          <span v-if="showAuthor" class="skeleton-block block h-3 w-2/5 rounded"></span>
        </div>
      </div>

      <div v-if="supplement !== 'none'" class="mt-4 rounded-xl bg-ink-50/85 px-3 py-2.5 dark:bg-ink-900/55">
        <template v-if="supplement === 'progress'">
          <div class="flex items-center justify-between gap-3">
            <span class="skeleton-block h-3 w-24 rounded"></span>
            <span class="skeleton-block h-3 w-14 rounded"></span>
          </div>
          <span class="skeleton-block mt-2 block h-1.5 w-full rounded-full"></span>
        </template>
        <div v-else class="flex items-center justify-between gap-3">
          <span class="skeleton-block h-3 w-2/5 rounded"></span>
          <span class="skeleton-block h-3 w-20 rounded"></span>
        </div>
      </div>

      <footer v-if="actionShapes.length" class="mt-3 flex items-center justify-end gap-1.5">
        <span
          v-for="(shape, actionIndex) in actionShapes"
          :key="`${shape}-${actionIndex}`"
          class="skeleton-block h-8 rounded-full"
          :class="shape === 'icon' ? 'w-8' : 'w-12'"
        ></span>
      </footer>
    </SurfacePanel>
  </div>
</template>

<script setup lang="ts">
import SurfacePanel from '@/components/ui/SurfacePanel.vue';
import { useI18n } from '@/i18n';

type SkeletonActionShape = 'icon' | 'pill';
type SkeletonSupplement = 'none' | 'progress' | 'summary';

const CARD_COUNT = 2;

withDefaults(defineProps<{
  actionShapes?: readonly SkeletonActionShape[];
  loadingLabel: string;
  showAdmin?: boolean;
  showAuthor?: boolean;
  supplement?: SkeletonSupplement;
}>(), {
  actionShapes: () => [],
  showAdmin: false,
  showAuthor: true,
  supplement: 'none',
});

const { t } = useI18n();
</script>
