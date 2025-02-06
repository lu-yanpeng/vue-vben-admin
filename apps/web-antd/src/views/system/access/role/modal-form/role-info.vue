<script setup lang="ts">
import type { RoleFormField, RoleStaticValue } from './types';

import { ref } from 'vue';

import { z } from '@vben/common-ui';
import { isEqual } from '@vben/utils';

import dayjs from 'dayjs';

import { useVbenForm } from '#/adapter/form';

const props = defineProps<{
  changeRoleDirty: (status: boolean) => void;
}>();

type StaticValue = {
  createTime: string;
  roleId: number | string;
  updateTime: string;
};
// 原始角色数据，判断角色是否修改过
const originRoleData = ref<null | RoleFormField>(null);

// 角色的固定数据，后端自动生成的，只用来展示
const roleId = ref<StaticValue['roleId']>('-');
const createTime = ref<StaticValue['createTime']>('-');
const updateTime = ref<StaticValue['updateTime']>('-');

const [BaseForm, formApi] = useVbenForm({
  showDefaultActions: false,
  layout: 'horizontal',
  schema: [
    {
      component: 'Input',
      componentProps: {
        placeholder: '角色名',
      },
      fieldName: 'name',
      label: '名称',
      disabled: true,
      rules: z
        .string()
        .trim()
        .min(2, '最少2个字符')
        .max(50, '最大长度50')
        .regex(/^[\w\-@.+]{2,50}$/, '只能输入字母和@+-_.'),
    },
    {
      component: 'Textarea',
      componentProps: {
        placeholder: '角色功能描述',
      },
      fieldName: 'desc',
      label: '描述',
    },
    {
      component: 'Checkbox',
      fieldName: 'is_default_role',
      label: '默认角色',
      help: '创建用户时自动添加这个角色',
    },
  ],
  handleValuesChange: (values) => {
    props.changeRoleDirty(!isEqual(originRoleData.value, values));
  },
});

defineExpose({
  formApi,
  _setValues: (role: RoleStaticValue, type: 'add' | 'update') => {
    const { id = '-', create_time = '-', update_time = '-' } = role;
    roleId.value = id;
    createTime.value =
      create_time === '-'
        ? create_time
        : dayjs(role.create_time).format('YYYY-MM-DD');
    updateTime.value =
      update_time === '-' ? '-' : dayjs(role.update_time).format('YYYY-MM-DD');

    // 保存原始角色数据，用来判断数据是否被修改
    originRoleData.value = {
      name: role.name,
      // 后端返回的这个字段值可能是null，直接给formApi赋值的话，desc会被赋值成undefined
      // 这样做比较的时候就会有问题，需要转成相同的值
      desc: role?.desc ?? undefined,
      is_default_role: role.is_default_role,
    };
    formApi.updateSchema([
      {
        fieldName: 'name',
        disabled: type === 'update',
      },
    ]);
    formApi.setValues(role);
  },
  getStaticValue: () => {
    return {
      id: roleId.value,
      create_time: createTime.value,
      update_time: updateTime.value,
    };
  },
});
</script>

<template>
  <div>
    <div class="flex justify-around">
      <div>
        <h2 class="font-medium">ID2132132</h2>
        <p>{{ roleId }}</p>
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
</template>
