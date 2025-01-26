<script setup lang="ts">
import type { Role } from './types';

import type { VbenFormProps } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import dayjs from 'dayjs';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getRoleList } from '#/api/system/access/role';

const emits = defineEmits<{
  openModal: [id: number];
}>();

const formOptions: VbenFormProps = {
  // 默认展开
  collapsed: false,
  schema: [
    {
      component: 'Input',
      componentProps: {
        placeholder: 'Please enter category',
      },
      defaultValue: '1',
      fieldName: 'category',
      label: 'Category',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: 'Please enter productName',
      },
      fieldName: 'productName',
      label: 'ProductName',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: 'Please enter price',
      },
      fieldName: 'price',
      label: 'Price',
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: [
          {
            label: 'Color1',
            value: '1',
          },
          {
            label: 'Color2',
            value: '2',
          },
        ],
        placeholder: '请选择',
      },
      fieldName: 'color',
      label: 'Color',
    },
    {
      component: 'DatePicker',
      fieldName: 'datePicker',
      label: 'Date',
    },
  ],
  // 控制表单是否显示折叠按钮
  showCollapseButton: true,
  submitButtonOptions: {
    content: '查询',
  },
  // 是否在字段值改变时提交表单
  submitOnChange: false,
  // 按下回车时是否提交表单
  submitOnEnter: false,
};

const gridOptions: VxeGridProps<Role> = {
  checkboxConfig: {
    highlight: true,
  },
  columns: [
    { type: 'checkbox', align: 'center', width: 60 },
    {
      field: 'id',
      title: 'ID',
      cellRender: {
        name: 'link',
        events: {
          // @ts-ignore: 编辑器提示错误，实际这个函数在自定义渲染器中被调用
          click: (params: Role) => {
            emits('openModal', params.id as number);
          },
        },
      },
    },
    { field: 'name', title: '名称' },
    { field: 'desc', title: '描述' },
    {
      field: 'is_default_role',
      title: '默认角色',
      cellRender: { name: 'checkbox' },
    },
    {
      field: 'create_time',
      title: '创建日期',
      formatter: ({ cellValue }) => dayjs(cellValue).format('YYYY-MM-DD'),
    },
    {
      field: 'update_time',
      title: '更新日期',
      formatter: ({ cellValue }) => dayjs(cellValue).format('YYYY-MM-DD'),
    },
  ],
  keepSource: true,
  pagerConfig: {},
  proxyConfig: {
    ajax: {
      query: async () => {
        return await getRoleList();
      },
    },
    response: {
      total: ({ data }): number => {
        return data.meta.total;
      },
      result: ({ data }): Role[] => {
        const __result = [];
        for (const item of data.data) {
          __result.push(item.role);
        }
        return __result;
      },
    },
  },
  toolbarConfig: {
    // 是否显示搜索表单控制按钮
    // search: true,
  },
};

const [Grid, gridApi] = useVbenVxeGrid({ formOptions, gridOptions });

const getTest = async () => {
  await getRoleList();
};

defineExpose({
  refresh: gridApi.query,
});
</script>

<template>
  <div>
    <div>
      <button class="d-btn" @click="getTest">获取</button>
    </div>

    <Grid />
  </div>
</template>
