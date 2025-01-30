<script lang="ts" setup>
import type { ModalData } from './types';

import { useTemplateRef } from 'vue';

import { Page, useVbenModal } from '@vben/common-ui';

import {
  addRole,
  getRole,
  getSysRoutes,
  updateRole,
} from '#/api/system/access/role';

import ModalForm from './modal-form.vue';
import TableMain from './table-main.vue';

const [Modal, modalApi] = useVbenModal({
  connectedComponent: ModalForm,
});

const tableMainRef =
  useTemplateRef<InstanceType<typeof TableMain>>('tableMainRef');
const openModal = async (id?: number) => {
  if (tableMainRef.value) {
    const refreshGrid = tableMainRef.value.refresh;

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
            },
            policies: [],
            sys_routes,
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
          data,
        },
      });
    }
    modalApi.open();
  }
};
</script>

<template>
  <Page title="角色管理" auto-content-height>
    <TableMain ref="tableMainRef" @open-modal="openModal" />

    <Modal />
  </Page>
</template>
