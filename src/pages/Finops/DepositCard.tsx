// import { api } from '@/components/common/api';
// import { Type } from '@/generated';
// import { useModel } from '@@/exports';
// import {
//   ArrowLeftOutlined,
//   BankOutlined,
//   DollarOutlined,
//   UploadOutlined,
//   WalletOutlined,
// } from '@ant-design/icons';
// import { PageContainer } from '@ant-design/pro-components';
// import { history } from '@umijs/max';
// import { Button, Card, Form, Input, message, Radio, Select, Table, Typography, Upload } from 'antd';
// import type { UploadFile, UploadProps } from 'antd/es/upload/interface';
// import React, { useEffect, useState } from 'react';

// const { Title, Text } = Typography;
// const { Option } = Select;

// // Define payment method interface
// interface PaymentMethod {
//   key: string;
//   label: string;
//   icon: React.ReactNode;
//   details: string;
//   processingTime: string;
//   cost: number;
// }

// // Define PaymentSetting interface
// interface PaymentSetting {
//   id: number;
//   name: string;
//   url: string;
//   description?: string;
//   isActive: boolean;
// }

// const DepositCard: React.FC = () => {
//   // State management
//   const [currentStep, setCurrentStep] = useState(1);
//   const [selectedCurrency, setSelectedCurrency] = useState<string | undefined>(undefined);
//   const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | undefined>(undefined);
//   const [balance, setBalance] = useState<number>(0);
//   const [loading, setLoading] = useState(false);
//   const [fileList, setFileList] = useState<UploadFile[]>([]);
//   const [bankWireDetails, setBankWireDetails] = useState(null);
//   const [showBankDetails, setShowBankDetails] = useState(false);
//   const [showPaymentLinks, setShowPaymentLinks] = useState(false);
//   const [paymentData, setPaymentData] = useState<PaymentSetting[]>([]);
//   const [paymentLinks, setPaymentLinks] = useState<PaymentSetting[]>([]);
//   const [amount, setAmount] = useState<number>(0);

//   // Forms
//   const [amountForm] = Form.useForm();

//   // Get user information and wallet balance
//   const { initialState } = useModel('@@initialState');

//   // Define payment methods array
//   const paymentMethods: PaymentMethod[] = [
//     {
//       key: 'bank-transfer',
//       label: 'Bank Transfer',
//       icon: <BankOutlined className="payment-icon" />,
//       details: 'Bank Wire Deposit (1-24 hours)',
//       processingTime: '1-24 hours',
//       cost: 0,
//     },
//     {
//       key: 'tether-usdt',
//       label: 'Card payment',
//       icon: <WalletOutlined className="payment-icon" />,
//       details: 'Card payment Instant deposit 24/7',
//       processingTime: '24/7 Instant',
//       cost: 0,
//     },
//     {
//       key: 'other-payment',
//       label: 'Cash Deposit 24/7',
//       icon: <DollarOutlined className="payment-icon" />,
//       details: 'Cash options available',
//       processingTime: 'Varies',
//       cost: 0,
//     },
//   ];

//   useEffect(() => {
//     init();
//   }, []);

//   const handleBack = () => {
//     if (currentStep > 1) {
//       setCurrentStep(currentStep - 1);
//       if (currentStep === 4 && (showBankDetails || showPaymentLinks)) {
//         setShowBankDetails(false);
//         setShowPaymentLinks(false);
//       }
//     } else {
//       history.push('/finops/deposit');
//     }
//   };

//   const handleContinue = () => {
//     if (currentStep === 2 && !selectedPaymentMethod) {
//       message.error({
//         content: 'To proceed, please choose a payment method.',
//         icon: <span className="orange-error-icon"> ✘ </span>,
//         className: 'orange-error-notification',
//         duration: 3,
//       });
//       return;
//     }
//     setCurrentStep(currentStep + 1);
//   };

//   const handleCurrencySelect = (value: string) => {
//     setSelectedCurrency(value);
//   };

//   const handlePaymentMethodChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setSelectedPaymentMethod(e.target.value);
//   };

