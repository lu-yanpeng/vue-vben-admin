<script setup lang="ts">
import { usePreferences } from '@vben/preferences';

const { isDark } = usePreferences();
// html标签上的data-theme属性被占用了，切换黑暗模式的时候只能在这个组件下切换
// 如果不设置data-theme，默认只会使用light主题
</script>

<template>
  <div :data-theme="isDark ? 'dark' : 'light'">
    <slot></slot>
  </div>
</template>
