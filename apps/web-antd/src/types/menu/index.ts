import type { RouteMeta } from '@vben/types';
import type { RouteRecordRaw } from 'vue-router';

export type RouteMenuItem = {
  children?: RouteMenuItem[];
  component: string;
  meta: RouteMeta;
} & Omit<RouteRecordRaw, 'children' | 'component' | 'meta'>;
