import { api, rawApi } from '@/components/common/api';
import { Type } from '@/generated';
import {
  CalendarOutlined,
  DownloadOutlined,
  ReloadOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { useModel } from '@umijs/max';
import {
  Button,
  Card,
  Col,
  DatePicker,
  Input,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import moment from 'moment';
import { useEffect, useState } from 'react';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

export default () => {
  // State management
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [dateRange, setDateRange] = useState<any>([null, null]);
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
  ]);

  // Fetch transaction data with filters
  const fetchTransactionData = async () => {
    try {
      setLoading(true);

      let type = '';
      if (selectedType === 'Deposit') {
        type = Type.EXT_TO_WALLET;
      } else if (selectedType === 'Withdraw') {
        type = Type.WALLET_TO_EXT;
      } else if (selectedType === 'Deposit to MT5') {
        type = Type.WALLET_TO_MT;
      } else if (selectedType === 'Withdraw from MT5') {
        type = Type.MT_TO_WALLET;
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
    const formattedAmount = isDeposit ? `+${amount.toFixed(2)}` : `-${amount.toFixed(2)}`;
    const style = { color: isDeposit ? '#52c41a' : '#c78534' };

    return <span style={style}>{formattedAmount}</span>;
  };

  // Table columns
  const columns: ColumnsType<any> = [
    {
      title: 'Transaction ID',
      dataIndex: 'id',
      key: 'id',
      render: (text) => <a>{text}</a>,
    },
    {
      title: 'Date',
      dataIndex: 'requestedAt',
      key: 'date',
      render: (date) => moment(date).format('DD/MM/YYYY'),
      sorter: (a, b) => moment(a.requestedAt).unix() - moment(b.requestedAt).unix(),
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount, record) => formatAmount(amount, record.type),
      align: 'right',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => formatTransactionType(type),
    },
    {
      title: 'Method',
      dataIndex: 'paymentMethod',
      key: 'method',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = 'default';
        switch (status) {
          case 'Approved':
          case 'Completed':
            color = 'success';
            break;
          case 'Rejected':
            color = 'error';
            break;
          case 'Requested':
            color = 'processing';
            break;
        }
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: 'Reference',
      dataIndex: 'reference',
      key: 'reference',
      render: (_, record) => `REF${record.id}`,
    },
  ];

  return (
    <Card className="transaction-history-card">
      <Title level={2}>Financial Records</Title>

      <Card className="filter-card">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Text strong>Start Date</Text>
            <DatePicker
              style={{ width: '100%', marginTop: 8 }}
              placeholder="Pick a date"
              value={dateRange[0]}
              onChange={(date) => setDateRange([date, dateRange[1]])}
              allowClear
              format="DD/MM/YYYY"
              suffixIcon={<CalendarOutlined />}
            />
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Text strong>End Date</Text>
            <DatePicker
              style={{ width: '100%', marginTop: 8 }}
              placeholder="Pick a date"
              value={dateRange[1]}
              onChange={(date) => setDateRange([dateRange[0], date])}
              allowClear
              format="DD/MM/YYYY"
              suffixIcon={<CalendarOutlined />}
            />
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Text strong>Search</Text>
            <Input
              placeholder="Transaction ID or Reference"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              prefix={<SearchOutlined style={{ color: '#FAAD14' }} />}
              style={{ width: '100%', marginTop: 8 }}
            />
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Text strong>Type</Text>
            <Select
              style={{ width: '100%', marginTop: 8 }}
              value={selectedType}
              onChange={setSelectedType}
            >
              <Option value="All">All</Option>
              <Option value="Deposit">Deposit</Option>
              <Option value="Withdraw">Withdraw</Option>
              <Option value="Deposit to MT5">Deposit to MT5</Option>
              <Option value="Withdraw from MT5">Withdraw from MT5</Option>
            </Select>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Text strong>Status</Text>
            <Select
              style={{ width: '100%', marginTop: 8 }}
              value={selectedStatus}
              onChange={setSelectedStatus}
            >
              <Option value="All">All</Option>
              <Option value="Requested">Requested</Option>
              <Option value="Approved">Approved</Option>
              <Option value="Rejected">Rejected</Option>
              <Option value="Completed">Completed</Option>
            </Select>
          </Col>

          <Col xs={24} md={12} style={{ display: 'flex', alignItems: 'flex-end' }}>
            <Space>
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={fetchTransactionData}
                style={{ marginTop: 8, backgroundColor: '#FAAD14', borderColor: '#FAAD14' }}
              >
                Search
              </Button>

              <Button onClick={handleReset} style={{ marginTop: 8 }}>
                Reset
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: 16,
          marginBottom: 16,
        }}
      >
        <div></div>
        <Space>
          <Button icon={<DownloadOutlined />} onClick={exportToExcel}>
            Export
          </Button>
          <Button icon={<ReloadOutlined />} onClick={fetchTransactionData}>
            Refresh
          </Button>
        </Space>
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
        }}
        style={{ overflowX: 'auto' }}
        scroll={{ x: 'max-content' }}
      />

      <style jsx global>{`
        .transaction-history-card {
          border-radius: 8px;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }

        .filter-card {
          margin-top: 16px;
          background-color: #ffffff;
          border-radius: 8px;
        }

        .ant-table-thead > tr > th {
          color: rgba(0, 0, 0, 0.85);
          font-weight: 500;
          background-color: #fafafa;
        }

        .ant-table-row:hover {
          background-color: #f5f5f5;
        }

        .ant-tag-success {
          color: #52c41a;
          background-color: #f6ffed;
          border-color: #b7eb8f;
        }

        .ant-tag-error {
          color: #c78534;
          background-color: #fff2f0;
          border-color: #ffccc7;
        }

        .ant-tag-processing {
          color: #1890ff;
          background-color: #e6f7ff;
          border-color: #91d5ff;
        }
      `}</style>
    </Card>
  );
};
