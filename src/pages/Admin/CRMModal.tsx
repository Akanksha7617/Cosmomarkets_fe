import { api } from '@/components/common/api';
import { MailTwoTone } from '@ant-design/icons';
import { Button, Form, Input, message as antMessage, Modal, Tabs } from 'antd';
import React, { useState } from 'react';
import '../../crm-components.css';
import BalanceManagementTsx from './BalanceManagement';
import CRMProcess from './CRMProcess';
import CustomEmailForm from './CustomEmailForm';
import GroupManagementTsx from './GroupManagement';

// Use this import if you're using Ant Design v4.x
// const { TabPane } = Tabs;

// If using Ant Design v5.x, TabPane is deprecated
// and we use the items prop instead

interface CRMModalProps {
  visible: boolean;
  onCancel: () => void;
  userData: any;
  serverConfig?: any;
  serverName?: string;
}

const CRMModal: React.FC<CRMModalProps> = ({
  visible,
  onCancel,
  userData,
  serverConfig = { server: 'default' },
  serverName = 'Default',
}) => {
  const [activeTab, setActiveTab] = useState('1');
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // Handle operation completion messages from child components
  const handleOperationComplete = (success: boolean, msg: string) => {
    if (success) {
      antMessage.success(msg);
    } else {
      antMessage.error(msg);
    }
  };

  // Handle modal closure
  const handleClose = () => {
    setActiveTab('1');
    onCancel();
  };

  // Handle refresh after operations
  const handleRefresh = () => {
    handleClose();
  };

  // Handle email sending
  const handleSendEmail = async () => {
    try {
      setLoading(true);

      const values = await form.validateFields();
      const response = await api.app.sendCustomEmail({
        email: values.email,
        subject: values.subject,
        message: values.message,
      });

      if (response) {
        antMessage.success('Email sent successfully');
        form.resetFields();
      } else {
        antMessage.error(response?.message || 'Failed to send email');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      antMessage.error('Failed to send email');
    } finally {
      setLoading(false);
    }
  };

  // Tabs configuration
  const tabItems = [
    {
      key: '1',
      label: (
        <span>
          <i className="fas fa-cogs mr-2"></i>CRM Process
        </span>
      ),
      children: (
        <CRMProcess
          onOperationComplete={handleOperationComplete}
          userData={userData}
          onRefresh={handleRefresh}
        />
      ),
    },
    {
      key: '2',
      label: (
        <span>
          <i className="fas fa-wallet mr-2"></i>Balance Management
        </span>
      ),
      children: (
        <BalanceManagementTsx
          isConnected={true}
          serverConfig={serverConfig}
          serverName={serverName}
          onOperationComplete={handleOperationComplete}
          userData={userData}
        />
      ),
    },
    {
      key: '3',
      label: (
        <span>
          <i className="fas fa-users-cog mr-2"></i>Group Management
        </span>
      ),
      children: (
        <GroupManagementTsx
          isConnected={true}
          serverConfig={serverConfig}
          serverName={serverName}
          onOperationComplete={handleOperationComplete}
          userData={userData}
        />
      ),
    },

    {
      key: '4',
      label: (
        <span>
          <i className="fas fa-envelope mr-2"></i>Email
        </span>
      ),
      children: (
        <div className="email-tab-content">
          <Form form={form} layout="vertical" onFinish={handleSendEmail}>
            <Form.Item
              name="email"
              label="Email"
              initialValue={userData?.email || ''}
              rules={[
                { required: true, message: 'Please enter email address' },
                { type: 'email', message: 'Please enter a valid email' },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="subject"
              label="Subject"
              rules={[{ required: true, message: 'Please enter email subject' }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="message"
              label="Message"
              rules={[{ required: true, message: 'Please enter email content' }]}
            >
              <Input.TextArea rows={6} />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                style={{ backgroundColor: '#1e4f6a' }}
              >
                Send Email
              </Button>
            </Form.Item>
          </Form>
        </div>
      ),
    },
    {
      key: '5',
      label: (
        <span>
          <MailTwoTone />
          Custom Email
        </span>
      ),
      children: (
        <CustomEmailForm userData={userData} onOperationComplete={handleOperationComplete} />
      ),
    },
  ];

  return (
    <Modal
      title="CRM Management"
      open={visible}
      onCancel={handleClose}
      width={800}
      footer={null}
      destroyOnClose
      className="crm-modal"
    >
      {/* For Ant Design v5.x with items prop */}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        type="card"
        className="crm-tabs"
        items={tabItems}
      />

      {/* For Ant Design v4.x with TabPane approach
      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab}
        type="card"
        className="crm-tabs"
      >
        <TabPane 
          tab={<span><i className="fas fa-cogs mr-2"></i>CRM Process</span>}
          key="1"
        >
          <CRMProcess 
            onOperationComplete={handleOperationComplete}
            userData={userData}
            onRefresh={handleRefresh}
          />
        </TabPane>
        
        <TabPane 
          tab={<span><i className="fas fa-users-cog mr-2"></i>Group Management</span>}
          key="2"
        >
          <GroupManagementTsx 
            isConnected={true} 
            serverConfig={serverConfig}
            serverName={serverName}
            onOperationComplete={handleOperationComplete}
            userData={userData}
          />
        </TabPane>
        
        <TabPane 
          tab={<span><i className="fas fa-wallet mr-2"></i>Balance Management</span>}
          key="3"
        >
          <BalanceManagementTsx 
            isConnected={true}
            serverConfig={serverConfig}
            serverName={serverName}
            onOperationComplete={handleOperationComplete}
            userData={userData}
          />
        </TabPane>
        
        <TabPane 
          tab={<span><i className="fas fa-envelope mr-2"></i>Email</span>}
          key="4"
        >
          <div className="email-tab-content">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSendEmail}
            >
              <Form.Item
                name="email"
                label="Email"
                initialValue={userData?.email || ''}
                rules={[
                  { required: true, message: 'Please enter email address' },
                  { type: 'email', message: 'Please enter a valid email' }
                ]}
              >
                <Input />
              </Form.Item>
              
              <Form.Item
                name="subject"
                label="Subject"
                rules={[{ required: true, message: 'Please enter email subject' }]}
              >
                <Input />
              </Form.Item>
              
              <Form.Item
                name="message"
                label="Message"
                rules={[{ required: true, message: 'Please enter email content' }]}
              >
                <Input.TextArea rows={6} />
              </Form.Item>
              
              <Form.Item>
                <Button 
                  type="primary" 
                  htmlType="submit"
                  loading={loading}
                  style={{ backgroundColor: '#1e4f6a' }}
                >
                  Send Email
                </Button>
              </Form.Item>
            </Form>
          </div>
        </TabPane>

        <TabPane
          tab={<span><MailTwoTone /><span className="tab-text">Custom Email</span></span>}
          key="5"
        >
          <CustomEmailForm
            userData={userData}
            onOperationComplete={handleOperationComplete}
          />
        </TabPane>
      </Tabs>
      */}
    </Modal>
  );
};

export default CRMModal;
