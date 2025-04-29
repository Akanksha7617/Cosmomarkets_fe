import { api } from '@/components/common/api';
import {
  CommentOutlined,
  DollarOutlined,
  QuestionCircleOutlined,
  SettingOutlined,
  UserOutlined,
  InfoCircleOutlined,
  MailOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { Button, Card, Col, Form, Input, message, Row, Select, Switch, Tooltip, Badge, Divider } from 'antd';
import React, { useEffect, useState } from 'react';
import '../../crm-components.css';

const { Option } = Select;

interface BalanceManagementProps {
  isConnected: boolean;
  serverConfig?: any;
  serverName?: string;
  onOperationComplete: (success: boolean, message: string) => void;
  userData?: any;
}

interface FormData {
  login: string;
  originalAmount: string;
  percentage: string;
  amount: string;
  comment: string;
  operationType: string;
  isDeposit: boolean;
  skipMarginCheck: boolean;
  isCredit: boolean;
}

interface UserCreditInfo {
  eMail?: string;
  firstName?: string;
  login?: number;
  group?: string;
  credit?: number;
  balance?: number;
  equityPrevDay?: number;
}

const BalanceManagementTsx: React.FC<BalanceManagementProps> = ({
  isConnected,
  serverConfig = {},
  serverName = '',
  onOperationComplete,
  userData = {},
}) => {
  const [form] = Form.useForm();
  const [formData, setFormData] = useState<FormData>({
    login: userData?.login || '',
    originalAmount: '',
    percentage: '',
    amount: '',
    comment: '',
    operationType: 'correction',
    isDeposit: true,
    skipMarginCheck: true,
    isCredit: true,
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [calculationMode, setCalculationMode] = useState<'manual' | 'percentage'>('manual');
  const [userCreditInfo, setUserCreditInfo] = useState<UserCreditInfo | null>(null);
  const [fetchingCredit, setFetchingCredit] = useState<boolean>(false);
  useEffect(() => {
    if (userData && userData.login) {
      setFormData((prev) => ({
        ...prev,
        login: userData.login,
      }));
      form.setFieldsValue({ login: userData.login });

      // Fetch user credit info when login is available
      fetchUserCreditInfo(userData.login);
    }
  }, [userData, form]);

  // Fetch user credit info
  const fetchUserCreditInfo = async (loginId: string | number) => {
    if (!loginId) return;

    setFetchingCredit(true);
    try {
      const response = await api.app.getUserCreditGet(loginId);
      if (response && response.data) {
        setUserCreditInfo(response.data);
      }
    } catch (error) {
      console.error('Error fetching user credit info:', error);
    } finally {
      setFetchingCredit(false);
    }
  };

  // Listen for login changes to fetch updated credit info
  useEffect(() => {
    const loginValue = form.getFieldValue('login');
    if (loginValue) {
      fetchUserCreditInfo(loginValue);
    }
  }, [formData.login]);

  useEffect(() => {
    if (calculationMode === 'percentage' && formData.originalAmount && formData.percentage) {
      const original = parseFloat(formData.originalAmount);
      const percentage = parseFloat(formData.percentage);

      if (!isNaN(original) && !isNaN(percentage)) {
        const calculatedAmount = ((original * percentage) / 100).toFixed(2);
        setFormData((prev) => ({
          ...prev,
          amount: calculatedAmount,
        }));
        form.setFieldsValue({ amount: calculatedAmount });
      }
    }
  }, [formData.originalAmount, formData.percentage, calculationMode, form]);

  const handleValuesChange = (changedValues: any) => {
    // Update formData state with new values
    const newData = { ...formData, ...changedValues };
    setFormData(newData);

    // If login changed, fetch new credit info
    if ('login' in changedValues) {
      fetchUserCreditInfo(changedValues.login);
    }

    // Handle special case for comment field - auto-set isCredit based on comment selection
    if ('comment' in changedValues) {
      const comment = changedValues.comment;

      // Auto-set isCredit based on comment selection
      if (comment === 'Credit In') {
        form.setFieldsValue({ isCredit: true });
        setFormData(prev => ({ ...prev, isCredit: true }));
      } else if (comment === 'Credit Out') {
        form.setFieldsValue({ isCredit: false });
        setFormData(prev => ({ ...prev, isCredit: false }));
      }

      // For deposit/withdrawal comments, set isDeposit accordingly
      if (comment === 'Deposit' || comment === 'Deposit from') {
        form.setFieldsValue({ isDeposit: true, isCredit: false });
        setFormData(prev => ({ ...prev, isDeposit: true, isCredit: false }));
      } else if (comment === 'Withdrawal' || comment === 'Withdraw to') {
        form.setFieldsValue({ isDeposit: false, isCredit: false });
        setFormData(prev => ({ ...prev, isDeposit: false, isCredit: false }));
      }
    }

    // Handle special calculation mode logic
    if ('originalAmount' in changedValues || 'percentage' in changedValues) {
      setCalculationMode('percentage');
    }

    // Handle amount changes in manual mode
    if ('amount' in changedValues && calculationMode === 'manual') {
      setCalculationMode('manual');
    }
  };

  const toggleCalculationMode = () => {
    const newMode = calculationMode === 'manual' ? 'percentage' : 'manual';
    setCalculationMode(newMode);

    if (newMode === 'manual') {
      // When switching to manual, clear percentage fields
      form.setFieldsValue({
        originalAmount: '',
        percentage: '',
      });
      setFormData((prev) => ({
        ...prev,
        originalAmount: '',
        percentage: '',
      }));
    }
  };

  const handleSubmit = async () => {
    setLoading(true); // Show loading state immediately
    
    try {
      const values = form.getFieldsValue();
      console.log('🧾 Form Values......:', values.login);
  
      const requestBody = {
        amount: parseFloat(values.amount),
        comment: values.comment,
        operationType: values.operationType,
        isDeposit: values.isDeposit,
        isCredit: values.isCredit,
        skipMarginCheck: values.skipMarginCheck,
      };
  
      // Assuming login ID is dynamically set somewhere or pulled from form
      const loginId = values.login;
  
      const response = await api.app.balance(loginId, requestBody);
  
      // Try parsing response
      let responseData;
      try {
        responseData = response?.data || response;
      } catch (parseError) {
        console.warn('⚠️ Response parsing error:', parseError);
        responseData = response;
      }
  
      // Extract a meaningful message
      const apiMessage =
        typeof responseData === 'string'
          ? responseData
          : responseData?.message || 'Balance operation completed.';
  
      if (
        responseData &&
        typeof responseData === 'string' &&
        responseData.toLowerCase().includes('success')
      ) {
        // Success case
        message.success(apiMessage);
        
        // Call the onOperationComplete callback to notify parent component
        if (onOperationComplete) {
          onOperationComplete(true, apiMessage);
        }
        
        // Reset form fields while keeping the login ID
        const currentLogin = form.getFieldValue('login');
        
        // Reset calculation related fields
        setFormData(prev => ({
          ...prev,
          originalAmount: '',
          percentage: '',
          amount: '',
          comment: ''
        }));
        
        // Reset form fields
        form.setFieldsValue({
          originalAmount: '',
          percentage: '',
          amount: '',
          comment: ''
        });
        
        // Reset calculation mode
        setCalculationMode('manual');
        
        // Refresh credit info after successful operation
        fetchUserCreditInfo(loginId);
      } else {
        // Error case
        console.error('⚠️ Balance API Error:', apiMessage);
        message.error(apiMessage);
        
        // Call the onOperationComplete callback to notify parent component of failure
        if (onOperationComplete) {
          onOperationComplete(false, apiMessage);
        }
      }
    } catch (error) {
      console.error('❌ Error during balance operation:', error);
      const errorMessage = 'An error occurred while processing the balance operation.';
      message.error(errorMessage);
      
      // Call the onOperationComplete callback to notify parent component of failure
      if (onOperationComplete) {
        onOperationComplete(false, errorMessage);
      }
    } finally {
      setLoading(false); // Hide loading state
    }
  };

  return (
    <Card className="balance-management-card">
      <Card.Meta
        title={
          <div className="card-title-container">
            <DollarOutlined className="icon-primary" />
            <span>Update User Balance</span>
            {serverName && <div className="server-badge">{serverName}</div>}
          </div>
        }
        style={{ marginBottom: 16 }}
      />

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        onValuesChange={handleValuesChange}
        initialValues={{
          login: userData?.login || '',
          operationType: 'correction',
          isDeposit: true,
          skipMarginCheck: true,
          isCredit: true,
        }}
      >
        <Form.Item
          label={
            <span>
              <UserOutlined className="icon-secondary" />
              Login ID
            </span>
          }
          name="login"
          rules={[{ required: true, message: 'Login ID is required' }]}
        >
          <Input
            type="number"
            placeholder="Enter user login ID"
            suffix={
              <Button
                type="primary"
                size="small"
                onClick={() => fetchUserCreditInfo(form.getFieldValue('login'))}
                loading={fetchingCredit}
              >
                Lookup
              </Button>
            }
          />
        </Form.Item>

        {/* User Information Card */}
        {userCreditInfo && (
          <div className="user-info-card">
            <div className="user-info-header">
              <UserOutlined style={{ marginRight: 8 }} />
              User Information
            </div>
            <div className="user-info-body">
              <Row gutter={16}>
                <Col span={12}>
                  <div className="info-item">
                    <div className="info-label">Login ID:</div>
                    <div className="info-value">{userCreditInfo.login || "N/A"}</div>
                  </div>
                  <div className="info-item">
                    <div className="info-label">Name:</div>
                    <div className="info-value">{userCreditInfo.firstName || "N/A"}</div>
                  </div>
                  <div className="info-item">
                    <div className="info-label">Balance:</div>
                    <div className="info-value balance-value">
                      ${typeof userCreditInfo.balance === 'number' ? userCreditInfo.balance.toFixed(2) : "0.00"}
                    </div>
                  </div>
                </Col>
                <Col span={12}>
                  <div className="info-item">
                    <div className="info-label">Email:</div>
                    <div className="info-value">{userCreditInfo.eMail || "N/A"}</div>
                  </div>
                  <div className="info-item">
                    <div className="info-label">Group:</div>
                    <div className="info-value">
                      <Badge color="blue" text={userCreditInfo.group || "N/A"} />
                    </div>
                  </div>
                  <div className="info-item">
                    <div className="info-label">Credit:</div>
                    <div className="info-value credit-value">
                      ${typeof userCreditInfo.credit === 'number' ? userCreditInfo.credit.toFixed(2) : "0.00"}
                    </div>
                  </div>
                </Col>
              </Row>
              <div className="info-item">
                <div className="info-label">Equity (Prev Day):</div>
                <div className="info-value equity-value">
                  ${typeof userCreditInfo.equityPrevDay === 'number' ? userCreditInfo.equityPrevDay.toFixed(2) : "0.00"}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="card-header-actions">
          <Button
            type={calculationMode === 'percentage' ? 'default' : 'primary'}
            size="small"
            onClick={toggleCalculationMode}
            className="calculation-toggle-btn"
          >
            {calculationMode === 'percentage' ? 'Switch to Manual' : 'Use Percentage'}
          </Button>
        </div>

        {calculationMode === 'percentage' && (
          <div className="calculation-section">
            <h4>Percentage Calculation</h4>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Original Amount"
                  name="originalAmount"
                  rules={[
                    {
                      required: calculationMode === 'percentage',
                      message: 'Original amount is required',
                    },
                  ]}
                >
                  <Input type="number" step="0.01" placeholder="Enter original amount" />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  label="Percentage (%)"
                  name="percentage"
                  rules={[
                    {
                      required: calculationMode === 'percentage',
                      message: 'Percentage is required',
                    },
                  ]}
                >
                  <Input type="number" step="0.01" placeholder="Enter percentage" />
                </Form.Item>
              </Col>
            </Row>
          </div>
        )}

        <Row gutter={16}>
          <Col span={calculationMode === 'percentage' ? 24 : 12}>
            <Form.Item
              label={
                <span>
                  <DollarOutlined className="icon-success" />
                  Final Amount
                </span>
              }
              name="amount"
              rules={[{ required: true, message: 'Amount is required' }]}
            >
              <Input
                type="number"
                step="0.01"
                placeholder="Enter amount"
                prefix="$"
                readOnly={calculationMode === 'percentage'}
                className={calculationMode === 'percentage' ? 'calculated-amount' : ''}
              />
            </Form.Item>

            {calculationMode === 'percentage' &&
              formData.originalAmount &&
              formData.percentage &&
              formData.amount && (
                <div className="calculation-formula">
                  <span>{formData.originalAmount}</span>
                  <span> × </span>
                  <span>{formData.percentage}%</span>
                  <span> = </span>
                  <span>${formData.amount}</span>
                </div>
              )}
          </Col>

          {calculationMode !== 'percentage' && (
            <Col span={12}>
              <Form.Item
                label={
                  <span>
                    <CommentOutlined className="icon-secondary" />
                    Comment
                  </span>
                }
                name="comment"
                rules={[{ required: true, message: 'Comment is required' }]}
              >
                <Select placeholder="Select a comment...">
                  <Option value="Credit In">Credit In</Option>
                  <Option value="Deposit">Deposit</Option>
                  <Option value="Withdrawal">Withdrawal</Option>
                  <Option value="Deposit from">Deposit from</Option>
                  <Option value="Withdraw to">Withdraw to</Option>
                  <Option value="Credit Out">Credit Out</Option>
                  <Option value="... put your comment here...">
                    ... put your comment here...
                  </Option>
                </Select>
              </Form.Item>
            </Col>
          )}
        </Row>

        {calculationMode === 'percentage' && (
          <Form.Item
            label={
              <span>
                <CommentOutlined className="icon-secondary" />
                Comment
              </span>
            }
            name="comment"
            rules={[{ required: true, message: 'Comment is required' }]}
          >
            <Select placeholder="Select a comment...">
              <Option value="Credit In">Credit In</Option>
              <Option value="Deposit">Deposit</Option>
              <Option value="Withdrawal">Withdrawal</Option>
              <Option value="Deposit from">Deposit from</Option>
              <Option value="Withdraw to">Withdraw to</Option>
              <Option value="Credit Out">Credit Out</Option>
              <Option value="... put your comment here...">... put your comment here...</Option>
            </Select>
          </Form.Item>
        )}

        <Form.Item
          label={
            <span>
              <SettingOutlined className="icon-secondary" />
              Operation Type
              <Tooltip
                title={
                  <div>
                    <p>
                      <strong>balance</strong> - Regular balance operation
                    </p>
                    <p>
                      <strong>credit</strong> - Adjustment to credit amount
                    </p>
                    <p>
                      <strong>correction</strong> - Balance correction
                    </p>
                    <p>
                      <strong>bonus</strong> - Bonus amount
                    </p>
                    <p>
                      <strong>commission</strong> - Commission adjustment
                    </p>
                  </div>
                }
              >
                <QuestionCircleOutlined style={{ marginLeft: 8 }} />
              </Tooltip>
            </span>
          }
          name="operationType"
          rules={[{ required: true, message: 'Operation type is required' }]}
        >
          <Select>
            <Option value="balance">balance</Option>
            <Option value="credit">Credit</Option>
            <Option value="charge">charge</Option>
            <Option value="correction">correction</Option>
            <Option value="bonus">bonus</Option>
            <Option value="commission">commission</Option>
            <Option value="dividend">dividend</Option>
            <Option value="tax">tax</Option>
            <Option value="so_compensation">so_compensation</Option>
          </Select>
        </Form.Item>

        <div className="options-section">
          <h4>Additional Options</h4>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="isDeposit" valuePropName="checked" label="Transaction Type">
                <Switch checkedChildren="Deposit" unCheckedChildren="Withdrawal" defaultChecked />
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item name="skipMarginCheck" valuePropName="checked" label="Skip Margin Check">
                <Switch defaultChecked />
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item name="isCredit" valuePropName="checked" label="Is Credit">
                <Switch />
              </Form.Item>
            </Col>
          </Row>
        </div>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            block
            className={formData.isDeposit ? 'btn-success' : 'btn-danger'}
            disabled={loading}
          >
            {formData.isDeposit ? 'Deposit' : 'Withdraw'}{' '}
            {formData.amount ? `$${formData.amount}` : ''}
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default BalanceManagementTsx;
