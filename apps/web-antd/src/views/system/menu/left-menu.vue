<script setup lang="ts">
import { computed, ref, useTemplateRef, onMounted } from 'vue';
import MenuComp from '#/components/menu/index.vue';
import { getLocalRoute } from '#/router/local-routes';
import { getMenu, setMenu } from '#/api/system/menu';
import type { RouteMenuItem } from '#/types/menu';
import { isEqual } from '@vben/utils';

const loading = ref(false);
const menus = ref<RouteMenuItem[]>([]);
// 合并本地和服务器的菜单数据，只合并meta，以服务器的meta数据为准
const __merge = (
  local: RouteMenuItem[],
  server: RouteMenuItem[],
): RouteMenuItem[] => {
  return local.map((localItem) => {
    const serverItem = server.find(
      (serverItem) => serverItem.name === localItem.name,
    );
    if (serverItem) {
      return {
        ...localItem,
        meta: { ...localItem.meta, ...serverItem.meta },
        children:
          localItem.children && serverItem.children
            ? __merge(localItem.children, serverItem.children)
            : (localItem?.children ?? serverItem?.children),
      };
    } else {
      return localItem;
    }
  });
};
// 从服务器获取菜单数据，和本地菜单进行合并
const mergeMenu = async () => {
  menus.value = [];
  const serverMenu = (await getMenu()) as RouteMenuItem[];
  const localMenu = getLocalRoute();
  menus.value = __merge(localMenu, serverMenu);
  // 合并后进行排序
  menus.value.sort((a, b) => {
    const a1 = a?.meta?.order ?? 0;
    const b1 = b?.meta?.order ?? 0;
    return a1 - b1;
  });
};

onMounted(async () => {
  await mergeMenu();
});

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
      await setMenu(menuData);
      await mergeMenu();
    } finally {
      dragSort.value = false;
      loading.value = false;
    }
  }
};
const reset = () => {
  if (menuCompRef.value) {
    menuCompRef.value.restore();
  }
};
</script>

<template>
  <a-spin size="large" :spinning="loading" :delay="300">
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
            class="d-btn d-btn-sm d-btn-outline d-btn-info"
            @click="reset"
          >
            重置
          </button>
        </div>
        <div class="d-divider mb-1 mt-1"></div>
        <menu-comp class="" ref="menuCompRef" :menus :dragSort />
      </div>
    </div>
  </a-spin>
</template>
