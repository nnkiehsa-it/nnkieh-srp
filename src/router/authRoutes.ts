import type { RouteRecordRaw } from 'vue-router';
import { loadLoginView } from '@/router/route-components';

export const authRoutes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: loadLoginView,
    meta: { publicOnly: true },
  },
];
