import { api } from '@/components/common/api';

export const handleAdminImpersonation = async (
  setIsProcessing, 
  updateAPIToken, 
  fetchUserInfo, 
  history, 
  setActiveTab, 
  setPromo
) => {
  const urlSearchParams = new URLSearchParams(window.location.search);
  const userId = urlSearchParams.get('userId');
  const adminImpersonating = urlSearchParams.get('adminImpersonating');
  const impersonationToken = urlSearchParams.get('impersonationToken');

  // Check if this is an admin impersonating a user
  if (userId && adminImpersonating === 'true' && impersonationToken) {
    // Save current admin token if not already saved
    const currentToken = sessionStorage.getItem('jwtToken');
    if (currentToken && !sessionStorage.getItem('adminToken')) {
      sessionStorage.setItem('adminToken', currentToken);
    }

    // Set the impersonation token
    sessionStorage.setItem('jwtToken', impersonationToken);
    sessionStorage.setItem('isAdminImpersonating', 'true');
    sessionStorage.setItem('impersonatedUserId', userId);

    // Update API token and fetch user info
    updateAPIToken();
    await fetchUserInfo();

    // Redirect to user dashboard
    history.replace('/dashboard');
    return;
  }

  // Check for return from user impersonation
  if (urlSearchParams.get('returnToAdmin') === 'true') {
    const adminToken = sessionStorage.getItem('adminToken');
    if (adminToken) {
      sessionStorage.setItem('jwtToken', adminToken);
      sessionStorage.removeItem('isAdminImpersonating');
      sessionStorage.removeItem('impersonatedUserId');
      updateAPIToken();
      await fetchUserInfo();
      history.replace('/admin/dashboard');
      return;
    }
  }

  // Handle normal login parameters
  const signupParam = urlSearchParams.get('signup');
  const promoParam = urlSearchParams.get('promo');
  const tokenParam = urlSearchParams.get('token');

  if (signupParam === 'true') {
    setActiveTab('signup');
  }

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
};

export const handleSignIn = async (
  values, 
  updateAPIToken, 
  fetchUserInfo, 
  history, 
  message
) => {
  const msg = await api.app.postSignIn({
    email: values.email,
    password: values.password,
  });

  if (msg.status === 'ok') {
    sessionStorage.setItem('jwtToken', msg.token);
    updateAPIToken();
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
  } else {
    if (msg.message && msg.message.includes('User is disabled by admin')) {
      message.error({
        content: 'User is disabled by admin.',
        icon: <span style={{ color: 'red', fontSize: '20px' }}>✘</span>,
        className: 'custom-error-notification',
        duration: 3,
      });
    } else if (msg.message && msg.message.includes('Invalid user or password.')) {
      message.error({
        content: 'Invalid user or password.',
        icon: <span style={{ color: 'red', fontSize: '20px' }}>✘</span>,
        className: 'custom-error-notification',
        duration: 3,
      });
    } else if (msg.message && msg.message.includes('Email not registered. Please sign up.')) {
      message.error({
        content: 'Email not registered. Please sign up.',
        icon: <span style={{ color: 'red', fontSize: '20px' }}>✘</span>,
        className: 'custom-error-notification',
        duration: 3,
      });
    } else {
      message.error({
        content: 'Login failed. Please try again.',
        icon: <span style={{ color: 'orange', fontSize: '20px' }}>⚠</span>,
        className: 'custom-warning-notification',
        duration: 3,
      });
    }
    throw new Error('Login failed');
  }
  

export const handleSignUp = async (
  values, 
  setActiveTab, 
  setUserLoginState, 
  message
) => {
  const msg = await api.app.postSignUp(values);

  if (msg.message && msg.message.startsWith('Registration successful')) {
    message.success(msg.message);
    setActiveTab('signin');
  } else if (msg.message === 'Sign Up failed DuplicateUserName') {
    message.error(
      'User with this email already exists. Please use a different email or try to sign in.',
    );
    throw new Error('Duplicate user');
  } else {
    message.error('User with this email already exists.');
    setUserLoginState({
      status: 'signUpError',
      currentAuthority: 'guest',
    });
    throw new Error('Signup failed');
  }
};