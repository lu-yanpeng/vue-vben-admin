import type { RouteRecordRaw } from 'vue-router';

import { BasicLayout } from '#/layouts';

const routes: RouteRecordRaw[] = [
  {
    component: BasicLayout,
    meta: {
      order: 10,
      title: '测试',
    },
    name: 'test',
    path: '/test',
    children: [
      {
        name: 'testMain',
        path: '',
        component: () => import('#/views/test/index.vue'),
        meta: {
          title: 'testMain',
        },
      },
    ],
  },
];

export default routes;
