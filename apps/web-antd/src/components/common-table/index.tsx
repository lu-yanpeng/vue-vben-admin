import type { MainProps } from './types';

import { defineComponent } from 'vue';

import CommonTable from './index.vue';

export const useCommonTable = (options: MainProps) => {
  const Table = defineComponent(() => {
    return () => (
      <>
        <CommonTable {...options} />
      </>
    );
  });

  return [Table];
};

export * as tools from './tools';
