import type { RouteRecordRaw } from 'vue-router';

import { BasicLayout } from '#/layouts';
import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    component: BasicLayout,
    meta: {
      icon: 'ic:baseline-view-in-ar',
      keepAlive: true,
      order: 1000,
      title: $t('demos.title'),
    },
    name: 'Demos',
    path: '/demos',
    redirect: { name: 'demoTables' },
    children: [
      {
        meta: {
          title: '表格',
        },
        name: 'demoTables',
        path: 'tables',
        redirect: { name: 'basicTable' },
        children: [
          {
            meta: {
              title: '基础表格',
            },
            name: 'basicTable',
            path: 'basic-table',
            component: () =>
              import('#/views/demos/table/basic-table/index.vue'),
          },
        ],
      },
      {
        meta: {
          title: '表单',
        },
        name: 'demoForm',
        path: 'forms',
        redirect: { name: 'basicForm' },
        children: [
          {
            meta: {
              title: '基础表单',
            },
            name: 'basicForm',
            path: 'basic-form',
            component: () => import('#/views/demos/form/basic-form/index.vue'),
          },
        ],
      },
    ],
  },
];

export default routes;
