// Handle refresh after operations
const handleRefresh = () => {
  handleClose();
};
import { api } from '@/components/common/api';
import { BoldOutlined, ItalicOutlined, MailTwoTone, UploadOutlined } from '@ant-design/icons';
import { Button, Form, Input, message as antMessage, Modal, Space, Tabs, Upload } from 'antd';
import React, { useRef, useState } from 'react';
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
  const [fileList, setFileList] = useState<any[]>([]);
  const [messageContent, setMessageContent] = useState('');
  const editorRef = useRef<HTMLDivElement>(null);

  // Handle operation completion messages from child components
  const handleOperationComplete = (success: boolean, msg: string) => {
    if (success) {
      antMessage.success(msg);
    } else {
      antMessage.error(msg);
    }
  };
 const handleApprovalSuccess = () => {
    setActiveTab('2');
  };
  const handleApprovalGroup = () => {
    setActiveTab('3');
  };
  // Handle modal closure
  const handleClose = () => {
    setActiveTab('1');
    setFileList([]);
    setMessageContent('');
    onCancel();
  };

  // Handle rich text editor content change
  const handleEditorChange = () => {
    if (editorRef.current) {
      const content = editorRef.current.innerHTML;
      setMessageContent(content);
      form.setFieldsValue({ message: content });
    }
  };

  // Handle text formatting with actual bold/italic
  const handleTextFormat = (type: 'bold' | 'italic') => {
    if (!editorRef.current) return;

    editorRef.current.focus();

    if (type === 'bold') {
      document.execCommand('bold', false);
    } else if (type === 'italic') {
      document.execCommand('italic', false);
    }

    handleEditorChange();
  };

  // Handle file upload
  const handleFileUpload = {
    beforeUpload: (file: any) => {
      const isValidType =
        file.type.includes('image/') ||
        file.type.includes('video/') ||
        file.type === 'application/pdf';

      if (!isValidType) {
        antMessage.error('You can only upload image, video, or PDF files!');
        return false;
      }

      const isLt10M = file.size / 1024 / 1024 < 10;
      if (!isLt10M) {
        antMessage.error('File must be smaller than 10MB!');
        return false;
      }

      return false; // Prevent auto upload
    },
    onChange: (info: any) => {
      setFileList(info.fileList);
    },
    onRemove: (file: any) => {
      setFileList((prev) => prev.filter((item) => item.uid !== file.uid));
    },
  };

  // Handle email sending
  const handleSendEmail = async () => {
    try {
      setLoading(true);

      const values = await form.validateFields();

      // Get the rich text content
      const messageHtml = messageContent || '';

      // Prepare form data for file upload
      const formData = new FormData();
      formData.append('email', values.email);
      formData.append('subject', values.subject);
      formData.append('message', messageHtml);

      // Add files to form data
      fileList.forEach((file) => {
        if (file.originFileObj) {
          formData.append('attachments', file.originFileObj);
        }
      });

      const response = await api.app.sendCustomEmail(formData);

      if (response) {
        antMessage.success('Email sent successfully');
        form.resetFields();
        setFileList([]);
        setMessageContent('');
        if (editorRef.current) {
          editorRef.current.innerHTML = '';
        }
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
          onOperationComplete={handleApprovalSuccess}
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
          onOperationComplete={handleApprovalGroup}
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
              rules={[
                {
                  required: true,
                  message: 'Please enter email content',
                  validator: (_, value) => {
                    if (!messageContent.trim()) {
                      return Promise.reject(new Error('Please enter email content'));
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <div>
                <Space style={{ marginBottom: 8 }}>
                  <Button
                    type="text"
                    icon={<BoldOutlined />}
                    onClick={() => handleTextFormat('bold')}
                    title="Bold"
                  />
                  <Button
                    type="text"
                    icon={<ItalicOutlined />}
                    onClick={() => handleTextFormat('italic')}
                    title="Italic"
                  />
                </Space>
                <div
                  ref={editorRef}
                  contentEditable
                  onInput={handleEditorChange}
                  style={{
                    minHeight: '120px',
                    border: '1px solid #d9d9d9',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    fontSize: '14px',
                    lineHeight: '1.5',
                    outline: 'none',
                    backgroundColor: '#fff',
                  }}
                  placeholder="Type your message here. Select text and use the buttons above to format."
                />
              </div>
            </Form.Item>

            <Form.Item label="Attachments">
              <Upload
                {...handleFileUpload}
                fileList={fileList}
                multiple
                accept="image/*,video/*,.pdf"
              >
                <Button icon={<UploadOutlined />}>Upload Files (Image, Video, PDF)</Button>
              </Upload>
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
                rules={[{ 
                  required: true, 
                  message: 'Please enter email content',
                  validator: (_, value) => {
                    if (!messageContent.trim()) {
                      return Promise.reject(new Error('Please enter email content'));
                    }
                    return Promise.resolve();
                  }
                }]}
              >
                <div>
                  <Space style={{ marginBottom: 8 }}>
                    <Button
                      type="text"
                      icon={<BoldOutlined />}
                      onClick={() => handleTextFormat('bold')}
                      title="Bold"
                    />
                    <Button
                      type="text"
                      icon={<ItalicOutlined />}
                      onClick={() => handleTextFormat('italic')}
                      title="Italic"
                    />
                  </Space>
                  <div
                    ref={editorRef}
                    contentEditable
                    onInput={handleEditorChange}
                    style={{
                      minHeight: '120px',
                      border: '1px solid #d9d9d9',
                      borderRadius: '6px',
                      padding: '8px 12px',
                      fontSize: '14px',
                      lineHeight: '1.5',
                      outline: 'none',
                      backgroundColor: '#fff'
                    }}
                    placeholder="Type your message here. Select text and use the buttons above to format."
                  />
                </div>
              </Form.Item>

              <Form.Item label="Attachments">
                <Upload
                  {...handleFileUpload}
                  fileList={fileList}
                  multiple
                  accept="image/*,video/*,.pdf"
                >
                  <Button icon={<UploadOutlined />}>
                    Upload Files (Image, Video, PDF)
                  </Button>
                </Upload>
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
