import type {
  AddRoleFn,
  RolePolicy,
  SingleRole,
  SysRouteItem,
  UpdateRoleFn,
} from '#/api/system/role.ts';
import type { RouteMenuItem } from '#/types/menu';

export interface Role {
  id?: number;
  name: string;
  desc: string;
  is_default_role: boolean;
  create_time: string;
  update_time: string;
}

export interface AddData {
  type: 'add';
  add: {
    addMethod: AddRoleFn;
    data: {
      policies: RolePolicy[];
      role: {
        desc: '';
        is_default_role: boolean;
        name: '';
        routes: null;
      };
      serverRoutes: RouteMenuItem[];
      sys_routes: SysRouteItem[];
    };
    refreshGrid: (params?: Record<string, any>) => Promise<void>;
  };
  update?: never;
}
export interface UpdateData {
  type: 'update';
  add?: never;
  update: {
    data: NonNullable<SingleRole> & {
      serverRoutes: RouteMenuItem[];
    };
    refreshGrid: (params?: Record<string, any>) => Promise<void>;
    updateMethod: UpdateRoleFn;
  };
}
export type ModalData = AddData | UpdateData;
