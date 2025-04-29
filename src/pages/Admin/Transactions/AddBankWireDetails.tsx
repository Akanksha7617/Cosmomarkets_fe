// import { api } from '@/components/common/api';
// import { CustomList } from '@/components/Custom/CustomList';
// import { PlusOutlined } from '@ant-design/icons';
// import { Button, Card, Col, Form, Input, message, Modal, Row, Switch, Typography } from 'antd';
// import React, { useEffect, useState } from 'react';
// import '../../../common.css';
// const { Text } = Typography;

// interface KeyValue {
//   key: string;
//   value: string;
// }

// interface CustomListProps {
//   data: KeyValue[];
//   renderItem: (item: KeyValue) => React.ReactNode;
// }

// const AddBankWireDetails: React.FC = () => {
//   const [form] = Form.useForm();
//   const [formUpdate] = Form.useForm();

//   const [bankWireDetails, setBankWireDetails] = useState(null);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [isModalOpenUpdate, setIsModalOpenUpdate] = useState(false);
//   const [updateId, setUpdateId] = useState(null); // State variable to store the ID for update
//   const [radioValue, setRadioValue] = useState(null); // "false" is the default value
//   const [isActive, setIsActive] = useState<boolean>(true);
//   const [isActiveUpdate, setIsActiveUpdate] = useState<boolean>(true);

//   const handleSwitchChange = (checked: boolean) => {
//     setIsActive(checked);
//   };
//   const handleSwitchChangeUpdate = (checked: boolean) => {
//     setIsActiveUpdate(checked);
//   };

//   const showModal = () => {
//     setIsModalOpen(true);
//   };

//   const handleOk = () => {
//     setIsModalOpen(false);
//   };

//   const handleCancel = () => {
//     setIsModalOpen(false);
//   };
//   const handleCancelUpdate = () => {
//     setIsModalOpenUpdate(false);
//   };

//   const getBankWire = async () => {
//     try {
//       const response = await api.transaction.getBankWire();
//       if (response === 'Bank wire details not found.') {
//         setBankWireDetails(null);
//       } else {
//         setBankWireDetails(response);
//       }

//       console.log('bankdetails::::::::', response);
//     } catch (error) {
//       message.error('Bank Details Are Not Fetched..');
//     }
//   };

//   useEffect(() => {
//     getBankWire();
//   }, []);

//   const handleUpdate = async (bankWireDetails: any, id: any) => {
//     setIsModalOpenUpdate(true);
//     formUpdate.setFieldsValue(bankWireDetails);
//     setUpdateId(id); // Set the ID in state variable
//   };

//   const customList = bankWireDetails
//     ? [
//         { key: 'Account Holder', value: bankWireDetails.accountHolder },
//         { key: 'Account Number', value: bankWireDetails.accountNumber },
//         { key: 'IBAN', value: bankWireDetails.iban },
//         ...(bankWireDetails.swifT_BIC
//           ? [{ key: 'SWIFT/BIC', value: bankWireDetails.swifT_BIC }]
//           : []),
//         { key: 'BANK NAME', value: bankWireDetails.bank },
//         { key: 'BRANCH', value: bankWireDetails.branch },
//         ...(bankWireDetails.ifsc ? [{ key: 'IFSC', value: bankWireDetails.ifsc }] : []),
//         ...(bankWireDetails.mmid ? [{ key: 'MMID', value: bankWireDetails.mmid }] : []),
//         { key: 'Active', value: bankWireDetails.isActive ? 'Yes' : 'No' }, // Display Yes for true, No for false

//         {
//           key: ' ',
//           value: (
//             <Button
//               onClick={() => handleUpdate(bankWireDetails, bankWireDetails.id)}
//               style={{ backgroundColor: 'rgb(87, 177, 79)', color: 'white', borderRadius: '77px' }}
//               type="submit"
//             >
//               Update
//             </Button>
//           ),
//         },
//       ]
//     : [];

//   const onFinish = async () => {
//     const values = await form.validateFields();

