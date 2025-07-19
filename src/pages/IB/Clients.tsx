import { api, rawApi } from '@/components/common/api';
import { useModel } from '@@/exports';
import { FileExcelOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Input, Table, Tag, Typography } from 'antd';
import React, { useEffect, useState } from 'react';
import CustomLoader from '../CustomLoader';

const { Title, Text } = Typography;

const Clients: React.FC = () => {
  // State
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const { initialState } = useModel('@@initialState');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // Fetch data on component mount and when search/pagination changes
  useEffect(() => {
    const timer = setTimeout(() => {
      getData(pagination.current, pagination.pageSize, searchText);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchText, pagination.current, pagination.pageSize]);

  // Initial loading effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Fetch client data
  const getData = async (page, pageSize, param) => {
    try {
      setLoading(true);
      const response = await api.ib.getAttractedClientsLimited(page, pageSize, param);
      setPagination({ ...pagination, current: page, total: response.totalRecords });
      setData(response.requests || []);
    } catch (error) {
      console.error('Error fetching client data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Export to Excel
  const exportExcel = async () => {
    try {
      const response = await rawApi.get(`/api/app/ib/ib_clients_export/xlsx`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'ib_clients_export.xlsx');
      document.body.appendChild(link);
      link.click();

      // Clean up
      window.URL.revokeObjectURL(url);
      link.remove();
    } catch (error) {
      console.error('Error exporting to Excel:', error);
    }
  };

  // Handle search
  const handleSearch = () => {
    setPagination({ ...pagination, current: 1 });
    getData(1, pagination.pageSize, searchText);
  };

  // Handle page change
  const handlePageChange = (page, pageSize) => {
    setPagination({ ...pagination, current: page, pageSize });
  };

  // Generate account ID for demo purposes
  const generateAccountId = () => `MT5-${Math.floor(10000000 + Math.random() * 90000000)}`;

  // Generate registration date for demo purposes
  const generateDate = () => {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 30));
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // Table columns
  const columns = [
    {
      title: 'Name',
      key: 'name',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500, color: '#1890ff' }}>
            {`${record.firstName} ${record.lastName}`}
          </div>
          <div style={{ color: '#8c8c8c', fontSize: '12px' }}>{record.email}</div>
        </div>
      ),
    },
    {
      title: 'Wallet Balance',
      key: 'walletBalance',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{`$${(record.wallet?.balance || 0).toFixed(2)}`}</div>
        </div>
      ),
    },
    {
      title: 'Total Withdraw',
      key: 'totalWithdraw',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{`$${(record.totalWithdraw || 0).toFixed(2)}`}</div>
        </div>
      ),
    },
    {
      title: 'Total Deposit',
      key: 'totalDeposit',
      render: (_, record) => {
        const amount = record.totalDeposit || 0;
        return <div style={{ fontWeight: 500 }}>{`$${amount.toFixed(2)}`}</div>;
      },
    },
    {
      title: 'Total MT5 Deposit',
      key: 'totalMt5Deposit',
      render: (_, record) => {
        const amount = record.totalMt5Deposit || 0;
        return <div style={{ fontWeight: 500 }}>{`$${amount.toFixed(2)}`}</div>;
      },
    },
    {
      title: 'Total MT5 Withdraw',
      key: 'totalMt5Withdraw',
      render: (_, record) => {
        const amount = record.totalMt5Withdraw || 0;
        return <div style={{ fontWeight: 500 }}>{`$${amount.toFixed(2)}`}</div>;
      },
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => (
        <Tag
          color="#faad14"
          style={{
            backgroundColor: '#fff7e6',
            borderColor: '#ffd666',
            color: '#d48806',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 500,
            padding: '2px 8px',
          }}
        >
          Active
        </Tag>
      ),
    },
  ];

  return (
    <div>
      <Title level={3} style={{ marginBottom: '24px' }}>
        IB Clients
      </Title>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <Input
          placeholder="Search clients..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onPressEnter={handleSearch}
          style={{
            width: '100%',
            maxWidth: '500px',
          }}
        />

        <div>
          <Button
            type="primary"
            onClick={handleSearch}
            style={{
              marginRight: '8px',
              backgroundColor: '#FAAD14',
              borderColor: '#FAAD14',
            }}
          >
            Search
          </Button>

          <Button icon={<FileExcelOutlined />} onClick={exportExcel}>
            Export
          </Button>
        </div>
      </div>

      {loading && <CustomLoader />}

      <Table
        columns={columns}
        dataSource={data.length > 0 ? data : []}
        rowKey={(record) => record.id || Math.random().toString(36).substring(2)}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          onChange: handlePageChange,
          showSizeChanger: true,
        }}
        loading={loading}
        scroll={{ x: 'max-content' }} // ✅ This enables horizontal scroll
        rowClassName={(record, index) => (index % 2 === 1 ? 'table-row-dark' : 'table-row-light')}
        style={{
          backgroundColor: '#fff',
          borderRadius: '8px',
          overflow: 'auto',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        }}
        className="custom-clients-table"
      />

      <style jsx>{`
        .custom-clients-table .ant-table-thead > tr > th {
          padding: 16px;
          color: #595959;
          font-weight: 600;
          background-color: #f5f5f5;
          border-bottom: 1px solid #e8e8e8;
        }

        .custom-clients-table .ant-table-tbody > tr.table-row-light {
          background-color: #ffffff;
        }

        .custom-clients-table .ant-table-tbody > tr.table-row-dark {
          background-color: #fafafa;
        }

        .custom-clients-table .ant-table-tbody > tr:hover {
          background-color: #e6f7ff !important;
        }

        .custom-clients-table .ant-table-tbody > tr > td {
          padding: 16px;
          border-bottom: 1px solid #f0f0f0;
        }

        .custom-clients-table .ant-table {
          overflow: hidden;
          border-radius: 8px;
        }

        .custom-clients-table .ant-table-container {
          border-radius: 8px;
        }
      `}</style>
    </div>
  );
};

export default Clients;
