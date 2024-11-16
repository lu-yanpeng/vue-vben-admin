<script setup lang="ts">
import type { RowType } from './types';

import type { VxeGridProps } from '#/adapter/vxe-table';

import { useVbenVxeGrid } from '#/adapter/vxe-table';

const props = withDefaults(
  defineProps<{
    data: RowType[];
  }>(),
  {
    data: () => [],
  },
);

const emits = defineEmits<{
  openForm: [row: RowType];
}>();

const gridOptions: VxeGridProps<RowType> = {
  checkboxConfig: {
    // trigger: 'row'
  },
  rowConfig: {
    isHover: true,
  },
  editConfig: {
    trigger: 'click',
    mode: 'row',
  },
  stripe: true,
  showOverflow: true,
  loading: false,
  columns: [
    { type: 'checkbox', width: 60 },
    { field: 'user', title: '提交人', slots: { default: 'user_slot' } },
    { field: 'category', title: '分类名称', editRender: { name: 'input' } },
    {
      field: 'organization',
      title: '机构',
      editRender: {
        name: 'select',
        options: [
          { label: 'A', value: 'a' },
          { label: 'B', value: 'b' },
          { label: 'C', value: 'c' },
        ],
      },
    },
    {
      field: 'created',
      title: '时间',
      editRender: { name: 'input', attrs: { type: 'date' } },
    },
    {
      title: '操作',
      width: 200,
      slots: { default: 'action' },
      align: 'center',
    },
  ],
  data: props.data,
  /* toolbarConfig: {
    tools: [
      { name: '新增', code: 'add', status: 'primary' },
      { name: '修改', code: 'update', status: 'primary' },
      { name: '删除', code: 'del', status: 'error' },
    ]
  },*/
  // FIXME：设置toolbar不生效
  toolbarConfig: {
    custom: true,
    export: true,
    refresh: true,
    zoom: true,
  },
};

const [Grid, gridApi] = useVbenVxeGrid({ gridOptions });
const hasEditStatus = (row: RowType) => {
  const $grid = gridApi.grid;
  if ($grid) {
    return $grid.isEditByRow(row);
  }
};

const editRowEvent = (row: RowType) => {
  const $grid = gridApi.grid;
  if ($grid) {
    $grid.setEditRow(row);
  }
};

const saveRowEvent = () => {
  const $grid = gridApi.grid;
  if ($grid) {
    $grid.clearEdit().then(() => {
      gridApi.setLoading(true);
      setTimeout(() => {
        gridApi.setLoading(false);
        /* VxeUI.modal.message({
          content: `保存成功！操作人-${row.user}`,
          status: 'success',
        })*/
      }, 300);
    });
  }
};

const cancelRowEvent = () => {
  const $grid = gridApi.grid;
  if ($grid) {
    $grid.clearEdit();
  }
};
const openForm = (row: RowType) => {
  emits('openForm', row);
};
</script>

<template>
  <Grid>
    <template #user_slot="{ row }">
      <a-button type="text" @click="openForm(row)">{{ row.user }}</a-button>
    </template>

    <template #action="{ row }">
      <template v-if="hasEditStatus(row)">
        <div class="flex justify-center gap-2">
          <a-button @click="saveRowEvent(row)">保存</a-button>
          <a-button @click="cancelRowEvent">取消</a-button>
        </div>
      </template>
      <template v-else>
        <a-button @click="editRowEvent(row)">编辑</a-button>
      </template>
    </template>
  </Grid>
</template>
