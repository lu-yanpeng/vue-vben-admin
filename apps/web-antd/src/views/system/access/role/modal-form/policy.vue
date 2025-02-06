<script setup lang="ts">
import type { TreeProps } from 'ant-design-vue';

import type { ApiRoutes, SingleRole } from './types';

import { ref, watch } from 'vue';

const props = defineProps<{
  apiRoutes: ApiRoutes;
  changeDirty: (status: boolean) => void;
  checkedKeys: SingleRole['policies'];
}>();

type _TreeData = NonNullable<TreeProps['treeData']>;
// 整个权限树
const treeData = ref<_TreeData>([]);
// 已勾选的权限，格式 /path->method
const checkedPolicies = ref<string[]>([]);
// 原始权限，判断权限是否修改过，格式 /path->method
const originPolicies = ref<Set<string>>(new Set());

// 根据后端api routes生成对应的树形结构
const routeTree = (routes: ApiRoutes): _TreeData => {
  /*
   * 把后端数据转成符合a-tree组件的树形结构
   * */
  interface __Result {
    title: string;
    key: string;
    children?: __Result[];
  }

  const __result: Map<string, __Result> = new Map();
  /*
   * @route: 要遍历的路由
   * @targetRoute: 要添加节点的路由
   * */
  const createNode = (route: ApiRoutes[number], targetRoute: __Result) => {
    const title = route.path.slice(1).split('/')[0];
    if (title === targetRoute.title) {
      // 判断是否还有子路径 /{uid} 没有子路径
      const subPath = route.path.slice(1).split('/').slice(1).join('/');
      // 递归的出口，如果已经遍历到最后一个路径，就把路由的方法添加到targetRoute里面
      if (subPath === '') {
        if (Array.isArray(targetRoute.children)) {
          const methodName = route.methods[0];
          targetRoute.children.push({
            title: `[${methodName}] -> ${route.name}`,
            // 这里的可以需要保持
            key: `${targetRoute.key}->${methodName}`,
          });
        }
        return;
      }

      // 去掉父路径后的子路由
      const subRoute = {
        ...route,
        path: `/${route.path.slice(1).split('/').slice(1).join('/')}`,
      };
      const subTitle = subRoute.path.slice(1).split('/')[0] as string;

      // 如果子路由里面有同名的路由，就继续往这个路由里添加
      const __target = targetRoute.children?.find((item) => {
        return item.title === subTitle;
      });
      if (__target) {
        createNode(subRoute, __target);
      } else {
        // 添加一个新的子路由
        const subTarget = {
          title: subTitle,
          key: `${targetRoute.key}/${subTitle}`,
          children: [],
        };
        if (Array.isArray(targetRoute.children)) {
          targetRoute.children.push(subTarget);
        }
        createNode(subRoute, subTarget);
      }
    }
  };

  for (const route of routes) {
    const path = route.path.slice(1).split('/')[0] as string;
    if (__result.has(path)) {
      // 这里传入找到的路由对象
      const targetRoute = __result.get(path) as __Result;
      createNode(route, targetRoute);
    } else {
      const __route = { title: path, key: `/${path}`, children: [] };
      __result.set(path, __route);
      createNode(route, __route);
    }
  }
  return [...__result.values()] as _TreeData;
};

// 把服务器的权限数据转成 /path->methods格式
const encodePolicies = (policies: [string, string, string][]): string[] => {
  const result = [];
  for (const policy of policies) {
    let path = policy[1];
    if (path.endsWith('/')) {
      path = path.slice(0, -1);
    }
    result.push(`${path}->${policy[2]}`);
  }
  return result;
};
watch(
  () => props.checkedKeys,
  (policies) => {
    checkedPolicies.value = encodePolicies(policies);
    originPolicies.value = new Set(checkedPolicies.value);
    if (treeData.value.length === 0) {
      treeData.value = routeTree(props.apiRoutes);
    }
  },
  { immediate: true },
);

// 去掉不符合条件的权限数据，只保留/path->method这种格式的数据
const getCheckedSet = (keys: string[]): Set<string> => {
  const checkedSet: Set<string> = new Set();
  for (const key of keys) {
    // 因为后端的权限数据都是子节点的数据，格式 /path->method
    // 前端选中子节点时会带上父节点的数据，格式 /path 没有->也没有对应的方法
    // 把这些父节点排除，就可以判断两边保存的子节点是否相同
    if (key.split('->').length > 1) {
      checkedSet.add(key);
    }
  }
  return checkedSet;
};

// 树组件触发勾选事件时，判断权限是否被修改
const treeCheck = (keys: string[]) => {
  const _checkedSet = getCheckedSet(keys);

  let dirty: boolean = false;
  if (_checkedSet.size === originPolicies.value.size) {
    for (const key of _checkedSet) {
      if (!originPolicies.value.has(key)) {
        dirty = true;
        break;
      }
    }
  } else {
    dirty = true;
  }
  props.changeDirty(dirty);
};

// 把已选的权限变成{"path": string; "act": string;}[]类型
const decodePolicies = (
  policies: Set<string> | string[],
): { act: string; path: string }[] => {
  const result: {
    act: string;
    path: string;
  }[] = [];
  for (const policy of policies) {
    const item = policy.split('->') as [string, string];
    if (item.length === 2) {
      result.push({
        path: item[0],
        act: item[1],
      });
    }
  }
  return result;
};
defineExpose({
  getPolicies: () => {
    return decodePolicies(getCheckedSet(checkedPolicies.value));
  },
});
</script>

<template>
  <div>
    <h2 class="mb-2 text-lg font-semibold">权限1</h2>
    <a-tree
      checkable
      :tree-data="treeData"
      v-model:checked-keys="checkedPolicies"
      @check="treeCheck"
    />
  </div>
</template>
