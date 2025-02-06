import type { RouteRecordStringComponent } from '@vben/types';

import { requestClient } from '#/api/request';
import { getLocalRoute } from '#/router/local-routes';

/**
 * 获取用户所有菜单
 */
export async function getAllMenusApi() {
  const data = await requestClient.get<RouteRecordStringComponent[]>('/menu/');
  if (data === null) {
    return getLocalRoute();
  }
  return data;
}
