import type { RouteRecordRaw } from 'vue-router';
import { loadDashboardView } from '@/router/route-components';

export const adminRoutes: RouteRecordRaw[] = [
  {
    path: '/dashboard',
    name: 'dashboard',
    component: loadDashboardView,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
];
