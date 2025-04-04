<script setup lang="tsx">
import type { AddUserData, UpdateUser } from '#/api/system/user';

import { Page, z } from '@vben/common-ui';
import { isEqual } from '@vben/utils';

import {
  addUser,
  delUser,
  getUser,
  getUserList,
  updateUser,
} from '#/api/system/user';
import { tools, useCommonTable } from '#/components/common-table';

const [MyTable] = useCommonTable({
  gridProps: {
    formOptions: {
      schema: [
        // 暂时不支持按关系字段查询
        {
          fieldName: 'username',
          label: '账号',
          component: 'Input',
        },
        {
          fieldName: 'is_active',
          label: '状态',
          component: 'RadioGroup',
          defaultValue: undefined,
          componentProps: {
            options: [
              {
                label: '已激活',
                value: true,
              },
              {
                label: '未激活',
                value: false,
              },
              {
                label: '不指定',
                value: undefined,
              },
            ],
            optionType: 'button',
            size: 'small',
          },
        },
      ],
    },
    gridOptions: {
      columns: [
        { field: 'real_name', title: '姓名' },
        { field: 'username', title: '账号' },
        {
          field: 'is_active',
          title: '激活',
          cellRender: { name: 'checkbox' },
        },
        { field: 'email', title: '邮箱' },
      ],
      proxyConfig: {
        ajax: {
          query: async (
            { page }: tools.queryParams,
            formValues: Record<string, any>,
          ) => {
            const query = tools.getQuerySet(formValues);
            const { currentPage, pageSize } = page;
            return await getUserList({
              skip: currentPage * pageSize - pageSize,
              limit: pageSize,
              rel_fields: [
                ['profile', ['id', 'user_id', 'real_name', 'email']],
              ],
              query,
            });
          },
        },
        response: {
          result: ({
            data,
          }: tools.ResponseData<
            {
              create_time: string;
              id: string;
              is_active: boolean;
              profile: {
                email: null | string;
                id: number;
                real_name: null | string;
                user_id: string;
              };
              update_time: string;
              username: string;
            }[]
          >) => {
            return data.data.map((item) => {
              const result: Record<string, any> = {
                ...item,
              };
              result.real_name = item.profile.real_name;
              result.email = item.profile.email;
              result.profile = undefined;

              return result as {
                create_time: string;
                email: null | string;
                id: string;
                is_active: boolean;
                real_name: null | string;
                update_time: string;
                username: string;
              };
            });
          },
        },
      },
    },
  },
  formProps: {
    getSchema: (status, formOption) => {
      const checkUsername = async (v: string) => {
        const { api } = formOption;
        // 字段失去焦点，且当前字段值不为空时才校验数据
        const blurState = api.getFocusedField();
        if (v !== '' && (blurState === undefined || blurState !== 'username')) {
          api.updateSchema([
            {
              fieldName: 'username',
              componentProps: {
                disabled: true,
              },
            },
          ]);
          try {
            const response = await getUserList({
              query: [
                {
                  username: ['==', v],
                },
              ],
            });
            return response?.meta?.total === 0;
          } finally {
            api.updateSchema([
              {
                fieldName: 'username',
                componentProps: {
                  disabled: false,
                },
              },
            ]);
          }
        }
        return true;
      };

      switch (status) {
        case 'add': {
          return {
            schema: [
              {
                fieldName: 'username',
                component: 'Input',
                componentProps: {
                  placeholder: '用户名',
                },
                label: '用户名',
                formFieldProps: {
                  validateOnMount: false,
                  validateOnModelUpdate: false,
                },
                rules: z
                  .string()
                  .trim()
                  .min(3, '最少3个字符')
                  .max(30, '最大长度30')
                  .regex(/^[\w\-@.+]{3,30}$/, '只能输入字母和@+-_.')
                  .refine(async (v: string) => await checkUsername(v), {
                    message: '用户名已存在',
                  }),
              },
              {
                fieldName: 'password',
                component: 'InputPassword',
                componentProps: {
                  placeholder: '密码',
                },
                label: '密码',
                rules: z
                  .string()
                  .trim()
                  .min(6, '最少6个字符')
                  .max(50, '最大长度50')
                  .regex(/^[\w\-@.+]{6,50}$/, '只能输入字母和@+-_.'),
              },
              {
                fieldName: 'is_active',
                component: 'Switch',
                label: '激活',
                defaultValue: true,
              },
              {
                fieldName: 'real_name',
                component: 'Input',
                componentProps: {
                  placeholder: '姓名',
                },
                label: '姓名',
                rules: z.string().trim().optional(),
              },
              {
                fieldName: 'email',
                component: 'Input',
                componentProps: {
                  placeholder: '邮箱',
                },
                label: '邮箱',
                rules: z
                  .string()
                  .email({ message: '请输入正确邮箱' })
                  .or(z.literal(''))
                  .optional(),
              },
            ],
          };
        }
        case 'update': {
          return {
            schema: [
              {
                fieldName: 'username',
                component: 'Input',
                componentProps: {
                  placeholder: '用户名',
                },
                label: '用户名',
                formItemClass: 'col-span-full',
                rules: z
                  .string()
                  .trim()
                  .min(3, '最少3个字符')
                  .max(30, '最大长度30')
                  .regex(/^[\w\-@.+]{3,30}$/, '只能输入字母和@+-_.')
                  .refine(
                    async (v: string) => {
                      const { originData } = formOption;
                      if (originData && originData.username === v) {
                        return true;
                      }
                      return await checkUsername(v);
                    },
                    { message: '用户名已存在' },
                  ),
              },
              {
                fieldName: '_changePwd',
                component: 'Checkbox',
                label: '修改密码',
                help: '创建用户时自动添加这个角色',
                formItemClass: 'col-span-full lg:col-span-3',
                defaultValue: false,
              },
              {
                fieldName: 'password',
                component: 'InputPassword',
                componentProps: {
                  placeholder: '密码',
                },
                label: '密码',
                formItemClass: 'col-span-full lg:col-span-9',
                dependencies: {
                  triggerFields: ['_changePwd'],
                  disabled: (values) => {
                    return !values?._changePwd;
                  },
                  rules: (values) => {
                    if (values._changePwd) {
                      return z
                        .string()
                        .trim()
                        .min(6, '最少6个字符')
                        .max(50, '最大长度50')
                        .regex(/^[\w\-@.+]{6,50}$/, '只能输入字母和@+-_.');
                    }
                    return null;
                  },
                },
              },
              {
                fieldName: 'is_active',
                component: 'Switch',
                label: '激活',
                defaultValue: true,
                formItemClass: 'col-span-full',
              },
              {
                fieldName: 'real_name',
                component: 'Input',
                componentProps: {
                  placeholder: '姓名',
                },
                label: '姓名',
                formItemClass: 'col-span-full',
                rules: z.string().trim().optional(),
              },
              {
                fieldName: 'email',
                component: 'Input',
                componentProps: {
                  placeholder: '邮箱',
                },
                label: '邮箱',
                formItemClass: 'col-span-full',
                rules: z
                  .string()
                  .email({ message: '请输入正确邮箱' })
                  .or(z.literal(''))
                  .optional(),
              },
            ],
            wrapperClass: 'grid-cols-12',
          };
        }
      }
    },
    getValues: async (status, uid) => {
      switch (status) {
        case 'add': {
          return {
            values: {
              username: '',
              password: '',
              is_active: true,
              real_name: '',
              email: '',
            },
          };
        }
        case 'update': {
          if (uid) {
            const user = await getUser(uid as string);
            return {
              staticValues: {
                uid: user.id,
                createTime: user.create_time,
                updateTime: user.update_time,
              },
              values: {
                username: user.username,
                password: '',
                is_active: user.is_active,
                real_name: user.profile.real_name,
                email: user.profile.email,
              },
            };
          }
          break;
        }
      }
      return {
        values: {
          username: '',
          password: '',
          is_active: true,
          real_name: '',
          email: '',
        },
      };
    },
    valuesChange: (oldV, newV, status) => {
      if (status === 'update') {
        let status = false;
        // 修改密码的时候，如果没有勾选修改密码，就不用判断密码是否已修改。不管密码有没有值都当作没修改
        for (const key in oldV) {
          if (key in newV) {
            const o = oldV[key];
            const t = newV[key];
            if (key === 'password') {
              if (
                newV._changePwd &&
                t !== null &&
                t !== undefined &&
                t !== ''
              ) {
                status = true;
                break;
              }
              continue;
            }
            if (
              (o === null || o === undefined) &&
              (t === null || t === undefined || t === '')
            ) {
              continue;
            }
            if (!isEqual(o, t)) {
              status = true;
              break;
            }
          }
        }
        return status;
      }
    },
    handler: {
      update: async (uid, data, originData) => {
        const user: Record<string, any> = {};
        const profile: Record<string, any> = {};
        // 遍历表单数据跟原始数据对比，只保留已经修改过的数据，如果值是空串就保存null
        for (const [k, v] of Object.entries(data)) {
          if (!k.startsWith('_')) {
            if (k === 'password') {
              if (
                v !== '' &&
                v !== null &&
                v !== undefined &&
                data._changePwd
              ) {
                user[k] = v;
              }
              continue;
            }
            if (['is_active', 'username'].includes(k) && v !== originData[k]) {
              user[k] = v;
            } else if (
              ['email', 'real_name'].includes(k) &&
              v !== originData[k]
            ) {
              profile[k] = v === '' ? null : v;
            }
          }
        }

        // 只保存修改过数据的字段
        const userData: Record<string, any> = {};
        if (Object.keys(user).length > 0) {
          userData.user = user;
        }
        if (Object.keys(profile).length > 0) {
          userData.profile = profile;
        }
        await updateUser(uid as string, userData as UpdateUser);
      },
      add: async (data) => {
        const userData: AddUserData = {
          user: {
            username: data.username,
            password: data.password,
            is_active: data.is_active,
          },
          profile: {
            real_name: data.real_name === '' ? null : data.real_name,
            email: data.email === '' ? null : data.email,
          },
        };
        await addUser(userData);
      },
      del: async (idList) => {
        await delUser(idList as string[]);
      },
    },
  },
});
</script>

<template>
  <Page title="用户">
    <MyTable />
  </Page>
</template>
