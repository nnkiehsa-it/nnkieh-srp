import { computed, reactive, ref, toRef, watch, type Ref } from 'vue';
import { useMarkdownImageUpload } from '@/composables/useMarkdownImageUpload';
import { useActionFeedback } from '@/composables/useActionFeedback';
import { createFacility } from '@/services/facilities';
import { RATE_LIMITS } from '@/generated/rate-limits';
import type { FacilityRecord } from '@/types';

export function useFacilityComposerForm(open: Ref<boolean>, onClose: () => void, onSubmitted: (facility: FacilityRecord) => void) {
  const form = reactive({ title: '', location: '', content: '' });
  const images = useMarkdownImageUpload(toRef(form, 'content'), { maxImages: RATE_LIMITS.imageUploads.facilityMaxImages });
  const submitting = ref(false);
  const error = ref('');
  const showPreview = ref(false);
  const { show, start } = useActionFeedback();

  function reset() {
    form.title = ''; form.location = ''; form.content = ''; error.value = ''; showPreview.value = false; images.resetImages();
  }
  watch(open, (value) => { if (!value) reset(); });

  async function close() {
    if (submitting.value || images.uploading.value) return;
    try {
      await images.discardImages();
      onClose();
    } catch {
      images.uploadError.value = 'text.195dfc8d76ad';
      show(images.uploadError.value, 'error');
    }
  }

  async function submit() {
    if (!form.title.trim()) {
      error.value = 'text.25224809f8d7';
      show(error.value, 'error');
      return;
    }
    if (!form.location.trim()) {
      error.value = 'text.75b1e5284e31';
      show(error.value, 'error');
      return;
    }
    if (!images.contentWithImages.value.trim()) {
      error.value = 'text.b42b017e3846';
      show(error.value, 'error');
      return;
    }
    submitting.value = true;
    const feedback = start('text.116aec1ac960');
    let uploaded: Awaited<ReturnType<typeof images.uploadImagesAndBuildContent>>['uploadedImages'] = [];
    try {
      if (images.imageUrls.value.length > 0) feedback.update('text.b7cbf062d7cc');
      const result = await images.uploadImagesAndBuildContent();
      uploaded = result.uploadedImages;
      feedback.update('text.deb253fe6fcd');
      const facility = await createFacility({ title: form.title.trim(), location: form.location.trim(), content: result.content });
      reset(); onSubmitted(facility); onClose(); feedback.succeed('text.453ff81884c7');
    } catch (caught) {
      if (uploaded.length) await images.deleteUploadedImages(uploaded);
      error.value = caught instanceof Error ? caught.message : 'text.7a42c57da429';
      feedback.fail(error.value);
    } finally { submitting.value = false; }
  }

  return {
    editorImages: computed(() => images.imageUrls.value.map((src, index) => ({ src, alt: 'text.fde8a2524ab4', key: `${src}:${index}` }))),
    error,
    form,
    images,
    showPreview,
    submitting,
    close,
    submit,
  };
}
