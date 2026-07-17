<template>
  <form class="space-y-2" autocomplete="off" @submit.prevent="submit">
    <div
      v-if="parentCommentId"
      class="flex items-center justify-between gap-3 px-1 text-xs font-semibold text-ink-500 dark:text-ink-400"
    >
      <span>{{ t('comments.replying') }}</span>
      <button
        type="button"
        class="button-toolbar h-8 min-h-8 w-8 rounded-full p-0"
        :disabled="submitting || uploading"
        :title="t('text.bcd1cb611036')"
        :aria-label="t('text.bcd1cb611036')"
        @click="handleClose"
      >
        <AppIcon name="close" :stroke-width="2.5" />
      </button>
    </div>

    <div class="control-frame">
      <div v-if="imageUrls.length" class="flex gap-2 px-3 pt-3">
        <div
          v-for="(url, index) in imageUrls"
          :key="url"
          class="relative h-20 w-20 overflow-hidden rounded-xl bg-ink-50 shadow-note dark:bg-ink-900"
        >
          <img :src="url" :alt="t('text.afa3c211d6bf')" class="h-full w-full object-cover" />
          <button type="button" class="button-remove-image" :aria-label="t('text.3e9b6f7dd375')" @click="removeImage(index)">
            <AppIcon name="close" :size="3" :stroke-width="2.5" />
          </button>
        </div>
      </div>

      <div class="flex items-end gap-1.5 p-2 pl-3">
        <img
          v-if="myPhotoUrl"
          :src="myPhotoUrl"
          :alt="t('text.e90a97b32116')"
          class="mb-1.5 h-7 w-7 shrink-0 rounded-full object-cover shadow-note"
        />

        <textarea
          :id="`comment-content-${composerId}`"
          ref="commentTextareaRef"
          v-model="commentContent"
          rows="1"
          class="max-h-32 min-h-11 min-w-0 flex-1 resize-none border-none bg-transparent px-1 py-3 font-sans text-base leading-5 text-ink-800 outline-none placeholder:text-ink-400 focus:ring-0 dark:text-ink-100 dark:placeholder:text-ink-500 md:text-sm"
          autocomplete="off"
          :maxlength="INPUT_LIMITS.comment"
          :placeholder="t(parentCommentId ? 'text.b5f7215e6d95' : 'text.cea3ddfb8127')"
          :disabled="submitting"
        ></textarea>

        <button
          type="button"
          class="button-toolbar h-10 min-h-10 w-10 shrink-0 rounded-full p-0"
          :disabled="uploading || imageUrls.length >= RATE_LIMITS.imageUploads.commentMaxImages"
          :title="uploading
            ? t('text.ca1d70f0ffd1')
            : imageUrls.length >= RATE_LIMITS.imageUploads.commentMaxImages
              ? t('comments.imageLimit', { count: RATE_LIMITS.imageUploads.commentMaxImages })
              : t('text.0e33b8155b65')"
          :aria-label="t('text.83bb99b177f7')"
          @click="commentFileInputRef?.click()"
        >
          <AppIcon name="image" />
        </button>
        <input
          ref="commentFileInputRef"
          type="file"
          accept="image/*"
          autocomplete="off"
          class="hidden"
          multiple
          @change="handleImagePicked"
        />
        <button
          type="submit"
          class="button-icon-filled h-10 min-h-10 w-10 shrink-0 bg-ink-900 text-white hover:bg-ink-800 dark:bg-ink-100 dark:text-ink-900 dark:hover:bg-ink-200"
          :disabled="submitting || uploading || (!commentContent.trim() && imageUrls.length === 0)"
          :title="t(submitting ? 'text.afee476dca7d' : 'text.0fa13e57cf13')"
          :aria-label="t('text.0fa13e57cf13')"
        >
          <AppIcon name="send" />
        </button>
      </div>
    </div>

    <p v-if="error || uploadError" class="pl-1.5 text-xs font-semibold text-error">
      {{ t('comments.error', { message: t(error || uploadError) }) }}
    </p>
  </form>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';
import AppIcon from '@/components/ui/AppIcon.vue';
import { useMarkdownImageUpload } from '@/composables/useMarkdownImageUpload';
import { useSession } from '@/composables/useSession';
import { useActionFeedback } from '@/composables/useActionFeedback';
import { RATE_LIMITS } from '@/generated/rate-limits';
import { INPUT_LIMITS } from '@/constants/input-limits';
import { useI18n } from '@/i18n';

const props = defineProps<{
  error: string;
  issueId?: string;
  parentCommentId?: string | null;
  submitting: boolean;
  targetId?: string;
}>();

const emit = defineEmits<{
  close: [];
  submit: [payload: { content: string; parentCommentId: string | null }];
}>();

const { user, customPhotoUrl } = useSession();
const { t } = useI18n();
const { show } = useActionFeedback();
const myPhotoUrl = computed(() => customPhotoUrl.value || user.value?.photoURL || null);
const composerId = computed(() => props.issueId ?? props.targetId ?? 'default');

const commentContent = ref('');
const {
  fileInputRef: commentFileInputRef,
  handleImagePicked,
  deleteUploadedImages,
  discardImages,
  imageUrls,
  removeImage,
  resetImages,
  textareaRef: commentTextareaRef,
  uploadError,
  uploadImagesAndBuildContent,
  uploading,
} = useMarkdownImageUpload(commentContent, {
  maxImages: RATE_LIMITS.imageUploads.commentMaxImages,
});
const submittedImages = ref<Awaited<ReturnType<typeof uploadImagesAndBuildContent>>['uploadedImages']>([]);

nextTick(() => {
  commentTextareaRef.value?.focus();
});

async function submit() {
  try {
    const uploadResult = await uploadImagesAndBuildContent();
    submittedImages.value = uploadResult.uploadedImages;

    emit('submit', {
      content: uploadResult.content,
      parentCommentId: props.parentCommentId ?? null,
    });
  } catch {
    uploadError.value = 'text.236bd93ac440';
    show(uploadError.value, 'error');
  }
}

async function handleClose() {
  if (props.submitting || uploading.value) {
    return;
  }

  try {
    await discardImages();
    emit('close');
  } catch {
    uploadError.value = 'text.195dfc8d76ad';
    show(uploadError.value, 'error');
  }
}

watch(
  () => props.submitting,
  (isSubmitting, wasSubmitting) => {
    if (!isSubmitting && wasSubmitting && !props.error) {
      commentContent.value = '';
      resetImages();
      submittedImages.value = [];
    }
    if (!isSubmitting && wasSubmitting && props.error && submittedImages.value.length) {
      deleteUploadedImages(submittedImages.value);
      submittedImages.value = [];
    }
  },
);
</script>
