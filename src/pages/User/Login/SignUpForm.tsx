// import React from 'react';
// import { Form, Input, Select, Alert, Checkbox } from 'antd';
// import { LockOutlined } from '@ant-design/icons';
// import PhoneInput from 'react-phone-input-2';
// import 'react-phone-input-2/lib/style.css';
// import { countryCodes } from './countryCodesConfig';

// const { Option } = Select;

// const SignUpForm = ({
//   declarationChecked,
//   setDeclarationChecked,
//   setShowDeclarationError,
//   promoCode,
//   userLoginState
// }) => {
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
//       <div className="name-grid">
//         <Form.Item
//           name="firstName"
//           rules={[
//             { required: true, message: 'Please Enter FirstName' },
//             { min: 3, message: 'FirstName must be at least 3 characters' },
//             {
//               pattern: /^[a-zA-Z0-9. _]*$/,
//               message: 'Please enter valid characters only.',
//             },
//           ]}
//         >
//           <Input placeholder="First Name" className="login-input" size="large" />
//         </Form.Item>

//         <Form.Item
//           name="lastName"
//           rules={[
//             { required: true, message: 'Please Enter LastName' },
//             { min: 3, message: 'Last Name must be at least 3 characters' },
//             {
//               pattern: /^[a-zA-Z0-9. _]*$/,
//               message: 'Please enter valid characters only',
//             },
//           ]}
//         >
//           <Input placeholder="Last Name" className="login-input" size="large" />
//         </Form.Item>
//       </div>

//       <Form.Item
//         name="email"
//         rules={[
//           { required: true, message: 'Please enter email address!' },
//           { type: 'email', message: 'Invalid email format' },
//         ]}
//       >
//         <Input placeholder="Email address" className="login-input" size="large" />
//       </Form.Item>

//       <div className="contact-info">
//         <Form.Item
//           name="phone"
//           rules={[
//             { required: true, message: 'Please enter phone number with country code' },
//             ({ getFieldValue }) => ({
//               validator(_, value) {
//                 if (value && value.length >= 7) {
//                   return Promise.resolve();
//                 }
//                 return Promise.reject('Phone number must be at least 7 digits');
//               },
//             }),
//           ]}
//         >
//           <PhoneInput
//             country="ae"
//             inputClass="phone-input"
//             buttonClass="phone-dropdown"
//             inputProps={{ placeholder: 'Phone number', required: true }}
//           />
//         </Form.Item>

//         <Form.Item
//           name="region"
//           rules={[{ required: true, message: 'Please select your country!' }]}
//         >
//           <Select placeholder="Select country" size="large" className="country-select">
//             {countryCodes.map((country) => (
//               <Option key={country.code} value={country.name}>
//                 {country.name}
//               </Option>
//             ))}
//           </Select>
//         </Form.Item>
//       </div>

//       <Form.Item
//         name="password"
//         rules={[
//           { required: true, message: 'Please input your password!' },
//           {
//             pattern:
//               /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/,
//             message:
//               'Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 digit, 1 special symbol, and be at least 8 characters long!',
//           },
//         ]}
//       >
//         <Input.Password
//           prefix={<LockOutlined className="input-icon" />}
//           placeholder="Create a strong password"
//           className="login-input"
//           size="large"
//         />
//       </Form.Item>

//       <Form.Item
//         name="promo"
//         initialValue={promoCode}
//         rules={[
//           {
//             required: true,
//             message: 'Please enter the promo code of the Introducing Broker!',
//           },
//           { pattern: /^[0-9]+$/, message: 'Please enter a valid numeric promo code.' },
//         ]}
//       >
//         <Input
//           placeholder="Promo code"
//           className="login-input"
//           size="large"
//           disabled={promoCode !== '0'}
//         />
//       </Form.Item>

//       <div className="declaration-wrapper">
//         <Checkbox
//           className="declaration-checkbox"
//           checked={declarationChecked}
//           onChange={(e) => {
//             setDeclarationChecked(e.target.checked);
//             setShowDeclarationError(false);
//           }}
//         >
//           <span className="declaration-text">
//             I declare and confirm that I accept all{' '}
//             <a
//               href="https://www.vocomarkets.com/termsandconditions.html"
//               target="blank"
//               className="terms-link"
//             >
//               Terms & Conditions
//             </a>{' '}
//             of Xyleum Technologies Limited.
//           </span>
//         </Checkbox>
//       </div>

//       {userLoginState.status === 'signUpError' && (
//         <LoginMessage content="Failed to signup. Please try again later." />
//       )}
//     </>
//   );
// };

// export default SignUpForm;