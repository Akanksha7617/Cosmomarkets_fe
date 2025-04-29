import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import Navbar from "../Login/NavBar";
import "../../../common.css"
import { api, rawApi } from "@/components/common/api";
import { PutResetPasswordRequest } from '@/generated/models/PutResetPasswordRequest';
import { values } from 'lodash';
import { flushSync } from 'react-dom';
import { history, useModel } from '@umijs/max';

// import Navbar from "../User/Login/NavBar";

// let history: UmiHistory;

const Resetpassword: React.FC = () => {
  const [record, setRecord] = useState<PutResetPasswordRequest>({});
  const urlParams = new URLSearchParams(window.location.search);
  const userId = urlParams.get('userId');
  const passCode = urlParams.get('passCode');
  const { initialState, setInitialState } = useModel('@@initialState');

  const fetchUserInfo = async () => {
    const userInfo = await initialState?.fetchUserInfo?.();
    if (userInfo) {
      flushSync(() => {
        setInitialState((s) => ({
          ...s,
          currentUser: userInfo,
        }));
      });
    }
  };

  // useEffect(() => {
  //   // Parse the URL to get URL parameters
  //   // Now you have access to 'userId' and 'token'
  //   // Set the 'userId' and 'token' in the state
  //   setRecord((prevRecord) => ({
  //     ...prevRecord,
  //     userId: userId || '',
  //     token: token || '',
  //   }));
  // }, []);
  const [form] = Form.useForm();
  const onFinish = async () => {
    try {
      const values = form.getFieldsValue(); // Get the form values


      const password: PutResetPasswordRequest = {

        newPassword: values.newPassword,
        passCode: passCode,
        userID: userId,

      };
   
     const confirmPassword = values.confirmPassword;
      console.log('Confirm Password:', confirmPassword);


      const response = await api.app.PutResetPassword(password);
      const urlParams = new URL(window.location.href).searchParams;
      await fetchUserInfo()
     
      console.log(response)
      if (response === "success") {
        message.success("The password has been updated successfully")
        history.push(urlParams.get('redirect') || '/user/login/');
       return;
      
       
      } else {
        message.success("Password has not been updated , please contact Admin!")
   
      }
 form.resetFields();
    

    } catch (e: any) {
      // Handle errors if necessary
      // console.error('API error:', e);
    }
  };



  return (
    <>
      <div>
        <Navbar />
        <div className='reset-parent'>
        <div className='reset-image'>
          <img src="\images\reset-password-voco.jpeg" style={{width:400,height: '100%'}} className='reset-img'/>
        </div>
        <div className='reset-form'>
        <Card
          className="resetpassword"
          style={{
            height: '100%',
            width: '100%',
            boxShadow: '0 5px 9px rgba(0, 0, 0, 0.5)',
          }}
        >
          <h2 style={{ textAlign:'center' }}>Reset Password</h2>
          <Form
            form={form}
            name="changePasswordForm"
            onFinish={onFinish}
          >
            <Form.Item
              name="userId"
              initialValue={record.userID}
              hidden // Hide the userId field
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="token"
              initialValue={record.passCode}
              hidden // Hide the token field
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="newPassword"
              label="New Password"
            
              rules={[
                {
                  required: true,
                  message: 'Please input your password!',
                },
                {
                  pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/,
                  min: 8, message: 'Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 digit, 1 special symbol, and be at least 8 characters long!'
                }
              ]}
              style={{ width: '100%',margin:'auto', marginTop:16,fontWeight:'bold'}}
              labelCol={{ span: 24 }} 
              wrapperCol={{ span: 24 }} 
            >
              <Input.Password style={{ height: "40px"}} />
            </Form.Item>
            <Form.Item
              name="confirmPassword"
              label="Confirm Password"
              dependencies={['newPassword']}
              rules={[
                {
                  required: true,
                  message: 'Please input your password!',
                },
                {
                  pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/,
                  min: 8,
                  message: 'Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 digit, 1 special symbol, and be at least 8 characters long!'
                },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('newPassword') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('The two passwords do not match'));
                  }
                }),
              ]}
              style={{ width: '100%',margin:'auto', marginTop:16,fontWeight:'bold'}}
              labelCol={{ span: 24 }} 
              wrapperCol={{ span: 24 }} 
            >
              <Input.Password style={{ height: "40px"}} />
            </Form.Item>
            <Form.Item style={{marginTop:16, marginBottom: 0, display:'flex', justifyContent:'center'}}>
              <Button type="button" htmlType="submit" className='reset-btn' >
                Reset Password
              </Button>
            </Form.Item>
          </Form>
        </Card>
        </div>
        </div>
      </div>
    </>
  );
};

export default Resetpassword;
