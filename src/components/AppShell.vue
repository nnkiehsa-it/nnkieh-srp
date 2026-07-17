<template>
  <div
    class="app-root relative flex flex-col bg-[rgb(var(--color-page-background))]"
    :data-bottom-nav="isAllowedUser ? 'true' : 'false'"
    :data-sidebar-expanded="isSidebarExpanded ? 'true' : 'false'"
    :style="rootStyle"
    @focusin.capture="handleNavigationIntent"
    @pointerdown.capture="handleNavigationIntent"
    @pointerover.capture="handleNavigationIntent"
  >
    <div class="app-background-fill pointer-events-none absolute inset-0"></div>
    <div class="app-background-wash pointer-events-none absolute inset-x-0 top-0 h-80 dark:hidden"></div>

    <AppMobileHeader
      :back-label="mobileBackLabel"
      :category-filter="mobileCategoryFilter"
      :category-label="mobileCategoryLabel"
      :show-back-button="showMobileBackButton"
      :title="mobileHeaderTitle"
      @back="handleMobileBack"
      @select-category="handleCategoryChange"
    />

    <AppDesktopSidebar
      v-if="isAllowedUser"
      :expanded="isSidebarExpanded"
      :has-unread="hasUnread"
      :home-route="homeRoute"
      :items="primaryRouteNavItems"
      :notifications-active="route.name === 'notifications'"
      :photo-url="displayPhotoUrl"
      :profile-active="isProfileRouteActive"
      :school-label="schoolLabel"
      :user-name="userName"
      @navigate="handleNavigationClick"
      @navigate-link="closeSidebarDrawerIfNeeded"
      @toggle="toggleSidebar"
    />

    <button
      v-if="isAllowedUser"
      type="button"
      class="app-sidebar__scrim"
      :aria-label="t('text.a3c852c726e3')"
      @click="closeSidebar"
    ></button>

    <div ref="mainContentRef" class="app-main-content relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden overscroll-contain">
      <ViewportFrame as="main" class="min-h-0 flex-1"><slot /></ViewportFrame>
    </div>

    <AppMobileBottomNav
      v-if="isAllowedUser"
      :active-key="activeMobileNavKey"
      :bottom-gap="bottomGap"
      :has-unread="hasUnread"
      :items="primaryRouteNavItems"
      :photo-url="displayPhotoUrl"
      :profile-active="isProfileRouteActive"
      :user-name="userName"
      @navigate="handleNavigationClick"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AppDesktopSidebar from '@/components/app-shell/AppDesktopSidebar.vue';
import AppMobileBottomNav from '@/components/app-shell/AppMobileBottomNav.vue';
import AppMobileHeader from '@/components/app-shell/AppMobileHeader.vue';
import ViewportFrame from '@/components/ui/ViewportFrame.vue';
import { SCHOOL_NAME } from '@/constants/app';
import { DEFAULT_ISSUE_ROUTE_FILTER, ISSUE_CATEGORY_LABELS, isIssueCategory } from '@/constants/categories';
import { refreshFromActiveNavigation } from '@/composables/useActiveNavigationRefresh';
import { useIssueRouteFilter } from '@/composables/useIssueRouteFilter';
import { useNotificationBadge } from '@/composables/useNotificationBadge';
import { useSession } from '@/composables/useSession';
import type { IssueFilter } from '@/types';
import { preloadRoutePath } from '@/router/route-components';
import { useI18n } from '@/i18n';

const SIDEBAR_EXPANDED_STORAGE_KEY = 'novae:desktop-sidebar-expanded';
const MOBILE_NAV_HEIGHT = 60;
const SCROLL_POSITION_LIMIT = 30;

const { customPhotoUrl, isAllowedUser, user } = useSession();
const { activeFilter } = useIssueRouteFilter();
const { hasUnread } = useNotificationBadge();
const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const mainContentRef = ref<HTMLDivElement | null>(null);
const hasSafeIndicator = ref(false);
const isSidebarExpanded = ref(false);
const mainScrollPositions = new Map<string, number>();

const isIssueRouteActive = computed(() => route.name === 'issues' || route.name === 'issue-detail');
const isAnnouncementRouteActive = computed(() => route.name === 'announcements' || route.name === 'announcement-detail');
const isFacilityRouteActive = computed(() => route.name === 'facilities' || route.name === 'facility-detail');
const isMyProposalsRouteActive = computed(() => isIssueRouteActive.value && activeFilter.value === 'my-proposals');
const isProfileRouteActive = computed(() => isMyProposalsRouteActive.value || ['settings', 'dashboard', 'access-management'].includes(route.name as string));
const homeRoute = { name: 'issues', params: { filter: DEFAULT_ISSUE_ROUTE_FILTER } } as const;
const primaryRouteNavItems = computed(() => [
  {
    icon: 'comment' as const,
    isActive: isIssueRouteActive.value && activeFilter.value !== 'my-proposals',
    key: 'issues',
    label: t('text.b9a2f9c03506'),
    to: homeRoute,
  },
  {
    icon: 'wrench' as const,
    isActive: isFacilityRouteActive.value,
    key: 'facilities',
    label: t('text.a6a61230ffa1'),
    to: { name: 'facilities' },
  },
  {
    icon: 'megaphone' as const,
    isActive: isAnnouncementRouteActive.value,
    key: 'announcements',
    label: t('text.3f9569532847'),
    to: { name: 'announcements' },
  },
]);
const displayPhotoUrl = computed(() => customPhotoUrl.value || user.value?.photoURL || null);
const userName = computed(() => user.value?.displayName || t('text.4a7f444ac58d'));
const schoolLabel = computed(() => SCHOOL_NAME || t('text.b27599fc9b84'));
const mobileCategoryFilter = computed<IssueFilter | undefined>(() =>
  route.name === 'issues' && isIssueCategory(activeFilter.value) ? activeFilter.value : undefined
);
const mobileCategoryLabel = computed(() => mobileCategoryFilter.value
  ? t(ISSUE_CATEGORY_LABELS[mobileCategoryFilter.value])
  : undefined);
