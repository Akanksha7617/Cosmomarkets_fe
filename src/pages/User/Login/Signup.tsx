 import { api, updateAPIToken } from '@/components/common/api';
import { LockOutlined, MailOutlined, UserOutlined } from '@ant-design/icons';
import { history, useModel } from '@umijs/max';
import { Button, Checkbox, Form, Input, message, Modal, Select, Alert } from 'antd';
import { useEffect, useState } from 'react';
import { flushSync } from 'react-dom';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import '../../../common.css';
 
const { Option } = Select;
 
// Updated country codes with ISO2 codes for react-phone-input-2 (from second code)
const countryCodes = [
  { iso2: 'ae', name: 'United Arab Emirates', dialCode: '+971' },
  { iso2: 'us', name: 'USA', dialCode: '+1' },
  { iso2: 'in', name: 'India', dialCode: '+91' },
  { iso2: 'gb', name: 'United Kingdom', dialCode: '+44' },
  { iso2: 'au', name: 'Australia', dialCode: '+61' },
  { iso2: 'fr', name: 'France', dialCode: '+33' },
  { iso2: 'de', name: 'Germany', dialCode: '+49' },
  { iso2: 'jp', name: 'Japan', dialCode: '+81' },
  { iso2: 'cn', name: 'China', dialCode: '+86' },
  { iso2: 'ru', name: 'Russia', dialCode: '+7' },
  { iso2: 'sa', name: 'Saudi Arabia', dialCode: '+966' },
  { iso2: 'pk', name: 'Pakistan', dialCode: '+92' },
];
 
