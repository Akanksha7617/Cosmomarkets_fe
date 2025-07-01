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
import { useEffect, useState } from 'react';
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

  // ================ HELP DESK METHODS ================
  useEffect(() => {
    if (activeMainTab === 'helpdesk') {
      loadQueries();
    }
  }, [activeMainTab]);

  // Add effect to update status when queries change
  useEffect(() => {
    if (selectedQueryId) {
      const currentQuery = queries.find((q) => q.id === selectedQueryId);
      if (currentQuery) {
        setSelectedQueryStatus(currentQuery.status);
      }
    }
  }, [queries, selectedQueryId]);

  const formatDateForApi = (date: Dayjs | null): string | null => {
    return date ? date.format('YYYY-MM-DD') : null;
  };

  // Modify the loadQueries function to use the correct parameter names
  const loadQueries = async (params: FilterParams = filterParams) => {
    try {
      setIsRefreshing(true);

      // Here's the key change - use searchParam instead of search
      const res = await api.app.getUserQueries(
        params.pageNumber,
        params.pageSize,
        params.search, // This should match 'searchParam' in the API
        params.startDate,
        params.endDate,
        params.status,
      );

      const mapped = (res.tickets || []).map((t: any) => ({
        id: t.id,
        name: `${t.firstName} ${t.lastName}`,
        email: t.email,
        queryType: t.queryType,
        status: t.status,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
        message: t.message,
        resolvedAt: t.status === 'Resolved' ? t.resolvedAt || t.updatedAt : null,
      }));

      setQueries(mapped);
      setTotalQueries(res.totalCount || mapped.length);
    } catch (err) {
      console.error('Failed to fetch queries:', err);
      antMessage.error({
        content: 'Failed to fetch queries.',
        icon: <span className="orange-error-icon"> ✘ </span>,
        className: 'orange-error-notification',
        duration: 3,
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const applyFilters = () => {
    const updatedParams = {
      ...filterParams,
      search: helpDeskSearchText,
      startDate:
        helpDeskDateRange && helpDeskDateRange[0] ? formatDateForApi(helpDeskDateRange[0]) : null,
      endDate:
        helpDeskDateRange && helpDeskDateRange[1] ? formatDateForApi(helpDeskDateRange[1]) : null,
      status: statusFilter === 'All' ? null : statusFilter, // Fix: Convert 'All' to null
      pageNumber: 1, // Reset to first page when applying new filters
    };

    setFilterParams(updatedParams);
    loadQueries(updatedParams);
  };

  // Handle date range change
  const handleDateRangeChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
    setHelpDeskDateRange(dates);
  };

  // Handle status filter change
  const handleStatusChange = (value: string | null) => {
    setStatusFilter(value);
  };

  // Search button handler
  const handleSearch = () => {
    applyFilters();

    antMessage.info({
      content: 'Applying filters...',
      duration: 1,
    });
  };

  // Pagination handler for help desk
  const handleHelpDeskPageChange = (page: number, pageSize?: number) => {
    const updatedParams = {
      ...filterParams,
      pageNumber: page,
      pageSize: pageSize || filterParams.pageSize,
    };

    setFilterParams(updatedParams);
    loadQueries(updatedParams);
  };

  // Refresh handler
  const handleRefresh = () => {
    setHelpDeskSearchText('');
    setHelpDeskDateRange(null);
    setStatusFilter(null);
    const defaultParams = {
      search: '',
      startDate: null,
      endDate: null,
      status: null,
      pageNumber: 1,
      pageSize: 10,
    };
    setFilterParams(defaultParams);
    loadQueries(defaultParams);

    antMessage.info({
      content: 'Refreshing queries...',
      duration: 1,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const resp = await api.app.createTicket({ queryType, message });
      const msg = (resp || '').toString().toLowerCase();

      if (msg.includes('ticket created')) {
        antMessage.success({
          content: ' Ticket submitted successfully!',
          icon: <span className="orange-success-icon"> ✓ </span>,
          className: 'orange-success-notification',
          duration: 3,
        });
        setQueryType('');
        setMessage('');
        await loadQueries();
      } else {
        antMessage.error({
          content: resp || ' Failed to submit ticket.',
          icon: <span className="orange-error-icon"> ✘ </span>,
          className: 'orange-error-notification',
          duration: 3,
        });
      }
    } catch (err) {
      console.error(err);
      antMessage.error({
        content: 'Something went wrong while submitting your query.',
        icon: <span className="orange-error-icon"> ✘ </span>,
        className: 'orange-error-notification',
        duration: 3,
      });
    }
  };

  const handleView = async (queryId: number) => {
    setSelectedQueryId(queryId);
    setLoadingMessages(true);

    try {
      // Get updated data for this specific query
      const singleQueryParams = {
        ...filterParams,
        search: queryId.toString(),
      };

      // If status is "All", don't send status parameter to API
      const apiStatusParam = singleQueryParams.status === 'All' ? null : singleQueryParams.status;

      const updatedQueryRes = await api.app.getUserQueries(
        singleQueryParams.pageNumber,
        singleQueryParams.pageSize,
        singleQueryParams.search,
        singleQueryParams.startDate,
        singleQueryParams.endDate,
        apiStatusParam,
      );

      const updatedQueries = (updatedQueryRes.tickets || []).map((t: any) => ({
        id: t.id,
        name: `${t.firstName} ${t.lastName}`,
        email: t.email,
        queryType: t.queryType,
        status: t.status,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
        message: t.message,
        resolvedAt: t.status === 'Resolved' ? t.resolvedAt || t.updatedAt : null,
      }));

      const msgs = await api.app.getMessages(queryId);
      const ticket = updatedQueries.find((q) => q.id === queryId);

      if (ticket) {
        // Make sure we're immediately updating the status
        setSelectedQueryStatus(ticket.status);

        const hasInitialMessage = msgs.some(
          (msg) => msg.text === ticket.message || msg.message === ticket.message,
        );

        if (!hasInitialMessage) {
          const initialMsg: ChatMessage = {
            id: 0,
            text: ticket.message,
            isMine: false,
            createdAt: ticket.createdAt,
            updatedAt: ticket.createdAt,
          };
          setMessages([initialMsg, ...msgs]);
        } else {
          setMessages(msgs);
        }

        if (ticket.status === 'Resolved') {
          antMessage.success({
            content: ' Your ticket is resolved!',
            icon: <span className="orange-success-icon"> ✓ </span>,
            className: 'orange-success-notification',
            duration: 3,
          });
        }
      } else {
        setMessages(msgs);
        setSelectedQueryStatus(null);
      }

      // Refresh the query list to show updated status
      loadQueries();
    } catch (err) {
      console.error(err);
      antMessage.error({
        content: ' Could not load chat messages or updated query data.',
        icon: <span className="orange-error-icon"> ✘ </span>,
        className: 'orange-error-notification',
        duration: 3,
      });
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || selectedQueryId === null) {
      console.warn('🚫 Empty message or no selected query.');
      return;
    }

    try {
      const tempMessage: ChatMessage = {
        id: Date.now(),
        text: chatInput,
        isMine: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      setMessages((prevMessages) => [...prevMessages, tempMessage]);
      setChatInput('');

      await api.app.postReply(selectedQueryId, chatInput);

      // Success message after the message is sent
      antMessage.success({
        content: ' Your message was sent successfully!',
        icon: <span className="orange-success-icon"> ✓ </span>,
        className: 'orange-success-notification',
        duration: 3,
      });

      // Refresh queries to get updated status after sending message
      loadQueries();
    } catch (err: any) {
      console.error(' Failed to send message:', err);

      if (err?.response?.data) {
        console.error('🔍 Server Error Response:', err.response.data);
      } else {
        console.error('🔍 Error Details:', err);
      }

      // Error message if sending fails
      antMessage.error({
        content: ' Failed to send message.',
        icon: <span className="orange-error-icon"> ✘ </span>,
        className: 'orange-error-notification',
        duration: 3,
      });
    }
  };

  const selectedQuery = selectedQueryId ? queries.find((q) => q.id === selectedQueryId) : null;

  // Helper function to format date for display
  const formatDate = (timestamp: number | null): string => {
    if (!timestamp) return '-';
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <div className="page-container">
      <div className="tab-header">
        <div
          className={`tab ${activeMainTab === 'transaction' ? 'active' : ''}`}
          onClick={() => setActiveMainTab('transaction')}
        >
          Transaction History
        </div>
       
      </div>

      {/* TRANSACTION HISTORY TAB */}
      {activeMainTab === 'transaction' && (
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
      )}

      
    </div>
  );
};
