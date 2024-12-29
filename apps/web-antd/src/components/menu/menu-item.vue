<script setup lang="ts">
import type { RouteMenuItem } from '#/types/menu';

import { computed, onMounted, useTemplateRef } from 'vue';
import { IconifyIcon } from '@vben/icons';

defineOptions({ name: 'MenuItem' });

const props = withDefaults(
  defineProps<{
    // 当前高亮的html元素，因为同一时间只能有一个菜单高亮，所以需要保存已经高亮的元素
    activeEl: {
      get: () => HTMLElement | null;
      set: (v: HTMLElement | null) => void;
    };
    // 拖拽排序
    dragSort: boolean;
    // 是否子菜单，用来控制递归菜单时，父标题的类样式
    isSubmenu?: boolean;
    menu: RouteMenuItem;
    // 初始化时控制子菜单的打开
    open: boolean;
    selectedMenu: {
      get: () => null | RouteMenuItem;
      has: () => boolean;
      set: (v: RouteMenuItem) => void;
    };
  }>(),
  {
    isSubmenu: false,
  },
);

const emits = defineEmits<{
  select: [menu?: RouteMenuItem];
}>();

const swapBtnRef = useTemplateRef('swapBtnRef');
const submenuUlRef = useTemplateRef('submenuUlRef');

const selectMenu = () => {
  // 递归组件会多次触发这个事件，如果这个事件触发了3次，父组件实际监听到的会是最后一次事件，也就是拿到第三次事件的值，这样会导致菜单数据错误
  // 递归组件从底层依次触发select，每个组件内部都调用selectMenu方法再次触发select，最后父组件监听到的就是最后一次selectMenu触发的事件
  // 保存第一次事件的menu值，如果menu已经存在，之后的事件都传递这个值，父组件拿到menu值之后再把menu设置成null
  const currentMenu = props.selectedMenu.get();
  if (currentMenu === null) {
    props.selectedMenu.set(props.menu);
  }
  emits('select', currentMenu as RouteMenuItem);
};
// 展开子菜单
const unfold = (e: MouseEvent) => {
  // 阻止冒泡，避免点击展开按钮的时候高亮当前菜单，只有点击菜单的时候才能高亮
  e.stopPropagation();

  // 设置展开按钮的箭头状态
  if (swapBtnRef.value) {
    swapBtnRef.value.classList.toggle('d-swap-active');
  }

  // 设置子菜单的展开和收起，show会展开子菜单，去掉就收起
  if (submenuUlRef.value) {
    submenuUlRef.value.classList.toggle('d-menu-dropdown-show');
  }
};
// 高亮当前菜单
const active = (e: MouseEvent) => {
  e.stopPropagation();
  selectMenu();

  const el = e.target as HTMLElement;
  if (el) {
    const li = el.closest('li');
    if (li) {
      // 获取已经高亮的html元素
      const activeEl = props.activeEl.get();
      if (activeEl) {
        const btn = activeEl.querySelector('button');
        if (btn) {
          btn.classList.toggle('d-btn-ghost');
          btn.classList.toggle('d-btn-active');
        }
        activeEl.classList.remove('d-active');
      }

      // 获取最新高亮的元素
      const titleDiv = li.querySelector('div[data-menu-title]');
      if (titleDiv) {
        const btn = titleDiv.querySelector('button');
        // 设置展开按钮的箭头激活
        if (btn) {
          btn.classList.toggle('d-btn-ghost');
          btn.classList.toggle('d-btn-active');
        }
        // 设置当前菜单项高亮
        titleDiv.classList.toggle('d-active');
        props.activeEl.set(titleDiv as HTMLElement);
      }
    }
  }
};

onMounted(() => {
  // 初始化的时候是否展开所有菜单
  if (submenuUlRef.value) {
    if (props.open) {
      submenuUlRef.value.classList.add('d-menu-dropdown-show');
    } else {
      submenuUlRef.value.classList.remove('d-menu-dropdown-show');
    }
  }
});

// 父标题的样式，控制拖拽句柄显示时候的样式
const menuTitleStyle = computed(() => {
  // 为什么这样绑定样式
  // 因为绑定class之后，一旦class更新，通过el.classList.toggle()动态添加的所有类都会消失
  // d-active类必须动态添加，所以只能把这个样式绑定到style上
  if (!props.isSubmenu && props.dragSort) {
    return {
      'grid-template-columns': 'auto 1fr auto',
    };
  }
  return {
    'grid-template-columns': '1fr auto',
  };
});
</script>

