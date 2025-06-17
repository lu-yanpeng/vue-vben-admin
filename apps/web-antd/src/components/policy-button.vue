<!--
这个按钮组件自动根据传入的接口参数，判断当前用户是否有权限，没有权限会禁用按钮
<PolicyButton :policy="{path: '/role', method: 'GET' }" >
-->
<script setup lang="ts">
import { usePermission } from '#/common-methods';

const props = withDefaults(
  defineProps<{
    policy?: {
      method: 'DELETE' | 'GET' | 'PATCH' | 'POST' | 'PUT';
      path: string;
    };
    text?: string;
  }>(),
  {
    text: '',
    policy: undefined,
  },
);

const { permission } = usePermission(props.policy);
</script>

<template>
  <button class="d-btn" :disabled="!permission">
    {{ text }}
  </button>
</template>