const bottomGap = computed(() => hasSafeIndicator.value ? 22 : 12);
const rootStyle = computed(() => isAllowedUser.value
  ? { '--app-bottom-nav-height': `${bottomGap.value + MOBILE_NAV_HEIGHT + 6}px` }
  : {});
const activeMobileNavKey = computed(() => {
  if (isAnnouncementRouteActive.value) return 'announcements';
  if (isFacilityRouteActive.value) return 'facilities';
  if (isProfileRouteActive.value) return 'settings';
  if (route.name === 'notifications') return 'notifications';
  if (isIssueRouteActive.value) return 'issues';
  return '';
});
const mobileHeaderTitle = computed(() => {
  if (route.name === 'issue-detail') return t(isMyProposalsRouteActive.value ? 'text.16441dd78ebf' : 'text.6822d1ef16bf');
  if (route.name === 'facility-detail') return t('text.a6a61230ffa1');
  if (route.name === 'announcement-detail') return t('text.1bb7c8022090');
  if (route.name === 'dashboard') return t('text.baa4b36d8a77');
  if (route.name === 'access-management') return t('text.3d0d88d5d438');
  if (route.name === 'notifications') return t('text.7a66c0d03631');
  if (route.name === 'settings') return t('text.a82c993d7388');
  if (isAnnouncementRouteActive.value) return t('text.3f9569532847');
  if (isFacilityRouteActive.value) return t('text.a6a61230ffa1');
  if (isMyProposalsRouteActive.value) return t('text.16441dd78ebf');
  return t('text.b9a2f9c03506');
});
const showMobileBackButton = computed(() => ['issue-detail', 'facility-detail', 'announcement-detail', 'dashboard', 'access-management'].includes(route.name as string) || isMyProposalsRouteActive.value);
const mobileBackLabel = computed(() => {
  if (route.name === 'dashboard') return t('text.ae7b94951d50');
  if (route.name === 'access-management') return t('text.ae7b94951d50');
  if (route.name === 'issue-detail' && isMyProposalsRouteActive.value) return t('text.afd35ebaa9f0');
  if (isMyProposalsRouteActive.value) return t('text.ae7b94951d50');
  if (route.name === 'announcement-detail') return t('text.c12e8b61ecde');
  if (route.name === 'facility-detail') return t('text.326fa994df51');
  return t('text.f3688932d28d');
});

function handleNavigationClick(isActive: boolean) {
  if (isActive) void refreshFromActiveNavigation();
}

async function handleCategoryChange(filter: IssueFilter) {
  if (filter === activeFilter.value && route.name === 'issues') return;
  await router.push({ name: 'issues', params: { filter }, query: route.query });
}

function handleNavigationIntent(event: Event) {
  if (!(event.target instanceof Element)) return;
  const link = event.target.closest<HTMLAnchorElement>('a[href]');
  if (!link) return;

  const url = new URL(link.href, window.location.origin);
  if (url.origin !== window.location.origin) return;
  void preloadRoutePath(url.pathname);
}

function setSidebarExpanded(expanded: boolean) {
  isSidebarExpanded.value = expanded;
  window.localStorage.setItem(SIDEBAR_EXPANDED_STORAGE_KEY, expanded ? 'true' : 'false');
}

function toggleSidebar() {
  setSidebarExpanded(!isSidebarExpanded.value);
}

function closeSidebar() {
  setSidebarExpanded(false);
}

function closeSidebarDrawerIfNeeded() {
  if (window.matchMedia('(min-width: 768px) and (max-width: 1399px)').matches) closeSidebar();
}

function handleSidebarKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && isSidebarExpanded.value) closeSidebarDrawerIfNeeded();
}

async function handleMobileBack() {
  if (route.name === 'announcement-detail') return void await router.push({ name: 'announcements' });
  if (route.name === 'facility-detail') return void await router.push({ name: 'facilities' });
  if (route.name === 'issue-detail') {
    const query = { ...route.query };
    delete query.tab;
    delete query.comment;
    return void await router.push({ name: 'issues', params: { filter: activeFilter.value }, query });
  }
  if (isMyProposalsRouteActive.value || route.name === 'dashboard' || route.name === 'access-management') await router.push({ name: 'settings' });
}

watch(() => route.fullPath, (newPath, oldPath) => {
  if (oldPath && mainContentRef.value) {
    mainScrollPositions.set(oldPath, mainContentRef.value.scrollTop);
    if (mainScrollPositions.size > SCROLL_POSITION_LIMIT) {
      const oldestPath = mainScrollPositions.keys().next().value;
      if (oldestPath) mainScrollPositions.delete(oldestPath);
    }
  }
  nextTick(() => mainContentRef.value?.scrollTo({ behavior: 'auto', left: 0, top: mainScrollPositions.get(newPath) ?? 0 }));
});

onMounted(() => {
  isSidebarExpanded.value = window.localStorage.getItem(SIDEBAR_EXPANDED_STORAGE_KEY) === 'true';
  const probe = document.createElement('div');
  probe.style.cssText = 'padding-bottom:env(safe-area-inset-bottom);position:fixed;visibility:hidden';
  document.body.appendChild(probe);
  hasSafeIndicator.value = parseFloat(window.getComputedStyle(probe).paddingBottom) > 0;
  probe.remove();
  window.addEventListener('keydown', handleSidebarKeydown);
});

onBeforeUnmount(() => window.removeEventListener('keydown', handleSidebarKeydown));
</script>
