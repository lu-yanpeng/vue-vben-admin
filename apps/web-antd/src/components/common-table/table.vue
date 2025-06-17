<script setup lang="tsx">
import type { Ref } from 'vue';

import type {
  GridApi,
  GridProps,
  MsgApi,
  Policies,
  PolicyMethod,
} from './types';

import { inject, ref } from 'vue';

import { merge } from '@vben/utils';

import { Modal as AntdModal, Tooltip } from 'ant-design-vue';
import dayjs from 'dayjs';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import PolicyButton from '#/components/policy-button.vue';

import { msgApiKey, policiesKey } from './symbol-keys';

const props = defineProps<GridProps>();

const emits = defineEmits<{
  add: [];
  del: [
    idList: number[] | string[],
    resolve: (value: boolean | PromiseLike<boolean | null>) => void,
  ];
  update: [id: number | string];
}>();

const msgApi = inject(msgApiKey) as MsgApi;

const policies = inject<Ref<Policies>>(policiesKey);

let gridApi!: GridApi;
const basicOptions: GridProps['options'] = {
  showSearchForm: false,
  formOptions: {
    // 默认展开
    collapsed: false,
    schema: [],
    // 控制表单是否显示折叠按钮
    showCollapseButton: true,
    submitButtonOptions: {
      content: '搜索',
    },
  },
  gridOptions: {
    autoResize: true,
    checkboxConfig: {
      highlight: true,
      trigger: 'cell',
    },
    columns: [],
    keepSource: true,
    toolbarConfig: {
      custom: true,
      refresh: true,
      zoom: true,
      slots: {},
    },
  },
};

// 合并两个配置并设置一些默认值
const mergedOptions: GridProps['options'] = merge(
  {},
  basicOptions,
  props.options,
);
// 添加id和时间字段
if (props.options.gridOptions?.columns && mergedOptions?.gridOptions?.columns) {
  mergedOptions.gridOptions.columns = [
    { type: 'checkbox', align: 'center', width: 60 },
    {
      field: 'id',
      title: 'ID',
      cellRender: {
        name: 'link',
        events: {
          // @ts-ignore: 编辑器提示错误，实际这个函数在自定义渲染器中被调用
          click: async (params: { id: number | string }) => {
            emits('update', params.id);
          },
        },
      },
    },
    ...props.options.gridOptions.columns,
    {
      field: 'create_time',
      title: '创建日期',
      formatter: ({ cellValue }: { cellValue: string }) =>
        dayjs(cellValue).format('YYYY-MM-DD'),
    },
    {
      field: 'update_time',
      title: '更新日期',
      formatter: ({ cellValue }: { cellValue: string }) =>
        dayjs(cellValue).format('YYYY-MM-DD'),
    },
  ];
}

// 表格左侧的新增，修改，删除按钮
if (
  !props.options.gridOptions?.toolbarConfig?.slots?.buttons &&
  basicOptions.gridOptions?.toolbarConfig?.slots &&
  mergedOptions.gridOptions?.toolbarConfig?.slots
) {
  mergedOptions.gridOptions.toolbarConfig.slots.buttons = () => {
    const onAdd = async () => {
      emits('add');
    };

    const onUpdate = async () => {
      const selectRecords: { id: number | string }[] =
        gridApi.grid.getCheckboxRecords();
      if (selectRecords.length === 1) {
        const uid = selectRecords[0]?.id;
        emits('update', uid as number);
      } else {
        msgApi.warning('请先选择要修改的数据，只能选择一条。');
      }
    };

    const onDel = async () => {
      const selectRecords: { id: number | string }[] =
        gridApi.grid.getCheckboxRecords();
      if (selectRecords.length === 0) {
        msgApi.warning('请先选择要删除的数据');
        return;
      }
      const selected = selectRecords.map((item) => item.id) as string[];

      const loading = ref(false);
      const _error = new Error('不关闭对话框');
      AntdModal.confirm({
        title: '注意',
        okText: '删除',
        content: `是否删除[${selected}]`,
        onOk: async () => {
          // 点击删除按钮的时候，等待删除完成再关闭窗口
          try {
            loading.value = true;
            const result = await new Promise((resolve) => {
              emits('del', selected, resolve);
            });
            return result ? Promise.resolve() : Promise.reject(_error);
          } finally {
            loading.value = false;
          }
        },
        onCancel: () => {
          return loading.value ? Promise.reject(_error) : Promise.resolve();
        },
      });
    };

    const getPolicy = (
      method: PolicyMethod,
    ):
      | undefined
      | {
          method: PolicyMethod;
          path: string;
        } => {
      if (policies?.value && method in policies.value) {
        return {
          path: policies.value[method] as string,
          method,
        };
      }
    };
    return (
      <>
        <div class="flex gap-2">
          <PolicyButton
            class="d-btn-sm d-btn-outline d-btn-info"
            onClick={onAdd}
            policy={getPolicy('POST')}
            text={'新增'}
          />
          <PolicyButton
            class="d-btn-sm d-btn-outline d-btn-info"
            onClick={onUpdate}
            policy={getPolicy('PUT')}
            text={'修改'}
          />
          <PolicyButton
            class="d-btn-sm d-btn-outline d-btn-warning"
            onClick={onDel}
            policy={getPolicy('DELETE')}
            text={'删除'}
          />
        </div>
      </>
    );
  };
}

