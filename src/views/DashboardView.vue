<template>
  <RoutePageFrame bottom-safe padding="compact" class="space-y-5">
    <PageLoadFailure
      v-if="dashboardLoadingHasProblem"
      :title="dashboardProblemTitle"
      :description="dashboardProblemDescription"
      :retry-disabled="!dashboardOnline"
      @retry="retryDashboard"
    />

    <SkeletonDashboard v-else-if="sessionLoading || loading" />

    <EmptyStatePanel
      v-else-if="!isAdmin"
      title="dashboard.unableToViewDashboard"
      description="dashboard.thisPageIsForAdministratorsOnly"
      icon="lock"
    />

    <EmptyStatePanel
      v-else-if="error"
      title="dashboard.statisticsReadFailed"
      :description="error"
      icon="warning"
      tone="danger"
      action-label="dashboard.refresh"
      @action="retryDashboard"
    />

    <div v-else-if="stats && operations" class="space-y-5">
      <header class="pb-2">
        <div class="min-w-0">
          <h2 class="hidden text-2xl font-semibold tracking-[0.015em] text-ink-950 dark:text-ink-50 md:block sm:text-3xl">{{ t('dashboard.statistics') }}</h2>
          <p class="max-w-2xl text-sm leading-6 text-ink-500 dark:text-ink-400 md:mt-2">
            {{ t('dashboard.operationsStatusSummary') }}
          </p>
        </div>
      </header>

      <section class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SurfacePanel
          v-for="item in operationSummaryCards"
          :key="item.label"
          as="article"
          padding="lg"
          :class="item.toneClass"
        >
          <p class="text-xs font-semibold text-current/65">{{ t(item.label) }}</p>
          <p class="mt-3 text-2xl font-semibold tabular-nums tracking-[0.01em] text-current">{{ item.value }}</p>
          <p class="mt-2 text-xs font-medium leading-5 text-current/70">{{ t(item.caption) }}</p>
        </SurfacePanel>
      </section>

      <section class="grid gap-5 xl:grid-cols-[minmax(0,1.25fr)_minmax(22rem,0.75fr)]">
        <div class="grid gap-5">
          <SurfacePanel as="section" padding="lg">
            <SectionHeader
              heading-as="h3"
              :title="t('dashboard.maintenanceStatus')"
              :description="t('dashboard.operationsOverviewHelp')"
            >
              <template #trailing>
                <span class="dashboard-total">{{ t(operationsStatus.label) }}</span>
              </template>
            </SectionHeader>
            <SurfacePanel variant="inset" class="mt-4 divide-y divide-ink-200/35 overflow-hidden dark:divide-ink-700/30">
              <div
                v-for="row in operationRows"
                :key="row.label"
                class="grid gap-3 px-4 py-3 sm:grid-cols-[minmax(9rem,0.9fr)_minmax(0,1.2fr)_auto]"
              >
                <div class="min-w-0">
                  <p class="truncate text-sm font-bold text-ink-900 dark:text-ink-100">{{ t(row.label) }}</p>
                  <p class="mt-1 text-xs font-medium text-ink-400 dark:text-ink-500">{{ t(row.detail) }}</p>
                </div>
                <p class="text-sm font-semibold tabular-nums text-ink-700 dark:text-ink-200">{{ row.value }}</p>
                <p class="text-left text-xs font-bold sm:text-right" :class="row.toneClass">{{ t(row.statusLabel) }}</p>
              </div>
            </SurfacePanel>
          </SurfacePanel>

          <SurfacePanel as="section" padding="lg">
            <SectionHeader
              heading-as="h3"
              :title="t('dashboard.categoryUsageOverview')"
              :description="t('dashboard.categoryDistributionHelp')"
            >
              <template #trailing>
                <span class="dashboard-total">{{ t('dashboard.countItems', { count: stats.total_issues_created + stats.total_comments_created }) }}</span>
              </template>
            </SectionHeader>
            <SurfacePanel variant="inset" class="mt-4 overflow-hidden">
              <div class="grid grid-cols-[1fr_5rem_5rem_4rem] gap-3 border-b border-ink-200/35 px-4 py-2.5 text-xs font-semibold tracking-[0.02em] text-ink-500 dark:border-ink-700/30 dark:text-ink-400">
                <span>{{ t('dashboard.category') }}</span>
                <span class="text-right">{{ t('issue.proposal') }}</span>
                <span class="text-right">{{ t('dashboard.comment') }}</span>
                <span class="text-right">{{ t('dashboard.proportion') }}</span>
              </div>
              <div
                v-for="row in categoryComparisonRows"
                :key="row.label"
                class="grid grid-cols-[1fr_5rem_5rem_4rem] items-center gap-3 border-b border-ink-200/30 px-4 py-3.5 last:border-b-0 dark:border-ink-700/25"
              >
                <div class="min-w-0">
                  <p class="truncate text-sm font-bold text-ink-900 dark:text-ink-100">{{ t(row.label) }}</p>
                  <div class="mt-2 h-1.5 overflow-hidden rounded-full bg-ink-100 dark:bg-ink-800">
                    <div class="h-full rounded-full" :class="row.barClass" :style="{ width: `${row.percent}%` }"></div>
                  </div>
                </div>
                <p class="text-right text-sm font-bold tabular-nums text-ink-950 dark:text-ink-50">{{ row.issues }}</p>
                <p class="text-right text-sm font-bold tabular-nums text-ink-950 dark:text-ink-50">{{ row.comments }}</p>
                <p class="text-right text-xs font-semibold tabular-nums text-ink-400 dark:text-ink-500">{{ row.percentLabel }}</p>
              </div>
            </SurfacePanel>
          </SurfacePanel>
        </div>

        <aside class="grid gap-5">
          <SurfacePanel as="section" padding="lg">
            <SectionHeader
              heading-as="h3"
              :title="t('dashboard.platformAchievements')"
              :description="t('dashboard.anOverallSummaryOfPlatformUsage')"
            />
            <div class="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <SurfacePanel
                v-for="item in heroStats"
                :key="item.label"
                variant="inset"
                padding="md"
              >
                <div class="flex items-center justify-between gap-3">
                  <p class="text-sm font-semibold text-ink-600 dark:text-ink-300">{{ t(item.label) }}</p>
                  <span class="text-xs font-bold text-ink-400 dark:text-ink-500">{{ t(item.caption) }}</span>
                </div>
                <p class="mt-2 text-2xl font-bold tabular-nums text-ink-950 dark:text-ink-50">{{ item.value }}</p>
              </SurfacePanel>
            </div>
          </SurfacePanel>

          <SurfacePanel as="section" padding="lg">
            <SectionHeader
              heading-as="h3"
              :title="t('dashboard.recentIssues')"
              :description="t('dashboard.failureTrackingCodeHelp')"
            />
            <div v-if="recentFailureRows.length > 0" class="mt-4 space-y-3">
              <SurfacePanel
                v-for="failure in recentFailureRows"
                :key="`${failure.source}-${failure.id}`"
                variant="inset"
                padding="md"
              >
                <div class="flex items-start justify-between gap-3">
                  <p class="text-sm font-bold text-ink-900 dark:text-ink-100">{{ failure.sourceLabel }}</p>
                  <p class="text-xs font-semibold text-ink-400 dark:text-ink-500">{{ failure.updatedLabel }}</p>
                </div>
                <InlineMessage class="mt-2 break-all">
                  {{ t('dashboard.trackingCodeCode', { code: failure.trackingCode }) }}
                </InlineMessage>
              </SurfacePanel>
            </div>
            <SurfacePanel v-else as="p" variant="inset" padding="md" class="mt-4 text-sm font-semibold text-ink-500 dark:text-ink-400">
              {{ t('dashboard.noRecentFailures') }}
            </SurfacePanel>
          </SurfacePanel>
        </aside>
      </section>
    </div>

    <EmptyStatePanel
      v-else
      title="dashboard.noStatisticsYet"
      description="dashboard.thereAreCurrentlyNoPlatformResultsToDisplay"
      icon="chart"
    />
  </RoutePageFrame>