//     const formData = {
//       id: 0,
//       accountHolder: values.accountHolder,
//       accountNumber: values.accountNumber,
//       iban: values.iban,
//       bank: values.bank,
//       branch: values.branch,
//       swifT_BIC: values.swifT_BIC,
//       mmid: values.mmid,
//       ifsc: values.ifsc,
//       isActive: isActive,
//     };

//     try {
//       const response = await api.transaction.CreateBankWire(formData);
//       message.success('BankWire Details Created Successfully...');
//       getBankWire();

//       setIsModalOpen(false);

//       console.log(response);
//     } catch (error) {}
//   };
//   const onFinishUpdate = async () => {
//     const values = await formUpdate.validateFields(); // Use formUpdate instead of form
//     const mmid = values.mmid ? parseFloat(values.mmid) : null;

//     const formData = {
//       id: updateId,
//       accountHolder: values.accountHolder,
//       accountNumber: values.accountNumber,
//       iban: values.iban,
//       bank: values.bank,
//       branch: values.branch,
//       swifT_BIC: values.swifT_BIC,
//       mmid: mmid,
//       ifsc: values.ifsc,
//       isActive: isActiveUpdate, // Use isActive here
//     };

//     try {
//       const response = await api.transaction.UpdateBankWire(updateId, formData);
//       message.success('BankWire Details Updated Successfully...');
//       getBankWire();
//       setIsModalOpenUpdate(false);
//       console.log(response);
//     } catch (error) {
//       console.error('Error updating bank wire details:', error);
//       message.error('Failed to update bank wire details. Please try again.');
//     }
//   };

//   return (
//     <div>
//       {bankWireDetails === null ? (
//         <Button type="link" icon={<PlusOutlined />} onClick={showModal}>
//           Create New BankWire
//         </Button>
//       ) : (
//         <Row gutter={[16, 16]}>
//           <Col xs={24}>
//             <Card title="Bank Wire Details" className="bankwire-card" style={{ marginTop: '20px' }}>
//               <div className="card-content" style={{ height: '300px' }}>
//                 <CustomList
//                   data={customList}
//                   renderItem={(item: { key: string; value: string }) => (
//                     <Row justify="space-between" style={{ marginBottom: '.5rem', fontSize: 20 }}>
//                       <Text>{item.key}</Text>
//                       <Text strong>{item.value}</Text>
//                     </Row>
//                   )}
//                 />
//               </div>
//             </Card>
//           </Col>
//         </Row>
//       )}
//       <div>
//         <Modal
//           title=" "
//           open={isModalOpen}
//           onOk={handleOk}
//           onCancel={handleCancel}
//           footer={null}
//           width={650}
//         >
//           <Card className="Create-Bankwire-form">
//             <h2>Create BankWire</h2>
//             <Form
//               layout="vertical"
//               // onFinish={onFinish}
//               form={form}
//             >
//               <div className="forms_details" style={{ display: 'flex' }}>
//                 <Form.Item
//                   name="accountHolder"
//                   label="Account Holder"
                  
//                   style={{ width: '100%', marginTop: 25, fontWeight: 'bold' }}
//                 >
//                   <Input
//                     style={{ height: '40px', backgroundColor: 'rgba(0, 0, 0, 0.04)', width: '70%' }}
//                   />
//                 </Form.Item>
//                 <Form.Item
//                   name="accountNumber"
//                   label="Account Number"
                  
//                   style={{ width: '100%', marginTop: 25, fontWeight: 'bold' }}
//                 >
//                   <Input
//                     style={{ height: '40px', backgroundColor: 'rgba(0, 0, 0, 0.04)', width: '70%' }}
//                   />
//                 </Form.Item>
//               </div>
//               <div className="forms_details" style={{ display: 'flex' }}>
//                 <Form.Item
//                   name="iban"
//                   label="IBAN"
                  
//                   style={{ width: '100%', marginTop: 25, fontWeight: 'bold' }}
//                 >
//                   <Input
//                     style={{ height: '40px', backgroundColor: 'rgba(0, 0, 0, 0.04)', width: '70%' }}
//                   />
//                 </Form.Item>
//                 <Form.Item
//                   name="bank"
//                   label="Bank Name"
                 
