import { api } from '@/components/common/api';
import { AccountType, SignUpRequest } from '@/generated';
import {
  Avatar,
  Button,
  Card,
  Col,
  Collapse,
  Form,
  Input,
  message,
  Row,
  Select,
} from 'antd';
import React, { useEffect, useState } from 'react';
import '../../common.css';

const { Panel } = Collapse;

const MyDetails: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isFormChanged, setIsFormChanged] = useState(false);
  const [userInitial, setUserInitial] = useState('');

  useEffect(() => {
    getDetails();
  }, []);

  async function getDetails() {
    const record = await api.app.getMe();
    const mtClient = record.mtUsers?.find((m) => m.accountType === AccountType.CLIENT);
    const s: SignUpRequest = {
      ...record,
      password: atob(record.passcode || ''),
      masterPassword: mtClient?.password || '',
      investorPassword: mtClient?.investorPassword || '',
    };

    form.setFieldsValue(s);
    form.setFieldValue('logins', mtClient?.login);

    if (record.firstName) {
      setUserInitial(record.firstName.charAt(0).toUpperCase());
    }
  }

  const handleEditClick = () => {
    setIsEditing(!isEditing);
    if (!isEditing) setIsFormChanged(false);
  };

  const handleOk = async () => {
    setLoading(true);
    try {
      const excludedFields = ['masterPassword', 'investorPassword'];
      const fieldNamesToValidate = Object.keys(form.getFieldsValue()).filter(
        (fieldName) => !excludedFields.includes(fieldName),
      );

      const values = await form.validateFields(fieldNamesToValidate);
      const currentRecord = await api.app.getMe();
      const payload = {
        ...values,
        isEnabled: currentRecord.isEnabled,
        passcode: values.password ? btoa(values.password) : currentRecord.passcode,
      };

      const response = await api.app.putMe(payload);

      if (response.message.includes('User Details Updated')) {
        message.success('Profile Updated Successfully');
        setIsEditing(false);
        setIsFormChanged(false);
        if (values.firstName) {
          setUserInitial(values.firstName.charAt(0).toUpperCase());
        }
      } else {
        message.error(response.message);
      }
      getDetails();
    } catch (error) {
      message.error('An error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-container">
      <Card className="profile-card" style={{ padding: '20px 30px' }}>
        {/* HEADER */}
        <div className="profile-info" style={{ marginBottom: 30 }}>
          <div className="avatar-container">
            <Avatar className="user-avatar" size={80}>
              {userInitial}
            </Avatar>
          </div>
          <div className="user-info">
            <h2 className="user-name">My Profile</h2>
            {/* <span className="account-badge">
              {form.getFieldValue('firstName')} {form.getFieldValue('lastName')}
            </span> */}
          </div>
        </div>

        <Form
          form={form}
          onFinish={handleOk}
          onFieldsChange={() => setIsFormChanged(true)}
          layout="vertical"
        >
          <Collapse accordion defaultActiveKey={['1']} className="profile-collapse">
            {/* PERSONAL INFO */}
            <Panel header="Personal Information" key="1">
              <Row gutter={24}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="firstName"
                    label="First Name"
                    rules={[{ required: true, message: 'Please enter your first name' }]}
                  >
                    <Input readOnly={!isEditing} placeholder="John" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="lastName"
                    label="Last Name"
                    rules={[{ required: true, message: 'Please enter your last name' }]}
                  >
                    <Input readOnly={!isEditing} placeholder="Doe" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="email"
                    label="Email"
                    rules={[{ required: true, message: 'Please enter your email' }]}
                  >
                    <Input readOnly={!isEditing} placeholder="example@mail.com" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="phone"
                    label="Phone Number"
                    rules={[{ required: true, message: 'Please enter your phone' }]}
                  >
                    <Input readOnly={!isEditing} placeholder="1234567890" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="password"
                    label="Password"
                    rules={[{ required: true, message: 'Enter password' }]}
                  >
                    <Input.Password readOnly={!isEditing} placeholder="••••••••" />
                  </Form.Item>
                </Col>
              </Row>
            </Panel>

            {/* MT5 ACCOUNTS */}
            <Panel header="MT5 Account Details" key="2">
              <Row gutter={24}>
                <Col xs={24} md={12}>
                  <Form.Item name="logins" label="MT5 Account">
                    <Input disabled />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="masterPassword" label="Master Password">
                    <Input.Password disabled />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="investorPassword" label="Investor Password">
                    <Input.Password disabled />
                  </Form.Item>
                </Col>
              </Row>
            </Panel>

            {/* ADDITIONAL INFO */}
            <Panel header="Additional Information" key="3">
              <Row gutter={24}>
                <Col xs={24} md={12}>
                  <Form.Item name="promo" label="Promo Code">
                    <Input disabled />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="region" label="Region">
                    <Select disabled={!isEditing} placeholder="Select Country">
                      {['India', 'USA', 'UK', 'Australia', 'France', 'Germany'].map((c) => (
                        <Select.Option key={c}>{c}</Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            </Panel>
          </Collapse>

          {/* FIXED BUTTONS */}
          <div className="form-actions" style={{ marginTop: 30, textAlign: 'right' }}>
            {isEditing ? (
              <>
                <Button onClick={handleEditClick} style={{ marginRight: 10 }}>
                  Cancel
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  disabled={!isFormChanged}
                >
                  Update
                </Button>
              </>
            ) : (
              <Button
                type="primary"
                onClick={handleEditClick}
                style={{
                  border: 'none',
                }}
              >
                Edit Profile
              </Button>
            )}
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default MyDetails;
