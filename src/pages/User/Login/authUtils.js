import { message } from 'antd';

// Simulated API calls (replace with actual API service)
const authService = {
  async signUp(userData) {
    try {
      // Simulate API call
      console.log('Signing up user:', userData);
      
      // Mock validation and API response
      if (!userData.email) {
        throw new Error('Email is required');
      }

      // Simulate server-side validation
      if (userData.password.length < 8) {
        throw new Error('Password must be at least 8 characters');
      }

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock successful registration
      return {
        success: true,
        message: 'Registration successful',
        userId: 'mock-user-id-' + Date.now()
      };
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  },

  async signIn(credentials) {
    try {
      // Simulate API call
      console.log('Signing in user:', credentials);
      
      // Validate input
      if (!credentials.email || !credentials.password) {
        throw new Error('Email and password are required');
      }

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock authentication
      if (credentials.email === 'test@example.com' && credentials.password === 'Password123!') {
        return {
          success: true,
          message: 'Login successful',
          token: 'mock-jwt-token-' + Date.now(),
          user: {
            id: 'mock-user-id',
            email: credentials.email,
            name: 'John Doe'
          }
        };
      } else {
        throw new Error('Invalid email or password');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  async forgotPassword(email) {
    try {
      // Simulate password reset request
      console.log('Password reset request for:', email);

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      return {
        success: true,
        message: 'Password reset link sent to your email'
      };
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  }
};

// Utility functions for form validation
export const validatePassword = (password) => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Authentication handler
export const handleAuthentication = async (isSignUp, values) => {
  try {
    if (isSignUp) {
      // Signup flow
      const signUpResult = await authService.signUp({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        password: values.password,
        phone: values.phone,
        country: values.country,
        promoCode: values.promoCode || null
      });

      message.success(signUpResult.message);
      return signUpResult;
    } else {
      // Signin flow
      const signInResult = await authService.signIn({
        email: values.email,
        password: values.password
      });

      message.success(signInResult.message);
      
      // Store token in session storage
      if (signInResult.token) {
        sessionStorage.setItem('authToken', signInResult.token);
      }

      return signInResult;
    }
  } catch (error) {
    // Handle different types of errors
    if (error.message.includes('Email is required')) {
      message.error('Please provide a valid email address');
    } else if (error.message.includes('Password must be at least 8 characters')) {
      message.error('Password is too short');
    } else if (error.message.includes('Invalid email or password')) {
      message.error('Incorrect email or password');
    } else {
      message.error(error.message || 'Authentication failed');
    }
    throw error;
  }
};

export default authService;