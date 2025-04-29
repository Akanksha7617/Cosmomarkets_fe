import { api } from '@/components/common/api';
import { AccountType, SignUpRequest } from '@/generated';
import { Button, Card, Col, Divider, Form, Input, message, Row, Select, Tabs } from 'antd';
import React, { useEffect, useState } from 'react';
import '../../common.css';

const MyDetails: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isFormChanged, setIsFormChanged] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('1');
  const [isNextAction, setIsNextAction] = useState(false); // New state to track Next action

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
  }

  const handleEditClick = () => {
    setIsEditing(!isEditing);
    if (!isEditing) {
      setIsFormChanged(false); // Reset form change detection when exiting edit mode
    }
  };

  const handleNextClick = () => {
    setIsNextAction(true); // Indicate that the Next button was clicked
    const nextTab = (parseInt(activeTab) + 1).toString();
    setActiveTab(nextTab);
  };

  const handleOk = async () => {
    if (isNextAction) {
      setIsNextAction(false); // Reset the Next action state
      return; // Skip the update logic when Next button is clicked
    }

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
      };

      const response = await api.app.putMe(payload);

      if (response.message.includes('User Details Updated')) {
        message.success({
          content: response.message,
          icon: <span className="orange-success-icon"> ✓ </span>,
          className: 'orange-success-notification',
          duration: 3,
        });
        setIsEditing(false);
        setIsFormChanged(false); // Reset change state after successful update
      } else {
        message.error({
          content: response.message,
          icon: <span className="orange-error-icon"> ✘ </span>,
          className: 'orange-error-notification',
          duration: 3,
        });
      }
      getDetails();
    } catch (error) {
      message.error({
        content: 'An error occurred during the update. Please try again later.',
        icon: <span className="orange-error-icon"> ✘ </span>,
        className: 'orange-error-notification',
        duration: 3,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFieldsChange = () => {
    setIsFormChanged(true); // Mark the form as changed when any field is edited
  };

  return (
    <>
      <div className="btn-at-end">
        {/* <Button type="button" onClick={() => history.push('/dashboard')} className="back-btn">
          Back
        </Button> */}
      </div>
      <Card className="mydetail-card">
        <h2 className="profile-heading">My Account</h2>
        <Form
          form={form}
          onFinish={handleOk}
          onFieldsChange={handleFieldsChange}
          layout="vertical"
          className="profile-form"
        >
          <Tabs
            activeKey={activeTab}
            onChange={(key) => setActiveTab(key)} // Handle tab changes
            defaultActiveKey="1"
            type="card"
          >
            <Tabs.TabPane tab="Personal Info" key="1">
              <Row gutter={16}>
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
                      onChange={(e) => {
                        let value = e.target.value.replace(/[<>]/g, '');
                        value = value.charAt(0).toUpperCase() + value.slice(1).toLowerCase(); // Capitalize first letter
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
                      onChange={(e) => {
                        let value = e.target.value.replace(/[<>]/g, '');
                        value = value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
                        form.setFieldValue('lastName', value);
                      }}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
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
                    <Input placeholder="example@mail.com" readOnly={!isEditing} />
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
                      onKeyPress={(e) => {
                        // Allow only numbers
                        if (!/^\d$/.test(e.key)) {
                          e.preventDefault(); // Prevent non-numeric input
                        }
                      }}
                      onPaste={(e) => {
                        const pastedText = e.clipboardData.getData('Text');
                        if (!/^\d+$/.test(pastedText) || pastedText.length > 10) {
                          e.preventDefault(); // Prevent invalid pasted content
                        }
                      }}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
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
                    <Input.Password placeholder="••••••••" readOnly={!isEditing} />
                  </Form.Item>
                </Col>
              </Row>
            </Tabs.TabPane>

            <Tabs.TabPane tab="Mt5 Accounts" key="2">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="logins"
                    label="MT5 Account"
                    className="form-item"
                    rules={[{ required: true, message: 'MT5 Account is required.' }]}
                  >
                    <Input disabled />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="masterPassword"
                    label="Master Password"
                    className="form-item"
                    rules={[{ required: true, message: 'Master Password is required.' }]}
                  >
                    <Input.Password />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="investorPassword"
                    label="Investor Password"
                    className="form-item"
                    rules={[{ required: true, message: 'Investor Password is required.' }]}
                  >
                    <Input.Password />
                  </Form.Item>
                </Col>
              </Row>
            </Tabs.TabPane>

            <Tabs.TabPane tab="Additional Info" key="3">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="promo"
                    label="Promo Code"
                    className="form-item"
                    rules={[{ required: true, message: 'Please enter your promo code.' }]}
                  >
                    <Input disabled />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="region"
                    label="Region"
                    className="form-item"
                    rules={[{ required: true, message: 'Please select your region.' }]}
                  >
                    <Select
                      placeholder="Select Region"
                      disabled={!isEditing}
                      showSearch
                      optionFilterProp="children"
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
              {/* <Row gutter={16}>
                <Col span={24}>
                  <Form.Item name="isEnabled" valuePropName="checked" className="form-switch">
                    <Switch />
                  </Form.Item>
                </Col>
              </Row> */}
            </Tabs.TabPane>
          </Tabs>

          <Divider />
          <Form.Item className="form-item-container">
            {isEditing && (
              <>
                <Button
                  type="button"
                  onClick={handleEditClick}
                  className="mydetails-btn cancel-btn"
                >
                  Cancel
                </Button>
                {activeTab !== '3' && (
                  <Button
                    type="button"
                    onClick={handleNextClick}
                    className="mydetails-btn next-btn"
                  >
                    Next
                  </Button>
                )}
                {isFormChanged && activeTab === '3' && (
                  <Button
                    type="submit"
                    htmlType="submit"
                    loading={loading}
                    className="mydetails-btn update-btn"
                  >
                    Update
                  </Button>
                )}
              </>
            )}
            {!isEditing && (
              <Button type="button" onClick={handleEditClick} className="mydetails-btn">
                Edit Profile
              </Button>
            )}
          </Form.Item>
        </Form>
      </Card>
    </>
  );
};
export default MyDetails;
