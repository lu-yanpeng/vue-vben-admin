<script setup lang="tsx">
import type { MessageSymbolType } from './symbol-kyes';
import type { Role } from './types';

import type { VbenFormProps } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { inject } from 'vue';

import { Modal as AntdModal } from 'ant-design-vue';
import dayjs from 'dayjs';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getRoleList } from '#/api/system/access/role';

import { messageSymbolKeys } from './symbol-kyes';

const emits = defineEmits<{
  delRole: [idList: number[]];
  openModal: [id?: number];
}>();

const msgApi = inject<MessageSymbolType>(messageSymbolKeys);

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
    trigger: 'cell',
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
    slots: {
      buttons: () => {
        const delRole = async () => {
          const selectRecords: NonNullable<Role>[] =
            gridApi.grid.getCheckboxRecords();
          if (selectRecords.length === 0) {
            if (msgApi) {
              msgApi('warning', '请先选择要删除的数据');
            }
            return;
          }
          const selected = selectRecords.map((item) => item.id) as number[];
          await new Promise((resolve) => {
            AntdModal.confirm({
              title: '注意',
              okText: '删除',
              content: `是否删除[${selected}]`,
              onOk: () => {
                resolve(true);
                emits('delRole', selected);
              },
              onCancel: () => resolve(false),
            });
          });
        };

        const updateRole = () => {
          const selectRecords: NonNullable<Role>[] =
            gridApi.grid.getCheckboxRecords();
          if (selectRecords.length === 1) {
            const uid = (selectRecords[0] as NonNullable<Role>).id;
            emits('openModal', uid);
          } else {
            if (msgApi) {
              msgApi('warning', '请先选择要修改的数据，只能选择一条。');
            }
          }
        };
        return (
          <>
            <div class="flex gap-2">
              <button
                class="d-btn d-btn-sm d-btn-outline d-btn-info"
                onClick={() => emits('openModal')}
              >
                新增
              </button>
              <button
                class="d-btn d-btn-sm d-btn-outline d-btn-info"
                onClick={updateRole}
              >
                修改
              </button>
              <button
                class="d-btn d-btn-sm d-btn-outline d-btn-warning"
                onClick={delRole}
              >
                删除
              </button>
            </div>
          </>
        );
      },
    },
  },
};

const [Grid, gridApi] = useVbenVxeGrid({ formOptions, gridOptions });

// FIXME: grid组件无法触发checkbox-change事件
defineExpose({
  refresh: gridApi.query,
  gridApi,
});
</script>

<template>
  <Grid />
</template>
