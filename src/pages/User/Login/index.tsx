import { api, updateAPIToken } from '@/components/common/api';
import { LockOutlined, MailOutlined, ArrowLeftOutlined } from '@ant-design/icons';
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
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        color: 'white',
        position: 'relative'
      }}>
        <div style={{
          position: 'fixed',
          top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'linear-gradient(120deg, rgba(10,29,62,0.10) 60%, rgba(14,62,138,0.06) 100%)',
          zIndex: 2,
          pointerEvents: 'none'
        }} />
        <div style={{ textAlign: 'center', zIndex: 3, position: 'relative' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid rgba(255,255,255,0.3)',
            borderTop: '4px solid #ff6ec7',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p>Loading...</p>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg);}
            100% { transform: rotate(360deg);}
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      overflow: 'hidden',
      position: 'relative',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }}>
      <div style={{
        position: 'fixed',
        top: 0, left: 0, width: '100vw', height: '100vh',
        background: 'linear-gradient(120deg, rgba(255,255,255,0.05) 0%, rgba(240,248,255,0.08) 100%)',
        zIndex: 1,
        pointerEvents: 'none'
      }} />

      {/* Login Card with Curved Top */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '30%',
        transform: 'translate(-45%, -48%)',
        width: '90%',
        maxWidth: '350px',
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '24px',
        padding: '0',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15), 0 8px 25px rgba(0, 0, 0, 0.08)',
        overflow: 'hidden',
        backdropFilter: 'blur(20px)',
        zIndex: 3,
        border: '1px solid rgba(255, 255, 255, 0.3)'
      }}>
        {/* Curved Header Section */}
        <div style={{
          position: 'relative',
          width: '100%',
          height: '130px',
          background: 'transparent',
          overflow: 'hidden',
        }}>
          {/* SVG Curve */}
          <svg viewBox="0 0 350 130" width="100%" height="130" style={{ position: 'absolute', top: 0, left: 0, zIndex: 2 }}>
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
          <div style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'absolute',
            top: '38%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 3
          }}>
            <img
              src="/images/Mevora_Capital.png"
              alt="Mevora Capital"
              style={{
                height: '180px',
                width: 'auto',
                maxWidth: '160px',
                objectFit: 'contain',
                filter: 'brightness(1.1) drop-shadow(0 2px 8px rgba(0,0,0,0.2))',
                animation: 'fadeInScale 0.8s ease-out'
              }}
            />
          </div>

          {/* Back Arrow */}
          <div style={{
            padding: '14px 18px',
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 4
          }}>
            <ArrowLeftOutlined style={{
              color: '#fff',
              fontSize: '18px',
              cursor: 'pointer',
              opacity: 0.9
            }} onClick={() => window.history.back()} />
          </div>
        </div>

        {/* Form Container */}
        <div style={{
          padding: '30px 24px 24px',
          position: 'relative',
          zIndex: 1
        }}>
          <Form
            name="auth_form"
            onFinish={handleSubmit}
            layout="vertical"
            style={{ width: '100%' }}
          >
            <Form.Item
              name="email"
              rules={[{ required: true, message: 'Please input your email address!' }]}
              style={{ marginBottom: '20px' }}
            >
              <div style={{ position: 'relative' }}>
                <label style={{
                  color: '#4a5568',
                  fontSize: '14px',
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '600'
                }}>
                  Email Address
                </label>
                <Input
                  prefix={<MailOutlined style={{ color: '#667eea' }} />}
                  placeholder="Enter your email"
                  size="large"
                  style={{
                    backgroundColor: '#f8fafc',
                    border: '2px solid #e2e8f0',
                    borderRadius: '12px',
                    color: '#2d3748',
                    fontSize: '15px',
                    padding: '12px 16px',
                    height: 'auto',
                    transition: 'all 0.3s ease'
                  }}
                  className="custom-light-input"
                />
              </div>
            </Form.Item>
            <Form.Item
              name="password"
              rules={[{ required: true, message: 'Please input your password!' }]}
              style={{ marginBottom: '16px' }}
            >
              <div style={{ position: 'relative' }}>
                <label style={{
                  color: '#4a5568',
                  fontSize: '14px',
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '600'
                }}>
                  Password
                </label>
                <Input.Password
                  prefix={<LockOutlined style={{ color: '#667eea' }} />}
                  placeholder="Enter your password"
                  size="large"
                  style={{
                    backgroundColor: '#f8fafc',
                    border: '2px solid #e2e8f0',
                    borderRadius: '12px',
                    color: '#2d3748',
                    fontSize: '15px',
                    padding: '12px 16px',
                    height: 'auto',
                    transition: 'all 0.3s ease'
                  }}
                  className="custom-light-input"
                />
              </div>
            </Form.Item>
            <div style={{
              textAlign: 'right',
              marginBottom: '24px'
            }}>
              <a 
                href="/user/login/ForgotPassword"
                style={{
                  color: '#667eea',
                  fontSize: '13px',
                  textDecoration: 'none',
                  fontWeight: '500',
                  transition: 'color 0.3s ease'
                }}
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
            <Form.Item style={{ marginBottom: '20px' }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={isProcessing}
                style={{
                  width: '100%',
                  height: '48px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#fff',
                  boxShadow: '0 8px 25px rgba(102, 126, 234, 0.25)',
                  transition: 'all 0.3s ease'
                }}
                className="light-login-button"
              >
                Sign In
              </Button>
            </Form.Item>
            <div style={{
              textAlign: 'center',
              color: '#718096',
              fontSize: '14px'
            }}>
              Don't have an account?{' '}
              <a 
                onClick={() => history.push('/User/Login/Signup')}
                style={{
                  color: '#667eea',
                  textDecoration: 'none',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'color 0.3s ease'
                }}
                className="signup-link"
              >
                Sign Up
              </a>
            </div>
          </Form>
        </div>
      </div>
      <style jsx>{`
        @keyframes fadeInScale {
          0% { 
            opacity: 0; 
            transform: translate(-50%, -50%) scale(0.8);
          }
          100% { 
            opacity: 1; 
            transform: translate(-50%, -50%) scale(1);
          }
        }
        .custom-light-input input {
          background: transparent !important;
          color: #2d3748 !important;
          border: none !important;
        }
        .custom-light-input input::placeholder {
          color: #a0aec0 !important;
        }
        .custom-light-input .ant-input-prefix {
          margin-right: 12px;
        }
        .custom-light-input:hover {
          border-color: #667eea !important;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1) !important;
        }
        .custom-light-input:focus-within {
          border-color: #667eea !important;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.15) !important;
        }
        .light-login-button:hover {
          background: linear-gradient(135deg, #764ba2 0%, #667eea 100%) !important;
          transform: translateY(-2px);
          box-shadow: 0 12px 35px rgba(102, 126, 234, 0.35) !important;
        }
        .light-login-button:active {
          transform: translateY(0px);
        }
        .forgot-link:hover {
          color: #5a67d8 !important;
        }
        .signup-link:hover {
          color: #5a67d8 !important;
        }
      `}</style>
    </div>
  );
};

export default Login;
