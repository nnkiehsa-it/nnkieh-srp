<template>
  <div
    v-if="images.length"
    class="flex flex-wrap gap-3 border-b border-ink-100 dark:border-ink-800 shrink-0"
    :class="size === 'lg' ? 'p-4' : 'p-3'"
  >
    <EditorSurface
      v-for="image in images"
      :key="image.key"
      tone="muted"
      class="relative overflow-hidden"
      :class="size === 'lg' ? 'h-24 w-24' : 'h-16 w-16'"
    >
      <DecodedImage
        :src="image.src"
        :alt="image.alt"
        class="h-full w-full"
        image-class="h-full w-full object-cover"
        loading="eager"
      />
      <ImageRemoveButton
        class="cursor-pointer"
        :aria-label="t('comments.removeImage')"
        @click="emit('remove-image', image.key)"
      />
    </EditorSurface>
  </div>
</template>

<script setup lang="ts">
import ImageRemoveButton from '@/components/ui/atoms/ImageRemoveButton.vue';
import DecodedImage from '@/components/ui/atoms/DecodedImage.vue';
import EditorSurface from "@/components/ui/molecules/EditorSurface.vue";
import { useI18n } from "@/i18n";

export interface MarkdownEditorImage {
  alt: string;
  key: string;
  src: string;
}

withDefaults(
  defineProps<{
    images: MarkdownEditorImage[];
    size?: "sm" | "lg";
  }>(),
  {
    size: "sm",
  },
);

const emit = defineEmits<{
  "remove-image": [key: string];
}>();
const { t } = useI18n();
</script>
