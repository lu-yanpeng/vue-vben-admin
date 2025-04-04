import { isEmpty } from '@vben/utils';

// 返回符合后端filter接口的query参数，类似 [{ id: ['==', 1] }]
export const getQuerySet = (
  formValues: Record<string, any>,
): undefined | { [key: string]: [string, unknown | unknown[]] }[] => {
  const queryData: { [key: string]: [string, unknown | unknown[]] } = {};
  for (const itemKey in formValues) {
    const key = itemKey;
    const value = formValues[key];
    if (value !== undefined) {
      switch (typeof value) {
        case 'boolean': {
          queryData[key] = ['==', value];
          break;
        }
        case 'number': {
          queryData[key] = ['==', value];
          break;
        }
        case 'object': {
          if (
            Array.isArray(value) && // 日期类型的数据需要用范围查询，并且是datetime类型
            typeof value[0]?.format === 'function'
          ) {
            queryData[key] = [
              'between',
              [
                value[0].startOf('day').format('YYYY-MM-DD HH:mm:ss'),
                value[1].endOf('day').format('YYYY-MM-DD HH:mm:ss'),
              ],
            ];
          }
          break;
        }
        case 'string': {
          if (value !== '') {
            queryData[key] = ['like', value];
          }
          break;
        }
      }
    }
  }

  if (
    !isEmpty(queryData) &&
    !(Object.keys(queryData).length === 1 && 'db_or_query_' in queryData)
  ) {
    return [queryData];
  }
};

export interface queryParams {
  page: {
    currentPage: number;
    pageSize: number;
  };
}

export interface ResponseData<T = any> {
  data: {
    data: T;
    meta: { total: number };
  };
}