//                   style={{ width: '100%', marginTop: 25, fontWeight: 'bold' }}
//                 >
//                   <Input
//                     style={{ height: '40px', backgroundColor: 'rgba(0, 0, 0, 0.04)', width: '70%' }}
//                   />
//                 </Form.Item>
//               </div>
//               <div className="forms_details" style={{ display: 'flex' }}>
//                 <Form.Item
//                   name="branch"
//                   label="Branch"
                 
//                   style={{ width: '100%', marginTop: 25, fontWeight: 'bold' }}
//                 >
//                   <Input
//                     style={{ height: '40px', backgroundColor: 'rgba(0, 0, 0, 0.04)', width: '70%' }}
//                   />
//                 </Form.Item>
//                 <Form.Item
//                   name="swifT_BIC"
//                   label="SWIFT/BIC"
                  
//                   style={{ width: '100%', marginTop: 25, fontWeight: 'bold' }}
//                 >
//                   <Input
//                     style={{ height: '40px', backgroundColor: 'rgba(0, 0, 0, 0.04)', width: '70%' }}
//                   />
//                 </Form.Item>
//               </div>
//               <div className="forms_details" style={{ display: 'flex' }}>
//                 <Form.Item
//                   name="mmid"
//                   label="MMID"
                  
//                   style={{ width: '100%', marginTop: 25, fontWeight: 'bold' }}
//                 >
//                   <Input
//                     style={{ height: '40px', backgroundColor: 'rgba(0, 0, 0, 0.04)', width: '70%' }}
//                   />
//                 </Form.Item>
//                 <Form.Item
//                   name="ifsc"
//                   label="IFSC Code"
                 
//                   style={{ width: '100%', marginTop: 25, fontWeight: 'bold' }}
//                 >
//                   <Input
//                     style={{ height: '40px', backgroundColor: 'rgba(0, 0, 0, 0.04)', width: '70%' }}
//                   />
//                 </Form.Item>
//               </div>
//               <div className="forms_details" style={{ marginBottom: '20px ', fontWeight: 'bold' }}>
//                 <Form.Item
//                   name="isActive"
//                   label="Active"
                 
//                 >
//                   {/* <Radio.Group onChange={handleRadioChange} value={radioValue} style={{marginLeft:'50%'}}>
//           <Radio value={true}>Active</Radio>
//           <Radio value={false}>In Active</Radio>
//         </Radio.Group>   */}
//                   <Switch onChange={handleSwitchChange} />
//                 </Form.Item>
//               </div>
//               <div className="forms_details" style={{ display: 'flex' }}>
//                 <Button
//                   onClick={onFinish}
//                   style={{
//                     justifyContent: 'end',
//                     backgroundColor: 'rgb(87, 177, 79)',
//                     color: 'white',
//                     borderRadius: '77px',
//                   }}
//                   type="submit"
//                 >
//                   Create
//                 </Button>
//               </div>
//             </Form>
//           </Card>
//         </Modal>
//       </div>

//       <div>
//         <Modal
//           title=" "
//           open={isModalOpenUpdate}
//           onOk={handleOk}
//           onCancel={handleCancelUpdate}
//           footer={null}
//           width={650}
//         >
//           <Card className="Create-Bankwire-form">
//             <h2 className="uppp">Update BankWire</h2>
//             <Form
//               layout="vertical"
//               // onFinish={onFinish}
//               form={formUpdate}
//             >
//               <div className="forms_details" style={{ display: 'flex' }}>
//                 <Form.Item
//                   name="accountHolder"
//                   label="Account Holder"
                  
