import type { RouteMenuItem } from '#/types/menu';
import { cloneDeep } from '@vben/utils';

const basic: RouteMenuItem[] = [
  {
    component: 'BasicLayout',
    meta: {
      icon: 'lucide:layout-dashboard',
      order: -1,
      title: '概览',
    },
    name: 'Dashboard',
    path: '/',
    children: [
      {
        name: 'Analytics',
        path: '/analytics',
        component: '/dashboard/analytics/index',
        meta: {
          affixTab: true,
          icon: 'lucide:area-chart',
          title: '分析页',
        },
      },
      {
        name: 'Workspace',
        path: '/workspace',
        component: '/dashboard/workspace/index',
        meta: {
          icon: 'carbon:workspace',
          title: '工作台',
        },
      },
    ],
  },
];

// 这里可以找到iconify的[图标](https://icon-sets.iconify.design/)
const defaultRoute: RouteMenuItem[] = [
  ...basic,
  {
    component: 'BasicLayout',
    meta: {
      order: 999,
      title: '测试',
    },
    name: 'test',
    path: '/test',
    children: [
      {
        name: 'testMain',
        path: '',
        component: '/test/index',
        meta: {
          title: 'testMain',
        },
      },
    ],
  },
  {
    component: 'BasicLayout',
    meta: {
      order: 20,
      title: '系统管理',
      icon: 'fluent-color:wrench-24',
    },
    name: 'system',
    path: '/system',
    children: [
      {
        name: 'systemMenu',
        path: 'menu',
        component: '/system/menu/index',
        meta: {
          title: '菜单',
          icon: 'fluent-color:org-24',
        },
      },
    ],
  },
];

export const getLocalRoute = () => cloneDeep(defaultRoute);
