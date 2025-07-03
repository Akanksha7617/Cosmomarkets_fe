import { api, updateAPIToken } from '@/components/common/api';
import { LockOutlined, MailOutlined, UserOutlined } from '@ant-design/icons';
import { history, useModel } from '@umijs/max';
import { Alert, Button, Checkbox, Form, Input, message, Select } from 'antd';
import { useEffect, useState } from 'react';
import { flushSync } from 'react-dom';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

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
  { code: '+966', name: 'Saudi Arabia' }
];

const SignUp = () => {
  const [userLoginState, setUserLoginState] = useState({});
  const [promoCode, setPromo] = useState('0');
  const [declarationChecked, setDeclarationChecked] = useState(false);
  const [showDeclarationError, setShowDeclarationError] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { initialState, setInitialState } = useModel('@@initialState');

  const LoginMessage = ({ content }) => (
    <Alert style={{ marginBottom: 24 }} message={content} type="error" showIcon />
  );

  useEffect(() => {
    const checkAndHandleParams = async () => {
      setIsProcessing(true);
      const urlSearchParams = new URLSearchParams(window.location.search);
      const promoParam = urlSearchParams.get('promo');
      const tokenParam = urlSearchParams.get('token');
      if (promoParam) setPromo(promoParam);
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
          style: { color: '#6a5cff' }
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

  if (isProcessing) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: `url('/images/hd.png') center center / cover no-repeat`,
        color: '#fff',
        position: 'relative'
      }}>
        {/* Overlay */}
        <div style={{
          position: 'fixed',
          top: 0, left: 0, width: '130vw', height: '130vh',
          background: 'linear-gradient(120deg, rgba(10,29,62,0.10) 60%, rgba(14,62,138,0.06) 100%)',
          zIndex: 2,
          pointerEvents: 'none'
        }} />
        <div style={{ textAlign: 'center', zIndex: 3 }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #8D40FF',
            borderTop: '4px solid transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
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
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        background: `url('/images/hd.png') center center / cover no-repeat`,
        display: 'flex',
        alignItems: 'center',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        position: 'relative',
        justifyContent: 'flex-start'
      }}
    >
      {/* Overlay for better contrast */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'linear-gradient(120deg, rgba(255,255,255,0.05) 0%, rgba(240,248,255,0.08) 100%)',
          zIndex: 1,
          pointerEvents: 'none'
        }}
      />
      <div
        style={{
          width: '410px', // increased width
          minHeight: 'auto',
          background: '#fff',
          borderRadius: '24px',
          boxShadow: '0 12px 40px 0 rgba(0,0,0,0.10), 0 2px 8px 0 rgba(0,0,0,0.16)',
          overflow: 'hidden',
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginLeft: '85px', // move card to left, adjust as needed
          marginTop: '0',
          marginBottom: '0'
        }}
      >
        {/* Card Header with Gradient and Logo */}
        <div style={{
          width: '100%',
          height: 70, // reduced header height
          background: 'linear-gradient(135deg, #6a5cff 0%, #7f53ac 100%)',
          borderTopLeftRadius: '24px',
          borderTopRightRadius: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative'
        }}>
          <img
            src="/images/Mevora_Capital.png"
            alt="Mevora Capital"
            style={{
              width: 140, // larger logo
              height: 140,
              objectFit: 'contain',
              display: 'block'
            }}
          />
        </div>
        {/* Form Section */}
        <div style={{
          background: 'transparent',
          borderRadius: '0 0 24px 24px',
          padding: '16px 28px 16px 28px', // reduced padding for less height
          width: '100%',
          boxSizing: 'border-box'
        }}>
          <Form
            name="auth_form"
            initialValues={{
              autoLogin: true,
              promo: promoCode,
            }}
            onFinish={handleSubmit}
            layout="vertical"
            requiredMark={false}
          >
            <div style={{ display: 'flex', gap: '12px' }}>
              <Form.Item
                label={<span style={{ color: '#6a5cff', fontWeight: 500 }}>First Name</span>}
                name="firstName"
                normalize={(value) => value ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase() : ''}
                rules={[
                  { required: true, message: 'Please enter FirstName' },
                  { min: 3, message: 'FirstName must be at least 3 characters' },
                  { pattern: /^[a-zA-Z0-9. _]*$/, message: 'Please enter valid characters only.' },
                ]}
                style={{ flex: 1 }}
              >
                <Input
                  prefix={<UserOutlined style={{ color: '#6a5cff' }} />}
                  placeholder="First Name"
                  size="large"
                  style={{
                    backgroundColor: '#fff',
                    border: '1px solid #e7eafc',
                    borderRadius: '12px',
                    color: '#222',
                    fontSize: '15px'
                  }}
                />
              </Form.Item>
              <Form.Item
                label={<span style={{ color: '#6a5cff', fontWeight: 500 }}>Last Name</span>}
                name="lastName"
                normalize={(value) => value ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase() : ''}
                rules={[
                  { required: true, message: 'Please enter LastName' },
                  { min: 3, message: 'Last Name must be at least 3 characters' },
                  { pattern: /^[a-zA-Z0-9. _]*$/, message: 'Please enter valid characters only' },
                ]}
                style={{ flex: 1 }}
              >
                <Input
                  prefix={<UserOutlined style={{ color: '#6a5cff' }} />}
                  placeholder="Last Name"
                  size="large"
                  style={{
                    backgroundColor: '#fff',
                    border: '1px solid #e7eafc',
                    borderRadius: '12px',
                    color: '#222',
                    fontSize: '15px'
                  }}
                />
              </Form.Item>
            </div>
            <Form.Item
              label={<span style={{ color: '#6a5cff', fontWeight: 500 }}>Email Address</span>}
              name="email"
              rules={[
                { required: true, message: 'Please enter email address!' },
                { type: 'email', message: 'Invalid email format' },
              ]}
            >
              <Input
                prefix={<MailOutlined style={{ color: '#6a5cff' }} />}
                placeholder="Email address"
                size="large"
                style={{
                  backgroundColor: '#fff',
                  border: '1px solid #e7eafc',
                  borderRadius: '12px',
                  color: '#222',
                  fontSize: '15px'
                }}
              />
            </Form.Item>
            <Form.Item
              label={<span style={{ color: '#6a5cff', fontWeight: 500 }}>Phone Number</span>}
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
                  background: '#fff',
                  border: '1px solid #e7eafc',
                  borderRadius: '12px',
                  color: '#222',
                  fontSize: '15px',
                  width: '100%',
                  height: '40px'
                }}
                buttonStyle={{
                  background: '#fff',
                  border: '1px solid #e7eafc',
                  borderRadius: '12px 0 0 12px'
                }}
                containerStyle={{ width: '100%' }}
                inputProps={{ placeholder: 'Phone number', required: true }}
              />
            </Form.Item>
            <Form.Item
              label={<span style={{ color: '#6a5cff', fontWeight: 500 }}>Country</span>}
              name="region"
              rules={[{ required: true, message: 'Please select your country!' }]}
            >
              <Select
                placeholder="Select country"
                size="large"
                style={{
                  borderRadius: '12px',
                  background: '#fff',
                  color: '#222'
                }}
                dropdownStyle={{
                  background: '#fff',
                  border: '1px solid #e7eafc'
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
              label={<span style={{ color: '#6a5cff', fontWeight: 500 }}>Password</span>}
              name="password"
              rules={[
                { required: true, message: 'Please input your password!' },
                {
                  pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/,
                  message: 'Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 digit, 1 special symbol, and be at least 8 characters long!',
                },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: '#6a5cff' }} />}
                placeholder="Create a strong password"
                size="large"
                style={{
                  backgroundColor: '#fff',
                  border: '1px solid #e7eafc',
                  borderRadius: '12px',
                  color: '#222',
                  fontSize: '15px'
                }}
              />
            </Form.Item>
            <Form.Item
              label={<span style={{ color: '#6a5cff', fontWeight: 500 }}>Promo Code</span>}
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
                style={{
                  backgroundColor: '#fff',
                  border: '1px solid #e7eafc',
                  borderRadius: '12px',
                  color: '#222',
                  fontSize: '15px'
                }}
              />
            </Form.Item>
            <Form.Item style={{ marginBottom: '16px' }}>
              <Checkbox
                checked={declarationChecked}
                onChange={(e) => {
                  setDeclarationChecked(e.target.checked);
                  setShowDeclarationError(false);
                }}
                style={{ color: '#6a5cff' }}
              >
                <span style={{ color: '#6a5cff', fontSize: '14px' }}>
                  I declare and confirm that I accept all{' '}
                  <a
                    href="https://xyleum.com/terms-and-conditions/"
                    target="blank"
                    style={{ color: '#ff6ec7', textDecoration: 'underline' }}
                  >
                    Terms & Conditions
                  </a>{' '}
                  of Xyleum Technologies Limited.
                </span>
              </Checkbox>
              {showDeclarationError && (
                <div style={{ color: '#ff8a95', marginTop: '8px' }}>
                  Please accept the Terms & Conditions to proceed.
                </div>
              )}
            </Form.Item>
            {userLoginState.status === 'signUpError' && (
              <LoginMessage content="Failed to signup. Please try again later." />
            )}
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={isProcessing}
                size="large"
                style={{
                  background: 'linear-gradient(90deg, #6a5cff 0%, #7f53ac 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  color: '#fff',
                  fontWeight: '600',
                  fontSize: '17px',
                  height: '48px',
                  width: '100%',
                  boxShadow: '0 8px 25px rgba(62,215,199,0.12)',
                  margin: '0 auto',
                  display: 'block'
                }}
                className="login-button"
              >
                Create Account
              </Button>
            </Form.Item>
            <div style={{
              textAlign: 'center',
              marginTop: '10px',
              color: '#6a5cff',
              fontSize: '14px'
            }}>
              <span>
                Already have an account?{' '}
                <a
                  onClick={() => history.push('/user/login')}
                  style={{
                    color: '#6a5cff',
                    fontWeight: '600',
                    cursor: 'pointer',
                    textDecoration: 'none'
                  }}
                >
                  Sign In
                </a>
              </span>
            </div>
          </Form>
        </div>
      </div>
      <style>{`
        .ant-input::placeholder,
        .ant-input-password input::placeholder {
          color: #b0aefd !important;
        }
        .ant-form-item-explain-error {
          color: #ff8a95 !important;
        }
        .ant-checkbox-wrapper {
          color: #6a5cff !important;
        }
        .ant-checkbox-checked .ant-checkbox-inner {
          background-color: #6a5cff !important;
          border-color: #6a5cff !important;
        }
        .ant-select-selector {
          background: #fff !important;
          border: 1px solid #e7eafc !important;
          border-radius: 12px !important;
          color: #222 !important;
        }
        .ant-select-selection-placeholder {
          color: #b0aefd !important;
        }
      `}</style>
    </div>
  );
};

export default SignUp;
