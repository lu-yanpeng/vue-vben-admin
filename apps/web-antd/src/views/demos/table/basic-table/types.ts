import type { VbenFormProps } from '@vben-core/form-ui';

export interface RowType {
  id: number;
  category: string;
  user: string;
  organization: string;
  created: string;
}

export type ModalData = {
  update: boolean;
} & VbenFormProps;
