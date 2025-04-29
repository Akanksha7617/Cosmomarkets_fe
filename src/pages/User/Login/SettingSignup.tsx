import { LockOutlined } from '@ant-design/icons';
import { LoginForm, ProForm, ProFormText } from '@ant-design/pro-components';
import React, { useEffect, useState } from 'react';
import '../../../common.css';
// import { ProForm, Select, Input } from 'antd';
import { api } from '@/components/common/api';
import { useEmotionCss } from '@ant-design/use-emotion-css';
import { Helmet, history, SelectLang, useIntl, useModel } from '@umijs/max';
import { Alert, message } from 'antd';
import { flushSync } from 'react-dom';
import 'react-phone-number-input/style.css';

import { EnvironmentOutlined } from '@ant-design/icons';
import { Button, Modal, Select } from 'antd';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

import '../../../common.css';

const countryCodes = [
  { code: '+1', name: 'USA' },
  { code: '+97', name: 'UAE' },
  { code: '+91', name: 'India' },
  { code: '+44', name: 'United Kingdom' },
  { code: '+61', name: 'Australia' },
  { code: '+33', name: 'France' },
  { code: '+49', name: 'Germany' },
  { code: '+81', name: 'Japan' },
  { code: '+86', name: 'China' },
  { code: '+7', name: 'Russia' },
];

const Lang = () => {
  const langClassName = useEmotionCss(({ token }) => {
    return {
      width: 42,
      height: 42,
      lineHeight: '42px',
      position: 'fixed',
      right: 16,
      borderRadius: token.borderRadius,
      ':hover': {
        backgroundColor: token.colorBgTextHover,
      },
    };
  });

  return (
    <div className={langClassName} data-lang>
      {SelectLang && <SelectLang />}
    </div>
  );
};

