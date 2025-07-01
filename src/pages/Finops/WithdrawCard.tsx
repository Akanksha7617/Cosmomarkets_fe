import { api } from '@/components/common/api';
import { Type } from '@/generated';
import { ActionType, PageContainer } from '@ant-design/pro-components';
import { history, useModel } from '@umijs/max';
import {
  ArrowLeftOutlined,
  BankOutlined,
  DollarOutlined,
  WalletOutlined
} from '@ant-design/icons';
import {
  Button,
  Card,
  Checkbox,
  Form,
  Input,
  InputNumber,
  message,
  Radio,
  Select,
  Typography,
} from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import './../../common.css';

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

const WithdrawCard: React.FC = () => {
  // State management
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCurrency, setSelectedCurrency] = useState<string | undefined>(undefined);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | undefined>(undefined);
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  
  // Step refs for scrolling
  const step1Ref = useRef<HTMLDivElement>(null);
  const step2Ref = useRef<HTMLDivElement>(null);
  const step3Ref = useRef<HTMLDivElement>(null);
  const step3UsdtRef = useRef<HTMLDivElement>(null);
  
  // Forms
  const [form] = Form.useForm();
  
  // Get user information and wallet balance
  const { initialState } = useModel('@@initialState');
  const wallet = initialState?.currentUser?.wallet;

  // Define payment methods array
  const paymentMethods: PaymentMethod[] = [
    {
      key: 'bank-wire',
      label: 'Bank Wire',
      icon: <BankOutlined className="payment-icon" />,
      details: 'Bank Wire Deposit (1-24 hours)',
      processingTime: '1-24 hours',
      cost: 0
    },
    {
      key: 'usdt',
      label: 'USDT',
      icon: <WalletOutlined className="payment-icon" />,
      details: 'USDT Instant Deposit (24/7)',
      processingTime: 'Instant',
      cost: 0
    }
    // You can easily add more payment methods here if needed
  ];

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

  // Initialize balance and fetch bank details when component mounts
  useEffect(() => {
    init();
    if (currentStep === 3 && selectedPaymentMethod === 'bank-wire') {
      fetchBankDetails();
    }
  }, [currentStep, selectedPaymentMethod]);

  async function init() {
    setBalance(initialState?.currentUser?.wallet?.balance || 0);
  }

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

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      history.push('/finops/withdraw');
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
        PaymentMethod: selectedPaymentMethod
      };
      
      const response = await api.transaction.withdraw(formData);
      
      if (response.message && response.message.includes('User does not have enough wallet balance!')) {
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
        PaymentMethod: selectedPaymentMethod
      };
      
      const response = await api.transaction.Cryptowithdraw(formData);
      
      if (response.message && response.message.includes('User does not have enough wallet balance!')) {
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
  

  const renderStep1 = () => (
    <Card className="step-card">
      <div className="step-header">
        <div className="step-badge">Step 1</div>
        <div className="step-title">Select Your Wallet</div>
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
        
        <Button 
          type="primary" 
          onClick={handleContinue}
          disabled={!selectedCurrency}
          className="continue-button"
          style={{ backgroundColor: '#FAAD14', borderColor: '#FAAD14' }}
        >
          Continue
        </Button>
      </div>
    </Card>
  );

  const renderStep2 = () => (
    <Card className="step-card">
      <div className="step-header">
        <div className="step-badge">Step 2</div>
        <div className="step-title">Choose Payment Method</div>
      </div>
      
      <div className="step-content">
        <div className="payment-table-container">
          <table className="payment-table">
            <thead>
              <tr>
                <th>Operation</th>
                <th>Payment Option</th>
                <th>Details</th>
                <th>Processing Time</th>
                <th>Cost</th>
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
                    <Radio 
                      checked={selectedPaymentMethod === method.key}
                      onChange={handlePaymentMethodChange}
                      value={method.key}
                    />
                  </td>
                  <td>
                    <div className="payment-option">
                      <div className="payment-icon-bg">
                        {method.icon}
                      </div>
                      <span className="payment-label">{method.label}</span>
                    </div>
                  </td>
                  <td>{method.details}</td>
                  <td>{method.processingTime}</td>
                  <td>{method.cost}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="action-buttons">
          <Button 
            onClick={handleBack} 
            className="back-button"
          >
            Back
          </Button>
          <Button 
            type="primary" 
            onClick={handleContinue}
            className="continue-button"
            style={{ backgroundColor: '#FAAD14', borderColor: '#FAAD14' }}
          >
            Continue
          </Button>
        </div>
      </div>
    </Card>
  );

  const renderStep3BankWire = () => (
    <Card className="step-card">
      <div className="step-header">
        <div className="step-badge">Step 3</div>
        <div className="step-title">Choose Amount</div>
      </div>
      
      <div className="step-content">
        <Text>Minimum withdrawal amount for bank wire should be 50 USD</Text>
        
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
                    : Promise.reject('Amount must be at least 50 USD')
              }
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
            <Input type="number" />
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
            <Checkbox>I have read all instructions and agree with terms and conditions of payments operations</Checkbox>
          </Form.Item>
          
          <Form.Item>
            <Checkbox>Save Bank Details</Checkbox>
          </Form.Item>
          
          <div className="action-buttons">
            <Button onClick={handleBack} className="back-button">
              Back
            </Button>
            <Button 
              type="primary" 
              htmlType="submit"
              loading={loading}
              className="submit-button"
              style={{ backgroundColor: '#FAAD14', borderColor: '#FAAD14' }}
            >
              Submit
            </Button>
          </div>
        </Form>
      </div>
    </Card>
  );

  const renderStep3USDT = () => (
    <Card className="step-card">
      <div className="step-header">
        <div className="step-badge">Step 3</div>
        <div className="step-title">Choose Amount</div>
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
                    : Promise.reject('Amount must be at least 50 USD')
              }
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
            <Button onClick={handleBack} className="back-button">
              Back
            </Button>
            <Button 
              type="primary" 
              htmlType="submit"
              loading={loading}
              className="submit-button"
              style={{ backgroundColor: '#FAAD14', borderColor: '#FAAD14' }}
            >
              Submit
            </Button>
          </div>
        </Form>
      </div>
    </Card>
  );

  return (
    <PageContainer>
      <Button 
        icon={<ArrowLeftOutlined />}
        onClick={() => history.push('/finops/withdraw')}
        className="main-back-button"
      >
        Back
      </Button>

      <Title level={2} style={{ marginBottom: '24px' }}>Withdraw</Title>

      <div ref={step1Ref} className={currentStep === 1 ? 'visible-step' : 'hidden-step'}>
        {renderStep1()}
      </div>

      <div ref={step2Ref} className={currentStep === 2 ? 'visible-step' : 'hidden-step'}>
        {renderStep2()}
      </div>

      {currentStep === 3 && (
        <>
          {selectedPaymentMethod === 'bank-wire' && (
            <div ref={step3Ref} className="visible-step">
              {renderStep3BankWire()}
            </div>
          )}
          
          {selectedPaymentMethod === 'usdt' && (
            <div ref={step3UsdtRef} className="visible-step">
              {renderStep3USDT()}
            </div>
          )}
        </>
      )}

      
    </PageContainer>
  );
};

export default WithdrawCard;