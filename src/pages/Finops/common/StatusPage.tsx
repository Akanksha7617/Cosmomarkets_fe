import { history } from '@umijs/max';
import Card from 'antd/es/card/Card';
import Button from 'antd/lib/button';
import React from 'react';

const StatusPage: React.FC = () => {
  return (
    <div className="verification-container">
      <div className="verification-wrapper">
        <Card className="verification-card">
          {/* Header Section */}
          <div className="verification-header">
            <div className="verification-header-content">
              <div className="verification-icon">🔒</div>
              <div className="verification-header-text">
                <h1 className="verification-title">Account Verification</h1>
                <p className="verification-subtitle">
                  Secure your account and unlock premium features
                </p>
                <div className="badge-alert">Action Required</div>
              </div>
            </div>
          </div>

          {/* Body Section */}
          <div className="verification-body">
            {/* Left Content */}
            <div className="verification-content">
              <div className="profile-section">
                <h2 className="profile-title">Complete Your Profile</h2>
                <p className="profile-description">
                  Verify your account to access all features, increase security, and enjoy a premium experience with enhanced support.
                </p>
              </div>

              {/* Features Grid */}
              <div className="features-list">
                <div className="feature-item">
                  <div className="feature-icon security">🛡️</div>
                  <span className="feature-text">Enhanced Security</span>
                </div>
                <div className="feature-item">
                  <div className="feature-icon premium">⭐</div>
                  <span className="feature-text">Premium Features</span>
                </div>
                <div className="feature-item">
                  <div className="feature-icon priority">🎯</div>
                  <span className="feature-text">Priority Support</span>
                </div>
                <div className="feature-item">
                  <div className="feature-icon limits">📈</div>
                  <span className="feature-text">Higher Limits</span>
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="verification-sidebar">
              {/* Illustration */}
              <div className="verification-image-container">
                <div className="image-frame">
                  <img
                    src="/images/status-page-voco.jfif"
                    alt="Verification illustration"
                    className="status-image"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="verification-action-container">
                <Button
                  type="primary"
                  onClick={() => history.push('/Verification')}
                  className="verification-button"
                >
                  Start Verification
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default StatusPage;
