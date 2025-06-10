<script setup lang="ts">
import type { CurrentValue, ModalData } from '../types';

import { computed, nextTick, ref, shallowRef, watch } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { useVbenVxeGrid } from '#/adapter/vxe-table';

const modalData = shallowRef<ModalData | null>(null);

const selected = ref<CurrentValue | null>(null);

const desc = computed(() => {
  if (!selected.value) {
    return '-';
  }
  return selected.value.id === '' ? '-' : selected.value.desc;
});
const uid = computed(() => {
  if (!selected.value) {
    return '-';
  }
  const _id = selected.value.id;
  return _id === '' ? '-' : _id;
});

const [Modal, modalApi] = useVbenModal({
  draggable: true,
  centered: true,
  closeOnClickModal: false,
  onOpened: async () => {
    modalData.value = modalApi.getData<ModalData>();
    selected.value = modalData.value.currentValue.value;
  },
  onConfirm: () => {
    if (modalData.value && selected.value) {
      if (selected.value.id === '-' || selected.value.id === '') {
        modalData.value.onOk({
          id: '',
          desc: '-',
        });
      } else {
        modalData.value.onOk(selected.value);
      }
    }
    modalApi.close();
  },
  onClosed: () => {
    selected.value = null;
  },
});

const [Grid, gridApi] = useVbenVxeGrid({
  gridOptions: {
    pagerConfig: {
      pageSize: 10,
    },
    rowConfig: {
      isCurrent: true,
      isHover: true,
      keyField: 'id',
    },
    radioConfig: {
      trigger: 'row',
      reserve: true,
    },
    columns: [{ type: 'radio', align: 'center', width: 60 }],
    proxyConfig: {
      ajax: {
        query: async (...args: any[]) => {
          if (modalData.value) {
            const { query } = modalData.value;
            // @ts-ignore: 这里类型没错
            return await query(...args);
          }
        },
        querySuccess: async () => {
          // 每次触发query的时候都会调用这个方法，但是这里有一个问题
          // 如果这个modal窗口已经打开过一次，再次运行的时候querySuccess方法会比selected赋值语句先运行
          // 这样会导致selected始终为null，无法设置单选项的值
          // 从modalData中获取数据可以解决这个问题
          await nextTick();
          let id = '';
          if (selected.value) {
            id = selected.value.id;
          } else if (modalData.value) {
            id = modalData.value.currentValue.value.id;
          }
          if (id !== '') {
            await gridApi.grid.setRadioRowKey(id);
          }
        },
      },
      response: {
        result: (data: { data: Record<string, any>[] }) => {
          if (modalData.value) {
            const _result = modalData.value.responseResult(data);
            // 有些表格的id字段是number类型，这里手动转换类型，保证所有表的id都是string
            // 否则id是number，用setRadioRowKey勾选的数据的时候，如果传入一个string，就会勾选不上
            _result.map((item) => (item.id = String(item.id)));
            return _result;
          }
        },
        total: (data: { data: { meta: { total: number } } }) => {
          return data.data.meta.total;
        },
      },
    },
  },
  gridEvents: {
    radioChange: ({ newValue }: { newValue: Record<string, any> }) => {
      if (modalData.value) {
        selected.value = {
          id: newValue.id,
          desc: newValue?.[modalData.value.descField] ?? '',
        };
      }
    },
  },
});

// 加载表格columns，并初始化数据
watch(
  () => modalData.value,
  async () => {
    if (modalData.value !== null) {
      const { columns } = modalData.value;
      const _col = Array.isArray(columns) ? columns : [];
      gridApi.setGridOptions({
        columns: [{ type: 'radio', align: 'center', width: 60 }, ..._col],
      });
      await gridApi.reload();
    }
  },
  { once: true },
);
</script>

<template>
  <Modal>
    <a-descriptions title="已选数据" bordered>
      <a-descriptions-item label="ID">{{ uid }}</a-descriptions-item>
      <a-descriptions-item label="描述">{{ desc }}</a-descriptions-item>
    </a-descriptions>
    <Grid />
  </Modal>
</template>
