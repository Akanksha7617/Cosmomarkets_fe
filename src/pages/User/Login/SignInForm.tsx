// import React from 'react';
// import { Form, Input, Checkbox, Alert } from 'antd';
// import { UserOutlined, LockOutlined } from '@ant-design/icons';

// const SignInForm = ({ userLoginState }) => {
//   const LoginMessage = ({ content }) => {
//     return (
//       <Alert
//         style={{
//           marginBottom: 24,
//         }}
//         message={content}
//         type="error"
//         showIcon
//       />
//     );
//   };

//   return (
//     <>
//       <Form.Item
//         name="email"
//         rules={[{ required: true, message: 'Please input your email address!' }]}
//       >
//         <Input
//           prefix={<UserOutlined className="input-icon" />}
//           placeholder="Email Address"
//           className="login-input"
//           size="large"
//         />
//       </Form.Item>

//       <Form.Item
//         name="password"
//         rules={[{ required: true, message: 'Please input your password!' }]}
//       >
//         <Input.Password
//           prefix={<LockOutlined className="input-icon" />}
//           placeholder="Password"
//           className="login-input"
//           size="large"
//         />
//       </Form.Item>

//       <div className="signin-actions">
//         <Form.Item name="autoLogin" valuePropName="checked" noStyle>
//           <Checkbox>
//             <span className="checkbox-label">Remember me</span>
//           </Checkbox>
//         </Form.Item>
//         <a className="forgot-password" href="/user/login/ForgotPassword">
//           Forgot Password
//         </a>
//       </div>

//       {userLoginState.status === 'error' && (
//         <LoginMessage content="Incorrect username/password" />
//       )}
//     </>
//   );
// };

// export default SignInForm;