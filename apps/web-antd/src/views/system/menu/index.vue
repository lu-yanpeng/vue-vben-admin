<script setup lang="ts">
import type { RouteMenuItem } from '#/types/menu';

import { onMounted, ref, useTemplateRef } from 'vue';

import { Page } from '@vben/common-ui';

import { message } from 'ant-design-vue';

import { getServerRoutes, setMenu } from '#/api/system/menu';
import { mergeRoutesMate } from '#/common-methods';
import DaisyuiWrap from '#/components/daisyui-wrap.vue';
import { getLocalRoute } from '#/router/local-routes';

import LeftMenu from './left-menu.vue';
import RightEditor from './right-editor.vue';

const [msgApi, ContextHolder] = message.useMessage();

const menuData = ref<RouteMenuItem[]>([]);

// 从服务器获取菜单数据，和本地菜单进行合并
const mergeMenu = async () => {
  menuData.value = [];
  const serverMenu = (await getServerRoutes()) as RouteMenuItem[];
  const localMenu = getLocalRoute();
  menuData.value = mergeRoutesMate(localMenu, serverMenu);
  // 合并后进行排序
  menuData.value.sort((a, b) => {
    const a1 = a?.meta?.order ?? 0;
    const b1 = b?.meta?.order ?? 0;
    return a1 - b1;
  });
};
onMounted(async () => {
  await mergeMenu();
});

// 选中一个菜单
const selectedMenu = ref<null | RouteMenuItem>(null);
const onSelect = (_menu: RouteMenuItem) => {
  selectedMenu.value = _menu;
};

// 合并修改后的菜单数据
const __mergeMenu = (local: RouteMenuItem[], target: RouteMenuItem) => {
  for (const item of local) {
    if (item.name === target.name) {
      Object.assign(item, target);
      return;
    }
    if (item.children && item.children.length > 0) {
      __mergeMenu(item.children, target);
    }
  }
};

const leftMenuRef = useTemplateRef('leftMenuRef');

// 重新加载菜单数据
const reload = async () => {
  selectedMenu.value = null;
  await mergeMenu();
  if (leftMenuRef.value) {
    leftMenuRef.value.openMenu(false);
  }
};

// 保存修改后的菜单
const onSave = async (
  menu: RouteMenuItem,
  resolve: (value: boolean) => void,
) => {
  try {
    __mergeMenu(menuData.value, menu);
    await setMenu(menuData.value);
    await reload();
    resolve(true);
    msgApi.success('修改成功');
  } catch {
    resolve(false);
    msgApi.error('修改失败');
  }
};

// 保存排序的数据
const onSort = async (
  menu: RouteMenuItem[],
  resolve: (value: boolean) => void,
) => {
  try {
    await setMenu(menu);
    await reload();
    resolve(true);
  } catch {
    resolve(false);
  }
};
</script>

<template>
  <Page title="菜单管理">
    <template #description>
      <p>设置左侧菜单，这里只设置菜单基础信息，不设置菜单权限。</p>
      <p>保存后刷新页面才生效。</p>
    </template>

    <ContextHolder />
    <DaisyuiWrap
      class="grid grid-cols-1 gap-4 bg-transparent md:[grid-template-columns:3fr_7fr]"
    >
      <LeftMenu
        ref="leftMenuRef"
        :menu-data
        @select="onSelect"
        @sort="onSort"
      />
      <RightEditor :menu="selectedMenu" @save="onSave" />
    </DaisyuiWrap>
  </Page>
</template>
