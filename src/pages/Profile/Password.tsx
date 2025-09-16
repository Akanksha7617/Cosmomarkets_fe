import { api } from '@/components/common/api';
import { history } from '@umijs/max';
import { Button, Card, Form, Input, message } from 'antd';
import React, { useEffect, useState } from 'react';
import { LockOutlined, KeyOutlined, UnlockOutlined } from '@ant-design/icons';

import '../../common.css';

const Password: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);
  const [userId, setUserId] = useState<String>();
  useEffect(() => {
    getDetails().then();
  }, []);

  async function getDetails() {
    try {
      const record = await api.app.getMe();
      const userId = record.id;
      setUserId(userId.toString());
      console.log('getDetails ::', userId);
    } catch (error) {
      message.error({
        content: 'Failed to retrieve user details. Please try again later.',
        icon: <span className="orange-error-icon"> ✘ </span>,
        className: 'orange-error-notification',
        duration: 3,
      });
      console.error('Failed to get user details:', error);
    }
  }
  

  async function handleOk(record: { id: any }) {
    setLoading(true);
  
    try {
      const values = await form.validateFields();
      //   console.log("handleOk :::",userId,record);
  
      const response = await api.app.password(userId, {
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      });
      console.log(':::----', response);
  
      if (response.includes('Old password is not match')) {
        message.error({
          content: 'The old password you entered does not match. Please try again.',
          icon: <span className="orange-error-icon"> ✘ </span>,
          className: 'orange-error-notification',
          duration: 3,
        });
      } else {
        message.success({
          content: 'Your password has been successfully changed.',
          icon: <span className="orange-success-icon"> ✓ </span>,
          className: 'orange-success-notification',
          duration: 3,
        });
        history.push('/ProfileSettings');
      }
    } catch (error) {
      console.error('Password change failed:', error);
      message.error({
        content: 'An error occurred while updating your password. Please try again later.',
        icon: <span className="orange-error-icon"> ✘ </span>,
        className: 'orange-error-notification',
        duration: 3,
      });
    } finally {
      setLoading(false);
    }
  }
  
  const validateConfirmPassword = (
    rule: any,
    value: any,
    callback: (arg0: string | undefined) => void,
  ) => {
    const newPassword = form.getFieldValue('newPassword');

    if (value && newPassword !== value) {
      callback('Confirm Password does not match the New Password!');
    } else {
      callback();
    }
  };

  return (
    <>
     <Card  className="change-password">
          <div className="profile-info pdinginfo" style={{ marginBottom: 30 }}>
          <div className="avatar-container">
          </div>
          <div className="user-info">
            <h2 className="user-name">Password</h2>
          </div>
        </div>
      
      <div className="btn-at-end">
        {/* <Button type="button" onClick={() => history.push('/dashboard')} className="back-btn">Back</Button> */}
      </div>
      <Form
        className="change_pwd change-pwd-form"
        form={form}
        onFinish={handleOk}
        name="basic"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        style={{ maxWidth: '100%' }}
        initialValues={{ remember: true }}
        autoComplete="off"
      >
        <Form.Item
         label={
          <span>
            <KeyOutlined style={{ marginRight: 8 }} />
            Old Password
          </span>
        }
          name="oldPassword"
          rules={[{ required: true, message: 'Please Fill out this Field!' }]}
          style={{ width: 350, marginTop: 0,  }}
          labelCol={{ span: 24 }}
          wrapperCol={{ span: 24 }}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label={
            <span>
              <UnlockOutlined style={{ marginRight: 8 }} />
              New Password
            </span>
          }
          name="newPassword"
          rules={[
            { required: true, message: 'Please Fill out this Field!' },
            {
              pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/,
              min: 8,
              message:
                'New Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 digit, 1 special symbol, and be at least 8 characters long!',
            },
          ]}
          style={{ width: 350, marginTop: 0,  }}
          labelCol={{ span: 24 }}
          wrapperCol={{ span: 24 }}
        >
          <Input />
        </Form.Item>
        <Form.Item
           label={
            <span>
              <LockOutlined style={{ marginRight: 8 }} />
              Confirm Password
            </span>
          }
          name="Confirm Password"
          rules={[
            { required: true, message: 'Please Fill out this Field!' },
            { validator: validateConfirmPassword },
          ]}
          style={{ width: 350, marginTop: 0,  }}
          labelCol={{ span: 24 }}
          wrapperCol={{ span: 24 }}
        >
          <Input />
        </Form.Item>
        <Form.Item className="change-pwd-btn">
          <Button type="button" htmlType="submit" className="updatepassword-btn">
            Update Password
          </Button>
        </Form.Item>
      </Form>
    </Card>
    </>
  );
};
export default Password;
