import { api } from '@/components/common/api';
import { MailOutlined } from '@ant-design/icons';
import { Button, Form, Input, message } from 'antd';
import React, { useState } from 'react';
import '../../../common.css';
import Navbar from './NavBar';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (email: string) => {
    setLoading(true);
    try {
      const response = await api.app.forgotPassword(email);
      console.log(response);
      if (response.includes('Reset Password Mail Sent To')) {
        message.success('Email has been sent successfully');
      } else {
        message.error(response);
      }
    } catch (error) {
      console.error('Error sending password reset request:', error);
      message.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <div className="forgot-password-wrapper">
        {/* <div className='forget-img'>
        <img src="\images\forgot-pswd-voco.jpeg" alt="" style={{height:'100%',width:400}} className='img-pswd-change'/>
      </div> */}
        <div className="forgot-password-content">
          <div className="forgot-password-form-container">
            <Form className="forgot-password-form">
              <img src="/images/logo.png" alt="logo" style={{ height: '56px', width: '197px' }} />

              <h2 className="forgot-password-title">Forgot Password</h2>
              <div>
                <Form.Item
                  name="email"
                  rules={[
                    {
                      required: true,
                      message: 'Please enter your email!',
                    },
                    {
                      type: 'email',
                      message: 'Invalid email format!',
                    },
                  ]}
                >
                  <Input
                    className="forgot-password-input"
                    type="email"
                    name="email"
                    placeholder="Enter your Email"
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    prefix={<MailOutlined />}
                  />
                </Form.Item>
              </div>
              <Button
                type="primary"
                onClick={() => handleSubmit(email)}
                loading={loading}
                className="forgot-password-button"
              >
                Submit
              </Button>
            </Form>
          </div>
        </div>
      </div>
    </>
  );
};
export default ForgotPassword;
