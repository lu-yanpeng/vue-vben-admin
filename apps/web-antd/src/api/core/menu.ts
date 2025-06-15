import type { RouteMenuItem } from '#/types/menu';

import { useUserStore } from '@vben/stores';

import { getRole } from '#/api/system/role';
import { mergeRoutesMate } from '#/common-methods';
import { getBasicRoute, getLocalRoute } from '#/router/local-routes';

/**
 * 获取用户所有菜单
 */
export async function getAllMenusApi(): Promise<RouteMenuItem[]> {
  const userStore = useUserStore();
  const userInfo = userStore?.userInfo;

  const localRoutes = getLocalRoute();
  const basicRoute = getBasicRoute();

  if (!userInfo) {
    return getBasicRoute();
  }

  // 返回角色对应路由
  if (userInfo.roleId !== null) {
    const { role } = await getRole(userInfo.roleId);
    if (role.routes !== null) {
      return mergeRoutesMate(localRoutes, role.routes);
    }
  }
  // 超级用户返回所有路由
  if (userInfo.isSuperuser) {
    return localRoutes;
  }
  // 没有角色就返回基础路由
  return basicRoute;
}
