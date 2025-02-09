import type { RouteMenuItem } from '#/types/menu';

import { requestClient } from '#/api/request';
import { getLocalRoute } from '#/router/local-routes';
// import { getAllMenusApi } from '#/api/core/menu'

// export const getMenu = getAllMenusApi
// getMenu应该是获取系统的所有菜单，getAllMenusApi获取当前用户的菜单
// export { getAllMenusApi as getMenu } from '#/api/core/menu';

export const setMenu = async (route: RouteMenuItem[]) => {
  return requestClient.post('/menu/', {
    route: JSON.stringify(route),
  });
};

// 获取已经配置好的前端路由，如果是第一次登录系统，就用本地路由
export const getServerRoutes = async () => {
  const data = await requestClient.get<RouteMenuItem[]>('/menu/');
  if (data === null) {
    return getLocalRoute();
  }
  return data;
};
