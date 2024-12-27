import type { UserInfo } from '@vben/types';

import { requestClient } from '#/api/request';

interface Me {
  create_time: string;
  update_time: string;
  username: string;
  email: string | null;
  id: string;
  is_active: boolean;
  profile: {
    create_time: string;
    update_time: string;
    id: number;
    user_id: string;
    real_name: string;
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
    userId: response.id
  } as UserInfo;
}
