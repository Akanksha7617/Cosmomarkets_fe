import { api, updateAPIToken } from '@/components/common/api';
import { LockOutlined, MailOutlined, UserOutlined } from '@ant-design/icons';
import { history, useModel } from '@umijs/max';
import { Alert, Button, Checkbox, Form, Input, message, Modal, Select } from 'antd';
import { useEffect, useState } from 'react';
import { flushSync } from 'react-dom';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import '../../../common.css';

const { Option } = Select;

// Country codes mapping
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

const SignUp = () => {
  // State management
  const [userLoginState, setUserLoginState] = useState({});
  const [promoCode, setPromo] = useState('0');
  const [declarationChecked, setDeclarationChecked] = useState(false);
  const [showDeclarationError, setShowDeclarationError] = useState(false);
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

  // Check for URL parameters
  useEffect(() => {
    const checkAndHandleParams = async () => {
      setIsProcessing(true);

      const urlSearchParams = new URLSearchParams(window.location.search);
      const promoParam = urlSearchParams.get('promo');
      const tokenParam = urlSearchParams.get('token');

      if (promoParam) {
        setPromo(promoParam);
      }

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

    checkAndHandleParams();
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

    // Sign up logic
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
        });
        history.push('/user/login');
      } else if (msg.message === 'Sign Up failed DuplicateUserName') {
        message.error({
          content:
            'User with this email already exists. Please use a different email or try to sign in.',
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
    } catch (error) {
      console.error('Signup error:', error);
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

  // Show loading state while processing
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
          <img src="/images/logo.png" alt="logo" style={{ height: '56px', width: '197px' }} />
        </div>
        <div className="nav-buttons">
          <Button type="default" ghost onClick={() => history.push('/user/login')}>
            Log In
          </Button>
          <Button type="primary" onClick={() => history.push('/user/signup')}>
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
                    promo: promoCode,
                  }}
                  onFinish={handleSubmit}
                  layout="vertical"
                >
                  <div className="name-row">
                    <Form.Item
                      label="First Name"
                      name="firstName"
                      normalize={(value) => {
                        if (!value) return '';
                        return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
                      }}
                      rules={[
                        { required: true, message: 'Please enter FirstName' },
                        { min: 3, message: 'FirstName must be at least 3 characters' },
                        {
                          pattern: /^[a-zA-Z0-9. _]*$/,
                          message: 'Please enter valid characters only.',
                        },
                        {
                          validator: (_, value) => {
                            if (!value) return Promise.resolve();

                            const isCapitalized =
                              value.charAt(0) === value.charAt(0).toUpperCase() &&
                              value.slice(1) === value.slice(1).toLowerCase();

                            if (!isCapitalized) {
                              return Promise.resolve();
                            }
                            return Promise.resolve();
                          },
                        },
                      ]}
                    >
                      <Input
                        prefix={<UserOutlined className="form-icon" />}
                        placeholder="First Name"
                        size="large"
                      />
                    </Form.Item>
                    <Form.Item
                      label="Last Name"
                      name="lastName"
                      normalize={(value) => {
                        if (!value) return '';
                        return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
                      }}
                      rules={[
                        { required: true, message: 'Please enter LastName' },
                        { min: 3, message: 'Last Name must be at least 3 characters' },
                        {
                          pattern: /^[a-zA-Z0-9. _]*$/,
                          message: 'Please enter valid characters only',
                        },
                        {
                          validator: (_, value) => {
                            if (!value) return Promise.resolve();

                            const isCapitalized =
                              value.charAt(0) === value.charAt(0).toUpperCase() &&
                              value.slice(1) === value.slice(1).toLowerCase();

                            if (!isCapitalized) {
                              return Promise.resolve();
                            }
                            return Promise.resolve();
                          },
                        },
                      ]}
                    >
                      <Input
                        prefix={<UserOutlined className="form-icon" />}
                        placeholder="Last Name"
                        size="large"
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
                      prefix={<MailOutlined className="form-icon" />}
                      placeholder="Email address"
                      size="large"
                    />
                  </Form.Item>

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
                          return Promise.reject('Phone number must be at least 7 digits');
                        },
                      }),
                    ]}
                  >
                    <PhoneInput
                      country="ae"
                      inputClass="phone-input"
                      buttonClass="phone-dropdown"
                      containerClass="phone-container"
                      inputProps={{ placeholder: 'Phone number', required: true }}
                    />
                  </Form.Item>

                  <Form.Item
                    label="Country"
                    name="region"
                    rules={[{ required: true, message: 'Please select your country!' }]}
                  >
                    <Select placeholder="Select country" size="large" className="white-text-select">
                      {countryCodes.map((country) => (
                        <Option key={country.code} value={country.name}>
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
                      prefix={<LockOutlined className="form-icon" />}
                      placeholder="Create a strong password"
                      size="large"
                    />
                  </Form.Item>

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
                    <Input placeholder="Promo code" size="large" disabled={promoCode !== '0'} />
                  </Form.Item>

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
                          href="https://xyleum.com/terms-and-conditions/"
                          target="blank"
                          className="terms-link"
                        >
                          Terms & Conditions
                        </a>{' '}
                        of Xyleum Technologies Limited.
                      </span>
                    </Checkbox>
                  </Form.Item>

                  {userLoginState.status === 'signUpError' && (
                    <LoginMessage content="Failed to signup. Please try again later." />
                  )}

                  <Form.Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                      className="submit-button"
                      loading={isProcessing}
                    >
                      Create Account
                    </Button>
                  </Form.Item>

                  <div className="bottom-text">
                    <span>
                      Already have an account?{' '}
                      <a onClick={() => history.push('/user/login')}>Signin</a>
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

      {/* Declaration Error Modal */}
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
