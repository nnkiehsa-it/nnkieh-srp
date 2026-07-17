<template>
  <section class="route-page page-bottom-safe min-h-0 min-w-0 flex-1">
    <div v-if="loading" class="space-y-6 py-4">
      <!-- Account Skeleton -->
      <div class="flex items-center gap-3 pb-4 border-b border-ink-100 dark:border-ink-800/60">
        <span class="h-10 w-10 shrink-0 rounded-full bg-ink-200/60 dark:bg-ink-700/50 animate-skeleton"></span>
        <div class="min-w-0 flex-1 space-y-2">
          <span class="block h-4 w-32 rounded bg-ink-200/60 dark:bg-ink-700/50 animate-skeleton"></span>
          <span class="block h-3 w-48 rounded bg-ink-200/60 dark:bg-ink-700/50 animate-skeleton"></span>
        </div>
        <span class="h-10 w-16 rounded-xl bg-ink-200/60 dark:bg-ink-700/50 animate-skeleton"></span>
      </div>

      <!-- Push Notifications Skeleton -->
      <div class="pb-4 border-b border-ink-100 dark:border-ink-800/60 space-y-2">
        <span class="block h-4 w-24 rounded bg-ink-200/60 dark:bg-ink-700/50 animate-skeleton"></span>
        <span class="block h-3 w-3/4 rounded bg-ink-200/60 dark:bg-ink-700/50 animate-skeleton"></span>
      </div>

      <!-- Notification Types Skeleton -->
      <div class="space-y-3 pb-4 border-b border-ink-100 dark:border-ink-800/60">
        <span class="block h-4 w-20 rounded bg-ink-200/60 dark:bg-ink-700/50 animate-skeleton"></span>
        <div class="space-y-2">
          <div class="flex items-center justify-between border-b border-ink-100 py-3 dark:border-ink-800/60">
            <div class="space-y-2 flex-1">
              <span class="block h-4 w-24 rounded bg-ink-200/60 dark:bg-ink-700/50 animate-skeleton"></span>
              <span class="block h-3 w-2/3 rounded bg-ink-200/60 dark:bg-ink-700/50 animate-skeleton"></span>
            </div>
            <span class="h-6 w-11 rounded-full bg-ink-200/60 dark:bg-ink-700/50 animate-skeleton"></span>
          </div>
          <div class="flex items-center justify-between border-b border-ink-100 py-3 dark:border-ink-800/60">
            <div class="space-y-2 flex-1">
              <span class="block h-4 w-24 rounded bg-ink-200/60 dark:bg-ink-700/50 animate-skeleton"></span>
              <span class="block h-3 w-2/3 rounded bg-ink-200/60 dark:bg-ink-700/50 animate-skeleton"></span>
            </div>
            <span class="h-6 w-11 rounded-full bg-ink-200/60 dark:bg-ink-700/50 animate-skeleton"></span>
          </div>
        </div>
      </div>
    </div>
    <SettingsPanelContent
      v-else-if="user"
      :display-name="user.displayName || t('text.958465555d00')"
      :display-photo-url="displayPhotoUrl"
      :email="user.email || ''"
      :uid="user.uid"
      :is-admin="isAdmin"
      :can-manage-roles="can('role.manage')"
      :personal-notification-options="personalNotificationOptions"
      :personal-preferences="personalPreferences"
      :push-action-label="pushActionLabel"
      :push-enabled="pushEnabled"
      :push-error="pushError"
      :push-loading="pushLoading"
      :push-status-description="pushStatusDescription"
      :show-close="false"
      :flat="true"
      @logout="handleLogout"
      @restart-app="handleRestartApp"
      @set-preference="handleSetPersonalPushPreference"
      @switch-account="switchAccount"
      @toggle-push="handlePushAction"
    />
    <div v-else class="flex flex-col items-center justify-center p-12 text-center">
      <p class="text-sm text-ink-500 dark:text-ink-400 mb-4">{{ t('text.344bea305193') }}</p>
      <GoogleLoginButton :loading="loading" @login="login" />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import GoogleLoginButton from '@/components/ui/GoogleLoginButton.vue';
