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

export const addPolicy = async () => {
  return requestClient.post('/permission/policy', [
    {
      role: 'admin',
      path: '/permission/role',
      act: 'GET',
    },
  ]);
};
