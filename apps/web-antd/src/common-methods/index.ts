import type { MaybeRefOrGetter } from 'vue';

import type { RouteMenuItem } from '#/types/menu';

import { computed, toValue } from 'vue';

import { useUserStore } from '@vben/stores';

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

/*
 * 判断当前用户是否有某个接口的权限
 * const { permission } usePermission({path: '/role', method: 'GET' })
 * permission是true就是有权限
 * */
type Method = 'DELETE' | 'GET' | 'PATCH' | 'POST' | 'PUT';
export const usePermission = (
  policy: MaybeRefOrGetter<
    | undefined
    | {
        method: Method;
        path: string;
      }
  >,
) => {
  const userStore = useUserStore();
  const userInfo = userStore.userInfo;

  // 当前用户的权限，按请求方法分类，对应的值是一个set，判断set里面有没有对应的路径
  const userPolicy = computed(() => {
    const policyObj: Record<string, Set<string>> = {};

    if (userInfo?.policy) {
      (userInfo.policy as [string, string, Method][]).map(
        ([, path, method]) => {
          if (policyObj[method]) {
            policyObj[method].add(path);
          } else {
            policyObj[method] = new Set([path]);
          }
          return void 0;
        },
      );
    }

    return policyObj as Record<Method, Set<string>>;
  });

  const permission = computed<boolean>(() => {
    if (userInfo) {
      if (userInfo?.isSuperuser) {
        return true;
      }
      const currentPolicy = toValue(policy);

      if (currentPolicy && userPolicy.value) {
        const path = userPolicy.value[currentPolicy.method];
        if (path && path.has(currentPolicy.path)) {
          return true;
        }
      }
    }

    return false;
  });

  return { permission };
};
