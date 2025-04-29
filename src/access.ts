import { API } from '@/services/ant-design-pro/typings';

/**
 * @see https://umijs.org/zh-CN/plugins/plugin-access
 * */
export default function access(initialState: { currentUser?: API.CurrentUser } | undefined) {
  const { currentUser } = initialState ?? {};
  if (!currentUser?.roles) {
    return {}
  }
  return {
    canAdmin: currentUser.roles.includes('Admin'),
    canManager: currentUser.roles.includes('Manager'),
    canClient: currentUser.roles.includes('Client'),
  };
}
