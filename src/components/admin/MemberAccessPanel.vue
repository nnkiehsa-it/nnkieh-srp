<template>
  <section class="space-y-5" aria-labelledby="member-access-title">
    <SectionHeader
      id="member-access-title"
      :title="t('adminCenter.memberSectionTitle')"
      :description="t('adminCenter.memberSectionDescription')"
    />

    <SurfacePanel as="form" padding="lg" @submit.prevent="findUser">
      <div class="flex items-start gap-3">
        <span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink-950 text-xs font-bold text-white dark:bg-ink-50 dark:text-ink-950">1</span>
        <div class="min-w-0 flex-1">
          <label for="access-user-lookup" class="block text-sm font-bold text-ink-950 dark:text-ink-50">
            {{ t('adminCenter.findMemberStep') }}
          </label>
          <p class="mt-1 text-xs leading-5 text-ink-500">{{ t('adminCenter.findMemberHelp') }}</p>
          <div class="mt-3 flex flex-col gap-2 sm:flex-row">
            <input
              id="access-user-lookup"
              v-model="lookup"
              class="field min-w-0 flex-1"
              autocomplete="off"
              inputmode="email"
              :placeholder="t('access.enterYourCampusEmailOrUid')"
              :disabled="loading || Boolean(savingUid)"
            />
            <AppButton type="submit" variant="primary" class="shrink-0" :disabled="loading || Boolean(savingUid) || !lookup.trim()">
              <BusyButtonContent :busy="loading" :label="t('access.find')" :busy-label="t('access.searching')" />
            </AppButton>
          </div>
        </div>
      </div>
    </SurfacePanel>

    <EmptyStatePanel v-if="error && !user" title="access.unableToFindUser" :description="error" icon="warning" />
    <EmptyStatePanel
      v-else-if="!user"
      title="adminCenter.noMemberSelected"
      description="adminCenter.noMemberSelectedHelp"
      icon="lock"
    />

    <SurfacePanel v-else as="article" padding="lg" class="space-y-6">
      <div class="flex items-start gap-3 border-b border-ink-100 pb-5 dark:border-ink-800">
        <UserAvatar :photo-url="user.photoUrl" :name="user.name" size="md" />
        <div class="min-w-0 flex-1">
          <h2 class="truncate text-base font-bold text-ink-900 dark:text-ink-100">{{ user.name }}</h2>
          <p class="mt-0.5 truncate text-xs text-ink-500">{{ user.email || user.uid }}</p>
          <p class="mt-2 text-xs font-semibold text-primary-700 dark:text-primary-300">{{ accessSummary }}</p>
        </div>
        <span v-if="savingUid" class="text-xs font-semibold text-ink-500">{{ t('common.saving') }}</span>
      </div>

      <div class="flex items-start gap-3">
        <span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink-950 text-xs font-bold text-white dark:bg-ink-50 dark:text-ink-950">2</span>
        <div class="min-w-0 flex-1">
          <h3 class="text-sm font-bold text-ink-950 dark:text-ink-50">{{ t('adminCenter.assignResponsibilityStep') }}</h3>
          <p class="mt-1 text-xs leading-5 text-ink-500">{{ t('adminCenter.assignResponsibilityHelp') }}</p>
        </div>
      </div>

      <!-- Access Mode Select Buttons -->
      <div class="grid gap-3 sm:grid-cols-2">
        <SelectionOptionButton
          label="adminCenter.platformAdminTitle"
          :description="t('adminCenter.platformAdminDesc')"
          :selected="isPlatformAdmin"
          :disabled="Boolean(savingUid)"
          @select="selectPlatformAdmin"
        />
        <SelectionOptionButton
          label="adminCenter.scopedManagerTitle"
          :description="t('adminCenter.scopedManagerDesc')"
          :selected="!isPlatformAdmin"
          :disabled="Boolean(savingUid)"
          @select="selectScopedManager"
        />
      </div>

      <!-- Scoped responsibilities configuration (Accordions) -->
      <div v-if="!isPlatformAdmin" class="space-y-3">
        <!-- Proposal manager accordion -->
        <SurfacePanel variant="control" padding="sm" class="overflow-hidden">
          <button
            type="button"
            class="flex w-full items-center justify-between p-2 text-left font-bold text-sm text-ink-950 dark:text-ink-50"
            @click="toggleSection('issue')"
          >
            <span class="flex items-center gap-2">
              <AppIcon name="comment" :size="4" class="text-primary-600 dark:text-primary-400" />
              <span>{{ t('adminCenter.proposalResponsibility') }}</span>
              <span class="text-xs font-normal text-ink-500">
                ({{ t('adminCenter.categoryListCount', { count: draftIssueCategoryIds.length }) }})
              </span>
            </span>
            <AppIcon
              name="chevron-down"
              :size="4"
              class="transform transition-transform duration-200"
              :class="expandedSection === 'issue' ? 'rotate-180' : ''"
            />
          </button>
          
          <div
            v-show="expandedSection === 'issue'"
            class="border-t border-ink-100 mt-2 pt-3 px-2 pb-2 space-y-2 dark:border-ink-800 animate-fade-in"
          >
            <p class="text-xs leading-5 text-ink-500 pb-1">{{ t('adminCenter.proposalResponsibilityHelp') }}</p>
            <div v-if="activeIssueCategories.length === 0" class="text-xs text-ink-400 py-2">
              {{ t('categoryAdmin.noCategoriesAvailable') }}
            </div>
            <div v-else class="grid gap-2 sm:grid-cols-2">
              <SelectionOptionButton
                v-for="category in activeIssueCategories"
                :key="category.id"
                :label="category.label"
                :description="t('access.reviewAndManageProposalsInCategory', { category: category.label })"
                :selected="draftIssueCategoryIds.includes(category.id)"
                :disabled="Boolean(savingUid)"
                @click="toggleCategory(category.id)"
              />
            </div>
          </div>
        </SurfacePanel>

        <!-- Facility manager accordion -->
        <SurfacePanel variant="control" padding="sm" class="overflow-hidden">
          <button
            type="button"
            class="flex w-full items-center justify-between p-2 text-left font-bold text-sm text-ink-950 dark:text-ink-50"
            @click="toggleSection('facility')"
          >
            <span class="flex items-center gap-2">
              <AppIcon name="wrench" :size="4" class="text-primary-600 dark:text-primary-400" />
              <span>{{ t('adminCenter.facilityResponsibility') }}</span>
              <span class="text-xs font-normal text-ink-500">
                ({{ t('adminCenter.categoryListCount', { count: draftFacilityCategoryIds.length }) }})
              </span>
            </span>
            <AppIcon
              name="chevron-down"
              :size="4"
              class="transform transition-transform duration-200"
              :class="expandedSection === 'facility' ? 'rotate-180' : ''"
            />
          </button>

          <div
            v-show="expandedSection === 'facility'"
            class="border-t border-ink-100 mt-2 pt-3 px-2 pb-2 space-y-2 dark:border-ink-800"
          >
            <p class="text-xs leading-5 text-ink-500 pb-1">{{ t('adminCenter.facilityResponsibilityHelp') }}</p>
            <div v-if="activeFacilityCategories.length === 0" class="text-xs text-ink-400 py-2">
              {{ t('categoryAdmin.noCategoriesAvailable') }}
            </div>
            <div v-else class="grid gap-2 sm:grid-cols-2">
              <SelectionOptionButton
                v-for="category in activeFacilityCategories"
                :key="category.id"
                :label="category.label"
                :description="t('access.handleFacilityReportsInCategory', { category: category.label })"
                :selected="draftFacilityCategoryIds.includes(category.id)"
                :disabled="Boolean(savingUid)"
                @click="toggleFacilityCategory(category.id)"
              />
            </div>
          </div>
        </SurfacePanel>

        <!-- Other manager accordion (Announcement) -->
        <SurfacePanel variant="control" padding="sm" class="overflow-hidden">
          <button
            type="button"
            class="flex w-full items-center justify-between p-2 text-left font-bold text-sm text-ink-950 dark:text-ink-50"
            @click="toggleSection('other')"
          >
            <span class="flex items-center gap-2">
              <AppIcon name="megaphone" :size="4" class="text-primary-600 dark:text-primary-400" />
              <span>{{ t('adminCenter.otherResponsibility') }}</span>
              <span class="text-xs font-normal text-ink-500">
                ({{ draftRoles.includes('announcement-manager') ? 1 : 0 }})
              </span>
            </span>
            <AppIcon
              name="chevron-down"
              :size="4"
              class="transform transition-transform duration-200"
              :class="expandedSection === 'other' ? 'rotate-180' : ''"
            />
          </button>

          <div
            v-show="expandedSection === 'other'"
            class="border-t border-ink-100 mt-2 pt-3 px-2 pb-2 space-y-2 dark:border-ink-800"
          >
            <p class="text-xs leading-5 text-ink-500 pb-1">{{ t('adminCenter.otherResponsibilityHelp') }}</p>
            <SelectionOptionButton
              label="access.announcementManagement"
              description="access.publishAndDeleteAnnouncements"
              :selected="draftRoles.includes('announcement-manager')"
              :disabled="Boolean(savingUid)"
              @click="toggleScopedRole('announcement-manager')"
            />
          </div>
        </SurfacePanel>
      </div>

      <InlineMessage v-if="error">{{ error }}</InlineMessage>

      <!-- Save / Reset actions row, only active when hasChanges is true -->
      <div class="flex items-center justify-between gap-3 border-t border-ink-100 pt-5 dark:border-ink-800">
        <p class="text-xs leading-5 text-ink-500">
          {{ t('adminCenter.autoSaveHelp') }}
        </p>
        <div class="flex items-center gap-3">
          <AppButton
            v-if="hasChanges"
            variant="secondary"
            :disabled="Boolean(savingUid)"
            @click="resetChanges"
          >
            {{ t('common.reset') }}
          </AppButton>
          <AppButton
            variant="primary"
            :disabled="!hasChanges || Boolean(savingUid)"
            @click="saveChanges"
          >
            <BusyButtonContent :busy="Boolean(savingUid)" :label="t('common.save')" :busy-label="t('common.saving')" />
          </AppButton>
        </div>
      </div>
    </SurfacePanel>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import AppButton from '@/components/ui/atoms/AppButton.vue';
