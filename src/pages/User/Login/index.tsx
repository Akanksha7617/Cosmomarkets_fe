import { api, updateAPIToken } from '@/components/common/api';
import { LockOutlined, MailOutlined } from '@ant-design/icons';
import { history, useModel } from '@umijs/max';
import { Alert, Button, Form, Input, message } from 'antd';
import { useEffect, useState } from 'react';
import { flushSync } from 'react-dom';
import 'react-phone-input-2/lib/style.css';
import '../../../common.css';


const Login = () => {
  const [userLoginState, setUserLoginState] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const { initialState, setInitialState } = useModel('@@initialState');

  useEffect(() => {
    document.body.style.background = `url('/images/hd.png') center center / cover no-repeat`;
    document.body.style.minHeight = '100vh';
    document.body.style.width = '100vw';
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.background = '';
      document.body.style.minHeight = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    const checkAndHandleAdminImpersonation = async () => {
      setIsProcessing(true);
      const urlSearchParams = new URLSearchParams(window.location.search);
      const userId = urlSearchParams.get('userId');
      const adminImpersonating = urlSearchParams.get('adminImpersonating');
      const impersonationToken = urlSearchParams.get('impersonationToken');
      if (userId && adminImpersonating === 'true' && impersonationToken) {
        const currentToken = sessionStorage.getItem('jwtToken');
        if (currentToken && !sessionStorage.getItem('adminToken')) {
          sessionStorage.setItem('adminToken', currentToken);
        }
        sessionStorage.setItem('jwtToken', impersonationToken);
        sessionStorage.setItem('isAdminImpersonating', 'true');
        sessionStorage.setItem('impersonatedUserId', userId);
        updateAPIToken();
        await fetchUserInfo();
        history.replace('/dashboard');
        return;
      }
      if (urlSearchParams.get('returnToAdmin') === 'true') {
        const adminToken = sessionStorage.getItem('adminToken');
        if (adminToken) {
          sessionStorage.setItem('jwtToken', adminToken);
          sessionStorage.removeItem('isAdminImpersonating');
          sessionStorage.removeItem('impersonatedUserId');
          updateAPIToken();
          await fetchUserInfo();
          history.replace('/admin/dashboard');
          return;
        }
      }
      const tokenParam = urlSearchParams.get('token');
      if (tokenParam) {
        sessionStorage.setItem('jwtToken', tokenParam);
        updateAPIToken();
        await fetchUserInfo();
        const redirect = urlSearchParams.get('redirect') || '/dashboard';
        history.replace(redirect);
        return;
      }
      const existingToken = sessionStorage.getItem('jwtToken');
      if (existingToken) {
        updateAPIToken();
        try {
          await fetchUserInfo();
          const redirect = urlSearchParams.get('redirect') || '/dashboard';
          history.replace(redirect);
          return;
        } catch (error) {
          sessionStorage.removeItem('jwtToken');
          updateAPIToken();
        }
      }
      setIsProcessing(false);
    };
    checkAndHandleAdminImpersonation();
  }, []);

  const fetchUserInfo = async () => {
    const userInfo = await initialState?.fetchUserInfo?.();
    if (userInfo) {
      flushSync(() => {
        setInitialState((s) => ({
          ...s,
          currentUser: userInfo,
        }));
      });
      return userInfo;
    }
    throw new Error('Failed to fetch user info');
  };

  const handleSubmit = async (values) => {
    setIsProcessing(true);
    try {
      const msg = await api.app.postSignIn({
        email: values.email,
        password: values.password,
      });
      if (msg.status === 'ok') {
        sessionStorage.setItem('jwtToken', msg.token);
        updateAPIToken();
        message.success({
          content: 'Login successful',
          icon: <span className="orange-success-icon"> ✓ </span>,
          className: 'orange-success-notification',
          duration: 3,
        });
        await fetchUserInfo();
        const urlParams = new URL(window.location.href).searchParams;
        history.push(urlParams.get('redirect') || '/dashboard');
        return;
      } else {
        if (msg.message && msg.message.includes('User is disabled by admin')) {
          message.error('User is disabled by admin.');
        } else if (msg.message && msg.message.includes('Invalid user or password.')) {
          message.error('Invalid user or password.');
        } else if (msg.message && msg.message.includes('Email not registered. Please sign up.')) {
          message.error('Email not registered. Please sign up.');
        } else {
          message.error('Login failed. Please try again.');
        }
      }
    } catch (error) {
      setUserLoginState({
        type: 'signin',
        currentAuthority: 'guest',
        status: 'error',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const LoginMessage = ({ content }) => (
    <Alert
      style={{
        marginBottom: 24,
      }}
      message={content}
      type="error"
      showIcon
    />
  );

  if (isProcessing) {
    return (
      <div className="loading-container">
        <div className="loading-overlay" />
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="login-main-container">
      <div className="login-backdrop-overlay" />

      {/* Login Card with Curved Top */}
      <div className="login-card">
        {/* Curved Header Section */}
        <div className="login-header">
          {/* SVG Curve */}
          <svg viewBox="0 0 350 130" width="100%" height="130" className="header-svg">
            <defs>
              <linearGradient id="loginGradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#667eea" />
                <stop offset="100%" stopColor="#764ba2" />
              </linearGradient>
            </defs>
            <path
              d="M0,0 L350,0 L350,80 Q175,140 0,80 Z"
              fill="url(#loginGradient)"
            />
          </svg>

          {/* Logo */}
          <div className="logo-container">
            <img
              src="/images/Mevora_Capital.png"
              alt="Mevora Capital"
              className="logo-image"
            />
          </div>
        </div>

        {/* Form Container */}
        <div className="form-container">
          <Form
            name="auth_form"
            onFinish={handleSubmit}
            layout="vertical"
            style={{ width: '100%' }}
          >
            <Form.Item
              name="email"
              rules={[{ required: true, message: 'Please input your email address!' }]}
              className="email-form-item"
            >
              <div style={{ position: 'relative' }}>
                <label className="input-label">
                  Email Address
                </label>
                <Input
                  prefix={<MailOutlined className="input-prefix-icon" />}
                  placeholder="Enter your email"
                  size="large"
                  className="custom-light-input"
                />
              </div>
            </Form.Item>
            <Form.Item
              name="password"
              rules={[{ required: true, message: 'Please input your password!' }]}
              className="password-form-item"
            >
              <div style={{ position: 'relative' }}>
                <label className="input-label">
                  Password
                </label>
                <Input.Password
                  prefix={<LockOutlined className="input-prefix-icon" />}
                  placeholder="Enter your password"
                  size="large"
                  className="custom-light-input"
                />
              </div>
            </Form.Item>
            <div className="forgot-password-link">
              <a
                href="/user/login/ForgotPassword"
                className="forgot-link"
              >
                Forgot Password?
              </a>
            </div>
            {userLoginState.status === 'error' && (
              <div style={{ marginBottom: '16px' }}>
                <LoginMessage content="Failed to sign in. Please try again." />
              </div>
            )}
            <Form.Item className="submit-form-item">
              <Button
                type="primary"
                htmlType="submit"
                loading={isProcessing}
                className="light-login-button"
              >
                Sign In
              </Button>
            </Form.Item>
            <div className="signup-text">
              Don't have an account?{' '}
              <a
                onClick={() => history.push('/User/Login/Signup')}
                className="signup-link"
              >
                Sign Up
              </a>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default Login;