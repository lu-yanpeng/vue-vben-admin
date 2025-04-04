<script setup lang="ts">
import type { CurrentState, FormOption, MainProps, ModalData } from './types';

import { provide, ref, useTemplateRef } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { message as AntMessage } from 'ant-design-vue';

import ModalForm from './modal-form.vue';
import {
  currentStateKey,
  formOptionKey,
  msgApiKey,
  setFormValuesKey,
} from './symbol-keys';
import TableMain from './table.vue';

const props = defineProps<MainProps>();

const [msgApi, ContextHolder] = AntMessage.useMessage();

const setFormValues = ref(false);
provide(setFormValuesKey, setFormValues);
provide(msgApiKey, msgApi);
const currentState = ref(null) as CurrentState;
provide(currentStateKey, currentState);
const formOption = ref<FormOption | null>(null);
provide(formOptionKey, formOption);

const [Modal, modalApi] = useVbenModal({
  connectedComponent: ModalForm,
});

const tableMainRef = useTemplateRef('tableMainRef');

const addData = async () => {
  currentState.value = 'add';
  const { schema, wrapperClass } = props.formProps.getSchema(
    'add',
    // @ts-ignore: formOption在modal-form组件挂载时赋值
    formOption.value,
  );
  modalApi
    .setData<ModalData>({
      schema,
      wrapperClass,
      getValues: async () => {
        return await props.formProps.getValues('add');
      },
      valuesChange: props.formProps.valuesChange,
      handler: {
        ...props.formProps.handler,
        refresh: async () => {
          if (tableMainRef.value) {
            tableMainRef.value.gridApi.reload();
          } else {
            console.error('刷新异常');
          }
        },
      },
    })
    .open();
  setFormValues.value = true;
};
const delData = async (
  idList: number[] | string[],
  resolve: (value: boolean | PromiseLike<boolean | null>) => void,
) => {
  currentState.value = null;
  try {
    const { handler } = props.formProps;
    await handler.del(idList);
    if (tableMainRef.value) {
      tableMainRef.value.gridApi.reload();
    }
    resolve(true);
  } catch {
    resolve(false);
  }
};
const updateData = async (uid: number | string) => {
  currentState.value = 'update';
  const { schema, wrapperClass } = props.formProps.getSchema(
    'update',
    // @ts-ignore: formOption在modal-form组件挂载时赋值
    formOption.value,
  );
  modalApi
    .setData<ModalData>({
      schema,
      wrapperClass,
      getValues: async () => {
        return await props.formProps.getValues('update', uid);
      },
      valuesChange: props.formProps.valuesChange,
      handler: {
        ...props.formProps.handler,
        refresh: async () => {
          if (tableMainRef.value) {
            tableMainRef.value.gridApi.reload();
          } else {
            console.error('刷新异常');
          }
        },
      },
    })
    .open();
  setFormValues.value = true;
};
</script>

<template>
  <div>
    <TableMain
      ref="tableMainRef"
      :options="props.gridProps"
      @add="addData"
      @del="delData"
      @update="updateData"
    />

    <Modal />

    <ContextHolder />
  </div>
</template>
