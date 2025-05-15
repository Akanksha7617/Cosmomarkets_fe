import { api } from '@/components/common/api';
import { ApiError, IbRequestModel } from '@/generated';
import Clients from '@/pages/IB/Clients';
import { Button, Card, Col, message, Row, Tabs, Typography } from 'antd';
import { useEffect, useState } from 'react';
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
        icon: <span className="orange-success-icon"> ✔ </span>,
        className: 'orange-success-notification',
        duration: 3,
      });
      setRequested(true);
      setIbRequest(response[0]);
      setData(response);
    } catch (e) {
      const er = e as ApiError;
      message.error({
        content: er.body.message,
        icon: <span className="orange-error-icon"> ✘ </span>,
        className: 'orange-error-notification',
        duration: 3,
      });
    } finally {
      setLoading(false);
    }
  };

  // Define table columns
  // const columns = [
  //   {
  //     title: 'Status',
  //     dataIndex: 'status',
  //     key: 'status',
  //     render: (text) => (
  //       <Tag color={text === 'Approved' ? 'success' : 'processing'}>
  //         {text}
  //       </Tag>
  //     ),
  //   },
  //   {
  //     title: 'Approving Manager',
  //     dataIndex: 'managerName',
  //     key: 'manager',
  //   },
  //   {
  //     title: 'IB Code',
  //     dataIndex: 'ibCode',
  //     key: 'ibCode',
  //   },
  //   {
  //     title: 'Referral URL',
  //     key: 'referralUrl',
  //     render: (_, record) => (
  //       record.ibCode ? `${BaseUrl}/user/login/Signup?signup=true&promo=${record.ibCode}` : '-'
  //     ),
  //   },
  // ];

  // Loading state
  if (loading) {
    return <CustomLoader />;
  }

  // Not requested state
  if (!requested) {
    return (
      <div
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}
      >
        <div style={{ maxWidth: '400px', marginRight: '40px' }}>
          <Title level={3}>Become an IB Partner</Title>
          <Text>Start earning commissions by referring clients to our platform.</Text>
          <Button
            type="primary"
            style={{ marginTop: '20px', backgroundColor: '#FA8E21', borderColor: '#FA8E21' }}
            onClick={requestIbAccount}
          >
            Create IB Account
          </Button>
        </div>
        <div>
          <img
            src="/images/create-IB.png"
            alt="IB Partnership"
            style={{ maxWidth: '100%', height: 'auto' }}
          />
        </div>
      </div>
    );
  }

  // Requested state
  return (
    <div>
      <Title level={3} style={{ marginBottom: '24px' }}>
        IB DASHBOARD
      </Title>

      {/* Status table */}
      {/* <Table 
        dataSource={data} 
        columns={columns} 
        pagination={false}
        rowKey="id"
      /> */}

      {/* Stats cards */}
      <Row gutter={16} style={{ marginTop: '24px' }}>
        <Col xs={24} sm={12} md={6}>
          <Card
            style={{
              backgroundColor: 'transparent',
              border: '1px solid #d9d9d9',
              borderRadius: '8px',
              boxShadow: 'none',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: '#FFF7E6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '16px',
                }}
              >
                <span role="img" aria-label="status" style={{ fontSize: '24px', color: '#FA8E21' }}>
                  📊
                </span>
              </div>
              <div>
                <Text type="secondary">Status</Text>
                <div>
                  <Text strong style={{ fontSize: '17px' }}>
                    {ibRequest.status || 'Pending'}
                  </Text>
                </div>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card
            style={{
              backgroundColor: 'transparent',
              border: '1px solid #d9d9d9',
              borderRadius: '8px',
              boxShadow: 'none',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: '#FFF7E6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '16px',
                }}
              >
                <span role="img" aria-label="code" style={{ fontSize: '24px', color: '#FA8E21' }}>
                  🔢
                </span>
              </div>
              <div>
                <Text type="secondary">IB Code</Text>
                <div>
                  <Text strong style={{ fontSize: '17px' }}>
                    {ibRequest.ibCode || 'Pending'}
                  </Text>
                </div>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card
            style={{
              backgroundColor: 'transparent',
              border: '1px solid #d9d9d9',
              borderRadius: '8px',
              boxShadow: 'none',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: '#FFF7E6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '16px',
                }}
              >
                <span
                  role="img"
                  aria-label="manager"
                  style={{ fontSize: '24px', color: '#FA8E21' }}
                >
                  🧑‍🏫
                </span>
              </div>
              <div>
                <Text type="secondary">Approving Manager</Text>
                <div>
                  <Text strong style={{ fontSize: '17px' }}>
                    {ibRequest.managerName || 'Pending'}
                  </Text>
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Referral link */}
      <Card style={{ marginTop: '24px' }}>
        <Title level={5}>Your Referral Link</Title>
        <div
          style={{
            padding: '12px',
            backgroundColor: '#f5f5f5',
            borderRadius: '4px',
            marginTop: '12px',
            position: 'relative',
          }}
        >
          <Text style={{ display: 'block', wordBreak: 'break-all' }}>
            {ibRequest.ibCode
              ? `${BaseUrl}/user/login/Signup?signup=true&promo=${ibRequest.ibCode}`
              : 'Pending approval'}
          </Text>
          {ibRequest.ibCode && (
            <Button className='copy-button'
             
              onClick={() => {
                navigator.clipboard.writeText(
                  `${BaseUrl}/user/login/Signup?signup=true&promo=${ibRequest.ibCode}`,
                );
                message.success({
                  content: 'Link copied to clipboard successfully!',
                  icon: <span className="orange-success-icon"> ✔ </span>,
                  className: 'orange-success-notification',
                  duration: 3,
                });
              }}
            >
              Copy
            </Button>
          )}
        </div>

        <div style={{ display: 'flex', gap: '12px', marginTop: '16px', flexWrap: 'wrap',  }}>
          <Button
          
            icon={<span>📧</span>}
            onClick={() =>
              window.open(
                `mailto:?subject=Join Sigma&body=Sign up using this link: ${BaseUrl}/user/login/Signup?signup=true&promo=${ibRequest.ibCode}`,
                '_blank',
              )
            }
          >
            Share via Email
          </Button>

          <Button
            icon={<span>📱</span>}
            onClick={() =>
              window.open(
                `https://api.whatsapp.com/send?text=Join%20Sigma!%20Use%20my%20referral%20link:%20${BaseUrl}/user/login/Signup?signup=true&promo=${ibRequest.ibCode}`,
                '_blank',
              )
            }
          >
            Share via WhatsApp
          </Button>

          <Button
            icon={<span>✈️</span>}
            onClick={() =>
              window.open(
                `https://t.me/share/url?url=${BaseUrl}/user/login/Signup?signup=true&promo=${ibRequest.ibCode}&text=Join%20Sigma%20via%20my%20referral%20link!`,
                '_blank',
              )
            }
          >
            Share via Telegram
          </Button>
        </div>

        {/* <Text type="secondary" style={{ marginTop: '12px', display: 'block' }}>
          Share this link with potential clients to earn commissions.
        </Text> */}
      </Card>
    </div>
  );
};

// Main IB component with tabs
const IB = () => {
  const [activeKey, setActiveKey] = useState('1');

  return (
    <Tabs
      activeKey={activeKey}
      onChange={setActiveKey}
      renderTabBar={(props, DefaultTabBar) => (
        <div className="custom-tab-bar-wrapper">
          <DefaultTabBar {...props} className="custom-tab-bar" />
        </div>
      )}
      items={[
        {
          key: '1',
          label: (
            <div className="tab-label-wrapper">
              <div className={`tab-label ${activeKey === '1' ? 'active' : ''}`}>Dashboard</div>
            </div>
          ),
          children: <DashboardContent />,
        },
        {
          key: '2',
          label: (
            <div className="tab-label-wrapper">
              <div className={`tab-label ${activeKey === '2' ? 'active' : ''}`}>Clients</div>
            </div>
          ),
          children: <Clients />,
        },
      ]}
    />
  );
};

export default IB;
