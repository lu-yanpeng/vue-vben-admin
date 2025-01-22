<script setup lang="ts">
import type { TreeProps } from 'ant-design-vue';

import type { SingleRole } from '#/api/system/access/role';

import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import dayjs from 'dayjs';

import { useVbenForm } from '#/adapter/form';

const roleId = ref<number | string>('-');
const createTime = ref('-');
const updateTime = ref('-');

const [BaseForm, formApi] = useVbenForm({
  showDefaultActions: false,
  layout: 'horizontal',
  schema: [
    {
      component: 'Input',
      componentProps: {
        placeholder: '角色名',
      },
      fieldName: 'name',
      label: '名称',
      disabled: true,
    },
    {
      component: 'Textarea',
      componentProps: {
        placeholder: '角色功能描述',
      },
      fieldName: 'desc',
      label: '描述',
    },
    {
      component: 'Checkbox',
      fieldName: 'is_default_role',
      label: '默认角色',
      help: '创建用户时自动添加这个角色',
    },
  ],
});

type _TreeData = NonNullable<TreeProps['treeData']>;
const treeData = ref<_TreeData>([]);
type _SysRoute = NonNullable<SingleRole['sys_routes']>;
const routeTree = (routes: _SysRoute): _TreeData => {
  interface __Result {
    title: string;
    children?: __Result[];
  }

  const __result: Map<string, __Result> = new Map();
  /*
   * @route: 要遍历的路由
   * @targetRoute: 要添加节点的路由
   * */
  const createNode = (route: _SysRoute[number], targetRoute: __Result) => {
    const title = route.path.slice(1).split('/')[0];
    if (title === targetRoute.title) {
      // 判断是否还有子路径 /{uid} 没有子路径
      const subPath = route.path.slice(1).split('/').slice(1).join('/');
      // 递归的出口，如果已经遍历到最后一个路径，就把路由的方法添加到targetRoute里面
      if (subPath === '') {
        if (Array.isArray(targetRoute.children)) {
          targetRoute.children.push({
            title: `[${route.methods[0]}] -> ${route.name}`,
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
        const subTarget = { title: subTitle, children: [] };
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
      const targetRoute = __result.get(path) as __Result;
      createNode(route, targetRoute);
    } else {
      // 这里传入找到的路由对象
      const __route = { title: path, children: [] };
      __result.set(path, __route);
      createNode(route, __route);
    }
  }
  return [...__result.values()] as _TreeData;
};
const [Modal, modalApi] = useVbenModal({
  draggable: true,
  centered: true,
  class: 'md:w-2/5',
  closeOnClickModal: false,
  onOpenChange: (isOpen: boolean) => {
    if (isOpen) {
      const { role, sys_routes } = modalApi.getData<SingleRole>();
      roleId.value = role.id;
      createTime.value = dayjs(role.create_time).format('YYYY-MM-DD');
      updateTime.value = dayjs(role.update_time).format('YYYY-MM-DD');
      formApi.setValues(role);
      if (sys_routes) {
        treeData.value = routeTree(sys_routes);
      }
    }
  },
});
</script>

<template>
  <Modal>
    <div class="grid grid-cols-1 md:[grid-template-columns:45fr_10fr_45fr]">
      <div>
        <div class="flex justify-around">
          <div>
            <h2 class="font-medium">ID</h2>
            <p>{{ roleId }}</p>
          </div>
          <div class="">
            <h2 class="font-medium">创建时间</h2>
            <p>{{ createTime }}</p>
          </div>
          <div class="">
            <h2 class="font-medium">最后修改</h2>
            <p>{{ updateTime }}</p>
          </div>
        </div>

        <div class="d-divider"></div>

        <BaseForm />
      </div>

      <div class="d-divider md:d-divider-horizontal"></div>

      <div>
        <a-tree checkable :tree-data="treeData" :default-expand-all />
      </div>
    </div>
  </Modal>
</template>
