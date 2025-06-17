<!--
这个组件用在adapter/vxe-table.ts里面，vxe-table使用自定义的link列的时候，会渲染这个组件
如果当前登录的用户没有GET权限，比如get->/role/{uid}，没有这个权限的时候会渲染一个禁用的按钮
如果有权限会渲染一个可以点击的按钮
-->
<script setup lang="ts">
import type { Ref } from 'vue';

import type { Policies } from '#/components/common-table/types';

import { computed, inject } from 'vue';

import { policiesKey } from '#/components/common-table/symbol-keys';
import DaisyuiWrap from '#/components/daisyui-wrap.vue';
import PolicyButton from '#/components/policy-button.vue';

defineProps<{
  onClick: (e: Event) => void;
  text: string;
}>();

const userPolicies = inject<Ref<Policies>>(policiesKey);

// 当前GET方法对应的路径
const policy = computed<
  | undefined
  | {
      method: 'GET';
      path: string;
    }
>(() => {
  if (userPolicies?.value && 'GET' in userPolicies.value) {
    return {
      path: userPolicies.value.GET as string,
      method: 'GET',
    };
  }
  return undefined;
});
</script>

<template>
  <DaisyuiWrap class="bg-transparent">
    <PolicyButton
      v-if="userPolicies"
      class="d-btn-link d-btn-xs"
      :text
      @click="onClick"
      :policy
    />
    <button v-else class="d-btn d-btn-link d-btn-xs" @click="onClick">
      {{ text }}
    </button>
  </DaisyuiWrap>
</template>
