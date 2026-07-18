<template>
  <div ref="rootRef" class="relative inline-block text-left">
    <slot name="trigger" :open="open" :toggle="toggle" />

    <Teleport to="body">
      <transition name="popover">
        <DropdownPanel
          v-if="open"
          ref="panelComponentRef"
          class="fixed z-[120] origin-top-right"
          :class="panelClass"
          :size="size"
          :style="dropdownStyle"
          @click.stop
          @pointerdown.stop
        >
          <slot :close="close" />
        </DropdownPanel>
      </transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, useTemplateRef } from 'vue';
import DropdownPanel from '@/components/ui/molecules/DropdownPanel.vue';
import { useClickOutside } from '@/composables/useClickOutside';
import { useDropdownPosition } from '@/composables/useDropdownPosition';

const props = withDefaults(defineProps<{
  fallbackHeight?: number;
  panelClass?: string;
  size?: 'compact' | 'default' | 'search';
  width?: number;
}>(), {
  fallbackHeight: 160,
  panelClass: '',
  size: 'compact',
  width: 176,
});

const open = ref(false);
const rootRef = useTemplateRef<HTMLElement>('rootRef');
const panelComponentRef = useTemplateRef<InstanceType<typeof DropdownPanel>>('panelComponentRef');
const panelRef = computed(() => panelComponentRef.value?.$el as HTMLElement | null);
const { dropdownStyle } = useDropdownPosition(
  rootRef,
  open,
  { fallbackHeight: props.fallbackHeight, width: props.width },
  panelRef,
);

function close() {
  open.value = false;
}

function toggle() {
  open.value = !open.value;
}

useClickOutside(open, [rootRef, panelRef], close);

defineSlots<{
  default(props: { close: () => void }): unknown;
  trigger(props: { open: boolean; toggle: () => void }): unknown;
}>();
</script>
