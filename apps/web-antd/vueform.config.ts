import { defineConfig } from '@vueform/vueform';
import tailwind from '@vueform/vueform/dist/tailwind';
import zh from '@vueform/vueform/locales/zh_CN';

export default defineConfig({
  theme: tailwind,
  locales: { zh },
  locale: 'zh',
  // 开发的时候打开，在控制台可以看到哪个类对应哪个样式
  classHelpers: true,
  presets: {
    // 自定义一个样式预设，然后在form上用presets使用这个预设
    absErrorLabel: {
      addClasses: () => {
        // console.log(form$)
        return {
          ElementLayout: {
            innerWrapperAfter: 'relative',
          },
          ElementError: {
            container: 'absolute top-0.5',
            container_md: 'text-xs',
          },
          /* ElementLabel: {
            wrapper: `after:content-['*'] after:ml-0.5 after:text-red-500 after:text-base`
          }*/
          FormElements: {
            container_md: 'gap-y-7',
          },
        };
      },
      removeClasses: {
        ElementError: {
          container_md: ['mt-1', 'form-text-small'],
        },
        FormElements: {
          container_md: ['form-gap-y-gutter'],
        },
      },
    },
  },
  // 如果验证规则里面有required，就会在label上显示*号
  showRequired: ['label', 'placeholder', 'floating'],
});
