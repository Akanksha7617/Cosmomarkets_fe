 import { api, updateAPIToken } from '@/components/common/api';
import { LockOutlined, MailOutlined, UserOutlined } from '@ant-design/icons';
import { history, useModel } from '@umijs/max';
import { Alert, Button, Checkbox, Form, Input, message, Select } from 'antd';
import { useEffect, useState } from 'react';
import { flushSync } from 'react-dom';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import '../../../common.css';

const { Option } = Select;

const countryCodes = [
  { code: '+971', name: 'United Arab Emirates' },
  { code: '+1', name: 'USA' },
  { code: '+91', name: 'India' },
  { code: '+44', name: 'United Kingdom' },
  { code: '+61', name: 'Australia' },
  { code: '+33', name: 'France' },
  { code: '+49', name: 'Germany' },
  { code: '+81', name: 'Japan' },
  { code: '+86', name: 'China' },
  { code: '+7', name: 'Russia' },
  { code: '+966', name: 'Saudi Arabia' },
];

const LoadingOverlay = () => (
  <div className="loading-container">
    <div className="loading-overlay" />
    <div className="loading-content">
      <div className="loading-spinner"></div>
      <p>Loading...</p>
    </div>
  </div>
);

const SignUp = () => {
  const [form] = Form.useForm();
  const [userLoginState, setUserLoginState] = useState({});
  const [promoCode, setPromo] = useState('0');
  const [declarationChecked, setDeclarationChecked] = useState(false);
  const [showDeclarationError, setShowDeclarationError] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { initialState, setInitialState } = useModel('@@initialState');

  const LoginMessage = ({ content }) => (
    <Alert style={{ marginBottom: 24 }} message={content} type="error" showIcon />
  );

  // Background theme
  useEffect(() => {
    document.body.style.minHeight = "100vh";
    document.body.style.width = "100vw";
    document.body.style.overflow = "hidden";

    const checkAndHandleParams = async () => {
      setIsProcessing(true);
      const urlSearchParams = new URLSearchParams(window.location.search);
      const promoParam = urlSearchParams.get('promo');
      const tokenParam = urlSearchParams.get('token');

      if (promoParam) {
        setPromo(promoParam);
        form.setFieldsValue({ promo: promoParam });
      }
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
        } catch {
          sessionStorage.removeItem('jwtToken');
          updateAPIToken();
        }
      }
      setIsProcessing(false);
    };
    checkAndHandleParams();

    return () => {
      document.body.style.background = '';
      document.body.style.minHeight = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
    };
    // eslint-disable-next-line
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
    if (!declarationChecked) {
      setShowDeclarationError(true);
      setIsProcessing(false);
      return;
    }
    try {
      const msg = await api.app.postSignUp(values);
      if (msg.message && msg.message.startsWith('Registration successful')) {
        message.success({
          content: msg.message,
          icon: <span className="orange-success-icon"> ✓ </span>,
          className: 'orange-success-notification',
          duration: 3,
          style: { color: '#6a5cff' },
        });
        history.push('/user/login');
      } else if (msg.message === 'Sign Up failed DuplicateUserName') {
        message.error({
          content: 'User with this email already exists. Please use a different email or try to sign in.',
          icon: <span className="orange-error-icon"> ✘ </span>,
          className: 'orange-error-notification',
          duration: 3,
        });
      } else {
        message.error({
          content: 'User with this email already exists.',
          icon: <span className="orange-error-icon"> ✘ </span>,
          className: 'orange-error-notification',
          duration: 3,
        });
        setUserLoginState({
          status: 'signUpError',
          type: 'signup',
          currentAuthority: 'guest',
        });
      }
    } catch {
      message.error({
        content: 'An error occurred while signing up. Please try again later.',
        icon: <span className="orange-error-icon"> ✘ </span>,
        className: 'orange-error-notification',
        duration: 3,
      });
      setUserLoginState({
        status: 'signUpError',
        type: 'signup',
        currentAuthority: 'guest',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (isProcessing) return <LoadingOverlay />;

  return (
    <div className="signup-page">
      <div className="signup-card">
        {/* Left – Logo */}
        <div className="signup-left">
          <img src="/images/Cosmomarkets .png" alt="Logo" />
        </div>

        {/* Right – Form */}
        <div className="signup-right">
          <h2 className="signup-title">Sign Up</h2>

          <Form
            form={form}
            name="signupForm"
            initialValues={{
              autoLogin: true,
              promo: promoCode,
            }}
            onFinish={handleSubmit}
            layout="vertical"
            className="signup-form"
            requiredMark={false}
          >
            <div className="name-row">
              <Form.Item
                label="First Name"
                name="firstName"
                normalize={(value) =>
                  value ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase() : ''
                }
                rules={[
                  { required: true, message: 'Please enter First Name' },
                  { min: 3, message: 'First Name must be at least 3 characters' },
                  { pattern: /^[a-zA-Z\s.-]*$/, message: 'Please enter valid characters only.' },
                ]}
                className="name-input"
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="First Name"
                  size="large"
                  className="signup-input"
                />
              </Form.Item>
              <Form.Item
                label="Last Name"
                name="lastName"
                normalize={(value) =>
                  value ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase() : ''
                }
                rules={[
                  { required: true, message: 'Please enter Last Name' },
                  { min: 3, message: 'Last Name must be at least 3 characters' },
                  { pattern: /^[a-zA-Z\s.-]*$/, message: 'Please enter valid characters only' },
                ]}
                className="name-input"
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="Last Name"
                  size="large"
                  className="signup-input"
                />
              </Form.Item>
            </div>

            <Form.Item
              label="Email Address"
              name="email"
              rules={[
                { required: true, message: 'Please enter email address!' },
                { type: 'email', message: 'Invalid email format' },
              ]}
            >
              <Input
                prefix={<MailOutlined />}
                placeholder="Email address"
                size="large"
                className="signup-input"
              />
            </Form.Item>

            <Form.Item
              label="Phone Number"
              name="phone"
              rules={[
                { required: true, message: 'Please enter phone number with country code' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (value && value.length >= 7) {
                      return Promise.resolve();
                    }
                    return Promise.reject('Phone number must be at least 7 digits');
                  },
                }),
              ]}
            >
              <PhoneInput
                country="ae"
                inputStyle={{
                  background: '#f8fafc',
                  border: '1px solid rgba(0,0,0,0.2)',
                  borderRadius: '10px',
                  color: '#2d3748',
                  fontSize: '14px',
                  width: '100%',
                  height: '40px',
                  padding: '10px 16px 10px 55px',
                  transition: 'all 0.3s ease',
                }}
                buttonStyle={{
                  background: '#f8fafc',
                  border: '1px solid rgba(0,0,0,0.2)',
                  borderRadius: '10px 0 0 10px',
                  transition: 'all 0.3s ease',
                }}
                containerStyle={{ width: '100%' }}
                inputProps={{ placeholder: 'Phone number', required: true }}
              />
            </Form.Item>

            <Form.Item
              label="Country"
              name="region"
              rules={[{ required: true, message: 'Please select your country!' }]}
            >
              <Select
                placeholder="Select country"
                size="large"
                className="signup-input"
                dropdownStyle={{
                  background: '#fff',
                  border: '1px solid #e7eafc',
                  borderRadius: '8px',
                }}
              >
                {countryCodes.map((country) => (
                  <Option key={country.code} value={country.name} style={{ color: '#222' }}>
                    {country.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              label="Password"
              name="password"
              rules={[
                { required: true, message: 'Please input your password!' },
                {
                  pattern:
                    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/,
                  message:
                    'Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 digit, 1 special symbol, and be at least 8 characters long!',
                },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Create a strong password"
                size="large"
                className="signup-input"
              />
            </Form.Item>

            <Form.Item
              label="Promo Code"
              name="promo"
              initialValue={promoCode}
              rules={[
                { required: true, message: 'Please enter the promo code of the Introducing Broker!' },
                { pattern: /^[0-9]+$/, message: 'Please enter a valid numeric promo code.' },
              ]}
            >
              <Input
                placeholder="Promo code"
                size="large"
                disabled={promoCode !== '0'}
                className="signup-input"
              />
            </Form.Item>

            <Form.Item>
              <Checkbox
                checked={declarationChecked}
                onChange={(e) => {
                  setDeclarationChecked(e.target.checked);
                  setShowDeclarationError(false);
                }}
                className="terms-checkbox"
              >
                <span className="checkbox-text">
                  I declare and confirm that I accept all{' '}
                  <a
                    href=" https://cosmomarkets.com/terms-and-agreements/"
                    target="blank"
                    className="terms-link"
                  >
                    Terms & Conditions
                  </a>{' '}
                  of Mevora Capital.
                </span>
              </Checkbox>
              {showDeclarationError && (
                <div className="error-message">Please accept the Terms & Conditions to proceed.</div>
              )}
            </Form.Item>

            {userLoginState.status === 'signUpError' && (
              <LoginMessage content="Failed to signup. Please try again later." />
            )}

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className="signup-submit-button"
                loading={isProcessing}
              >
                Create Account
              </Button>
            </Form.Item>

            <div className="signup-signin-text">
              Already have an account?{' '}
              <a onClick={() => history.push('/user/login')} className="signup-link">
                Sign In
              </a>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default SignUp;