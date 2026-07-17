import { computed, ref, watch, type Ref } from 'vue';
import { useSession } from '@/composables/useSession';
import { useActionFeedback } from '@/composables/useActionFeedback';
import { removeSupport, toggleSupport } from '@/services/issues';
import { isContentUnavailableError } from '@/services/issues-core';
import { useI18n } from '@/i18n';

interface VoteSupportOptions {
  issueId: Ref<string>;
  currentUserSupported: Ref<boolean>;
  supportCount: Ref<number>;
  supportClosed: Ref<boolean>;
  statusLabel: Ref<string | undefined>;
  onSupported: (payload: { supported: boolean; supportCount: number }) => void;
  onContentUnavailable?: (issueId: string) => void;
}

export function useVoteSupport(options: VoteSupportOptions) {
  const { user } = useSession();
  const { show, start } = useActionFeedback();
  const { t } = useI18n();
  const busy = ref(false);
  const optimisticSupported = ref(options.currentUserSupported.value);

  watch(options.currentUserSupported, (value) => {
    optimisticSupported.value = value;
  });

  const displaySupportCount = computed(() => {
    if (optimisticSupported.value === options.currentUserSupported.value) {
      return options.supportCount.value;
    }

    let count = options.supportCount.value;
    if (options.currentUserSupported.value) {
      count -= 1;
    }
    if (optimisticSupported.value) {
      count += 1;
    }
    return count;
  });

  const supportClass = computed(() =>
    optimisticSupported.value
      ? 'button-icon-pill-filled'
      : 'button-icon-pill',
  );

  async function toggle() {
    if (!user.value) {
      show('text.bf20e0da3353', 'error');
      return;
    }

    if (options.supportClosed.value) {
      return;
    }

    const nextSupported = !optimisticSupported.value;
    const previousSupported = optimisticSupported.value;
    optimisticSupported.value = nextSupported;
    busy.value = true;
    const feedbackHandle = start(nextSupported ? 'text.b67db3599ffb' : 'text.340fde67b81c');

    try {
      const result = nextSupported
        ? await toggleSupport(options.issueId.value)
        : await removeSupport(options.issueId.value);

      optimisticSupported.value = result.supported;
      options.onSupported({
        supported: result.supported,
        supportCount: result.support_count,
      });
      feedbackHandle.succeed(result.supported ? 'text.d999eb051cdb' : 'text.36f4986ab543');
    } catch (err) {
      optimisticSupported.value = previousSupported;
      const errMsg = err instanceof Error ? err.message : '';
      if (isContentUnavailableError(err)) {
        feedbackHandle.fail(errMsg || 'text.12ce5ad1f08e');
        options.onContentUnavailable?.(options.issueId.value);
      } else if (errMsg.includes('permission-denied') || errMsg.toLowerCase().includes('permission denied')) {
        feedbackHandle.fail(
          options.statusLabel.value
            ? t('issue.support.closedStatus', { status: options.statusLabel.value })
            : 'text.e10f653fd4ad',
        );
      } else {
        feedbackHandle.fail('text.e24894729060');
      }
    } finally {
      busy.value = false;
    }
  }

  return {
    busy,
    optimisticSupported,
    displaySupportCount,
    supportClass,
    toggle,
  };
}
