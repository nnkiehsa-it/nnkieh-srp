<template>
  <RoutePageFrame padding="responsive">
    <div class="mx-auto w-full max-w-4xl py-4">
      <div v-if="!languageConfirmed" class="mx-auto max-w-2xl space-y-5">
        <div class="text-center">
          <p class="text-xs font-bold uppercase tracking-[0.16em] text-primary-600">{{ t('categoryAdmin.initialSetup') }}</p>
          <h1 class="mt-2 text-2xl font-bold text-ink-950 dark:text-ink-50">{{ t('categoryAdmin.chooseLanguageTitle') }}</h1>
          <p class="mx-auto mt-2 max-w-xl text-sm leading-6 text-ink-500">{{ t('categoryAdmin.chooseLanguageDescription') }}</p>
        </div>
        <SurfacePanel variant="list">
          <LanguageSelector />
        </SurfacePanel>
        <div class="flex justify-end">
          <AppButton type="button" variant="primary" @click="languageConfirmed = true">
            {{ t('categoryAdmin.continueSetup') }}
          </AppButton>
        </div>
      </div>

      <SurfacePanel v-else-if="!isAdmin" padding="lg" class="text-center">
        <AppIcon name="refresh" :size="8" class="mx-auto text-ink-400" />
        <h1 class="mt-4 text-xl font-bold text-ink-950 dark:text-ink-50">{{ t('categoryAdmin.setupWaitingTitle') }}</h1>
        <p class="mx-auto mt-2 max-w-xl text-sm leading-6 text-ink-500">{{ t('categoryAdmin.setupWaitingDescription') }}</p>
      </SurfacePanel>

      <form v-else class="space-y-5" @submit.prevent="submitSetup">
        <div>
          <p class="text-xs font-bold uppercase tracking-[0.16em] text-primary-600">{{ t('categoryAdmin.initialSetup') }}</p>
          <h1 class="mt-2 text-2xl font-bold text-ink-950 dark:text-ink-50">{{ t('categoryAdmin.setupTitle') }}</h1>
          <p class="mt-2 max-w-2xl text-sm leading-6 text-ink-500">{{ t('categoryAdmin.setupDescription') }}</p>
        </div>

        <PillSegmentedControl v-model="activeCategoryKind" :options="kindOptions" />

        <SetupCategorySection
          v-if="activeCategoryKind === 'issue'"
          v-model="issueCategories"
          kind="issue"
          :title="t('categoryAdmin.proposalCategories')"
          :description="t('categoryAdmin.proposalSetupHelp')"
          @add="addIssueCategory"
        />
        <SetupCategorySection
          v-else
          v-model="facilityCategories"
          kind="facility"
          :title="t('categoryAdmin.facilityCategories')"
          :description="t('categoryAdmin.facilitySetupHelp')"
          @add="addFacilityCategory"
        />

        <InlineMessage v-if="error">{{ error }}</InlineMessage>
        <div class="flex justify-end">
          <AppButton type="submit" variant="primary" :disabled="saving">
            <BusyButtonContent :busy="saving" :label="t('categoryAdmin.completeSetup')" :busy-label="t('categoryAdmin.completingSetup')" />
          </AppButton>
        </div>
      </form>
    </div>
  </RoutePageFrame>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import LanguageSelector from '@/components/LanguageSelector.vue';
import SetupCategorySection from '@/components/categories/SetupCategorySection.vue';
import AppButton from '@/components/ui/atoms/AppButton.vue';
import AppIcon from '@/components/ui/atoms/AppIcon.vue';
import BusyButtonContent from '@/components/ui/atoms/BusyButtonContent.vue';
import InlineMessage from '@/components/ui/atoms/InlineMessage.vue';
import SurfacePanel from '@/components/ui/molecules/SurfacePanel.vue';
import RoutePageFrame from '@/components/ui/organisms/RoutePageFrame.vue';
import PillSegmentedControl from '@/components/ui/molecules/PillSegmentedControl.vue';
import type { PillSegmentedControlOption } from '@/components/ui/molecules/PillSegmentedControl.vue';
import { useCategories } from '@/composables/useCategories';
import { useSession } from '@/composables/useSession';
import { useI18n } from '@/i18n';
import { completeInitialSetup } from '@/services/categories';
import type { FacilityCategoryDraft, IssueCategoryDraft } from '@/types/categories';
import { getDefaultIssueRouteFilter } from '@/constants/categories';

const router = useRouter();
const { t } = useI18n();
const { isAdmin, refreshSessionAccess, setupCompleted } = useSession();
const { refresh } = useCategories();
const saving = ref(false);
const error = ref('');
const languageConfirmed = ref(false);
const activeCategoryKind = ref<'issue' | 'facility'>('issue');
const kindOptions = computed<readonly PillSegmentedControlOption<'issue' | 'facility'>[]>(() => [
  { value: 'issue', label: t('categoryAdmin.proposalCategories'), icon: 'comment' },
  { value: 'facility', label: t('categoryAdmin.facilityCategories'), icon: 'wrench' },
]);

function newIssueCategory(): IssueCategoryDraft {
  return {
    id: '', label: '', readAccess: '', authorVisible: null,
    supportEnabled: false, supportGoal: null, supportDeadlineDays: null,
    responseDeadlineDays: null, commentsEnabled: true,
  };
}
function newFacilityCategory(): FacilityCategoryDraft { return { id: '', label: '' }; }
const issueCategories = ref<IssueCategoryDraft[]>([newIssueCategory()]);
const facilityCategories = ref<FacilityCategoryDraft[]>([newFacilityCategory()]);
function addIssueCategory() { issueCategories.value.push(newIssueCategory()); }
function addFacilityCategory() { facilityCategories.value.push(newFacilityCategory()); }

async function submitSetup() {
  saving.value = true;
  error.value = '';
  try {
    await completeInitialSetup({ issueCategories: issueCategories.value, facilityCategories: facilityCategories.value });
    await refreshSessionAccess();
    await refresh();
    await router.replace({ name: 'issues', params: { filter: getDefaultIssueRouteFilter() } });
  } catch (caught) {
    try {
      await refreshSessionAccess();
      if (setupCompleted.value) {
        await refresh();
        await router.replace({ name: 'issues', params: { filter: getDefaultIssueRouteFilter() } });
        return;
      }
    } catch {
      // Preserve the original setup failure when the completion state cannot be confirmed.
    }
    error.value = t(caught instanceof Error ? caught.message : 'common.saveFailed');
  } finally {
    saving.value = false;
  }
}
</script>
