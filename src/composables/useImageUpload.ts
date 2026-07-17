import { computed, ref } from 'vue';
import { useActionFeedback } from '@/composables/useActionFeedback';
import { processImageForUpload } from '@/lib/image-processing';
import { createImageUploadPolicies } from '@/services/uploads';

export interface UploadedImage {
  storagePath: string;
  uploadId: string;
  url: string;
  width: number;
  height: number;
}

export interface PreparedImage {
  file: File;
  previewUrl: string;
  width: number;
  height: number;
}

export function useImageUpload() {
  const activeOperations = ref(0);
  const uploading = computed(() => activeOperations.value > 0);
  const uploadError = ref('');
  const { show } = useActionFeedback();

  function startOperation() {
    activeOperations.value += 1;
    uploadError.value = '';
  }

  function finishOperation() {
    activeOperations.value = Math.max(0, activeOperations.value - 1);
  }

  function reportError(error: unknown, fallback: string) {
    uploadError.value = error instanceof Error && error.message ? error.message : fallback;
    show(uploadError.value, 'error');
  }

  function revokePreparedImage(image: PreparedImage) {
    URL.revokeObjectURL(image.previewUrl);
  }

  async function prepareImage(file: File): Promise<PreparedImage | null> {
    startOperation();

    try {
      const processed = await processImageForUpload(file);
      const previewUrl = URL.createObjectURL(processed.file);

      return { ...processed, previewUrl };
    } catch (error) {
      reportError(error, 'text.d7b97880eb2b');
      return null;
    } finally {
      finishOperation();
    }
  }

  async function uploadPreparedImages(images: PreparedImage[]): Promise<UploadedImage[]> {
    if (images.length === 0) return [];
    startOperation();

    try {
      const policies = await createImageUploadPolicies(images.map(({ file, height, width }) => ({ file, height, width })));
      if (policies.length !== images.length) throw new Error('text.3b264ebdfff1');
      return policies.map(({ uploadId, storagePath, width, height }) => ({
        storagePath,
        uploadId,
        url: `srp-upload://${uploadId}`,
        width,
        height,
      }));
    } catch (error) {
      reportError(error, 'text.236bd93ac440');
      return [];
    } finally {
      finishOperation();
    }
  }

  return {
    prepareImage,
    revokePreparedImage,
    uploadError,
    uploading,
    uploadPreparedImages,
  };
}
