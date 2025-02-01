<script setup lang="ts">
import type { TreeProps } from 'ant-design-vue';

import type { MessageSymbolType } from './symbol-kyes';
import type { AddData, ModalData, UpdateData } from './types';

import type {
  AddRoleData,
  SingleRole,
  UpdateRoleData,
} from '#/api/system/access/role';

import { computed, inject, ref, watchEffect } from 'vue';

import { useVbenModal, z } from '@vben/common-ui';
import { isEqual } from '@vben/utils';

import { Modal as AntdModal } from 'ant-design-vue';
import dayjs from 'dayjs';

import { useVbenForm } from '#/adapter/form';

import { messageSymbolKeys } from './symbol-kyes';

const msgApi = inject<MessageSymbolType>(messageSymbolKeys);

// 角色表单中所有用到的字段，用不到的不要写在里面，比如表单不需要createTime
type RoleFormField = {
  desc: string;
  is_default_role: boolean;
  name: string;
};
// 原始角色数据，判断角色是否修改过
const originRoleData = ref<null | RoleFormField>(null);

// 角色的固定数据，后端自动生成的，只用来展示
const roleId = ref<number | string>('-');
const createTime = ref('-');
const updateTime = ref('-');

// 角色表单是否被修改，表单触发修改事件的时候判断修改的数据和原来的数据是否相同
// 不相同就把他设为true，表示当前表单已被修改，把确认按钮改成修改按钮
const roleIsDirty = ref(false);
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
      rules: z
        .string()
        .trim()
        .min(2, '最少2个字符')
        .max(50, '最大长度50')
        .regex(/^[\w\-@.+]{2,50}$/, '只能输入字母和@+-_.'),
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
  handleValuesChange: (values) => {
    roleIsDirty.value = !isEqual(originRoleData.value, values);
  },
});

type _TreeData = NonNullable<TreeProps['treeData']>;
// 根据后端api routes生成对应的树形结构
type _SysRoute = NonNullable<SingleRole['sys_routes']>;
const routeTree = (routes: _SysRoute): _TreeData => {
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
  const createNode = (route: _SysRoute[number], targetRoute: __Result) => {
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

// 已勾选的权限，格式 /path->method
const checkedKeys = ref<string[]>([]);
// 原始权限，判断权限是否修改过，格式 /path->method
const originPolicies = ref<Set<string>>(new Set());
const policyIsDirty = ref(false);
// 权限或角色是否被修改
const allDirty = computed(() => roleIsDirty.value || policyIsDirty.value);

// 去掉不符合条件的权限数据，只保留/path->method这种格式的数据
const getCheckedSet = (keys: string[]) => {
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

// 整个权限树
const treeData = ref<_TreeData>([]);
const [Modal, modalApi] = useVbenModal({
  draggable: true,
  centered: true,
  class: 'md:w-2/5',
  closeOnClickModal: false,
  onOpenChange: (isOpen: boolean) => {
    if (isOpen) {
      const _modalData = modalApi.getData<ModalData>();

      // 要赋值给表单的数据
      let data: AddData['add']['data'] | null | UpdateData['update']['data'] =
        null;
      if (_modalData.type === 'add') {
        data = _modalData.add.data;
        modalApi.setState({
          title: '添加角色',
        });
      } else if (_modalData.type === 'update') {
        data = _modalData.update.data;
        modalApi.setState({
          title: '修改角色',
        });
      }

      if (data) {
        const { role, policies, sys_routes } = data;
        // @ts-ignore: 如果这些字段是undefined，直接赋值 -
        const { id, create_time, update_time } = role;
        // 表单数据
        roleId.value = id ?? '-';
        createTime.value = create_time
          ? dayjs(create_time).format('YYYY-MM-DD')
          : '-';
        updateTime.value = update_time
          ? dayjs(update_time).format('YYYY-MM-DD')
          : '-';
        // name字段是否禁用
        formApi.updateSchema([
          {
            fieldName: 'name',
            disabled: _modalData.type === 'update',
          },
        ]);
        formApi.setValues(role);
        // 保存原始角色数据，用来判断数据是否被修改
        originRoleData.value = {
          name: role.name,
          // 后端返回的这个字段值可能是null，直接给formApi赋值的话，desc会被赋值成undefined
          // 这样做比较的时候就会有问题，需要转成相同的值
          desc: role.desc ?? undefined,
          is_default_role: role.is_default_role,
        };

        // 权限数据
        checkedKeys.value = encodePolicies(policies);
        originPolicies.value = new Set(checkedKeys.value);

        if (sys_routes) {
          // 权限目录
          treeData.value = routeTree(sys_routes);
        }
      }
    }
  },
  onConfirm: async () => {
    // 如果数据被修改了需要提交，否则直接关闭弹窗
    if (allDirty.value) {
      const formData = (await formApi.validateAndSubmitForm()) as
        | RoleFormField
        | undefined;
      if (!formData) {
        if (msgApi) {
          msgApi('error', '表单验证失败');
        }
        return;
      }
      const checkedPolicies = [...getCheckedSet(checkedKeys.value as string[])];

      const _modalData = modalApi.getData<ModalData>();

      try {
        modalApi.lock(true);
        let refreshGrid: (() => Promise<void>) | null = null;
        // 新增和修改的方法需要的数据不同，需要分开处理
        if (_modalData.type === 'add') {
          const { addMethod } = _modalData.add;
          const data: AddRoleData = {
            role: formData,
            policies: decodePolicies(checkedPolicies),
          };
          refreshGrid = _modalData.add.refreshGrid;
          await addMethod(data);
        } else if (_modalData.type === 'update') {
          const { updateMethod } = _modalData.update;
          const data: Record<string, any> = {};
          // 没有修改过的数据不要传递，如果权限传递空数组，会清空所有权限
          if (roleIsDirty.value) {
            data.role = formData;
          }
          if (policyIsDirty.value) {
            data.policies = decodePolicies(checkedPolicies);
          }
          refreshGrid = _modalData.update.refreshGrid;
          await updateMethod(Number(roleId.value), data as UpdateRoleData);
        }

        // 修改当前表单状态，以免关闭弹窗的时候弹出确认按钮
        policyIsDirty.value = false;
        roleIsDirty.value = false;
        if (msgApi) {
          const { type } = modalApi.getData<ModalData>();
          const text = type === 'add' ? '添加成功' : '修改成功';
          msgApi('success', text);
        }
        await modalApi.close();
        await refreshGrid?.();
      } catch {
        modalApi.lock(false);
      }
    } else {
      await modalApi.close();
    }
  },
  onBeforeClose: async () => {
    // 如果数据被修改，关闭窗口的时候会提示
    let off: boolean = true;
    if (allDirty.value) {
      off = await new Promise((resolve) => {
        AntdModal.confirm({
          title: '注意',
          okText: '退出',
          content: '数据未保存，是否退出。',
          onOk: () => resolve(true),
          onCancel: () => resolve(false),
        });
      });
    }
    return off;
  },
});

// 动态修改确定按钮文字，如果角色或权限有修改，就改成保存，否则确定
watchEffect(() => {
  const text = allDirty.value ? '保存' : '确定';
  modalApi.setState({ confirmText: text });
});

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

  policyIsDirty.value = dirty;
};
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
        <a-tree
          checkable
          :tree-data="treeData"
          v-model:checked-keys="checkedKeys"
          @check="treeCheck"
        />
      </div>
    </div>
  </Modal>
</template>