//   const fetchPaymentLinks = async () => {
//     try {
//       // Use the amount when fetching payment links
//       const amountValue = amountForm.getFieldValue('amount');
//       const response = await api.setting.getpaymentlinks(amountValue);
//       setPaymentLinks(response);
//       return response;
//     } catch (error) {
//       console.error('Error fetching payment links:', error);
//       message.error({
//         content: 'Unable to load payment options at the moment. Please try again later.',
//         icon: <span className="orange-error-icon"> ✘ </span>,
//         className: 'orange-error-notification',
//         duration: 3,
//       });
//       return [];
//     }
//   };

//   // const handleAmountSubmit = async (values: any) => {
//   //   setAmount(values.amount);

//   //   // Check which payment method is selected
//   //   if (selectedPaymentMethod === 'bank-transfer') {
//   //     setShowBankDetails(true);
//   //     setShowPaymentLinks(false);
//   //     message.success({
//   //       content: 'Amount has been successfully submitted.',
//   //       icon: <span className="green-success-icon"> ✓ </span>,
//   //       className: 'green-success-notification',
//   //       duration: 3,
//   //     });
//   //   } else if (selectedPaymentMethod === 'tether-usdt') {
//   //     // Show payment links for Backup Payment option
//   //     setLoading(true);
//   //     try {
//   //       const links = await fetchPaymentLinks();
//   //       if (links && links.length > 0) {
//   //         setShowBankDetails(false);
//   //         setShowPaymentLinks(true);
//   //         message.success({
//   //           content: 'Payment options have been successfully loaded.',
//   //           icon: <span className="green-success-icon"> ✓ </span>,
//   //           className: 'green-success-notification',
//   //           duration: 3,
//   //         });
//   //       } else {
//   //         message.warning({
//   //           content: 'No available payment options. Please try another method.',
//   //           icon: <span className="yellow-warning-icon"> ⚠ </span>,
//   //           className: 'yellow-warning-notification',
//   //           duration: 3,
//   //         });
//   //         setShowPaymentLinks(false);
//   //       }
//   //     } catch (error) {
//   //       message.error({
//   //         content: 'Unable to fetch payment options at the moment. Please try again later.',
//   //         icon: <span className="orange-error-icon"> ✘ </span>,
//   //         className: 'orange-error-notification',
//   //         duration: 3,
//   //       });
//   //     } finally {
//   //       setLoading(false);
//   //     }
//   //   } else {
//   //     setShowBankDetails(false);
//   //     setShowPaymentLinks(false);
//   //     message.success({
//   //       content: 'Amount has been successfully submitted.',
//   //       icon: <span className="green-success-icon"> ✓ </span>,
//   //       className: 'green-success-notification',
//   //       duration: 3,
//   //     });
//   //     setCurrentStep(4);
//   //   }
//   // };

//   // const handleAmountSubmit = async (values: any) => {
//   //   setAmount(values.amount);

//   //   // Check which payment method is selected
//   //   if (selectedPaymentMethod === 'bank-transfer') {
//   //     setShowBankDetails(true);
//   //     setShowPaymentLinks(false);
//   //     message.success({
//   //       content: 'Amount has been successfully submitted.',
//   //       icon: <span className="green-success-icon"> ✓ </span>,
//   //       className: 'green-success-notification',
//   //       duration: 3,
//   //     });
//   //   } else if (selectedPaymentMethod === 'tether-usdt') {
//   //     // Show payment links for Backup Payment option
//   //     setLoading(true);
//   //     try {
//   //       // Call getPaymentSettings API here
//   //       const paymentSettings = await api.setting.getPaymentSettings();
//   //       setPaymentData(paymentSettings);

//   //       // Then fetch payment links
//   //       const links = await fetchPaymentLinks();
//   //       if (links && links.length > 0) {
//   //         setShowBankDetails(false);
//   //         setShowPaymentLinks(true);
//   //         message.success({
//   //           content: 'Payment options have been successfully loaded.',
//   //           icon: <span className="green-success-icon"> ✓ </span>,
//   //           className: 'green-success-notification',
//   //           duration: 3,
//   //         });
//   //       } else {
//   //         message.warning({
//   //           content: 'No available payment options. Please try another method.',
//   //           icon: <span className="yellow-warning-icon"> ⚠ </span>,
//   //           className: 'yellow-warning-notification',
//   //           duration: 3,
//   //         });
//   //         setShowPaymentLinks(false);
//   //       }
//   //     } catch (error) {
//   //       message.error({
//   //         content: 'Unable to fetch payment options at the moment. Please try again later.',
//   //         icon: <span className="orange-error-icon"> ✘ </span>,
//   //         className: 'orange-error-notification',
//   //         duration: 3,
//   //       });
//   //     } finally {
//   //       setLoading(false);
//   //     }
//   //   } else {
//   //     setShowBankDetails(false);
//   //     setShowPaymentLinks(false);
//   //     message.success({
//   //       content: 'Amount has been successfully submitted.',
//   //       icon: <span className="green-success-icon"> ✓ </span>,
//   //       className: 'green-success-notification',
//   //       duration: 3,
//   //     });
//   //     setCurrentStep(4);
//   //   }
//   // };