import AppIcon from '@/components/ui/atoms/AppIcon.vue';
import BusyButtonContent from '@/components/ui/atoms/BusyButtonContent.vue';
import InlineMessage from '@/components/ui/atoms/InlineMessage.vue';
import UserAvatar from '@/components/ui/atoms/UserAvatar.vue';
import EmptyStatePanel from '@/components/ui/molecules/EmptyStatePanel.vue';
import SectionHeader from '@/components/ui/molecules/SectionHeader.vue';
import SelectionOptionButton from '@/components/ui/molecules/SelectionOptionButton.vue';
import SurfacePanel from '@/components/ui/molecules/SurfacePanel.vue';
import { useActionFeedback } from '@/composables/useActionFeedback';
import { useCategories } from '@/composables/useCategories';
import { useI18n } from '@/i18n';
import { listRoleAssignments, setUserRoles, type AccessUser } from '@/services/access';
import type { RoleCode } from '@/services/session-role';

const lookup = ref('');
const { t } = useI18n();
const { activeFacilityCategories, activeIssueCategories, refresh } = useCategories();
const { show } = useActionFeedback();
const user = ref<AccessUser | null>(null);
const loading = ref(false);
const error = ref('');
const savingUid = ref('');
const expandedSection = ref<'issue' | 'facility' | 'other' | null>(null);

