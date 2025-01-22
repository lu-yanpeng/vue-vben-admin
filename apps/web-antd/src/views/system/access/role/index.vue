<script lang="ts" setup>
import { Page, useVbenModal } from '@vben/common-ui';

import { getRole } from '#/api/system/access/role';

import ModalForm from './modal-form.vue';
import TableMain from './table-main.vue';

const [Modal, modalApi] = useVbenModal({
  connectedComponent: ModalForm,
});

const openModal = async (id: number) => {
  const data = await getRole(id);
  modalApi.setData(data);
  modalApi.open();
};
</script>

<template>
  <Page title="角色管理">
    <div class="d-card bg-base-100 shadow-xl">
      <div class="d-card-body">
        <TableMain @open-modal="openModal" />
      </div>
    </div>

    <Modal />
  </Page>
</template>
