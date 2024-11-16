<script setup lang="ts">
import type { ModalData, RowType } from './types';

import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { useVbenForm } from '#/adapter/form';

const emits = defineEmits<{
  updateForm: [
    row: RowType,
    boolean,
    resolve: (value: boolean | null | PromiseLike<boolean | null>) => void,
  ];
}>();

const [MyForm, formApi] = useVbenForm({
  showDefaultActions: false,
});

const state = ref(false);
const [Modal, modalApi] = useVbenModal({
  onOpenChange: (isOpen: boolean) => {
    if (isOpen) {
      const data = modalApi.getData<ModalData>();
      // 动态更新组件的props
      formApi.setState({ schema: data.schema });
      state.value = data.update;
      modalApi.setState({
        title: data.update ? '修改' : '新建',
      });
    }
  },
  onConfirm: async () => {
    modalApi.setState({ loading: true });
    try {
      const value = await formApi.getValues();
      const result = await new Promise((resolve) => {
        emits('updateForm', value as RowType, state.value, resolve);
      });
      if (result) {
        modalApi.close();
      }
    } finally {
      modalApi.setState({ loading: false });
    }
  },
  draggable: true,
});
</script>

<template>
  <Modal>
    <MyForm />
  </Modal>
</template>
