import type { RouteMenuItem } from '#/types/menu';

// 合并本地和服务器的路由数据，只合并meta，以服务器的meta数据为准
export const mergeRoutesMate = (
  local: RouteMenuItem[],
  server: RouteMenuItem[],
): RouteMenuItem[] => {
  return server.map((serverItem) => {
    const localItem = local.find(
      (localItem) => localItem.name === serverItem.name,
    );

    return localItem
      ? {
          ...serverItem,
          meta: { ...serverItem.meta, ...localItem.meta },
          children:
            serverItem.children && localItem.children
              ? mergeRoutesMate(localItem.children, serverItem.children)
              : (serverItem.children ?? localItem.children),
        }
      : serverItem;
  });
};