<template>
  <li v-if="menu?.children" class="item-active item-hover" @click="active">
    <!-- 如果有子菜单，li下的元素就必须用 div+ul的格式，如果不这样会导致css选择器选不到元素添加不了样式 -->
    <!-- 父标题的文字内容区域，包含句柄抓手、文字、下拉按钮 -->
    <div :style="menuTitleStyle" class="grid pb-0.5 pt-0.5" data-menu-title>
      <svg
        v-if="!isSubmenu && dragSort"
        class="_handle size-5 cursor-move"
        fill="currentColor"
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          clip-rule="evenodd"
          d="M6 4.75A.75.75 0 0 1 6.75 4h10.5a.75.75 0 0 1 0 1.5H6.75A.75.75 0 0 1 6 4.75ZM6 10a.75.75 0 0 1 .75-.75h10.5a.75.75 0 0 1 0 1.5H6.75A.75.75 0 0 1 6 10Zm0 5.25a.75.75 0 0 1 .75-.75h10.5a.75.75 0 0 1 0 1.5H6.75a.75.75 0 0 1-.75-.75ZM1.99 4.75a1 1 0 0 1 1-1H3a1 1 0 0 1 1 1v.01a1 1 0 0 1-1 1h-.01a1 1 0 0 1-1-1v-.01ZM1.99 15.25a1 1 0 0 1 1-1H3a1 1 0 0 1 1 1v.01a1 1 0 0 1-1 1h-.01a1 1 0 0 1-1-1v-.01ZM1.99 10a1 1 0 0 1 1-1H3a1 1 0 0 1 1 1v.01a1 1 0 0 1-1 1h-.01a1 1 0 0 1-1-1V10Z"
          fill-rule="evenodd"
        />
      </svg>
      <div class="flex items-center gap-2">
        <iconify-icon :icon="menu?.meta?.icon" class="h-5 w-5" />
        <span>{{ menu.meta.title }}</span>
      </div>
      <button
        ref="swapBtnRef"
        class="d-btn d-btn-outline d-btn-square d-btn-sm d-swap h-5"
        @click="unfold"
      >
        <!-- 向下箭头 -->
        <svg
          class="d-swap-on size-5"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            clip-rule="evenodd"
            d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
            fill-rule="evenodd"
          />
        </svg>
        <!-- 向上箭头 -->
        <svg
          class="d-swap-off size-5"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            clip-rule="evenodd"
            d="M9.47 6.47a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 1 1-1.06 1.06L10 8.06l-3.72 3.72a.75.75 0 0 1-1.06-1.06l4.25-4.25Z"
            fill-rule="evenodd"
          />
        </svg>
      </button>
    </div>

    <!-- ul加上这个类可以展开菜单 d-menu-dropdown-show -->
    <!-- :class="{ 'd-menu-dropdown-show': menuOpen }"-->
    <ul ref="submenuUlRef" class="d-menu-dropdown">
      <!-- 递归渲染子菜单 -->
      <menu-item
        v-for="childMenu in menu.children"
        :key="childMenu.name"
        v-bind="props"
        :menu="childMenu"
        :open
        is-submenu
        @select="selectMenu"
      />
    </ul>
  </li>

  <li v-else class="item-active item-hover" @click="active">
    <div class="grid [grid-template-columns:auto_1fr]" data-menu-title>
      <svg
        v-if="!isSubmenu && dragSort"
        class="_handle size-5 cursor-move"
        fill="currentColor"
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          clip-rule="evenodd"
          d="M6 4.75A.75.75 0 0 1 6.75 4h10.5a.75.75 0 0 1 0 1.5H6.75A.75.75 0 0 1 6 4.75ZM6 10a.75.75 0 0 1 .75-.75h10.5a.75.75 0 0 1 0 1.5H6.75A.75.75 0 0 1 6 10Zm0 5.25a.75.75 0 0 1 .75-.75h10.5a.75.75 0 0 1 0 1.5H6.75a.75.75 0 0 1-.75-.75ZM1.99 4.75a1 1 0 0 1 1-1H3a1 1 0 0 1 1 1v.01a1 1 0 0 1-1 1h-.01a1 1 0 0 1-1-1v-.01ZM1.99 15.25a1 1 0 0 1 1-1H3a1 1 0 0 1 1 1v.01a1 1 0 0 1-1 1h-.01a1 1 0 0 1-1-1v-.01ZM1.99 10a1 1 0 0 1 1-1H3a1 1 0 0 1 1 1v.01a1 1 0 0 1-1 1h-.01a1 1 0 0 1-1-1V10Z"
          fill-rule="evenodd"
        />
      </svg>

      <div class="flex items-center gap-2">
        <iconify-icon :icon="menu?.meta?.icon" class="h-5 w-5" />
        <span>{{ menu.meta.title }}</span>
      </div>
    </div>
  </li>
</template>

<style scoped>
@media (hover: hover) {
  @supports (color: oklch(0% 0 0)) {
    :where(.d-menu li.item-hover > *:not(ul)):hover {
      @apply bg-base-content/10 !important;
    }

    :where(
        .d-menu
          li:not(.d-menu-title, .d-disabled)
          > *:not(ul, details, .d-menu-title)
      ):not(.d-active, .d-btn):hover,
    :where(
        .d-menu
          li:not(.d-menu-title, .d-disabled)
          > details
          > summary:not(.d-menu-title)
      ):not(.d-active, .d-btn):hover {
      @apply bg-inherit;
    }
  }
}

.d-menu li.item-active > *:not(ul):active,
.d-menu li > *:not(ul, .d-menu-title, .d-btn).d-active {
  @apply bg-neutral text-neutral-content !important;
}

.d-menu li > *:not(ul, .d-menu-title, details, .d-btn):active,
.d-menu li > *:not(ul, .d-menu-title, details, .d-btn).d-active,
.d-menu li > details > summary:active {
  @apply bg-inherit text-inherit;
}

/* 通过给li添加item-active类名来控制active的样式 */
</style>
