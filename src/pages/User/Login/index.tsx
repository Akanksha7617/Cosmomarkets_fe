 import { api, updateAPIToken } from '@/components/common/api';
import { LockOutlined, MailOutlined } from '@ant-design/icons';
import { history, useModel } from '@umijs/max';
import { Alert, Button, Form, Input, message } from 'antd';
import { useEffect, useState } from 'react';
import { flushSync } from 'react-dom';
import 'react-phone-input-2/lib/style.css';
import '../../../common.css';

const LoginMessage = ({ content }: { content: string }) => (
  <Alert
    style={{ marginBottom: 24 }}
    message={content}
    type="error"
    showIcon
  />
);

const LoadingOverlay = () => (
  <div className="loading-container">
    <div className="loading-overlay" />
    <div className="loading-content">
      <div className="loading-spinner"></div>
      <p>Loading...</p>
    </div>
  </div>
);

const Login = () => {
  const [userLoginState, setUserLoginState] = useState<{ status?: string }>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const { initialState, setInitialState } = useModel('@@initialState');

  // Background theme
  useEffect(() => {
   
    document.body.style.minHeight = "100vh";
    document.body.style.width = "100vw";
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.background = "";
      document.body.style.minHeight = "";
      document.body.style.width = "";
      document.body.style.overflow = "";
    };
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

  const handleSubmit = async (values: { email: string; password: string }) => {
    setIsProcessing(true);
    try {
      const msg = await api.app.postSignIn({
        email: values.email,
        password: values.password,
      });

      if (msg.status === 'ok') {
        sessionStorage.setItem('jwtToken', msg.token);
        updateAPIToken();
        message.success('Login successful');
        await fetchUserInfo();
        const urlParams = new URL(window.location.href).searchParams;
        history.push(urlParams.get('redirect') || '/dashboard');
        return;
      }

      const errorMsg = msg.message || 'Login failed. Please try again.';
      message.error(errorMsg);
    } catch {
      setUserLoginState({ status: 'error' });
    } finally {
      setIsProcessing(false);
    }
  };

  if (isProcessing) return <LoadingOverlay />;

  return (
     <div className="login-page">
  <div className="login-card">
    {/* Left – Logo */}
    <div className="login-left">
      <img src="/images/Cosmomarkets .png" alt="Logo" />
    </div>

    {/* Right – Form */}
    <div className="login-right">
      <h2 className="login-title">Sign In</h2>

      <Form
        name="loginForm"
        onFinish={handleSubmit}
        layout="vertical"
        className="login-form"
      >
        <Form.Item label="Email Address" name="email" rules={[{ required: true, message: 'Please input your email!' }]}>
          <Input prefix={<MailOutlined />} placeholder="Enter your email" size="large" className="login-input"/>
        </Form.Item>

        <Form.Item label="Password" name="password" rules={[{ required: true, message: 'Please input your password!' }]}>
          <Input.Password prefix={<LockOutlined />} placeholder="Enter your password" size="large" className="login-input"/>
        </Form.Item>

        <a className="forgot-password" href="/user/login/ForgotPassword">Forgot Password?</a>

        {userLoginState.status === 'error' && <LoginMessage content="Failed to sign in. Please try again." />}

        <Form.Item>
          <Button type="primary" htmlType="submit" className="login-submit-button" loading={isProcessing}>Sign In</Button>
        </Form.Item>

        <div className="login-signup-text">
          Don’t have an account?{' '}
          <a onClick={() => history.push('/User/Login/Signup')} className="signup-link">Create your account</a>
        </div>
      </Form>
    </div>
  </div>
</div>


  );
};

export default Login;
