import { api } from '@/components/common/api';
import { ApiError, IbRequestModel } from '@/generated';
import {
  BankOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CopyOutlined,
  LinkOutlined,
  StarOutlined,
  TeamOutlined,
  UserOutlined,
  UsergroupAddOutlined,
} from '@ant-design/icons';
import { Button, message, Typography, Card, Row, Col, Progress } from 'antd';
import React, { useEffect, useState } from 'react';
import '../../common.css';
import config from '../../components/config.json';
import CustomLoader from '../CustomLoader';
import Clients from '@/pages/IB/Clients';

const { Title, Text } = Typography;

// Base URL config
const BaseUrl = config.prod === 'yes' ? config.baseUrl : `${config.local}:${config.localPort}`;

const IB = () => {
  const [ibRequest, setIbRequest] = useState<IbRequestModel>({});
  const [requested, setRequested] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
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
      .catch(() => setRequested(false));
  }, []);

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
      message.error({ content: er.body.message, duration: 3 });
    } finally {
      setLoading(false);
    }
  };
  const [clientsCount, setClientsCount] = useState(0);


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
      default:
        return <ClockCircleOutlined />;
    }
  };

  if (loading) return <CustomLoader />;

  if (!requested)
    return (
      <div className="ib-onboarding-container">
        <div className="ib-onboarding-card">
          <BankOutlined className="ib-onboarding-icon" />
          <Title level={3} className="ib-onboarding-title">
            Become an IB Partner
          </Title>
          <Text className="ib-onboarding-description">
            Join our introducing broker program and earn commissions by referring clients.
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

  return (
    <div className="ib-container">
      <div className="ib-content-wrapper">
        <div className="ib-hero-section">
          <Row align="middle" justify="space-between">
            <Col span={16}>
              <Title level={1} className="ib-hero-title">
                Welcome to Your IB Dashboard
              </Title>
              <Text className="ib-hero-description">
                Track your performance, manage clients, and grow your network
              </Text>
            </Col>
          </Row>
        </div>

        {/* Stats Cards */}
        {/* Stats Cards */}
        <Row gutter={[20, 20]} className="ib-stats-row">
          <Col xs={24} sm={12} lg={12}>
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
          </Col>

          <Col xs={24} sm={12} lg={12}>
            <div className="ib-stat-card">
              <div className="ib-icon-container">
                <UsergroupAddOutlined className="ib-stat-icon" />
              </div>
              <Text className="ib-stat-label">Clients</Text>
              <Title level={4} className="ib-stat-value">
                {clientsCount}
              </Title>

            </div>
          </Col>
        </Row>
        {/* Referral + Clients */}
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={8}>
            <div className="ib-referral-card">
              <Title level={4} className="ib-referral-title">
                <LinkOutlined className="ib-referral-icon" />
                Referral Link
              </Title>
              <Text>Share this link to earn commissions on your clients’ trades.</Text>
              <div className="ib-referral-code-box">
                <Text className="ib-referral-label">Your IB Code</Text>
                <Title level={3} className="ib-referral-code">
                  {ibRequest.ibCode || 'Pending'}
                </Title>
              </div>

              <div className="ib-link-box">
                <Text>
                  {ibRequest.ibCode
                    ? `${BaseUrl}/user/login/Signup?signup=true&promo=${ibRequest.ibCode}`
                    : 'Referral link will be generated once approved'}
                </Text>
                {ibRequest.ibCode && (
                  <Button
                    className="ib-copy-button"
                    icon={<CopyOutlined />}
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `${BaseUrl}/user/login/Signup?signup=true&promo=${ibRequest.ibCode}`,
                      );
                      message.success('Link copied to clipboard');
                    }}
                  >
                    Copy
                  </Button>
                )}
              </div>

              {/* <Progress percent={50} strokeColor="#34a853" size="small" /> */}
              <div className="ib-manager-box">
                <UserOutlined /> Manager: <b>{ibRequest.managerName || 'Not Assigned'}</b>
              </div>
            </div>
          </Col>

          <Col xs={24} lg={16}>
            <Card className="ib-clients-card">
              <Clients
                defaultTab="active"
                onClientCountChange={(count) => setClientsCount(count)}
              />
            </Card>
          </Col>

        </Row>
      </div>
    </div>
  );
};

export default IB;