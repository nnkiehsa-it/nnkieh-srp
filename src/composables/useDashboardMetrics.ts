import { computed, type Ref } from 'vue';
import { ISSUE_CATEGORY_LABELS } from '@/constants/categories';
import { formatDate } from '@/lib/format';
import type { PlatformDashboardOperations, PlatformDashboardStats } from '@/types';
import { useI18n } from '@/i18n';

export function useDashboardMetrics(
  stats: Ref<PlatformDashboardStats | null>,
  operations: Ref<PlatformDashboardOperations | null>,
) {
  const { t } = useI18n();
  const updatedLabel = computed(() => formatDate(stats.value?.updated_at ?? stats.value?.last_activity_at ?? null) || t('text.23b48ce5fa73'));

  const heroStats = computed(() => {
    if (!stats.value) return [];

    return [
      { label: t('text.2d00089f91fa'), value: stats.value.total_users_seen, caption: t('text.4912771a4216') },
      { label: t('text.01c32939cfed'), value: stats.value.total_issues_created, caption: t('text.d0bb9b2b8ea7') },
      { label: t('text.678ceaf8c338'), value: stats.value.total_comments_created, caption: t('text.6e38a9adcb74') },
      { label: t('text.6c0625f9b642'), value: stats.value.total_supports_added, caption: t('text.5e5b8169eee6') },
    ];
  });

  const categoryComparisonRows = computed(() => buildCategoryComparisonRows(stats.value, t));

  const operationsStatus = computed(() => statusView(operations.value?.overall_status ?? 'healthy', t));

  const operationSummaryCards = computed(() => {
    if (!operations.value) return [];
    return [
      {
        label: t('text.0a19adc6a448'),
        value: operationsStatus.value.label,
        caption: operationsStatus.value.caption,
        toneClass: operationsStatus.value.toneClass,
      },
      {
        label: t('text.3d9f3a05169c'),
        value: formatCappedCount(operations.value.pending_notion_sync_count, operations.value.pending_notion_sync_capped),
        caption: operations.value.oldest_pending_sync_at
          ? t('text.ee7430cc88c4', { time: formatDate(operations.value.oldest_pending_sync_at) })
          : t('text.b3b26a659575'),
        toneClass: operations.value.pending_notion_sync_count > 0
          ? 'bg-warning-container text-on-warning-container'
          : 'bg-success-container text-on-success-container',
      },
      {
        label: t('text.cf473fe4efc9'),
        value: formatCappedCount(operations.value.failed_notion_sync_count, operations.value.failed_notion_sync_capped),
        caption: operations.value.next_sync_count > 0
          ? t('text.d26aa75b236e', { count: operations.value.next_sync_count })
          : t('text.41f73bb10ebc'),
        toneClass: operations.value.failed_notion_sync_count > 0
          ? 'bg-error-container text-on-error-container'
          : 'bg-surface text-ink-900 dark:bg-surface dark:text-ink-100',
      },
      {
        label: t('text.d2b7f6281fb9'),
        value: updatedLabel.value,
        caption: t('text.8f23b5231669'),
        toneClass: 'bg-surface text-ink-900 dark:bg-surface dark:text-ink-100',
      },
    ];
  });

  const operationRows = computed(() => {
    if (!operations.value) return [];
    const maintenance = operations.value.scheduled_maintenance;
    return [
      {
        label: 'dashboard.notionSync',
        value: t('text.4bbf8b0574ca', { count: formatCappedCount(operations.value.pending_notion_sync_count, operations.value.pending_notion_sync_capped) }),
        detail: operations.value.oldest_pending_sync_at
          ? t('text.986524bdf9dc', { time: formatDate(operations.value.oldest_pending_sync_at) })
          : t('text.03a42897c014'),
        statusLabel: t(operations.value.failed_notion_sync_count > 0 ? 'text.09e85e1125c5' : operations.value.pending_notion_sync_count > 0 ? 'text.132707cbf3ed' : 'text.f78d037abccd'),
        toneClass: operations.value.failed_notion_sync_count > 0 ? 'text-error' : operations.value.pending_notion_sync_count > 0 ? 'text-warning' : 'text-success',
      },
      {
        label: t('text.03100aaa0ee9'),
        value: t('text.e4ec69f2b824', { count: formatCappedCount(operations.value.failed_outbox_count, operations.value.failed_outbox_capped) }),
        detail: t('text.a036a1bac690'),
        statusLabel: t(operations.value.failed_outbox_count > 0 ? 'text.c36873b2d614' : 'text.f78d037abccd'),
        toneClass: operations.value.failed_outbox_count > 0 ? 'text-error' : 'text-success',
      },
      {
        label: t('text.c54d15f53940'),
        value: t('text.a49e67256a5f', { count: formatCappedCount(operations.value.failed_push_delivery_count, operations.value.failed_push_delivery_capped) }),
        detail: t('text.8e53a693abb0'),
        statusLabel: t(operations.value.failed_push_delivery_count > 0 ? 'text.8d0d1ed94927' : 'text.f78d037abccd'),
        toneClass: operations.value.failed_push_delivery_count > 0 ? 'text-error' : 'text-success',
      },
      {
        label: t('text.d90d2f7e9ed8'),
        value: t('text.ffdf300df0b6', { count: formatCappedCount(operations.value.stuck_upload_count, operations.value.stuck_upload_capped) }),
        detail: t('text.a4de39ba17d1'),
        statusLabel: t(operations.value.stuck_upload_count > 0 ? 'text.8319951a986d' : 'text.f78d037abccd'),
        toneClass: operations.value.stuck_upload_count > 0 ? 'text-warning' : 'text-success',
      },
      {
        label: t('text.9f610928ddf8'),
        value: t('text.155aa3c667cf', { count: formatCappedCount(operations.value.cleanup_backlog_count, operations.value.cleanup_backlog_capped) }),
        detail: t('text.b02e75995126'),
        statusLabel: t(operations.value.cleanup_backlog_count > 0 ? 'text.7020f9c10e83' : 'text.f78d037abccd'),
        toneClass: operations.value.cleanup_backlog_count > 0 ? 'text-warning' : 'text-success',
      },
      {
        label: t('text.eab7cc2af24d'),
        value: maintenanceStatusLabel(maintenance.status, t),
        detail: maintenance.completed_at
          ? t('text.048e857e41f7', { time: formatDate(maintenance.completed_at) })
          : maintenance.updated_at
            ? t('text.024f2c4d666b', { time: formatDate(maintenance.updated_at) })
            : t('text.0fa8d0608f9f'),
        statusLabel: maintenance.failed_tasks.length > 0 ? maintenance.failed_tasks.join(', ') : maintenanceStatusLabel(maintenance.status, t),
        toneClass: maintenance.status === 'failed'
          ? 'text-error'
          : maintenance.status === 'running' || maintenance.status === 'attention'
            ? 'text-warning'
            : 'text-success',
      },
    ];
  });

  const recentFailureRows = computed(() => {
    if (!operations.value) return [];
    return operations.value.recent_failures.map((failure) => ({
      ...failure,
      sourceLabel: failure.source === 'notion'
        ? 'Notion'
        : failure.source === 'outbox'
          ? 'Outbox'
          : failure.source === 'push'
            ? t('text.d97638893434')
            : failure.source === 'cleanup'
              ? t('text.907c3945d8c5')
              : failure.source,
      updatedLabel: formatDate(failure.updated_at) || t('text.2680081fcbab'),
      trackingCode: failure.message || failure.id,
    }));
  });

  return {
    updatedLabel,
    heroStats,
    categoryComparisonRows,
    operationsStatus,
    operationSummaryCards,
    operationRows,
    recentFailureRows,
  };
}

