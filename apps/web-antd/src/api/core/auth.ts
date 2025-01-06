import { useAccessStore } from '@vben/stores';

import { requestClient } from '#/api/request';

export namespace AuthApi {
  /** 登录接口参数 */
  export interface LoginParams {
    password?: string;
    username?: string;
  }

  /** 登录接口返回值 */
  export interface LoginResult {
    accessToken: string;
    refreshToken: string;
  }

  export interface RefreshTokenResult {
    data: string;
    status: number;
  }
}

/**
 * 登录
 */
export async function loginApi(
  data: AuthApi.LoginParams,
): Promise<AuthApi.LoginResult> {
  const response = await requestClient.post<{
    access_token: string;
    refresh_token: string;
  }>('/auth/login', data, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  return {
    accessToken: response.access_token,
    refreshToken: response.refresh_token,
  };
}

/**
 * 刷新accessToken
 */
export async function refreshTokenApi(): Promise<AuthApi.RefreshTokenResult> {
  const accessStore = useAccessStore();
  const { access_token } = await requestClient.post<{
    access_token: string;
  }>(
    '/auth/refresh_token',
    {
      refresh_token: accessStore.refreshToken,
    },
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );

  return { data: access_token, status: 200 };
}

/**
 * 退出登录
 */
export async function logoutApi() {
  return requestClient.get('/auth/logout');
}

/**
 * 获取用户权限码
 */
export async function getAccessCodesApi() {
  return [];
}
