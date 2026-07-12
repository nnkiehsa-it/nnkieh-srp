<template>
  <Teleport to="body">
    <TransitionGroup
      v-if="toasts.length > 0"
      name="toast"
      tag="div"
      class="toast-viewport pointer-events-none fixed left-1/2 z-[9999] w-[calc(100%-1.5rem)] max-w-[24rem] -translate-x-1/2"
      aria-live="polite"
      aria-atomic="true"
    >
      <div
        v-for="(toast, index) in toasts"
        :key="toast.id"
        class="toast-stack-item absolute inset-x-0 top-0 flex justify-center"
        :style="toastStackStyle(index)"
      >
        <div
          class="toast-card pointer-events-auto relative flex w-fit min-w-[11rem] max-w-full cursor-default select-none items-center gap-2.5 overflow-hidden rounded-xl border px-3 py-2.5 font-sans shadow-elevated backdrop-blur-xl sm:min-w-[12rem]"
          :class="toastClass(toast.kind)"
          role="status"
        >
          <span class="toast-icon grid h-7 w-7 shrink-0 place-items-center rounded-full" aria-hidden="true">
            <LoadingSpinner v-if="toast.kind === 'loading'" :size="4" />
            <span v-else class="material-symbols-outlined text-[17px] leading-none">{{ toastIcon(toast.kind) }}</span>
          </span>
          <p class="min-w-0 max-w-[18rem] flex-1 text-[13px] font-semibold leading-[1.35rem]">
            {{ toast.message }}
          </p>
          <span v-if="toast.kind === 'loading'" class="toast-progress absolute bottom-0 left-0 h-0.5" aria-hidden="true" />
        </div>
      </div>
    </TransitionGroup>
  </Teleport>
</template>

<script setup lang="ts">
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue';
import { useToast, type ToastKind } from '@/composables/useToast';

const { toasts } = useToast();

function toastStackStyle(index: number) {
  return {
    opacity: String(1 - index * 0.16),
    transform: `translateY(${index * 9}px) scale(${1 - index * 0.035})`,
    zIndex: String(10 - index),
  };
}

function toastClass(kind: ToastKind) {
  if (kind === 'success') {
    return 'border-primary/25 bg-white/88 text-on-primary-container dark:bg-ink-900/88 dark:text-primary';
  }
  if (kind === 'error') {
    return 'border-error/25 bg-white/88 text-error dark:bg-ink-900/88 dark:text-error';
  }
  if (kind === 'loading') {
    return 'border-primary/30 bg-white/92 text-on-primary-container dark:bg-ink-900/92 dark:text-primary';
  }
  return 'border-secondary/25 bg-white/88 text-on-secondary-container dark:bg-ink-900/88 dark:text-secondary';
}

function toastIcon(kind: ToastKind) {
  if (kind === 'success') {
    return 'check_circle';
  }
  if (kind === 'error') {
    return 'error';
  }
  return 'info';
}
</script>

<style scoped>
.toast-card {
  box-shadow: 0 12px 30px rgb(15 23 42 / 0.14), 0 2px 8px rgb(15 23 42 / 0.07);
}

.toast-stack-item {
  transform-origin: top center;
  transition:
    opacity 0.28s var(--motion-ease),
    transform 0.38s var(--motion-ease-enter);
}

.toast-icon {
  background: color-mix(in srgb, currentColor 11%, transparent);
}

.toast-progress {
  width: 42%;
  background: linear-gradient(90deg, transparent, currentColor 40%, currentColor 60%, transparent);
  animation: toast-progress 1.6s linear infinite;
  transform: translateX(-110%);
  will-change: transform;
}

@keyframes toast-progress {
  to { transform: translateX(350%); }
}

@media (prefers-reduced-motion: reduce) {
  .toast-progress { animation: none; transform: none; }
}
</style>
