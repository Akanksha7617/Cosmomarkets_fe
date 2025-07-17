// code 1

import { api, updateAPIToken } from '@/components/common/api';
import { LockOutlined, MailOutlined, UserOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { history, useModel } from '@umijs/max';
import { Alert, Button, Checkbox, Form, Input, message, Select } from 'antd';
import { useEffect, useState } from 'react';
import { flushSync } from 'react-dom';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import '../../../common.css'; // Assuming this file has global styles like orange-success-icon etc.

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

  useEffect(() => {
    // Set background image on body for full bleed, matching login page
    document.body.style.background = `url('/images/hd.png') center center / cover no-repeat`;
    document.body.style.minHeight = '100vh';
    document.body.style.width = '100vw';
    document.body.style.overflow = 'hidden';

    const checkAndHandleParams = async () => {
      setIsProcessing(true);
      const urlSearchParams = new URLSearchParams(window.location.search);
      const promoParam = urlSearchParams.get('promo');
      const tokenParam = urlSearchParams.get('token');
     
    if (promoParam) {
      setPromo(promoParam);
      // Add this line to update the form field immediately
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
      // Clean up body styles on component unmount
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
        color: 'white',
        position: 'relative'
      }}>
        {/* Overlay */}
        <div style={{
          position: 'fixed',
          top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'linear-gradient(120deg, rgba(10,29,62,0.10) 60%, rgba(14,62,138,0.06) 100%)',
          zIndex: 2,
          pointerEvents: 'none'
        }} />
        {/* Loader */}
        <div style={{ textAlign: 'center', zIndex: 3, position: 'relative' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid rgba(255,255,255,0.3)',
            borderTop: '4px solid #ff6ec7', // Using a color from login page
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
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        overflow: 'hidden',
        position: 'relative',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* Overlay for better contrast, matching login page */}
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
          position: 'absolute',
          top: '50%',
          left: '30%', // Shifted to left
          transform: 'translate(-45%, -48%)', // Adjust to center the card based on new left
          width: '90%',
          maxWidth: '350px', // Fixed max-width for consistency
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '24px',
          padding: '0',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15), 0 8px 25px rgba(0, 0, 0, 0.08)',
          overflow: 'hidden', // Ensures scrollbar is inside
          backdropFilter: 'blur(20px)',
          zIndex: 3,
          border: '1px solid rgba(255, 255, 255, 0.3)'
        }}
      >
        {/* Card Header with Gradient and Logo, matching login page */}
        <div style={{
          position: 'relative',
          height: '140px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', // Login page gradient
          borderRadius: '24px 24px 0 0',
          overflow: 'hidden'
        }}>
          {/* Logo */}
          <div style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'absolute',
            top: '50%',
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
          {/* Back Arrow - added from login page */}
          <div style={{
            padding: '16px 20px',
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
            }} onClick={() => history.push('/user/login')} /> {/* Link back to login */}
          </div>
          {/* Decorative Elements (from login page) */}
          <div style={{
            position: 'absolute',
            top: '-(-50px)',
            right: '-50px',
            width: '100px',
            height: '100px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '50%'
          }}></div>
          <div style={{
            position: 'absolute',
            bottom: '-30px',
            left: '-30px',
            width: '60px',
            height: '60px',
            background: 'rgba(255, 255, 255, 0.08)',
            borderRadius: '50%'
          }}></div>
          {/* SVG Curve at Bottom (from login page) */}
          <svg
            viewBox="0 0 350 40"
            width="100%"
            height="40"
            style={{
              position: 'absolute',
              bottom: '-1px',
              left: 0,
              zIndex: 5,
              display: 'block'
            }}
            preserveAspectRatio="none"
          >
            <path
              d="M0,0 C80,40 270,40 350,0 L350,40 L0,40 Z"
              fill="rgba(255, 255, 255, 0.95)" // Match card background color
              fillOpacity="1"
            />
          </svg>
        </div>

        {/* Form Section with internal scroll */}
        <div style={{
          padding: '20px 24px 24px', // Reduced top padding for more compact form
          position: 'relative',
          zIndex: 1,
          maxHeight: '400px', // Fixed height for scrollable form area
          overflowY: 'auto'
        }}>
          <Form
           form={form}
            name="auth_form"
            initialValues={{
              autoLogin: true,
              promo: promoCode,
            }}
            onFinish={handleSubmit}
            layout="vertical"
            requiredMark={false}
          >
            <div style={{ display: 'flex', gap: '8px' }}>
              <Form.Item
                label={<span style={{ color: '#4a5568', fontWeight: 600, fontSize: '14px' }}>First Name</span>}
                name="firstName"
                normalize={(value) => value ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase() : ''}
                rules={[
                  { required: true, message: 'Please enter First Name' },
                  { min: 3, message: 'First Name must be at least 3 characters' },
                  { pattern: /^[a-zA-Z\s.-]*$/, message: 'Please enter valid characters only.' },
                ]}
                style={{ flex: 1, marginBottom: '20px' }}
              >
                <Input
                  prefix={<UserOutlined style={{ color: '#667eea' }} />} // Login page icon color
                  placeholder="First Name"
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
              </Form.Item>
              <Form.Item
                label={<span style={{ color: '#4a5568', fontWeight: 600, fontSize: '14px' }}>Last Name</span>}
                name="lastName"
                normalize={(value) => value ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase() : ''}
                rules={[
                  { required: true, message: 'Please enter Last Name' },
                  { min: 3, message: 'Last Name must be at least 3 characters' },
                  { pattern: /^[a-zA-Z\s.-]*$/, message: 'Please enter valid characters only' },
                ]}
                style={{ flex: 1, marginBottom: '20px' }}
              >
                <Input
                  prefix={<UserOutlined style={{ color: '#667eea' }} />}
                  placeholder="Last Name"
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
              </Form.Item>
            </div>
            <Form.Item
              label={<span style={{ color: '#4a5568', fontWeight: 600, fontSize: '14px' }}>Email Address</span>}
              name="email"
              rules={[
                { required: true, message: 'Please enter email address!' },
                { type: 'email', message: 'Invalid email format' },
              ]}
              style={{ marginBottom: '20px' }}
            >
              <Input
                prefix={<MailOutlined style={{ color: '#667eea' }} />}
                placeholder="Email address"
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
            </Form.Item>
            <Form.Item
              label={<span style={{ color: '#4a5568', fontWeight: 600, fontSize: '14px' }}>Phone Number</span>}
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
              style={{ marginBottom: '20px' }}
            >
              <PhoneInput
                country="ae"
                inputStyle={{
                  background: '#f8fafc',
                  border: '2px solid #e2e8f0',
                  borderRadius: '12px',
                  color: '#2d3748',
                  fontSize: '15px',
                  width: '100%',
                  height: '48px', // Match Ant Design Input height
                  padding: '12px 16px 12px 55px', // Adjust padding for country code
                  transition: 'all 0.3s ease'
                }}
                buttonStyle={{
                  background: '#f8fafc',
                  border: '2px solid #e2e8f0',
                  borderRadius: '12px 0 0 12px',
                  transition: 'all 0.3s ease'
                }}
                containerStyle={{ width: '100%' }}
                inputProps={{ placeholder: 'Phone number', required: true }}
              />
            </Form.Item>
            <Form.Item
              label={<span style={{ color: '#4a5568', fontWeight: 600, fontSize: '14px' }}>Country</span>}
              name="region"
              rules={[{ required: true, message: 'Please select your country!' }]}
              style={{ marginBottom: '20px' }}
            >
              <Select
                placeholder="Select country"
                size="large"
                style={{
                  borderRadius: '12px',
                  background: '#f8fafc',
                  border: '2px solid #e2e8f0',
                  color: '#2d3748',
                  height: '48px'
                }}
                className="custom-light-select" // Added for consistent styling
                dropdownStyle={{
                  background: '#fff',
                  border: '1px solid #e7eafc',
                  borderRadius: '8px'
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
              label={<span style={{ color: '#4a5568', fontWeight: 600, fontSize: '14px' }}>Password</span>}
              name="password"
              rules={[
                { required: true, message: 'Please input your password!' },
                {
                  pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/,
                  message: 'Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 digit, 1 special symbol, and be at least 8 characters long!',
                },
              ]}
              style={{ marginBottom: '20px' }}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: '#667eea' }} />}
                placeholder="Create a strong password"
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
            </Form.Item>
            <Form.Item
              label={<span style={{ color: '#4a5568', fontWeight: 600, fontSize: '14px' }}>Promo Code</span>}
              name="promo"
              initialValue={promoCode}
              rules={[
                { required: true, message: 'Please enter the promo code of the Introducing Broker!' },
                { pattern: /^[0-9]+$/, message: 'Please enter a valid numeric promo code.' },
              ]}
              style={{ marginBottom: '20px' }}
            >
              <Input
                placeholder="Promo code"
                size="large"
                disabled={promoCode !== '0'}
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
            </Form.Item>
            <Form.Item style={{ marginBottom: '16px' }}>
              <Checkbox
                checked={declarationChecked}
                onChange={(e) => {
                  setDeclarationChecked(e.target.checked);
                  setShowDeclarationError(false);
                }}
                style={{ color: '#4a5568' }} // Adjusted color for better contrast
              >
                <span style={{ color: '#4a5568', fontSize: '14px' }}>
                  I declare and confirm that I accept all{' '}
                  <a
                    href="https://xyleum.com/terms-and-conditions/"
                    target="blank"
                    style={{ color: '#667eea', textDecoration: 'underline', fontWeight: 500 }} // Login link color
                  >
                    Terms & Conditions
                  </a>{' '}
                  of Mevora Capital.
                </span>
              </Checkbox>
              {showDeclarationError && (
                <div style={{ color: '#ff4d4f', marginTop: '8px', fontSize: '12px' }}>
                  Please accept the Terms & Conditions to proceed.
                </div>
              )}
            </Form.Item>
            {userLoginState.status === 'signUpError' && (
              <LoginMessage content="Failed to signup. Please try again later." />
            )}
            <Form.Item style={{ marginBottom: '20px' }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={isProcessing}
                size="large"
                style={{
                  width: '100%',
                  height: '48px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', // Login button gradient
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#fff',
                  boxShadow: '0 8px 25px rgba(102, 126, 234, 0.25)', // Login button shadow
                  transition: 'all 0.3s ease'
                }}
                className="light-login-button" // Apply login button hover effects
              >
                Create Account
              </Button>
            </Form.Item>
            <div style={{
              textAlign: 'center',
              color: '#718096', // Login text color
              fontSize: '14px'
            }}>
              <span>
                Already have an account?{' '}
                <a
                  onClick={() => history.push('/user/login')}
                  style={{
                    color: '#667eea', // Login link color
                    fontWeight: '600',
                    cursor: 'pointer',
                    textDecoration: 'none',
                    transition: 'color 0.3s ease'
                  }}
                  className="signup-link" // Apply login link hover effects
                >
                  Sign In
                </a>
              </span>
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

        /* Phone Input specific styling for hover/focus to match custom-light-input */
        .react-phone-input.focused .form-control,
        .react-phone-input .form-control:focus {
          border-color: #667eea !important;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.15) !important;
        }
        .react-phone-input .form-control:hover {
          border-color: #667eea !important;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1) !important;
        }
        .react-phone-input .special-label { /* Hide the floating label for react-phone-input-2 */
          display: none !important;
        }
        .react-phone-input .flag-dropdown.open .selected-flag {
          background: #f8fafc !important; /* Keep background consistent */
          border-color: #667eea !important;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.15) !important;
        }
        .react-phone-input .flag-dropdown.open {
          border-color: #667eea !important;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.15) !important;
        }

        /* Custom Ant Design Select styling to match inputs */
        .custom-light-select .ant-select-selector {
          background-color: #f8fafc !important;
          border: 2px solid #e2e8f0 !important;
          border-radius: 12px !important;
          color: #2d3748 !important;
          height: 48px !important;
          padding: 8px 16px !important; /* Adjust padding to match input */
        }
        .custom-light-select .ant-select-selection-placeholder {
          color: #a0aec0 !important;
          line-height: 32px !important; /* Adjust line-height */
        }
        .custom-light-select:hover .ant-select-selector {
          border-color: #667eea !important;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1) !important;
        }
        .custom-light-select.ant-select-focused .ant-select-selector {
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
        
        .forgot-link:hover { /* This class is not directly used on signup, but kept for consistency if needed */
          color: #5a67d8 !important;
        }
        
        .signup-link:hover {
          color: #5a67d8 !important;
        }

        /* Scrollbar styling for the form section */
        div[style*="overflow-y: auto"]::-webkit-scrollbar {
          width: 6px;
        }
        div[style*="overflow-y: auto"]::-webkit-scrollbar-thumb {
          background: rgba(102, 126, 234, 0.3); /* Match theme color */
          border-radius: 4px;
        }
        div[style*="overflow-y: auto"]::-webkit-scrollbar-track {
          background: transparent;
        }
      `}</style>
    </div>
  );
};

export default SignUp;
