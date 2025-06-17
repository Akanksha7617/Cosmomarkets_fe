import { api } from '@/components/common/api';
import { ApiError, IbRequestModel } from '@/generated';
import Clients from '@/pages/IB/Clients';
import {
  BankOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CopyOutlined,
  DashboardOutlined,
  LinkOutlined,
  MailOutlined,
  SendOutlined,
  StarOutlined,
  TeamOutlined,
  UserOutlined,
  WhatsAppOutlined,
} from '@ant-design/icons';
import { Button, message, Typography } from 'antd';
import React, { useEffect, useState } from 'react';
import '../../common.css';
import config from '../../components/config.json';
import CustomLoader from '../CustomLoader';

const { Title, Text } = Typography;

// Base URL configuration
let BaseUrl;
if (config.prod === 'yes') {
  BaseUrl = config.baseUrl;
} else {
  BaseUrl = config.local + ':' + config.localPort;
}

// Dashboard component
const DashboardContent = () => {
  const [ibRequest, setIbRequest] = useState<IbRequestModel>({});
  const [requested, setRequested] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  // Fetch data on component mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    api.ib
      .getMyRequests()
      .then((response) => {
        if (response.length > 0) {
          setData(response);
          setIbRequest(response[0]);
          setRequested(true);
        }
      })
      .catch(() => {});
    setRequested(false);
  }, []);

  // Request IB account function
  const requestIbAccount = async () => {
    setLoading(true);
    try {
      const response = await api.ib.postIbRequest({
        userComment: 'Please create an IB account.',
      });
      message.success({
        content: 'IB account requested successfully!',
        icon: <CheckCircleOutlined style={{ color: '#34a853' }} />,
        duration: 3,
      });
      setRequested(true);
      setIbRequest(response[0]);
      setData(response);
    } catch (e) {
      const er = e as ApiError;
      message.error({
        content: er.body.message,
        duration: 3,
      });
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return <CustomLoader />;
  }

  // Not requested state
  if (!requested) {
    return (
      <div className="ib-onboarding-container">
        <div className="ib-onboarding-card">
          <div style={{ marginBottom: '24px' }}>
            <BankOutlined className="ib-onboarding-icon" />
          </div>
          <Title level={3} className="ib-onboarding-title">
            Become an IB Partner
          </Title>
          <Text className="ib-onboarding-description">
            Join our introducing broker program and earn commissions by referring clients to our
            trading platform. Build your network and grow your revenue with our comprehensive
            partnership program.
          </Text>
          <Button
            type="primary"
            size="large"
            onClick={requestIbAccount}
            className="ib-primary-button"
            icon={<StarOutlined />}
          >
            Request IB Account
          </Button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return '#34a853';
      case 'pending':
        return '#fbbc04';
      case 'rejected':
        return '#ea4335';
      default:
        return '#1a73e8';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return <CheckCircleOutlined />;
      case 'pending':
        return <ClockCircleOutlined />;
      default:
        return <ClockCircleOutlined />;
    }
  };

  // Requested state
  return (
    <div>
      {/* Page Header */}
      <div className="ib-page-header">
        <Title level={2} className="ib-page-title">
          IB Dashboard
        </Title>
        <Text className="ib-page-subtitle">
          Monitor your account status and manage your referral activities
        </Text>
      </div>

      {/* Stats Grid */}
      <div className="ib-stats-container">
        <div
          className={`ib-stat-card ${hoveredCard === 'status' ? 'hovered' : ''}`}
          onMouseEnter={() => setHoveredCard('status')}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <div
            className="ib-icon-container status"
            style={{ backgroundColor: getStatusColor(ibRequest.status || 'Pending') + '10' }}
          >
            {React.cloneElement(getStatusIcon(ibRequest.status || 'Pending'), {
              style: { fontSize: '20px', color: getStatusColor(ibRequest.status || 'Pending') },
            })}
          </div>
          <Text className="ib-stat-label">Account Status</Text>
          <Title level={4} className="ib-stat-value">
            {ibRequest.status || 'Pending'}
          </Title>
        </div>

        <div
          className={`ib-stat-card ${hoveredCard === 'code' ? 'hovered' : ''}`}
          onMouseEnter={() => setHoveredCard('code')}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <div className="ib-icon-container code">
            <LinkOutlined style={{ fontSize: '20px', color: '#1a73e8' }} />
          </div>
          <Text className="ib-stat-label">IB Code</Text>
          <Title level={4} className="ib-stat-value code">
            {ibRequest.ibCode || 'Pending'}
          </Title>
        </div>

        <div
          className={`ib-stat-card ${hoveredCard === 'manager' ? 'hovered' : ''}`}
          onMouseEnter={() => setHoveredCard('manager')}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <div className="ib-icon-container manager">
            <UserOutlined style={{ fontSize: '20px', color: '#5f6368' }} />
          </div>
          <Text className="ib-stat-label">Account Manager</Text>
          <Title level={4} className="ib-stat-value">
            {ibRequest.managerName || 'Not Assigned'}
          </Title>
        </div>
      </div>

      {/* Referral Section */}
      <div className="ib-referral-card">
        <Title level={4} className="ib-referral-title">
          Referral Link
        </Title>
        <Text className="ib-referral-description">
          Share this link with potential clients to earn commissions on their trading activities.
        </Text>

        <div className="ib-link-box">
          <Text className="ib-link-text">
            {ibRequest.ibCode
              ? `${BaseUrl}/user/login/Signup?signup=true&promo=${ibRequest.ibCode}`
              : 'Your referral link will be generated once your account is approved'}
          </Text>
          {ibRequest.ibCode && (
            <Button
              className="ib-copy-button"
              icon={<CopyOutlined />}
              onClick={() => {
                navigator.clipboard.writeText(
                  `${BaseUrl}/user/login/Signup?signup=true&promo=${ibRequest.ibCode}`,
                );
                message.success({
                  content: 'Link copied to clipboard',
                  icon: <CheckCircleOutlined style={{ color: '#34a853' }} />,
                  duration: 2,
                });
              }}
            >
              Copy
            </Button>
          )}
        </div>

        {ibRequest.ibCode && (
          <div className="ib-share-buttons-container">
            <Button
              className="ib-share-button"
              icon={<MailOutlined />}
              onClick={() =>
                window.open(
                  `mailto:?subject=Trading Platform Invitation&body=Join our trading platform using my referral link: ${BaseUrl}/user/login/Signup?signup=true&promo=${ibRequest.ibCode}`,
                  '_blank',
                )
              }
            >
              Email
            </Button>

            <Button
              className="ib-share-button"
              icon={<WhatsAppOutlined />}
              onClick={() =>
                window.open(
                  `https://api.whatsapp.com/send?text=Join our trading platform using my referral link: ${BaseUrl}/user/login/Signup?signup=true&promo=${ibRequest.ibCode}`,
                  '_blank',
                )
              }
            >
              WhatsApp
            </Button>

            <Button
              className="ib-share-button"
              icon={<SendOutlined />}
              onClick={() =>
                window.open(
                  `https://t.me/share/url?url=${BaseUrl}/user/login/Signup?signup=true&promo=${ibRequest.ibCode}&text=Join our trading platform via my referral link`,
                  '_blank',
                )
              }
            >
              Telegram
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

// Main IB component with elegant tabs
const IB = () => {
  const [activeKey, setActiveKey] = useState('1');

  return (
    <div className="ib-container">
      <div className="ib-content-wrapper">
        <div className="ib-custom-tabs">
          {/* Elegant Tab Header */}
          <div className="ib-tab-header">
            <button
              className={`ib-tab-button ${activeKey === '1' ? 'active' : ''}`}
              onClick={() => setActiveKey('1')}
            >
              <DashboardOutlined style={{ fontSize: '16px' }} />
              Dashboard
            </button>
            <button
              className={`ib-tab-button ${activeKey === '2' ? 'active' : ''}`}
              onClick={() => setActiveKey('2')}
            >
              <TeamOutlined style={{ fontSize: '16px' }} />
              Clients
            </button>
          </div>

          {/* Tab Content */}
          <div className="ib-tab-content">
            {activeKey === '1' ? <DashboardContent /> : <Clients />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IB;
