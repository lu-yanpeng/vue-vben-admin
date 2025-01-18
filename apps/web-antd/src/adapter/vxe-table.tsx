import { h, shallowReadonly } from 'vue';

import { setupVbenVxeTable, useVbenVxeGrid } from '@vben/plugins/vxe-table';

import { Button, Image } from 'ant-design-vue';

import DaisyuiWrap from '#/components/daisyui-wrap.vue';

import { useVbenForm } from './form';

setupVbenVxeTable({
  configVxeTable: (vxeUI) => {
    vxeUI.setConfig({
      grid: {
        align: 'center',
        border: false,
        columnConfig: {
          resizable: true,
        },
        minHeight: 180,
        formConfig: {
          // 全局禁用vxe-table的表单配置，使用formOptions
          enabled: false,
        },
        proxyConfig: {
          autoLoad: true,
          response: {
            result: 'items',
            total: 'total',
            list: 'items',
          },
          showActiveMsg: true,
          showResponseMsg: false,
        },
        round: true,
        showOverflow: true,
        size: 'small',
      },
    });

    // 表格配置项可以用 cellRender: { name: 'CellImage' },
    vxeUI.renderer.add('CellImage', {
      renderTableDefault(_renderOpts, params) {
        const { column, row } = params;
        return h(Image, { src: row[column.field] });
      },
    });

    // 表格配置项可以用 cellRender: { name: 'CellLink' },
    vxeUI.renderer.add('CellLink', {
      renderTableDefault(renderOpts) {
        const { props } = renderOpts;
        return h(
          Button,
          { size: 'small', type: 'link' },
          { default: () => props?.text },
        );
      },
    });

    // 自定义复选框，配置columns.cellRender就可以使用这个组件
    // columns: [ { cellRender: { name: 'checkbox' }} ]
    vxeUI.renderer.add('checkbox', {
      renderTableDefault({ props }, params) {
        // 定义columns的时候可以传递props，disabled是否禁用复选框
        const { disabled = true } = props ?? {
          disabled: true,
        };
        const { row, column } = params;
        const { field } = column;
        const checked = Boolean(row[field]);
        return (
          <>
            <div class="flex justify-center">
              <input
                checked={checked}
                class="d-checkbox d-checkbox-sm d-checkbox-info"
                disabled={disabled}
                type="checkbox"
              />
            </div>
          </>
        );
      },
    });

    // 把这个单元格变成可以点击的链接，会触发click事件
    vxeUI.renderer.add('link', {
      renderTableDefault({ events }, params) {
        const { row, column } = params;
        const { field } = column;
        const text = row[field];

        /*
        * 在columns里面配置cellRender.events。这里就会调用events里面的事件
        *
        cellRender: {
          events: {
            click: (rowData, event) => {},
          },
        },
        * */
        const onClick = (e: Event) => {
          if (events) {
            // @ts-ignore: 编辑器没有正确识别events的类型，这里的click是columns.cellRender.events的函数
            events?.click?.(shallowReadonly(row), e);
          }
        };
        return (
          <>
            <DaisyuiWrap class="bg-transparent">
              <button class="d-btn d-btn-link d-btn-xs" onClick={onClick}>
                {text}
              </button>
            </DaisyuiWrap>
          </>
        );
      },
    });
  },
  useVbenForm,
});

export { useVbenVxeGrid };

export type * from '@vben/plugins/vxe-table';
