// src/pages/SignOut/index.tsx
import { useEffect } from 'react';
import { history, useModel } from '@umijs/max';
import { api } from '@/components/common/api';
import { Spin } from 'antd';
import { flushSync } from 'react-dom';

const SignOut = () => {
  const { setInitialState } = useModel('@@initialState');

  useEffect(() => {
    const logOut = async () => {
      try {
        await api.app.postSignOut();
        
        // Clear user data from state
        flushSync(() => {
          setInitialState((s) => ({ ...s, currentUser: undefined }));
        });
        
        // Remove JWT token
        sessionStorage.removeItem('jwtToken');
        
        // Redirect to login page
        history.replace('/user/login');
      } catch (error) {
        console.error('Logout error:', error);
        history.replace('/user/login');
      }
    };
    
    logOut();
  }, [setInitialState]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Spin size="large" tip="Signing out..." />
    </div>
  );
};

export default SignOut;