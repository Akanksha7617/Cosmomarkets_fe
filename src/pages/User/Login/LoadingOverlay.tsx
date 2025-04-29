import React from 'react';

const LoadingOverlay = () => {
  return (
    <div className="login-loading-container">
      <div className="login-loading-content">
        <div className="login-spinner"></div>
        <p>Loading...</p>
      </div>
      <style jsx>{`
        .login-loading-container {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          background-color: #f0f2f5;
        }

        .login-loading-content {
          padding: 24px;
          text-align: center;
          background: white;
          border-radius: 4px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
        }

        .login-spinner {
          display: inline-block;
          width: 50px;
          height: 50px;
          margin-bottom: 16px;
          border: 3px solid rgba(0, 0, 0, 0.1);
          border-top-color: #1890ff;
          border-radius: 50%;
          animation: login-spin 1s ease-in-out infinite;
        }

        @keyframes login-spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default LoadingOverlay;