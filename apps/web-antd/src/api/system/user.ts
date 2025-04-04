import type { DefaultFilterParams } from '#/api/types';

import { stringify } from 'qs';

import { requestClient } from '#/api/request';

interface BaseUser {
  create_time: string;
  update_time: string;
  username: string;
  id: string;
  is_active: true;
  profile: {
    create_time: string;
    email: string;
    id: number;
    real_name: string;
    update_time: string;
    user_id: string;
  };
}
export interface AddUserData {
  user: {
    is_active: boolean;
    password: string;
    username: string;
  };
  profile?: {
    email?: string;
    real_name?: string;
  };
}
export const addUser = async (data: AddUserData): Promise<BaseUser> => {
  return requestClient.post('/user', data);
};

interface UpdateUserWithUser {
  user: {
    is_active?: boolean;
    password?: string;
    username?: string;
  };
  profile?: never;
}
interface UpdateUserWithProfile {
  user?: never;
  profile: {
    email?: string;
    real_name?: string;
  };
}
interface UpdateUserWithBoth {
  user: {
    is_active?: boolean;
    password?: string;
    username?: string;
  };
  profile: {
    email?: string;
    real_name?: string;
  };
}
// user和profile必须有一个被设置，不能都为空
export type UpdateUser =
  | UpdateUserWithBoth
  | UpdateUserWithProfile
  | UpdateUserWithUser;
export const updateUser = async (
  uid: string,
  data: UpdateUser,
): Promise<BaseUser> => {
  return requestClient.put(`/user/${uid}`, data);
};

export interface UserListData extends DefaultFilterParams {
  query?: {
    create_time?: [string, string | unknown[]];
    db_or_query_?: [string, boolean];
    id?: [string, unknown[]];
    is_active?: [string, boolean];
    update_time?: [string, string | unknown[]];
    username?: [string, string | unknown[]];
  }[];
}
export const getUserList = async (data?: UserListData) => {
  return requestClient.post('/user/filter', data);
};

interface User {
  create_time: string;
  update_time: string;
  username: string;
  id: string;
  is_active: boolean;
  profile: {
    create_time: string;
    email: string;
    id: number;
    real_name: string;
    update_time: string;
    user_id: string;
  };
}
export const getUser = async (uid: string): Promise<User> => {
  return requestClient.get(`/user/${uid}`);
};

export const delUser = async (idList: string[]): Promise<string[]> => {
  return requestClient.delete('/user', {
    params: {
      uid_list: idList,
    },
    paramsSerializer: (params) => stringify(params, { arrayFormat: 'repeat' }),
  });
};