//                   style={{ width: '100%', marginTop: 25, fontWeight: 'bold' }}
//                 >
//                   <Input
//                     style={{ height: '40px', backgroundColor: 'rgba(0, 0, 0, 0.04)', width: '70%' }}
//                   />
//                 </Form.Item>
//                 <Form.Item
//                   name="accountNumber"
//                   label="Account Number"
//                   rules={[
//                     {
//                       required: true,
//                       message: 'Please enter Account Number',
//                     },
//                     {
//                       pattern: /^\d+$/,
//                       message: 'Please enter only numeric characters',
//                     },
//                   ]}
//                   style={{ width: '100%', marginTop: 25, fontWeight: 'bold' }}
//                 >
//                   <Input
//                     style={{ height: '40px', backgroundColor: 'rgba(0, 0, 0, 0.04)', width: '70%' }}
//                   />
//                 </Form.Item>
//               </div>
//               <div className="forms_details" style={{ display: 'flex' }}>
//                 <Form.Item
//                   name="iban"
//                   label="IBAN"
//                   style={{ width: '100%', marginTop: 25, fontWeight: 'bold' }}
//                 >
//                   <Input
//                     style={{ height: '40px', backgroundColor: 'rgba(0, 0, 0, 0.04)', width: '70%' }}
//                   />
//                 </Form.Item>
//                 <Form.Item
//                   name="bank"
//                   label="Bank Name"
                 
//                   style={{ width: '100%', marginTop: 25, fontWeight: 'bold' }}
//                 >
//                   <Input
//                     style={{ height: '40px', backgroundColor: 'rgba(0, 0, 0, 0.04)', width: '70%' }}
//                   />
//                 </Form.Item>
//               </div>
//               <div className="forms_details" style={{ display: 'flex' }}>
//                 <Form.Item
//                   name="branch"
//                   label="Branch"
                  
//                   style={{ width: '100%', marginTop: 25, fontWeight: 'bold' }}
//                 >
//                   <Input
//                     style={{ height: '40px', backgroundColor: 'rgba(0, 0, 0, 0.04)', width: '70%' }}
//                   />
//                 </Form.Item>
//                 <Form.Item
//                   name="swifT_BIC"
//                   label="SWIFT/BIC"
                  
//                   style={{ width: '100%', marginTop: 25, fontWeight: 'bold' }}
//                 >
//                   <Input
//                     style={{ height: '40px', backgroundColor: 'rgba(0, 0, 0, 0.04)', width: '70%' }}
//                   />
//                 </Form.Item>
//               </div>
//               <div className="forms_details" style={{ display: 'flex' }}>
//                 <Form.Item
//                   name="mmid"
//                   label="MMID"
                 
//                   style={{ width: '100%', marginTop: 25, fontWeight: 'bold' }}
//                 >
//                   <Input
//                     style={{ height: '40px', backgroundColor: 'rgba(0, 0, 0, 0.04)', width: '70%' }}
//                   />
//                 </Form.Item>
//                 <Form.Item
//                   name="ifsc"
//                   label="IFSC Code"
                  
//                   style={{ width: '100%', marginTop: 25, fontWeight: 'bold' }}
//                 >
//                   <Input
//                     style={{ height: '40px', backgroundColor: 'rgba(0, 0, 0, 0.04)', width: '70%' }}
//                   />
//                 </Form.Item>
//               </div>
//               <div className="forms_details" style={{ marginBottom: '20px ', fontWeight: 'bold' }}>
//                 <Form.Item
//                   name="isActive"
//                   label="Active"
                 
//                 >
//                   {/* <Radio.Group onChange={handleRadioChange} value={radioValue} style={{marginLeft:'50%'}}>
//           <Radio value={true}>Active</Radio>
//           <Radio value={false}>In Active</Radio>
//         </Radio.Group>   */}
//                   <Switch onChange={handleSwitchChangeUpdate} />
//                 </Form.Item>
//               </div>
//               <div className="forms_details" style={{ display: 'flex' }}>
//                 <Button
//                   onClick={onFinishUpdate}
//                   style={{
//                     justifyContent: 'end',
//                     backgroundColor: 'rgb(87, 177, 79)',
//                     color: 'white',
//                     borderRadius: '77px',
//                   }}
//                   type="submit"
//                 >
//                   Update{' '}
//                 </Button>
//               </div>
//             </Form>
//           </Card>
//         </Modal>
//       </div>
//     </div>
//   );
// };

// export default AddBankWireDetails;
