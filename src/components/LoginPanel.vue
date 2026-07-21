<template>
  <SurfacePanel as="section" padding="lg" class="relative mx-auto flex w-full max-w-2xl flex-col items-center justify-center overflow-hidden px-6 py-12 text-center sm:px-12">
    <DecorativeGlow size="md" />

    <div class="relative z-10 flex max-w-md flex-col items-center space-y-6">
      <IconTile size="xl" tone="inverse" elevation="card" aria-hidden="true">
        <AppIcon name="shield-check" :size="8" :stroke-width="1.5" />
      </IconTile>

      <div class="space-y-3">
        <h2 class="text-2xl font-semibold tracking-[0.015em] text-ink-950 dark:text-ink-50 sm:text-3xl">{{ t('auth.signInWithASchoolAccount') }}</h2>
        <p class="text-sm leading-relaxed text-ink-500 dark:text-ink-400">
          {{ t('auth.useYour') }}
          <span class="font-semibold text-ink-800 dark:text-ink-100">{{ t('auth.schoolGoogleAccount') }} (@{{ allowedDomain || t('auth.configuredSchoolDomain') }})</span>
          {{ t('auth.toContinue') }}
        </p>
      </div>

      <div class="flex w-full flex-col items-center gap-3">
        <GoogleLoginButton :loading="loginBusy" @login="login" />

        <InlineAlert v-if="error" as="p" tone="error" compact class="mt-2 max-w-sm">
          {{ t(error) }}
        </InlineAlert>
      </div>
    </div>
  </SurfacePanel>
</template>

<script setup lang="ts">
import DecorativeGlow from '@/components/ui/atoms/DecorativeGlow.vue';
import IconTile from '@/components/ui/atoms/IconTile.vue';
import GoogleLoginButton from '@/components/ui/molecules/GoogleLoginButton.vue';
import SurfacePanel from '@/components/ui/molecules/SurfacePanel.vue';
import AppIcon from '@/components/ui/atoms/AppIcon.vue';
import InlineAlert from '@/components/ui/atoms/InlineAlert.vue';
import { useSession } from '@/composables/useSession';
import { useI18n } from '@/i18n';

const { allowedDomain, error, login, loginBusy } = useSession();
const { t } = useI18n();
</script>
