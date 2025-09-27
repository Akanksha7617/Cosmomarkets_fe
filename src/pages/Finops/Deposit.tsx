// Modern Redesigned Deposit Page
import { api } from '@/components/common/api';
import { Type } from '@/generated';
import { useModel } from '@@/exports';
import {
  ArrowRightOutlined,
  TransactionOutlined,
  MoneyCollectOutlined,
  UploadOutlined,
  CreditCardOutlined,
  DollarCircleOutlined,
  RocketOutlined,
  ThunderboltOutlined,
  CheckCircleOutlined,
  WalletOutlined,
  BankOutlined,
  QrcodeOutlined,
  CopyOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { history, useLocation } from '@umijs/max';
import {
  Button,
  Card,
  ConfigProvider,
  Form,
  Input,
  message,
  Select,
  Table,
  theme,
  Typography,
  Upload,
  Steps,
  Row,
  Col,
  Divider,
  Space,
  Alert,
} from 'antd';
import React, { useEffect, useState } from 'react';
import CustomLoader from '../CustomLoader';
import { DepositTransferCommon } from './common/DepositTransferCommon';
import StatusPage from './common/StatusPage';

const { Title, Text } = Typography;
const { Option } = Select;
const { Step } = Steps;

interface PaymentMethod {
  key: string;
  label: string;
  icon: React.ReactNode;
  details: string;
  processingTime: string;
  cost: number;
  category: string;
}

interface PaymentSetting {
  id: number;
  name: string;
  url: string;
  description?: string;
  isActive: boolean;
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

const Deposit: React.FC = () => {
  const { token } = theme.useToken();
  const { initialState } = useModel('@@initialState');
  const [proofData, setProofData] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedCurrency, setSelectedCurrency] = useState<string>('usd');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | undefined>(undefined);
  const [balance, setBalance] = useState<number>(0);
  const [fileList, setFileList] = useState<any[]>([]);
  const [bankWireDetails, setBankWireDetails] = useState(null);
  const [paymentData, setPaymentData] = useState<PaymentSetting[]>([]);
  const [paymentLinks, setPaymentLinks] = useState<PaymentSetting[]>([]);
  const [amount, setAmount] = useState<any>(0);
  const [amountForm] = Form.useForm();
  const [selectedAccount, setSelectedAccount] = useState(getInitialAccount());
  const [isMt5, setIsMt5] = useState(getInitialIsMt5());
  const [isCheckingProof, setIsCheckingProof] = useState(true);
  const [depositProcessing, setDepositProcessing] = useState(false);

  const location = useLocation();

  // Crypto details with QR codes and wallet addresses
  const cryptoDetails = {
    'erc-deposit': {
      qrCode: '/images/ERC.png',
      walletAddress: '0x8eA5A04E8be48928E03d060A126184CF704eaE64',
      name: 'Ethereum (ERC-20)'
    },
    'btc-deposit': {
      qrCode: '/images/BTC.png',
      walletAddress: 'bc1q8c43czf4gjzwtat8zh3vhr8h2rs5av2kvxrx0f',
      name: 'Bitcoin'
    },
    'usdtc-deposit': {
      qrCode: '/images/USDTC.png',
      walletAddress: 'THnzBRE63NfkALRhHLtb8ZHJL2upkR2mCr',
      name: 'USDT (TRC-20)'
    }
  };

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

  // Payment methods organized by category
  const paymentMethods: PaymentMethod[] = [

    {
      key: 'card-payment',
      label: 'Card Payment',
      icon: <CreditCardOutlined />,
      details: 'Instant credit/debit card payment',
      processingTime: 'Instant',
      cost: 0,
      category: 'traditional'
    },
    {
      key: 'bank-transfer',
      label: 'Bank Transfer',
      icon: <BankOutlined />,
      details: 'Secure bank wire transfer',
      processingTime: '1-24 hours',
      cost: 0,
      category: 'traditional'
    },
    {
      key: 'usdtc-deposit',
      label: 'USDT (TRC)',
      icon: <RocketOutlined />,
      details: 'USDT TRC-20 token',
      processingTime: 'Instant',
      cost: 0,
      category: 'crypto'
    },
    {
      key: 'other-payment',
      label: 'Cash Deposit',
      icon: <MoneyCollectOutlined />,
      details: 'Cash deposit options',
      processingTime: 'Varies',
      cost: 0,
      category: 'traditional'
    },
    {
      key: 'erc-deposit',
      label: 'Ethereum (ERC)',
      icon: <ThunderboltOutlined />,
      details: 'ERC-20 token deposit',
      processingTime: 'Instant',
      cost: 0,
      category: 'crypto'
    },
    {
      key: 'btc-deposit',
      label: 'Bitcoin',
      icon: <DollarCircleOutlined />,
      details: 'Bitcoin cryptocurrency',
      processingTime: 'Instant',
      cost: 0,
      category: 'crypto'
    },

  ];

  async function init() {
    try {
      setBalance(initialState?.currentUser?.wallet?.balance || 0);
      const paymentSettingsResponse = await api.setting.getPaymentSettings();
      setPaymentData(paymentSettingsResponse);
      const paymentLinksResponse = await api.setting.getpaymentlinks(1000);
      setPaymentLinks(paymentLinksResponse);
      getBankWire();
    } catch (error) {
      console.error('Error initializing data:', error);
      message.error('Unable to load payment information. Please try again later.');
    }
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

  const getBankWire = async () => {
    try {
      const response = await api.transaction.getBankWire();
      setBankWireDetails(response);
    } catch (error) {
      message.error('Unable to fetch bank details.');
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

  const fetchPaymentLinks = async () => {
    try {
      const amountValue = amountForm.getFieldValue('amount');
      const response = await api.setting.getpaymentlinks(amountValue);
      setPaymentLinks(response);
      return response;
    } catch (error) {
      console.error('Error fetching payment links:', error);
      message.error('Unable to load payment options. Please try again later.');
      return [];
    }
  };

  const handleAmountSubmit = async (values: any) => {
    const amountValue = values.amount;
    setAmount(amountValue);
    setDepositProcessing(true);

    try {
      if (selectedPaymentMethod === 'card-payment') {
        const formData: any = {
          Type: Type.EXT_TO_WALLET,
          Amount: amountValue,
          Currency: 'USD',
          Comment: `Deposit ${amountValue}`,
          PaymentMethod: selectedPaymentMethod,
        };

        await api.transaction.deposit(formData);
        const paymentSettings = await api.setting.getPaymentSettings();
        setPaymentData(paymentSettings);
        const links = await fetchPaymentLinks();

        if (links && links.length > 0) {
          setPaymentLinks(links);
          message.success('Payment options loaded successfully.');
        }
      }

      message.success('Amount submitted successfully.');
      handleNextStep();
    } catch (error) {
      console.error('Error:', error);
      message.error('Error processing your request. Please try again.');
    } finally {
      setDepositProcessing(false);
    }
  };

  const handleFinalSubmit = async () => {
    try {
      setLoading(true);
      const amountValue = amount || amountForm.getFieldValue('amount');

      const formData: any = {
        Type: Type.EXT_TO_WALLET,
        Amount: amountValue,
        Currency: 'USD',
        Comment: `Deposit ${amountValue}`,
        PaymentMethod: selectedPaymentMethod,
      };

      if (fileList.length > 0) {
        formData.FormFile = fileList[0].originFileObj;
      }

      await api.transaction.deposit(formData);

      message.success('Deposit request submitted successfully!');
      history.push('/finops/transaction_history');
    } catch (error) {
      console.error(error);
      message.error('Error submitting deposit request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRedirect = (url: string) => {
    window.open(url, '_blank', 'noreferrer');
    history.push('/finops/transaction_history');
  };

  const uploadProps = {
    beforeUpload: (file: any) => {
      const acceptedFormats = ['image/jpeg', 'image/png', 'application/pdf'];
      if (!acceptedFormats.includes(file.type)) {
        message.error('Only JPEG, PNG, and PDF files are allowed.');
        return Upload.LIST_IGNORE;
      }

      if (file.size > 2 * 1024 * 1024) {
        message.error('File size should not exceed 2MB.');
        return Upload.LIST_IGNORE;
      }

      const fileObj = {
        uid: file.uid || Date.now().toString(),
        name: file.name,
        status: 'done',
        originFileObj: file,
        url: URL.createObjectURL(file),
      };

      setFileList([fileObj]);
      return false;
    },
    fileList,
    onRemove: () => {
      setFileList([]);
    },
    maxCount: 1,
    listType: 'text',
  };

  // Bank wire table data
  const dataSource = bankWireDetails
    ? [
      { key: '1', name: 'Account Holder', address: bankWireDetails.accountHolder },
      { key: '2', name: 'Account Number', address: bankWireDetails.accountNumber },
      { key: '3', name: 'IBAN', address: bankWireDetails.iban },
      { key: '4', name: 'SWIFT/BIC', address: bankWireDetails.swifT_BIC },
      { key: '5', name: 'BANK NAME', address: bankWireDetails.bank },
      { key: '6', name: 'BRANCH', address: bankWireDetails.branch },
      ...(bankWireDetails.ifsc ? [{ key: '7', name: 'IFSC', address: bankWireDetails.ifsc }] : []),
      ...(bankWireDetails.mmid ? [{ key: '8', name: 'MMID', address: bankWireDetails.mmid }] : []),
    ].filter((row) => row.address != null && row.address !== '')
    : [];

  const columns = [
    { title: 'Detail', dataIndex: 'name', key: 'name' },
    { title: 'Value', dataIndex: 'address', key: 'address' },
  ];

  const resetDeposit = () => {
    setCurrentStep(0);
    setSelectedPaymentMethod(undefined);
    setAmount(0);
    amountForm.resetFields();
    setFileList([]);
  };

  // Step components
  const renderAccountSelection = () => (
    <Card
      title={
        <div style={{ textAlign: 'center' }}>
          <Title
            level={3}
            style={{ margin: 0, color: 'white' }}
          >
            Select Destination Account
          </Title>
        </div>

      }
      className="deposit-step-card"
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
            message="Ready to proceed with Wallet deposit"
            description={`Current balance: $${balance.toFixed(2)}`}
            type="info"
            showIcon
            style={{ marginBottom: '16px' }}
          />
          <Button
            type="primary"
            size="large"
            onClick={handleNextStep}
            icon={<ArrowRightOutlined />}
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
          Choose Payment Method
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
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </div>

        <div>
          <Title level={4}>
            <QrcodeOutlined style={{ marginRight: '8px' }} />
            Cryptocurrency
          </Title>
          <Row gutter={[16, 16]}>
            {cryptoMethods.map((method) => (
              <Col xs={24} sm={12} md={8} key={method.key}>
                <Card
                  hoverable
                  className={`payment-method-card crypto-card ${selectedPaymentMethod === method.key ? 'selected' : ''}`}
                  onClick={() => handlePaymentMethodSelect(method.key)}

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
          <Title level={2}>Enter Deposit Amount</Title>

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
                  {
                    pattern: /^(?!0\d+)(\d+)(\.\d{1,2})?$/,
                    message: 'Please enter a valid amount',
                  },
                ]}
              >
                <Input
                  prefix="$"
                  placeholder="Enter amount"
                  size="large"
                  style={{ fontSize: '18px' }}
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
                    loading={depositProcessing}
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

  const renderPaymentDetails = () => {
    const isCrypto = ['erc-deposit', 'btc-deposit', 'usdtc-deposit'].includes(selectedPaymentMethod);
    const isBank = selectedPaymentMethod === 'bank-transfer';
    const isCard = selectedPaymentMethod === 'card-payment';
    const hasLeftContent = isCrypto || isBank || isCard;

    return (
      <div className="payment-details-container">
        <Title level={2} style={{ textAlign: 'center', marginBottom: '32px' }}>
          Complete Your Deposit
        </Title>

        <Row gutter={[24, 24]} justify={hasLeftContent ? "start" : "center"}>
          {/* Left side content - only render if there's content */}
          {hasLeftContent && (
            <Col xs={24} lg={12}>
              {/* Payment Instructions */}
              {isCrypto && cryptoDetails[selectedPaymentMethod] && (
                <Card title="Cryptocurrency Deposit" className="crypto-details-card">
                  <div style={{ textAlign: 'center' }}>
                    <Title level={4}>{cryptoDetails[selectedPaymentMethod].name}</Title>
                    <Text>Send exactly <strong>${amount}</strong> to the address below</Text>

                    <div className="qr-section" style={{ margin: '24px 0' }}>
                      <img
                        src={cryptoDetails[selectedPaymentMethod].qrCode}
                        alt="QR Code"
                        style={{ width: '200px', height: '200px', border: '1px solid #d9d9d9' }}
                      />
                    </div>

                    <div className="wallet-address">
                      <Text strong>Wallet Address:</Text>
                      <Input.Group compact style={{ marginTop: '8px' }}>
                        <Input
                          value={cryptoDetails[selectedPaymentMethod].walletAddress}
                          readOnly
                          style={{ fontFamily: 'monospace' }}
                        />
                        <Button
                          icon={<CopyOutlined />}
                          onClick={() => {
                            navigator.clipboard.writeText(cryptoDetails[selectedPaymentMethod].walletAddress);
                            message.success('Address copied to clipboard!');
                          }}
                        >
                          Copy
                        </Button>
                      </Input.Group>
                    </div>
                  </div>
                </Card>
              )}

              {isBank && bankWireDetails && (
                <Card title="Bank Transfer Details" className="bank-details-card">
                  <Alert
                    message="Use these bank details for your transfer"
                    description={`Transfer amount: $${amount}`}
                    type="info"
                    style={{ marginBottom: '16px' }}
                  />
                  <Table
                    dataSource={dataSource}
                    columns={columns}
                    pagination={false}
                    bordered
                    size="small"
                  />
                </Card>
              )}

              {isCard && paymentLinks && paymentLinks.length > 0 && (
                <Card title="Payment Options" className="payment-links-card">
                  <Text>Choose a payment gateway to complete your deposit of <strong>${amount}</strong></Text>
                  <div style={{ marginTop: '16px' }}>
                    {paymentLinks.map((link, index) => (
                      <Button
                        key={link.id}
                        type="primary"
                        block
                        style={{ marginBottom: '8px' }}
                        onClick={() => handleRedirect(link.url)}
                      >
                        {link.name || `Payment Option ${index + 1}`}
                      </Button>
                    ))}
                  </div>
                </Card>
              )}
            </Col>
          )}

          {/* Upload Section - responsive width based on left content */}
          <Col xs={24} lg={hasLeftContent ? 12 : 16}>
            {/* Upload Section */}

            {!isCard && (
              <Card
                title={
                  ['bank-transfer', 'other-payment'].includes(selectedPaymentMethod)
                    ? "Upload Transaction Proof (Required)"
                    : "Upload Transaction Proof (Optional)"
                }
                className="upload-card"
              >

                <Upload {...uploadProps} className="proof-upload">
                  <div className="upload-area">
                    <UploadOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
                    <Title level={4}>Upload Receipt</Title>
                    <Text type="secondary">
                      Upload a screenshot or receipt of your transaction
                    </Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      JPEG, PNG, PDF (Max 2MB)
                    </Text>
                    {['bank-transfer', 'other-payment'].includes(selectedPaymentMethod) && (
                      <>
                        <br />
                      </>
                    )}
                  </div>
                </Upload>


                <Divider />

                {/* Mobile responsive button section */}
                <div className="deposit-actions-mobile" style={{ textAlign: 'center' }}>
                  <Row gutter={[8, 8]} justify="center">
                    <Col xs={24} sm={12} md={8}>
                      <Button
                        size="large"
                        onClick={handlePrevStep}
                        block
                        style={{ minHeight: '44px' }}
                      >
                        Back
                      </Button>
                    </Col>
                    <Col xs={24} sm={12} md={16}>
                      <Button
                        type="primary"
                        size="large"
                        loading={loading}
                        onClick={handleFinalSubmit}
                        icon={<CheckCircleOutlined />}
                        disabled={['bank-transfer', 'other-payment'].includes(selectedPaymentMethod) && fileList.length === 0}
                        block
                        style={{ minHeight: '44px' }}
                      >
                        Complete Deposit
                      </Button>
                    </Col>
                  </Row>
                </div>
              </Card>
            )}
          </Col>
        </Row>
      </div>
    );
  };

  const renderMT5Deposit = () => (
    <div style={{ padding: '24px' }}>

      {/* <Button
      type="default"
      style={{ marginBottom: '16px' }}
      onClick={() => {
        setIsMt5(false);   // switch back to wallet flow
        // setCurrentStep(0); // reset to account selection
      }}
    >
      ← Back
    </Button> */}
      <DepositTransferCommon
        title="Deposit to MT5 Account"
        type={Type.WALLET_TO_MT}
        successMsg="Deposit to MT5 account successful"
        failureMsg="Failed to deposit to MT5 account"
        onBack={() => setIsMt5(false)}
      />
    </div>
  );

  const steps = [
    { title: 'Account', icon: <WalletOutlined /> },
    { title: 'Method', icon: <CreditCardOutlined /> },
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
            <div className="modern-deposit-container">
              <div className="deposit-header">
                <Title level={1} style={{ textAlign: 'center', marginBottom: '8px' }}>
                  Fund Your Account
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
                  Quick and secure deposits to grow your trading portfolio
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

              <div className="deposit-content">
                {isMt5 ? (
                  renderMT5Deposit()
                ) : (
                  <>
                    {currentStep === 0 && renderAccountSelection()}
                    {currentStep === 1 && renderPaymentMethods()}
                    {currentStep === 2 && renderAmountForm()}
                    {currentStep === 3 && renderPaymentDetails()}
                  </>
                )}
              </div>

              {currentStep > 0 && !isMt5 && (
                <div style={{ textAlign: 'center', marginTop: '32px' }}>
                  <Button onClick={resetDeposit} type="link">
                    Start New Deposit
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

export default Deposit;