// Imports
import React, { useEffect, useState } from 'react';
import { api, updateAPIToken } from '@/components/common/api';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { history, useModel } from '@umijs/max';
import { 
  Button, 
  Checkbox, 
  Form, 
  Input, 
  message, 
  Modal, 
  Select, 
  Alert 
} from 'antd';
import { flushSync } from 'react-dom';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import '../../../common.css';


// Authentication Utilities
import { 
   
  fetchUserInfo, 
  handleSignIn, 
  handleSignUp 
} from './authUtils';
import LoadingOverlay from './LoadingOverlay';
import SignInForm from './SignInForm';
import SignUpForm from './SignUpForm';
import { handleAdminImpersonation } from './handleAdminImpersonation';



const { Option } = Select;

const Login = () => {
  // State Management
  const [activeTab, setActiveTab] = useState('signup');
  const [userLoginState, setUserLoginState] = useState({});
  const [promoCode, setPromo] = useState('0');
  const [declarationChecked, setDeclarationChecked] = useState(false);
  const [showDeclarationError, setShowDeclarationError] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Initial State and Model Hooks
  const { initialState, setInitialState } = useModel('@@initialState');

  // Admin Impersonation and Token Handling
  useEffect(() => {
    const checkAdminImpersonation = async () => {
      setIsProcessing(true);
      try {
        await handleAdminImpersonation(
          setIsProcessing, 
          updateAPIToken, 
          fetchUserInfo, 
          history, 
          setActiveTab, 
          setPromo
        );
      } catch (error) {
        console.error('Admin impersonation check failed:', error);
      } finally {
        setIsProcessing(false);
      }
    };

    checkAdminImpersonation();
  }, []);

  // Form Submission Handler
  const handleSubmit = async (values) => {
    setIsProcessing(true);
    const isSignIn = activeTab === 'signin';

    try {
      if (isSignIn) {
        await handleSignIn(
          values, 
          updateAPIToken, 
          fetchUserInfo, 
          history, 
          message
        );
      } else {
        // Signup logic with declaration check
        if (!declarationChecked) {
          setShowDeclarationError(true);
          return;
        }

        await handleSignUp(
          values, 
          setActiveTab, 
          setUserLoginState, 
          message
        );
      }
    } catch (error) {
      console.error(`${isSignIn ? 'Login' : 'Signup'} error:`, error);
      setUserLoginState({
        status: isSignIn ? 'error' : 'signUpError',
        type: activeTab,
        currentAuthority: 'guest',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Render Loading State
  if (isProcessing) {
    return <LoadingOverlay />;
  }

  return (
    <div className="login-page-container">
      {/* Background Section */}
      <div className="background-card">
        <div className="background-image">
          <div className="overlay-text">
            <h1>{activeTab === 'signup' ? 'SIGN\nUP' : 'SIGN\nIN'}</h1>
            <button
              className="alt-action-btn"
              onClick={() => setActiveTab(activeTab === 'signup' ? 'signin' : 'signup')}
            >
              {activeTab === 'signup' ? 'SIGN IN' : 'SIGN UP'}
            </button>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="foreground-card">
        <Form
          name="login_form"
          className="login-form"
          initialValues={{
            autoLogin: true,
            promo: promoCode,
          }}
          onFinish={handleSubmit}
        >
          <h3>{activeTab === 'signup' ? 'Create an account' : 'Sign In to Your Account'}</h3>
          <p className="form-subtitle">
            {activeTab === 'signup'
              ? 'Create an account to get started'
              : 'Welcome back! Please enter your credentials'}
          </p>

          {activeTab === 'signin' ? (
            <SignInForm 
              userLoginState={userLoginState} 
            />
          ) : (
            <SignUpForm
              declarationChecked={declarationChecked}
              setDeclarationChecked={setDeclarationChecked}
              setShowDeclarationError={setShowDeclarationError}
              promoCode={promoCode}
              userLoginState={userLoginState}
            />
          )}

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              className="submit-btn" 
              loading={isProcessing}
            >
              {activeTab === 'signup' ? 'Sign Up' : 'Sign In'}
            </Button>
          </Form.Item>

          <div className="account-toggle">
            <span>
              {activeTab === 'signup' ? 'Already have an account?' : "Don't have an account?"}
            </span>
            <Button
              type="link"
              onClick={() => setActiveTab(activeTab === 'signup' ? 'signin' : 'signup')}
              className="auth-toggle-btn"
            >
              {activeTab === 'signup' ? 'Sign in' : 'Create an account'}
            </Button>
          </div>
        </Form>
      </div>

      {/* Declaration Error Modal */}
      <Modal
        className="error-modal"
        title="Action Required"
        open={showDeclarationError}
        onCancel={() => setShowDeclarationError(false)}
        footer={[
          <Button
            key="ok"
            type="primary"
            onClick={() => setShowDeclarationError(false)}
            className="error-modal-btn"
          >
            OK
          </Button>,
        ]}
      >
        <p>Please check the declaration checkbox to proceed with signup.</p>
      </Modal>

      {/* Inline Styles */}
      <style jsx>{`
        /* Loading animation styles */
        @keyframes login-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Login;