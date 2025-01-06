import type { UserInfo } from '@vben/types';

import { requestClient } from '#/api/request';

interface Me {
  create_time: string;
  update_time: string;
  username: string;
  email: null | string;
  id: string;
  is_active: boolean;
  profile: {
    create_time: string;
    id: number;
    real_name: string;
    update_time: string;
    user_id: string;
  };
  is_superuser: boolean;
  roles: string[];
  real_name: string;
}
/**
 * 获取用户信息
 */
export async function getUserInfoApi(): Promise<UserInfo> {
  const response = await requestClient.get<Me>('/user/me');
  return {
    realName: response.real_name,
    roles: response.roles,
    username: response.username,
    userId: response.id,
  } as UserInfo;
}
