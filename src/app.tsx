import { AvatarDropdown, AvatarName } from '@/components';
import { api, updateAPIToken } from '@/components/common/api';
import { WalletOutlined } from '@ant-design/icons';
import type { Settings as LayoutSettings } from '@ant-design/pro-components';
import { SettingDrawer } from '@ant-design/pro-components';
import type { RunTimeLayoutConfig } from '@umijs/max';
import { history } from '@umijs/max';
import { Avatar, message, Tag, Typography } from 'antd';
import { useEffect } from 'react';
import { flushSync } from 'react-dom';
import defaultSettings from '../config/defaultSettings';
import './common.css';
import { errorConfig } from './requestErrorConfig';
import { API } from './services/ant-design-pro/typings';

const { Text } = Typography;
const isDev = process.env.NODE_ENV === 'development';
let loginPath: any;
/**
 * @see  https://umijs.org/zh-CN/plugins/plugin-initial-state
 * */

const urlSearchParams = new URLSearchParams(window.location.search);
const tokenParam = urlSearchParams.get('token');
const passCodeParam = urlSearchParams.get('passCode');

if (passCodeParam) {
  loginPath = '/user/login/Resetpassword';
} else {
  loginPath = '/user/login';
  const currentURL = window.location.href;
  console.log(currentURL);
  const isSignupPage = currentURL.includes('/Signup');
  const isFP = currentURL.includes('/ForgotPassword');
  if (isSignupPage) {
    loginPath = '/user/login/Signup';
  }
  if (isFP) {
    loginPath = '/user/login/ForgotPassword';
  }
}
// loginPath = '/user/login'
console.log('Index token ------', loginPath);
export async function getInitialState(): Promise<{
  settings?: Partial<LayoutSettings>;
  currentUser?: API.CurrentUser;
  loading?: boolean;
  fetchUserInfo?: () => Promise<API.CurrentUser | undefined>;
}> {
  const fetchUserInfo = async () => {
    try {
      const u = await api.app.getMe();
      const user = {
        ...u,
        name: u.firstName + ' ' + u.lastName,
        // Create a custom avatar with the first letter
        avatar: (
          <Avatar style={{ backgroundColor: '#1890ff' }}>
            {u.firstName.charAt(0).toUpperCase()}
          </Avatar>
        ),
      };
      return user;
    } catch (error: any) {
      // ShowError(error)
      // history.push(loginPath);
      redirectToLogin();
    }
    return undefined;
  };

  // strrstrrstrrstrrstrrstrrstrrstrr，strrstrr
  const { location } = history;
  if (location.pathname !== loginPath) {
    const currentUser = await fetchUserInfo();
    return {
      fetchUserInfo,
      currentUser,
      settings: defaultSettings as Partial<LayoutSettings>,
    };
  }
  return {
    fetchUserInfo,
    settings: defaultSettings as Partial<LayoutSettings>,
  };
}

const redirectToLogin = () => {
  if (tokenParam) {
    console.log('redirecting login');
    history.push(loginPath + '?token=' + tokenParam);
  } else {
    history.push(loginPath);
  }
};

// const redirectToLogin = () => {
//     history.push(loginPath)
// }

// ProLayout strrstrrstrrapi https://procomponents.ant.design/components/layout
export const layout: RunTimeLayoutConfig = ({ initialState, setInitialState }) => {
  const wallet = initialState?.currentUser?.wallet;
  const balance = `${wallet?.balance?.toFixed(2)} ${wallet?.currency}`;

  const storeToken = (token: string) => {
    sessionStorage.setItem('jwtToken', token);
    updateAPIToken();
  };

  const fetchUserInfo = async () => {
    const userInfo = await initialState?.fetchUserInfo?.();
    if (userInfo) {
      flushSync(() => {
        setInitialState((s: any) => ({
          ...s,
          currentUser: userInfo,
        }));
      });
    }
  };

  useEffect(() => {
    const checkUserSession = async () => {
      if (tokenParam) {
        storeToken(tokenParam);
        message.success({
          content: 'Login successful!',
          icon: <span style={{ color: 'Black', fontSize: '18px' }}>✔</span>,
          style: {
            color: 'Black',
            fontWeight: '500',
            borderRadius: '8px',
          },
          className: 'custom-success-notification',
          duration: 3,
        });
        await fetchUserInfo();
        const urlParams = new URL(window.location.href).searchParams;
        history.push(urlParams.get('redirect') || '/dashboard');
      }
    };
    checkUserSession();
  }, []);
  

  return {
    actionsRender: () =>
      //[<Question key="doc" />, <SelectLang key="SelectLang" />],
      [
        <Tag
          className="wallet-pill"
          icon={<WalletOutlined style={{ fontSize: '18px' }} />}
          style={{ display: 'inline-flex', alignItems: 'center' }}
        >
          <span className="wallet-pill-text">{balance}</span>
        </Tag>,
      ],
    avatarProps: {
      src: initialState?.currentUser?.avatar,
      title: <AvatarName />,
      render: (_, avatarChildren) => {
        return <AvatarDropdown>{avatarChildren}</AvatarDropdown>;
      },
    },
    waterMarkProps: {
      //content: initialState?.currentUser?.name,
    },
    // footerRender: () => <Footer/>,
    onPageChange: () => {
      const { location } = history;
      // strrstrrstrrstrrstrrstrr，strrstrrstrrstrr login
      if (!initialState?.currentUser && location.pathname !== loginPath) {
        redirectToLogin();
      }
    },
    layoutBgImgList: [
      {
        src: 'https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/D2LWSqNny4sAAAAAAAAAAAAAFl94AQBr',
        left: 85,
        bottom: 100,
        height: '303px',
      },
      {
        src: 'https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/C2TWRpJpiC0AAAAAAAAAAAAAFl94AQBr',
        bottom: -68,
        right: -45,
        height: '303px',
      },
      {
        src: 'https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/F6vSTbj8KpYAAAAAAAAAAAAAFl94AQBr',
        bottom: 0,
        left: 0,
        width: '331px',
      },
    ],
    links: isDev
      ? [
          // <Link key="openapi" to="/umi/plugin/openapi" target="_blank">
          //   <LinkOutlined />
          //   <span>OpenAPI strrstrr</span>
          // </Link>,
        ]
      : [],
    menuHeaderRender: undefined,
    // strrstrrstrr 403 strrstrr
    // unAccessible: <div>unAccessible</div>,
    // strrstrrstrrstrr loading strrstrrstrr
    childrenRender: (children) => {
      // if (initialState?.loading) return <PageLoading />;
      return (
        <>
          {children}
          {isDev && (
            <SettingDrawer
              disableUrlParams
              enableDarkTheme
              settings={initialState?.settings}
              onSettingChange={(settings) => {
                setInitialState((preInitialState) => ({
                  ...preInitialState,
                  settings,
                }));
              }}
            />
          )}
        </>
      );
    },
    ...initialState?.settings,
  };
};

/**
 * @name request strrstrr，strrstrrstrrstrrstrrstrrstrrstrr
 * strrstrrstrr axios strr ahooks strr useRequest strrstrrstrrstrrstrrstrrstrrstrrstrrstrrstrrstrrstrrstrrstrrstrrstrrstrrstrr。
 * @doc https://umijs.org/docs/max/request#strrstrr
 */
export const request = {
  ...errorConfig,
};