const SignUp = () => {
  const [form] = Form.useForm();
  const [userLoginState, setUserLoginState] = useState({});
  const [promoCode, setPromo] = useState('0');
  const [declarationChecked, setDeclarationChecked] = useState(false);
  const [showDeclarationError, setShowDeclarationError] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('ae');
  const { initialState, setInitialState } = useModel('@@initialState');
 
  // LoginMessage component from second code
  const LoginMessage = ({ content }) => (
    <Alert style={{ marginBottom: 24 }} message={content} type="error" showIcon />
  );
 
  // handleCountryChange from second code
  const handleCountryChange = (value) => {
    const country = countryCodes.find((c) => c.name === value);
    if (country) setSelectedCountry(country.iso2);
  };
 
  useEffect(() => {
    // Background theme from second code
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
        } catch (error) {
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
        const match = msg.message.match(/MT5 user:\s*(\d+)/);
        const mt5Number = match ? match[1] : null;
 
        // Stop processing state to show message on current page
        setIsProcessing(false);
 
        // Show success message on sign-up page
        message.success({
          content: (
            <div>
              <div>{msg.message.split('MT5 user:')[0]}</div>
              {mt5Number && (
                <div>
                  <strong>MT5 User :</strong> {mt5Number}
                </div>
              )}
            </div>
          ),
          icon: <span className="orange-success-icon">✓</span>,
          className: 'orange-success-notification',
          duration: 4,
          style: { color: '#6a5cff' },
        });
 
        // Redirect after message duration + small buffer
        setTimeout(() => {
          history.push('/user/login');
        }, 4500);
      } else if (msg.message === 'Sign Up failed DuplicateUserName') {
        setIsProcessing(false);
        message.error({
          content:
            'User with this email already exists. Please use a different email or try to sign in.',
          icon: <span className="orange-error-icon">✘</span>,
          className: 'orange-error-notification',
          duration: 3,
        });
      } else {
        setIsProcessing(false);
        message.error({
          content: 'User with this email already exists.',
          icon: <span className="orange-error-icon">✘</span>,
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
      setIsProcessing(false);
      message.error({
        content: 'An error occurred while signing up. Please try again later.',
        icon: <span className="orange-error-icon">✘</span>,
        className: 'orange-error-notification',
        duration: 3,
      });
      setUserLoginState({
        status: 'signUpError',
        type: 'signup',
        currentAuthority: 'guest',
      });
    }
  };
 
  if (isProcessing) {
    return (
      <div className="loading-container">
        <div className="loading-overlay" />
        <div className="loading-content">
          <div className="loading-spinner" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }
 
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
            {/* Name fields */}
            <div className="name-row">
              {/* First Name */}
              <Form.Item
                label="First Name"
                name="firstName"
                className="name-input"
                normalize={(value) => {
                  if (!value) return '';
                  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
                }}
                rules={[
                  { required: true, message: 'Please enter First Name' },
                  { min: 2, message: 'First Name must be at least 2 characters' },
                  { max: 50, message: 'First Name must not exceed 50 characters' },
                  {
                    pattern: /^[a-zA-Z\s]*$/,
                    message: 'First Name must contain only letters and spaces',
                  },
                  {
                    validator: (_, value) => {
                      if (!value) return Promise.resolve();
                      if (value.trim().length === 0) {
                        return Promise.reject(
                          'First Name cannot be empty or contain only spaces',
                        );
                      }
                      if (/\s{2,}/.test(value)) {
                        return Promise.reject('First Name cannot contain consecutive spaces');
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="First Name"
                  size="large"
                />
              </Form.Item>
 
              {/* Last Name */}
              <Form.Item
                label="Last Name"
                name="lastName"
                className="name-input"
                normalize={(value) => {
                  if (!value) return '';
                  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
                }}
                rules={[
                  { required: true, message: 'Please enter Last Name' },
                  { min: 2, message: 'Last Name must be at least 2 characters' },
                  { max: 50, message: 'Last Name must not exceed 50 characters' },
                  {
                    pattern: /^[a-zA-Z\s]*$/,
                    message: 'Last Name must contain only letters and spaces',
                  },
                  {
                    validator: (_, value) => {
                      if (!value) return Promise.resolve();
                      if (value.trim().length === 0) {
                        return Promise.reject('Last Name cannot be empty or contain only spaces');
                      }
                      if (/\s{2,}/.test(value)) {
                        return Promise.reject('Last Name cannot contain consecutive spaces');
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="Last Name"
                  size="large"
                />
              </Form.Item>
            </div>
 
            {/* Country */}
            <Form.Item
              label="Country"
              name="region"
              rules={[{ required: true, message: 'Please select your country!' }]}
            >
              <Select placeholder="Select country" size="large" onChange={handleCountryChange}>
                {countryCodes.map((country) => (
                  <Option key={country.iso2} value={country.name}>
                    {country.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
 
            {/* Phone */}
            <Form.Item
              label="Phone Number"
              name="phone"
              rules={[
                {
                  required: true,
                  message: 'Please enter phone number with country code',
                },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (value && value.length >= 7) {
                      return Promise.resolve();
                    }
                    return Promise.reject();
                  },
                }),
              ]}
            >
              <PhoneInput
                country={selectedCountry}
                inputStyle={{
                  width: '100%',
                  borderRadius: 5,
                  fontWeight: 'bold',
                  color: 'rgb(141, 140, 140)',
                  border: '1px solid #b7b3b3)',
                }}
                inputProps={{ placeholder: 'Phone number', required: true }}
              />
            </Form.Item>
 
            {/* Email */}
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
              />
            </Form.Item>
 
            {/* Password */}
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
              />
            </Form.Item>
 
            {/* Promo */}
            <Form.Item
              label="Promo Code"
              name="promo"
              initialValue={promoCode}
              rules={[
                {
                  required: true,
                  message: 'Please enter the promo code of the Introducing Broker!',
                },
                {
                  pattern: /^[0-9]+$/,
                  message: 'Please enter a valid numeric promo code.',
                },
              ]}
            >
              <Input
                placeholder="Promo code"
                size="large"
                disabled={promoCode !== '0'}
              />
            </Form.Item>
 
            {/* Terms */}
            <Form.Item className="terms-container">
              <Checkbox
                checked={declarationChecked}
                onChange={(e) => {
                  setDeclarationChecked(e.target.checked);
                  setShowDeclarationError(false);
                }}
              >
                <span className="terms-text">
                  I declare and confirm that I accept all{' '}
                  <a
                    href=" https://cosmomarkets.com/terms-and-agreements/"
                    target="blank"
                    className="terms-link"
                  >
                    Terms & Conditions
                  </a>{' '}
                  of iQease.
                </span>
              </Checkbox>
            </Form.Item>
 
            {userLoginState.status === 'signUpError' && (
              <LoginMessage content="Failed to signup. Please try again later." />
            )}
 
            {/* Submit */}
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={isProcessing}
                block
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
 
      <Modal
        title="Action Required"
        open={showDeclarationError}
        onCancel={() => setShowDeclarationError(false)}
        footer={[
          <Button key="ok" type="primary" onClick={() => setShowDeclarationError(false)}>
            OK
          </Button>,
        ]}
      >
        <p>Please check the declaration checkbox to proceed with signup.</p>
      </Modal>
    </div>
  );
};
 
export default SignUp;