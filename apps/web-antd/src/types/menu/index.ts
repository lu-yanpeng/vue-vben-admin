import type { RouteRecordRaw } from 'vue-router';

import type { RouteMeta } from '@vben/types';

export type RouteMenuItem = Omit<
  RouteRecordRaw,
  'children' | 'component' | 'meta'
> & {
  children?: RouteMenuItem[];
  component?: string;
  meta: RouteMeta;
};
