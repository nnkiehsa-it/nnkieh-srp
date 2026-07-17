import type { IssueOperationTimeItem, IssueRecord, IssueSortOption, IssueStatus, IssueStatusBucket } from '@/types';

type RawIssueTimeItem = Omit<IssueOperationTimeItem, 'valueLabel'>;

const CLOSED_STATUSES = new Set<IssueStatus>([
  'auto-rejected',
  'review-rejected',
  'infeasible',
  'completed',
]);

export function isClosedIssueStatus(status: IssueStatus) {
  return CLOSED_STATUSES.has(status);
}

export function getIssueStatusBucket(issue: Pick<IssueRecord, 'status'>): IssueStatusBucket {
  return isClosedIssueStatus(issue.status) ? 'closed' : 'active';
}

export function getIssueLatestSortTime(
  issue: Pick<IssueRecord, 'closed_at' | 'created_at' | 'review_approved_at' | 'status'>,
  statusBucket: IssueStatusBucket,
) {
  if (statusBucket === 'closed' || isClosedIssueStatus(issue.status)) {
    return issue.closed_at?.getTime() ?? issue.created_at?.getTime() ?? 0;
  }
  return issue.review_approved_at?.getTime() ?? issue.created_at?.getTime() ?? 0;
}

export function sortIssuesByOption(
  issues: IssueRecord[],
  sortOption: IssueSortOption,
  statusBucket: IssueStatusBucket,
) {
  return [...issues].sort((left, right) => {
    const leftSortAt = getIssueLatestSortTime(left, statusBucket);
    const rightSortAt = getIssueLatestSortTime(right, statusBucket);

    if (sortOption === 'most-supported') {
      return right.support_count - left.support_count || rightSortAt - leftSortAt;
    }

    if (sortOption === 'ending-soon') {
      return (left.support_deadline_at?.getTime() ?? Number.POSITIVE_INFINITY)
        - (right.support_deadline_at?.getTime() ?? Number.POSITIVE_INFINITY)
        || rightSortAt - leftSortAt;
    }

    return rightSortAt - leftSortAt;
  });
}

export function sortMixedStatusIssuesByOption(
  issues: IssueRecord[],
  sortOption: IssueSortOption,
) {
  return [...issues].sort((left, right) => {
    const leftSortAt = getIssueLatestSortTime(left, getIssueStatusBucket(left));
    const rightSortAt = getIssueLatestSortTime(right, getIssueStatusBucket(right));

    if (sortOption === 'most-supported') {
      return right.support_count - left.support_count || rightSortAt - leftSortAt;
    }

    if (sortOption === 'ending-soon') {
      return (left.support_deadline_at?.getTime() ?? Number.POSITIVE_INFINITY)
        - (right.support_deadline_at?.getTime() ?? Number.POSITIVE_INFINITY)
        || rightSortAt - leftSortAt;
    }

    return rightSortAt - leftSortAt;
  });
}

export function getIssueOperationTimeItems(issue: IssueRecord): RawIssueTimeItem[] {
  const items: Array<{ label: string; shortLabel: string; value: Date | null | undefined }> = [
    { label: 'text.39692140965c', shortLabel: 'text.b9a2f9c03506', value: issue.created_at },
    { label: 'text.d4d2cf96d71b', shortLabel: 'text.2a7d3dc76d00', value: issue.review_approved_at },
    { label: 'text.edc1e85307a5', shortLabel: 'text.0d5da2cd9330', value: issue.support_deadline_at },
    { label: 'text.3298b0ffbcf9', shortLabel: 'text.a6bd6c0ed7b8', value: issue.support_met_at },
    { label: 'text.d7efd6e096b5', shortLabel: 'text.d7efd6e096b5', value: issue.response_deadline_at },
    { label: 'text.ac75f83f5caa', shortLabel: 'text.6ed85f581df1', value: issue.closed_at },
  ];

  return items.filter((item): item is RawIssueTimeItem => item.value instanceof Date);
}
