<script setup lang="ts">
import type { Ref } from 'vue';

import type { ExtendedModalApi } from '@vben/common-ui';

import type {
  CurrentState,
  FormOption,
  FormStaticValues,
  ModalData,
  MsgApi,
  SetFormValues,
  Status,
} from './types';

import {
  computed,
  inject,
  onMounted,
  ref,
  shallowRef,
  watch,
  watchEffect,
} from 'vue';

import { useVbenModal } from '@vben/common-ui';
import { isEqual } from '@vben/utils';

import { Modal as AntdModal } from 'ant-design-vue/es/components';
import dayjs from 'dayjs';

import { useVbenForm } from '#/adapter/form';

import {
  currentStateKey,
  formOptionKey,
  msgApiKey,
  setFormValuesKey,
} from './symbol-keys';

const msgApi = inject(msgApiKey) as MsgApi;

const dirty = ref(false);
const currentState = inject(currentStateKey) as CurrentState;
const _formOption = inject(formOptionKey) as Ref<FormOption | null>;

const formStaticValue = ref<FormStaticValues>({
  uid: '-',
  createTime: '-',
  updateTime: '-',
});
const createTime = computed(() => {
  const dateTime = formStaticValue.value.createTime;
  if (dayjs(dateTime).isValid()) {
    return dayjs(dateTime).format('YYYY-MM-DD');
  }
  return dateTime;
});
const updateTime = computed(() => {
  const dateTime = formStaticValue.value.updateTime;
  if (dayjs(dateTime).isValid()) {
    return dayjs(dateTime).format('YYYY-MM-DD');
  }
  return dateTime;
});
const originFormData = shallowRef<null | Record<string, any>>(null);

// 通过setFormValues来控制表单数据的加载
// 这样可以做到先打开弹窗渲染一个空表单，再加载数据，避免点击修改后等待的时候没有任何提示
const setFormValues = inject(setFormValuesKey) as SetFormValues;

// 表单值被修改时，调用这个方法判断当前值是否和原始值相同
const formDataIsDirty = (values: Record<string, any>) => {
  let status = false;
  for (const key in originFormData.value) {
    if (key in values) {
      const o = originFormData.value[key];
      const t = values[key];
      if (
        (o === null || o === undefined) &&
        (t === null || t === undefined || t === '')
      ) {
        continue;
      }
      if (!isEqual(o, t)) {
        status = true;
        break;
      }
    }
  }
  return status;
};

// 先声明modalApi的类型，避免提示used before it was defined警告
let modalApi: ExtendedModalApi;
const [BaseForm, formApi] = useVbenForm({
  showDefaultActions: false,
  layout: 'horizontal',
  schema: [],
  wrapperClass: 'grid-cols-1',
  handleValuesChange: (values) => {
    let status = false;
    const { valuesChange } = modalApi.getData<ModalData>();
    if (typeof valuesChange === 'function') {
      const result = valuesChange(
        originFormData.value as Record<string, any>,
        values,
        currentState.value as Status,
      );
      status = result === undefined ? formDataIsDirty(values) : result;
    } else {
      status = formDataIsDirty(values);
    }
    dirty.value = status;
  },
});

const [Modal, _modalApi] = useVbenModal({
  draggable: true,
  centered: true,
  class: 'w-3/5 lg:w-2/5',
  closeOnClickModal: false,
  onOpenChange: async (isOpen: boolean) => {
    if (isOpen) {
      const { schema, wrapperClass } = modalApi.getData<ModalData>();
      formApi.setState({
        schema,
        wrapperClass: wrapperClass ?? 'grid-cols-1',
      });
    } else {
      setTimeout(() => {
        formStaticValue.value = {
          uid: '-',
          createTime: '-',
          updateTime: '-',
        };
        setFormValues.value = false;
        originFormData.value = null;
        currentState.value = null;
      }, 300);
    }
  },
  onConfirm: async () => {
    if (dirty.value) {
      const formResult = await formApi.validateAndSubmitForm();
      if (!formResult) {
        msgApi.error('表单验证失败');
        return;
      }

      const { handler } = modalApi.getData<ModalData>();
      modalApi.lock();
      try {
        if (currentState.value === 'add') {
          await handler.add(formResult);
        } else if (currentState.value === 'update') {
          await handler.update(
            formStaticValue.value.uid,
            formResult,
            originFormData.value as Record<string, any>,
          );
        } else {
          console.error('表单异常');
          await modalApi.close();
        }
      } catch (error: any) {
        modalApi.lock(false);
        msgApi.error(`服务器异常，${error?.message}`);
        return;
      }

      dirty.value = false;
      msgApi.success('修改成功');
      await modalApi.close();
      await handler.refresh();
    } else {
      await modalApi.close();
    }
  },
  onBeforeClose: async () => {
    // 如果数据被修改，关闭窗口的时候会提示
    let off = true;
    if (dirty.value) {
      off = await new Promise((resolve) => {
        AntdModal.confirm({
          title: '注意',
          okText: '退出',
          content: '数据未保存，是否退出。',
          onOk: () => {
            resolve(true);
            dirty.value = false;
          },
          onCancel: () => resolve(false),
        });
      });
    }
    return off;
  },
});
modalApi = _modalApi;

watchEffect(() => {
  const text = dirty.value ? '保存' : '确定';
  modalApi.setState({ confirmText: text });
});

watch(
  () => setFormValues.value,
  async (v) => {
    if (v) {
      try {
        modalApi.lock();
        const { getValues } = modalApi.getData<ModalData>();
        const formData = await getValues();
        if (formData) {
          if (formData?.staticValues) {
            formStaticValue.value = formData.staticValues;
          }
          originFormData.value = formData.values;
          await formApi.setValues(formData.values);
        }
      } catch {
        msgApi.error('数据加载失败');
      } finally {
        modalApi.lock(false);
      }
    }
  },
);
onMounted(() => {
  if (!_formOption.value) {
    _formOption.value = {
      api: formApi,
      get originData() {
        return originFormData.value;
      },
    };
  }
});
</script>

<template>
  <Modal>
    <div>
      <div class="flex justify-around">
        <div>
          <h2 class="font-medium">ID</h2>
          <p>{{ formStaticValue.uid }}</p>
        </div>
        <div class="">
          <h2 class="font-medium">创建时间</h2>
          <p>{{ createTime }}</p>
        </div>
        <div class="">
          <h2 class="font-medium">最后修改</h2>
          <p>{{ updateTime }}</p>
        </div>
      </div>

      <div class="d-divider"></div>

      <BaseForm />
    </div>
  </Modal>
</template>
