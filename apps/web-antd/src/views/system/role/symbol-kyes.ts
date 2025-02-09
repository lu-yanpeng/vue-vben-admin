// 子组件统一调用这个方法来显示消息
export const messageSymbolKeys = Symbol('显示消息');
export type MessageSymbolType = (
  type: 'error' | 'info' | 'success' | 'warning',
  text: string,
) => void;
