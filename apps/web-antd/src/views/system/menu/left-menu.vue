<script setup lang="ts">
import { computed, ref, useTemplateRef } from 'vue';
import MenuComp from '#/components/menu/index.vue';
import { getLocalRoute } from '#/router/local-routes';

const menus = getLocalRoute();

const openSubmenu = ref(false);
const menuCompRef = useTemplateRef('menuCompRef');
const unfold = () => {
  openSubmenu.value = !openSubmenu.value;
  if (menuCompRef.value) {
    menuCompRef.value.openSubmenu(openSubmenu.value);
  }
};
const text = computed(() => (openSubmenu.value ? '收起' : '展开'));

const dragSort = ref(false);
const sort = () => {
  dragSort.value = !dragSort.value;
};
</script>

<template>
  <div class="d-card bg-base-100 shadow-xl">
    <div class="d-card-body">
      <div class="flex gap-2">
        <button class="d-btn d-btn-sm d-btn-outline d-btn-info" @click="unfold">
          {{ text }}
        </button>
        <button class="d-btn d-btn-sm d-btn-outline d-btn-info" @click="sort">
          排序
        </button>
      </div>
      <div class="d-divider mb-1 mt-1"></div>
      <menu-comp class="" ref="menuCompRef" :menus :dragSort />
    </div>
  </div>
</template>
