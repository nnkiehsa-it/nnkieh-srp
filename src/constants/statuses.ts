import type { FacilityStatus, IssueStatus } from '@/types';

interface StatusOption<TValue extends string> {
  value: TValue;
  label: string;
}

export const ADMIN_ISSUE_STATUS_OPTIONS: StatusOption<IssueStatus>[] = [
  { value: 'under-review', label: 'text.33140a0b9e7b' },
  { value: 'pending', label: 'text.74ddb3ebd307' },
  { value: 'review-rejected', label: 'text.9e71e7397a71' },
  { value: 'processing', label: 'text.ae16f4a52d69' },
  { value: 'infeasible', label: 'text.1cd1905f072b' },
  { value: 'completed', label: 'text.e99b48a29bdf' },
];

export const ISSUE_STATUS_LABELS: Record<IssueStatus, string> = {
  'under-review': 'text.33140a0b9e7b',
  pending: 'text.74ddb3ebd307',
  processing: 'text.ae16f4a52d69',
  'auto-rejected': 'text.982368fa577a',
  'review-rejected': 'text.9e71e7397a71',
  infeasible: 'text.1cd1905f072b',
  completed: 'text.e99b48a29bdf',
};

export const FACILITY_STATUS_LABELS: Record<FacilityStatus, string> = {
  pending: 'text.11ba133668d8',
  processing: 'text.ae16f4a52d69',
  completed: 'text.e99b48a29bdf',
  'unable-to-handle': 'text.900950604945',
};

export const FACILITY_CLOSED_STATUSES: FacilityStatus[] = ['completed', 'unable-to-handle'];

export function isFacilityClosed(status: FacilityStatus) {
  return FACILITY_CLOSED_STATUSES.includes(status);
}
