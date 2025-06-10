<script setup lang="ts">
import type { ModalData, TableProps } from './types';

import { computed, ref, useAttrs, useTemplateRef, watch } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import ModalTable from './modal-table/index.vue';

// 异步组件从外部导入props类型会报错
interface MainProps {
  // 正确返回desc会显示这个desc，抛出异常会显示'-'
  // 所以处理完异常之后也需要抛出一个异常
  getDescByID: (id: string) => Promise<string>;
  // 表格获取当前值时包含多个字段，可以选其中一个作为描述
  descField: string;
  table?: TableProps;
  // 外部修改这个值，可以改变id对应的描述
  desc: string;

  // 这个值需要从父组件透传获取，就是从form-field.vue的createComponentProps方法获取
  // 不要手动传递这个值
  value?: string;
}

const props = defineProps<MainProps>();

// 父组件通过attrs传递的参数中包含了onBlur和onUpdate:value
// 如果全部绑定到input上，会触发一个警告：input的@blur事件需要绑定一个函数不是一个数组，因为我自己也写了@blur方法
// 所以不能全部绑定attrs，先接收父组件的事件，在自己的@blur处理完之后再调用父组件的方法
// 参考 https://cn.vuejs.org/guide/components/attrs.html#nested-component-inheritance
defineEmits<{
  'update:value': [any];
}>();

// 接收外部透传的属性，绑定到input上
const attrs = useAttrs();

// 这里相当于 props={modelValue: string} :value="inputValue" emits('update:modelValue')
// 定义props接收modelValue，绑定modelValue到a-input的value属性，a-input触发更新的时候这里会调用父组件的update:modelValue
// 这样就能避免绑定多个事件，控制台出现警告
const inputValue = defineModel<string>('modelValue', { default: '' });

// 这个值主要用在首次获取描述时设置描述，还有接收modal组件传递过来的值
// 真正显示描述的是currentVa
const descValue = ref<null | string>('-');

// 这个变量用来给modal传递值，和显示desc
const currentValue = computed(() => {
  const id = inputValue.value;
  const desc = descValue.value ?? props.desc;

  return {
    id,
    desc,
  };
});

// 外部修改props.desc时需要把这个值改成null，这样才能用props.desc来显示描述
watch(
  () => props.desc,
  () => (descValue.value = null),
);

// 获取当前id对应的desc，首次获取描述时用到
const getCurrentDesc = async (): Promise<string> => {
  const v = inputValue.value;
  let _desc = '-';
  if (v !== '' && v !== null && v !== undefined) {
    // 获取当前描述的值，如果id不存在需要在异常处理中设置成-
    try {
      _desc = (await props.getDescByID(v)) ?? '-';
    } catch {
      _desc = '-';
    }
  }
  return _desc;
};

// 输入框获取到值之后执行一次获取desc，整个表单会先打开，再获取数据，需要这样才能监听到数据变化
const { stop } = watch(
  () => props.value,
  async () => {
    descValue.value = await getCurrentDesc();
  },
  { once: true },
);

const onInput = () => {
  /*
   * 触发input时手动关闭watch，避免触发getCurrentDesc浪费资源
   * 比如inputValue默认值是''，这时候watch props.value没有运行，输入值的时候它才会运行
   * 这样就和外部的rules重复了
   * */
  descValue.value = null;
  stop();
};

const [Modal, modalApi] = useVbenModal({
  connectedComponent: ModalTable,
});

const openTable = () => {
  if (props?.table) {
    modalApi.setData<ModalData>({
      descField: props.descField,
      currentValue,
      onOk: (data) => {
        descValue.value = data.desc;
        inputValue.value = data.id === '-' ? '' : data.id;
      },
      ...props.table,
    });
    modalApi.open();
  } else {
    console.warn('请输入正确的props');
  }
};

const aInputRef = useTemplateRef('aInputRef');

defineExpose({
  blur: () => {
    // @ts-ignore: 通过控制台可以到有这个方法
    // 可能会被autofocus方法用到
    aInputRef.value?.blur?.();
  },
  focus: (option: any) => {
    // @ts-ignore: 通过控制台可以到有这个方法
    // 可能会被autofocus方法用到
    aInputRef.value?.focus?.(option);
  },
  get $el() {
    // @ts-ignore: 通过控制台可以到有这个方法
    // 调用formApi.getFocusedField方法，会获取这个实例并从里面拿到name属性
    return aInputRef.value?.$el ?? undefined;
  },
});
</script>

<template>
  <div class="flex gap-2">
    <a-button class="shrink-0" @click="openTable">
      {{ currentValue.desc }}
    </a-button>
    <a-input
      ref="aInputRef"
      class="grow"
      v-model:value="inputValue"
      @input.once="onInput"
      v-bind="attrs"
    />
  </div>

  <Modal />
</template>
