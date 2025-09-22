import {
  BankTwoTone,
  DislikeTwoTone,
  FileExcelOutlined,
  LikeTwoTone,
  RedoOutlined,
  SearchOutlined,
  DownOutlined,
} from '@ant-design/icons';
import type { ActionType } from '@ant-design/pro-components';
import { api, rawApi } from '@/components/common/api';
import { TextPopconfirm } from '@/components/Custom/TextPopconfirm';
import { AccountType, AppUserDto, SignUpRequest, Status, TransactionModel } from '@/generated';
import CustomLoader from '@/pages/CustomLoader';
import { useModel } from '@@/exports';
import {
  Button,
  DatePicker,
  Dropdown,
  Form,
  Input,
  Menu,
  MenuProps,
  message,
  Space,
  theme,
  Card,
  Row,
  Col,
  Typography,
  Tag,
  Drawer,
} from 'antd';
import Modal from 'antd/es/modal/Modal';
import moment from 'moment';
import { useEffect, useRef, useState } from 'react';
import DataTable from 'react-data-table-component';
import '../../../common.css';
import { Type } from '../../../generated/models/Type';

const { Search } = Input;
const { RangePicker } = DatePicker;
const { Text } = Typography;

interface Data {
  id: number;
  name: string;
  email: string;
  Ticket: number;
  WalletId: number;
  Date: any;
  Method: string;
  Amount: any;
  status: any;
  Currency: any;
  Login: number;
  paymentMethod: string;
}

type DataIndex = keyof Data;

