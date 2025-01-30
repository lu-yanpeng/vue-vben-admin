import type {
  AddRoleData,
  SingleRole,
  UpdateRoleData,
} from '#/api/system/access/role.ts';

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
    addMethod: (data: AddRoleData) => Promise<Pick<SingleRole, 'role'>>;
    data: {
      policies: SingleRole['policies'];
      role: Pick<Role, 'desc' | 'is_default_role' | 'name'>;
      sys_routes: NonNullable<SingleRole['sys_routes']>;
    };
    refreshGrid: (params?: Record<string, any>) => Promise<void>;
  };
  update?: never;
}
export interface UpdateData {
  type: 'update';
  add?: never;
  update: {
    data: NonNullable<SingleRole>;
    refreshGrid: (params?: Record<string, any>) => Promise<void>;
    updateMethod: (
      uid: number,
      data: UpdateRoleData,
    ) => Promise<Omit<SingleRole, 'sys_routes'>>;
  };
}
export type ModalData = AddData | UpdateData;