</template>

<script setup lang="ts">
import RoutePageFrame from '@/components/ui/organisms/RoutePageFrame.vue';
import { computed, watch } from 'vue';
import EmptyStatePanel from '@/components/ui/molecules/EmptyStatePanel.vue';
import SkeletonDashboard from '@/components/ui/organisms/SkeletonDashboard.vue';
import PageLoadFailure from '@/components/ui/molecules/PageLoadFailure.vue';
import InlineMessage from '@/components/ui/atoms/InlineMessage.vue';
import SectionHeader from '@/components/ui/molecules/SectionHeader.vue';
import SurfacePanel from '@/components/ui/molecules/SurfacePanel.vue';
import { useDashboardMetrics } from '@/composables/useDashboardMetrics';
import { usePlatformDashboard } from '@/composables/usePlatformDashboard';
import { useSession } from '@/composables/useSession';
import { useLoadingTimeout } from '@/composables/useLoadingTimeout';
import { resetAppConnection } from '@/lib/reconnect';
import { useI18n } from '@/i18n';

const { t } = useI18n();

const { initialized, isAdmin, loading: authLoading } = useSession();
const { stats, operations, loading, error, loadDashboard } = usePlatformDashboard();
async function retryDashboard() {
  await resetAppConnection();
  await loadDashboard({ forceRefresh: true });
}
const sessionLoading = computed(() => authLoading.value || !initialized.value);
const dashboardLoading = computed(() => sessionLoading.value || loading.value);
const {
  hasProblem: dashboardLoadingHasProblem,
  isOnline: dashboardOnline,
  problemDescription: dashboardProblemDescription,
  problemTitle: dashboardProblemTitle,
} = useLoadingTimeout(dashboardLoading, 5_000);
const {
  heroStats,
  categoryComparisonRows,
  operationsStatus,
  operationSummaryCards,
  operationRows,
  recentFailureRows,
} = useDashboardMetrics(stats, operations);

watch(
  [initialized, isAdmin],
  ([ready, admin]) => {
    if (!ready || !admin || stats.value || loading.value) return;
    void loadDashboard();
  },
  { immediate: true },
);
</script>
