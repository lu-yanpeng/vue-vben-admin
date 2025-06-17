import type { MessageApi } from 'ant-design-vue/es/message';

import type { Ref } from 'vue';

import type { useVbenForm, VbenFormSchema } from '#/adapter/form';
import type { UseVbenVxeGrid } from '#/adapter/vxe-table';

import { useVbenVxeGrid } from '#/adapter/vxe-table';

/*
 * 这里的GridProps.options是从useVbenVxeGrid函数的参数中解析的类型
 * 如果不赋值给options，直接指定为defineProps的类型的话会报错。defineProps<GridProps>这样会报错
 * 错误提示：[@vue/compiler-sfc] Failed to resolve index type into finite keys
 * 原因可能是因为[这个](https://github.com/vuejs/core/issues/4294)
 * 使用type创建的类型，可能没法解析成正确的类型
 * */
export interface GridProps {
  options: Parameters<typeof useVbenVxeGrid>[0];
}
export type GridApi = ReturnType<UseVbenVxeGrid>[1];

export type Status = 'add' | 'update';

// symbol-keys类型
export type SetFormValues = Ref<boolean>;
export type MsgApi = MessageApi;
export type CurrentState = Ref<null | Status>;
export interface FormOption {
  api: ReturnType<typeof useVbenForm>[1];
  // 表单的原始数据，修改数据的时候可能会用到
  readonly originData: null | Record<string, any>;
}

export interface FormStaticValues {
  uid: number | string;
  createTime: string;
  updateTime: string;
}
export interface FormProps {
  getSchema: (
    status: Status,
    formOption: FormOption,
  ) => {
    schema: VbenFormSchema[];
    wrapperClass?: string;
  };
  getValues: (
    status: Status,
    uid?: number | string,
  ) => Promise<{
    staticValues?: FormStaticValues;
    values: Record<string, any>;
  }>;
  handler: {
    add: (data: Record<string, any>) => Promise<void>;
    del: (idList: number[] | string[]) => Promise<void>;
    update: (
      uid: number | string,
      data: Record<string, any>,
      originData: Record<string, any>,
    ) => Promise<void>;
  };
  // 返回undefined表示不使用valuesChange方法
  valuesChange?: (
    oldV: Record<string, any>,
    newV: Record<string, any>,
    status: Status,
  ) => boolean | undefined;
}

export interface ModalData {
  schema: VbenFormSchema[];
  wrapperClass?: string;
  getValues: () => Promise<{
    staticValues?: {
      createTime: string;
      uid: number | string;
      updateTime: string;
    };
    values: Record<string, any>;
  }>;
  valuesChange?: (
    oldV: Record<string, any>,
    newV: Record<string, any>,
    status: Status,
  ) => boolean | undefined;
  handler: Omit<FormProps['handler'], 'del'> & {
    refresh: () => Promise<void>;
  };
}

// 当前组件会用到的权限，每个权限对应一个路径，比如 { GET: '/role' }，表示要判断当前用户是否有/role路径的GET权限
export type PolicyMethod = 'DELETE' | 'GET' | 'PATCH' | 'POST' | 'PUT';
export type Policies = {
  [K in PolicyMethod]?: string;
};

export interface MainProps {
  gridProps: GridProps['options'];
  formProps: FormProps;
  policies?: Policies;
}
