<script setup lang="ts">
import type { RouteMenuItem } from '#/types/menu';

import { ref, useTemplateRef, watch } from 'vue';
import { type DraggableEvent, useDraggable } from 'vue-draggable-plus';

import { cloneDeep } from '@vben/utils';

import { useCloned } from '@vueuse/core';

import DaisyuiWrap from '#/components/daisyui-wrap.vue';

import MenuItem from './menu-item.vue';

const props = withDefaults(
  defineProps<{
    // 打开拖拽排序
    dragSort?: boolean;
    // 菜单的数据
    menus: RouteMenuItem[];
    // 初始化的时候是否打开所有子菜单，只在初始化的时候有用，之后修改这个值不起效果
    open?: boolean;
  }>(),
  {
    menus: () => [],
    dragSort: false,
    open: false,
  },
);

const emits = defineEmits<{
  select: [menu: RouteMenuItem];
}>();

const { cloned: clonedMenus, sync } = useCloned<RouteMenuItem[]>(
  () => props.menus,
  {
    manual: true,
    clone: cloneDeep,
  },
);
watch(
  () => props.menus,
  () => sync(),
);
const ulRef = useTemplateRef('ulRef');
// 控制拖拽过渡效果
const drag = ref(false);
// @ts-ignore
useDraggable(ulRef, clonedMenus, {
  animation: 150,
  handle: 'svg._handle',
  ghostClass: 'ghost',
  onStart() {
    drag.value = true;
  },
  // 拖拽结束时不加动画
  onEnd: (e: DraggableEvent) => {
    setTimeout(() => {
      for (const item of e.to.children) {
        item.classList.add('item-active');
      }
      if (ulRef.value) {
        const liEls = ulRef.value.querySelectorAll('li');
        for (const li of liEls) {
          li.classList.add('item-hover');
        }
      }
      drag.value = false;
    }, 400);
  },
  onChoose: (e: DraggableEvent) => {
    // 选中的时候去掉hover样式，否则拖动的时候会在原地留下一个残影，非常影响体验
    if (ulRef.value) {
      // 子菜单下的li也要去除hover样式
      const liEls = ulRef.value.querySelectorAll('li');
      for (const li of liEls) {
        li.classList.remove('item-hover');
      }
    }
    for (const item of e.to.children) {
      item.classList.remove('item-active');
    }
  },
});

// 保存当前选中的div元素，方便高亮菜单
let _activeEl: HTMLElement | null = null;
const activeEl = {
  get: () => {
    return _activeEl;
  },
  set: (v: HTMLElement | null) => {
    _activeEl = v;
  },
};
// 保存已选择的菜单数据，这个数据会在提交select事件之后设置成null
let _selectedMenu: null | RouteMenuItem = null;
const selectedMenu = {
  get: () => {
    return _selectedMenu;
  },
  set: (v: RouteMenuItem) => {
    _selectedMenu = v;
  },
  has: () => {
    return Boolean(_selectedMenu);
  },
};

const openAllMenu = (open: boolean) => {
  if (ulRef.value) {
    // 展开所有子菜单
    const uls = ulRef.value.querySelectorAll('li ul.d-menu-dropdown');
    for (const ul of uls) {
      if (open) {
        ul.classList.add('d-menu-dropdown-show');
      } else {
        ul.classList.remove('d-menu-dropdown-show');
      }
    }

    // 父标题上展开按钮的显示状态，是向下还是向上
    const btns = ulRef.value.querySelectorAll(
      'li div[data-menu-title] button.d-swap',
    );
    for (const btn of btns) {
      if (open) {
        btn.classList.add('d-swap-active');
      } else {
        btn.classList.remove('d-swap-active');
      }
    }
  }
};
// 选中某个菜单时触发，如果是父标题，会包含children，如果是子标题就不包含children
const selectMenu = () => {
  if (_selectedMenu) {
    emits('select', cloneDeep(_selectedMenu as RouteMenuItem));
    _selectedMenu = null;
  }
};

defineExpose({
  // 重新排序菜单，同步成传入的值
  restore: sync,
  // 打开或关闭所有子菜单
  openSubmenu: openAllMenu,
  menuData: () => cloneDeep(clonedMenus.value),
});
</script>

<template>
  <DaisyuiWrap>
    <ul ref="ulRef" class="d-menu">
      <TransitionGroup :name="!drag ? 'fade' : undefined" type="transition">
        <MenuItem
          v-for="menu in clonedMenus"
          :key="menu.name"
          :active-el
          :drag-sort
          :menu
          :open
          :selected-menu
          @select="selectMenu"
        />
      </TransitionGroup>
    </ul>
  </DaisyuiWrap>
</template>

<style scoped>
.fade-move,
.fade-enter-active,
.fade-leave-active {
  transition: all 0.5s cubic-bezier(0.55, 0, 0.1, 1);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scaleY(0.01) translate(30px, 0);
}

.fade-leave-active {
  position: absolute;
}

/* 开始拖拽时菜单项的样式 */
.ghost {
  @apply bg-base-content/10 rounded-btn;
}
</style>
