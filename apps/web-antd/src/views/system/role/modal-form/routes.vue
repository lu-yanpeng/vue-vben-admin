<script setup lang="ts">
import type { TreeData } from './types';

import type { RouteMenuItem } from '#/types/menu';

import { ref, shallowRef, watch } from 'vue';

import { mergeRoutesMate } from '#/common-methods';
import { getLocalRoute } from '#/router/local-routes';

const props = defineProps<{
  changeDirty: (status: boolean) => void;
  roleRoutes: null | RouteMenuItem[];
  serverRoutes: RouteMenuItem[];
}>();

// 生成符合a-tree组件的数据
const encodeRoleRoutes = (routes: RouteMenuItem[]): TreeData => {
  const result: TreeData = [];
  for (const route of routes) {
    const routeItem: TreeData[number] = {
      title: route.meta.title,
      key: route.name as string,
    };
    if (route?.children) {
      routeItem.children = encodeRoleRoutes(route.children);
    }
    result.push(routeItem);
  }
  return result;
};
// 前端本地和服务器路由合并后的数据，最终要保存到服务器的数据需要从这里筛选
const mergedRouteData = shallowRef<RouteMenuItem[]>([]);
const treeData = ref<TreeData>([]);

// 获取每个路由的name，组成一个数组，用来做checkedRoute的数据
const filterRoleRoutes = (routes: RouteMenuItem[]): string[] => {
  return routes.flatMap((route) => [
    ...(route.name ? [route.name] : []),
    ...(route.children ? filterRoleRoutes(route.children) : []),
  ]) as string[];
};
// 已勾选的路由
const checkedRoute = ref<string[]>([]);
watch(
  () => props.roleRoutes,
  async (roleRoutes) => {
    if (roleRoutes) {
      checkedRoute.value = filterRoleRoutes(roleRoutes);
    }
    if (treeData.value.length === 0) {
      // 每次都合并本地的路由数据，避免前端更新了没同步到后端
      const localRoutes = getLocalRoute();
      mergedRouteData.value = mergeRoutesMate(localRoutes, props.serverRoutes);
      mergedRouteData.value.sort((a, b) => {
        const a1 = a?.meta?.order ?? 0;
        const b1 = b?.meta?.order ?? 0;
        return a1 - b1;
      });
      treeData.value = encodeRoleRoutes(mergedRouteData.value);
    }
  },
  { immediate: true },
);

// 从前端路由中筛选出被选中的数据
const filterCheckedRoutes = (
  routes: RouteMenuItem[],
  checkedNames: string[],
): RouteMenuItem[] => {
  return routes
    .map((route) => ({ ...route })) // 浅拷贝避免修改原始对象
    .filter((route) => {
      // 先处理子路由，如果子路由有符合的数据，就添加到父路由的children中
      // 在下面判断当前父路由是否有子路由，如果有他就是符合条件的数据
      // 这样可以避免checkedNames只包含子路由，不包含父路由的情况
      if (route.children) {
        route.children = filterCheckedRoutes(route.children, checkedNames);
      }

      return (
        checkedNames.includes(route.name as string) ||
        (route.children && route.children.length > 0)
      );
    });
};
// 判断路由是否被修改
const treeCheck = (keys: string[]) => {
  if (props.roleRoutes === null) {
    props.changeDirty(keys.length > 0);
  } else {
    const checked = filterCheckedRoutes(mergedRouteData.value, keys);
    const dirty = JSON.stringify(props.roleRoutes) !== JSON.stringify(checked);
    props.changeDirty(dirty);
  }
};

defineExpose({
  getRoutes: () => {
    return filterCheckedRoutes(mergedRouteData.value, checkedRoute.value);
  },
});
</script>

<template>
  <div>
    <h2 class="mb-2 text-lg font-semibold">路由</h2>
    <a-tree
      checkable
      :tree-data="treeData"
      v-model:checked-keys="checkedRoute"
      @check="treeCheck"
    />
  </div>
</template>
