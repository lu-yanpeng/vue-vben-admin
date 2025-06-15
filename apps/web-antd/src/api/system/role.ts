import type { RouteMenuItem } from '#/types/menu';

import { stringify } from 'qs';

import { requestClient } from '#/api/request';

export interface RoleRead {
  create_time: string;
  desc: string;
  id: number;
  name: string;
  update_time: string;
  routes: null | RouteMenuItem[];
}
export type RolePolicy = [string, string, string];
export interface SysRouteItem {
  methods: string[];
  name: string;
  path: string;
}
export interface SingleRole {
  role: RoleRead;
  policies: RolePolicy[];
  sys_routes?: SysRouteItem[];
}

export interface RoleListData {
  skip?: number;
  limit?: number;
  fields?: string[];
  order_by?: [string, 'asc' | 'desc'][];
  query?: {
    create_time?: [string, string | unknown[]];
    // 是否使用or查询
    db_or_query_?: [string, boolean];
    desc?: [string, string | unknown[]];
    id?: [string, number | string | unknown[]];
    name?: [string, string | unknown[]];
    update_time?: [string, string | unknown[]];
  }[];
  policies?: boolean;
}
export interface RoleList {
  data: Omit<SingleRole, 'sys_routes'>[];
  meta: {
    total: number;
  };
}
export const getRoleList = async (data?: RoleListData): Promise<RoleList> => {
  return requestClient.post('/role/filter', data);
};

export const getRole = async (id: number): Promise<NonNullable<SingleRole>> => {
  return requestClient.get(`/role/${id}`, {
    params: {
      sys_routes: true,
    },
  });
};

export interface RoleCreate {
  desc?: string;
  name: string;
  routes?: null | string;
}
export type RolePolicyCreate = {
  act: string;
  path: string;
};
export interface AddRoleData {
  role: RoleCreate;
  policies?: RolePolicyCreate[];
}
export type AddRoleFn = (data: AddRoleData) => Promise<RoleRead>;
export const addRole: AddRoleFn = async (
  data: AddRoleData,
): Promise<RoleRead> => {
  return requestClient.post('/role', data);
};

export interface RoleUpdate {
  desc: string;
  routes?: null | string;
}
export interface UpdateRoleData {
  role?: RoleUpdate;
  policies?: RolePolicyCreate[];
}
export type UpdateRoleFn = (
  uid: number,
  data: UpdateRoleData,
) => Promise<Omit<SingleRole, 'sys_routes'>>;
export const updateRole: UpdateRoleFn = async (
  uid: number,
  data: UpdateRoleData,
): Promise<Omit<SingleRole, 'sys_routes'>> => {
  return requestClient.put(`/role/${uid}`, data);
};

export const getSysRoutes = async (): Promise<SysRouteItem[]> => {
  return requestClient.get('/role/routes');
};

export const delRole = async (idList: number[]): Promise<number[]> => {
  return requestClient.delete('/role', {
    params: {
      uid_list: idList,
    },
    paramsSerializer: (params) => stringify(params, { arrayFormat: 'repeat' }),
  });
};
