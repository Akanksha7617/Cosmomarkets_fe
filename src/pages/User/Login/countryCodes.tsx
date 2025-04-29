import React, { useState } from 'react';
import { Form, Input, Button, Checkbox, Select, message } from 'antd';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

const { Option } = Select;

const countryCodes = [
  { code: '+1', name: 'United States' },
  { code: '+44', name: 'United Kingdom' },
  { code: '+91', name: 'India' },
  { code: '+86', name: 'China' },
  { code: '+81', name: 'Japan' },
  { code: '+49', name: 'Germany' },
  { code: '+33', name: 'France' },
  { code: '+61', name: 'Australia' },
  { code: '+7', name: 'Russia' },
  { code: '+971', name: 'United Arab Emirates' }
];

const AuthPage = () => {
  const [isSignUp, setIsSignUp] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [form] = Form.useForm();

  const handleSubmit = async (values) => {
    setIsLoading(true);
    try {
      if (isSignUp) {
        // Signup logic
        console.log('Signup values:', values);
        message.success('Account created successfully');
      } else {
        // Signin logic
        console.log('Signin values:', values);
        message.success('Login successful');
      }
    } catch (error) {
      message.error('Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">
          {isSignUp ? 'Create an Account' : 'Sign In'}
        </h2>
        <p className="auth-subtitle">
          {isSignUp 
            ? 'Join us to start trading in the forex market' 
            : 'Welcome back! Please sign in to your account'}
        </p>

        <Form
          form={form}
          className="auth-form"
          layout="vertical"
          onFinish={handleSubmit}
        >
          {isSignUp && (
            <div className="name-grid">
              <Form.Item
                name="firstName"
                rules={[{ 
                  required: true, 
                  message: 'Please enter your first name' 
                }]}
              >
                <Input placeholder="First Name" />
              </Form.Item>

              <Form.Item
                name="lastName"
                rules={[{ 
                  required: true, 
                  message: 'Please enter your last name' 
                }]}
              >
                <Input placeholder="Last Name" />
              </Form.Item>
            </div>
          )}

          <Form.Item
            name="email"
            rules={[
              { 
                required: true, 
                message: 'Please enter your email' 
              },
              { 
                type: 'email', 
                message: 'Please enter a valid email' 
              }
            ]}
          >
            <Input placeholder="Email" />
          </Form.Item>

          {isSignUp && (
            <>
              <Form.Item
                name="phone"
                rules={[{ 
                  required: true, 
                  message: 'Please enter your phone number' 
                }]}
              >
                <PhoneInput
                  country={'us'}
                  inputStyle={{ width: '100%' }}
                  placeholder="+1 (555) 000-0000"
                />
              </Form.Item>

              <Form.Item
                name="country"
                rules={[{ 
                  required: true, 
                  message: 'Please select your country' 
                }]}
              >
                <Select placeholder="Select a country">
                  {countryCodes.map((country) => (
                    <Option key={country.code} value={country.name}>
                      {country.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </>
          )}

          <Form.Item
            name="password"
            rules={[
              { 
                required: true, 
                message: 'Please enter your password' 
              },
              {
                pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                message: 'Password must be strong (8+ chars, uppercase, lowercase, number, symbol)'
              }
            ]}
          >
            <Input.Password placeholder="Password" />
          </Form.Item>

          {isSignUp && (
            <Form.Item
              name="promoCode"
              className="promo-code"
            >
              <Input placeholder="Promo Code (Optional)" />
            </Form.Item>
          )}

          {isSignUp && (
            <Form.Item
              name="termsAcceptance"
              valuePropName="checked"
              rules={[
                {
                  validator: (_, value) =>
                    value 
                      ? Promise.resolve() 
                      : Promise.reject('Please accept the terms and conditions')
                }
              ]}
            >
              <Checkbox>
                I declare and confirm that I accept all terms and conditions
              </Checkbox>
            </Form.Item>
          )}

          {!isSignUp && (
            <div className="forgot-password-link">
              <a href="/forgot-password">Forgot Password?</a>
            </div>
          )}

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              className="auth-submit-btn"
              loading={isLoading}
            >
              {isSignUp ? 'Sign Up' : 'Sign In'}
            </Button>
          </Form.Item>

          <div className="auth-toggle">
            <span>
              {isSignUp 
                ? 'Already have an account? ' 
                : "Don't have an account? "}
            </span>
            <Button 
              type="link" 
              onClick={() => setIsSignUp(!isSignUp)}
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </Button>
          </div>
        </Form>
      </div>

      {/* Add inline styles */}
      <style jsx>{`
        .name-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .promo-code .ant-form-item-control-input {
          margin-bottom: 16px;
        }

        .auth-toggle {
          text-align: center;
          margin-top: 16px;
        }

        .forgot-password-link {
          text-align: right;
          margin-bottom: 16px;
        }

        .forgot-password-link a {
          color: #1890ff;
        }
      `}</style>
    </div>
  );
};

export default AuthPage;