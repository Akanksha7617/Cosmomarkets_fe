import { api, rawApi } from '@/components/common/api';
import { Type } from '@/generated';
import { DownloadOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { useModel } from '@umijs/max';
import { DatePicker, Input, Select, Table, Tabs, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import moment from 'moment';
import { useEffect, useState } from 'react';
import '../../common.css';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;
const { TabPane } = Tabs;

export default () => {
  // State management
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [dateRange, setDateRange] = useState<any>([null, null]);
  const [activeTab, setActiveTab] = useState('All');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // Get user model
  const { initialState } = useModel('@@initialState');

  useEffect(() => {
    fetchTransactionData();
  }, [
    pagination.current,
    pagination.pageSize,
    selectedType,
    selectedStatus,
    dateRange,
    searchText,
    activeTab,
  ]);

  // Fetch transaction data with filters
  const fetchTransactionData = async () => {
    try {
      setLoading(true);

      let type = '';
      if (selectedType === 'Deposit' || activeTab === 'Deposits') {
        type = Type.EXT_TO_WALLET;
      } else if (selectedType === 'Withdraw' || activeTab === 'Withdrawals') {
        type = Type.WALLET_TO_EXT;
      } else if (selectedType === 'Deposit to MT5' || activeTab === 'DepositMT5') {
        type = Type.WALLET_TO_MT;
      } else if (selectedType === 'Withdraw from MT5' || activeTab === 'WithdrawMT5') {
        type = Type.MT_TO_WALLET;
      } else if (activeTab === 'Transfers') {
        // For Transfers tab, include both MT5 deposit and withdrawal types
        type = ''; // Using empty to get both types
      }

      let startDate = '';
      let endDate = '';
      if (dateRange[0] && dateRange[1]) {
        startDate = moment(dateRange[0]).format('YYYY-MM-DD 00:00:00');
        endDate = moment(dateRange[1]).format('YYYY-MM-DD 23:59:59');
      }

      const status = selectedStatus === 'All' ? '' : selectedStatus;

      const response = await api.transaction.getLimitedOwnTransaction(
        pagination.current,
        pagination.pageSize,
        searchText,
        type,
        startDate,
        endDate,
        status,
      );

      setData(response.requests || []);
      setPagination({ ...pagination, total: response.totalRecords });
    } catch (error) {
      console.error('Error fetching transaction data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle page change
  const handlePageChange = (page, pageSize) => {
    setPagination({ ...pagination, current: page, pageSize });
  };

  // Reset filters
  const handleReset = () => {
    setSearchText('');
    setSelectedType('All');
    setSelectedStatus('All');
    setDateRange([null, null]);
    setPagination({ ...pagination, current: 1 });
  };

  // Export to Excel
  const exportToExcel = async () => {
    try {
      const response = await rawApi.get(`/api/app/transaction/export/xlsx`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'transactions.xlsx');
      document.body.appendChild(link);
      link.click();

      window.URL.revokeObjectURL(url);
      link.remove();
    } catch (error) {
      console.error('Error exporting to Excel:', error);
    }
  };

  // Format transaction type for display
  const formatTransactionType = (type) => {
    switch (type) {
      case 'ExtToWallet':
        return 'Deposit';
      case 'WalletToExt':
        return 'Withdraw';
      case 'WalletToMt':
        return 'Deposit to MT5';
      case 'MtToWallet':
        return 'Withdraw from MT5';
      default:
        return type;
    }
  };

  // Format amount with sign and color
  const formatAmount = (amount, type) => {
    const isDeposit = type === 'ExtToWallet' || type === 'MtToWallet';
    const className = isDeposit ? 'amount-positive' : 'amount-negative';
    const formattedAmount = isDeposit ? `+$${amount.toFixed(2)}` : `-$${amount.toFixed(2)}`;

    return <span className={className}>{formattedAmount}</span>;
  };

  // Handle tab change
  const handleTabChange = (key) => {
    setActiveTab(key);
    setPagination({ ...pagination, current: 1 });
  };

  // Generate reference based on transaction type and ID
  const generateReference = (record) => {
    const prefix = (() => {
      switch (record.type) {
        case 'ExtToWallet':
          return 'DEP';
        case 'WalletToExt':
          return 'WDR';
        case 'WalletToMt':
          return 'D2MT5';
        case 'MtToWallet':
          return 'W4MT5';
        default:
          return 'TRX';
      }
    })();

    return `${prefix}-${record.id.toString().padStart(6, '0')}`;
  };

  // Table columns
  const columns: ColumnsType<any> = [
    {
      title: 'Transaction ID',
      dataIndex: 'id',
      key: 'id',
      render: (text) => <span className="transaction-id">TX-{text}</span>,
    },
    {
      title: 'Reference',
      key: 'reference',
      render: (_, record) => <span className="reference-code">{generateReference(record)}</span>,
    },
    {
      title: 'Date',
      dataIndex: 'requestedAt',
      key: 'date',
      render: (date) => moment(date).format('YYYY-MM-DD'),
    },
    {
      title: 'From',
      dataIndex: 'source',
      key: 'from',
      render: (_, record) => {
        if (record.type === 'ExtToWallet') return 'External';
        else if (record.type === 'MtToWallet') return 'MT5 Account';
        else return 'Wallet';
      },
    },
    {
      title: 'To',
      dataIndex: 'destination',
      key: 'to',
      render: (_, record) => {
        if (record.type === 'WalletToExt') return 'External';
        else if (record.type === 'WalletToMt') return 'MT5 Account';
        else return 'Wallet';
      },
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => `$${amount.toFixed(2)}`,
      align: 'right',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let statusClassName = 'status-default';
        switch (status) {
          case 'Approved':
            statusClassName = 'status-blue';
            break;
          case 'Completed':
            statusClassName = 'status-success';
            break;
          case 'Rejected':
            statusClassName = 'status-error';
            break;
          case 'Requested':
            statusClassName = 'status-warning';
            break;
          default:
            statusClassName = 'status-default';
        }
        return <Tag className={`status-tag ${statusClassName}`}>{status}</Tag>;
      },
    },
  ];

  return (
    <div className="page-container">
      <div className="tab-header">
        <div className="tab active">Transaction History</div>
        <div className="tab">Support Tickets</div>
      </div>

      {/* <Tabs defaultActiveKey="1" onChange={(key) => console.log(key)}>
        <TabPane tab="Transaction History" key="1">
          <TransactionHistory />
        </TabPane>
        <TabPane tab="Support Tickets" key="2">
          <SupportTickets />
        </TabPane>
      </Tabs> */}

      <div className="content-container">
        {/* <div className="title-section">
          <h1>Transaction History</h1>
        </div> */}

        <div className="filter-section">
          <div className="search-filter">
            <Input
              placeholder="Search transactions..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              prefix={<SearchOutlined />}
              className="search-input"
            />
             <div className="date-range-picker ntg">
              <DatePicker.RangePicker
                value={dateRange}
                onChange={setDateRange}
                format="YYYY-MM-DD"
                placeholder={['Start Date', 'End Date']}
              />
            </div>
            <div className="dropdown-filters">
              <Select
                placeholder="Status"
                value={selectedStatus}
                onChange={setSelectedStatus}
                className="status-select"
                dropdownMatchSelectWidth={false}
              >
                <Option value="All">All Status</Option>
                <Option value="Requested">Requested</Option>
                <Option value="Approved">Approved</Option>
                <Option value="Rejected">Rejected</Option>
                <Option value="Completed">Completed</Option>
              </Select>
            </div>

           
          </div>
          <div className="action-buttons">
            <button className="custom-btn " onClick={fetchTransactionData}>
              <ReloadOutlined />
              Refresh
            </button>

            <button className="custom-btn export-btn" onClick={exportToExcel}>
              <DownloadOutlined /> Export
            </button>
          </div>
        </div>

        <div className="transaction-tabs">
          <div
            className={`tab-item ${activeTab === 'All' ? 'active' : ''}`}
            onClick={() => handleTabChange('All')}
          >
            All Transactions
          </div>
          <div
            className={`tab-item ${activeTab === 'Deposits' ? 'active' : ''}`}
            onClick={() => handleTabChange('Deposits')}
          >
            Deposits
          </div>
          <div
            className={`tab-item ${activeTab === 'Withdrawals' ? 'active' : ''}`}
            onClick={() => handleTabChange('Withdrawals')}
          >
            Withdrawals
          </div>
          <div
            className={`tab-item ${activeTab === 'DepositMT5' ? 'active' : ''}`}
            onClick={() => handleTabChange('DepositMT5')}
          >
            Deposit to MT5
          </div>
          <div
            className={`tab-item ${activeTab === 'WithdrawMT5' ? 'active' : ''}`}
            onClick={() => handleTabChange('WithdrawMT5')}
          >
            Withdraw from MT5
          </div>
          <div
            className={`tab-item ${activeTab === 'Transfers' ? 'active' : ''}`}
            onClick={() => handleTabChange('Transfers')}
          >
            Transfers
          </div>
        </div>

        <Table
          columns={columns}
          dataSource={data}
          loading={loading}
          rowKey="id"
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            onChange: handlePageChange,
            showSizeChanger: true,
            position: ['bottomCenter'],
            itemRender: (page, type, originalElement) => {
              if (type === 'prev') {
                return <a>← Previous</a>;
              }
              if (type === 'next') {
                return <a>Next →</a>;
              }
              return originalElement;
            },
          }}
          className="transaction-table"
        />
      </div>
    </div>
  );
};
