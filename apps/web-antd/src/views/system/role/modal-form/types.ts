import type { TreeProps } from 'ant-design-vue';

import type { SingleRole, SysRouteItem } from '#/api/system/role';

export type ApiRoutes = SysRouteItem[];
export type { SingleRole };
export type RoleStaticValue = {
  create_time?: string;
  desc: null | string;
  id?: number;
  is_default_role: boolean;
  name: string;
  update_time?: string;
};
// 角色表单中所有用到的字段，用不到的不要写在里面，比如表单不需要createTime
export type RoleFormField = {
  desc?: string;
  is_default_role: boolean;
  name: string;
};
export type TreeData = NonNullable<TreeProps['treeData']>;
