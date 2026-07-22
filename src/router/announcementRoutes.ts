import type { RouteRecordRaw } from 'vue-router';
import { loadAnnouncementComposerView, loadAnnouncementDetailView, loadAnnouncementsView } from '@/router/route-components';

export const announcementRoutes: RouteRecordRaw[] = [
  {
    path: '/announcements',
    name: 'announcements',
    component: loadAnnouncementsView,
    meta: { navigationDepth: 0, requiresAuth: true },
  },
  {
    path: '/announcements/new',
    name: 'announcement-create',
    component: loadAnnouncementComposerView,
    meta: { navigationDepth: 1, requiredPermission: 'announcement.manage', requiresAuth: true },
  },
  {
    path: '/announcements/:announcementId',
    name: 'announcement-detail',
    component: loadAnnouncementDetailView,
    meta: { navigationDepth: 1, requiresAuth: true },
  },
];
