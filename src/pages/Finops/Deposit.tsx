import { api } from '@/components/common/api';
import { Type } from '@/generated';
import { useModel } from '@@/exports';
import {
  ArrowRightOutlined,
  BankOutlined,
  CreditCardOutlined,
  DollarOutlined,
  UploadOutlined,
  WalletOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { history } from '@umijs/max';
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
} from 'antd';
import React, { useEffect, useState } from 'react';
import CustomLoader from '../CustomLoader';
import { DepositTransferCommon } from './common/DepositTransferCommon';
import StatusPage from './common/StatusPage';

const { Title, Text } = Typography;
const { Option } = Select;

interface PaymentMethod {
  key: string;
  label: string;
  icon: React.ReactNode;
  details: string;
  processingTime: string;
  cost: number;
}

interface PaymentSetting {
  id: number;
  name: string;
  url: string;
  description?: string;
  isActive: boolean;
}

const Deposit: React.FC = () => {
  const { token } = theme.useToken();
  const [isMt5, setIsMt5] = useState(false);
  const { initialState } = useModel('@@initialState');
  const [proofData, setProofData] = useState('');
  const [loading, setLoading] = useState(true);
  const [showDepositFlow, setShowDepositFlow] = useState(false);
  const [showWithdrawFlow, setShowWithdrawFlow] = useState(false);
  const [showWalletSteps, setShowWalletSteps] = useState(false); // New state to control step visibility

  // States for DepositCard functionality
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCurrency, setSelectedCurrency] = useState<string | undefined>(undefined);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | undefined>(undefined);
  const [balance, setBalance] = useState<number>(0);
  const [fileList, setFileList] = useState<any[]>([]);
  const [bankWireDetails, setBankWireDetails] = useState(null);
  const [showBankDetails, setShowBankDetails] = useState(false);
  const [showPaymentLinks, setShowPaymentLinks] = useState(false);
  const [paymentData, setPaymentData] = useState<PaymentSetting[]>([]);
  const [paymentLinks, setPaymentLinks] = useState<PaymentSetting[]>([]);
  const [amount, setAmount] = useState<any>(0);
  const [amountForm] = Form.useForm();
  const [selectedAccount, setSelectedAccount] = useState('Wallet Account');

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

  // Define payment methods array
  const paymentMethods: PaymentMethod[] = [
    {
      key: 'bank-transfer',
      label: 'Bank Transfer',
      icon: <BankOutlined className="payment-icon" />,
      details: 'Bank Wire Deposit (1-24 hours)',
      processingTime: '1-24 hours',
      cost: 0,
    },
    {
      key: 'tether-usdt',
      label: 'Card payment',
      icon: <WalletOutlined className="payment-icon" />,
      details: 'Card payment Instant deposit 24/7',
      processingTime: '24/7 Instant',
      cost: 0,
    },
    {
      key: 'other-payment',
      label: 'Cash Deposit 24/7',
      icon: <DollarOutlined className="payment-icon" />,
      details: 'Cash options available',
      processingTime: 'Varies',
      cost: 0,
    },
  ];

  async function init() {
    try {
      // Initialize data for main deposit

      // Initialize data for wallet deposit functionality
      setBalance(initialState?.currentUser?.wallet?.balance || 0);

      // Get payment settings
      const paymentSettingsResponse = await api.setting.getPaymentSettings();
      setPaymentData(paymentSettingsResponse);

      // Initialize payment links with default amount (1000)
      const paymentLinksResponse = await api.setting.getpaymentlinks(1000);
      setPaymentLinks(paymentLinksResponse);

      // Get bank wire details
      getBankWire();
    } catch (error) {
      console.error('Error initializing data:', error);
      message.error({
        content: 'Unable to load payment information at the moment. Please try again later.',
        icon: <span className="orange-error-icon"> ✘ </span>,
        className: 'orange-error-notification',
        duration: 3,
      });
    }
  }

  async function proofSettings() {
    try {
      const response = await api.proof.getProofSetting();
      response.forEach((field) => {
        field && field.status === 'Approved' ? setProofData('Approved') : setProofData('Requested');
      });
    } catch (error) {
      console.log(error);
    }
  }

  const getBankWire = async () => {
    try {
      const response = await api.transaction.getBankWire();
      setBankWireDetails(response);
    } catch (error) {
      message.error({
        content: 'Bank Details Are Not Fetched..',
        icon: <span className="orange-error-icon"> ✘ </span>,
        className: 'orange-error-notification',
        duration: 3,
      });
    }
  };

  // Handle Deposit option click
  function handleDepositClick() {
    setShowDepositFlow(true);
    setShowWithdrawFlow(false);
    setShowWalletSteps(false); // Hide wallet steps until account is selected
    setCurrentStep(1);
  }

  // Handle Withdraw option click
  // function handleWithdrawClick() {
  //   setShowDepositFlow(false);
  //   setShowWithdrawFlow(true);
  //   history.push('/Finops/withdraw');
  // }

  // Handle account selection in dropdown
  function handleAccountSelection(value) {
    setSelectedAccount(value);
    if (value === 'Wallet Account') {
      setIsMt5(false);
      setShowWalletSteps(true); // Show wallet steps when wallet account is selected
    } else if (value === 'MT5 Trading Account') {
      setIsMt5(true);
      setShowWalletSteps(false); // Hide wallet steps when MT5 is selected
      // Instead of redirecting, we'll render MT5 deposit form directly
    }
  }

  function handleWithdrawClick() {
    // This function is no longer needed but kept for reference
    // You can remove it completely
  }

  const renderMT5DepositForm = () => (
    <div className="mt5-deposit-container">
      <DepositTransferCommon
        title="DEPOSIT TO MT5 ACCOUNT"
        type={Type.WALLET_TO_MT}
        successMsg="Deposit to MT5 account successful"
        failureMsg="Failed to deposit to MT5 account"
      />
    </div>
  );

  // Reset to main deposit options
  function resetToMainDeposit() {
    setShowDepositFlow(false);
    setShowWithdrawFlow(false);
    setShowWalletSteps(false);
    setCurrentStep(1);
    setSelectedCurrency(undefined);
    setSelectedPaymentMethod(undefined);
    setShowBankDetails(false);
    setShowPaymentLinks(false);
    amountForm.resetFields();
    setFileList([]);
  }

  // DepositCard functionality
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      if (currentStep === 4 && (showBankDetails || showPaymentLinks)) {
        setShowBankDetails(false);
        setShowPaymentLinks(false);
      }
    } else {
      resetToMainDeposit();
    }
  };

  const handleContinue = () => {
    if (currentStep === 2 && !selectedPaymentMethod) {
      message.error({
        content: 'To proceed, please choose a payment method.',
        icon: <span className="orange-error-icon"> ✘ </span>,
        className: 'orange-error-notification',
        duration: 3,
      });
      return;
    }
    setCurrentStep(currentStep + 1);
  };

  const handleCurrencySelect = (value: string) => {
    setSelectedCurrency(value);
  };

  const handlePaymentMethodChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedPaymentMethod(e.target.value);
  };

  const fetchPaymentLinks = async () => {
    try {
      // Use the amount when fetching payment links
      const amountValue = amountForm.getFieldValue('amount');
      const response = await api.setting.getpaymentlinks(amountValue);
      setPaymentLinks(response);
      return response;
    } catch (error) {
      console.error('Error fetching payment links:', error);
      message.error({
        content: 'Unable to load payment options at the moment. Please try again later.',
        icon: <span className="orange-error-icon"> ✘ </span>,
        className: 'orange-error-notification',
        duration: 3,
      });
      return [];
    }
  };

  const handleAmountSubmit = async (values: any) => {
    const amountValue = values.amount;
    setAmount(amountValue);

    if (selectedPaymentMethod === 'bank-transfer') {
      setShowBankDetails(true);
      setShowPaymentLinks(false);

      message.success({
        content: 'Amount has been successfully submitted.',
        icon: <span className="green-success-icon"> ✓ </span>,
        className: 'green-success-notification',
        duration: 6,
      });
    } else if (selectedPaymentMethod === 'tether-usdt') {
      setLoading(true);

      try {
        // ✅ Step 1: Submit the deposit request
        const formData: any = {
          Type: Type.EXT_TO_WALLET,
          Amount: amountValue,
          Currency: 'USD',
          Comment: `Deposit ${amountValue}`,
          PaymentMethod: selectedPaymentMethod,
        };

        await api.transaction.deposit(formData);

        message.success({
          content:
            'Your deposit request has been successfully submitted and will appear in your transaction history.',
          icon: <span className="green-success-icon"> ✓ </span>,
          className: 'green-success-notification',
          duration: 3,
        });

        // ✅ Step 2: Load Payment Settings and Links
        const paymentSettings = await api.setting.getPaymentSettings();
        setPaymentData(paymentSettings);

        const links = await fetchPaymentLinks();

        if (links && links.length > 0) {
          setShowBankDetails(false);
          setShowPaymentLinks(true);

          message.success({
            content: 'Payment options have been successfully loaded.',
            icon: <span className="green-success-icon"> ✓ </span>,
            className: 'green-success-notification',
            duration: 3,
          });
        } else {
          setShowPaymentLinks(false);

          message.warning({
            content: 'No available payment options. Please try another method.',
            icon: <span className="yellow-warning-icon"> ⚠ </span>,
            className: 'yellow-warning-notification',
            duration: 3,
          });
        }

        // ✅ Reset form fields (stay on same step)
        amountForm.resetFields();
        setAmount('');
      } catch (error) {
        console.error('Error:', error);

        message.error({
          content:
            'We encountered an issue submitting your deposit request. Please try again later.',
          icon: <span className="orange-error-icon"> ✘ </span>,
          className: 'orange-error-notification',
          duration: 3,
        });
      } finally {
        setLoading(false);
      }
    } else {
      setShowBankDetails(false);
      setShowPaymentLinks(false);

      message.success({
        content: 'Amount has been successfully submitted.',
        icon: <span className="green-success-icon"> ✓ </span>,
        className: 'green-success-notification',
        duration: 3,
      });

      setCurrentStep(4);
    }
  };

  const handleFinalSubmit = async () => {
    try {
      setLoading(true);

      const amountValue = amountForm.getFieldValue('amount');

      // Build formData object
      const formData: any = {
        Type: Type.EXT_TO_WALLET,
        Amount: amountValue,
        Currency: 'USD',
        Comment: `Deposit ${amountValue}`,
        PaymentMethod: selectedPaymentMethod,
      };

      // Only add FormFile if image is uploaded
      if (fileList.length > 0) {
        formData.FormFile = fileList[0].originFileObj;
      }

      // Call API with or without image
      await api.transaction.deposit(formData);

      message.success({
        content: 'Your deposit request has been successfully submitted.',
        icon: <span className="green-success-icon"> ✓ </span>,
        className: 'green-success-notification',
        duration: 3,
      });
      resetToMainDeposit();
      history.push('/finops/transaction_history');
    } catch (error) {
      console.error(error);
      message.error({
        content: 'We encountered an issue submitting your deposit request. Please try again later.',
        icon: <span className="orange-error-icon"> ✘ </span>,
        className: 'orange-error-notification',
        duration: 3,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleredirect = (url: string) => {
    window.open(url, '_blank', 'noreferrer');
    history.push('/finops/transaction_history');
  };

  const uploadProps = {
    beforeUpload: (file: any) => {
      const acceptedFormats = ['image/jpeg', 'image/png', 'application/pdf'];
      if (!acceptedFormats.includes(file.type)) {
        message.error({
          content: 'Only JPEG, PNG, and PDF files are allowed.',
          icon: <span className="orange-error-icon"> ✘ </span>,
          className: 'orange-error-notification',
          duration: 3,
        });
        return Upload.LIST_IGNORE;
      }

      if (file.size > 2 * 1024 * 1024) {
        message.error({
          content: 'File size should not exceed 2MB.',
          icon: <span className="orange-error-icon"> ✘ </span>,
          className: 'orange-error-notification',
          duration: 3,
        });
        return Upload.LIST_IGNORE;
      }

      setFileList([file]);
      return false; // Prevent auto upload
    },
    fileList,
    onRemove: () => {
      setFileList([]);
    },
  };

  // Generate table data for bank wire details
  const dataSource = bankWireDetails
    ? [
        {
          key: '1',
          name: 'Account Holder',
          address: bankWireDetails.accountHolder,
        },
        {
          key: '2',
          name: 'Account Number',
          address: bankWireDetails.accountNumber,
        },
        {
          key: '3',
          name: 'IBAN',
          address: bankWireDetails.iban,
        },
        {
          key: '4',
          name: 'SWIFT/BIC',
          address: bankWireDetails.swifT_BIC,
        },
        {
          key: '5',
          name: 'BANK NAME',
          address: bankWireDetails.bank,
        },
        {
          key: '6',
          name: 'BRANCH',
          address: bankWireDetails.branch,
        },
        ...(bankWireDetails.ifsc
          ? [
              {
                key: '7',
                name: 'IFSC',
                address: bankWireDetails.ifsc,
              },
            ]
          : []),
        ...(bankWireDetails.mmid
          ? [
              {
                key: '8',
                name: 'MMID',
                address: bankWireDetails.mmid,
              },
            ]
          : []),
      ]
        // Filter out rows where `address` is null, undefined, or empty
        .filter((row) => row.address != null && row.address !== '')
    : [];

  const columns = [
    {
      title: 'Detail',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Value',
      dataIndex: 'address',
      key: 'address',
    },
  ];

  // Render account selection dropdown
  const renderAccountDropdown = () => (
    <Card className="step-card">
      <div className="account-headerr">
        <div className="account-title">
          <h2>Deposit to</h2>
        </div>
      </div>
      <div className="step-content">
        <Select
          defaultValue="Wallet Account"
          style={{ width: '100%', marginBottom: '20px' }}
          onChange={handleAccountSelection}
          value={selectedAccount}
        >
          <Option value="Wallet Account">Wallet Account</Option>
          <Option value="MT5 Trading Account">MT5 Trading Account</Option>
        </Select>
      </div>
    </Card>
  );

  // Render step 1 - Select Currency
  const renderStep1 = () => (
    <Card className="step-card">
      <div className="account-headerr">
        <div className="account-title">
          <h2>Select Currency</h2>
          <div className="account-subtitle">
            <span className="verification-tag">Step 1</span>
          </div>
        </div>
      </div>
      {/* <div className="step-header">
        <div className="step-badge"></div>
        <div className="step-title"></div>
      </div> */}

      <div className="step-content">
        <Text strong>Choose Currency</Text>
        <Select
          className="currency-select"
          placeholder="Select option"
          style={{ width: '100%', marginTop: '8px', marginBottom: '20px' }}
          onChange={handleCurrencySelect}
          value={selectedCurrency}
        >
          <Option value="usd">USD (Available Balance: ${balance.toFixed(2)})</Option>
        </Select>

        <div className="action-buttons">
          {/* <Button onClick={resetToMainDeposit} className="back-button">
            Back
          </Button> */}
          <Button
            type="primary"
            onClick={handleContinue}
            disabled={!selectedCurrency}
            className="continue-button"
            style={{ backgroundColor: '#9BF8F4', borderColor: '9BF8F4' ,color: '#000'}}
          >
            Continue
          </Button>
        </div>
      </div>
    </Card>
  );

  // Render step 2 - Choose Payment Method
  const renderStep2 = () => (
    <Card className="step-card">
      <div className="account-headerr">
        <div className="account-title">
          <h2>Choose Payment Method</h2>
          <div className="account-subtitle">
            <span className="verification-tag">Step 2</span>
          </div>
        </div>
      </div>
      <div className="step-header">
        <div className="step-badge"></div>
        <div className="step-title"></div>
      </div>

      <div className="step-content">
        <div className="payment-table-container">
          <table className="payment-table">
            <thead>
              <tr>
                <th>Payment Option</th>
                <th>Details</th>
                <th>Processing Time</th>
                <th>Cost</th>
                <th>Operation</th>
              </tr>
            </thead>
            <tbody>
              {paymentMethods.map((method, index) => (
                <tr
                  key={method.key}
                  className={selectedPaymentMethod === method.key ? 'selected-row' : ''}
                  style={{ backgroundColor: index % 2 === 1 ? '#f9f9f9' : '#ffffff' }}
                >
                  <td>
                    <div className="payment-option">
                      <div className="payment-icon-bg">{method.icon}</div>
                      <span className="payment-label">{method.label}</span>
                    </div>
                  </td>
                  <td>{method.details}</td>
                  <td>{method.processingTime}</td>
                  <td>{method.cost}</td>
                  <td>
                    <button
                      className={`select-button ${
                        selectedPaymentMethod === method.key ? 'selected' : ''
                      }`}
                      onClick={() => {
                        handlePaymentMethodChange({ target: { value: method.key } });
                        setCurrentStep(3); // Go to Step 3 immediately
                      }}
                    >
                      Select
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="action-buttons">
          {/* <Button onClick={handleBack} className="back-button">
            Back
          </Button> */}
          {/* <Button
            type="primary"
            onClick={handleContinue}
            className="continue-button"
            style={{ backgroundColor: '#FAAD14', borderColor: '#FAAD14' }}
          >
            Continue
          </Button> */}
        </div>
      </div>
    </Card>
  );

  // Render step 3 - Choose Amount
  const renderStep3 = () => (
    <Card className="step-card">
      <div className="account-headerr">
        <div className="account-title">
          <h2>Choose Amount</h2>
          <div className="account-subtitle">
            <span className="verification-tag">Step 3</span>
          </div>
        </div>
      </div>

      <div className="step-content">
        {/* Selected Payment Method Display */}
        <div className="selected-payment-method">
          <div className="payment-method-info">
            <div className="payment-method-icon">
              {/* Find the correct icon based on the selected payment method key */}
              {selectedPaymentMethod === 'bank-transfer' && (
                <BankOutlined className="payment-method-icon-inner" />
              )}
              {selectedPaymentMethod === 'tether-usdt' && (
                <CreditCardOutlined className="payment-method-icon-inner" />
              )}
              {selectedPaymentMethod === 'other-payment' && (
                <DollarOutlined className="payment-method-icon-inner" />
              )}
            </div>
            <div className="payment-method-details">
              <h4>
                {paymentMethods.find((method) => method.key === selectedPaymentMethod)?.label}
              </h4>
              <p>
                {paymentMethods.find((method) => method.key === selectedPaymentMethod)?.details}
              </p>
            </div>
          </div>
          <Button className="change-button" onClick={() => setCurrentStep(2)} type="link">
            Change
          </Button>
        </div>

        <Text>Please fill in the form below to get your deposit reference code.</Text>

        <Form
          form={amountForm}
          layout="vertical"
          onFinish={handleAmountSubmit}
          className="amount-form"
        >
          <Form.Item
            name="amount"
            label="Amount"
            rules={[
              { required: true, message: 'Please enter an amount' },
              {
                pattern: /^(?!0\d+)(\d+)(\.\d{1,2})?$/,
                message: 'Please enter a valid amount',
              },
            ]}
            style={{ marginTop: '16px' }}
          >
            <Input placeholder="Enter amount" prefix="$" />
          </Form.Item>

          <div className="info-box">
            <div className="info-item">
              <p className="info-label">Minimum Amount</p>
              <p className="info-value">$50.00</p>
            </div>
            <div className="info-item">
              <p className="info-label">Processing Time</p>
              <p className="info-value">24/7 Instant</p>
            </div>
          </div>

          <div className="action-buttons">
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="submit-button"
              style={{ backgroundColor: '#9BF8F4', borderColor: '#9BF8F4' , color: '#000'}}
            >
              Deposit Funds
            </Button>
          </div>
        </Form>

        {showBankDetails && bankWireDetails && (
          <div className="bank-details-container">
            <Title level={4} style={{ marginTop: '24px', marginBottom: '16px' }}>
              Bank Wire Details
            </Title>
            <Text type="secondary" style={{ marginBottom: '16px', display: 'block' }}>
              Please use the following bank details to make your transfer:
            </Text>
            <Table
              dataSource={dataSource}
              columns={columns}
              pagination={false}
              bordered
              className="bank-details-table"
            />

            <div className="action-buttons" style={{ marginTop: '24px' }}>
              <Button
                type="primary"
                onClick={() => setCurrentStep(4)}
                className="continue-button"
                style={{ backgroundColor: '#9BF8F4', borderColor: '#9BF8F4' }}
              >
                Continue to Next Step
              </Button>
            </div>
          </div>
        )}

        {showPaymentLinks && paymentLinks && paymentLinks.length > 0 && (
          <div className="payment-links-container">
            <Title level={4} style={{ marginTop: '24px', marginBottom: '16px' }}>
              Backup Payment Options
            </Title>
            <Text type="secondary" style={{ marginBottom: '16px', display: 'block' }}>
              Please select one of the following payment options for amount: ${amount}
            </Text>

            <div className="payment-links-grid">
              {paymentLinks.map((link) => (
                <Card key={link.id} className="payment-link-card" hoverable>
                  <div className="payment-link-content">
                    <Text strong>{link.name}</Text>
                    {link.description && (
                      <Text type="secondary" style={{ marginTop: '8px', display: 'block' }}>
                        {link.description}
                      </Text>
                    )}
                    <Button
                      type="primary"
                      onClick={() => handleRedirect(link.url)}
                      style={{
                        marginTop: '16px',
                        backgroundColor: '#9BF8F4',
                        borderColor: '#9BF8F4',
                      }}
                    >
                      Pay Now
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            <div className="action-buttons" style={{ marginTop: '24px' }}>
              <Button
                type="primary"
                onClick={() => setCurrentStep(4)}
                className="continue-button"
                style={{ backgroundColor: '#FAAD14', borderColor: '#FAAD14' }}
              >
                Continue to Next Step
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );

  // Render step 4 - Send Transaction Details
  const renderStep4 = () => (
    <Card className="step-card">
      <div className="account-headerr">
        <div className="account-title-container">
          <div className="account-title">
            <h2>Send Transaction Details</h2>
            <div className="account-subtitle">
              <span className="verification-tag">Step 4</span>
            </div>
          </div>
          <Button className="change-button chang" onClick={() => setCurrentStep(3)} type="link">
            Change
          </Button>
        </div>
      </div>

      <div className="step-content">
        <Text>Send a screenshot of your transaction (optional)</Text>

        <div className="upload-container">
          <Upload {...uploadProps} className="upload-area">
            <div className="upload-content">
              <UploadOutlined className="upload-icon" />
              <div>Upload Image</div>
              <div className="upload-note">
                Only JPEG, PNG, and PDF files are allowed (Max 2 MB)
              </div>
            </div>
          </Upload>
        </div>

        <div className="action-buttons">
          {/* <Button onClick={handleBack} className="back-button">
            Back
          </Button> */}
          <Button
            type="primary"
            onClick={handleFinalSubmit}
            loading={loading}
            className="confirm-button"
            style={{ backgroundColor: '#9BF8F4', borderColor: '#9BF8F4' }}
          >
            Confirm and Proceed
          </Button>
        </div>
      </div>
    </Card>
  );

  const renderMainContent = () => {
    // Always show deposit flow
    return (
      <div className="wallet-deposit-steps">
        <Card className="deposit-card">
          <div className="account-headerr">
            <div className="account-title">
              <h2>FUNDS MANAGEMENT</h2>
              <div className="account-subtitle">
                <span className="verification-tag">Select Operation Type</span>
              </div>
            </div>
          </div>

          <div className="deposit-content">
            <div className="deposit-options">
              <Card hoverable className="deposit-option-card" onClick={handleDepositClick}>
                <div className="option-container">
                  <div className="icon-circle">
                    <ArrowRightOutlined className="deposit-icon" />
                  </div>
                  <div className="card-text">
                    <Text strong className="card-text-strong">
                      Deposit
                    </Text>
                  </div>
                </div>
              </Card>

              {/* Withdraw option removed as requested */}
            </div>
          </div>
        </Card>

        {/* Account selection dropdown is always shown */}
        <div className="account-dropdown-container" style={{ marginTop: '16px' }}>
          {renderAccountDropdown()}
        </div>

        {/* Deposit steps appear directly below the deposit options */}
        {!isMt5 && (
          <div className="wallet-steps-container" style={{ marginTop: '16px' }}>
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {proofData !== '' && proofData === 'Approved' ? (
        <ConfigProvider>
          {loading ? (
            <CustomLoader />
          ) : (
            <PageContainer>
              {renderMainContent()}

              {/* Conditional Render for MT5 */}
              {isMt5 && (
                <DepositTransferCommon
                  title={'Deposit to MT5'}
                  type={Type.WALLET_TO_MT}
                  successMsg={{
                    content: 'Requested deposit to MT5 successfully!',
                    icon: <span className="orange-success-icon"> ✔ </span>,
                    className: 'orange-success-notification',
                    duration: 3,
                  }}
                  failureMsg={{
                    content: 'Failed to request deposit amount to MT5!',
                    icon: <span className="orange-error-icon"> ✘ </span>,
                    className: 'orange-error-notification',
                    duration: 3,
                  }}
                />
              )}
            </PageContainer>
          )}
        </ConfigProvider>
      ) : (
        <StatusPage />
      )}
    </>
  );
};

export default Deposit;
