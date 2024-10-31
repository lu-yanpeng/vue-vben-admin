<script setup lang="ts">
const test = 123;
</script>

<template>
  <div>
    <vueform>
      <text-element :columns="6" label="名称" name="name" />
    </vueform>

    <a-button>测试 {{ test }}</a-button>
  </div>
</template>
