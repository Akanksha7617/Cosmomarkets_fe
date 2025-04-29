import { api } from '@/components/common/api';
import {
  CheckCircleOutlined,
  DollarOutlined,
  SearchOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Button, Col, Form, Input, message, Row, Select, Typography } from 'antd';
import React, { useEffect, useState } from 'react';

const { Option } = Select;
const { Text } = Typography;

interface CRMProcessProps {
  onOperationComplete: (success: boolean, message: string) => void;
  userData?: any;
  onRefresh?: () => void;
}

interface Transaction {
  id: number;
  amount: number;
  currency: string;
  status: string;
  type: string;
  requestedAt: string;
  managerComment: string;
  paymentMethod: string;
}

interface MtUser {
  id: number;
  userId: string;
  login: string;
  password: string;
  investorPassword: string;
  server: string;
  accountType: string;
}

const CRMProcess: React.FC<CRMProcessProps> = ({
  onOperationComplete,
  userData = {},
  onRefresh,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);
  const [searchLoading, setSearchLoading] = useState<boolean>(false);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [selectedLogin, setSelectedLogin] = useState<string>('');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  // Initialize with user email if available
  useEffect(() => {
    if (userData && userData.email) {
      form.setFieldsValue({ email: userData.email });
      handleSearchUser(userData.email);
    }
  }, [userData]);

  // Handle search user by email
  const handleSearchUser = async (email: string) => {
    if (!email) {
      message.error('Please enter an email address');
      return;
    }

    setSearchLoading(true);
    try {
      const response = await api.transaction.getLatestExtToWallet(email);
      if (response) {
        setUserInfo(response);

        // Pre-select the first transaction if available
        if (response.transactions && response.transactions.length > 0) {
          setSelectedTransaction(response.transactions[0]);
          form.setFieldsValue({ amount: response.transactions[0].amount });
        }

        // Pre-select the first MT5 login if available
        if (response.mtUsers && response.mtUsers.length > 0) {
          setSelectedLogin(response.mtUsers[0].login);
          form.setFieldsValue({ login: response.mtUsers[0].login });
        }
      } else {
        message.error('No data found for this email');
        setUserInfo(null);
      }
    } catch (error) {
      console.error('Error searching user:', error);
      message.error(`Failed to search user: ${error.message || 'Unknown error'}`);
      setUserInfo(null);
    } finally {
      setSearchLoading(false);
    }
  };

  // Handle MT5 login selection
  const handleLoginChange = (login: string) => {
    console.log('Selected login changed to:', login);
    setSelectedLogin(login);
    form.setFieldsValue({ login });
  };

  // Handle approve button click
  const handleApproveTransfer = async () => {
    if (!selectedTransaction) {
      message.error('Please select a transaction');
      return;
    }

    // Validate form to get current values
    try {
      const values = await form.validateFields();
      const loginValue = values.login;
      const amountValue = values.amount;

      if (!loginValue) {
        message.error('Please select an MT5 login');
        return;
      }

      // Convert to float and ensure it's valid
      const amount = parseFloat(amountValue);
      if (isNaN(amount) || amount <= 0) {
        message.error('Please enter a valid amount greater than 0');
        return;
      }

      setLoading(true);

      const approvalData = {
        transactionNumber: selectedTransaction.id,
        login: loginValue,
        amount: amount,
      };

      console.log('Sending approval data:', approvalData);

      const response = await api.transaction.approveAutoTransfer(approvalData);
      if (response) {
        // Show success message
        onOperationComplete(true, 'Transaction approved and funds transferred successfully');

        // Store current email for refreshing
        const currentEmail = form.getFieldValue('email');

        // Reset only specific form fields but keep the email
        form.setFieldsValue({
          amount: '',
          login: loginValue, // Keep the same login selected
        });

        // Clear selected transaction
        setSelectedTransaction(null);

        // Refresh the user data with the same email
        if (currentEmail) {
          handleSearchUser(currentEmail);
        }
      } else {
        throw new Error('Failed to approve transaction');
      }
    } catch (error) {
      // Handle form validation errors
      if (error.errorFields) {
        setLoading(false);
        return;
      }

      console.error('Error approving transaction:', error);
      onOperationComplete(
        false,
        `Failed to approve transaction: ${error.message || 'Unknown error'}`,
      );
    } finally {
      setLoading(false);
    }
  };
  // Handle search button click
  const handleSearchClick = () => {
    const email = form.getFieldValue('email');
    handleSearchUser(email);
  };

  // Handle Enter key press in email field
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !searchLoading) {
      e.preventDefault();
      const email = form.getFieldValue('email');
      handleSearchUser(email);
    }
  };

  return (
    <div className="crm-process-container">
      <Form form={form} layout="vertical" initialValues={{ email: userData?.email || '' }}>
        {/* Email search field */}
        <div className="search-user-section">
          <Form.Item
            label="Search User by Email"
            name="email"
            rules={[{ required: true, message: 'Email is required' }]}
          >
            <Input
              placeholder="Enter user email"
              onKeyDown={handleKeyDown}
              prefix={<SearchOutlined />}
              suffix={
                <Button
                  type="primary"
                  onClick={handleSearchClick}
                  loading={searchLoading}
                  size="small"
                  style={{ backgroundColor: '#1e4f6a' }}
                >
                  Search
                </Button>
              }
            />
          </Form.Item>
        </div>

        {/* Display user details if available */}
        {userInfo && (
          <div className="user-info-card">
            <div className="user-info-header">
              <UserOutlined style={{ marginRight: 8 }} />
              User Information
            </div>
            <div className="user-info-body">
              <Row gutter={16}>
                <Col span={12}>
                  <div className="info-item">
                    <div className="info-label">Name:</div>
                    <div className="info-value">{userInfo.name || 'N/A'}</div>
                  </div>
                  <div className="info-item">
                    <div className="info-label">Email:</div>
                    <div className="info-value">{userInfo.email || 'N/A'}</div>
                  </div>
                </Col>
                <Col span={12}>
                  <div className="info-item">
                    <div className="info-label">Wallet Balance:</div>
                    <div className="info-value">{userInfo.walletBalance || '0'} USD</div>
                  </div>

                  {userInfo.transactions && userInfo.transactions.length > 0 && (
                    <div className="info-item">
                      <div className="info-label">Transaction ID:</div>
                      <div className="info-value">
                        {selectedTransaction ? selectedTransaction.id : userInfo.transactions[0].id}
                      </div>
                    </div>
                  )}
                </Col>
              </Row>
            </div>
          </div>
        )}

        {/* MT5 Login Selector */}
        {userInfo && userInfo.mtUsers && userInfo.mtUsers.length > 0 && (
          <Form.Item
            label="Select MT5 Login"
            name="login"
            rules={[{ required: true, message: 'Please select an MT5 login' }]}
          >
            <Select
              placeholder="Select MT5 Login"
              onChange={handleLoginChange}
              style={{ width: '100%' }}
            >
              {userInfo.mtUsers.map((user: MtUser) => (
                <Option key={user.id} value={user.login}>
                  {user.login}
                </Option>
              ))}
            </Select>
          </Form.Item>
        )}

        {/* Transaction Selection */}
        {userInfo && userInfo.transactions && userInfo.transactions.length > 0 && (
          <div className="transaction-section">
            <div className="section-header">
              <DollarOutlined style={{ marginRight: 8 }} />
              Pending Transactions
            </div>
            <div className="transaction-list">
              {userInfo.transactions.map((transaction: Transaction) => (
                <div
                  key={transaction.id}
                  className={`transaction-item ${
                    selectedTransaction?.id === transaction.id ? 'selected' : ''
                  }`}
                  onClick={() => {
                    setSelectedTransaction(transaction);
                    // Set the initial amount but it can be edited by the user
                    if (!form.getFieldValue('amount')) {
                      form.setFieldsValue({ amount: transaction.amount });
                    }
                  }}
                >
                  <div className="transaction-details">
                    <div className="transaction-amount">
                      {transaction.amount} {transaction.currency}
                    </div>
                    <div className="transaction-info">
                      <span className="transaction-status">{transaction.status}</span>
                      <span className="transaction-type">{transaction.type}</span>
                      <span className="transaction-date">
                        {new Date(transaction.requestedAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="transaction-payment">{transaction.paymentMethod}</div>
                  </div>
                  {selectedTransaction?.id === transaction.id && (
                    <CheckCircleOutlined className="transaction-selected-icon" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Amount Field - Now editable */}
        {selectedTransaction && (
          <Form.Item
            label="Amount"
            name="amount"
            rules={[
              { required: true, message: 'Amount is required' },
              {
                validator: (_, value) => {
                  if (!value || parseFloat(value) <= 0) {
                    return Promise.reject('Amount must be greater than 0');
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input
              prefix="$"
              type="number"
              step="0.01"
              placeholder="Enter transfer amount"
              style={{ width: '100%' }}
            />
          </Form.Item>
        )}

        {/* Approve Button */}
        {userInfo && selectedTransaction && (
          <Form.Item>
            <Button
              type="primary"
              onClick={handleApproveTransfer}
              loading={loading}
              icon={<CheckCircleOutlined />}
              block
              style={{ backgroundColor: '#1e4f6a' }}
            >
              Approve Transfer
            </Button>
          </Form.Item>
        )}
      </Form>
    </div>
  );
};

export default CRMProcess;