function formatCappedCount(count: number, capped: boolean) {
  return capped ? `${count}+` : String(count);
}

type Translate = (source: string, params?: Record<string, string | number>) => string;

function statusView(status: PlatformDashboardOperations['overall_status'], t: Translate) {
  switch (status) {
    case 'critical':
      return {
        label: t('text.c36873b2d614'),
        caption: t('text.4dce367e3c3e'),
        toneClass: 'bg-error-container text-on-error-container',
      };
    case 'attention':
      return {
        label: t('text.f08b55c42cfa'),
        caption: t('text.b784a0575b40'),
        toneClass: 'bg-warning-container text-on-warning-container',
      };
    case 'healthy':
      return {
        label: t('text.f78d037abccd'),
        caption: t('text.91b9df96c30c'),
        toneClass: 'bg-success-container text-on-success-container',
      };
  }
}

function maintenanceStatusLabel(status: string, t: Translate) {
  if (status === 'success') return t('text.f78d037abccd');
  if (status === 'running') return t('text.1c62ee3956b0');
  if (status === 'attention') return t('text.f08b55c42cfa');
  if (status === 'failed') return t('text.a1d7783338f0');
  return t('text.b96a46697afb');
}

function buildCategoryComparisonRows(stats: PlatformDashboardStats | null, t: Translate) {
  if (!stats) return [];

  const total = Math.max(1, stats.total_issues_created + stats.total_comments_created);
  const barClasses = [
    'bg-success',
    'bg-processing',
    'bg-ink-700 dark:bg-ink-100',
  ];

  return Object.entries(ISSUE_CATEGORY_LABELS).map(([key, label], index) => {
    const category = key as keyof typeof ISSUE_CATEGORY_LABELS;
    const issues = stats.issues_by_category[category] ?? 0;
    const comments = stats.comments_by_category[category] ?? 0;
    const value = issues + comments;
    const exactPercent = Math.round((value / total) * 100);

    return {
      label: t(label),
      issues,
      comments,
      percent: value === 0 ? 0 : Math.max(8, exactPercent),
      percentLabel: `${exactPercent}%`,
      barClass: barClasses[index] ?? barClasses[0],
    };
  });
}
