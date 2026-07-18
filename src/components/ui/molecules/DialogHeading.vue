<template>
  <div class="min-w-0">
    <p v-if="eyebrow" class="dialog-eyebrow">{{ eyebrow }}</p>
    <component
      :is="headingAs"
      v-if="title"
      :id="titleId || undefined"
      class="dialog-title"
      :class="{ '!mt-0': flushTitle }"
    >
      {{ title }}
    </component>
    <p
      v-if="description"
      :id="descriptionId || undefined"
      class="dialog-description"
      :class="{ '!mt-0': flushDescription }"
    >
      {{ description }}
    </p>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    description?: string;
    descriptionId?: string;
    eyebrow?: string;
    flushDescription?: boolean;
    flushTitle?: boolean;
    headingAs?: "h2" | "h3" | "p";
    title?: string;
    titleId?: string;
  }>(),
  {
    description: "",
    descriptionId: "",
    eyebrow: "",
    flushDescription: false,
    flushTitle: false,
    headingAs: "h2",
    title: "",
    titleId: "",
  },
);
</script>
