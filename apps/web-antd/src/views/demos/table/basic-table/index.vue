<script setup lang="ts">
import type { ModalData, RowType } from './types';

import type { VbenFormSchema } from '#/adapter/form';

import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { message } from 'ant-design-vue';

import MyForm from './form.vue';
import MyGrid from './grid.vue';

const [messageApi, ContextHolder] = message.useMessage();
const [Modal, modalApi] = useVbenModal({
  connectedComponent: MyForm,
});

const schema: VbenFormSchema[] = [
  {
    component: 'Input',
    fieldName: 'id',
    label: 'ID',
    componentProps: {
      type: 'hidden',
      disabled: true,
    },
    formItemClass: 'hidden',
  },
  {
    // 组件需要在 #/adapter.ts内注册，并加上类型
    component: 'Input',
    // 字段名
    fieldName: 'user',
    // 界面显示的label
    label: '提交人',
  },
  {
    component: 'Input',
    fieldName: 'category',
    label: '分类名称',
  },
  {
    component: 'Select',
    fieldName: 'organization',
    label: '机构',
    componentProps: {
      allowClear: true,
      filterOption: true,
      options: [
        { label: 'A', value: 'a' },
        { label: 'B', value: 'b' },
        { label: 'C', value: 'c' },
      ],
      placeholder: '请选择',
      showSearch: true,
    },
    wrapperClass: 'w-1/3',
    controlClass: 'w-full',
  },
  {
    component: 'DatePicker',
    fieldName: 'created',
    label: '时间',
    wrapperClass: 'w-1/3',
    controlClass: 'w-full',
    componentProps: {
      valueFormat: 'YYYY-MM-DD',
    },
  },
];
const openModal = (row: RowType) => {
  schema.forEach((field) => {
    const { fieldName } = field;
    if (fieldName in row) {
      field.defaultValue = row[fieldName as keyof RowType];
    }
  });
  modalApi.setData<ModalData>({
    schema,
    update: true,
  });
  modalApi.open();
};

const data = ref<RowType[]>([
  {
    id: 1,
    category: 'Test1',
    user: 'Develop',
    organization: 'a',
    created: '2024-11-2',
  },
  {
    id: 2,
    category: 'Test2',
    user: 'Develop',
    organization: 'a',
    created: '2024-11-2',
  },
  {
    id: 3,
    category: 'Test3',
    user: 'Develop',
    organization: 'b',
    created: '2024-11-2',
  },
  {
    id: 4,
    category: 'Test4',
    user: 'Develop',
    organization: 'c',
    created: '2024-11-2',
  },
  {
    id: 5,
    category: 'Test5',
    user: 'Develop',
    organization: 'b',
    created: '2024-11-2',
  },
]);
const updateGridField = (
  formData: RowType,
  update: boolean,
  resolve: (result: boolean) => void,
) => {
  if (update) {
    let result = false;
    const index = data.value.findIndex((col) => col.id === formData.id);
    if (index !== -1) {
      data.value.splice(index, 1, formData);
      result = true;
    }
    setTimeout(() => {
      resolve(result);
      messageApi.info('修改成功');
    }, 1000);
  }
};
</script>

<template>
  <div class="p-5">
    <a-card :bordered="false">
      <MyGrid :data @open-form="openModal" />
    </a-card>

    <Modal @update-form="updateGridField" />

    <ContextHolder />
  </div>
</template>
