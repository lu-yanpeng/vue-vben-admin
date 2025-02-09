import type { RouteMenuItem } from '#/types/menu';

import { requestClient } from '#/api/request';
import { mergeRoutesMate } from '#/common-methods';
import { getLocalRoute } from '#/router/local-routes';

/**
 * 获取用户所有菜单
 */
export async function getAllMenusApi(): Promise<RouteMenuItem[]> {
  const data = await requestClient.get<RouteMenuItem[]>('/menu/');
  const localRoutes = getLocalRoute();
  if (data === null) {
    return localRoutes;
  }

  return mergeRoutesMate(localRoutes, data);
}
