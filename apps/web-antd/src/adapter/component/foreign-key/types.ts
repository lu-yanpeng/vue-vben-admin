import type { Ref } from 'vue';

export interface TableProps {
  columns?: Record<string, any>[];
  // 返回表格的数据，这里不要整理数据，直接返回就行，在responseResult中整理数据
  query: (parms: any[]) => Promise<Record<string, any>[]>;
  // query函数的返回值会包装到data.data里面，需要从data.data中返回table的数据
  responseResult: (data: {
    data: Record<string, any>;
  }) => Record<string, any>[];
}

export interface CurrentValue {
  id: string;
  desc: string;
}
export interface ModalData extends TableProps {
  descField: string;
  currentValue: Ref<CurrentValue>;
  onOk: (data: CurrentValue) => void;
}
