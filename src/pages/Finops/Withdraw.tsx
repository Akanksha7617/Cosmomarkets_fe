// Modern Redesigned Withdraw Page
import { api } from '@/components/common/api';
import { Type } from '@/generated';
import { Transfer } from '@/pages/Finops/common/Transfer';
import { useModel } from '@@/exports';
import {
  ArrowLeftOutlined,
  SwapOutlined,
  PayCircleOutlined,
  BankOutlined,
  WalletOutlined,
  CheckCircleOutlined,
  DollarCircleOutlined,
  CreditCardOutlined,
  ThunderboltOutlined,
  RocketOutlined,
  ExclamationCircleOutlined,
  SafetyOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { history, useLocation } from '@umijs/max';
import {
  Button,
  Card,
  Checkbox,
  ConfigProvider,
  Form,
  Input,
  InputNumber,
  message,
  Select,
  Typography,
  Steps,
  Row,
  Col,
  Space,
  Alert,
  Divider,
} from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import CustomLoader from '../CustomLoader';
import './../../common.css';
import StatusPage from './common/StatusPage';

const { Title, Text } = Typography;
const { Option } = Select;
const { Step } = Steps;

// Define payment method interface
interface PaymentMethod {
  key: string;
  label: string;
  icon: React.ReactNode;
  details: string;
  processingTime: string;
  cost: number;
  category: string;
  minAmount: number;
}

const getInitialAccount = () => {
  const params = new URLSearchParams(location.search);
  const accountParam = params.get('account');
  return accountParam === 'mt5' ? 'MT5 Trading Account' : 'Wallet Account';
};

const getInitialIsMt5 = () => {
  const params = new URLSearchParams(location.search);
  const accountParam = params.get('account');
  return accountParam === 'mt5';
};

const Withdraw: React.FC = () => {
  // State management
  const [proofData, setProofData] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedCurrency, setSelectedCurrency] = useState<string>('usd');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | undefined>(undefined);
  const [balance, setBalance] = useState<number>(0);
  const [selectedAccount, setSelectedAccount] = useState(getInitialAccount());
  const [isMt5, setIsMt5] = useState(getInitialIsMt5());
  const [isCheckingProof, setIsCheckingProof] = useState(true);
  const [withdrawProcessing, setWithdrawProcessing] = useState(false);
  const [amount, setAmount] = useState<any>(0);

  // Forms
  const [form] = Form.useForm();
  const [amountForm] = Form.useForm();
  const location = useLocation();

  // Get user information
  const { initialState } = useModel('@@initialState');
  const wallet = initialState?.currentUser?.wallet;

  // Define payment methods array organized by category
  const paymentMethods: PaymentMethod[] = [
    {
      key: 'bank-wire',
      label: 'Bank Wire',
      icon: <BankOutlined />,
      details: 'Secure bank wire transfer',
      processingTime: '1-24 hours',
      cost: 0,
      category: 'traditional',
      minAmount: 50,
    },
    {
      key: 'usdt',
      label: 'USDT (TRC-20)',
      icon: <RocketOutlined />,
      details: 'USDT cryptocurrency withdrawal',
      processingTime: 'Instant',
      cost: 0,
      category: 'crypto',
      minAmount: 10,
    },
    // Add more payment methods as needed
  ];

  // Initialize balance and fetch bank details when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        await init();
        await proofSettings();
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fetch bank details if needed
  useEffect(() => {
    if (currentStep === 3 && selectedPaymentMethod === 'bank-wire') {
      fetchBankDetails();
    }
  }, [currentStep, selectedPaymentMethod]);

  async function init() {
    setBalance(initialState?.currentUser?.wallet?.balance || 0);
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsCheckingProof(true);

        const response = await api.proof.getProofSetting();
        const allApproved = response.every((field) => field && field.status === 'Approved');

        if (allApproved && response.length > 0) {
          setProofData('Approved');
          await init();
        } else {
          setProofData('Requested');
        }

        setIsCheckingProof(false);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setProofData('Requested');
        setIsCheckingProof(false);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const fetchBankDetails = async () => {
    try {
      const bankDetails = await api.transaction.getBankAccount();

      if (bankDetails) {
        form.setFieldsValue({
          beneficiary: bankDetails.beneficiary,
          name: bankDetails.name,
          address: bankDetails.address,
          account: bankDetails.account,
          ifscIban: bankDetails.ifscIban,
          comment: bankDetails.comment,
        });
      }
    } catch (error) {
      console.error('Error fetching bank details:', error);
    }
  };

  const handleAccountChange = (value) => {
    setSelectedAccount(value);
    setIsMt5(value === 'MT5 Trading Account');
    if (value === 'Wallet Account') {
      setCurrentStep(1);
    }
  };

  const handleNextStep = () => {
    setCurrentStep(currentStep + 1);
  };

  const handlePrevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const handlePaymentMethodSelect = (methodKey: string) => {
    setSelectedPaymentMethod(methodKey);
    handleNextStep();
  };

  const handleAmountSubmit = async (values: any) => {
    const amountValue = values.amount;
    setAmount(amountValue);
    setWithdrawProcessing(true);

    try {
      if (wallet?.balance === 0) {
        message.error('Insufficient Balance');
        return;
      }

      if (amountValue > wallet?.balance) {
        message.error('Amount cannot exceed the wallet balance');
        return;
      }

      const selectedMethod = paymentMethods.find(m => m.key === selectedPaymentMethod);
      if (selectedMethod && amountValue < selectedMethod.minAmount) {
        message.error(`Minimum withdrawal amount is $${selectedMethod.minAmount}`);
        return;
      }

      message.success('Amount validated successfully');
      handleNextStep();
    } catch (error) {
      console.error('Error:', error);
      message.error('Error validating amount. Please try again.');
    } finally {
      setWithdrawProcessing(false);
    }
  };

  const handleBankWithdrawal = async (values: any) => {
    try {
      setLoading(true);

      const formData = {
        type: Type.WALLET_TO_EXT,
        amount: amount,
        currency: 'USD',
        comment: values.comment,
        bank: { ...values },
        PaymentMethod: selectedPaymentMethod,
      };

      const response = await api.transaction.withdraw(formData);

      if (response.message && response.message.includes('User does not have enough wallet balance!')) {
        message.error(response.message);
      } else {
        message.success('Withdrawal requested successfully');
        history.push('/finops/transaction_history');
      }
    } catch (error) {
      console.error('Error processing withdrawal:', error);
      message.error('Failed to process withdrawal request');
    } finally {
      setLoading(false);
    }
  };

  const handleCryptoWithdrawal = async (values: any) => {
    try {
      setLoading(true);

      const formData = {
        type: Type.WALLET_TO_EXT,
        amount: amount,
        currency: 'USD',
        comment: values.comment,
        cryptoWallet: { ...values },
        PaymentMethod: selectedPaymentMethod,
      };

      const response = await api.transaction.Cryptowithdraw(formData);

      if (response.message && response.message.includes('User does not have enough wallet balance!')) {
        message.error(response.message);
      } else {
        message.success('Withdrawal requested successfully');
        history.push('/finops/transaction_history');
      }
    } catch (error) {
      console.error('Error processing crypto withdrawal:', error);
      message.error('Failed to process withdrawal request');
    } finally {
      setLoading(false);
    }
  };

  const resetWithdraw = () => {
    setCurrentStep(0);
    setSelectedPaymentMethod(undefined);
    setAmount(0);
    amountForm.resetFields();
    form.resetFields();
  };

  // Step components
  const renderAccountSelection = () => (
    <Card
      title={
        <div style={{ textAlign: 'center' }}>
          <Title level={3} style={{ margin: 0, color: 'white' }}>
            Select Source Account
          </Title>
        </div>
      }
      className="withdraw-step-card"
    >
      <Row justify="center">
        <Col xs={24} sm={16} md={12}>
          <Select
            size="large"
            value={selectedAccount}
            onChange={handleAccountChange}
            style={{ width: '100%' }}
            placeholder="Choose account type"
          >
            <Option value="Wallet Account">
              <Space>
                <WalletOutlined />
                Wallet Account
              </Space>
            </Option>
            <Option value="MT5 Trading Account">
              <Space>
                <BankOutlined />
                MT5 Trading Account
              </Space>
            </Option>
          </Select>
        </Col>
      </Row>

      {selectedAccount === 'Wallet Account' && (
        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <Alert
            message="Ready to proceed with Wallet withdrawal"
            description={`Available balance: $${balance.toFixed(2)}`}
            type="info"
            showIcon
            style={{ marginBottom: '16px' }}
          />
          <Button
            type="primary"
            size="large"
            onClick={handleNextStep}
            icon={<ArrowLeftOutlined />}
          >
            Continue
          </Button>
        </div>
      )}
    </Card>
  );

  const renderPaymentMethods = () => {
    const traditionalMethods = paymentMethods.filter(m => m.category === 'traditional');
    const cryptoMethods = paymentMethods.filter(m => m.category === 'crypto');

    return (
      <div className="payment-methods-container">
        <Title level={2} style={{ textAlign: 'center', marginBottom: '32px' }}>
          Choose Withdrawal Method
        </Title>

        <div style={{ marginBottom: '32px' }}>
          <Title level={4}>
            <BankOutlined style={{ marginRight: '8px' }} />
            Traditional Methods
          </Title>
          <Row gutter={[16, 16]}>
            {traditionalMethods.map((method) => (
              <Col xs={24} sm={12} md={8} key={method.key}>
                <Card
                  hoverable
                  className={`payment-method-card ${selectedPaymentMethod === method.key ? 'selected' : ''}`}
                  onClick={() => handlePaymentMethodSelect(method.key)}
                  style={{ height: '180px' }}
                >
                  <div className="payment-method-content">
                    <div className="payment-icon">
                      {method.icon}
                    </div>
                    <Title level={5}>{method.label}</Title>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      {method.details}
                    </Text>
                    <div className="processing-time">
                      <Text strong>{method.processingTime}</Text>
                    </div>
                    <div style={{ marginTop: '8px' }}>
                      <Text style={{ fontSize: '11px', color: '#ff6b6b' }}>
                        Min: ${method.minAmount}
                      </Text>
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </div>

        <div>
          <Title level={4}>
            <ThunderboltOutlined style={{ marginRight: '8px' }} />
            Cryptocurrency
          </Title>
          <Row gutter={[16, 16]}>
            {cryptoMethods.map((method) => (
              <Col xs={24} sm={12} md={8} key={method.key}>
                <Card
                  hoverable
                  className={`payment-method-card crypto-card ${selectedPaymentMethod === method.key ? 'selected' : ''}`}
                  onClick={() => handlePaymentMethodSelect(method.key)}
                  style={{ height: '180px' }}
                >
                  <div className="payment-method-content">
                    <div className="payment-icon crypto-icon">
                      {method.icon}
                    </div>
                    <Title level={5}>{method.label}</Title>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      {method.details}
                    </Text>
                    <div className="processing-time">
                      <Text strong style={{ color: '#52c41a' }}>{method.processingTime}</Text>
                    </div>
                    <div style={{ marginTop: '8px' }}>
                      <Text style={{ fontSize: '11px', color: '#ff6b6b' }}>
                        Min: ${method.minAmount}
                      </Text>
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </div>

        <div style={{ textAlign: 'center', marginTop: '32px' }}>
          <Button onClick={handlePrevStep} style={{ marginRight: '16px' }}>
            Back
          </Button>
        </div>
      </div>
    );
  };

  const renderAmountForm = () => {
    const selectedMethod = paymentMethods.find(m => m.key === selectedPaymentMethod);

    return (
      <Card className="amount-form-card">
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <Title level={2}>Enter Withdrawal Amount</Title>

          {selectedMethod && (
            <Card className="selected-method-card" style={{ marginBottom: '24px' }}>
              <div className="selected-method-mobile-responsive">
                <div className="selected-method-icon">
                  {selectedMethod.icon}
                </div>
                <div className="selected-method-text">
                  <Text strong>{selectedMethod.label}</Text><br></br>
                  <Text type="secondary" className="method-details">{selectedMethod.details}
                    <br></br>
                  </Text>
                  <Text className="method-minimum">Minimum: ${selectedMethod.minAmount}</Text>
                </div>
                <a
                  onClick={() => setCurrentStep(1)}
                  style={{ color: '#ff6b6b', cursor: 'pointer', textDecoration: 'underline' }}
                >
                  Change
                </a>
              </div>
            </Card>
          )}

          <Alert
            message="Withdrawal Information"
            description={`Available balance: $${balance.toFixed(2)}`}
            type="info"
            showIcon
            style={{ marginBottom: '24px' }}
          />
        </div>

        <Row justify="center">
          <Col xs={24} sm={16} md={12}>
            <Form
              form={amountForm}
              layout="vertical"
              onFinish={handleAmountSubmit}
              size="large"
            >
              <Form.Item
                name="amount"
                label="Amount (USD)"
                rules={[
                  { required: true, message: 'Please enter an amount' },
                  { type: 'number', message: 'Please enter a valid number' },
                  {
                    validator: (_, value) => {
                      if (!selectedMethod) return Promise.resolve();
                      return value >= selectedMethod.minAmount
                        ? Promise.resolve()
                        : Promise.reject(`Amount must be at least $${selectedMethod.minAmount}`);
                    },
                  },
                ]}
              >
                <InputNumber
                  prefix="$"
                  placeholder="Enter amount"
                  style={{ width: '100%', fontSize: '18px' }}
                  max={balance}
                />
              </Form.Item>

              <div style={{ textAlign: 'center', marginTop: '24px' }}>
                <Space size="large">
                  <Button size="large" onClick={handlePrevStep}>
                    Back
                  </Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={withdrawProcessing}
                    size="large"
                  >
                    Continue
                  </Button>
                </Space>
              </div>
            </Form>
          </Col>
        </Row>
      </Card>
    );
  };

  const renderWithdrawalDetails = () => {
    const isCrypto = selectedPaymentMethod === 'usdt';
    const isBank = selectedPaymentMethod === 'bank-wire';
    const selectedMethod = paymentMethods.find(m => m.key === selectedPaymentMethod);

    return (
      <div className="withdrawal-details-container">
        <Title level={2} style={{ textAlign: 'center', marginBottom: '32px' }}>
          Complete Your Withdrawal
        </Title>

        <Row gutter={[24, 24]} justify="center">
          <Col xs={24} lg={16}>
            <Card className="withdrawal-form-card">
              <div style={{ marginBottom: '24px', textAlign: 'center' }}>
                <Alert
                  message="Withdrawal Summary"
                  description={
                    <div>
                      <p><strong>Method:</strong> {selectedMethod?.label}</p>
                      <p><strong>Amount:</strong> ${amount}</p>
                      <p><strong>Processing Time:</strong> {selectedMethod?.processingTime}</p>
                    </div>
                  }
                  type="info"
                  showIcon
                />
              </div>

              {isBank && (
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={handleBankWithdrawal}
                  size="large"
                >
                  <Title level={4}>Bank Wire Details</Title>

                  <Form.Item
                    name="beneficiary"
                    label="Beneficiary Name"
                    rules={[{ required: true, message: 'Please enter beneficiary name' }]}
                  >
                    <Input placeholder="Enter beneficiary name" />
                  </Form.Item>

                  <Form.Item
                    name="name"
                    label="Bank Name"
                    rules={[{ required: true, message: 'Please enter bank name' }]}
                  >
                    <Input placeholder="Enter bank name" />
                  </Form.Item>

                  <Form.Item
                    name="address"
                    label="Bank Address"
                    rules={[{ required: true, message: 'Please enter bank address' }]}
                  >
                    <Input placeholder="Enter bank address" />
                  </Form.Item>

                  <Form.Item
                    name="account"
                    label="Bank Account Number"
                    rules={[{ required: true, message: 'Please enter account number' }]}
                  >
                    <Input placeholder="Enter account number" />
                  </Form.Item>

                  <Form.Item
                    name="ifscIban"
                    label="IFSC/IBAN"
                    rules={[{ required: true, message: 'Please enter IFSC/IBAN' }]}
                  >
                    <Input placeholder="Enter IFSC/IBAN" />
                  </Form.Item>

                  <Form.Item
                    name="comment"
                    label="Additional Comment"
                    rules={[{ required: true, message: 'Please enter a comment' }]}
                  >
                    <Input.TextArea placeholder="Enter additional comments" />
                  </Form.Item>

                  <Form.Item>
                    <Checkbox>
                      I have read all instructions and agree with terms and conditions of payment operations
                    </Checkbox>
                  </Form.Item>

                  <Form.Item>
                    <Checkbox>Save Bank Details</Checkbox>
                  </Form.Item>

                  <div style={{ textAlign: 'center', marginTop: '24px' }}>
                    <Space size="large">
                      <Button size="large" onClick={handlePrevStep}>
                        Back
                      </Button>
                      <Button
                        type="primary"
                        htmlType="submit"
                        loading={loading}
                        size="large"
                        icon={<CheckCircleOutlined />}
                      >
                        Submit Withdrawal
                      </Button>
                    </Space>
                  </div>
                </Form>
              )}

              {isCrypto && (
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={handleCryptoWithdrawal}
                  size="large"
                >
                  <Title level={4}>USDT Withdrawal Details</Title>

                  <Alert
                    message="Important"
                    description="Please ensure the wallet address is correct. Cryptocurrency transactions cannot be reversed."
                    type="warning"
                    showIcon
                    style={{ marginBottom: '24px' }}
                  />

                  <Form.Item
                    name="cyrptoWalletAddress"
                    label="USDT Wallet Address"
                    rules={[{ required: true, message: 'Please enter USDT wallet address' }]}
                  >
                    <Input placeholder="Enter your USDT wallet address" />
                  </Form.Item>

                  <Form.Item
                    name="comment"
                    label="Additional Comment"
                    rules={[{ required: true, message: 'Please enter a comment' }]}
                  >
                    <Input placeholder="Enter additional comments" />
                  </Form.Item>

                  <div style={{ textAlign: 'center', marginTop: '24px' }}>
                    <Space size="large">
                      <Button size="large" onClick={handlePrevStep}>
                        Back
                      </Button>
                      <Button
                        type="primary"
                        htmlType="submit"
                        loading={loading}
                        size="large"
                        icon={<CheckCircleOutlined />}
                      >
                        Submit Withdrawal
                      </Button>
                    </Space>
                  </div>
                </Form>
              )}
            </Card>
          </Col>
        </Row>
      </div>
    );
  };

  const renderMT5Withdraw = () => (
    <div style={{ padding: '24px' }}>

      <Transfer
        title={'Withdraw from MT5'}
        type={Type.MT_TO_WALLET}
        successMsg={{
          content: 'Requested withdraw from MT5 successfully!',
          icon: <span className="orange-success-icon"> ✔ </span>,
          className: 'orange-success-notification',
          duration: 3,
        }}
        failureMsg={{
          content: 'Failed to request withdraw amount from MT5!',
          icon: <span className="orange-error-icon"> ✘ </span>,
          className: 'orange-error-notification',
          duration: 3,
        }}

        onBack={() => {
          setIsMt5(false);
          setCurrentStep(0);
        }}
      />
    </div>
  );

  const steps = [
    { title: 'Account', icon: <WalletOutlined /> },
    { title: 'Method', icon: <SwapOutlined /> },
    { title: 'Amount', icon: <DollarCircleOutlined /> },
    { title: 'Complete', icon: <CheckCircleOutlined /> },
  ];

  return (
    <>
      {isCheckingProof || loading ? (
        <CustomLoader />
      ) : proofData === 'Approved' ? (
        <ConfigProvider>
          <PageContainer>
            <div className="modern-withdraw-container">
              <div className="withdraw-header">
                <Title level={1} style={{ textAlign: 'center', marginBottom: '8px' }}>
                  Withdraw Your Funds
                </Title>
                <Text
                  type="secondary"
                  style={{
                    display: 'block',
                    textAlign: 'center',
                    fontSize: '16px',
                    color: 'white',
                  }}
                >
                  Quick and secure withdrawals to access your trading profits
                </Text>
              </div>

              {!isMt5 && (
                <div className="progress-section">
                  <Steps current={currentStep} size="small" style={{ maxWidth: '800px', margin: '32px auto' }}>
                    {steps.map((step, index) => (
                      <Step key={index} title={step.title} icon={step.icon} />
                    ))}
                  </Steps>
                </div>
              )}

              <div className="withdraw-content">
                {isMt5 ? (
                  renderMT5Withdraw()
                ) : (
                  <>
                    {currentStep === 0 && renderAccountSelection()}
                    {currentStep === 1 && renderPaymentMethods()}
                    {currentStep === 2 && renderAmountForm()}
                    {currentStep === 3 && renderWithdrawalDetails()}
                  </>
                )}
              </div>

              {currentStep > 0 && !isMt5 && (
                <div style={{ textAlign: 'center', marginTop: '32px' }}>
                  <Button onClick={resetWithdraw} type="link">
                    Start New Withdrawal
                  </Button>
                </div>
              )}
            </div>
          </PageContainer>
        </ConfigProvider>
      ) : (
        <StatusPage />
      )}
    </>
  );
};

export default Withdraw;