import SettingsPanelContent from '@/components/SettingsPanelContent.vue';
import { usePushNotifications } from '@/composables/usePushNotifications';
import { useAppUpdate } from '@/composables/useAppUpdate';
import { useSession } from '@/composables/useSession';
import { useActionFeedback } from '@/composables/useActionFeedback';
import { useI18n } from '@/i18n';
import type { PersonalPushPreferenceKey } from '@/services/notifications';

const router = useRouter();
const { user, customPhotoUrl, loading, login, logout, can } = useSession();
const isAdmin = computed(() => can('dashboard.view'));
const { reloadApp } = useAppUpdate();
const {
  enabled: pushEnabled,
  error: pushError,
  initialized: pushInitialized,
  loading: pushLoading,
  permission: pushPermission,
  personalPreferences,
  requiresPwaInstall: pushRequiresPwaInstall,
  supported: pushSupported,
  disablePushNotifications,
  enablePushNotifications,
  refreshPushPreference,
  setPersonalPushPreference,
} = usePushNotifications();
const { start } = useActionFeedback();
const { t } = useI18n();

const displayPhotoUrl = computed(() => customPhotoUrl.value || user.value?.photoURL || null);

const personalNotificationOptions = computed<Array<{
  description: string;
  key: PersonalPushPreferenceKey;
  label: string;
}>>(() => [
  {
    key: 'comments',
    label: t('text.0d9fb2056353'),
    description: t('text.b5e810141cba'),
  },
  {
    key: 'issueUpdates',
    label: t('text.36010d7aec28'),
    description: t('text.5cacedb67db7'),
  },
  {
    key: 'facilityUpdates',
    label: t('text.56a38f584eb6'),
    description: t('text.3f877e7570bf'),
  },
]);

const pushStatusDescription = computed(() => {
  if (!pushInitialized.value && pushLoading.value) return t('text.91f9a1b83c5d');
  if (pushRequiresPwaInstall.value) return t('text.50877fdf94ee');
  if (!pushSupported.value) return t('text.47a0cc307d22');
  if (pushPermission.value === 'denied') return t('text.4015cf13848f');
  if (pushEnabled.value) return t('text.a210dde44bfd');
  return t('text.25f897cd58df');
});

const pushActionLabel = computed(() => {
  if (pushRequiresPwaInstall.value) return t('text.11cd98fc0ade');
  if (!pushSupported.value || pushPermission.value === 'denied') return '';
  return pushEnabled.value ? t('text.f64df8471d40') : t('text.0cf38dc7c7ff');
});

onMounted(() => {
  void refreshPushPreference();
});

const handleLogout = async () => {
  if (pushEnabled.value) {
    try {
      await disablePushNotifications();
    } catch {
      void 0;
    }
  }
  await logout();
  router.push({ name: 'login' });
};

async function switchAccount() {
  if (pushEnabled.value) {
    try {
      await disablePushNotifications();
    } catch {
      void 0;
    }
  }
  await login({ selectAccount: true });
}

async function handlePushAction() {
  if (!pushActionLabel.value) return;
  const feedbackHandle = start(t('text.3d45fd9a2cc0'));
  const succeeded = pushEnabled.value
    ? await disablePushNotifications()
    : await enablePushNotifications();
  if (succeeded) {
    feedbackHandle.succeed(t('text.40cfbc9acf60'));
  } else {
    feedbackHandle.fail(pushError.value || t('text.1073b7bdd0ea'));
  }
}

async function handleSetPersonalPushPreference(key: PersonalPushPreferenceKey, value: boolean) {
  const feedbackHandle = start(t('text.7e8af57c3502'));
  const succeeded = await setPersonalPushPreference(key, value);
  if (succeeded) {
    feedbackHandle.succeed(t('text.eb44d2e4abab'));
  } else {
    feedbackHandle.fail(pushError.value || t('text.acdf2f6d26e7'));
  }
}

async function handleRestartApp() {
  await reloadApp();
}
</script>
