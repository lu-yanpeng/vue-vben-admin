<script setup lang="tsx">
import type { RouteMenuItem } from '#/types/menu';

import { ref, watch, watchEffect } from 'vue';

import { useIsMobile } from '@vben/hooks';
import { IconifyIcon } from '@vben/icons';

import { iconLoaded } from '@iconify/vue';
import { message } from 'ant-design-vue';

import { useVbenForm, z } from '#/adapter/form';

const props = defineProps<{
  menu: null | RouteMenuItem;
}>();

const emits = defineEmits<{
  save: [
    RouteMenuItem,
    (value: boolean | null | PromiseLike<boolean | null>) => void,
  ];
}>();

const [msgApi, ContextHolder] = message.useMessage();
const [BaseForm, formApi] = useVbenForm({
  showDefaultActions: false,
  commonConfig: {
    componentProps: {
      class: 'md:w-1/2 w-full',
    },
  },
  layout: 'horizontal',
  schema: [
    {
      component: 'Input',
      componentProps: {
        placeholder: '菜单标题',
      },
      fieldName: 'title',
      label: '标题',
      rules: z.string().trim().min(1, { message: '必填项' }),
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: '图标',
      },
      fieldName: 'icon',
      label: '图标',
      renderComponentContent: () => {
        const icon = ref('');
        watch(
          () => props.menu,
          (menu) => {
            if (menu) {
              const _icon = menu.meta.icon as string;
              if (!_icon) {
                formApi.setFieldValue('icon', '');
              }
              icon.value = _icon;
            }
          },
        );
        return {
          prefix: () => {
            return (
              <>
                <IconifyIcon class={'h-5 w-5'} icon={icon.value} />
              </>
            );
          },
          suffix: () => {
            const setIcon = async () => {
              const { icon: _icon } = await formApi.getValues();
              const result = iconLoaded(_icon);
              icon.value = _icon;
              if (result) {
                msgApi?.success('图标可用');
              } else {
                msgApi?.error('图标不可用');
              }
            };
            return (
              <>
                <button class="d-btn d-btn-xs d-btn-accent" onClick={setIcon}>
                  测试图标
                </button>
              </>
            );
          },
        };
      },
      rules: z.string().trim().optional(),
    },
  ],
  wrapperClass: 'grid-cols-1',
});

const { isMobile } = useIsMobile();
watchEffect(() => {
  const layout = isMobile.value ? 'vertical' : 'horizontal';
  formApi.setState({ layout });
});

watchEffect(async () => {
  if (props.menu) {
    await formApi.setValues(props.menu.meta);
  }
});

const loading = ref(false);
// 判断obj中是否包含entries中的所有条目
function containsAllEntries(
  obj: Record<string, any>,
  entries: Record<string, any>,
): boolean {
  return Object.entries(entries).every(
    ([key, val]) => key in obj && obj[key] === val,
  );
}
const onSave = async () => {
  loading.value = true;
  try {
    const { valid, values } = await formApi.validate();
    if (!valid) {
      msgApi?.error('表单验证失败');
      return;
    }

    if (props.menu) {
      if (containsAllEntries(props.menu.meta, values as Record<string, any>)) {
        msgApi?.warning('表单未修改');
        return;
      }

      const menu: RouteMenuItem = {
        ...props.menu,
        meta: {
          ...props.menu?.meta,
          ...values,
        },
      };
      await new Promise((resolve) => {
        emits('save', menu, resolve);
      });
    }
  } finally {
    loading.value = false;
  }
};

const reset = async () => {
  if (props.menu) {
    await formApi.resetValidate();
    await formApi.setValues(props.menu.meta);
  }
};
</script>

<template>
  <a-spin :delay="300" :spinning="loading" size="large">
    <template #indicator>
      <span class="d-loading d-loading-spinner d-loading-lg"></span>
    </template>

    <div class="d-card bg-base-100 shadow-xl">
      <div class="d-card-body">
        <div v-show="menu">
          <ContextHolder />
          <div class="flex gap-2">
            <button
              class="d-btn d-btn-sm d-btn-outline d-btn-info"
              @click="onSave"
            >
              保存
            </button>
            <button
              class="d-btn d-btn-sm d-btn-outline d-btn-warning"
              @click="reset"
            >
              重置
            </button>
          </div>
          <div class="d-divider mb-1 mt-1"></div>

          <BaseForm />
        </div>

        <div v-show="!menu" class="d-alert shadow-lg" role="alert">
          <svg
            class="stroke-info h-6 w-6 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
            />
          </svg>
          <div>
            <h3 class="font-bold">编辑菜单</h3>
            <div class="text-xs">选中菜单后开始编辑。</div>
          </div>
        </div>
      </div>
    </div>
  </a-spin>
</template>
