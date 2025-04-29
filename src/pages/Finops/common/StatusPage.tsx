import { history } from '@umijs/max';
import { Spin } from 'antd';
import Card from 'antd/es/card/Card';
import Button from 'antd/lib/button';
import React, { useEffect, useState } from 'react';
import '../../../common.css';

const StatusPage: React.FC = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  return (
    <div className="verification-container">
      {loading ? (
        <div className="verification-loader">
          <Spin tip="Loading..." spinning={loading} size="large" />
        </div>
      ) : (
        <div className="verification-wrapper">
          <Card className="verification-card">
            <div className="verification-header">
              <h2 className="verification-title">Account Verification Required</h2>
              <div className="badge-alert">Action Needed</div>
              <p className="verification-instructions">
                Please complete your profile verification in Settings to unlock all features.
              </p>
            </div>

            <div className="verification-body">
              <div className="verification-image-container">
                <div className="image-frame">
                  <img
                    src="/images/status-page-voco.jfif"
                    alt="Verification illustration"
                    className="status-image"
                  />
                </div>
              </div>

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
          </Card>
        </div>
      )}
    </div>
  );
};

export default StatusPage;
