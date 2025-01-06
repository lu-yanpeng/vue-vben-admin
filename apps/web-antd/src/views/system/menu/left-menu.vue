<script setup lang="ts">
import type { RouteMenuItem } from '#/types/menu';

import { computed, ref, useTemplateRef, watchEffect } from 'vue';

import { isEqual } from '@vben/utils';

import MenuComp from '#/components/menu/index.vue';

const props = withDefaults(
  defineProps<{
    menuData: RouteMenuItem[];
  }>(),
  {
    menuData: () => [],
  },
);
const emits = defineEmits<{
  select: [menu: RouteMenuItem];
  sort: [
    RouteMenuItem[],
    (value: boolean | null | PromiseLike<boolean | null>) => void,
  ];
}>();

const loading = ref(false);
const menus = ref<RouteMenuItem[]>([]);
watchEffect(() => (menus.value = props.menuData));

const openSubmenu = ref(false);
const menuCompRef = useTemplateRef('menuCompRef');
const unfold = () => {
  openSubmenu.value = !openSubmenu.value;
  if (menuCompRef.value) {
    menuCompRef.value.openSubmenu(openSubmenu.value);
  }
};
const text = computed(() => (openSubmenu.value ? '收起' : '展开'));

const reset = () => {
  if (menuCompRef.value) {
    menuCompRef.value.restore();
  }
};

const dragSort = ref(false);
const sort = () => {
  dragSort.value = !dragSort.value;
  if (!dragSort.value) {
    reset();
  }
};
const sortText = computed(() => (dragSort.value ? '关闭' : '排序'));
// 保存排序结果，修改每个菜单项order的值，发送到后端服务器
const saveSort = async () => {
  if (menuCompRef.value) {
    loading.value = true;
    try {
      const menuData = menuCompRef.value.menuData();
      if (isEqual(menuData, menus.value)) {
        return;
      }

      menuData.forEach((menu, index) => {
        menu.meta.order = (index + 1) * 10;
      });
      await new Promise((resolve) => {
        emits('sort', menuData, resolve);
      });
    } finally {
      dragSort.value = false;
      loading.value = false;
    }
  }
};

defineExpose({
  openMenu: (v: boolean) => (openSubmenu.value = v),
});
</script>

<template>
  <a-spin :delay="300" :spinning="loading" size="large">
    <template #indicator>
      <span class="d-loading d-loading-spinner d-loading-lg"></span>
    </template>

    <div class="d-card bg-base-100 shadow-xl">
      <div class="d-card-body">
        <div class="flex gap-2">
          <button
            class="d-btn d-btn-sm d-btn-outline d-btn-info"
            @click="unfold"
          >
            {{ text }}
          </button>
          <button class="d-btn d-btn-sm d-btn-outline d-btn-info" @click="sort">
            {{ sortText }}
          </button>
          <button
            v-show="dragSort"
            class="d-btn d-btn-sm d-btn-outline d-btn-info"
            @click="saveSort"
          >
            保存
          </button>
          <button
            v-show="dragSort"
            class="d-btn d-btn-sm d-btn-outline d-btn-warning"
            @click="reset"
          >
            重置
          </button>
        </div>
        <div class="d-divider mb-1 mt-1"></div>
        <MenuComp
          ref="menuCompRef"
          :drag-sort
          :menus
          class=""
          @select="(menu) => $emit('select', menu)"
        />
      </div>
    </div>
  </a-spin>
</template>