//   // Combined implementation of both handleAmountSubmit functions
//   const handleAmountSubmit = async (values: any) => {
//     const amountValue = values.amount;
//     setAmount(amountValue);

//     if (selectedPaymentMethod === 'bank-transfer') {
//       setShowBankDetails(true);
//       setShowPaymentLinks(false);

//       message.success({
//         content: 'Amount has been successfully submitted.',
//         icon: <span className="green-success-icon"> ✓ </span>,
//         className: 'green-success-notification',
//         duration: 3,
//       });
//     } else if (selectedPaymentMethod === 'tether-usdt') {
//       setLoading(true);

//       try {
//         // ✅ Step 1: Submit the deposit request
//         const formData: any = {
//           Type: Type.EXT_TO_WALLET,
//           Amount: amountValue,
//           Currency: 'USD',
//           Comment: `Deposit ${amountValue}`,
//           PaymentMethod: selectedPaymentMethod,
//         };

//         await api.transaction.deposit(formData);

//         message.success({
//           content:
//             'Your deposit request has been successfully submitted and will appear in your transaction history.',
//           icon: <span className="green-success-icon"> ✓ </span>,
//           className: 'green-success-notification',
//           duration: 3,
//         });

//         // ✅ Step 2: Load Payment Settings and Links
//         const paymentSettings = await api.setting.getPaymentSettings();
//         setPaymentData(paymentSettings);

//         const links = await fetchPaymentLinks();

//         if (links && links.length > 0) {
//           setShowBankDetails(false);
//           setShowPaymentLinks(true);

//           message.success({
//             content: 'Payment options have been successfully loaded.',
//             icon: <span className="green-success-icon"> ✓ </span>,
//             className: 'green-success-notification',
//             duration: 3,
//           });
//         } else {
//           setShowPaymentLinks(false);

//           message.warning({
//             content: 'No available payment options. Please try another method.',
//             icon: <span className="yellow-warning-icon"> ⚠ </span>,
//             className: 'yellow-warning-notification',
//             duration: 3,
//           });
//         }

//         // ✅ Reset form fields (stay on same step)
//         amountForm.resetFields();
//         setAmount('');
//       } catch (error) {
//         console.error('Error:', error);

//         message.error({
//           content:
//             'We encountered an issue submitting your deposit request. Please try again later.',
//           icon: <span className="orange-error-icon"> ✘ </span>,
//           className: 'orange-error-notification',
//           duration: 3,
//         });
//       } finally {
//         setLoading(false);
//       }
//     } else {
//       setShowBankDetails(false);
//       setShowPaymentLinks(false);

//       message.success({
//         content: 'Amount has been successfully submitted.',
//         icon: <span className="green-success-icon"> ✓ </span>,
//         className: 'green-success-notification',
//         duration: 3,
//       });

//       setCurrentStep(4);
//     }
//   };

//   const handleFinalSubmit = async () => {
//     try {
//       setLoading(true);

//       const amountValue = amountForm.getFieldValue('amount');

//       // Build formData object
//       const formData: any = {
//         Type: Type.EXT_TO_WALLET,
//         Amount: amountValue,
//         Currency: 'USD',
//         Comment: `Deposit ${amountValue}`,
//         PaymentMethod: selectedPaymentMethod,
//       };

//       // Only add FormFile if image is uploaded
//       if (fileList.length > 0) {
//         formData.FormFile = fileList[0].originFileObj;
//       }

//       // Call API with or without image
//       await api.transaction.deposit(formData);

