import { useEffect, useState } from 'react';

const Login = () => {
  // State management
  const [userLoginState, setUserLoginState] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});

  const LoginMessage = ({ content }) => {
    return (
      <div style={{
        marginBottom: '24px',
        padding: '12px 16px',
        background: 'rgba(255, 77, 79, 0.1)',
        border: '1px solid rgba(255, 77, 79, 0.3)',
        borderRadius: '8px',
        color: '#ff6b6b',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <span>⚠️</span>
        {content}
      </div>
    );
  };

  // Mock API functions (replace with your actual API)
  const mockAPI = {
    postSignIn: async (credentials) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock validation
      if (credentials.email === 'test@example.com' && credentials.password === 'password') {
        return { status: 'ok', token: 'mock-jwt-token' };
      } else {
        return { status: 'error', message: 'Invalid user or password.' };
      }
    }
  };

  const updateAPIToken = () => {
    // Mock function - implement your token update logic
    console.log('API token updated');
  };

  const fetchUserInfo = async () => {
    // Mock function - implement your user info fetching logic
    return { id: 1, name: 'Test User', email: 'test@example.com' };
  };

  const navigateTo = (path) => {
    // Mock navigation - replace with your routing logic
    console.log(`Navigating to: ${path}`);
    window.location.href = path;
  };

  const showMessage = (type, content) => {
    // Mock message system - replace with your notification system
    console.log(`${type.toUpperCase()}: ${content}`);
    alert(`${type.toUpperCase()}: ${content}`);
  };

  // Check for URL parameters and admin impersonation
  useEffect(() => {
    const checkAndHandleAdminImpersonation = async () => {
      setIsProcessing(true);

      const urlSearchParams = new URLSearchParams(window.location.search);
      const userId = urlSearchParams.get('userId');
      const adminImpersonating = urlSearchParams.get('adminImpersonating');
      const impersonationToken = urlSearchParams.get('impersonationToken');

      // Check if this is an admin impersonating a user
      if (userId && adminImpersonating === 'true' && impersonationToken) {
        const currentToken = sessionStorage.getItem('jwtToken');
        if (currentToken && !sessionStorage.getItem('adminToken')) {
          sessionStorage.setItem('adminToken', currentToken);
        }

        sessionStorage.setItem('jwtToken', impersonationToken);
        sessionStorage.setItem('isAdminImpersonating', 'true');
        sessionStorage.setItem('impersonatedUserId', userId);

        updateAPIToken();
        await fetchUserInfo();
        navigateTo('/dashboard');
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
          navigateTo('/admin/dashboard');
          return;
        }
      }

      // Handle normal login parameters
      const tokenParam = urlSearchParams.get('token');
      if (tokenParam) {
        sessionStorage.setItem('jwtToken', tokenParam);
        updateAPIToken();
        await fetchUserInfo();
        const redirect = urlSearchParams.get('redirect') || '/dashboard';
        navigateTo(redirect);
        return;
      }

      // Check for existing token
      const existingToken = sessionStorage.getItem('jwtToken');
      if (existingToken) {
        updateAPIToken();
        try {
          await fetchUserInfo();
          const redirect = urlSearchParams.get('redirect') || '/dashboard';
          navigateTo(redirect);
          return;
        } catch (error) {
          console.error('Token verification failed:', error);
          sessionStorage.removeItem('jwtToken');
          updateAPIToken();
        }
      }

      setIsProcessing(false);
    };

    checkAndHandleAdminImpersonation();
  }, []);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Please input your email address!';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address!';
    }
    
    if (!formData.password) {
      newErrors.password = 'Please input your password!';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsProcessing(true);
    try {
      const msg = await mockAPI.postSignIn({
        email: formData.email,
        password: formData.password,
      });

      if (msg.status === 'ok') {
        sessionStorage.setItem('jwtToken', msg.token);
        updateAPIToken();

        showMessage('success', 'Login successful');
        await fetchUserInfo();
        
        const urlParams = new URL(window.location.href).searchParams;
        navigateTo(urlParams.get('redirect') || '/dashboard');
        return;
      } else {
        if (msg.message && msg.message.includes('User is disabled by admin')) {
          showMessage('error', 'User is disabled by admin.');
        } else if (msg.message && msg.message.includes('Invalid user or password.')) {
          showMessage('error', 'Invalid user or password.');
        } else if (msg.message && msg.message.includes('Email not registered. Please sign up.')) {
          showMessage('error', 'Email not registered. Please sign up.');
        } else {
          showMessage('error', 'Login failed. Please try again.');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      setUserLoginState({
        type: 'signin',
        currentAuthority: 'guest',
        status: 'error',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Show loading state while processing admin impersonation
  if (isProcessing) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        color: 'white'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '3px solid #9BF8F4',
          borderTop: '3px solid transparent',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ marginTop: '20px', fontSize: '18px' }}>Loading...</p>
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    );
  }

  return (
    <div style={{
      position: 'relative',
      width: '100vw',
      height: '100vh',
      overflow: 'hidden',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      
      {/* Trading Chart Background */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        opacity: 0.15,
        backgroundImage: `
          linear-gradient(90deg, transparent 24%, rgba(155, 248, 244, 0.1) 25%, rgba(155, 248, 244, 0.1) 26%, transparent 27%, transparent 74%, rgba(155, 248, 244, 0.1) 75%, rgba(155, 248, 244, 0.1) 76%, transparent 77%, transparent),
          linear-gradient(transparent 24%, rgba(155, 248, 244, 0.05) 25%, rgba(155, 248, 244, 0.05) 26%, transparent 27%, transparent 74%, rgba(155, 248, 244, 0.05) 75%, rgba(155, 248, 244, 0.05) 76%, transparent 77%, transparent)
        `,
        backgroundSize: '50px 50px',
        animation: 'grid-move 20s linear infinite'
      }}></div>

      {/* Animated Trading Lines */}
      <svg style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        opacity: 0.3,
        zIndex: 1
      }}>
        <defs>
          <linearGradient id="cyanGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(155, 248, 244, 0)" />
            <stop offset="50%" stopColor="rgba(155, 248, 244, 0.8)" />
            <stop offset="100%" stopColor="rgba(155, 248, 244, 0)" />
          </linearGradient>
          <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(103, 232, 249, 0)" />
            <stop offset="50%" stopColor="rgba(103, 232, 249, 0.8)" />
            <stop offset="100%" stopColor="rgba(103, 232, 249, 0)" />
          </linearGradient>
        </defs>
        
        {/* Cyan upward trend line */}
        <path
          d="M0,400 Q200,350 400,320 T800,280 T1200,240 T1600,200"
          stroke="url(#cyanGradient)"
          strokeWidth="3"
          fill="none"
          style={{ animation: 'draw-line 8s ease-in-out infinite' }}
        />
        
        {/* Blue downward trend line */}
        <path
          d="M0,300 Q200,380 400,420 T800,480 T1200,520 T1600,580"
          stroke="url(#blueGradient)"
          strokeWidth="3"
          fill="none"
          style={{ animation: 'draw-line 10s ease-in-out infinite reverse' }}
        />
        
        {/* Additional trend lines for depth */}
        <path
          d="M0,600 Q300,550 600,520 T1200,480 T1800,450"
          stroke="rgba(155, 248, 244, 0.4)"
          strokeWidth="2"
          fill="none"
          style={{ animation: 'draw-line 12s ease-in-out infinite' }}
        />
      </svg>

     
      {/* Top Navigation */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px 40px',
        background: 'rgba(0, 0, 0, 0.2)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(0, 255, 136, 0.2)',
        zIndex: 10
      }}>
        <div style={{
          fontSize: '28px',
          fontWeight: 'bold',
          color: '#9BF8F4',
          textShadow: '0 0 20px rgba(155, 248, 244, 0.5)',
          animation: 'glow 2s ease-in-out infinite alternate'
        }}>
          Xyleum
        </div>
        <div style={{ display: 'flex', gap: '15px' }}>
          <button 
            onClick={() => navigateTo('/user/login')}
            style={{
              border: '1px solid #9BF8F4',
              color: '#9BF8F4',
              background: 'rgba(155, 248, 244, 0.1)',
              backdropFilter: 'blur(10px)',
              borderRadius: '25px',
              padding: '12px 25px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              fontSize: '14px'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(155, 248, 244, 0.2)';
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 8px 25px rgba(155, 248, 244, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(155, 248, 244, 0.1)';
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            Log In
          </button>
          <button 
            onClick={() => navigateTo('/User/Login/Signup')}
            style={{
              background: 'linear-gradient(45deg, #9BF8F4, #67e8f9)',
              border: 'none',
              color: '#1a1a1a',
              borderRadius: '25px',
              padding: '12px 25px',
              fontWeight: '600',
              boxShadow: '0 8px 25px rgba(155, 248, 244, 0.3)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              fontSize: '14px'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 12px 35px rgba(155, 248, 244, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 8px 25px rgba(155, 248, 244, 0.3)';
            }}
          >
            Sign Up
          </button>
        </div>
      </div>

      {/* Main Content - Moved Down */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        padding: '0 20px',
        paddingTop: '120px' // Added padding to move form down
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          borderRadius: '25px',
          padding: '50px 40px',
          width: '100%',
          maxWidth: '450px',
          border: '1px solid rgba(155, 248, 244, 0.3)',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(155, 248, 244, 0.1)',
          animation: 'slideUp 0.8s ease-out',
          position: 'relative',
          overflow: 'hidden',
          zIndex: 5
        }}>
          {/* Glassmorphism Effect Overlay */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '2px',
            background: 'linear-gradient(90deg, transparent, #9BF8F4, transparent)',
            animation: 'shimmer 2s ease-in-out infinite'
          }}></div>

          {/* Corner accents */}
          <div style={{
            position: 'absolute',
            top: '15px',
            right: '15px',
            width: '30px',
            height: '30px',
            border: '2px solid rgba(155, 248, 244, 0.5)',
            borderLeft: 'none',
            borderBottom: 'none',
            borderRadius: '0 8px 0 0'
          }}></div>
          
          <div style={{
            position: 'absolute',
            bottom: '15px',
            left: '15px',
            width: '30px',
            height: '30px',
            border: '2px solid rgba(155, 248, 244, 0.5)',
            borderRight: 'none',
            borderTop: 'none',
            borderRadius: '0 0 0 8px'
          }}></div>

          <div style={{
            textAlign: 'center',
            marginBottom: '40px'
          }}>
            <h2 style={{
              color: 'white',
              fontSize: '32px',
              fontWeight: '700',
              margin: '0 0 10px 0',
              textShadow: '0 0 20px rgba(155, 248, 244, 0.3)'
            }}>
              Welcome to Xyleum
            </h2>
            <p style={{
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '16px',
              margin: 0
            }}>
              Your gateway to smart trading
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ width: '100%' }}>
            <div style={{ marginBottom: '25px' }}>
              <label style={{ 
                color: 'white', 
                fontWeight: '500', 
                marginBottom: '8px', 
                display: 'block' 
              }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#9BF8F4',
                  zIndex: 1
                }}>
                  ✉️
                </span>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter your email"
                  style={{
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: `1px solid ${errors.email ? '#ff6b6b' : 'rgba(155, 248, 244, 0.3)'}`,
                    borderRadius: '15px',
                    color: 'white',
                    fontSize: '16px',
                    padding: '12px 16px 12px 50px',
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.3s ease',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#9BF8F4';
                    e.target.style.boxShadow = '0 0 20px rgba(155, 248, 244, 0.3)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = errors.email ? '#ff6b6b' : 'rgba(155, 248, 244, 0.3)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
              {errors.email && (
                <div style={{ color: '#ff6b6b', fontSize: '14px', marginTop: '5px' }}>
                  {errors.email}
                </div>
              )}
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ 
                color: 'white', 
                fontWeight: '500', 
                marginBottom: '8px', 
                display: 'block' 
              }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#00ff88',
                  zIndex: 1
                }}>
                  🔒
                </span>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="Enter your password"
                  style={{
                    width: '100%',
                    background: 'rgba(0, 0, 0, 0.3)',
                    border: `1px solid ${errors.password ? '#ff4757' : 'rgba(0, 255, 136, 0.3)'}`,
                    borderRadius: '15px',
                    color: 'white',
                    fontSize: '16px',
                    padding: '12px 16px 12px 50px',
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.3s ease',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#00ff88';
                    e.target.style.boxShadow = '0 0 20px rgba(0, 255, 136, 0.3)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = errors.password ? '#ff4757' : 'rgba(0, 255, 136, 0.3)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
              {errors.password && (
                <div style={{ color: '#ff4757', fontSize: '14px', marginTop: '5px' }}>
                  {errors.password}
                </div>
              )}
            </div>

            <div style={{ marginBottom: '30px', textAlign: 'right' }}>
              <a 
                href="/user/login/ForgotPassword"
                style={{
                  color: '#00ff88',
                  textDecoration: 'none',
                  fontSize: '14px',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.textShadow = '0 0 10px rgba(0, 255, 136, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.textShadow = 'none';
                }}
              >
                Forgot Password?
              </a>
            </div>

            {userLoginState.status === 'error' && (
              <LoginMessage content="Failed to sign in. Please try again." />
            )}

            <div style={{ marginBottom: '25px' }}>
              <button
                type="submit"
                disabled={isProcessing}
                style={{
                  width: '100%',
                  height: '50px',
                  background: 'linear-gradient(45deg, #00ff88, #00d4aa)',
                  border: 'none',
                  borderRadius: '15px',
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#0f0f23',
                  boxShadow: '0 15px 35px rgba(0, 255, 136, 0.3)',
                  transition: 'all 0.3s ease',
                  cursor: isProcessing ? 'not-allowed' : 'pointer',
                  opacity: isProcessing ? 0.7 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px'
                }}
                onMouseEnter={(e) => {
                  if (!isProcessing) {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 20px 45px rgba(0, 255, 136, 0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isProcessing) {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 15px 35px rgba(0, 255, 136, 0.3)';
                  }
                }}
              >
                {isProcessing && (
                  <div style={{
                    width: '20px',
                    height: '20px',
                    border: '2px solid #0f0f23',
                    borderTop: '2px solid transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                )}
                Sign In
              </button>
            </div>

            <div style={{
              textAlign: 'center',
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '15px'
            }}>
              Don't have an account?{' '}
              <a 
                onClick={() => navigateTo('/User/Login/Signup')}
                style={{
                  color: '#00ff88',
                  cursor: 'pointer',
                  textDecoration: 'none',
                  fontWeight: '600',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.textShadow = '0 0 10px rgba(0, 255, 136, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.textShadow = 'none';
                }}
              >
                Sign up
              </a>{' '}
              now
            </div>
          </form>
        </div>
      </div>

      {/* CSS Animations */}
      <style>
        {`
          @keyframes grid-move {
            0% { transform: translate(0, 0); }
            100% { transform: translate(50px, 50px); }
          }
          
          @keyframes draw-line {
            0% { stroke-dasharray: 0 1000; }
            50% { stroke-dasharray: 500 500; }
            100% { stroke-dasharray: 1000 0; }
          }
          
          @keyframes float-data {
            0%, 100% { transform: translateY(0px); opacity: 0.7; }
            50% { transform: translateY(-10px); opacity: 1; }
          }
          
          @keyframes glow {
            0% { text-shadow: 0 0 20px rgba(0, 255, 136, 0.5); }
            100% { text-shadow: 0 0 30px rgba(0, 255, 136, 0.8), 0 0 40px rgba(0, 255, 136, 0.3); }
          }
          
          @keyframes slideUp {
            0% { transform: translateY(50px); opacity: 0; }
            100% { transform: translateY(0); opacity: 1; }
          }
          
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }

          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          input::placeholder {
            color: rgba(255, 255, 255, 0.5) !important;
          }
        `}
      </style>
    </div>
  );
};

export default Login;