<template>
  <RoutePageFrame padding="responsive">
    <div class="mx-auto w-full max-w-5xl space-y-6 py-4">
      <header>
        <h1 class="text-2xl font-bold text-ink-950 dark:text-ink-50">{{ t('adminCenter.title') }}</h1>
        <p class="mt-2 max-w-3xl text-sm leading-6 text-ink-500">{{ t('adminCenter.description') }}</p>
      </header>

      <!-- Horizontal descriptive card tabs -->
      <div class="grid gap-3 sm:grid-cols-2" role="navigation" :aria-label="t('adminCenter.sections')">
        <button
          type="button"
          class="flex flex-col items-start text-left p-4 rounded-xl border transition-all duration-200"
          :class="activeTab === 'categories'
            ? 'border-primary-500 bg-primary-50/30 dark:bg-primary-950/20 ring-1 ring-primary-500'
            : 'border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900 hover:border-ink-300 dark:hover:border-ink-700'"
          @click="setTab('categories')"
        >
          <span class="flex items-center gap-2 font-bold text-sm" :class="activeTab === 'categories' ? 'text-primary-700 dark:text-primary-300' : 'text-ink-900 dark:text-ink-100'">
            <AppIcon name="comment" :size="4" />
            <span>{{ t('adminCenter.categoriesTabLabel') }}</span>
          </span>
          <span class="mt-1 text-xs text-ink-500">
            {{ t('adminCenter.categoriesTabHelp') }}
          </span>
        </button>

        <button
          type="button"
          class="flex flex-col items-start text-left p-4 rounded-xl border transition-all duration-200"
          :class="activeTab === 'members'
            ? 'border-primary-500 bg-primary-50/30 dark:bg-primary-950/20 ring-1 ring-primary-500'
            : 'border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900 hover:border-ink-300 dark:hover:border-ink-700'"
          @click="setTab('members')"
        >
          <span class="flex items-center gap-2 font-bold text-sm" :class="activeTab === 'members' ? 'text-primary-700 dark:text-primary-300' : 'text-ink-900 dark:text-ink-100'">
            <AppIcon name="user" :size="4" />
            <span>{{ t('adminCenter.membersTabLabel') }}</span>
          </span>
          <span class="mt-1 text-xs text-ink-500">
            {{ t('adminCenter.membersTabHelp') }}
          </span>
        </button>
      </div>

      <CategoryWorkflowPanel
        v-if="visitedTabs.has('categories')"
        v-show="activeTab === 'categories'"
      />
      <MemberAccessPanel
        v-if="visitedTabs.has('members')"
        v-show="activeTab === 'members'"
      />
    </div>
  </RoutePageFrame>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import CategoryWorkflowPanel from '@/components/admin/CategoryWorkflowPanel.vue';
import MemberAccessPanel from '@/components/admin/MemberAccessPanel.vue';
import AppIcon from '@/components/ui/atoms/AppIcon.vue';
import RoutePageFrame from '@/components/ui/organisms/RoutePageFrame.vue';
import { useI18n } from '@/i18n';

type AdministrationTab = 'categories' | 'members';

const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const activeTab = computed<AdministrationTab>(() => route.query.tab === 'members' ? 'members' : 'categories');
const visitedTabs = reactive(new Set<AdministrationTab>([activeTab.value]));

watch(activeTab, (tab) => { visitedTabs.add(tab); });

function setTab(tab: AdministrationTab) {
  if (activeTab.value === tab) return;
  void router.replace({ query: { ...route.query, tab } });
}
</script>
