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
            <div className="account-container">
              {/* Header Row */}
              <div className="account-header">
                <h3 className="account-title">Live Account</h3>
                <Button type="default" className="attach-btn" onClick={() => setModalVisible(true)}>
                  +MT5 Sub Account
                </Button>
              </div>

              {/* Account Info Grid */}
              <div className="account-grid">
                {/* Row 1 */}
                <div className="account-field">
                  <div className="label">Account ID</div>
                  <div className="value bolda">{u.Login}</div>
                </div>
                <div className="account-field">
                  <div className="label">Balance</div>
                  <div className="value bolda">${u.Balance?.toFixed(2) ?? '0.00'}</div>
                </div>
                <div className="account-field">
                  <div className="label">Equity</div>
                  <div className="value">${u.EquityPrevDay?.toFixed(2) ?? '0.00'}</div>
                </div>
                <div className="account-field">
                  <div className="label">Free Margin</div>
                  <div className="value">${u.MarginFree?.toFixed(2) ?? '0.00'}</div>
                </div>

                {/* Row 2 */}
                <div className="account-field">
                  <div className="label">Margin</div>
                  <div className="value">${u.Margin?.toFixed(2) ?? '0.00'}</div>
                </div>
                <div className="account-field">
                  <div className="label">Margin Level</div>
                  <div className="value">{u.MarginLevel?.toFixed(2) ?? '0.00'}%</div>
                </div>
                {/* <div className="account-field">
                  <div className="label">Profit</div>
                  <div className={`value ${u.Profit < 0 ? 'negative' : 'positive'}`}>
                    {u.Profit < 0
                      ? `-$${Math.abs(u.Profit).toFixed(2)}`
                      : `$${u.Profit?.toFixed(2)}`}
                  </div>
                </div> */}
                <div className="account-field">
                  <div className="label">Agent Code</div>
                  <div className="value">{appUser.Promo || '--'}</div>
                </div>
              </div>
            </div>
          ),
        };
      }) || [];

    getUserAccount();
    setTabs(tabs);
  }, [appUser]);

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
          {/* {!isAdmin && (
            <Button
              type="button"
              onClick={() => {
                if (tabs.length >= 5) {
                  ShowError({ body: 'MT users limit (5 per account) is reached!' });
                } else {
                  setModalVisible(true);
                }
              }}
              style={{ marginBottom: 15 }}
              className="attachmt5-btn"
            >
              Attach MT5 Account
            </Button>
          )} */}
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
        {/* <img src="/images/step.png" alt="Account Info" className="account-side-img" /> */}

        <div>
          {/* <img src="/images/dashimg1.png" alt="" style={{ height: 450, width: 500}} className='dashimg1-dashboard' /> */}
        </div>
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

  /*  setTimeout(() => {
     setLoading(true);
   }, 1000);
  */

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

  // const onFinish = (values) => {
  //   // Prevent the default form submission behavior
  //   // This will prevent the modal from closing automatically
  //   console.log('Form values:', values);
  // };

  // const onOk = () => {

  //   onClick={handleAttach}
  // }

  //  const handleAttach = async () => {
  //   try {
  //      const values = form.getFieldsValue();
  // const MT5Response = await api.app.AttachMtLogin(values);
  //     console.log(MT5Response);
  //     form.resetFields();
  //   } catch (error) {
  //   console.error('Error attaching MT5 login:', error);
  //       }
  // };

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
    // {
    //   name: 'Status',
    //   selector: 'status',
    //   sortable: true,
    // },
  ];

  const lastFiveTransactions = transactions;

  const tabs: TabsProps['items'] = [
    {
      key: '1',
      label: <span className="live-account-tab">Live Accounts</span>, // Add class
      children: <LiveAccount appUser={userData} getUser={getUser} />,
    },

    // {
    //   key: '2',
    //   label: `Partner Account`,
    //   children: `Partner Account`,
    //   className: 'dashboard-tabs',

    // },
  ];

  const handleChange = () => {};
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
              {/* <div style={{ marginLeft: 170 }}>
                <Button type="primary" onClick={handleAttach}>
                  Attach
                </Button>
              </div> */}
            </Form>
          </Card>
        </Modal>
      </>
    );
  };
  console.log('isAdmin::', isAdmin);

  const customStyles = {
    header: {
      style: {
        fontSize: '16px',
        fontWeight: '600',
        color: '#111827',
      },
    },
    headRow: {
      style: {
        backgroundColor: '#f4f7fb',
        fontSize: '13px',
        fontWeight: '600',
        textTransform: 'uppercase',
      },
    },
    rows: {
      style: {
        fontSize: '14px',
        color: '#1f2937',
        minHeight: '48px',
      },
    },
    headCells: {
      style: {
        padding: '12px',
      },
    },
    cells: {
      style: {
        padding: '12px',
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
            {/* <div className="voco-username-tag">
              {`@ ${userData.FirstName} ${userData.LastName}`}
            </div> */}
            <PageContainer>
              <div className="dashboard-flex">
                {/* Wallet Card */}
                <div className="wallet-card">
                  <div className="wallet-info">
                    <div className="wallet-info-label">WALLET ID</div>
                    <div className="wallet-info-value">{`# ${userData.Wallet?.Id} USD`}</div>
                  </div>
                  <div className="wallet-balance">
                    <div className="wallet-balance-label">WALLET BALANCE</div>
                    <div className="wallet-balance-value">
                      ${userData.Wallet?.Balance ?? '0.00'}
                    </div>
                  </div>
                  <div className="wallet-buttons">
                    <button
                      onClick={() => history.push('/finops/deposit')}
                      className="wallet-button-deposit"
                    >
                      ↓ Deposit
                    </button>
                    <button
                      onClick={() => history.push('/finops/withdraw')}
                      className="wallet-button-withdraw"
                    >
                      ↑ Withdraw
                    </button>
                  </div>
                </div>

                {/* Right Grid */}
                <div className="transaction-grid">
                  {[
                    {
                      title: 'Total Deposit',
                      amount: data.totalDeposit,
                      colorClass: 'direction-down',
                      arrow: '↓',
                    },
                    {
                      title: 'Total Withdrawal',
                      amount: data.totalWithdraw,
                      colorClass: 'direction-up',
                      arrow: '↑',
                    },
                    {
                      title: 'Total MT5 Deposit',
                      amount: data.totalMt5Deposit,
                      colorClass: 'direction-down',
                      arrow: '↓',
                    },
                    {
                      title: 'Total MT5 Withdrawal',
                      amount: data.totalMt5Withdraw,
                      colorClass: 'direction-up',
                      arrow: '↑',
                    },
                  ].map((item, i) => (
                    <div key={i} className="transaction-box">
                      <div className="transaction-title">{item.title}</div>
                      <div className="transaction-amount">${item.amount}</div>
                      <div className={`transaction-direction ${item.colorClass}`}>
                        {item.arrow} All time
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Divider />

              {/* MOVED: Live Accounts section */}
              <Tabs defaultActiveKey="1" items={tabs} onChange={onTabChange} />

              <Divider />

              {/* MOVED: Last Five Wallet Transactions section */}
              <Title level={5} style={{ fontFamily: 'math' }}>
                Last Five Wallet Transactions
              </Title>

              <div className="recent-transactions">
                <DataTable
                  title={
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        width: '100%',
                      }}
                    >
                      <span style={{ fontFamily: 'math', fontSize: '16px' }}></span>
                     
                      <Link to="/finops/transaction_history" className="view-all-btn">
                        <ClockCircleOutlined className="view-all-icon" />
                        View All
                      </Link>
                    </div>
                  }
                  columns={columnsTransaction}
                  data={lastFiveTransactions}
                  customStyles={customStyles}
                  keyField="transactionId"
                  highlightOnHover
                  responsive
                  selectableRows={false}
                  dense
                  progressComponent={<div>Loading...</div>}
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
