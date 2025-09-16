import { api, ShowError } from '@/components/common/api';
import { AppUserModel, MtUserRequest, TransactionModel } from '@/generated';
import { ClockCircleOutlined } from '@ant-design/icons';
import ProCard from '@ant-design/pro-card';
import { PageContainer, ProFormText } from '@ant-design/pro-components';
import { ProForm, ProFormDigit } from '@ant-design/pro-form';
import { history, Link, useModel } from '@umijs/max';
import {
  Button,
  Card,
  Col,
  Divider,
  Form,
  Input,
  InputRef,
  Modal,
  Row,
  Space,
  Tabs,
  TabsProps,
  theme,
  Typography,
} from 'antd';
import { FilterConfirmProps } from 'antd/es/table/interface';
import TabPane from 'antd/es/tabs/TabPane';
import React, { useEffect, useRef, useState } from 'react';
// import { SHA256 } from 'crypto-js';
import moment from 'moment';
import DataTable from 'react-data-table-component';
import '../../common.css';
import AdminDashboard from '../Admin/AdminDashboard';
import CustomLoader from '../CustomLoader';
// import { getTrsanction } from '@/services/ant-design-pro/api';
import { Encrypt } from '@/generated/services/Encrypt';
import { ConfigProvider } from 'antd';
import enUS from 'antd/lib/locale/en_US';
import ErrorPage from '../ErrorPage';
const encryptor = new Encrypt();

const { Title, Text } = Typography;

