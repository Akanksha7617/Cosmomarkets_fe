import { AvatarDropdown, AvatarName } from '@/components';
import { api, updateAPIToken } from '@/components/common/api';
import { MoneyCollectOutlined } from '@ant-design/icons';
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
import ChatBot from './components/Chatbot';

const { Text } = Typography;
const isDev = process.env.NODE_ENV === 'development';
let loginPath: any;

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
      redirectToLogin();
    }
    return undefined;
  };

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

// ProLayout API https://procomponents.ant.design/components/layout
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
      [
        <Tag
          className="wallet-pill"
          icon={<MoneyCollectOutlined style={{ fontSize: '18px' }} />}
          style={{ display: 'inline-flex', alignItems: 'center' }}
        >
          <span className="wallet-pill-text">{balance}</span>
        </Tag>,
      ],
    // avatarProps: {
    //   src: initialState?.currentUser?.avatar,
    //   title: <AvatarName />,
    //   render: (_, avatarChildren) => {
    //     return <AvatarDropdown>{avatarChildren}</AvatarDropdown>;
    //   },
    // },

    menuFooterRender: () => {
      if (!initialState?.currentUser) return null;

      return (
        <div style={{ padding: 16, textAlign: 'center' }}>
          <AvatarDropdown>
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
              <Avatar src={initialState.currentUser.avatar} size="large" />
              <AvatarName />
            </div>
          </AvatarDropdown>
        </div>
      );
    },
    waterMarkProps: {
      //content: initialState?.currentUser?.name,
    },
    onPageChange: () => {
      const { location } = history;
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
        // Your existing links
      ]
      : [],
    menuHeaderRender: undefined,
    // Modified childrenRender to include ChatBot for all authenticated users
    childrenRender: (children) => {
  // Check if user is on login pages
  const { location } = history;
  const isAuthPage = location.pathname.startsWith('/user/login') || 
                    location.pathname.startsWith('/user/') ||
                    location.pathname === '/';

  // Debug: Log user object to console
  console.log('Current User Object:', initialState?.currentUser);
  console.log('Current Path:', location.pathname);
  console.log('Is Auth Page:', isAuthPage);

  // Simple check - if user object exists and has basic user properties, show chatbot
  const isAuthenticated = initialState?.currentUser && 
                         (initialState?.currentUser?.id || 
                          initialState?.currentUser?.userid || 
                          initialState?.currentUser?.firstName ||
                          initialState?.currentUser?.email);

  console.log('Is Authenticated:', isAuthenticated);

  // Determine user type based on current route or user properties
  const isAdminRoute = location.pathname.startsWith('/admin/');
  const userType = isAdminRoute ? 'Admin' : 'Client';

  console.log('User Type:', userType);

      return (
        <>
          {children}
          
          {/* Show ChatBot for all authenticated users */}
          {isAuthenticated && !isAuthPage && (
            <ChatBot 
              userId={initialState?.currentUser?.userid || initialState?.currentUser?.id}
              userName={initialState?.currentUser?.firstName ? 
                      `${initialState?.currentUser?.firstName} ${initialState?.currentUser?.lastName || ''}`.trim() : 
                      initialState?.currentUser?.name || 'User'}
              userType={userType}
            />
          )}
          
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
 * @name request configuration
 */
export const request = {
  ...errorConfig,
};