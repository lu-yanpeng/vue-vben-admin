import { stringify } from 'qs';

import { requestClient } from '#/api/request';

interface RoleListData {
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
    is_default_role?: [string, boolean | unknown[]];
    name?: [string, string | unknown[]];
    update_time?: [string, boolean | unknown[]];
  }[];
  policies?: boolean;
}
interface RoleList {
  data: Omit<SingleRole, 'sys_routes'>[];
  meta: {
    total: 0;
  };
}
export const getRoleList = async (data?: RoleListData): Promise<RoleList> => {
  return requestClient.post('/role/filter', data);
};

export interface SingleRole {
  role: {
    create_time: string;
    desc: string;
    id: number;
    is_default_role: boolean;
    name: string;
    update_time: string;
  };
  policies: [string, string, string][];
  sys_routes?: {
    methods: string[];
    name: string;
    path: string;
  }[];
}

export const getRole = async (id: number): Promise<NonNullable<SingleRole>> => {
  return requestClient.get(`/role/${id}`, {
    params: {
      sys_routes: true,
    },
  });
};

export interface AddRoleData {
  role: {
    desc?: string;
    is_default_role?: boolean;
    name: string;
  };
  policies?: {
    act: string;
    path: string;
  }[];
}
export const addRole = async (
  data: AddRoleData,
): Promise<Pick<SingleRole, 'role'>> => {
  return requestClient.post('/role', data);
};

export interface UpdateRoleData {
  role?: {
    desc: string;
    is_default_role: boolean;
  };
  policies?: {
    act: string;
    path: string;
  }[];
}
export const updateRole = async (
  uid: number,
  data: UpdateRoleData,
): Promise<Omit<SingleRole, 'sys_routes'>> => {
  return requestClient.put(`/role/${uid}`, data);
};

export const getSysRoutes = async (): Promise<
  NonNullable<SingleRole['sys_routes']>
> => {
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