const LiveAccount: React.FC<{ appUser: AppUserModel; getUser: Function }> = ({
  appUser,
  getUser,
}) => {
  const [tabs, setTabs] = useState<any[]>([]);
  const [form] = Form.useForm();
  const [modalVisible, setModalVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [userData, setUserData] = useState<AppUserModel>({});

  const [loading, setLoading] = useState(true);

  const getUserAccount = async () => {
    setLoading(true);

    try {
      const userResponse = await api.app.getMeEncrypt();
      const r = encryptor.decrypData(userResponse);
      console.log(r);
      setUserData(userResponse);
    } catch (error) {
      console.error('Error fetching user account data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const tabs =
      appUser.UserDtos?.map((u) => {
        return {
          key: u.Login,
          title: u.Login,
          content: (
            <div className="live-account-card-wrapper">
              <div className="live-account-top-strip"></div>
              <div className="live-account-container">
                {/* Header Row */}
                <div className="live-account-header">
                  <button className="arrow-button" onClick={() => setModalVisible(true)}>
                    +MT5 Sub Account
                  </button>
                </div>

                {/* Main Content - Horizontal Layout */}
                <div className="main-content-wrapper">
                  {/* Left Side - Balance Display */}
                  <div className="balance-display-section">
                    <div className="main-balance">
                      <div className="balance-label">Account Balance</div>
                      <div className="balance-amount">${u.Balance?.toFixed(2) ?? '0.00'}</div>
                      <div className="balance-subtitle">Available for trading</div>
                    </div>

                    {/* Quick Action Buttons */}
                    <div className="quick-actions">
                      <button
                        onClick={() => history.push('/finops/deposit?account=mt5')}
                        className="action-btn deposit-btn"
                      >
                        Deposit
                      </button>
                      <button
                        onClick={() => history.push('/finops/withdraw?account=mt5')}
                        className="action-btn withdraw-btn"
                      >
                        Withdraw
                      </button>
                    </div>
                  </div>

                  {/* Right Side - Account Details & Performance */}
                  <div className="right-content">
                    {/* Account Details Grid */}
                    <div className="account-details-section">
                      <h4 className="section-title">Account Details</h4>
                      <div className="live-account-grid">
                        <div className="live-account-field">
                          <div className="label">Equity</div>
                          <div className="value">${u.EquityPrevDay?.toFixed(2) ?? '0.00'}</div>
                        </div>
                        <div className="live-account-field">
                          <div className="label">Free Margin</div>
                          <div className="value">${u.MarginFree?.toFixed(2) ?? '0.00'}</div>
                        </div>
                        <div className="live-account-field">
                          <div className="label">Used Margin</div>
                          <div className="value">${u.Margin?.toFixed(2) ?? '0.00'}</div>
                        </div>
                        <div className="live-account-field">
                          <div className="label">Margin Level</div>
                          <div className={`value ${u.MarginLevel > 100 ? 'positive' : 'negative'}`}>
                            {u.MarginLevel?.toFixed(2) ?? '0.00'}%
                          </div>
                        </div>
                        <div className="live-account-field">
                          <div className="label">Agent Code</div>
                          <div className="value">{appUser.Promo || '--'}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ),
        };
      }) || [];

    getUserAccount();
    setTabs(tabs);
  }, [appUser]);
  const tabBarStyle = {
    background: 'transparent',
    border: 'none',
    marginBottom: '0',
  };

  const tabStyle = {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    color: '#00d4ff',
    fontWeight: '600',
    marginRight: '8px',
  };

  const handleCancel = () => {
    setModalVisible(false);
  };
  // setShowButton(false);

  const handleFinish = async (values: any) => {
    form.validateFields().then(async (values) => {
      const newCard: MtUserRequest = {
        login: values.login,
        masterPassword: values.masterPassword,
        investorPassword: values.investorPassword,
      };
      try {
        await api.app.putMyMt5Account(newCard);
        form.resetFields();
        setModalVisible(false);
        getUser();
      } catch (e: any) {
        ShowError(e);
      }
    });
  };
  const handleShow = () => {
    setShowButton(true);
  };
  const isAdmin = userData.Roles?.includes('Admin');

  return (
    <>
      <Row>
        <Space>
          {isAdmin && (
            <Button
              type={'primary'}
              onClick={async () => {
                try {
                  if (tabs.length >= 5) {
                    ShowError({ body: 'MT users limit (5 per account) is reached!' });
                  } else {
                    await api.app.postMyMt5Account();
                    getUser();
                  }
                } catch (e: any) {
                  ShowError(e);
                }
              }}
            >
              Create MT5 Account
            </Button>
          )}
        </Space>
      </Row>

      <Row justify="space-between">
        <Col>
          <ProCard>
            <Tabs className="tabs">
              {tabs.map((tab) => (
                <TabPane tab={tab.title} key={tab.key}>
                  <ProCard className="mt5-cards">{tab.content}</ProCard>
                </TabPane>
              ))}
            </Tabs>
          </ProCard>
        </Col>
      </Row>
      <ConfigProvider locale={enUS}>
        <Modal open={modalVisible} footer={null} onCancel={handleCancel}>
          <ProForm form={form} onFinish={handleFinish} layout="vertical">
            <ProFormDigit
              name="login"
              label="login"
              placeholder="Please Enter Login Details"
              rules={[
                {
                  required: true,
                  message: 'Please enter a positive number',
                  type: 'integer',
                  transform: (value) => (value ? Number(value) : undefined),
                  validator: (_, value) => {
                    if (value > 0) {
                      return Promise.resolve();
                    }
                    return Promise.reject('Please enter a positive number');
                  },
                },
              ]}
            />

            <ProFormText
              name="masterPassword"
              label="Master Password"
              placeholder="Please Enter Master Password"
              rules={[{ required: true, message: 'Please enter your Master Password' }]}
            />

            <ProFormText
              name="investorPassword"
              label="Investor Password"
              placeholder="Please Enter Investor Password"
              rules={[{ required: true, message: 'Please enter your Investor Password' }]}
            />
          </ProForm>
        </Modal>
      </ConfigProvider>
    </>
  );
};

const Dashboard: React.FC = () => {
  const { token } = theme.useToken();
  const { initialState } = useModel('@@initialState');
  const [data, setData] = useState('0');
  const [transactions, setTransactions] = useState<TransactionModel[]>([]);
  const [userData, setUserData] = useState<AppUserModel>({});
  const [totalDeposit, setTotalDeposit] = useState(0);
  const [totalWithDraw, setTotalWithDraw] = useState(0);
  const [mt5Deposit, setMt5Deposit] = useState(0);
  const [mt5Withdraw, setMt5Withdraw] = useState(0);
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const searchInput = useRef<InputRef>();
  const [form] = Form.useForm();
  const [isAdmin, setIsAdmin] = useState<boolean>(true);
  const [isUserError, setUserError] = useState<boolean>(false);
  const [isAttach, setIsAttach] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  // Add this new state for main tabs
  const [activeMainTab, setActiveMainTab] = useState('wallet');

  const handleSearch = (
    selectedKeys: string[],
    confirm: (param?: FilterConfirmProps) => void,
    dataIndex: string,
  ) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };
  const handleReset = (clearFilters: () => void) => {
    clearFilters();
    setSearchText('');
  };

  const onTabChange = (key: string) => {
    console.log(key);
  };

  useEffect(() => {
    const fetchData = async () => {
      const response = await api.transaction.getTransactionDetails();
      const limitedResponse = await api.transaction.getLimitedTransaction(1, 5);
      setData(response);
      setTransactions(limitedResponse.requests);
      if (response) {
        await getUser();
      }
      setTimeout(() => {
        setLoading(false); // Set loading to false once the data is fetched
      }, 1000); // Simulate 2 seconds of loading time (remove this in your actual implementation)
    };

    fetchData();
  }, []);

  const getUser = async () => {
    try {
      const responseEncrypt = await api.app.getMeEncrypt();
      const response = encryptor.decrypData(responseEncrypt.encryptedData);
      const userResponse = JSON.parse(response);
      console.log('rspo');
      console.log(userResponse);

      // { userResponse.MtUsers[0].password === "" ? setIsAttach(false) : setIsAttach(false) }
      {
        userResponse.Roles?.includes('Admin') ? setIsAdmin(true) : setIsAdmin(false);
      }

      setUserData(userResponse);
    } catch (error) {
      setUserError(true);
      console.log('getUser Dashbord error', error);
    }
  };
  // const hashAndFormatWalletId = (walletId) => `#${SHA256(walletId).toString()}`
  const [showForm, setShowForm] = useState(false);
  const formRef = useRef(null);
  const [login, setlogin] = useState('');
  const [server, setserver] = useState('');
  const [userId, setuserId] = useState('');
  const [masterPassword, setMasterPassword] = useState('');
  const [investorPassword, setInvestorPassword] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleAttach = async () => {
    try {
      const formData = {
        login,
        userId,
        masterPassword,
        investorPassword,
        server,
      };

      const MT5Response = await api.app.AttachMtLogin(formData);
      setlogin('');
      setserver('');
      setMasterPassword('');
      setInvestorPassword('');
      setuserId('');
      setIsModalVisible(false);
    } catch (error) {
      console.error('Error attaching MT5 login:', error);
    }
  };

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const columnsTransaction = [
    {
      name: 'Ticket',
      selector: 'id',
      sortable: true,
    },
    {
      name: 'Date',
      selector: 'requestedAt',
      sortable: true,
      cell: (row) => {
        const formatDate = moment(row.requestedAt).format('YYYY-MM-DD');
        return <span>{formatDate}</span>;
      },
    },
    {
      name: 'Currency',
      selector: 'currency',
      sortable: true,
    },
    {
      name: 'Action',
      selector: 'type',
      sortable: true,
    },
    {
      name: 'Method',
      selector: 'paymentMethod',
      sortable: true,
      hide: 'sm', // Hide this column on small screens
    },
    {
      name: 'Amount',
      selector: 'amount',
      sortable: true,
      right: true, // Align content to the right
      cell: (row) => `${row.amount?.toFixed(2)}`,
    },
    {
      name: 'Status',
      selector: 'status',
      sortable: true,
      right: false,
      cell: (row) => {
        const statusText = row.status;
        // console.log(`Status Text: ${statusText}`);

        const statusValueEnum = {
          Rejected: {
            text: 'Rejected',
            status: 'red',
          },
          Approved: {
            text: 'Approved',
            status: 'green',
          },
          Requested: {
            text: 'Requested',
            status: 'black',
          },
          Completed: {
            text: 'Completed',
            status: 'green',
          },
        };

        const statusValue = statusValueEnum[statusText];
        console.log(`Status Value: ${statusValue.status}`);

        return <span style={{ color: statusValue.status }}>{statusValue.text}</span>;
      },
    },
  ];

  const lastFiveTransactions = transactions;

  // Live Account tabs (sub-tabs within Live Account main tab)
  const liveAccountTabs: TabsProps['items'] = [
    {
      key: '1',
      label: <span className="live-account-tab"> </span>,

      // label: <span className="live-account-tab"> MT5 Live Accounts </span>,
      children: <LiveAccount appUser={userData} getUser={getUser} />,
    },
  ];

  // Main tabs (Wallet and Live Account)
  const mainTabs: TabsProps['items'] = [
    {
      key: 'wallet',
      label: <span className="main-tab">Wallet</span>,
      children: (
        <div className="dashboard-main-layout">
          {/* Left Section - Wallet Card */}
          <div className="dashboard-left-section">
            <div className="unified-card-container">
              <div className="unified-card">
                {/* Wallet info and buttons */}
                <div className="wallet-left-content">
                  {/* Two Box Layout for Wallet Balance and Wallet ID */}
                  <div className="wallet-top-section">
                    {/* Enhanced Wallet Balance Card - Blue Design */}
                    <div className="wallet-balance-box">
                      <div className="wallet-box-header">
                        <span className="wallet-label">Wallet Balance</span>
                      </div>
                      <div className="wallet-amount">${userData.Wallet?.Balance ?? '0.00'}</div>
                      <div className="wallet-trend">
                        <svg
                          className="trend-icon positive"
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                        </svg>
                        
                      </div>
                    
                    </div>

                    {/* Enhanced Wallet ID Card - White Design */}
                    <div className="wallet-id-box">
                      <div className="wallet-box-header">
                        <span className="wallet-label">Wallet ID</span>
                      </div>
                      <div className="wallet-id-value">#{userData.Wallet?.Id ?? '00000'}</div>
                      <div className="wallet-trend">
                        <svg
                          className="trend-icon positive-green"
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="action-buttons">
                    <button
                      onClick={() => history.push('/finops/deposit')}
                      className="action-btn deposit-btn"
                    >
                      
                      Deposit
                    </button>
                    <button
                      onClick={() => history.push('/finops/withdraw')}
                      className="action-btn withdraw-btn"
                    >
                      
                      Withdraw
                    </button>
                  </div>
                </div>

                {/* History Section */}
                <div className="wallet-right-content">
                  <div className="history-section">
                    <div className="history-header">
                      <h3>History</h3>
                      <button className="view-all-btn">View All</button>
                    </div>

                    <div className="history-list">
                      <div className="history-item deposit">
                        <div className="history-icon">
                          
                        </div>
                        <div className="history-details">
                          <div className="history-title">Total Deposit</div>
                          <div className="history-date">All time</div>
                        </div>
                        <div className="history-amount positive">+${data.totalDeposit}</div>
                      </div>

                      <div className="history-item withdraw">
                        <div className="history-icon">
                          
                        </div>
                        <div className="history-details">
                          <div className="history-title">Total Withdrawal</div>
                          <div className="history-date">All time</div>
                        </div>
                        <div className="history-amount negative">-${data.totalWithdraw}</div>
                      </div>

                      <div className="history-item mt5_deposit">
                        <div className="history-icon">
                         
                            
                        </div>
                        <div className="history-details">
                          <div className="history-title">Total MT5 Deposit</div>
                          <div className="history-date">All time</div>
                        </div>
                        <div className="history-amount positive">+${data.totalMt5Deposit}</div>
                      </div>

                      <div className="history-item mt5_withdraw">
                        <div className="history-icon">
                          
                        </div>
                        <div className="history-details">
                          <div className="history-title">Total MT5 Withdrawal</div>
                          <div className="history-date">All time</div>
                        </div>
                        <div className="history-amount negative">-${data.totalMt5Withdraw}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'liveaccount',
      label: <span className="main-tab"> MT5 Live Account</span>,
      children: (
        <div className="dashboard-main-layout">
          {/* Right Section - Live Accounts */}
          <div className="dashboard-right-section">
            <Tabs defaultActiveKey="1" items={liveAccountTabs} onChange={onTabChange} />
          </div>
        </div>
      ),
    },
  ];

  const handleChange = () => { };
  // const [loading, setLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  const AttachAccount = () => {
    return (
      <>
        <Divider />

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button type="primary" style={{ marginLeft: 'auto' }} onClick={showModal}>
            Attach MT5 Account
          </Button>
        </div>
        {/* {console.log("isModalVisible :", isModalVisible)} */}
        <Modal title="" open={isModalVisible} onOk={handleAttach} onCancel={handleCancel}>
          <Card style={{ width: 500, alignItems: 'center' }}>
            <h1 style={{ marginLeft: 180 }}>Attach MT5</h1>
            <Form>
              <Form.Item label="Login" style={{ fontWeight: 'bold' }}>
                <Input
                  type="number"
                  placeholder="MT5 Login"
                  value={login}
                  onChange={(e) => setlogin(e.target.value)}
                  style={{ margin: '10px 0', marginLeft: 80, width: 330 }}
                />
              </Form.Item>
              <Form.Item label="Server IP" style={{ fontWeight: 'bold' }} hidden>
                <Input
                  type="number"
                  placeholder="Server IP"
                  value={server}
                  onChange={(e) => setserver(e.target.value)}
                  style={{ margin: '10px 0', marginLeft: 60, width: 330 }}
                  hidden
                />
              </Form.Item>
              <Form.Item label="Master Password" style={{ fontWeight: 'bold' }}>
                <Input.Password
                  placeholder="Master Password"
                  value={masterPassword}
                  onChange={(e) => setMasterPassword(e.target.value)}
                  style={{ margin: '10px 0', marginLeft: 10 }}
                />
              </Form.Item>
              <Form.Item label="Investor Password" style={{ fontWeight: 'bold' }} hidden>
                <Input.Password
                  placeholder="Investor Password"
                  value={investorPassword}
                  onChange={(e) => setInvestorPassword(e.target.value)}
                  style={{ margin: '10px 0', width: 330 }}
                  hidden
                />
              </Form.Item>
              <Form.Item label="User ID" style={{ fontWeight: 'bold' }} hidden>
                <Input
                  placeholder="User ID"
                  value={userId}
                  onChange={(e) => setuserId(e.target.value)}
                  style={{ margin: '10px 0', marginLeft: 70, width: 330 }}
                  hidden
                />
              </Form.Item>
            </Form>
          </Card>
        </Modal>
      </>
    );
  };
  console.log('isAdmin::', isAdmin);

  const enhancedCustomStyles = {
    table: {
      style: {
        backgroundColor: 'white',
        borderRadius: '0 0 12px 12px',
        overflow: 'hidden',
      },
    },
    header: {
      style: {
        backgroundColor: 'white',
        borderRadius: '12px 12px 0 0',
        padding: '0',
        margin: '0',
        border: 'none',
        boxShadow: 'none',
      },
    },
    headRow: {
      style: {
        backgroundColor: '#f8fafc',
        borderBottom: '2px solid #e2e8f0',
        minHeight: '56px',
        fontWeight: '600',
      },
    },
    headCells: {
      style: {
        padding: '16px 20px',
        fontSize: '13px',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        color: '#64748b',
        borderRight: '1px solid #f1f5f9',
      },
    },
    rows: {
      style: {
        fontSize: '14px',
        fontWeight: '500',
        color: '#1e293b',
        minHeight: '60px',
        borderBottom: '1px solid #f1f5f9',
        transition: 'all 0.2s ease',
        cursor: 'default',
      },
      highlightOnHoverStyle: {
        backgroundColor: '#f8fafc',
        borderBottomColor: '#e2e8f0',
        transform: 'translateY(-1px)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      },
    },
    cells: {
      style: {
        padding: '16px 20px',
        fontSize: '14px',
        fontWeight: '500',
        borderRight: '1px solid #f1f5f9',
      },
    },
    pagination: {
      style: {
        backgroundColor: '#f8fafc',
        borderTop: '1px solid #e2e8f0',
        padding: '12px 20px',
      },
    },
  };

  console.log('user--->', isUserError);
  return (
    <>
      {loading ? (
        <CustomLoader />
      ) : !isUserError ? (
        !isAdmin ? (
          <div className="dashboard-container">
            <PageContainer>
              {/* Main Tabs - Wallet and Live Account */}
              <Tabs
                defaultActiveKey="wallet"
                items={mainTabs}
                onChange={(key) => setActiveMainTab(key)}
                className="main-dashboard-tabs"
              />

              <Divider />

              {/* Last Five Wallet Transactions section - Always visible */}
              <div className="recent-transactions">
                <DataTable
                  title={
                    <div className="recent-transactions-header">
                      <h3 className="recent-transactions-title">Recent Wallet Transactions</h3>
                      <Link to="/finops/transaction_history" className="view-all-btn">
                        <ClockCircleOutlined className="view-all-icon" />
                        View All
                      </Link>
                    </div>
                  }
                  columns={columnsTransaction}
                  data={lastFiveTransactions}
                  customStyles={enhancedCustomStyles}
                  keyField="transactionId"
                  highlightOnHover
                  responsive
                  selectableRows={false}
                  dense={false}
                  progressComponent={
                    <div className="loading-wrapper">
                      <div className="loading-spinner"></div>
                      <span>Loading transactions...</span>
                    </div>
                  }
                  noDataComponent={
                    <div className="no-data-wrapper">
                      <div className="no-data-icon">📊</div>
                      <div className="no-data-text">No transactions found</div>
                    </div>
                  }
                />
              </div>

              <Divider />

              <div className="attach-btn">
                {isAttach ? (
                  <Button type="primary" danger onClick={showModal}>
                    Attach Existing
                  </Button>
                ) : (
                  <Button type="primary" danger onClick={showModal} hidden>
                    Attach Existing
                  </Button>
                )}
              </div>

              <Modal title="" open={isModalVisible} onOk={handleAttach} onCancel={handleCancel}>
                <Modal
                  visible={isModalVisible}
                  onCancel={() => {
                    setIsModalVisible(false);
                    setShowForm(false);
                  }}
                  footer={null}
                >
                  {showForm && (
                    <div className="modal-form">
                      <h1>Attach MT5</h1>
                      <Form>
                        <Form.Item label="Login">
                          <Input
                            type="number"
                            placeholder="MT5 Login"
                            value={login}
                            onChange={(e) => setlogin(e.target.value)}
                            style={{ marginLeft: 80, width: 350 }}
                          />
                        </Form.Item>
                        <Form.Item label="Server IP" hidden>
                          <Input
                            type="number"
                            placeholder="Server IP"
                            value={server}
                            onChange={(e) => setserver(e.target.value)}
                            style={{ marginLeft: 60, width: 330 }}
                            hidden
                          />
                        </Form.Item>
                        <Form.Item label="Master Password">
                          <Input.Password
                            placeholder="Master Password"
                            value={masterPassword}
                            onChange={(e) => setMasterPassword(e.target.value)}
                            style={{ marginLeft: 10 }}
                          />
                        </Form.Item>
                        <Form.Item label="Investor Password" hidden>
                          <Input.Password
                            placeholder="Investor Password"
                            value={investorPassword}
                            onChange={(e) => setInvestorPassword(e.target.value)}
                            style={{ width: 330 }}
                          />
                        </Form.Item>
                        <Form.Item label="User ID" hidden>
                          <Input
                            placeholder="User ID"
                            value={userId}
                            onChange={(e) => setuserId(e.target.value)}
                            style={{ marginLeft: 70, width: 330 }}
                          />
                        </Form.Item>
                      </Form>
                    </div>
                  )}
                </Modal>
              </Modal>
            </PageContainer>
          </div>
        ) : (
          <AdminDashboard />
        )
      ) : (
        <ErrorPage />
      )}
    </>
  );
};

export default Dashboard;
