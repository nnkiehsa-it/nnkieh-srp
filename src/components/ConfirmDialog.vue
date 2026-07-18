<template>
  <DialogShell
    :open="open"
    :busy="busy"
    :labelled-by="title || eyebrow ? 'confirm-dialog-title' : ''"
    described-by="confirm-dialog-message"
    z-index-class="z-[100]"
    @close="handleCancel"
  >
    <DialogHeading
      heading-as="h3"
      :eyebrow="title && eyebrow ? t(eyebrow) : ''"
      :title="t(title || eyebrow)"
      :flush-title="Boolean(eyebrow && !title)"
      title-id="confirm-dialog-title"
      :description="t(message)"
      description-id="confirm-dialog-message"
      :flush-description="!title && !eyebrow"
    />

    <DialogActionRow>
      <AppButton
        variant="secondary"
        :disabled="busy"
        data-autofocus
        @click="handleCancel"
      >
        {{ t(cancelLabel) }}
      </AppButton>
      <AppButton
        :variant="danger ? 'danger' : 'primary'"
        :disabled="busy"
        @click="emit('confirm')"
      >
        <BusyButtonContent
          :busy="busy"
          :label="t(confirmLabel)"
          :busy-label="t('facility.processing')"
        />
      </AppButton>
    </DialogActionRow>
  </DialogShell>
</template>

<script setup lang="ts">
import DialogShell from "@/components/ui/organisms/DialogShell.vue";
import DialogActionRow from "@/components/ui/molecules/DialogActionRow.vue";
import DialogHeading from "@/components/ui/molecules/DialogHeading.vue";
import BusyButtonContent from "@/components/ui/atoms/BusyButtonContent.vue";
import AppButton from "@/components/ui/atoms/AppButton.vue";
import { useI18n } from "@/i18n";

const props = withDefaults(
  defineProps<{
    open: boolean;
    title?: string;
    message: string;
    eyebrow?: string;
    cancelLabel?: string;
    confirmLabel?: string;
    busy?: boolean;
    danger?: boolean;
  }>(),
  {
    title: "",
    eyebrow: "",
    cancelLabel: "issue.cancel",
    confirmLabel: "issue.confirm",
    busy: false,
    danger: true,
  },
);

const emit = defineEmits<{
  cancel: [];
  confirm: [];
}>();
const { t } = useI18n();

function handleCancel() {
  if (!props.busy) {
    emit("cancel");
  }
}
</script>
