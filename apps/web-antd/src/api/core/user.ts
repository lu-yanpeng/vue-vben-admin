import type { UserInfo as _UserInfo } from '@vben/types';

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
  role_id: number;
  policy: [string, string, string][];
}

interface UserInfo extends _UserInfo {
  roleId: null | number;
  isSuperuser: boolean | null;
  policy: [string, string, string][];
}
/**
 * 获取用户信息
 */
export async function getUserInfoApi(): Promise<UserInfo> {
  const response = await requestClient.get<Me>('/user/me');
  return {
    realName: response.profile.real_name,
    roles: response.roles,
    username: response.username,
    userId: response.id,
    roleId: response.role_id,
    isSuperuser: response.is_superuser,
    policy: response.policy,
  } as UserInfo;
}