// Draft state
const draftRoles = ref<RoleCode[]>([]);
const draftIssueCategoryIds = ref<string[]>([]);
const draftFacilityCategoryIds = ref<string[]>([]);

const isPlatformAdmin = computed(() => draftRoles.value.includes('platform-admin'));

const responsibilityCount = computed(() => {
  if (!user.value || isPlatformAdmin.value) return 0;
  return draftIssueCategoryIds.value.length
    + draftFacilityCategoryIds.value.length
    + Number(draftRoles.value.includes('announcement-manager'));
});

const accessSummary = computed(() => isPlatformAdmin.value
  ? t('adminCenter.fullAccessSummary')
  : t('adminCenter.scopedAccessSummary', { count: responsibilityCount.value }));

// Compare current draft with original database values
const hasChanges = computed(() => {
  if (!user.value) return false;

  const sameRoles = draftRoles.value.length === user.value.roles.length &&
    draftRoles.value.every(r => user.value!.roles.includes(r));

  const sameIssues = draftIssueCategoryIds.value.length === user.value.managedIssueCategoryIds.length &&
    draftIssueCategoryIds.value.every(id => user.value!.managedIssueCategoryIds.includes(id));

  const sameFacilities = draftFacilityCategoryIds.value.length === user.value.managedFacilityCategoryIds.length &&
    draftFacilityCategoryIds.value.every(id => user.value!.managedFacilityCategoryIds.includes(id));

  return !sameRoles || !sameIssues || !sameFacilities;
});

