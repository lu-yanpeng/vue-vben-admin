<script setup lang="ts">
import type { MessageSymbolType } from '../symbol-kyes';
import type { AddData, ModalData, UpdateData } from '../types';
import type {
  ApiRoutes,
  RoleFormField,
  RoleStaticValue,
  SingleRole,
} from './types';

import type { AddRoleData, UpdateRoleData } from '#/api/system/role';
import type { RouteMenuItem } from '#/types/menu';

import { computed, inject, ref, useTemplateRef, watchEffect } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { Modal as AntdModal } from 'ant-design-vue';

import { messageSymbolKeys } from '../symbol-kyes';
import RolePolicy from './policy.vue';
import RoleInfo from './role-info.vue';
import RoleRoutes from './routes.vue';

const msgApi = inject<MessageSymbolType>(messageSymbolKeys);

// 权限是否被修改
const policyIsDirty = ref(false);
const changePolicyDirty = (status: boolean) => {
  policyIsDirty.value = status;
};
// 角色表单是否被修改，表单触发修改事件的时候判断修改的数据和原来的数据是否相同
// 不相同就把他设为true，表示当前表单已被修改，把确认按钮改成修改按钮
const roleIsDirty = ref(false);
const changeRoleDirty = (status: boolean) => {
  roleIsDirty.value = status;
};
const routesIsDirty = ref(false);
const changeRoutesDirty = (status: boolean) => {
  routesIsDirty.value = status;
};
// 权限或角色是否被修改
const allDirty = computed(
  () => roleIsDirty.value || policyIsDirty.value || routesIsDirty.value,
);

const roleInfoRef = useTemplateRef('roleInfoRef');
const roleInfoData = ref<null | RoleStaticValue>(null);

// 后端所有api接口的地址
const apiRoutes = ref<ApiRoutes>([]);
// 已勾选的权限
const policiesCheckedKeys = ref<SingleRole['policies']>([]);
const rolePolicyRef = useTemplateRef('rolePolicyRef');

const serverRoutes = ref<RouteMenuItem[]>([]);
const roleRoutesData = ref<null | RouteMenuItem[]>(null);
const roleRoutesRef = useTemplateRef('roleRoutesRef');

const modalType = ref<AddData['type'] | UpdateData['type']>('add');

const [Modal, modalApi] = useVbenModal({
  draggable: true,
  centered: true,
  class: 'md:w-3/5',
  closeOnClickModal: false,
  onOpenChange: async (isOpen: boolean) => {
    if (isOpen) {
      const _modalData = modalApi.getData<ModalData>();
      modalType.value = _modalData.type;

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

        // 表单数据
        roleInfoData.value = role as RoleStaticValue;

        // 权限数据
        policiesCheckedKeys.value = policies;
        if (sys_routes) {
          // 权限目录
          apiRoutes.value = sys_routes;
        }

        // 角色可访问的路由
        roleRoutesData.value = role.routes;
        // 前端路由目录
        serverRoutes.value = data.serverRoutes;
      }
    }
  },
  onConfirm: async () => {
    // 如果数据被修改了需要提交，否则直接关闭弹窗
    if (allDirty.value) {
      let formData: RoleFormField | undefined;
      if (roleInfoRef.value) {
        formData = (await roleInfoRef.value.formApi.validateAndSubmitForm()) as
          | RoleFormField
          | undefined;
      }

      if (!formData) {
        if (msgApi) {
          msgApi('error', '表单验证失败');
        }
        return;
      }
      const _policies: { act: string; path: string }[] = [];
      if (rolePolicyRef.value) {
        _policies.push(...rolePolicyRef.value.getPolicies());
      }

      let _roleRoutes: null | RouteMenuItem[] = null;
      if (roleRoutesRef.value) {
        _roleRoutes = roleRoutesRef.value.getRoutes();
      }

      const _modalData = modalApi.getData<ModalData>();

      try {
        modalApi.lock(true);
        let refreshGrid: (() => Promise<void>) | null = null;
        // 新增和修改的方法需要的数据不同，需要分开处理
        if (_modalData.type === 'add') {
          const { addMethod } = _modalData.add;
          const data: AddRoleData = {
            role: formData,
            policies: _policies,
            routes: _roleRoutes,
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
          if (routesIsDirty.value) {
            const routes = _roleRoutes ? JSON.stringify(_roleRoutes) : null;
            if ('role' in data) {
              data.role.routes = routes;
            } else {
              data.role = {
                routes,
              };
            }
          }
          if (policyIsDirty.value) {
            data.policies = _policies;
          }
          refreshGrid = _modalData.update.refreshGrid;
          if (roleInfoRef.value) {
            const { id: roleId } = roleInfoRef.value.getStaticValue();
            await updateMethod(Number(roleId), data as UpdateRoleData);
          }
        }

        // 修改当前表单状态，以免关闭弹窗的时候弹出确认按钮
        policyIsDirty.value = false;
        roleIsDirty.value = false;
        routesIsDirty.value = false;
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
</script>

<template>
  <Modal>
    <div
      class="grid grid-cols-1 md:[grid-template-columns:30fr_5fr_30fr_5fr_30fr]"
    >
      <RoleInfo
        ref="roleInfoRef"
        :change-role-dirty="changeRoleDirty"
        :role-data="roleInfoData"
        :type="modalType"
      />

      <div class="d-divider md:d-divider-horizontal"></div>

      <RolePolicy
        ref="rolePolicyRef"
        :checked-keys="policiesCheckedKeys"
        :change-dirty="changePolicyDirty"
        :api-routes="apiRoutes"
      />

      <div class="d-divider md:d-divider-horizontal"></div>

      <RoleRoutes
        ref="roleRoutesRef"
        :change-dirty="changeRoutesDirty"
        :role-routes="roleRoutesData"
        :server-routes
      />
    </div>
  </Modal>
</template>
