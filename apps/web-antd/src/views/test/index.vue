<script setup lang="ts">
import type { RouteMenuItem } from '#/types/menu';

import { ref, useTemplateRef } from 'vue';

import { refreshTokenApi } from '#/api/core/auth';
import { requestClient } from '#/api/request';
import Menu from '#/components/menu/index.vue';

const menuData: RouteMenuItem[] = [
  { path: '/vueform-1', name: 'vueForm1', meta: { title: '测试数据·1111' } },
  { path: '/list-el', name: 'listEl', meta: { title: '列表字段', order: '0' } },
  { path: '/simple-table', name: 'simpleTable', meta: { title: '简单表格' } },
  { path: '/menu', name: 'menu', meta: { title: '菜单', order: 1 } },
  {
    component: 'BasicLayout',
    meta: { order: -1, title: '父级菜单' },
    name: 'Dashboard',
    path: '/',
    redirect: '/analytics',
    children: [
      {
        name: 'Analytics',
        path: '/analytics',
        component: '/dashboard/analytics/index',
        meta: { affixTab: true, title: '标题一' },
      },
      {
        name: 'Workspace',
        path: '/workspace',
        component: '/dashboard/workspace/index',
        meta: { title: '标题二' },
        children: [{ path: '/', name: 'home', meta: { title: '首页' } }],
      },
    ],
  },
  { path: '/', name: 'home', meta: { title: '首页1111', order: '10' } },
] as RouteMenuItem[];
const menuRef = useTemplateRef('menuRef');
const unfold = (open: boolean) => {
  if (menuRef.value) {
    menuRef.value.openSubmenu(open);
  }
};

const dragSort = ref(false);
const restore = () => {
  if (menuRef.value) {
    menuRef.value.restore();
  }
};

const route = ref({});
const onSelect = (_route: RouteMenuItem) => {
  route.value = _route;
};

const onSort = () => {
  dragSort.value = !dragSort.value;
  if (!dragSort.value && menuRef.value) {
    const menuData = menuRef.value.menuData();
    menuData.forEach((menu, index) => {
      menu.meta.order = index * 10;
    });
  }
};

const onTest = async () => {
  await requestClient.get('/permission/policy');
};

const refresh = async () => {
  await refreshTokenApi();
};
</script>

<template>
  <div class="grid grid-cols-2">
    <div>
      <button class="d-btn" @click="unfold(true)">展开</button>
      <button class="d-btn" @click="unfold(false)">收起</button>
      <button class="d-btn" @click="onSort">排序</button>
      <button class="d-btn" @click="restore">重置</button>
      <button class="d-btn" @click="onTest">接口测试</button>
      <button class="d-btn" @click="refresh">刷新token</button>
      <br /><br />

      <Menu ref="menuRef" :drag-sort :menus="menuData" @select="onSelect" />
    </div>

    <div class="d-card bg-base-100 shadow-xl">
      <div class="d-card-body">
        <div class="d-card-title">已选择的菜单项</div>
        <pre>{{ route }}</pre>
      </div>
    </div>
  </div>
</template>
