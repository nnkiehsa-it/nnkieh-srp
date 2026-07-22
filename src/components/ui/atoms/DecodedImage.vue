<template>
  <span
    v-bind="$attrs"
    class="decoded-image"
    :class="{ 'decoded-image--ready': ready, 'decoded-image--failed': failed }"
    :aria-busy="!ready && !failed ? 'true' : undefined"
  >
    <span
      v-if="!ready && !failed"
      class="decoded-image__loading"
      aria-hidden="true"
    >
      <LoadingSpinner :size="spinnerSize" />
    </span>

    <img
      ref="imageRef"
      :src="src"
      :alt="alt"
      :width="width"
      :height="height"
      :loading="loading"
      decoding="async"
      :aria-hidden="failed ? 'true' : undefined"
      class="decoded-image__media"
      :class="imageClass"
      @load="handleLoad"
      @error="handleError"
    />

    <slot v-if="failed" name="error">
      <span class="decoded-image__error" role="img" :aria-label="alt">
        <AppIcon name="warning" :size="spinnerSize" />
      </span>
    </slot>
  </span>
</template>

<script setup lang="ts">
import { nextTick, ref, watch } from 'vue';
import AppIcon from '@/components/ui/atoms/AppIcon.vue';
import LoadingSpinner from '@/components/ui/atoms/LoadingSpinner.vue';

defineOptions({
  inheritAttrs: false,
});

const props = withDefaults(defineProps<{
  alt: string;
  height?: number | string;
  imageClass?: string;
  loading?: 'eager' | 'lazy';
  spinnerSize?: number;
  src: string;
  width?: number | string;
}>(), {
  height: undefined,
  imageClass: '',
  loading: 'lazy',
  spinnerSize: 5,
  width: undefined,
});

const emit = defineEmits<{
  error: [];
  ready: [];
}>();

const imageRef = ref<HTMLImageElement | null>(null);
const ready = ref(false);
const failed = ref(false);
let loadGeneration = 0;

async function revealImage(image: HTMLImageElement, generation: number) {
  try {
    await image.decode();
  } catch {
    // Safari can reject decode() for an already decoded image; naturalWidth is authoritative.
  }

  if (generation !== loadGeneration || image !== imageRef.value) return;
  if (!image.complete || image.naturalWidth === 0) return;
  ready.value = true;
  failed.value = false;
  emit('ready');
}

function handleLoad(event: Event) {
  const image = event.currentTarget;
  if (image instanceof HTMLImageElement) {
    void revealImage(image, loadGeneration);
  }
}

function handleError() {
  ready.value = false;
  failed.value = true;
  emit('error');
}

watch(
  () => props.src,
  async () => {
    const generation = ++loadGeneration;
    ready.value = false;
    failed.value = false;
    await nextTick();
    const image = imageRef.value;
    if (image?.complete && image.naturalWidth > 0) {
      void revealImage(image, generation);
    }
  },
  { immediate: true },
);
</script>
