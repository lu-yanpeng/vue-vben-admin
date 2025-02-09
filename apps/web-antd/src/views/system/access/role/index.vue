<script lang="ts" setup>
import type { ModalData } from './types';

import { provide, useTemplateRef } from 'vue';

import { Page, useVbenModal } from '@vben/common-ui';

import { message } from 'ant-design-vue';

import {
  addRole,
  delRole as delRoleApi,
  getRole,
  getSysRoutes,
  updateRole,
} from '#/api/system/access/role';
import { getServerRoutes } from '#/api/system/menu';

import ModalForm from './modal-form/index.vue';
import { messageSymbolKeys } from './symbol-kyes';
import TableMain from './table-main.vue';

const [msgApi, ContextHolder] = message.useMessage();
const showMessage = (
  type: 'error' | 'info' | 'success' | 'warning',
  text: string,
) => {
  try {
    msgApi[type](text);
  } catch {
    msgApi.info(text);
  }
};
provide(messageSymbolKeys, showMessage);

const [Modal, modalApi] = useVbenModal({
  connectedComponent: ModalForm,
});
// TODO: 1. 后端代码提交
// 2. 所有接口接入casbin
// 3. 测试user接口
// 4. 前端接入user
const tableMainRef =
  useTemplateRef<InstanceType<typeof TableMain>>('tableMainRef');
const openModal = async (id?: number) => {
  if (tableMainRef.value) {
    const refreshGrid = tableMainRef.value.refresh;
    const serverRoutes = await getServerRoutes();

    if (id === undefined) {
      const sys_routes = await getSysRoutes();
      modalApi.setData<ModalData>({
        type: 'add',
        add: {
          addMethod: addRole,
          refreshGrid,
          data: {
            role: {
              name: '',
              desc: '',
              is_default_role: false,
              routes: null,
            },
            policies: [],
            sys_routes,
            serverRoutes,
          },
        },
      });
    } else {
      const data = await getRole(id);
      modalApi.setData<ModalData>({
        type: 'update',
        update: {
          updateMethod: updateRole,
          refreshGrid,
          data: {
            ...data,
            serverRoutes,
          },
        },
      });
    }
    modalApi.open();
  }
};

const delRole = async (idList: number[]) => {
  if (tableMainRef.value) {
    const gridApi = tableMainRef.value.gridApi;
    try {
      gridApi.setLoading(true);
      const result = await delRoleApi(idList);

      if (result.length > 0) {
        msgApi.success('删除成功');
        await tableMainRef.value.refresh();
      } else {
        msgApi.error('删除失败');
      }
    } finally {
      gridApi.setLoading(false);
    }
  }
  console.error('异常');
};
</script>

<template>
  <Page title="角色管理" auto-content-height>
    <TableMain ref="tableMainRef" @open-modal="openModal" @del-role="delRole" />

    <Modal />

    <ContextHolder />
  </Page>
</template>
