import { api, updateAPIToken } from '@/components/common/api';
import { LockOutlined, MailOutlined, UserOutlined } from '@ant-design/icons';
import { history, useModel } from '@umijs/max';
import { Alert, Button, Checkbox, Form, Input, message, Modal, Select } from 'antd';
import { useEffect, useState } from 'react';
import { flushSync } from 'react-dom';
import 'react-phone-input-2/lib/style.css';
import '../../../common.css';

const { Option } = Select;

// Slider content
const sliderContent = [
  {
    image: '/images/s1.jpg',
  },
  {
    image: '/images/s2.jpg',
  },
  {
    image: '/images/s3.jpg',
  },
];

const Login = () => {
  // State management
  const [userLoginState, setUserLoginState] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const { initialState, setInitialState } = useModel('@@initialState');

  // State for slider
  const [currentSlide, setCurrentSlide] = useState(0);

  // Slider auto-rotation effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliderContent.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const LoginMessage = ({ content }) => {
    return (
      <Alert
        style={{
          marginBottom: 24,
        }}
        message={content}
        type="error"
        showIcon
      />
    );
  };

  // Check for URL parameters and admin impersonation
  useEffect(() => {
    const checkAndHandleAdminImpersonation = async () => {
      setIsProcessing(true);

      const urlSearchParams = new URLSearchParams(window.location.search);
      const userId = urlSearchParams.get('userId');
      const adminImpersonating = urlSearchParams.get('adminImpersonating');
      const impersonationToken = urlSearchParams.get('impersonationToken');

      // Check if this is an admin impersonating a user
      if (userId && adminImpersonating === 'true' && impersonationToken) {
        // Save current admin token if not already saved
        const currentToken = sessionStorage.getItem('jwtToken');
        if (currentToken && !sessionStorage.getItem('adminToken')) {
          sessionStorage.setItem('adminToken', currentToken);
        }

        // Set the impersonation token
        sessionStorage.setItem('jwtToken', impersonationToken);
        sessionStorage.setItem('isAdminImpersonating', 'true');
        sessionStorage.setItem('impersonatedUserId', userId);

        // Update API token and fetch user info
        updateAPIToken();
        await fetchUserInfo();

        // Redirect to user dashboard
        history.replace('/dashboard');
        return;
      }

      // Check for return from user impersonation
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

      // Handle normal login parameters
      const tokenParam = urlSearchParams.get('token');

      if (tokenParam) {
        sessionStorage.setItem('jwtToken', tokenParam);
        updateAPIToken();
        await fetchUserInfo();
        const redirect = urlSearchParams.get('redirect') || '/dashboard';
        history.replace(redirect);
        return;
      }

      // Check for existing token
      const existingToken = sessionStorage.getItem('jwtToken');
      if (existingToken) {
        updateAPIToken();
        try {
          await fetchUserInfo();
          // If fetchUserInfo succeeds, token is valid
          const redirect = urlSearchParams.get('redirect') || '/dashboard';
          history.replace(redirect);
          return;
        } catch (error) {
          console.error('Token verification failed:', error);
          // Invalid token, clear it
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

        // Custom login success message with orange icon
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
      console.error('Login error:', error);
      setUserLoginState({
        type: 'signin',
        currentAuthority: 'guest',
        status: 'error',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Show loading state while processing admin impersonation
  if (isProcessing) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Top navigation */}
      <div className="nav-container">
        <div className="nav-links">
          <a href="logo" className="site-logo">
            <img src="/images/logo.png" alt="logo"></img>
          </a>
           {/* style={{ width: 197, height: 56 }} */}
        </div>
        <div className="nav-buttons">
          <Button type="default" ghost onClick={() => history.push('/user/login')}>
            Log In
          </Button>
          <Button type="primary" onClick={() => history.push('/User/Login/Signup')}>
            Sign Up
          </Button>
        </div>
      </div>

      {/* Combined main content */}
      <div className="combined-container">
        <div className="combined-content">
          {/* Auth form section */}
          <div className="auth-form-section">
            <div className="auth-card">
              <div className="auth-header">
                <h2>Welcome to Xyleum</h2>
              </div>

              <div className="auth-form-container">
                <Form
                  name="auth_form"
                  className="auth-form"
                  initialValues={{
                    autoLogin: true,
                  }}
                  onFinish={handleSubmit}
                  layout="vertical"
                >
                  <Form.Item
                    label="Email Address"
                    name="email"
                    rules={[{ required: true, message: 'Please input your email address!' }]}
                  >
                    <Input
                      prefix={<MailOutlined className="form-icon" />}
                      placeholder="Email Address"
                      size="large"
                    />
                  </Form.Item>

                  <Form.Item
                    label="Password"
                    name="password"
                    rules={[{ required: true, message: 'Please input your password!' }]}
                  >
                    <Input.Password
                      prefix={<LockOutlined className="form-icon" />}
                      placeholder="Password"
                      size="large"
                    />
                  </Form.Item>

                  {/* Forgot Password Link */}
                  <Form.Item>
                    <div
                      className="forgot-password-container"
                      style={{ textAlign: 'right', marginTop: '-20px', color: 'white' }}
                    >
                      <a className="forgot-password-link" href="/user/login/ForgotPassword">
                        Forgot Password?
                      </a>
                    </div>
                  </Form.Item>

                  {userLoginState.status === 'error' && (
                    <LoginMessage content="Failed to sign in. Please try again." />
                  )}

                  <Form.Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                      className="submit-button"
                      loading={isProcessing}
                    >
                      Sign In
                    </Button>
                  </Form.Item>

                  <div className="bottom-text">
                    <span>
                      Don't have an account? <a onClick={() => history.push('/User/Login/Signup')}>Signup</a>{' '}
                      now
                    </span>
                  </div>
                </Form>
              </div>
            </div>
          </div>

          {/* Image Slider Section */}
          <div className="slider-section">
            <div className="slider-container">
              {sliderContent.map((slide, index) => (
                <div key={index} className={`slide ${index === currentSlide ? 'active' : ''}`}>
                  <img
                    src={slide.image}
                    alt="Slider image"
                    className="slide-image"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/placeholder-image.png'; // Fallback image
                    }}
                  />
                </div>
              ))}

              <div className="slider-indicators">
                {sliderContent.map((_, index) => (
                  <div
                    key={index}
                    className={`indicator ${index === currentSlide ? 'active' : ''}`}
                    onClick={() => setCurrentSlide(index)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;