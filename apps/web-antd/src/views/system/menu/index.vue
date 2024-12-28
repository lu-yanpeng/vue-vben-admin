<script setup lang="ts">
import { Page } from '@vben/common-ui';
import DaisyuiWrap from '#/components/daisyui-wrap.vue';
import LeftMenu from './left-menu.vue';
</script>

<template>
  <page
    title="菜单管理"
    description="设置左侧菜单，这里只设置菜单基础信息，不设置菜单权限。"
  >
    <daisyui-wrap
      class="grid grid-cols-1 gap-4 bg-transparent md:[grid-template-columns:3fr_7fr]"
    >
      <left-menu />

      <div class="d-card bg-base-100 shadow-xl">
        <div class="d-card-body">右侧</div>
      </div>
    </daisyui-wrap>
  </page>
</template>
