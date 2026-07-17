<template>
  <EntryComposerShell
    v-model:entry-title="form.title"
    v-model:location="form.location"
    v-model:content="form.content"
    v-model:show-preview="showPreview"
    :open="open"
    eyebrow="text.930eabc59bdf"
    title="text.9a5eebad285b"
    title-input-id="facility-title"
    title-label="text.a85ae5d87288"
    :title-max-length="INPUT_LIMITS.title"
    :title-warning-length="27"
    title-placeholder="text.ac3c48f541c8"
    location-input-id="facility-location"
    location-label="text.4260682efe89"
    :location-max-length="INPUT_LIMITS.facilityLocation"
    :location-warning-length="108"
    location-placeholder="text.85866b872e2d"
    editor-textarea-id="facility-content"
    editor-label="text.b085db5ec3bb"
    editor-placeholder="text.25247e90e972"
    :images="editorImages"
    :max-images="RATE_LIMITS.imageUploads.facilityMaxImages"
    max-images-label="text.a6a61230ffa1"
    hint="text.409352779c33"
    submit-label="text.ea3ea494dd98"
    :busy="submitting"
    :uploading="images.uploading.value"
    :error="error || images.uploadError.value"
    @close="close"
    @image-picked="images.handleImagePicked"
    @remove-image="removeImage"
    @submit="submit"
  />
</template>

<script setup lang="ts">
import { toRef } from 'vue';
import EntryComposerShell from '@/components/ui/EntryComposerShell.vue';
import { INPUT_LIMITS } from '@/constants/input-limits';
import { RATE_LIMITS } from '@/generated/rate-limits';
import { useFacilityComposerForm } from '@/composables/useFacilityComposerForm';
import type { FacilityRecord } from '@/types';

const props = defineProps<{ open: boolean }>();
const emit = defineEmits<{ close: []; submitted: [facility: FacilityRecord] }>();
const { editorImages, error, form, images, showPreview, submitting, close, submit } = useFacilityComposerForm(
  toRef(props, 'open'),
  () => emit('close'),
  (facility) => emit('submitted', facility),
);

function removeImage(key: string) {
  const index = editorImages.value.findIndex((image) => image.key === key);
  if (index >= 0) void images.removeImage(index);
}
</script>