//       message.success({
//         content: 'Your deposit request has been successfully submitted.',
//         icon: <span className="green-success-icon"> ✓ </span>,
//         className: 'green-success-notification',
//         duration: 3,
//       });
//       history.push('/finops/transaction_history');
//     } catch (error) {
//       console.error(error);
//       message.error({
//         content: 'We encountered an issue submitting your deposit request. Please try again later.',
//         icon: <span className="orange-error-icon"> ✘ </span>,
//         className: 'orange-error-notification',
//         duration: 3,
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleredirect = (url: string) => {
//     window.open(url, '_blank', 'noreferrer');
//     history.push('/finops/transaction_history');
//   };

//   async function init() {
//     try {
//       setBalance(initialState?.currentUser?.wallet?.balance || 0);

//       // Get payment settings
//       const paymentSettingsResponse = await api.setting.getPaymentSettings();
//       setPaymentData(paymentSettingsResponse);

//       // Initialize payment links with default amount (1000)
//       const paymentLinksResponse = await api.setting.getpaymentlinks(1000);
//       setPaymentLinks(paymentLinksResponse);
//     } catch (error) {
//       console.error('Error initializing data:', error);
//       message.error({
//         content: 'Unable to load payment information at the moment. Please try again later.',
//         icon: <span className="orange-error-icon"> ✘ </span>,
//         className: 'orange-error-notification',
//         duration: 3,
//       });
//     }
//   }

//   const getBankWire = async () => {
//     try {
//       const response = await api.transaction.getBankWire();
//       setBankWireDetails(response);
//     } catch (error) {
//       message.error({
//         content: 'Bank Details Are Not Fetched..',
//         icon: <span className="orange-error-icon"> ✘ </span>,
//         className: 'orange-error-notification',
//         duration: 3,
//       });
//     }
//   };

//   useEffect(() => {
//     getBankWire();
//   }, []);

//   const dataSource = bankWireDetails
//     ? [
//         {
//           key: '1',
//           name: 'Account Holder',
//           address: bankWireDetails.accountHolder,
//         },
//         {
//           key: '2',
//           name: 'Account Number',
//           address: bankWireDetails.accountNumber,
//         },
//         {
//           key: '3',
//           name: 'IBAN',
//           address: bankWireDetails.iban,
//         },
//         {
//           key: '4',
//           name: 'SWIFT/BIC',
//           address: bankWireDetails.swifT_BIC,
//         },
//         {
//           key: '5',
//           name: 'BANK NAME',
//           address: bankWireDetails.bank,
//         },
//         {
//           key: '6',
//           name: 'BRANCH',
//           address: bankWireDetails.branch,
//         },
//         ...(bankWireDetails.ifsc
//           ? [
//               {
//                 key: '7',
//                 name: 'IFSC',
//                 address: bankWireDetails.ifsc,
//               },
//             ]
//           : []),
//         ...(bankWireDetails.mmid
//           ? [
//               {
//                 key: '8',
//                 name: 'MMID',
//                 address: bankWireDetails.mmid,
//               },
//             ]
//           : []),
//       ]
//         // Filter out rows where `address` is null, undefined, or empty
//         .filter((row) => row.address != null && row.address !== '')
//     : [];

//   const columns = [
//     {
//       title: 'Detail',
//       dataIndex: 'name',
//       key: 'name',
//     },
//     {
//       title: 'Value',
//       dataIndex: 'address',
//       key: 'address',
//     },
//   ];

//   const uploadProps: UploadProps = {
//     beforeUpload: (file) => {
//       const acceptedFormats = ['image/jpeg', 'image/png', 'application/pdf'];
//       if (!acceptedFormats.includes(file.type)) {
//         message.error({
//           content: 'Only JPEG, PNG, and PDF files are allowed.',
//           icon: <span className="orange-error-icon"> ✘ </span>,
//           className: 'orange-error-notification',
//           duration: 3,
//         });
//         return Upload.LIST_IGNORE;
//       }

//       if (file.size > 2 * 1024 * 1024) {
//         message.error({
//           content: 'File size should not exceed 2MB.',
//           icon: <span className="orange-error-icon"> ✘ </span>,
//           className: 'orange-error-notification',
//           duration: 3,
//         });
//         return Upload.LIST_IGNORE;
//       }

//       setFileList([file]);
//       return false; // Prevent auto upload
//     },
//     fileList,
//     onRemove: () => {
//       setFileList([]);
//     },
//   };

//   const renderStep1 = () => (
//     <Card className="step-card">
//      <div className="account-headerr">
//           {/* <div className="account-avatar">
//             <div className="account-letter">V</div>
//           </div> */}
//           <div className="account-title">
//             <h2>Select Currency</h2>
//             <div className="account-subtitle">
//               <span className="verification-tag">Step 1</span>
//             </div>
//           </div>
//       </div>
//       <div className="step-header">
//         <div className="step-badge"></div>
//         <div className="step-title"></div>
//       </div>

//       <div className="step-content">
//         <Text strong>Choose Currency</Text>
//         <Select
//           className="currency-select"
//           placeholder="Select option"
//           style={{ width: '100%', marginTop: '8px', marginBottom: '20px' }}
//           onChange={handleCurrencySelect}
//           value={selectedCurrency}
//         >
//           <Option value="usd">USD (Available Balance: ${balance.toFixed(2)})</Option>
//         </Select>

//         <Button
//           type="primary"
//           onClick={handleContinue}
//           disabled={!selectedCurrency}
//           className="continue-button"
//           style={{ backgroundColor: '#FAAD14', borderColor: '#FAAD14' }}
//         >
//           Continue
//         </Button>
//       </div>
//     </Card>
//   );

//   const renderStep2 = () => (
//     <Card className="step-card">
//       <div className="account-headerr">
//           {/* <div className="account-avatar">
//             <div className="account-letter">V</div>
//           </div> */}
//           <div className="account-title">
//             <h2>Choose Payment Method</h2>
//             <div className="account-subtitle">
//               <span className="verification-tag">Step 2</span>
//             </div>
//           </div>
//       </div>
//       <div className="step-header">
//         <div className="step-badge"></div>
//         <div className="step-title"></div>
//       </div>

//       <div className="step-content">
//         <div className="payment-table-container">
//           <table className="payment-table">
//             <thead>
//               <tr>
//                 <th>Operation</th>
//                 <th>Payment Option</th>
//                 <th>Details</th>
//                 <th>Processing Time</th>
//                 <th>Cost</th>
//               </tr>
//             </thead>
//             <tbody>
//               {paymentMethods.map((method, index) => (
//                 <tr
//                   key={method.key}
//                   className={selectedPaymentMethod === method.key ? 'selected-row' : ''}
//                   style={{ backgroundColor: index % 2 === 1 ? '#f9f9f9' : '#ffffff' }}
//                 >
//                   <td>
//                     <Radio
//                       checked={selectedPaymentMethod === method.key}
//                       onChange={handlePaymentMethodChange}
//                       value={method.key}
//                     />
//                   </td>
//                   <td>
//                     <div className="payment-option">
//                       <div className="payment-icon-bg">{method.icon}</div>
//                       <span className="payment-label">{method.label}</span>
//                     </div>
//                   </td>
//                   <td>{method.details}</td>
//                   <td>{method.processingTime}</td>
//                   <td>{method.cost}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>

//         <div className="action-buttons">
//           <Button onClick={handleBack} className="back-button">
//             Back
//           </Button>
//           <Button
//             type="primary"
//             onClick={handleContinue}
//             className="continue-button"
//             style={{ backgroundColor: '#FAAD14', borderColor: '#FAAD14' }}
//           >
//             Continue
//           </Button>
//         </div>
//       </div>
//     </Card>
//   );

//   const renderStep3 = () => (
//     <Card className="step-card">
//       <div className="step-header">
//         <div className="step-badge">Step 3</div>
//         <div className="step-title">Choose Amount</div>
//       </div>

//       <div className="step-content">
//         <Text>Please fill in the form below to get your bank deposit reference code.</Text>

//         <Form
//           form={amountForm}
//           layout="vertical"
//           onFinish={handleAmountSubmit}
//           className="amount-form"
//         >
//           <Form.Item
//             name="amount"
//             label="Amount"
//             rules={[
//               { required: true, message: 'Please enter an amount' },
//               {
//                 pattern: /^(?!0\d+)(\d+)(\.\d{1,2})?$/,
//                 message: 'Please enter a valid amount',
//               },
//             ]}
//             style={{ marginTop: '16px' }}
//           >
//             <Input placeholder="Enter amount" />
//           </Form.Item>

//           <div className="action-buttons">
//             <Button onClick={handleBack} className="back-button">
//               Back
//             </Button>
//             <Button
//               type="primary"
//               htmlType="submit"
//               loading={loading}
//               className="submit-button"
//               style={{ backgroundColor: '#FAAD14', borderColor: '#FAAD14' }}
//             >
//               Submit
//             </Button>
//           </div>
//         </Form>

//         {showBankDetails && bankWireDetails && (
//           <div className="bank-details-container">
//             <Title level={4} style={{ marginTop: '24px', marginBottom: '16px' }}>
//               Bank Wire Details
//             </Title>
//             <Text type="secondary" style={{ marginBottom: '16px', display: 'block' }}>
//               Please use the following bank details to make your transfer:
//             </Text>
//             <Table
//               dataSource={dataSource}
//               columns={columns}
//               pagination={false}
//               bordered
//               className="bank-details-table"
//             />

//             <div className="action-buttons" style={{ marginTop: '24px' }}>
//               <Button
//                 type="primary"
//                 onClick={() => setCurrentStep(4)}
//                 className="continue-button"
//                 style={{ backgroundColor: '#FAAD14', borderColor: '#FAAD14' }}
//               >
//                 Continue to Next Step
//               </Button>
//             </div>
//           </div>
//         )}

//         {showPaymentLinks && paymentLinks && paymentLinks.length > 0 && (
//           <div className="payment-links-container">
//             <Title level={4} style={{ marginTop: '24px', marginBottom: '16px' }}>
//               Backup Payment Options
//             </Title>
//             <Text type="secondary" style={{ marginBottom: '16px', display: 'block' }}>
//               Please select one of the following payment options for amount: ${amount}
//             </Text>

//             <div className="payment-links-grid">
//               {paymentLinks.map((link) => (
//                 <Card key={link.id} className="payment-link-card" hoverable>
//                   <div className="payment-link-content">
//                     <Text strong>{link.name}</Text>
//                     {link.description && (
//                       <Text type="secondary" style={{ marginTop: '8px', display: 'block' }}>
//                         {link.description}
//                       </Text>
//                     )}
//                     <Button
//                       type="primary"
//                       onClick={() => handleredirect(link.url)}
//                       style={{
//                         marginTop: '16px',
//                         backgroundColor: '#FAAD14',
//                         borderColor: '#FAAD14',
//                       }}
//                     >
//                       Pay Now
//                     </Button>
//                   </div>
//                 </Card>
//               ))}
//             </div>

//             <div className="action-buttons" style={{ marginTop: '24px' }}>
//               <Button
//                 type="primary"
//                 onClick={() => setCurrentStep(4)}
//                 className="continue-button"
//                 style={{ backgroundColor: '#FAAD14', borderColor: '#FAAD14' }}
//               >
//                 Continue to Next Step
//               </Button>
//             </div>
//           </div>
//         )}
//       </div>
//     </Card>
//   );

//   const renderStep4 = () => (
//     <Card className="step-card">
//       <div className="step-header">
//         <div className="step-badge">Step 4</div>
//         <div className="step-title">Send Transaction Details</div>
//       </div>

//       <div className="step-content">
//         <Text>Send a screenshot of your transaction (optional)</Text>

//         <div className="upload-container">
//           <Upload {...uploadProps} className="upload-area">
//             <div className="upload-content">
//               <UploadOutlined className="upload-icon" />
//               <div>Upload Image</div>
//               <div className="upload-note">
//                 Only JPEG, PNG, and PDF files are allowed (Max 2 MB)
//               </div>
//             </div>
//           </Upload>
//         </div>

//         <div className="action-buttons">
//           <Button onClick={handleBack} className="back-button">
//             Back
//           </Button>
//           <Button
//             type="primary"
//             onClick={handleFinalSubmit}
//             loading={loading}
//             className="confirm-button"
//             // disabled={fileList.length === 0}
//             style={{ backgroundColor: '#FAAD14', borderColor: '#FAAD14' }}
//           >
//             Confirm and Proceed
//           </Button>
//         </div>
//       </div>
//     </Card>
//   );

//   return (
//     <PageContainer>
//       <Button
//         icon={<ArrowLeftOutlined />}
//         onClick={() => history.push('/finops/deposit')}
//         className="main-back-button"
//       >
//         Back
//       </Button>

      

//       {currentStep === 1 && renderStep1()}
//       {currentStep === 2 && renderStep2()}
//       {currentStep === 3 && renderStep3()}
//       {currentStep === 4 && renderStep4()}

      
//     </PageContainer>
//   );
// };

// export default DepositCard;
