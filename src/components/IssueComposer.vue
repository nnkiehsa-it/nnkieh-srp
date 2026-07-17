<template>
  <EntryComposerShell
    v-model:entry-title="form.title"
    v-model:content="form.content"
    v-model:show-preview="showPreview"
    :open="open"
    eyebrow="text.271568f2eda5"
    :title="t('text.c6ba0918f29e', { category: t(categoryLabel) })"
    title-input-id="issue-title"
    title-label="text.6baa727f1716"
    :title-max-length="INPUT_LIMITS.title"
    :title-warning-length="27"
    title-placeholder="text.64eb8c7aefed"
    editor-textarea-id="issue-content"
    editor-label="text.b085db5ec3bb"
    editor-placeholder="text.cf1d2913a469"
    :images="editorImages"
    :max-images="RATE_LIMITS.imageUploads.issueMaxImages"
    max-images-label="text.b9a2f9c03506"
    hint="text.66de893e1e35"
    submit-label="text.ea3ea494dd98"
    :busy="submitting"
    :uploading="uploading"
    :error="error || uploadError"
    @close="handleClose"
    @image-picked="handleImagePicked"
    @remove-image="removeEditorImage"
    @submit="submit"
  />
</template>

<script setup lang="ts">
import { computed, toRef } from 'vue';
import EntryComposerShell from '@/components/ui/EntryComposerShell.vue';
import { INPUT_LIMITS } from '@/constants/input-limits';
import { RATE_LIMITS } from '@/generated/rate-limits';
import { useIssueComposerForm } from '@/composables/useIssueComposerForm';
import type { IssueRecord, WritableIssueCategory } from '@/types';
import { useI18n } from '@/i18n';

const props = defineProps<{
  open: boolean;
  category: WritableIssueCategory;
  categoryLabel: string;
}>();

const emit = defineEmits<{
  close: [];
  submitted: [issue: IssueRecord];
}>();
const { t } = useI18n();

const {
  form,
  handleImagePicked,
  imageUrls,
  removeImage,
  uploadError,
  uploading,
  submitting,
  showPreview,
  error,
  handleClose,
  submit,
} = useIssueComposerForm(toRef(props, 'open'), {
  category: toRef(props, 'category'),
  onClose: () => emit('close'),
  onSubmitted: (issue) => emit('submitted', issue),
});

const editorImages = computed(() =>
  imageUrls.value.map((src, index) => ({
    alt: t('text.c549f291eee2'),
    key: `${src}:${index}`,
    src,
  })),
);

function removeEditorImage(key: string) {
  const index = editorImages.value.findIndex((image) => image.key === key);
  if (index >= 0) void removeImage(index);
}
</script>
