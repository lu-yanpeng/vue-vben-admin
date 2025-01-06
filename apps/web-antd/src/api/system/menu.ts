import type { RouteMenuItem } from '#/types/menu';

import { requestClient } from '#/api/request';
// import { getAllMenusApi } from '#/api/core/menu'

// export const getMenu = getAllMenusApi
// getMenu应该是获取系统的所有菜单，getAllMenusApi获取当前用户的菜单
export { getAllMenusApi as getMenu } from '#/api/core/menu';

export const setMenu = async (route: RouteMenuItem[]) => {
  return requestClient.post('/menu/', {
    route: JSON.stringify(route),
  });
};
