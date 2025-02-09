import type { RouteMenuItem } from '#/types/menu';

// 合并本地和服务器的路由数据，只合并meta，以服务器的meta数据为准
export const mergeRoutesMate = (
  local: RouteMenuItem[],
  server: RouteMenuItem[],
): RouteMenuItem[] => {
  return local.map((localItem) => {
    const serverItem = server.find(
      (serverItem) => serverItem.name === localItem.name,
    );
    return serverItem
      ? {
          ...localItem,
          meta: { ...localItem.meta, ...serverItem.meta },
          children:
            localItem.children && serverItem.children
              ? mergeRoutesMate(localItem.children, serverItem.children)
              : (localItem?.children ?? serverItem?.children),
        }
      : localItem;
  });
};