// 表格右侧的查询，重置按钮。配置表单后才会添加这两个按钮，因为他们都跟表单有关
if (
  props.options.formOptions?.schema &&
  !props.options.gridOptions?.toolbarConfig?.slots?.tools &&
  mergedOptions.gridOptions?.toolbarConfig?.slots
) {
  // 每张表都有id，create_time，update_time，db_or_query_字段
  // 可以在这里直接添加到查询表单中
  if (mergedOptions.formOptions?.schema) {
    const propsSchema = props.options.formOptions.schema;

    const idResult = propsSchema.findIndex((item) => {
      return item?.fieldName === 'id';
    });
    if (idResult === -1) {
      mergedOptions.formOptions.schema.unshift({
        fieldName: 'id',
        label: 'ID',
        component: 'Input',
      });
    }

    const create_timeResult = propsSchema.findLastIndex((item) => {
      return item?.fieldName === 'create_time';
    });
    if (create_timeResult === -1) {
      mergedOptions.formOptions.schema.push({
        fieldName: 'create_time',
        label: '创建日期',
        component: 'RangePicker',
      });
    }

    const update_timeResult = propsSchema.findLastIndex((item) => {
      return item?.fieldName === 'update_time';
    });
    if (update_timeResult === -1) {
      mergedOptions.formOptions.schema.push({
        fieldName: 'update_time',
        label: '最后更新',
        component: 'RangePicker',
      });
    }

    const db_or_query_result = propsSchema.findLastIndex((item) => {
      return item?.fieldName === 'db_or_query_';
    });
    if (db_or_query_result === -1) {
      mergedOptions.formOptions.schema.push({
        fieldName: 'db_or_query_',
        label: 'OR查询',
        component: 'Checkbox',
        defaultValue: true,
        help: '只要有一个条件符合，就会返回这条数据；否则只有全部条件都符合才会返回。',
      });
    }
  }

  mergedOptions.gridOptions.toolbarConfig.slots.tools = () => {
    // 疑似每次调用gridApi.toggleSearchForm的时候都会刷新表格的状态
    // 导致这里的组件重新渲染，之前的保存的状态都消失了，只能手动添加类名
    const searchBtnRef = ref<HTMLButtonElement | null>(null);
    const onSearch = () => {
      gridApi.toggleSearchForm();
      if (searchBtnRef.value) {
        searchBtnRef.value.classList.toggle('d-btn-active');
      }
    };

    const onReset = async () => {
      // 从use-vxe-grid.vue组件复制来的方法，参考handleReset
      const _formApi = gridApi.formApi;
      await _formApi.resetForm();
      await _formApi.resetForm();
      const formValues = await _formApi.getValues();
      _formApi.setLatestSubmissionValues(formValues);
      await gridApi.reload();
    };
    return (
      <>
        <div class="flex justify-center gap-2">
          <Tooltip mouseEnterDelay={0.8} placement="bottom" title="搜索">
            <button
              class={['d-btn d-btn-ghost d-btn-circle d-btn-sm']}
              onClick={onSearch}
              ref={searchBtnRef}
            >
              <svg
                height="16"
                viewBox="0 0 16 16"
                width="16"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="m11.271 11.978l3.872 3.873a.5.5 0 0 0 .708 0a.5.5 0 0 0 0-.708l-3.565-3.564c2.38-2.747 2.267-6.923-.342-9.532c-2.73-2.73-7.17-2.73-9.898 0s-2.728 7.17 0 9.9a6.96 6.96 0 0 0 4.949 2.05a.5.5 0 0 0 0-1a5.96 5.96 0 0 1-4.242-1.757a6.01 6.01 0 0 1 0-8.486a6.004 6.004 0 0 1 8.484 0a6.01 6.01 0 0 1 0 8.486a.5.5 0 0 0 .034.738"
                  fill="currentColor"
                />
              </svg>
            </button>
          </Tooltip>

          <Tooltip mouseEnterDelay={0.8} placement="bottom" title="重置">
            <button
              class="d-btn d-btn-ghost d-btn-circle d-btn-sm"
              onClick={onReset}
            >
              <svg
                height="24"
                viewBox="0 0 24 24"
                width="24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 15.308V13.21q0-.504.353-.858q.354-.353.859-.353h2.096v.885h-2.423v2.423zM13.212 21q-.505 0-.859-.353q-.353-.354-.353-.858v-2.097h.885v2.423h2.423V21zm6.904-5.692v-2.424h-2.424V12h2.097q.504 0 .858.353q.353.354.353.859v2.096zM17.692 21v-.885h2.424v-2.423H21v2.097q0 .504-.353.858q-.354.353-.858.353zm1.93-11.385h-1.037q-.727-2.027-2.504-3.32T12 5Q9.075 5 7.038 7.038T5 12q0 2.108 1.11 3.79Q7.222 17.474 9 18.309V15h1v5H5v-1h3.312q-1.916-1-3.114-2.851T4 12q0-1.665.626-3.119T6.34 6.34t2.54-1.714T12 4q2.706 0 4.778 1.584q2.072 1.583 2.843 4.032"
                  fill="currentColor"
                />
              </svg>
            </button>
          </Tooltip>
        </div>
      </>
    );
  };
}

// 表格总数据
if (
  !props.options.gridOptions?.proxyConfig?.response?.total &&
  mergedOptions.gridOptions?.proxyConfig?.response?.result
) {
  mergedOptions.gridOptions.proxyConfig.response.total = ({
    data,
  }: {
    data: { meta: { total: number } };
  }): number => {
    return data.meta.total;
  };
}

const [Grid, __api] = useVbenVxeGrid(mergedOptions);
gridApi = __api;

defineExpose({
  gridApi,
});
</script>

<template>
  <Grid />
</template>
