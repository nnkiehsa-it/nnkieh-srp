type RouteComponentLoader = () => Promise<unknown>;

export const loadLoginView = () => import('@/views/LoginView.vue');
export const loadIssueBoardView = () => import('@/views/IssueBoardView.vue');
export const loadIssueDetailView = () => import('@/views/IssueDetailView.vue');
export const loadAnnouncementsView = () => import('@/views/AnnouncementsView.vue');
export const loadAnnouncementDetailView = () => import('@/views/AnnouncementDetailView.vue');
export const loadNotificationsView = () => import('@/views/NotificationsView.vue');
export const loadSettingsView = () => import('@/views/SettingsView.vue');
export const loadDashboardView = () => import('@/views/DashboardView.vue');

const loaders = new Map<string, RouteComponentLoader>([
  ['login', loadLoginView],
  ['issues', loadIssueBoardView],
  ['issue-detail', loadIssueDetailView],
  ['announcements', loadAnnouncementsView],
  ['announcement-detail', loadAnnouncementDetailView],
  ['notifications', loadNotificationsView],
  ['settings', loadSettingsView],
  ['dashboard', loadDashboardView],
]);
const preloadRequests = new Map<string, Promise<unknown>>();

export function preloadRouteComponent(routeName: string) {
  const existing = preloadRequests.get(routeName);
  if (existing) return existing;
  const loader = loaders.get(routeName);
  if (!loader) return Promise.resolve();

  const request = loader().catch(() => undefined);
  preloadRequests.set(routeName, request);
  return request;
}

export function preloadRoutePath(pathname: string) {
  if (pathname === '/notifications') return preloadRouteComponent('notifications');
  if (pathname === '/settings') return preloadRouteComponent('settings');
  if (pathname === '/dashboard') return preloadRouteComponent('dashboard');
  if (pathname.startsWith('/announcements/')) return preloadRouteComponent('announcement-detail');
  if (pathname === '/announcements') return preloadRouteComponent('announcements');
  if (/^\/issues\/[^/]+\/[^/]+/u.test(pathname)) return preloadRouteComponent('issue-detail');
  if (pathname === '/' || pathname.startsWith('/issues')) return preloadRouteComponent('issues');
  return Promise.resolve();
}

export async function preloadPrimaryRouteComponents(includeAdmin: boolean) {
  const routeNames = [
    'announcements',
    'notifications',
    'settings',
    'issue-detail',
    'announcement-detail',
    'issues',
    ...(includeAdmin ? ['dashboard'] : []),
  ];
  for (const routeName of routeNames) {
    await preloadRouteComponent(routeName);
  }
}
