<script lang="ts" setup>
import type { ModalData } from './types';

import { useTemplateRef } from 'vue';

import { Page, useVbenModal } from '@vben/common-ui';

import { getRole, updateRole } from '#/api/system/access/role';

import ModalForm from './modal-form.vue';
import TableMain from './table-main.vue';

const [Modal, modalApi] = useVbenModal({
  connectedComponent: ModalForm,
});

const tableMainRef =
  useTemplateRef<InstanceType<typeof TableMain>>('tableMainRef');
const openModal = async (id: number) => {
  if (tableMainRef.value) {
    const data = await getRole(id);
    modalApi.setData<ModalData>({
      updateMethod: updateRole,
      refreshGrid: tableMainRef.value.refresh,
      ...data,
    });
    modalApi.open();
  }
};
</script>

<template>
  <Page title="角色管理">
    <div class="d-card bg-base-100 shadow-xl">
      <div class="d-card-body">
        <TableMain ref="tableMainRef" @open-modal="openModal" />
      </div>
    </div>

    <Modal />
  </Page>
</template>