const LoginMessage: React.FC<{
  content: string;
}> = ({ content }) => {
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

const Login: React.FC = () => {
  const [userLoginState, setUserLoginState] = useState<any>({});
  const [type, setType] = useState<string>('signup');
  const { initialState, setInitialState } = useModel('@@initialState');
  const [promoCode, setPromo] = useState<string>('99999');
  // useEffect(() => {
  //   const urlSearchParams = new URLSearchParams(window.location.search);
  //   const signupParam = urlSearchParams.get('signup');

  //   const promoParam = urlSearchParams.get('promo');

  //   if (signupParam == 'true') {
  //     setType('signup');
  //   }
  //   if (promoParam) {
  //     setPromo(promoParam);
  //   }
  // }, [])

  useEffect(() => {
    const urlSearchParams = new URLSearchParams(window.location.search);
    const signupParam = urlSearchParams.get('signup');
    const promoParam = urlSearchParams.get('promo');

    if (signupParam == 'true') {
      setType('signup');
    }
    if (promoParam) {
      setPromo(promoParam);
    }
    // let timeout = setTimeout( () => {
    //   if (promoParam) {
    //   setPromo(promoParam);

    // }},10000)
  }, []);

  const containerClassName = useEmotionCss(() => {
    return {
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      overflow: 'auto',
      marginTop: 40,
      backgroundImage:
        "url('https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/V-_oS6r-i7wAAAAAAAAAAAAAFl94AQBr')",
      backgroundSize: '100% 100%',
    };
  });
  const [phone, setPhone] = React.useState('');

  const handlePhoneChange = (value, country) => {
    setPhone(value);
  };
  const [selectedCountry, setSelectedCountry] = useState('');

  const handleCountryChange = (value) => {
    setSelectedCountry(value);
  };

  const [isChecked, setIsChecked] = useState(false);
  const [isSignUpEnabled, setIsSignUpEnabled] = useState(false);

  const handleCheckboxChange = (event) => {
    setIsChecked(event.target.checked);
    setIsSignUpEnabled(event.target.checked);
  };

  const handleSignUp = () => {
    if (isSignUpEnabled) {
      console.log('Signing up...');
    }
  };

  const intl = useIntl();

  const fetchUserInfo = async () => {
    const userInfo = await initialState?.fetchUserInfo?.();
    if (userInfo) {
      flushSync(() => {
        setInitialState((s: any) => ({
          ...s,
          currentUser: userInfo,
        }));
      });
    }
  };

  const handleSubmit = async (values: Record<string, any>) => {
    const isSignIn = values.type === 'signin';

    if (isSignIn) {
      try {
        const msg = await api.app.postSignIn({
          email: values.email,
          password: values.password,
        });

        if (msg.status === 'ok') {
          message.success({
            content: 'Login successful!',
            icon: <span style={{ color: 'green', fontSize: '20px' }}>✔</span>,
            className: 'custom-success-notification',
            duration: 3,
          });
          await fetchUserInfo();
          const urlParams = new URL(window.location.href).searchParams;
          history.push(urlParams.get('redirect') || '/dashboard');
          return;
        }
      } catch (error) {
        console.log(error);
        message.error({
          content: 'Incorrect username or password.',
          icon: <span style={{ color: 'red', fontSize: '20px' }}>✘</span>,
          className: 'custom-error-notification',
          duration: 3,
        });
        setUserLoginState({
          status: 'error',
          type: type,
          currentAuthority: 'guest',
        });
      }
    } else {
      try {
        const msg = await api.app.postSignUp(values);
        message.success({
          content: 'Sign up successful!',
          icon: <span style={{ color: 'green', fontSize: '20px' }}>✔</span>,
          className: 'custom-success-notification',
          duration: 3,
        });
        setType('signin');
        return;
      } catch (error) {
        console.log(error);
        message.error({
          content: 'Failed to sign up. Please try again later.',
          icon: <span style={{ color: 'red', fontSize: '20px' }}>✘</span>,
          className: 'custom-error-notification',
          duration: 3,
        });
        setUserLoginState({
          status: 'signUpError',
          type: type,
          currentAuthority: 'guest',
        });
      }
    }
  };

  const { status, type: loginType } = userLoginState;
  const [country, setCountry] = React.useState('us');
  const [declarationChecked, setDeclarationChecked] = useState(false);
  const [signupModalVisible, setSignupModalVisible] = useState(false);
  const [showDeclarationError, setShowDeclarationError] = useState(false);
  // const submitText = loginType === 'signup' ? 'Sign up' : 'Sign up';

  function getSignUpForm() {
    let promoParam;
    const urlSearchParams = new URLSearchParams(window.location.search);
    const signupParam = urlSearchParams.get('signup');
    promoParam = urlSearchParams.get('promo');

    if (!promoParam) {
      promoParam = '0';
    }

    return (
      <div className="settingsignup-form">
        <h2 className="login-title1">Sign Up Here</h2>
        <div className="signup">
          <ProFormText
            // label="First Name"

            name="firstName"
            rules={[
              {
                required: true,
                message: 'Please enter first name!',
              },
              { min: 2, message: 'First  Name must be at least 3 characters' },
            ]}
            fieldProps={{
              size: 'large',
              style: {
                width: '80%',
                borderRadius: 5,
                fontWeight: 'bolder',
                border: '1px solid #b7b3b3)',
                marginLeft: 30,
              },
              placeholder: 'First Name',
            }}
          />

          <ProFormText
            // label="Last Name"
            name="lastName"
            placeholder="Last Name"
            rules={[
              {
                required: true,
                message: 'Please Enter last name!',
              },
              { min: 2, message: 'Last  Name must be at least 3 characters' },
            ]}
            fieldProps={{
              size: 'large',
              style: {
                width: '80%',
                borderRadius: 5,
                fontWeight: 'bolder',
                border: '1px solid #b7b3b3)',
                marginLeft: 30,
              },
            }}
          />
        </div>
        <ProForm.Item
          name="email"
          rules={[
            {
              required: true,
              message: 'Please enter email address!',
            },
            {
              type: 'email',
              message: 'Invalid email format',
            },
          ]}
        >
          <ProFormText
            placeholder="Email address"
            fieldProps={{
              size: 'large',
              style: {
                width: '80%',
                borderRadius: 5,
                fontWeight: 'bolder',
                border: '1px solid #b7b3b3',
                marginLeft: 30,
              },
            }}
          />
        </ProForm.Item>
        <ProForm.Item
          name="phone"
          // label="Phone"

          fieldProps={{
            size: 'large',
            style: {
              width: '80%',
              padding: '7px 11px',
              borderRadius: 5,
              fontWeight: 'bolder',
              border: '1px solid #b7b3b3',
              marginLeft: 30,
            },
          }}
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
            country="ae"
            inputStyle={{
              width: '80%',
              borderRadius: 5,
              fontWeight: 'bold',
              color: 'rgb(141, 140, 140)',
              border: '1px solid #b7b3b3)',
              marginLeft: 30,
            }}
            inputProps={{ placeholder: 'Phone number', required: true }}
          />
        </ProForm.Item>

        <ProForm.Item
          name="region"
          rules={[
            {
              required: true,
              message: 'Please enter country!',
            },
          ]}
        >
          <Select
            value={selectedCountry}
            style={{
              width: '80%',
              borderRadius: 5,
              fontWeight: 'bolder',
              border: '1px solid #b7b3b3)',
              marginLeft: 30,
            }}
            onChange={handleCountryChange}
            placeholder="Select Country"
            suffixIcon={<EnvironmentOutlined />}
          >
            {countryCodes.map((country) => (
              <Select.Option key={country.name} value={country.name}>
                {` ${country.name}`}
              </Select.Option>
            ))}
          </Select>
        </ProForm.Item>

        <ProFormText.Password
          // label="Password"
          name="password"
          fieldProps={{
            size: 'large',
            style: {
              width: '80%',
              borderRadius: 5,
              fontWeight: 'bolder',
              border: '1px solid #b7b3b3)',
              marginLeft: 30,
            },
            prefix: <LockOutlined />,
          }}
          placeholder="Please input your password!"
          rules={[
            {
              required: true,
              message: 'Please input your password!',
            },
            {
              pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/,
              min: 8,
              message:
                'Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 digit, 1 special symbol, and be at least 8 characters long!',
            },
          ]}
        />

        {promoParam !== '0' ? (
          <ProFormText
            initialValue={promoParam}
            label="Promo"
            fieldProps={{
              size: 'large',
            }}
            name="promo"
            placeholder="promo"
            rules={[
              {
                required: true,
                message: 'Please enter the promo code of the Introducing Broker!',
              },
            ]}
            disabled // Set disabled to true when promoParam is not null or an empty string
          />
        ) : (
          <ProFormText
            initialValue={promoParam}
            label="Promo"
            fieldProps={{
              size: 'large',
            }}
            name="promo"
            placeholder="promo"
            rules={[
              {
                required: true,
                message: 'Please enter the promo code of the Introducing Broker!',
              },
            ]}
          />
        )}

        {status === 'signUpError' && (
          <LoginMessage content="Failed to signup. Please try again later." />
        )}
      </div>
    );
  }

  return (
    <div className={containerClassName}>
      <Helmet>
        <title>
          {intl.formatMessage({
            id: 'menu.login',
            defaultMessage: 'strrstrrstrr',
          })}
          {/* - {Settings.title} */}
        </title>
      </Helmet>
      <Lang />
      <div
        style={{
          flex: '1',
          padding: '32px 0',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <LoginForm
            contentStyle={{
              minWidth: 500,
              maxWidth: '75vw',
              marginTop: 50,
            }}
            // logo={<img alt="logo" src="/images/logo.jpg"  style={{width:300,height:130,marginBottom:100}}/>}
            // title="CRM"
            // subTitle={intl.formatMessage({ id: 'pages.layouts.userLayout.title' })}
            initialValues={{
              autoLogin: true,
              // promo: promo
            }}
            onFinish={async (values) => {
              if (type === 'signup') {
                if (!declarationChecked) {
                  setShowDeclarationError(true);
                } else {
                  setShowDeclarationError(false);
                  await handleSubmit({ ...values, type: type });
                }
              } else {
                await handleSubmit({ ...values, type: type });
              }
            }}
            submitter={{
              searchConfig: {
                submitText: type === 'signin' ? 'Sign In' : 'Sign Up',
              },
              submitButtonProps: {
                style: {
                  width: 200,
                  marginBottom: 30,
                  padding: 5,
                  marginTop: 10,
                  marginLeft: 130,
                  color: 'white',
                  borderRadius: '5px',
                  // padding: '5px 20px',
                  // Add any other styles you want to apply
                },
              },
              /*   render: (_, dom) => (
                  <>
                    {dom}
                    {type === 'signup' && (
                      <div style={{ marginTop: 10, textAlign: 'center' }}>
                        Don't have an account? <a href="/user/signup">Sign Up</a>
                      </div>
                    )}
                  </>
                ),
               */
            }}
          >
            {type === 'signin' && getSignInForm()}

            {type === 'signup' && <>{getSignUpForm()}</>}
          </LoginForm>
        </div>

        <Modal
          title="Error"
          visible={showDeclarationError}
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
      {/* <Footer /> */}
    </div>
  );
};
export default Login;