function resetChanges() {
  if (!user.value) {
    draftRoles.value = [];
    draftIssueCategoryIds.value = [];
    draftFacilityCategoryIds.value = [];
    return;
  }
  draftRoles.value = [...user.value.roles];
  draftIssueCategoryIds.value = [...user.value.managedIssueCategoryIds];
  draftFacilityCategoryIds.value = [...user.value.managedFacilityCategoryIds];
}

watch(user, () => {
  resetChanges();
  expandedSection.value = null;
}, { immediate: true });

function toggleSection(section: 'issue' | 'facility' | 'other') {
  expandedSection.value = expandedSection.value === section ? null : section;
}

async function findUser() {
  const query = lookup.value.trim();
  if (!query) return;
  loading.value = true;
  error.value = '';
  user.value = null;
  try {
    const matches = await listRoleAssignments(query);
    user.value = matches[0] ?? null;
    if (!user.value) error.value = t('access.userNotFoundHelp');
  } catch (caught) {
    error.value = caught instanceof Error ? t(caught.message) : t('access.theSearchFailed');
  } finally {
    loading.value = false;
  }
}

async function saveChanges() {
  if (!user.value) return;
  savingUid.value = user.value.uid;
  error.value = '';
  try {
    const result = await setUserRoles(
      user.value.uid,
      draftRoles.value,
      draftIssueCategoryIds.value,
      draftFacilityCategoryIds.value
    );
    user.value.roles = result.roles;
    user.value.managedIssueCategoryIds = result.managedIssueCategoryIds;
    user.value.managedFacilityCategoryIds = result.managedFacilityCategoryIds;
    resetChanges();
    show(t('adminCenter.accessSaved'), 'success');
  } catch (caught) {
    error.value = caught instanceof Error ? t(caught.message) : t('access.saveFailed');
  } finally {
    savingUid.value = '';
  }
}

function selectPlatformAdmin() {
  if (isPlatformAdmin.value) return;
  draftRoles.value = ['platform-admin'];
  draftIssueCategoryIds.value = [];
  draftFacilityCategoryIds.value = [];
}

function selectScopedManager() {
  if (!isPlatformAdmin.value) return;
  draftRoles.value = [];
  draftIssueCategoryIds.value = [];
  draftFacilityCategoryIds.value = [];
}

function toggleCategory(categoryId: string) {
  if (isPlatformAdmin.value) return;
  draftIssueCategoryIds.value = draftIssueCategoryIds.value.includes(categoryId)
    ? draftIssueCategoryIds.value.filter((value) => value !== categoryId)
    : [...draftIssueCategoryIds.value, categoryId];
}

function toggleFacilityCategory(categoryId: string) {
  if (isPlatformAdmin.value) return;
  draftFacilityCategoryIds.value = draftFacilityCategoryIds.value.includes(categoryId)
    ? draftFacilityCategoryIds.value.filter((value) => value !== categoryId)
    : [...draftFacilityCategoryIds.value, categoryId];
}

function toggleScopedRole(role: Extract<RoleCode, 'announcement-manager'>) {
  if (isPlatformAdmin.value) return;
  draftRoles.value = draftRoles.value.includes(role)
    ? draftRoles.value.filter((value) => value !== role)
    : [...draftRoles.value, role];
}

onMounted(() => { void refresh(); });
</script>
