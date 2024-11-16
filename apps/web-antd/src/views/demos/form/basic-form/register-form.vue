<script setup lang="ts">
import { message } from 'ant-design-vue';

import { useVbenForm, z } from '#/adapter/form';

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
      rules: z.string().min(3, { message: '长度必须大于3' }),
    },
    {
      component: 'InputPassword',
      componentProps: {
        placeholder: '请输入密码',
      },
      fieldName: 'password2',
      label: '确认密码',
      rules: z.string().refine(
        async (value: string) => {
          const { password } = await formApi.getValues();
          return value === password;
        },
        {
          message: '两次输入密码不一致',
        },
      ),
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

const onSubmit = () => {
  formApi.submitForm();
};
</script>

<template>
  <a-card>
    <MyForm />
    <a-button block type="primary" @click="onSubmit">注册</a-button>
  </a-card>
</template>
