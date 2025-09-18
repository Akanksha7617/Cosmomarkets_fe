import { api, rawApi } from '@/components/common/api';
import { Type } from '@/generated';
import { DownloadOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { useModel } from '@umijs/max';
import {
  DatePicker,
  Input,
  message as antMessage,
  Pagination,
  Select,
  Table,
  Tabs,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { Dayjs } from 'dayjs';
import moment from 'moment';
import { useEffect, useState, useCallback, useMemo } from 'react';
import '../../common.css';
const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;
const { TabPane } = Tabs;

// Interface definitions for HelpDesk
interface QueryData {
  id: number;
  name: string;
  email: string;
  queryType: string;
  status: string;
  createdAt: number;
  updatedAt: number;
  message: string;
  resolvedAt: number | null;
}

interface ChatMessage {
  id: number;
  text: string;
  isMine: boolean;
  senderRole?: string;
  createdAt: number;
  updatedAt: number;
  message?: string;
}

interface FilterParams {
  search: string;
  startDate: string | null;
  endDate: string | null;
  status: string | null;
  pageNumber: number;
  pageSize: number;
}

export default () => {
  // State for active tab
  const [activeMainTab, setActiveMainTab] = useState('transaction');

  // ================ TRANSACTION HISTORY STATES ================
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

  const { initialState } = useModel('@@initialState');

  // ================ HELP DESK STATES ================
  // --- Form state ---
  const [queryType, setQueryType] = useState<string>('');
  const [message, setMessage] = useState<string>('');

  // --- Queries table + search ---
  const [queries, setQueries] = useState<QueryData[]>([]);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [totalQueries, setTotalQueries] = useState<number>(0);

  // --- Filter states ---
  const [helpDeskSearchText, setHelpDeskSearchText] = useState<string>('');
  const [helpDeskDateRange, setHelpDeskDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(
    null,
  );
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [filterParams, setFilterParams] = useState<FilterParams>({
    search: '',
    startDate: null,
    endDate: null,
    status: null,
    pageNumber: 1,
    pageSize: 10,
  });

  // --- Chat panel state ---
  const [selectedQueryId, setSelectedQueryId] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [chatInput, setChatInput] = useState<string>('');
  const [selectedQueryStatus, setSelectedQueryStatus] = useState<string | null>(null);
  const [showQueryForm, setShowQueryForm] = useState(false);

  const toggleQueryForm = () => {
    setShowQueryForm(!showQueryForm);
  };

  // ================ TRANSACTION HISTORY METHODS ================
  useEffect(() => {
    if (activeMainTab === 'transaction') {
      fetchTransactionData();
    }
  }, [
    activeMainTab,
    pagination.current,
    pagination.pageSize,
    selectedType,
    selectedStatus,
    dateRange,
    searchText,
    activeTab,
  ]);

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

  const handlePageChange = (page, pageSize) => {
    setPagination({ ...pagination, current: page, pageSize });
  };

  const handleReset = () => {
    setSearchText('');
    setSelectedType('All');
    setSelectedStatus('All');
    setDateRange([null, null]);
    setPagination({ ...pagination, current: 1 });
  };

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

  const formatAmount = (amount, type) => {
    const isDeposit = type === 'ExtToWallet' || type === 'MtToWallet';
    const className = isDeposit ? 'amount-positive' : 'amount-negative';
    const formattedAmount = isDeposit ? `+$${amount.toFixed(2)}` : `-$${amount.toFixed(2)}`;

    return <span className={className}>{formattedAmount}</span>;
  };

  const handleTabChange = (key) => {
    setActiveTab(key);
    setPagination({ ...pagination, current: 1 });
  };

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


      {/* TRANSACTION HISTORY TAB */}
      {activeMainTab === 'transaction' && (
        <>
          {/* Dashboard Header */}
          <div className="transaction-header">
            <div>
              <h1 className="dashboard-title">Transaction History</h1>
              <p className="dashboard-subtitle">
                Track all your deposits, withdrawals, and MT5 transfers
              </p>
            </div>
          </div>

          {/* Content Container */}
          <div className="content-container">
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
                <div className="action-buttons">
                  <button className="custom-btn" onClick={fetchTransactionData}>
                    <ReloadOutlined />
                    Refresh
                  </button>
                  <button className="custom-btn export-btn" onClick={exportToExcel}>
                    <DownloadOutlined />
                    Export
                  </button>
                </div>
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
        </>
      )}
    </div>
  );
};