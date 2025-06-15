import type { RouteMenuItem } from '#/types/menu';

import { requestClient } from '#/api/request';
import { getLocalRoute } from '#/router/local-routes';

// 这里设置整个系统的路由，不是设置某个角色的路由
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
