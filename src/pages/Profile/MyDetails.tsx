import { api } from '@/components/common/api';
import { AccountType, SignUpRequest } from '@/generated';
import { Avatar, Button, Card, Col, Divider, Form, Input, message, Row, Select, Tabs } from 'antd';
import React, { useEffect, useState } from 'react';
import '../../common.css';

const MyDetails: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isFormChanged, setIsFormChanged] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('1');
  const [isNextAction, setIsNextAction] = useState(false);
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

    // Set the user initial for the avatar
    if (record.firstName) {
      setUserInitial(record.firstName.charAt(0).toUpperCase());
    }
  }

  const handleEditClick = () => {
    setIsEditing(!isEditing);
    if (!isEditing) {
      setIsFormChanged(false);
    }
  };

  const handleNextClick = () => {
    setIsNextAction(true);
    const nextTab = (parseInt(activeTab) + 1).toString();
    setActiveTab(nextTab);
  };

  const handleOk = async () => {
    if (isNextAction) {
      setIsNextAction(false);
      return;
    }

    setLoading(true);
    try {
      const excludedFields = ['masterPassword', 'investorPassword', 'password'];
      const fieldNamesToValidate = Object.keys(form.getFieldsValue()).filter(
        (fieldName) => !excludedFields.includes(fieldName),
      );

      const values = await form.validateFields(fieldNamesToValidate);

      const currentRecord = await api.app.getMe();
      const payload = {
        ...values,
        isEnabled: currentRecord.isEnabled,
      };

      const response = await api.app.putMe(payload);

      if (response.message.includes('User Details Updated')) {
        message.success({
          content: response.message,
          icon: <span className="success-icon"> ✓ </span>,
          className: 'success-notification',
          duration: 3,
        });
        setIsEditing(false);
        setIsFormChanged(false);

        // Update user initial after successful update
        if (values.firstName) {
          setUserInitial(values.firstName.charAt(0).toUpperCase());
        }
      } else {
        message.error({
          content: response.message,
          icon: <span className="error-icon"> ✘ </span>,
          className: 'error-notification',
          duration: 3,
        });
      }
      getDetails();
    } catch (error) {
      message.error({
        content: 'An error occurred during the update. Please try again later.',
        icon: <span className="error-icon"> ✘ </span>,
        className: 'error-notification',
        duration: 3,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFieldsChange = () => {
    setIsFormChanged(true);
  };

  return (
    <div className="profile-container">
      <Card className="profile-card">
        <div className="profile-header">
          <div className="profile-info">
            <div className="avatar-container">
              <Avatar className="user-avatar" size={80}>
                {userInitial}
              </Avatar>
            </div>
            <div className="user-info">
              <h2 className="user-name">MY ACCOUNT</h2>
              {form.getFieldValue('logins') && (
              <span className="account-badge">
              {form.getFieldValue('firstName')} {form.getFieldValue('lastName')}
            </span>
              )}
            </div>
          </div>
        </div>

        <Form
          form={form}
          onFinish={handleOk}
          onFieldsChange={handleFieldsChange}
          layout="vertical"
          className="profile-form"
        >
          <Tabs
            activeKey={activeTab}
            onChange={(key) => setActiveTab(key)}
            defaultActiveKey="1"
            type="card"
            className="profile-tabs"
          >
            <Tabs.TabPane tab="Personal Info" key="1">
              <Row gutter={24}>
                <Col span={12}>
                  <Form.Item
                    name="firstName"
                    label="First Name"
                    className="form-item"
                    rules={[
                      { required: true, message: 'Please enter your first name.' },
                      {
                        validator: (_, value) => {
                          if (!value) return Promise.resolve();
                          const regex = /^[A-Z][a-z]*$/;
                          return regex.test(value)
                            ? Promise.resolve()
                            : Promise.reject(
                                'First letter must be uppercase, followed by lowercase letters.',
                              );
                        },
                      },
                    ]}
                  >
                    <Input
                      placeholder="John"
                      readOnly={!isEditing}
                      className="form-input"
                      onChange={(e) => {
                        let value = e.target.value.replace(/[<>]/g, '');
                        value = value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
                        form.setFieldValue('firstName', value);
                      }}
                    />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    name="lastName"
                    label="Last Name"
                    className="form-item"
                    rules={[
                      { required: true, message: 'Please enter your last name.' },
                      {
                        validator: (_, value) => {
                          if (!value) return Promise.resolve();
                          const regex = /^[A-Z][a-z]*$/;
                          return regex.test(value)
                            ? Promise.resolve()
                            : Promise.reject(
                                'First letter must be uppercase, followed by lowercase letters.',
                              );
                        },
                      },
                    ]}
                  >
                    <Input
                      placeholder="Doe"
                      readOnly={!isEditing}
                      className="form-input"
                      onChange={(e) => {
                        let value = e.target.value.replace(/[<>]/g, '');
                        value = value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
                        form.setFieldValue('lastName', value);
                      }}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={24}>
                <Col span={12}>
                  <Form.Item
                    name="email"
                    label="Email"
                    className="form-item"
                    rules={[
                      { required: true, message: 'Please enter your email.' },
                      { type: 'email', message: 'Please enter a valid email address.' },
                    ]}
                  >
                    <Input
                      placeholder="example@mail.com"
                      readOnly={!isEditing}
                      className="form-input"
                      prefix={<span className="input-icon">✉️</span>}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="phone"
                    label="Phone"
                    className="form-item"
                    rules={[{ required: true, message: 'Please enter your phone number.' }]}
                  >
                    <Input
                      placeholder="Phone Number"
                      readOnly={!isEditing}
                      className="form-input"
                      prefix={<span className="input-icon">📞</span>}
                      onKeyPress={(e) => {
                        if (!/^\d$/.test(e.key)) {
                          e.preventDefault();
                        }
                      }}
                      onPaste={(e) => {
                        const pastedText = e.clipboardData.getData('Text');
                        if (!/^\d+$/.test(pastedText) || pastedText.length > 10) {
                          e.preventDefault();
                        }
                      }}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={24}>
                <Col span={12}>
                  <Form.Item
                    name="password"
                    label="Portal Password"
                    className="form-item"
                    rules={[
                      { required: true, message: 'Please enter your password.' },
                      {
                        pattern:
                          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/,
                        message: 'Password must be strong!',
                      },
                    ]}
                  >
                    <Input.Password
                      placeholder="••••••••"
                      readOnly={true}
                      className="form-input"
                      style={{ backgroundColor: '#f5f5f5' }}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Tabs.TabPane>

            <Tabs.TabPane tab="Mt5 Accounts" key="2">
              <Row gutter={24}>
                <Col span={12}>
                  <Form.Item
                    name="logins"
                    label="MT5 Account"
                    className="form-item"
                    rules={[{ required: true, message: 'MT5 Account is required.' }]}
                  >
                    <Input disabled className="form-input" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="masterPassword"
                    label="Master Password"
                    className="form-item"
                    rules={[{ required: true, message: 'Master Password is required.' }]}
                  >
                    <Input.Password 
                      className="form-input"
                      readOnly={true}
                      style={{ backgroundColor: '#f5f5f5' }}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={24}>
                <Col span={12}>
                  <Form.Item
                    name="investorPassword"
                    label="Investor Password"
                    className="form-item"
                    rules={[{ required: true, message: 'Investor Password is required.' }]}
                  >
                    <Input.Password 
                      className="form-input"
                      readOnly={true}
                      style={{ backgroundColor: '#f5f5f5' }}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Tabs.TabPane>

            <Tabs.TabPane tab="Additional Info" key="3">
              <Row gutter={24}>
                <Col span={12}>
                  <Form.Item
                    name="promo"
                    label="Promo Code"
                    className="form-item"
                    rules={[{ required: true, message: 'Please enter your promo code.' }]}
                  >
                    <Input disabled className="form-input" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="region"
                    label="Region"
                    className="form-item"
                    rules={[{ required: true, message: 'Please select your country.' }]}
                  >
                    <Select
                      placeholder="Select Country"
                      disabled={!isEditing}
                      showSearch
                      optionFilterProp="children"
                      className="form-select"
                      prefix={<span className="input-icon">🌎</span>}
                    >
                      {[
                        'United Arab Emirates',
                        'USA',
                        'India',
                        'United Kingdom',
                        'Australia',
                        'France',
                        'Germany',
                        'Japan',
                        'China',
                        'Russia',
                      ].map((country) => (
                        <Select.Option key={country} value={country}>
                          {country}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            </Tabs.TabPane>
          </Tabs>

          <Divider className="form-divider" />
          <div className="form-actions">
            {isEditing && (
              <>
                <Button type="button" onClick={handleEditClick} className="action-btn cancel-btn">
                  Cancel
                </Button>
                {activeTab !== '3' && (
                  <Button type="button" onClick={handleNextClick} className="action-btn next-btn">
                    Next
                  </Button>
                )}
                {isFormChanged && activeTab === '3' && (
                  <Button
                    type="submit"
                    htmlType="submit"
                    loading={loading}
                    className="action-btn update-btn"
                  >
                    Update
                  </Button>
                )}
              </>
            )}
            {!isEditing && (
              <Button type="button" onClick={handleEditClick} className="action-btn edit-btn">
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