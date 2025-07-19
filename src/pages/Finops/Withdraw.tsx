// code 1

import { api } from '@/components/common/api';
import { Type } from '@/generated';
import { Transfer } from '@/pages/Finops/common/Transfer';
import { useModel } from '@@/exports';
import { ArrowLeftOutlined, SwapOutlined , PayCircleOutlined  } from '@ant-design/icons';
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
} from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import CustomLoader from '../CustomLoader';
import './../../common.css';
import StatusPage from './common/StatusPage';

const { Title, Text } = Typography;
const { Option } = Select;

// Define payment method interface
interface PaymentMethod {
  key: string;
  label: string;
  icon: React.ReactNode;
  details: string;
  processingTime: string;
  cost: number;
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
  const [showWithdrawFlow, setShowWithdrawFlow] = useState(false);
  const [showWalletSteps, setShowWalletSteps] = useState(false);

  // States for Withdraw functionality
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCurrency, setSelectedCurrency] = useState<string | undefined>(undefined);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | undefined>(undefined);
  const [balance, setBalance] = useState<number>(0);
  const [selectedAccount, setSelectedAccount] = useState(getInitialAccount());
  const [isMt5, setIsMt5] = useState(getInitialIsMt5());
  const [isCheckingProof, setIsCheckingProof] = useState(true);

  // Forms
  const [form] = Form.useForm();
  const location = useLocation();

  // Step refs for scrolling
  const step1Ref = useRef<HTMLDivElement>(null);
  const step2Ref = useRef<HTMLDivElement>(null);
  const step3Ref = useRef<HTMLDivElement>(null);
  const step3UsdtRef = useRef<HTMLDivElement>(null);

  // Get user information
  const { initialState } = useModel('@@initialState');
  const wallet = initialState?.currentUser?.wallet;

  // Define payment methods array
  const paymentMethods: PaymentMethod[] = [
    {
      key: 'bank-wire',
      label: 'Bank Wire',
      icon: <SwapOutlined  className="payment-icon" />,
      details: 'Bank Wire Withdrawal (1-24 hours)',
      processingTime: '1-24 hours',
      cost: 0,
    },
    {
      key: 'usdt',
      label: 'USDT',
      icon: <PayCircleOutlined  className="payment-icon" />,
      details: 'USDT Instant Withdrawal (24/7)',
      processingTime: 'Instant',
      cost: 0,
    },
    // You can easily add more payment methods here if needed
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

  // Scroll to active step when step changes
  useEffect(() => {
    const scrollToCurrentStep = () => {
      if (currentStep === 1 && step1Ref.current) {
        step1Ref.current.scrollIntoView({ behavior: 'smooth' });
      } else if (currentStep === 2 && step2Ref.current) {
        step2Ref.current.scrollIntoView({ behavior: 'smooth' });
      } else if (currentStep === 3) {
        if (selectedPaymentMethod === 'usdt' && step3UsdtRef.current) {
          step3UsdtRef.current.scrollIntoView({ behavior: 'smooth' });
        } else if (step3Ref.current) {
          step3Ref.current.scrollIntoView({ behavior: 'smooth' });
        }
      }
    };

    // Small delay to ensure DOM is updated
    setTimeout(scrollToCurrentStep, 100);
  }, [currentStep, selectedPaymentMethod]);

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
        setIsCheckingProof(true); // Start checking

        const response = await api.proof.getProofSetting();
        const allApproved = response.every((field) => field && field.status === 'Approved');

        if (allApproved && response.length > 0) {
          setProofData('Approved');
          await init();
        } else {
          setProofData('Requested');
        }

        setIsCheckingProof(false); // Done checking
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

  // Fetch bank details for the form
  const fetchBankDetails = async () => {
    try {
      const bankDetails = await api.transaction.getBankAccount();
      console.log('Bank details fetched:', bankDetails);

      if (bankDetails) {
        form.setFieldsValue({
          beneficiary: bankDetails.beneficiary,
          amount: bankDetails.withdrawal,
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

  // Handle Withdraw option click
  function handleWithdrawClick() {
    setShowWithdrawFlow(true);
    setShowWalletSteps(false);
    setCurrentStep(1);
  }

  // Handle account selection in dropdown
  function handleAccountSelection(value) {
    setSelectedAccount(value);
    if (value === 'Wallet Account') {
      setIsMt5(false);
      setShowWalletSteps(true);
    } else if (value === 'MT5 Trading Account') {
      setIsMt5(true);
      setShowWalletSteps(false);
    }
  }

  // Reset to main withdraw options
  function resetToMainWithdraw() {
    setShowWithdrawFlow(false);
    setShowWalletSteps(false);
    setCurrentStep(1);
    setSelectedCurrency(undefined);
    setSelectedPaymentMethod(undefined);
    form.resetFields();
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      resetToMainWithdraw();
    }
  };

  const handleContinue = () => {
    if (currentStep === 2 && !selectedPaymentMethod) {
      message.error({
        content: 'Please select a payment method',
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

  // Submit bank transfer withdrawal
  const handleBankWithdrawal = async (values: any) => {
    try {
      setLoading(true);

      const { amount } = values;

      if (wallet?.balance === 0) {
        message.error({
          content: 'Insufficient Balance',
          icon: <span className="orange-error-icon"> ✘ </span>,
          className: 'orange-error-notification',
          duration: 3,
        });
        return;
      }

      if (amount > wallet?.balance) {
        message.error({
          content: 'Amount cannot exceed the wallet balance',
          icon: <span className="orange-error-icon"> ✘ </span>,
          className: 'orange-error-notification',
          duration: 3,
        });
        return;
      }

      const formData = {
        type: Type.WALLET_TO_EXT,
        amount: values.amount,
        currency: 'USD',
        comment: values.comment,
        bank: { ...values },
        PaymentMethod: selectedPaymentMethod,
      };

      const response = await api.transaction.withdraw(formData);

      if (
        response.message &&
        response.message.includes('User does not have enough wallet balance!')
      ) {
        message.error({
          content: response.message,
          icon: <span className="orange-error-icon"> ✘ </span>,
          className: 'orange-error-notification',
          duration: 3,
        });
      } else {
        message.success({
          content: 'Withdrawal requested successfully',
          icon: <span className="orange-success-icon"> ✔ </span>,
          className: 'orange-success-notification',
          duration: 3,
        });
        history.push('/finops/transaction_history');
      }
    } catch (error) {
      console.error('Error processing withdrawal:', error);
      message.error({
        content: 'Failed to process withdrawal request',
        icon: <span className="orange-error-icon"> ✘ </span>,
        className: 'orange-error-notification',
        duration: 3,
      });
    } finally {
      setLoading(false);
    }
  };

  // Submit crypto withdrawal
  const handleCryptoWithdrawal = async (values: any) => {
    try {
      setLoading(true);

      const { amount } = values;

      if (wallet?.balance === 0) {
        message.error({
          content: 'Insufficient Balance',
          icon: <span className="orange-error-icon"> ✘ </span>,
          className: 'orange-error-notification',
          duration: 3,
        });
        return;
      }

      if (amount > wallet?.balance) {
        message.error({
          content: 'Amount cannot exceed the wallet balance',
          icon: <span className="orange-error-icon"> ✘ </span>,
          className: 'orange-error-notification',
          duration: 3,
        });
        return;
      }

      const formData = {
        type: Type.WALLET_TO_EXT,
        amount: values.amount,
        currency: 'USD',
        comment: values.comment,
        cryptoWallet: { ...values },
        PaymentMethod: selectedPaymentMethod,
      };

      const response = await api.transaction.Cryptowithdraw(formData);

      if (
        response.message &&
        response.message.includes('User does not have enough wallet balance!')
      ) {
        message.error({
          content: response.message,
          icon: <span className="orange-error-icon"> ✘ </span>,
          className: 'orange-error-notification',
          duration: 3,
        });
      } else {
        message.success({
          content: 'Withdrawal requested successfully',
          icon: <span className="orange-success-icon"> ✔ </span>,
          className: 'orange-success-notification',
          duration: 3,
        });
        history.push('/finops/transaction_history');
      }
    } catch (error) {
      console.error('Error processing crypto withdrawal:', error);
      message.error({
        content: 'Failed to process withdrawal request',
        icon: <span className="orange-error-icon"> ✘ </span>,
        className: 'orange-error-notification',
        duration: 3,
      });
    } finally {
      setLoading(false);
    }
  };

  // Render account selection dropdown
  const renderAccountDropdown = () => (
    <Card className="step-card">
      <div className="account-headerr">
        <div className="account-title">
          <h2>Withdraw from</h2>
        </div>
      </div>
      <div className="step-content">
        <Select
          defaultValue={selectedAccount}
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
      <div ref={step1Ref} className="account-headerr">
        <div className="account-title">
          <h2>Select Currency</h2>
          <div className="account-subtitle">
            <span className="verification-tag">Step 1</span>
          </div>
        </div>
      </div>

      <div className="step-content">
        <Text strong>Choose Wallet</Text>
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
          <Button onClick={resetToMainWithdraw} className="back-button">
            Back
          </Button>
          <Button
            type="primary"
            onClick={handleContinue}
            disabled={!selectedCurrency}
            className="continue-button"
            style={{ backgroundColor: '#9BF8F4', borderColor: '#9BF8F4', color: '#000' }}
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
      <div ref={step2Ref} className="account-headerr">
        <div className="account-title">
          <h2>Choose Payment Method</h2>
          <div className="account-subtitle">
            <span className="verification-tag">Step 2</span>
          </div>
        </div>
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
      </div>
    </Card>
  );

  // Render step 3 - Bank Wire
  const renderStep3BankWire = () => (
    <Card className="step-card">
      <div ref={step3Ref} className="account-headerr">
        <div className="account-title-container">
          <div className="account-title">
            <h2>Bank Wire Withdrawal</h2>
            <div className="account-subtitle">
              <span className="verification-tag">Step 3</span>
            </div>
          </div>
          <Button className="change-button chang" onClick={() => setCurrentStep(2)} type="link">
            Change
          </Button>
        </div>
      </div>

      <div className="step-content">
        <Text>Minimum withdrawal amount for bank wire should be 50 USD</Text>
        <Text>Available for withdrawal: {balance.toFixed(2)} USD</Text>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleBankWithdrawal}
          className="withdraw-form"
        >
          <Form.Item
            name="beneficiary"
            label="Beneficiary Name"
            rules={[{ required: true, message: 'Please enter beneficiary name' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="amount"
            label="Withdrawal Amount*"
            rules={[
              { required: true, message: 'Please enter an amount' },
              { type: 'number', message: 'Please enter a valid number' },
              {
                validator: (_, value) =>
                  value >= 50
                    ? Promise.resolve()
                    : Promise.reject('Amount must be at least 50 USD'),
              },
            ]}
          >
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="name"
            label="Bank Name"
            rules={[{ required: true, message: 'Please enter bank name' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="address"
            label="Bank Address"
            rules={[{ required: true, message: 'Please enter bank address' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="account"
            label="Bank Account Number"
            rules={[{ required: true, message: 'Please enter account number' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="ifscIban"
            label="IFSC/IBAN"
            rules={[{ required: true, message: 'Please enter IFSC/IBAN' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="comment"
            label="Additional Comment"
            rules={[{ required: true, message: 'Please enter a comment' }]}
          >
            <Input.TextArea />
          </Form.Item>

          <Form.Item>
            <Checkbox>
              I have read all instructions and agree with terms and conditions of payments
              operations
            </Checkbox>
          </Form.Item>

          <Form.Item>
            <Checkbox>Save Bank Details</Checkbox>
          </Form.Item>

          <div className="action-buttons">
            {/* <Button onClick={handleBack} className="back-button">
              Back
            </Button> */}
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="submit-button"
              style={{ backgroundColor: '#9BF8F4', borderColor: '#9BF8F4', color: '#000' }}
            >
              Submit
            </Button>
          </div>
        </Form>
      </div>
    </Card>
  );

  // Render step 3 - USDT
  const renderStep3USDT = () => (
    <Card className="step-card">
      <div ref={step3UsdtRef} className="account-headerr">
        <div className="account-title-container">
          <div className="account-title">
            <h2>USDT Withdrawal</h2>
            <div className="account-subtitle">
              <span className="verification-tag">Step 3</span>
            </div>
          </div>
          <Button className="change-button chang" onClick={() => setCurrentStep(2)} type="link">
            Change
          </Button>
        </div>
      </div>

      <div className="step-content">
        <Text>Available for withdrawal: {balance.toFixed(2)} USD</Text>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleCryptoWithdrawal}
          className="withdraw-form"
        >
          <Form.Item
            name="amount"
            label="Withdrawal Amount*"
            rules={[
              { required: true, message: 'Please enter an amount' },
              { type: 'number', message: 'Please enter a valid number' },
              {
                validator: (_, value) =>
                  value >= 50
                    ? Promise.resolve()
                    : Promise.reject('Amount must be at least 50 USD'),
              },
            ]}
          >
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="cyrptoWalletAddress"
            label="USDT Wallet Address"
            rules={[{ required: true, message: 'Please enter USDT wallet address' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="comment"
            label="Additional Comment"
            rules={[{ required: true, message: 'Please enter a comment' }]}
          >
            <Input />
          </Form.Item>

          <div className="action-buttons">
            {/* <Button onClick={handleBack} className="back-button">
              Back
            </Button> */}
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="submit-button"
              style={{ backgroundColor: '#9BF8F4', borderColor: '#9BF8F4' }}
            >
              Submit
            </Button>
          </div>
        </Form>
      </div>
    </Card>
  );

  const renderMainContent = () => {
    return (
      <div className="wallet-withdraw-steps">
        <Card className="withdraw-card">
          <div className="account-headerr">
            <div className="account-title">
              <h2>FUNDS MANAGEMENT</h2>
              <div className="account-subtitle">
                <span className="verification-tag">Select Operation Type</span>
              </div>
            </div>
          </div>

          <div className="withdraw-content">
            <div className="withdraw-options">
              <Card hoverable className="withdraw-option-card" onClick={handleWithdrawClick}>
                <div className="option-container">
                  <div className="icon-circle">
                    <ArrowLeftOutlined className="withdraw-icon" />
                  </div>
                  <div className="card-text">
                    <Text strong className="card-text-strong">
                      Withdraw
                    </Text>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </Card>

        {/* Account selection dropdown */}
        <div className="account-dropdown-container" style={{ marginTop: '16px' }}>
          {renderAccountDropdown()}
        </div>

        {/* Withdraw steps for wallet account */}
        {!isMt5 && (
          <div className="wallet-steps-container" style={{ marginTop: '16px' }}>
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && (
              <>
                {selectedPaymentMethod === 'bank-wire' && renderStep3BankWire()}
                {selectedPaymentMethod === 'usdt' && renderStep3USDT()}
              </>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {isCheckingProof || loading ? (
        <CustomLoader />
      ) : proofData === 'Approved' ? (
        <ConfigProvider>
          {loading ? (
            <CustomLoader />
          ) : (
            <PageContainer>
              {renderMainContent()}

              {/* Conditional Render for MT5 */}
              {isMt5 && (
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

export default Withdraw;
