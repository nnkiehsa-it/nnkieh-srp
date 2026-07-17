<template>
  <EntryComposerShell
    v-model:entry-title="title"
    v-model:content="content"
    v-model:show-preview="showPreview"
    :open="open"
    eyebrow="text.fc9381d7a5eb"
    title="text.1bb7c8022090"
    title-input-id="announcement-title"
    title-label="text.8c8b7e8131af"
    :title-max-length="INPUT_LIMITS.title"
    :title-warning-length="27"
    title-placeholder="text.0a0191b9e94a"
    title-required
    editor-textarea-id="announcement-content"
    editor-label="text.cbe9c747c7b2"
    editor-placeholder="text.26d02da90c40"
    :images="editorImages"
    :max-images="maxImages"
    max-images-label="text.3f9569532847"
    hint="text.f45f61d9b008"
    submit-label="text.927ad1afca75"
    :busy="submitting"
    :uploading="uploading"
    :error="error || uploadError"
    :submit-disabled="!title.trim() || (!content.trim() && editorImages.length === 0)"
    @close="handleClose"
    @image-picked="handleEditorImagePicked"
    @remove-image="removeEditorImage"
    @submit="submit"
  />
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import EntryComposerShell from '@/components/ui/EntryComposerShell.vue';
import { INPUT_LIMITS } from '@/constants/input-limits';
import { RATE_LIMITS } from '@/generated/rate-limits';
import { useMarkdownImageUpload } from '@/composables/useMarkdownImageUpload';
import type { UploadedImage } from '@/composables/useImageUpload';
import { useI18n } from '@/i18n';

const props = defineProps<{
  error: string;
  open: boolean;
  submitting: boolean;
}>();

const emit = defineEmits<{
  close: [];
  save: [payload: { title: string; content: string; uploadedImages: UploadedImage[] }];
}>();
const { t } = useI18n();

const title = ref('');
const content = ref('');
const showPreview = ref(false);
const maxImages = RATE_LIMITS.imageUploads.announcementMaxImages;
const {
  handleImagePicked,
  imageUrls,
  removeImage,
  resetImages,
  uploadError,
  uploadImagesAndBuildContent,
  uploading,
} = useMarkdownImageUpload(content, {
  getRemainingSlots: () => maxImages - editorImages.value.length,
  maxImages,
});

const editorImages = computed(() =>
  imageUrls.value.map((src, index) => ({
    alt: t('text.b3bf14c68491'),
    index,
    key: `new:${src}:${index}`,
    src,
  })),
);

watch(
  () => props.open,
  (open) => {
    if (!open) {
      resetImages();
      return;
    }
    title.value = '';
    content.value = '';
    resetImages();
    showPreview.value = false;
  },
  { immediate: true },
);

function buildMarkdownImage(image: { url: string; width?: number; height?: number }) {
  const size = image.width && image.height ? `|${image.width}x${image.height}` : '';
  return `![image${size}](${image.url})`;
}

function buildAnnouncementContent(uploadedImages: UploadedImage[]) {
  const text = content.value.trimEnd();
  const images = uploadedImages.map(buildMarkdownImage).join('\n');
  if (!images) return text;
  return text ? `${text}\n\n${images}` : images;
}

function removeEditorImage(key: string) {
  const image = editorImages.value.find((candidate) => candidate.key === key);
  if (image) void removeImage(image.index);
}

function handleClose() {
  if (props.submitting || uploading.value) return;
  resetImages();
  emit('close');
}

function handleEditorImagePicked(event: Event) {
  const target = event.target as HTMLInputElement;
  if (editorImages.value.length >= maxImages) {
    uploadError.value = t('upload.imageLimit', { count: maxImages });
    target.value = '';
    return;
  }
  void handleImagePicked(event);
}

async function submit() {
  const uploadResult = await uploadImagesAndBuildContent();
  emit('save', {
    title: title.value.trim(),
    content: buildAnnouncementContent(uploadResult.uploadedImages),
    uploadedImages: uploadResult.uploadedImages,
  });
}
</script>
