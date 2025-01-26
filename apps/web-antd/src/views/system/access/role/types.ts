import type { SingleRole, UpdateRoleData } from '#/api/system/access/role.ts';

export interface Role {
  id?: number;
  name: string;
  desc: string;
  is_default_role: boolean;
  create_time: string;
  update_time: string;
}

export interface ModalData extends SingleRole {
  updateMethod?: (
    uid: number,
    data: UpdateRoleData,
  ) => Promise<Omit<SingleRole, 'sys_routes'>>;
  refreshGrid: (params?: Record<string, any>) => Promise<void>;
}
