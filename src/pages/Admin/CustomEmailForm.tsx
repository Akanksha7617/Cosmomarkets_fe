import { api } from '@/components/common/api';
import { BankOutlined, LinkOutlined, MailOutlined, WarningOutlined } from '@ant-design/icons';
import { Button, Card, Col, Form, Input, message, Row } from 'antd';
import React, { useEffect, useState } from 'react';

interface CustomEmailFormProps {
  userData: any;
  onOperationComplete?: (success: boolean, message: string) => void;
}

const CustomEmailForm: React.FC<CustomEmailFormProps> = ({
  userData,
  onOperationComplete = () => {},
}) => {
  const [form] = Form.useForm();
  const [marginCallLoading, setMarginCallLoading] = useState(false);
  const [bankDetailsLoading, setBankDetailsLoading] = useState(false);
  const [portalLinkLoading, setPortalLinkLoading] = useState(false);
  const [resetEmailLoading, setResetEmailLoading] = useState(false);

  // Set initial form values when userData changes
  useEffect(() => {
    if (userData) {
      form.setFieldsValue({
        email: userData.email || userData.eMail || '',
        firstName: userData.firstName || userData.name || '',
        lastName: userData.lastName || '',
        login: userData.login || '',
      });
    }
  }, [userData, form]);

  // Function to send Margin Call email
  const sendMarginCallEmail = async () => {
    setMarginCallLoading(true);
    try {
      const values = form.getFieldsValue();
      const response = await api.app.sendMarginCallEmail({
        email: values.email,
        name: values.firstName,
        login: values.login.toString(),
      });

      if (response) {
        message.success('Margin call email sent successfully');
        onOperationComplete(true, 'Margin call email sent successfully');
      } else {
        message.error(response?.message || 'Failed to send margin call email');
        onOperationComplete(false, 'Failed to send margin call email');
      }
    } catch (error) {
      console.error('Error sending margin call email:', error);
      message.error('Error sending margin call email');
      onOperationComplete(false, 'Error sending margin call email');
    } finally {
      setMarginCallLoading(false);
    }
  };

  // Function to send Bank Details email
  const sendBankDetailsEmail = async () => {
    setBankDetailsLoading(true);
    try {
      const values = form.getFieldsValue();
      const response = await api.app.sendBankDetailsEmail({
        email: values.email,
        name: values.firstName,
      });

      if (response) {
        message.success('Bank details email sent successfully');
        onOperationComplete(true, 'Bank details email sent successfully');
      } else {
        message.error(response?.message || 'Failed to send bank details email');
        onOperationComplete(false, 'Failed to send bank details email');
      }
    } catch (error) {
      console.error('Error sending bank details email:', error);
      message.error('Error sending bank details email');
      onOperationComplete(false, 'Error sending bank details email');
    } finally {
      setBankDetailsLoading(false);
    }
  };

  const sendResetPasswordEmail = async () => {
    setResetEmailLoading(true);
    try {
      const values = form.getFieldsValue();
      const response = await api.app.sendResetPasswordEmail({
        email: values.email,
        login: values.login.toString(),
      });

      if (response) {
        message.success('Reset password email sent successfully');
      } else {
        message.error(response?.message || 'Failed to send reset password email');
        onOperationComplete(false, '');
      }
    } catch (error) {
      console.error('Error sending reset password email:', error);
      message.error('Error sending reset password email');
      onOperationComplete(false, '');
    } finally {
      setResetEmailLoading(false);
    }
  };

  // Function to send Portal Link email
  const sendPortalLinkEmail = async () => {
    setPortalLinkLoading(true);
    try {
      const values = form.getFieldsValue();
      const response = await api.app.sendPortalLinkEmail({
        email: values.email,
        name: values.firstName,
      });

      if (response) {
        message.success('Portal link email sent successfully');
        onOperationComplete(true, 'Portal link email sent successfully');
      } else {
        message.error(response?.message || 'Failed to send portal link email');
        onOperationComplete(false, 'Failed to send portal link email');
      }
    } catch (error) {
      console.error('Error sending portal link email:', error);
      message.error('Error sending portal link email');
      onOperationComplete(false, 'Error sending portal link email');
    } finally {
      setPortalLinkLoading(false);
    }
  };

  return (
    <Card className="custom-email-form">
      <Form form={form} layout="vertical">
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: 'Please enter email address' },
                { type: 'email', message: 'Please enter a valid email' },
              ]}
            >
              <Input prefix={<MailOutlined />} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="login"
              label="MT Login"
              rules={[{ required: true, message: 'Login is required' }]}
            >
              <Input disabled />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="firstName"
              label="First Name"
              rules={[{ required: true, message: 'First name is required' }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="lastName" label="Last Name">
              <Input />
            </Form.Item>
          </Col>
        </Row>

        <div className="email-buttons-container">
          <h4>Send Email Template:</h4>
          <Row gutter={16}>
            <Col span={5}>
              <Button
                type="primary"
                onClick={sendMarginCallEmail}
                icon={<WarningOutlined />}
                loading={marginCallLoading}
                block
              >
                Margin Call
              </Button>
            </Col>
            <Col span={5}>
              <Button
                type="primary"
                onClick={sendBankDetailsEmail}
                icon={<BankOutlined />}
                loading={bankDetailsLoading}
                block
              >
                Bank Details
              </Button>
            </Col>
            <Col span={5}>
              <Button
                type="primary"
                onClick={sendPortalLinkEmail}
                icon={<LinkOutlined />}
                loading={portalLinkLoading}
                block
              >
                Portal Link
              </Button>
            </Col>
            <Col span={5}>
              <Button
                type="primary"
                onClick={sendResetPasswordEmail}
                icon={<MailOutlined />}
                loading={resetEmailLoading}
                block
              >
                Reset Email
              </Button>
            </Col>
          </Row>
        </div>
      </Form>
    </Card>
  );
};

export default CustomEmailForm;
