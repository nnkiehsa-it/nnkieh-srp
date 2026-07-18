<template>
  <div class="space-y-2">
    <label class="field-label" :for="inputId">{{ label }}</label>
    <div class="control-frame">
      <textarea
        :id="inputId"
        v-model="value"
        class="block min-h-36 w-full resize-none bg-transparent px-4 py-3 text-base leading-6 text-ink-800 outline-none placeholder:text-ink-400 disabled:cursor-not-allowed disabled:text-ink-500 dark:text-ink-100 dark:placeholder:text-ink-500 md:text-sm"
        :maxlength="maxLength"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
      ></textarea>
      <div class="control-footer justify-end text-xs text-ink-500 dark:text-ink-400">
        <CharacterCount :current="value.length" :max="maxLength" :warning-at="warningLength" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import CharacterCount from '@/components/ui/atoms/CharacterCount.vue';

const value = defineModel<string>({ required: true });

withDefaults(defineProps<{
  disabled?: boolean;
  inputId: string;
  label: string;
  maxLength: number;
  placeholder?: string;
  required?: boolean;
  warningLength: number;
}>(), {
  disabled: false,
  placeholder: '',
  required: false,
});
</script>
