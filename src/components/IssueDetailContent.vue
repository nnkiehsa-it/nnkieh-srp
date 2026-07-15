<template>
  <div class="flex min-h-0 flex-col">
    <div class="shrink-0 pb-1" :class="compact ? 'space-y-2' : 'space-y-4'">
      <h2
        class="break-words font-semibold tracking-[0.015em] text-ink-900 dark:text-ink-50"
        :class="compact ? 'text-xl leading-snug' : 'text-xl leading-snug sm:text-2xl'"
      >
        {{ issue.title }}
      </h2>

      <div
        v-if="showAuthor"
        class="flex items-center border-b border-ink-100 text-sm dark:border-ink-800"
        :class="compact ? 'flex-wrap gap-2 pb-2' : 'gap-3 pb-3'"
      >
        <UserAvatar
          :photo-url="displayPhotoUrl"
          :name="displayAuthorName"
          :size="compact ? 'sm' : 'md'"
          :alt-text="`${displayAuthorName} 的頭像`"
        />

        <p class="min-w-0 truncate text-sm font-semibold text-ink-900 dark:text-ink-100">
          {{ displayAuthorName }}
        </p>
      </div>
    </div>

    <div
      class="min-h-0 py-2"
      :class="scrollContent ? 'my-2 flex-1 overflow-y-auto pr-2' : ''"
    >
      <div
        v-if="issue.status === 'review-rejected' && issue.review_rejection_reason"
        class="mb-4 rounded-[var(--radius-inner)] border-0 bg-error-container/80 px-4 py-3 text-sm text-on-error-container shadow-note"
      >
        <p class="font-semibold">審核未通過原因</p>
        <p class="mt-1 leading-6">{{ issue.review_rejection_reason }}</p>
      </div>
      <div
        v-else-if="issue.result_content"
        class="mb-4 rounded-[var(--radius-inner)] border-0 bg-success-container/80 px-4 py-3 text-sm text-on-success-container shadow-note"
      >
        <p class="font-semibold">提案結果</p>
        <div class="mt-1 leading-6">
          <MarkdownMediaContent :content="issue.result_content" :fallback-alt="`${issue.title} 的提案結果圖片`" />
        </div>
      </div>
      <MarkdownMediaContent :content="issue.content" :fallback-alt="issue.title" />
    </div>
  </div>
</template>

<script setup lang="ts">
import MarkdownMediaContent from '@/components/MarkdownMediaContent.vue';
import UserAvatar from '@/components/ui/UserAvatar.vue';
import type { IssueRecord } from '@/types';

const props = defineProps<{
  compact?: boolean;
  displayAuthorName: string;
  displayPhotoUrl: string | null;
  issue: IssueRecord;
  scrollContent?: boolean;
  showAuthor: boolean;
}>();

</script>