// Mobile Transaction Card Component
const MobileTransactionCard = ({ 
  transaction, 
  onEdit, 
  onViewDetails, 
  initialState, 
  token, 
  setLoading,
  fetchData,
  pagination,
  globalSearchText,
  dateRange,
  selectedValue
}) => {
  const getStatusColor = (status) => {
    const colors = {
      'Rejected': 'red',
      'Approved': 'green',
      'Requested': 'orange',
      'Completed': 'green'
    };
    return colors[status] || 'default';
  };

  const formatDate = (dateString) => {
    return moment(dateString).format('YYYY-MM-DD');
  };

  return (
    <Card
      size="small"
      style={{ 
        marginBottom: 12,
        borderRadius: 8,
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}
      bodyStyle={{ padding: '12px 16px' }}
    >
      <Row gutter={[8, 8]}>
        <Col span={24}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <Text strong style={{ fontSize: 16, cursor: 'pointer' }} onClick={() => onEdit(transaction)}>
              {transaction.client}
            </Text>
            <Tag color={getStatusColor(transaction.status)}>
              {transaction.status}
            </Tag>
          </div>
        </Col>
        
        <Col span={12}>
          <Text type="secondary" style={{ fontSize: 12 }}>Wallet #</Text>
          <div>{transaction.wallet?.id}</div>
        </Col>
        
        <Col span={12}>
          <Text type="secondary" style={{ fontSize: 12 }}>Amount</Text>
          <div style={{ fontWeight: 'bold' }}>
            {transaction.amount?.toFixed(2)} {transaction.currency}
          </div>
        </Col>
        
        <Col span={12}>
          <Text type="secondary" style={{ fontSize: 12 }}>Date</Text>
          <div>{formatDate(transaction.requestedAt)}</div>
        </Col>
        
        <Col span={12}>
          <Text type="secondary" style={{ fontSize: 12 }}>Method</Text>
          <div>{transaction.paymentMethod}</div>
        </Col>
        
        <Col span={24}>
          <Text 
            type="secondary" 
            style={{ 
              fontSize: 12, 
              display: 'block',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {transaction.email}
          </Text>
        </Col>
        
        <Col span={24}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, gap: 8, flexWrap: 'wrap' }}>
            <Button 
              size="small" 
              onClick={() => onViewDetails(transaction)}
              style={{ flex: 1, minWidth: '80px' }}
            >
              Details
            </Button>
            
            {initialState?.currentUser?.roles?.includes('Manager') && (
              <Space size={4} style={{ flex: 1, justifyContent: 'flex-end' }}>
                {transaction.status === Status.REQUESTED &&
                transaction.managerId === initialState?.currentUser?.id ? (
                  <></>
                ) : null}
                
                {transaction.type === 'WalletToExt' && (
                  <Button size="small" onClick={() => onEdit(transaction)}>
                    <BankTwoTone twoToneColor={token.colorPrimary} />
                  </Button>
                )}
                
                <TextPopconfirm
                  initText={'Approved'}
                  initAmount={transaction.amount}
                  onConfirm={(comment: string, amount?: number) => {
                    setLoading(true);
                    api.transaction
                      .putTransactionById(transaction.id, {
                        approved: true,
                        comment: comment,
                        amount: amount,
                      })
                      .then(() => {
                        fetchData(
                          pagination.current,
                          pagination.pageSize,
                          globalSearchText,
                          transaction.Type,
                          dateRange.start,
                          dateRange.end,
                          selectedValue,
                        );
                      })
                      .catch((error) => {
                        console.error('Error in API request:', error);
                      })
                      .finally(() => {
                        setLoading(false);
                      });
                  }}
                >
                  <Button size="small">
                    <LikeTwoTone twoToneColor={token.colorSuccess} />
                  </Button>
                </TextPopconfirm>
                
                <TextPopconfirm
                  initText={'Rejected'}
                  onConfirm={(comment: string) => {
                    api.transaction
                      .putTransactionById(transaction.id, {
                        approved: false,
                        comment: comment,
                      })
                      .then(() =>
                        fetchData(
                          pagination.current,
                          pagination.pageSize,
                          '',
                          transaction.type,
                          dateRange.start,
                          dateRange.end,
                          '',
                        ),
                      );
                  }}
                >
                  <Button size="small">
                    <DislikeTwoTone twoToneColor={token.colorError} />
                  </Button>
                </TextPopconfirm>
              </Space>
            )}
          </div>
        </Col>
      </Row>
    </Card>
  );
};

export default () => {
  const actionRef = useRef<ActionType>();
  const [data, setData] = useState([]);
  const { initialState, setInitialState } = useModel('@@initialState');
  const [visible, setVisible] = useState(false);
  const [selected, setSelected] = useState<AppUserDto>({});
  const { token } = theme.useToken();
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const [transactions, setTransactions] = useState<TransactionModel[]>([]);
  const [mt5Transaction, setMt5Transaction] = useState<TransactionModel[]>([]);
  const [refreshCount, setRefreshCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [visibleCrypto, setVisibleCrypto] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [dateRange, setDateRange] = useState({
    start: '',
    end: '',
  });
  const [selectedValue, setSelectedValue] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [globalSearchText, setGlobalSearchText] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [detailsDrawerVisible, setDetailsDrawerVisible] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const customStyles = {
    headCells: {
      style: {
        background: '#005f73',
        color: 'white',
        fontWeight: 'bold',
        fontSize: '13px',
        borderBottom: '2px solid #fff',
        borderRight: '1px solid #fff',
      },
    },
    rows: {
      style: {
        '&:hover': {
          background: '#f5f5f5',
          transition: 'background-color 0.3s ease',
          cursor: 'pointer',
        },
        borderBottom: '1px solid #ddd',
      },
    },
    cells: {
      style: {
        borderRight: '1px solid #ddd',
        textAlign: 'center',
      },
    },
  };

  const fetchData = async (
    page: any,
    pageSize: any,
    param: any,
    type: any,
    startDate: any,
    endDate: any,
    status: any,
  ) => {
    console.log('====>', type);
    try {
      setLoading(true);
      const response = await api.transaction.getLimitedTransactionAdmin(
        page,
        pageSize,
        param,
        Type.WALLET_TO_EXT,
        startDate,
        endDate,
        status,
      );
      setPagination({ ...pagination, current: page, total: response.totalRecords });
      setTransactions(response.requests);
      setTotalAmount(response?.totalAmount);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchDebounced = (value) => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    const timeout = setTimeout(() => {
      fetchData(
        pagination.current,
        pagination.pageSize,
        value,
        '',
        dateRange.start,
        dateRange.end,
        selectedValue,
      );
    }, 500);
    setSearchTimeout(timeout);
  };

  useEffect(() => {
    handleSearchDebounced(globalSearchText);
  }, [globalSearchText, pagination.current, pagination.pageSize]);

  const handlePageChange = (page: any) => {
    setPagination({ ...pagination, current: page });
  };

  const handlePageSizeChange = (size) => {
    const totalRecords = pagination.total;
    const currentRecordIndex = (pagination.current - 1) * pagination.pageSize;
    const newPageIndex = Math.ceil((currentRecordIndex + 1) / size);

    setPagination({
      ...pagination,
      pageSize: size,
      current: newPageIndex,
    });
  };

  const handleSubmit1 = async (values: Record<string, any>) => {
    const urlParams = new URL(window.location.href).searchParams;
    let urlWithToken = null;
  
    try {
      const msg = await api.app.postSignIn({
        email: values.email,
        password: values.password,
      });
  
      if (msg.status === 'ok') {
        const token = msg.token;
        window.open(`${window.location.href}?token=${token}`, '_blank', 'noreferrer');
      } else {
        if (msg.message.includes('User is disabled by admin')) {
          message.error({
            content: 'User is disabled by admin',
            icon: <span className="red-error-icon"> ✘ </span>,
            className: 'red-error-notification',
            duration: 4,
          });
        } else {
          const defaultLoginFailureMessage = 'Login failed. Please try again.';
          message.error({
            content: defaultLoginFailureMessage,
            icon: <span className="red-error-icon"> ✘ </span>,
            className: 'red-error-notification',
            duration: 4,
          });
          throw new Error('Incorrect username/password');
        }
      }
    } catch (error) {
      const defaultLoginFailureMessage = error.message || 'Login failed. Please try again.';
      console.log(error);
      message.error({
        content: defaultLoginFailureMessage,
        icon: <span className="red-error-icon"> ✘ </span>,
        className: 'red-error-notification',
        duration: 4,
      });
    }
  };

  const handleMenuClick = (key, record) => {
    if (key === 'approved') {
      // showConfirmationModal('Approved', record);
    } else if (key === 'rejected') {
      // showConfirmationModal('Rejected', record);
    }
  };

  const handleViewDetails = (record) => {
    setSelectedTransaction(record);
    setDetailsDrawerVisible(true);
  };

  const columns = [
    {
      name: 'Ticket #',
      selector: 'id',
      sortable: true,
      right: false,
      hide: true,
    },
    {
      name: 'Wallet #',
      selector: (row) => row.wallet?.id,
      sortable: true,
      right: false,
    },
    {
      name: 'Name',
      selector: 'client',
      sortable: false,
      grow: 2,
      cell: (row) => (
        <div onClick={() => handleSubmit1(row)} style={{ cursor: 'pointer' }}>
          {`${row.client} `}
        </div>
      ),
    },
    {
      name: 'Email',
      grow: 3,
      selector: 'email',
      sortable: true,
      right: false,
    },
    {
      name: 'Date',
      selector: 'requestedAt',
      sortable: true,
      right: false,
      format: (row) => moment(row.requestedAt).format('YYYY-MM-DD'),
    },
    {
      name: 'Currency',
      selector: 'currency',
      sortable: true,
      right: false,
      width: '110px',
    },
    {
      name: 'Method',
      selector: 'paymentMethod',
      sortable: true,
      right: false,
    },
    {
      name: 'Amount',
      selector: (row) => `${row.amount?.toFixed(2)} ${row.currency}`,
      sortable: true,
      right: true,
      width: '110px',
    },
    {
      name: 'Status',
      selector: 'status',
      sortable: true,
      right: false,
      cell: (row) => {
        const statusText = row.status;
        console.log(row.status);
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
        return <span style={{ color: statusValue.status }}>{statusValue.text}</span>;
      },
    },
  ];

  if (initialState?.currentUser?.roles?.includes('Manager')) {
    columns.push({
      name: 'Action',
      selector: 'action',
      sortable: false,
      right: true,
      cell: (record: any) => (
        <Space size={0}>
          {record.status === Status.REQUESTED &&
          record.managerId === initialState?.currentUser?.id ? (
            <></>
          ) : null}
          <Dropdown
            trigger={['click']}
            overlay={
              <Menu onClick={(e) => handleMenuClick(e.key, record)}>
                {record.type === 'WalletToExt' && (
                  <Menu.Item key="edit">
                    <Button onClick={() => handleEdit(record)}>
                      <BankTwoTone twoToneColor={token.colorPrimary} />
                    </Button>
                  </Menu.Item>
                )}
                <Menu.Item key="approved">
                  Approve
                  <TextPopconfirm
                    initText={'Approved'}
                    initAmount={record.amount}
                    onConfirm={(comment: string, amount?: number) => {
                      setLoading(true);
                      api.transaction
                        .putTransactionById(record.id, {
                          approved: true,
                          comment: comment,
                          amount: amount,
                        })
                        .then(() => {
                          fetchData(
                            pagination.current,
                            pagination.pageSize,
                            globalSearchText,
                            record.Type,
                            dateRange.start,
                            dateRange.end,
                            selectedValue,
                          );
                        })
                        .catch((error) => {
                          console.error('Error in API request:', error);
                        })
                        .finally(() => {
                          setLoading(false);
                        });
                    }}
                  >
                    <Button>
                      <LikeTwoTone twoToneColor={token.colorSuccess} />
                    </Button>
                  </TextPopconfirm>
                </Menu.Item>
                <Menu.Item key="rejected">
                  Reject
                  <TextPopconfirm
                    initText={'Rejected'}
                    onConfirm={(comment: string) => {
                      api.transaction
                        .putTransactionById(record.id, {
                          approved: false,
                          comment: comment,
                        })
                        .then(() =>
                          fetchData(
                            pagination.current,
                            pagination.pageSize,
                            '',
                            record.type,
                            dateRange.start,
                            dateRange.end,
                            '',
                          ),
                        );
                    }}
                  >
                    <Button>
                      <DislikeTwoTone twoToneColor={token.colorError} />
                    </Button>
                  </TextPopconfirm>
                </Menu.Item>
              </Menu>
            }
          >
            <Button className='actionbtn-wid' >
              {/* style={{ backgroundColor: '#eeab4c', color: 'white', marginBottom: 5 }} */}
              Action <DownOutlined />
            </Button>
          </Dropdown>
        </Space>
      ),
    });
  } else {
    columns.push({
      name: 'Action',
      selector: 'action',
      sortable: false,
      right: true,
      cell: (record: any) => (
        <Space size={0}></Space>
      ),
    });
  }

  const handleEdit = (record: AppUserDto) => {
    const password = record.mtUsers?.find((m) => m.accountType == AccountType.CLIENT)?.password;
    var s: SignUpRequest = {
      ...record,
      password: password,
    };
    const formData = {
      beneficiary: record.bank ? record.bank.beneficiary : null,
      bankName: record.bank ? record.bank.name : null,
      bankAddress: record.bank ? record.bank.address : null,
      accountNumber: record.bank ? record.bank.account : null,
      ifscIBAN: record.bank ? record.bank.ifscIban : null,
      additionalComment: record.bank ? record.bank.comment : null,
    };

    const cryptoForm = {
      cyrptoWalletAddress: record.cryptoWallet ? record.cryptoWallet.cyrptoWalletAddress : null,
      additionalComment: record.cryptoWallet ? record.cryptoWallet.comment : null,
    };
    console.log('formValue:::', record);
    if (record.paymentMethod == 'USDT') {
      console.log('crypto:::::::::::::::', record.cryptoWallet);
      setSelected(record.cryptoWallet);
      form.setFieldsValue(cryptoForm);
      setVisibleCrypto(true);
      console.log('formValue::::::::::::', cryptoForm);
    } else {
      setVisible(true);
      console.log('bankdetails:::::::::::::::', record.bank);
      setSelected(record.bank);
      form.setFieldsValue(formData);
      setVisible(true);
    }
  };

  const handleOk = () => {
    console.log('handleok-->');
    setVisible(false);
  };

  const handleOkBank = () => {
    console.log('handleok-->');
    form.validateFields().then(async (values: SignUpRequest | undefined) => {
      if (!selected.id) {
        return;
      }
      setVisibleCrypto(false);
      await fetchData(pagination.current, pagination.pageSize, '', '');
    });
  };

  async function exportExcel() {
    let response = await rawApi.get(`/api/app/transaction/exportNew/xlsx`, {
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'transactions.xlsx');
    document.body.appendChild(link);
    link.click();
    
    message.success({
      content: 'Downloading File...',
      icon: <span className="green-success-icon"> ✔ </span>,
      className: 'green-success-notification',
      duration: 3,
    });
  
    window.URL.revokeObjectURL(url);
    link.remove();
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  const clearDateRange = () => {
    fetchData(pagination.current, pagination.pageSize, globalSearchText, '', '', '');
  };

  const handleRangePickerClear = () => {
    console.log('Inside handleRangePickerClear');
    setDateRange({ start: dateRange.start, end: dateRange.end });
  };

  const handleDivRefresh = () => {
    if (dateRange.start == null && dateRange.end === null && selectedValue == null) {
      fetchData(pagination.current, pagination.pageSize, globalSearchText, '', '', '', '');
    } else {
      fetchData(
        pagination.current,
        pagination.pageSize,
        globalSearchText,
        '',
        dateRange.start,
        dateRange.end,
        selectedValue,
      );
    }
  };

  const handleDateChange = async (dates: any) => {
    console.log('datepicker', dates);
    try {
      let formattedStartDate = '';
      let formattedEndDate = '';
      if (dates) {
        const [startDate, endDate] = dates;
        formattedStartDate = startDate.format('YYYY-MM-DD 00:00:00');
        formattedEndDate = endDate.format('YYYY-MM-DD 23:59:59');

        setDateRange({
          start: formattedStartDate,
          end: formattedEndDate,
        });

        await fetchData(
          pagination.current,
          pagination.pageSize,
          '',
          Type.EXT_TO_WALLET,
          formattedStartDate,
          formattedEndDate,
          selectedValue,
        );

        console.log('Selected date range:', formattedStartDate, formattedEndDate);
      } else {
        setDateRange({
          start: '',
          end: '',
        });
      }
    } catch (error) {
      console.log('Something went wrong', error);
      await fetchData(pagination.current, pagination.pageSize, '', Type.EXT_TO_WALLET, '', '');
    }
  };

  const predefinedRanges = {
    Today: [moment(), moment()],
    Yesterday: [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
    'Last 7 Days': [moment().subtract(6, 'days'), moment()],
    'Last Month': [
      moment().subtract(1, 'months').startOf('month'),
      moment().subtract(1, 'months').endOf('month'),
    ],
  };

  const handleDropdownClick = async (key: string) => {
    console.log('======', key);
    try {
      const selectedValue = key;
      console.log('Selected Value:', selectedValue);

      setSelectedValue(selectedValue);
      let formattedStartDate = '';
      let formattedEndDate = '';
      if (dateRange != undefined) {
        const startDate = dateRange?.start as any;
        const endDate = dateRange?.end as any;
        if (startDate) {
          formattedStartDate = moment(startDate)?.format('YYYY-MM-DD 00:00:00');
        }
        if (endDate) {
          formattedEndDate = moment(endDate)?.format('YYYY-MM-DD 23:59:59');
        }
      }
      setDateRange({
        start: formattedStartDate,
        end: formattedEndDate,
      });

      await fetchData(
        pagination.current,
        pagination.pageSize,
        globalSearchText,
        Type.EXT_TO_WALLET,
        formattedStartDate,
        formattedEndDate,
        selectedValue,
      );

      console.log('Selected date range:', formattedStartDate, formattedEndDate);
    } catch (error) {
      console.log('Something went wrong', error);
      await fetchData(pagination.current, pagination.pageSize, '', Type.EXT_TO_WALLET, '', '', '');
    }
  };

  const onClick: MenuProps['onClick'] = ({ key }) => {
    handleDropdownClick(key);
  };

  const items: MenuProps['items'] = [
    {
      label: 'Requested',
      key: 'Requested',
    },
    {
      label: 'Approved',
      key: 'Approved',
    },
    {
      label: 'Rejected',
      key: 'Rejected',
    },
    {
      label: 'All',
      key: '',
    },
  ];

  return (
    <div style={{ padding: isMobile ? '8px' : '16px' }}>
      {/* Search Bar */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'flex-end', 
        marginBottom: 16 
      }}>
        <Input
          size={isMobile ? "middle" : "small"}
          placeholder="Search"
          prefix={<SearchOutlined style={{ color: '#eeab4c' }} />}
          style={{
            width: isMobile ? '100%' : '250px',
            height: '40px',
            border: '2px solid #eeab4c',
            borderRadius: '10px 0px 10px 0px',
            paddingLeft: '15px',
            backgroundColor: '#fff',
          }}
          value={globalSearchText}
          onChange={(e) => setGlobalSearchText(e.target.value)}
        />
      </div>

      <div className="my-data-table" style={{ flex: 1, overflowY: 'auto' }}>
        <h2 style={{ 
          fontSize: isMobile ? '18px' : '24px',
          textAlign: isMobile ? 'center' : 'left',
          marginBottom: 16
        }}>
          WITHDRAW TRANSACTIONS
        </h2>
        
        <div className="datepicker-container" style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: 12,
          alignItems: isMobile ? 'stretch' : 'center',
          marginBottom: 16,
          flexWrap: 'wrap'
        }}>
          <RangePicker
            ranges={predefinedRanges}
            onChange={handleDateChange}
            allowClear
            placement="bottomLeft"
            format="YYYY-MM-DD"
            style={{ 
              width: isMobile ? '100%' : 'auto',
              minWidth: isMobile ? 'unset' : '250px'
            }}
          />
          
          <Dropdown menu={{ items, onClick }}>
            <a onClick={(e) => e.preventDefault()}>
              <span
                style={{
                  padding: '5px',
                  margin: '8px',
                  color: 'white',
                  border: '1px solid white',
                  borderRadius: '5px',
                  backgroundColor: '#eeab4c',
                  display: 'inline-block',
                  minWidth: isMobile ? '120px' : 'auto',
                  textAlign: 'center'
                }}
              >
                Status: {selectedValue || 'All'}
                <DownOutlined />
              </span>
            </a>
          </Dropdown>
          
           <button 
  className="divrefresh-btn" 
  onClick={handleDivRefresh}
  style={{
    width: isMobile ? '100%' : 'auto',
    padding: '6px 16px',             
    display: 'flex',                
    alignItems: 'center',           
    justifyContent: 'center',       
    lineHeight: 1,                 
    fontSize: '14px',                
    cursor: 'pointer'              
  }}
>
  Search
</button>
          
        
        </div>
         <div
            style={{
              width: isMobile ? '100%' : '200px',
              padding: '8px',
              fontWeight: 700,
              fontSize: '16px',
              textAlign: isMobile ? 'center' : 'left',
              backgroundColor: '#f5f5f5',
              borderRadius: '4px',
              marginTop: isMobile ? 8 : 0
            }}
          >
            Total Amount: {totalAmount}
          </div>

        {/* Conditional Rendering: Mobile Cards or Desktop Table */}
        {isMobile ? (
          <div>
            {loading && <CustomLoader />}
            {!loading && transactions.map((transaction) => (
              <MobileTransactionCard
                key={transaction.id}
                transaction={transaction}
                onEdit={handleEdit}
                onViewDetails={handleViewDetails}
                initialState={initialState}
                token={token}
                setLoading={setLoading}
                fetchData={fetchData}
                pagination={pagination}
                globalSearchText={globalSearchText}
                dateRange={dateRange}
                selectedValue={selectedValue}
              />
            ))}
            
            {/* Mobile Pagination */}
            {!loading && (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginTop: 16,
                padding: '16px 0',
                flexWrap: 'wrap',
                gap: 8
              }}>
                <Button 
                  size="small" 
                  disabled={pagination.current <= 1}
                  onClick={() => handlePageChange(pagination.current - 1)}
                >
                  Previous
                </Button>
                
                <span style={{ fontSize: '14px' }}>
                  Page {pagination.current} of {Math.ceil(pagination.total / pagination.pageSize)}
                </span>
                
                <Button 
                  size="small"
                  disabled={pagination.current >= Math.ceil(pagination.total / pagination.pageSize)}
                  onClick={() => handlePageChange(pagination.current + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        ) : (
          <DataTable
            columns={columns}
            className="my-data-table"
            data={transactions}
            customStyles={customStyles}
            keyField="id"
            highlightOnHover
            responsive
            selectableRows={false}
            dense
            pagination
            paginationServer
            paginationTotalRows={pagination.total}
            paginationPerPage={10}
            onChangePage={handlePageChange}
            onChangeRowsPerPage={handlePageSizeChange}
            paginationRowsPerPageOptions={[10, 20, 30]}
            paginationComponentOptions={{ rowsPerPageText: 'Rows per page:' }}
            progressPending={loading}
            progressComponent={loading ? <CustomLoader /> : null}
            actions={[
              <a key="exportExcel" onClick={exportExcel}>
                <FileExcelOutlined style={{ color: '#f89d42' }} />
              </a>,
              <a key="handleDivRefresh" onClick={handleDivRefresh}>
                <RedoOutlined style={{ color: '#f89d42' }} />
              </a>,
            ]}
          />
        )}
      </div>

      {/* Bank Details Modal */}
      <Modal 
        title="Bank Details" 
        open={visible} 
        onOk={handleOk} 
        onCancel={() => setVisible(false)}
        width={isMobile ? '95%' : 520}
        style={isMobile ? { top: 20 } : {}}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="beneficiary" label="Beneficiary" rules={[{ required: true }]}>
            <Input disabled style={{ border: 0, backgroundColor: 'ffffff', color: 'black' }} />
          </Form.Item>
          <Form.Item name="bankName" label="Bank Name" rules={[{ required: true }]}>
            <Input disabled style={{ border: 0, backgroundColor: 'ffffff', color: 'black' }} />
          </Form.Item>
          <Form.Item name="bankAddress" label="Bank Address" rules={[{ required: true }]}>
            <Input disabled style={{ border: 0, backgroundColor: 'ffffff', color: 'black' }} />
          </Form.Item>
          <Form.Item name="accountNumber" label="Account Number" rules={[{ required: true }]}>
            <Input disabled style={{ border: 0, backgroundColor: 'ffffff', color: 'black' }} />
          </Form.Item>
          <Form.Item name="ifscIBAN" label="IFSC/IBAN" rules={[{ required: true }]}>
            <Input disabled style={{ border: 0, backgroundColor: 'ffffff', color: 'black' }} />
          </Form.Item>
          <Form.Item name="additionalComment" label="Additional Comment" rules={[{ required: true }]}>
            <Input disabled style={{ border: 0, backgroundColor: 'ffffff', color: 'black' }} />
          </Form.Item>
        </Form>
      </Modal>

      {/* USDT Details Modal */}
      <Modal
        title="USDT Details"
        open={visibleCrypto}
        onOk={() => setVisibleCrypto(false)}
        onCancel={() => setVisibleCrypto(false)}
        width={isMobile ? '95%' : 520}
        style={isMobile ? { top: 20 } : {}}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="cyrptoWalletAddress" label="USDT Wallet Address" rules={[{ required: true }]}>
            <Input disabled />
          </Form.Item>
          <Form.Item name="additionalComment" label="Additional Comment" rules={[{ required: true }]}>
            <Input disabled />
          </Form.Item>
        </Form>
      </Modal>

      {/* Mobile Transaction Details Drawer */}
      <Drawer
        title="Transaction Details"
        placement="bottom"
        onClose={() => setDetailsDrawerVisible(false)}
        open={detailsDrawerVisible}
        height="70%"
        style={{ display: isMobile ? 'block' : 'none' }}
      >
        {selectedTransaction && (
          <div>
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Card title="Transaction Information" size="small">
                  <p><Text strong>Transaction ID:</Text> {selectedTransaction.id}</p>
                  <p><Text strong>Wallet ID:</Text> {selectedTransaction.wallet?.id}</p>
                  <p><Text strong>Client Name:</Text> {selectedTransaction.client}</p>
                  <p><Text strong>Email:</Text> {selectedTransaction.email}</p>
                  <p><Text strong>Amount:</Text> {selectedTransaction.amount?.toFixed(2)} {selectedTransaction.currency}</p>
                  <p><Text strong>Status:</Text> 
                    <Tag 
                      color={
                        selectedTransaction.status === 'Approved' ? 'green' : 
                        selectedTransaction.status === 'Rejected' ? 'red' : 'orange'
                      } 
                      style={{ marginLeft: 8 }}
                    >
                      {selectedTransaction.status}
                    </Tag>
                  </p>
                  <p><Text strong>Date:</Text> {moment(selectedTransaction.requestedAt).format('YYYY-MM-DD HH:mm:ss')}</p>
                  <p><Text strong>Payment Method:</Text> {selectedTransaction.paymentMethod}</p>
                </Card>
              </Col>
              
              {selectedTransaction.bank && (
                <Col span={24}>
                  <Card title="Bank Details" size="small">
                    <p><Text strong>Beneficiary:</Text> {selectedTransaction.bank.beneficiary}</p>
                    <p><Text strong>Bank Name:</Text> {selectedTransaction.bank.name}</p>
                    <p><Text strong>Bank Address:</Text> {selectedTransaction.bank.address}</p>
                    <p><Text strong>Account Number:</Text> {selectedTransaction.bank.account}</p>
                    <p><Text strong>IFSC/IBAN:</Text> {selectedTransaction.bank.ifscIban}</p>
                    {selectedTransaction.bank.comment && (
                      <p><Text strong>Comment:</Text> {selectedTransaction.bank.comment}</p>
                    )}
                  </Card>
                </Col>
              )}
              
              {selectedTransaction.cryptoWallet && (
                <Col span={24}>
                  <Card title="Crypto Wallet Details" size="small">
                    <p><Text strong>USDT Wallet Address:</Text></p>
                    <Text code style={{ 
                      fontSize: '12px', 
                      wordBreak: 'break-all',
                      display: 'block',
                      padding: '8px',
                      backgroundColor: '#f5f5f5',
                      borderRadius: '4px'
                    }}>
                      {selectedTransaction.cryptoWallet.cyrptoWalletAddress}
                    </Text>
                    {selectedTransaction.cryptoWallet.comment && (
                      <p style={{ marginTop: 12 }}>
                        <Text strong>Comment:</Text> {selectedTransaction.cryptoWallet.comment}
                      </p>
                    )}
                  </Card>
                </Col>
              )}
              
              {/* Action buttons for mobile drawer */}
              {initialState?.currentUser?.roles?.includes('Manager') && selectedTransaction.status === 'Requested' && (
                <Col span={24}>
                  <Card title="Actions" size="small">
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <TextPopconfirm
                        initText={'Approved'}
                        initAmount={selectedTransaction.amount}
                        onConfirm={(comment: string, amount?: number) => {
                          setLoading(true);
                          api.transaction
                            .putTransactionById(selectedTransaction.id, {
                              approved: true,
                              comment: comment,
                              amount: amount,
                            })
                            .then(() => {
                              fetchData(
                                pagination.current,
                                pagination.pageSize,
                                globalSearchText,
                                selectedTransaction.Type,
                                dateRange.start,
                                dateRange.end,
                                selectedValue,
                              );
                              setDetailsDrawerVisible(false);
                            })
                            .catch((error) => {
                              console.error('Error in API request:', error);
                            })
                            .finally(() => {
                              setLoading(false);
                            });
                        }}
                      >
                        <Button type="primary" size="large" style={{ width: '100%', backgroundColor: token.colorSuccess, borderColor: token.colorSuccess }}>
                          Approve Transaction
                        </Button>
                      </TextPopconfirm>
                      
                      <TextPopconfirm
                        initText={'Rejected'}
                        onConfirm={(comment: string) => {
                          setLoading(true);
                          api.transaction
                            .putTransactionById(selectedTransaction.id, {
                              approved: false,
                              comment: comment,
                            })
                            .then(() => {
                              fetchData(
                                pagination.current,
                                pagination.pageSize,
                                '',
                                selectedTransaction.type,
                                dateRange.start,
                                dateRange.end,
                                '',
                              );
                              setDetailsDrawerVisible(false);
                            })
                            .finally(() => {
                              setLoading(false);
                            });
                        }}
                      >
                        <Button danger size="large" style={{ width: '100%' }}>
                          Reject Transaction
                        </Button>
                      </TextPopconfirm>
                    </Space>
                  </Card>
                </Col>
              )}
            </Row>
          </div>
        )}
      </Drawer>
    </div>
  );
};
// import {
//   BankTwoTone,
//   DislikeTwoTone,
//   FileExcelOutlined,
//   LikeTwoTone,
//   RedoOutlined,
//   SearchOutlined,
// } from '@ant-design/icons';

// import type { ActionType } from '@ant-design/pro-components';

// import { api, rawApi } from '@/components/common/api';
// import { TextPopconfirm } from '@/components/Custom/TextPopconfirm';
// import { AccountType, AppUserDto, SignUpRequest, Status, TransactionModel } from '@/generated';
// import CustomLoader from '@/pages/CustomLoader';
// import { useModel } from '@@/exports';
// import { DownOutlined } from '@ant-design/icons';
// import {
//   Button,
//   DatePicker,
//   Dropdown,
//   Form,
//   Input,
//   Menu,
//   MenuProps,
//   message,
//   Space,
//   theme,
// } from 'antd';
// import Modal from 'antd/es/modal/Modal';
// import moment from 'moment';
// import { useEffect, useRef, useState } from 'react';
// import DataTable from 'react-data-table-component';
// import '../../../common.css';
// import { Type } from '../../../generated/models/Type';
// const { Search } = Input;

// interface Data {
//   id: number;
//   name: string;
//   email: string;
//   Ticket: number;
//   WalletId: number;
//   Date: any;
//   Method: string;
//   Amount: any;
//   status: any;
//   Currency: any;
//   Login: number;
//   paymentMethod: string;
// }

// type DataIndex = keyof Data;

// export default () => {
//   const actionRef = useRef<ActionType>();
//   const [data, setData] = useState([]);
//   const { initialState, setInitialState } = useModel('@@initialState');
//   const [visible, setVisible] = useState(false);
//   const [selected, setSelected] = useState<AppUserDto>({});
//   const { token } = theme.useToken();
//   const [form] = Form.useForm();
//   const [searchText, setSearchText] = useState('');
//   const [searchedColumn, setSearchedColumn] = useState('');
//   // const searchInput = useRef<InputRef>();
//   const [transactions, setTransactions] = useState<TransactionModel[]>([]);
//   const [mt5Transaction, setMt5Transaction] = useState<TransactionModel[]>([]);
//   const [refreshCount, setRefreshCount] = useState(0);
//   const [loading, setLoading] = useState(true);
//   const [searchTimeout, setSearchTimeout] = useState(null);
//   const [visibleCrypto, setVisibleCrypto] = useState(false);
//   const [pagination, setPagination] = useState({
//     current: 1,
//     pageSize: 10,
//     total: 0,
//   });
//   // const [globalSearchText, setGlobalSearchText] = useState('');

//   // const handleDivRefresh = () => {

//   //     fetchData(pagination.current, pagination.pageSize, "", "");

//   //     // setRefreshCount((prevCount) => prevCount + 1);
//   // };
//   const [dateRange, setDateRange] = useState({
//     start: '',
//     end: '',
//   });
//   const [selectedValue, setSelectedValue] = useState('');
//   const [totalAmount, setTotalAmount] = useState('');
//   const [globalSearchText, setGlobalSearchText] = useState('');

//   const handleDivRefresh = () => {
//     // const { start, end } = dateRange;

//     if (dateRange.start == null && dateRange.end === null && selectedValue == null) {
//       fetchData(pagination.current, pagination.pageSize, globalSearchText, '', '', '', '');
//     } else {
//       fetchData(
//         pagination.current,
//         pagination.pageSize,
//         globalSearchText,
//         '',
//         dateRange.start,
//         dateRange.end,
//         selectedValue,
//       );
//     }
//   };
//   const customStyles = {
//     headCells: {
//       style: {
//         background: '#005f73',
//         color: 'white',
//         fontWeight: 'bold',
//         fontSize: '13px',
//         borderBottom: '2px solid #fff',
//         borderRight: '1px solid #fff', // Add a border on the right side of header cells
//       },
//     },
//     rows: {
//       style: {
//         '&:hover': {
//           background: '#f5f5f5',
//           transition: 'background-color 0.3s ease',
//           cursor: 'pointer',
//         },
//         borderBottom: '1px solid #ddd', // Add a bottom border to all rows
//       },
//     },
//     cells: {
//       style: {
//         borderRight: '1px solid #ddd', // Add a border on the right side of cells
//         textAlign: 'center',
//       },
//     },
//   };

//   /*   const customStyles = {
//           headCells: {
//               style: {
//                   background: '#eeab4c', 
//                   color: 'white', 
//                   fontWeight: 'bold',
//                   fontSize: '15px',
//                   borderBottom: '2px solid #fff'
//               },
//           },
//           rows: {
//               style: {
//                   '&:hover': {
//                       background: '#f5f5f5', 
//                       transition: 'background-color 0.3s ease', 
//                       cursor:'pointer',
//                   },
//               },
//           },
//       }; */

//   const fetchData = async (
//     page: any,
//     pageSize: any,
//     param: any,
//     type: any,
//     startDate: any,
//     endDate: any,
//     status: any,
//   ) => {
//     console.log('====>', type);
//     try {
//       setLoading(true);
//       const response = await api.transaction.getLimitedTransactionAdmin(
//         page,
//         pageSize,
//         param,
//         Type.WALLET_TO_EXT,
//         startDate,
//         endDate,
//         status,
//       );
//       // const depositFilteredData = response.requests.filter(item => item.type === 'ExtToWallet')
//       setPagination({ ...pagination, current: page, total: response.totalRecords });
//       setTransactions(response.requests);
//       setTotalAmount(response?.totalAmount);
//       setLoading(false);
//     } catch (error) {
//       console.log(error);
//       setLoading(false);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSearchDebounced = (value) => {
//     if (searchTimeout) {
//       clearTimeout(searchTimeout);
//     }
//     const timeout = setTimeout(() => {
//       fetchData(
//         pagination.current,
//         pagination.pageSize,
//         value,
//         '',
//         dateRange.start,
//         dateRange.end,
//         selectedValue,
//       );
//     }, 500);
//     setSearchTimeout(timeout);
//   };

//   useEffect(() => {
//     handleSearchDebounced(globalSearchText);
//   }, [globalSearchText, pagination.current, pagination.pageSize]);

//   const handlePageChange = (page: any) => {
//     setPagination({ ...pagination, current: page });
//   };

//   // Function to handle page size changes
//   // const handlePageSizeChange = (pageSize: any) => {
//   //     setPagination({ ...pagination, current: 1, pageSize }); // Reset to first page when page size changes
//   // };

//   const handlePageSizeChange = (size) => {
//     const totalRecords = pagination.total;
//     const currentRecordIndex = (pagination.current - 1) * pagination.pageSize;
//     const newPageIndex = Math.ceil((currentRecordIndex + 1) / size);

//     setPagination({
//       ...pagination,
//       pageSize: size,
//       current: newPageIndex,
//     });
//   };

//   const handleSubmit1 = async (values: Record<string, any>) => {
//     const urlParams = new URL(window.location.href).searchParams;
//     let urlWithToken = null;
  
//     try {
//       const msg = await api.app.postSignIn({
//         email: values.email,
//         password: values.password,
//       });
  
//       if (msg.status === 'ok') {
//         // Store token to local storage
//         const token = msg.token;
//         window.open(`${window.location.href}?token=${token}`, '_blank', 'noreferrer');
//       } else {
//         if (msg.message.includes('User is disabled by admin')) {
//           message.error({
//             content: 'User is disabled by admin',
//             icon: <span className="red-error-icon"> ✘ </span>,  // Custom icon
//             className: 'red-error-notification',  // Custom class for styling
//             duration: 4,  // Duration in seconds
//           });
//         } else {
//           const defaultLoginFailureMessage = 'Login failed. Please try again.';
//           message.error({
//             content: defaultLoginFailureMessage,
//             icon: <span className="red-error-icon"> ✘ </span>,  // Custom icon
//             className: 'red-error-notification',  // Custom class for styling
//             duration: 4,  // Duration in seconds
//           });
//           throw new Error('Incorrect username/password');
//         }
//       }
//     } catch (error) {
//       const defaultLoginFailureMessage = error.message || 'Login failed. Please try again.';
//       console.log(error);
//       message.error({
//         content: defaultLoginFailureMessage,
//         icon: <span className="red-error-icon"> ✘ </span>,  // Custom icon
//         className: 'red-error-notification',  // Custom class for styling
//         duration: 4,  // Duration in seconds
//       });
//     }
//   };
  

//   const handleMenuClick = (key, record) => {
//     if (key === 'approved') {
//       // showConfirmationModal('Approved', record);
//     } else if (key === 'rejected') {
//       // showConfirmationModal('Rejected', record);
//     }
//   };

//   const columns = [
//     {
//       name: 'Ticket #',
//       selector: 'id',
//       sortable: true,
//       right: false,
//       hide: true, // To hide this column in the table view
//       // ... Add other column properties as needed ...
//     },
//     {
//       name: 'Wallet #',
//       selector: (row) => row.wallet?.id,
//       sortable: true,
//       right: false,
//       // width:'130px'
//     },
//     {
//       name: 'Name',
//       selector: 'client',
//       sortable: false,
//       grow: 2,
//       cell: (row) => (
//         <div onClick={() => handleSubmit1(row)} style={{ cursor: 'pointer' }}>
//           {`${row.client} `}
//         </div>
//       ),
//     },
//     {
//       name: 'Email',
//       grow: 3,
//       selector: 'email',
//       sortable: true,
//       right: false,
//     },
//     {
//       name: 'Date',
//       selector: 'requestedAt',
//       sortable: true,
//       right: false,
//       format: (row) => moment(row.requestedAt).format('YYYY-MM-DD'),
//       // ... Add other column properties as needed ...
//     },
//     {
//       name: 'Currency',
//       selector: 'currency',
//       sortable: true,
//       right: false,
//       width: '110px',
//     },
//     {
//       name: 'Method',
//       selector: 'paymentMethod',
//       sortable: true,
//       right: false,
//       // ... Add other column properties as needed ...
//     },
//     {
//       name: 'Amount',
//       selector: (row) => `${row.amount?.toFixed(2)} ${row.currency}`,
//       sortable: true,
//       right: true,
//       width: '110px',
//     },
//     {
//       name: 'Status',
//       selector: 'status',
//       sortable: true,
//       right: false,

//       cell: (row) => {
//         const statusText = row.status;
//         console.log(row.status);
//         const statusValueEnum = {
//           Rejected: {
//             text: 'Rejected',
//             status: 'red',
//           },
//           Approved: {
//             text: 'Approved',
//             status: 'green',
//           },
//           Requested: {
//             text: 'Requested',
//             status: 'black',
//           },
//           Completed: {
//             text: 'Completed',
//             status: 'green',
//           },
//         };

//         const statusValue = statusValueEnum[statusText];
//         return <span style={{ color: statusValue.status }}>{statusValue.text}</span>;
//       },
//     },
//     // {
//     //     name: 'Status',
//     //     selector: 'status',
//     //     sortable: true,
//     //     right: false,

//     //     cell: (row) => {
//     //         const statusText = row.status;
//     //         console.log(row.status)
//     //         const statusValueEnum = {
//     //             Rejected: {
//     //                 text: 'Rejected',
//     //                 status: 'Error',
//     //             },
//     //             Approved: {
//     //                 text: 'Approved',
//     //                 status: 'Success',
//     //             },
//     //             Requested: {
//     //                 text: 'Requested',
//     //                 status: 'Processing',
//     //             },
//     //             Completed: {
//     //                 text: 'Completed',
//     //                 status: 'Success',
//     //             },
//     //         };

//     //         const statusValue = statusValueEnum[statusText];
//     //         return (
//     //             <span style={{ color: statusValue.status === 'Success' ? 'green' : 'red' }}>
//     //                 {statusValue.text}
//     //             </span>
//     //         );
//     //     },
//     // }
//     /*   {
//               name: 'Status',
//               selector: 'status',
//               sortable: true,
//               right: false,
          
//           }, */
//   ];

//   if (initialState?.currentUser?.roles?.includes('Manager')) {
//     columns.push({
//       name: 'Action',
//       // grow: 3,
//       selector: 'action', // You need to define a property in your data that holds the action
//       sortable: false,
//       right: true,

//       cell: (record: any) => (
//         <Space size={0}>
//           {record.status === Status.REQUESTED &&
//           record.managerId === initialState?.currentUser?.id ? (
//             <></>
//           ) : null}
//           <Dropdown
//             trigger={['click']}
//             overlay={
//               <Menu onClick={(e) => handleMenuClick(e.key, record)}>
//                 {record.type === 'WalletToExt' && (
//                   <Menu.Item key="edit">
//                     <Button onClick={() => handleEdit(record)}>
//                       <BankTwoTone twoToneColor={token.colorPrimary} />
//                     </Button>
//                   </Menu.Item>
//                 )}
//                 <Menu.Item key="approved">
//                   Approve
//                   <TextPopconfirm
//                     initText={'Approved'}
//                     initAmount={record.amount}
//                     onConfirm={(comment: string, amount?: number) => {
//                       setLoading(true);
//                       api.transaction
//                         .putTransactionById(record.id, {
//                           approved: true,
//                           comment: comment,
//                           amount: amount,
//                         })
//                         .then(() => {
//                           // Handle API response here if needed
//                           fetchData(
//                             pagination.current,
//                             pagination.pageSize,
//                             globalSearchText,
//                             record.Type,
//                             dateRange.start,
//                             dateRange.end,
//                             selectedValue,
//                           );
//                         })
//                         .catch((error) => {
//                           // Handle API error if needed
//                           console.error('Error in API request:', error);
//                         })
//                         .finally(() => {
//                           setLoading(false); // Set loading back to false after the response is received
//                         });
//                     }}
//                   >
//                     <Button>
//                       <LikeTwoTone twoToneColor={token.colorSuccess} />
//                     </Button>
//                   </TextPopconfirm>
//                 </Menu.Item>
//                 <Menu.Item key="rejected">
//                   Reject
//                   <TextPopconfirm
//                     initText={'Rejected'}
//                     onConfirm={(comment: string) => {
//                       api.transaction
//                         .putTransactionById(record.id, {
//                           approved: false,
//                           comment: comment,
//                         })
//                         .then(() =>
//                           fetchData(
//                             pagination.current,
//                             pagination.pageSize,
//                             '',
//                             record.type,
//                             dateRange.start,
//                             dateRange.end,
//                             '',
//                           ),
//                         );
//                     }}
//                   >
//                     <Button>
//                       <DislikeTwoTone twoToneColor={token.colorError} />
//                     </Button>
//                   </TextPopconfirm>
//                 </Menu.Item>
//               </Menu>
//             }
//           >
//             <Button style={{ backgroundColor: '#eeab4c', color: 'white', marginBottom: 5 }}>
//               {/* <Space> */}
//               Action <DownOutlined />
//               {/* </Space> */}
//             </Button>
//           </Dropdown>
//         </Space>
//       ),
//     });
//   } else {
//     columns.push({
//       name: 'Action',
//       selector: 'action', // You need to define a property in your data that holds the action
//       sortable: false,
//       right: true,
//       cell: (record: any) => (
//         <Space size={0}>{/* You can add any specific content for non-manager users here */}</Space>
//       ),
//     });
//   }

//   const handleEdit = (record: AppUserDto) => {
//     const password = record.mtUsers?.find((m) => m.accountType == AccountType.CLIENT)?.password;
//     var s: SignUpRequest = {
//       ...record,
//       password: password,
//     };
//     const formData = {
//       // username: record.bank.name,
//       beneficiary: record.bank ? record.bank.beneficiary : null,
//       bankName: record.bank ? record.bank.name : null,
//       bankAddress: record.bank ? record.bank.address : null,
//       accountNumber: record.bank ? record.bank.account : null,
//       ifscIBAN: record.bank ? record.bank.ifscIban : null,
//       additionalComment: record.bank ? record.bank.comment : null,
//     };

//     const cryptoForm = {
//       cyrptoWalletAddress: record.cryptoWallet ? record.cryptoWallet.cyrptoWalletAddress : null,
//       additionalComment: record.cryptoWallet ? record.cryptoWallet.comment : null,
//     };
//     console.log('formValue:::', record);
//     if (record.paymentMethod == 'USDT') {
//       console.log('crypto:::::::::::::::', record.cryptoWallet);
//       setSelected(record.cryptoWallet);
//       form.setFieldsValue(cryptoForm);
//       setVisibleCrypto(true);
//       console.log('formValue::::::::::::', cryptoForm);
//     } else {
//       setVisible(true);
//       console.log('bankdetails:::::::::::::::', record.bank);
//       setSelected(record.bank);
//       form.setFieldsValue(formData);
//       setVisible(true);
//     }
//     // setSelected(record.bank);
//     // form.setFieldsValue(formData)
//     // setVisible(true);
//   };

//   const handleOk = () => {
//     console.log('handleok-->');
//     setVisible(false);
//     // form.validateFields().then(async (values: SignUpRequest | undefined) => {
//     //     if (!selected.id) {
//     //         return
//     //     }
//     //     await api.app.putUserById(selected.id || '', { ...values })
//     //     setVisible(false)
//     //     await fetchData(pagination.current, pagination.pageSize, "", "","","","")
//     // });
//   };

//   const handleOkBank = () => {
//     console.log('handleok-->');
//     form.validateFields().then(async (values: SignUpRequest | undefined) => {
//       if (!selected.id) {
//         return;
//       }
//       // await api.app.putUserById(selected.id || '', { ...values })
//       setVisibleCrypto(false);
//       await fetchData(pagination.current, pagination.pageSize, '', '');
//     });
//   };

//   async function exportExcel() {
//     // let response = await api.transaction.exportXlsx()
//     let response = await rawApi.get(`/api/app/transaction/exportNew/xlsx`, {
//       responseType: 'blob',
//     });
//     const url = window.URL.createObjectURL(new Blob([response.data]));
//     const link = document.createElement('a');
//     link.href = url;
//     link.setAttribute('download', 'transactions.xlsx');
//     document.body.appendChild(link);
//     link.click();
    
//     message.success({
//       content: 'Downloading File...',
//       icon: <span className="green-success-icon"> ✔ </span>,  // Custom success icon
//       className: 'green-success-notification',  // Custom class for success message styling
//       duration: 3,  // Duration in seconds
//     });
  
//     // Clean up by revoking the temporary URL and removing the anchor element
//     window.URL.revokeObjectURL(url);
//     link.remove();
//   }
  

//   useEffect(() => {
//     const timer = setTimeout(() => {
//       setLoading(false);
//     }, 1500); // Set the desired duration in milliseconds (e.g., 3000 for 3 seconds)

//     return () => {
//       clearTimeout(timer); // Clean up the timer when the component unmounts or the dependencies change
//     };
//   }, []);
//   const { RangePicker } = DatePicker;
//   // Add an additional function to handle RangePicker clear event
//   const clearDateRange = () => {
//     fetchData(pagination.current, pagination.pageSize, globalSearchText, '', '', '');
//   };
//   const handleRangePickerClear = () => {
//     console.log('Inside handleRangePickerClear');
//     setDateRange({ start: dateRange.start, end: dateRange.end });
//   };
//   fetchData;

//   const handleDateChange = async (dates: any) => {
//     console.log('datepicker', dates);
//     try {
//       let formattedStartDate = '';
//       let formattedEndDate = '';
//       if (dates) {
//         const [startDate, endDate] = dates;
//         formattedStartDate = startDate.format('YYYY-MM-DD 00:00:00');
//         formattedEndDate = endDate.format('YYYY-MM-DD 23:59:59');

//         setDateRange({
//           start: formattedStartDate,
//           end: formattedEndDate,
//         });

//         await fetchData(
//           pagination.current,
//           pagination.pageSize,
//           '',
//           Type.EXT_TO_WALLET,
//           formattedStartDate,
//           formattedEndDate,
//           selectedValue,
//         );

//         console.log('Selected date range:', formattedStartDate, formattedEndDate);
//       } else {
//         setDateRange({
//           start: '',
//           end: '',
//         });
//       }
//     } catch (error) {
//       console.log('Something went wrong', error);
//       await fetchData(pagination.current, pagination.pageSize, '', Type.EXT_TO_WALLET, '', '');
//     }
//   };

//   const predefinedRanges = {
//     Today: [moment(), moment()],
//     Yesterday: [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
//     'Last 7 Days': [moment().subtract(6, 'days'), moment()],
//     // 'Last Month': [moment().subtract(6, 'days'), moment()],
//     'Last Month': [
//       moment().subtract(1, 'months').startOf('month'),
//       moment().subtract(1, 'months').endOf('month'),
//     ],
//   };
//   const rangePickerStyle = {
//     width: '100px', // Set the width as desired

//     // Add more custom styles here
//   };
//   const calendarStyle = { height: '10%', width: '250px' };
//   const dropdownPlacement = 'bottomLeft';
//   const handleDropdownClick = async (key: string) => {
//     console.log('======', key);
//     try {
//       const selectedValue = key;
//       console.log('Selected Value:', selectedValue);

//       setSelectedValue(selectedValue);
//       let formattedStartDate = '';
//       let formattedEndDate = '';
//       if (dateRange != undefined) {
//         const startDate = dateRange?.start as any;
//         const endDate = dateRange?.end as any;
//         if (startDate) {
//           formattedStartDate = moment(startDate)?.format('YYYY-MM-DD 00:00:00');
//         }
//         if (endDate) {
//           formattedEndDate = moment(endDate)?.format('YYYY-MM-DD 23:59:59');
//         }
//       }
//       setDateRange({
//         start: formattedStartDate,
//         end: formattedEndDate,
//       });

//       await fetchData(
//         pagination.current,
//         pagination.pageSize,
//         globalSearchText,
//         Type.EXT_TO_WALLET,
//         formattedStartDate,
//         formattedEndDate,
//         selectedValue,
//       );

//       console.log('Selected date range:', formattedStartDate, formattedEndDate);
//     } catch (error) {
//       console.log('Something went wrong', error);
//       await fetchData(pagination.current, pagination.pageSize, '', Type.EXT_TO_WALLET, '', '', '');
//     }
//   };
//   const onClick: MenuProps['onClick'] = ({ key }) => {
//     handleDropdownClick(key);
//   };

//   const items: MenuProps['items'] = [
//     {
//       label: 'Requested',

//       key: 'Requested',
//     },
//     {
//       label: 'Approved',

//       key: 'Approved',
//     },
//     {
//       label: 'Rejected',

//       key: 'Rejected',
//     },
//     {
//       label: 'All',
//       key: '',
//     },
//     /*   {
//       label: '4rd menu item',
//       key: '4',

//       danger: true,

//     }, */
//   ];
//   //   const menuProps = {
//   //     items,
//   //     onClick: handleDropdownClick,
//   //   };

//   return (
//     <div>
//       <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
//         <Input
//           size="small"
//           placeholder="Search"
//           prefix={<SearchOutlined style={{ color: '#eeab4c' }} />}
//           style={{
//             width: '250px',
//             height: '40px',
//             marginBottom: '16px',
//             border: '2px solid #eeab4c',
//             borderRadius: '10px 0px 10px 0px', // Diagonal edges
//             paddingLeft: '15px',
//             backgroundColor: '#fff',
//           }}
//           value={globalSearchText}
//           onChange={(e) => setGlobalSearchText(e.target.value)}
//         />
//       </div>
//       {/* {loading ? (
//                 <CustomLoader />
//             ) : ( */}
//       <div className="my-data-table" style={{ flex: 1, overflowY: 'auto' }}>
//         <h2>WITHDRAW TRANSACTIONS</h2>
//         <div className="datepicker-container">
//           <RangePicker
//             ranges={predefinedRanges} // Add the predefined ranges
//             onChange={handleDateChange}
//             allowClear
//             // onCalendarClear={handleRangePickerClear}

//             placement="bottomLeft"
//             //    style={calendarStyle}
//             format="YYYY-MM-DD" // Specify date format
//           />
//           <Dropdown menu={{ items, onClick }}>
//             <a onClick={(e) => e.preventDefault()}>
//               <span
//                 style={{
//                   padding: '5px',
//                   margin: '8px',
//                   color: 'white',
//                   border: '1px solid white',
//                   borderRadius: '5px',
//                   backgroundColor: '#eeab4c',
//                 }}
//               >
//                 Status: {selectedValue || 'All'}
//                 <DownOutlined />
//               </span>
//             </a>
//           </Dropdown>
//           <button className="divrefresh-btn" onClick={handleDivRefresh}>
//             Search
//           </button>
//           <div
//             style={{
//               width: '200px',
//               padding: '2px',
//               fontWeight: 700,

//               fontSize: '16px',
//             }}
//           >
//             Total Amount: {totalAmount}
//           </div>
//         </div>
//         <DataTable
//           columns={columns}
//           className="my-data-table"
//           data={transactions}
//           customStyles={customStyles}
//           keyField="id"
//           highlightOnHover
//           responsive
//           selectableRows={false}
//           dense
//           pagination
//           paginationServer
//           paginationTotalRows={pagination.total}
//           paginationPerPage={10}
//           onChangePage={handlePageChange}
//           onChangeRowsPerPage={handlePageSizeChange}
//           paginationRowsPerPageOptions={[10, 20, 30]}
//           paginationComponentOptions={{ rowsPerPageText: 'Rows per page:' }}
//           progressPending={loading}
//           // conditionalRowStyles={conditionalRowStyles}
//           progressComponent={loading ? <CustomLoader /> : null}
//           actions={[
//             <a key="exportExcel" onClick={exportExcel}>
//               <FileExcelOutlined style={{ color: '#f89d42' }} />
//             </a>,
//             <a key="handleDivRefresh" onClick={handleDivRefresh}>
//               <RedoOutlined style={{ color: '#f89d42' }} />
//             </a>,
//           ]}
//         />
//       </div>
//       {/* )} */}

//       <Modal title="Bank Details" open={visible} onOk={handleOk} onCancel={() => setVisible(false)}>
//         <Form form={form} layout="vertical">
//           {/* <Form.Item name="username" label="User Name" rules={[{ required: true }]}>
//                         <Input />
//                     </Form.Item> */}
//           <Form.Item name="beneficiary" label="Beneficiary" rules={[{ required: true }]}>
//             <Input disabled style={{ border: 0, backgroundColor: 'ffffff', color: 'black' }} />
//           </Form.Item>
//           <Form.Item name="bankName" label="Bank Name" rules={[{ required: true }]}>
//             <Input disabled style={{ border: 0, backgroundColor: 'ffffff', color: 'black' }} />
//           </Form.Item>
//           <Form.Item name="bankAddress" label="Bank Address" rules={[{ required: true }]}>
//             <Input disabled style={{ border: 0, backgroundColor: 'ffffff', color: 'black' }} />
//           </Form.Item>
//           <Form.Item name="accountNumber" label="Account Number" rules={[{ required: true }]}>
//             <Input disabled style={{ border: 0, backgroundColor: 'ffffff', color: 'black' }} />
//           </Form.Item>
//           <Form.Item name="ifscIBAN" label="IFSC/IBAN" rules={[{ required: true }]}>
//             <Input disabled style={{ border: 0, backgroundColor: 'ffffff', color: 'black' }} />
//           </Form.Item>
//           <Form.Item
//             name="additionalComment"
//             label="Additional Comment"
//             rules={[{ required: true }]}
//           >
//             <Input disabled style={{ border: 0, backgroundColor: 'ffffff', color: 'black' }} />
//           </Form.Item>
//         </Form>
//       </Modal>
//       <Modal
//         title="USDT Details"
//         open={visibleCrypto}
//         onOk={() => setVisibleCrypto(false)}
//         onCancel={() => setVisibleCrypto(false)}
//       >
//         <Form form={form} layout="vertical">
//           <Form.Item
//             name="cyrptoWalletAddress"
//             label="USDT Wallet Address"
//             rules={[{ required: true }]}
//           >
//             <Input disabled />
//           </Form.Item>
//           <Form.Item
//             name="additionalComment"
//             label="Additional Comment"
//             rules={[{ required: true }]}
//           >
//             <Input disabled />
//           </Form.Item>
//         </Form>
//       </Modal>
//     </div>
//   );
// };
