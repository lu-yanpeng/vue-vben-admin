import { stringify } from 'qs';

import { requestClient } from '#/api/request';

export const getRoleList = async () => {
  return requestClient.post('/role/filter');
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
