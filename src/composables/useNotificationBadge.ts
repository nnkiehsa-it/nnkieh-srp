import { readonly, ref, watch } from 'vue';
import { useSession } from '@/composables/useSession';
import { registerAppResumeHandler } from '@/composables/useAppResume';
import { fetchNotificationUnreadHint, subscribeNotificationBadge } from '@/services/notifications';

const hasUnread = ref(false);
let initialized = false;
let unsubscribe: (() => void) | null = null;
let version = 0;
let refreshCurrentUnread = () => undefined;

export function setNotificationBadgeUnread(value: boolean) {
  hasUnread.value = value;
}

export function useNotificationBadge() {
  const { isAdmin, roleLoading, user } = useSession();
  if (!initialized) {
    initialized = true;
    registerAppResumeHandler(() => refreshCurrentUnread());
    watch(
      () => [user.value?.uid ?? '', isAdmin.value, roleLoading.value] as const,
      ([uid, admin, waiting]) => {
        unsubscribe?.();
        unsubscribe = null;
        hasUnread.value = false;
        refreshCurrentUnread = () => undefined;
        const currentVersion = ++version;
        if (!uid || waiting) return;
        const refresh = () => {
          void fetchNotificationUnreadHint().then((value) => {
            if (currentVersion === version) hasUnread.value = value;
          }).catch(() => undefined);
        };
        refreshCurrentUnread = refresh;
        refresh();
        unsubscribe = subscribeNotificationBadge(
          uid,
          admin,
          () => { hasUnread.value = true; },
          refresh,
          refresh,
        );
      },
      { immediate: true },
    );
  }
  return { hasUnread: readonly(hasUnread) };
}
