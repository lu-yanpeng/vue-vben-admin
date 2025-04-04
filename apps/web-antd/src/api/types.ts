export interface DefaultFilterParams<T = unknown> {
  skip?: number;
  limit?: number;
  fields?: string[];
  order_by?: [string, 'asc' | 'desc'][];
  rel_fields?: [string, null | string[]][];
  query?: T;
}
