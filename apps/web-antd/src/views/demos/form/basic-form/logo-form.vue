<script setup lang="ts">
import { message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';

const [MyForm, formApi] = useVbenForm({
  layout: 'vertical',
  schema: [
    {
      // 组件需要在 #/adapter.ts内注册，并加上类型
      component: 'Input',
      // 对应组件的参数
      componentProps: {
        placeholder: '请输入用户名',
      },
      // 字段名
      fieldName: 'username',
      // 界面显示的label
      label: '用户名',
    },
    {
      component: 'InputPassword',
      componentProps: {
        placeholder: '请输入密码',
      },
      fieldName: 'password',
      label: '密码',
    },
  ],
  showDefaultActions: false,
  commonConfig: {
    formItemClass: 'pb-4',
  },
  handleSubmit: (value: Record<string, string>) => {
    message.info(`提交表单 ${JSON.stringify(value)}`);
  },
  submitOnEnter: true,
});

const onSubmit = async () => {
  await formApi.submitForm();
};
</script>

<template>
  <a-card>
    <MyForm />
    <a-button block type="primary" @click="onSubmit">登录</a-button>
  </a-card>
</template>
