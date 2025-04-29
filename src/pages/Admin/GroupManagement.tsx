import React, { useState, useEffect, useRef } from 'react';
import { Form, Button, Card, Row, Col, Input, Select, Badge, Spin, Empty } from 'antd';
import { SearchOutlined, UserOutlined, CheckCircleOutlined, SwapOutlined } from '@ant-design/icons';
import { api } from '@/components/common/api';

const { Option } = Select;

interface GroupManagementProps {
  isConnected?: boolean; // Made optional since we're not using it
  serverConfig?: any;
  serverName?: string;
  onOperationComplete: (success: boolean, message: string) => void;
  userData?: any;
}

interface FormData {
  login: string;
  newGroup: string;
}

interface UserInfo {
  name?: string;
  email?: string;
  group?: string;
  balance?: number;
  [key: string]: any;
}

const GroupManagementTsx: React.FC<GroupManagementProps> = ({ 
  serverName = '', 
  onOperationComplete,
  userData = {}
}) => {
  const [form] = Form.useForm();
  const [formData, setFormData] = useState<FormData>({
    login: userData?.login || '',
    newGroup: ''
  });
  
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingUser, setLoadingUser] = useState<boolean>(false);
  const [loadingGroups, setLoadingGroups] = useState<boolean>(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [allGroups, setAllGroups] = useState<string[]>([]);
  const [filteredGroups, setFilteredGroups] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Handle clicking outside dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  // Set login from userData if available and load groups
  useEffect(() => {
    if (userData && userData.login) {
      setFormData(prev => ({
        ...prev,
        login: userData.login
      }));
      form.setFieldsValue({ login: userData.login });
      handleLookupUser();
    }
    
    fetchAllGroups();
  }, [userData]);
  
  // Fetch all available groups
  const fetchAllGroups = async () => {
    setLoadingGroups(true);
    try {
      const response = api.app.getGroups();
      const data = await response;
      console.log('Fetched groups:', data);
      if (data) {
        // Extract group names from response
        const groups = data.map((item: any) => item.group);
        setAllGroups(groups);
        setFilteredGroups(groups);
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
      // Just log the error without notification
    } finally {
      setLoadingGroups(false);
    }
  };
  
  // Handle login input change
  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFormData(prev => ({ ...prev, login: value }));
    form.setFieldsValue({ login: value });
    // Clear user info when login changes
    setUserInfo(null);
  };
  
  // Handle lookup user button click
  const handleLookupUser = async () => {
    const loginValue = form.getFieldValue('login');
    if (!loginValue) return;
    
    setLoadingUser(true);
    try {
      const response = await api.app.getGroupById(loginValue);
      if (!response.data) {
        onOperationComplete(false, 'User not found: Invalid response from server');
        return;
      }
      
      setUserInfo({
        name: response.data.firstName || 'N/A',
        email: response.data.eMail || 'N/A',
        group: response.data.group || 'N/A',
        balance: 0, 
        ...response.data
      });
    } catch (error) {
      console.error('Error looking up user:', error);
      onOperationComplete(false, `Failed to lookup user: ${error.message}`);
    } finally {
      setLoadingUser(false);
    }
  };
  
  // Handle Enter key press in login field
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && formData.login && !loadingUser) {
      e.preventDefault();
      handleLookupUser();
    }
  };
  
  // Handle dropdown search
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    
    if (term.trim() === '') {
      setFilteredGroups(allGroups);
    } else {
      const filtered = allGroups.filter(group => 
        group.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredGroups(filtered);
    }
  };
  
  // Handle group selection from dropdown
  const handleGroupSelect = (group: string) => {
    setFormData(prev => ({ ...prev, newGroup: group }));
    form.setFieldsValue({ newGroup: group });
    setSearchTerm('');
    setShowDropdown(false);
  };
  
  // Handle form submission
  const handleSubmit = async (values: any) => {
    // Check if a new group was selected
    if (!values.newGroup) {
      onOperationComplete(false, 'Please select a new group.');
      return;
    }
    
    setLoading(true);

    const formData = {
      login: values.login,
      newGroup: values.newGroup,
    };
    
    try {
      // Call the change group API
      const response = await api.app.changeGroup(formData);
      if (response) {
        onOperationComplete(true, `Successfully changed group for login ${values.login} to ${values.newGroup}`);
        
        // Update user info to reflect new group
        setUserInfo(prev => prev ? {
          ...prev,
          group: values.newGroup
        } : null);
        
        // Reset newGroup after successful operation
        form.setFieldsValue({ newGroup: '' });
        setFormData(prev => ({ ...prev, newGroup: '' }));
      } else {
        onOperationComplete(false, `Failed to change group`);
      }
    } catch (error) {
      console.error('Group change error:', error);
      onOperationComplete(false, `Failed to change group: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="group-management-card">
      <Card.Meta
        title={
          <div className="card-title-container">
            <UserOutlined className="icon-primary" />
            <span>Change User Group</span>
            {serverName && <div className="server-badge">{serverName}</div>}
          </div>
        }
        style={{ marginBottom: 16 }}
      />
      
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          login: userData?.login || ''
        }}
      >
        {/* Login ID with lookup button */}
        <div className="search-user-section">
          <Form.Item
            label="Find User by Login ID"
            name="login"
            rules={[{ required: true, message: 'Login ID is required' }]}
          >
            <Input
              type="number"
              placeholder="Enter user login ID"
              onChange={handleLoginChange}
              onKeyDown={handleKeyDown}
              prefix={<SearchOutlined />}
              suffix={
                <Button 
                  type="primary"
                  onClick={handleLookupUser}
                  loading={loadingUser}
                  size="small"
                >
                  Lookup
                </Button>
              }
            />
          </Form.Item>
          <div className="form-help-text">
            Enter the MT5 account login ID and click Lookup to find user details
          </div>
        </div>
        
        {/* Display current user info if available */}
        {userInfo && (
          <div className="user-info-card">
            <div className="user-info-header">
              <UserOutlined style={{ marginRight: 8 }} />
              User Information
            </div>
            <div className="user-info-body">
              <Row gutter={16}>
                <Col span={12}>
                  <div className="info-item">
                    <div className="info-label">Login ID:</div>
                    <div className="info-value">{userInfo.login || "N/A"}</div>
                  </div>
                  <div className="info-item">
                    <div className="info-label">Name:</div>
                    <div className="info-value">{userInfo.firstName || userInfo.name || "N/A"}</div>
                  </div>
                </Col>
                <Col span={12}>
                  <div className="info-item">
                    <div className="info-label">Email:</div>
                    <div className="info-value">{userInfo.eMail || userInfo.email || "N/A"}</div>
                  </div>
                  <div className="info-item">
                    <div className="info-label">Group:</div>
                    <div className="info-value">
                      <Badge color="blue" text={userInfo.group || "N/A"} />
                    </div>
                  </div>
                </Col>
              </Row>
            </div>
          </div>
        )}
        
        {/* Group selector with dropdown */}
        {userInfo && (
          <div className="group-selection-section" ref={dropdownRef}>
            <Form.Item
              label="Select New Group"
              name="newGroup"
            >
              <Input
                placeholder="Search for a group..."
                value={searchTerm}
                onChange={handleSearchChange}
                onClick={() => setShowDropdown(true)}
                suffix={
                  <Button 
                    type="text"
                    onClick={() => setShowDropdown(!showDropdown)}
                    icon={loadingGroups ? <Spin size="small" /> : null}
                  >
                    {showDropdown ? "▲" : "▼"}
                  </Button>
                }
              />
            </Form.Item>
            
            {showDropdown && (
              <div className="groups-dropdown">
                {filteredGroups.length > 0 ? (
                  <div className="groups-list">
                    {filteredGroups.map((group, index) => (
                      <div 
                        key={index} 
                        className="group-item"
                        onClick={() => handleGroupSelect(group)}
                      >
                        {group}
                      </div>
                    ))}
                  </div>
                ) : (
                  <Empty description="No matching groups found" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                )}
              </div>
            )}
          </div>
        )}
        
        {/* Selected group display */}
        {formData.newGroup && (
          <div className="selected-group-card">
            <div className="selected-group-header">
              <CheckCircleOutlined style={{ marginRight: 8 }} />
              Selected Group
            </div>
            <div className="selected-group-body">
              <Badge color="green" text={formData.newGroup} />
              <Button 
                type="text"
                onClick={() => {
                  setFormData(prev => ({ ...prev, newGroup: '' }));
                  form.setFieldsValue({ newGroup: '' });
                }}
                size="small"
              >
                ×
              </Button>
            </div>
            <div className="selected-group-footer">
              <div className="group-change-preview">
                <div className="from-group">{userInfo?.group || "N/A"}</div>
                <SwapOutlined style={{ margin: '0 16px' }} />
                <div className="to-group">{formData.newGroup}</div>
              </div>
            </div>
          </div>
        )}
        
        {/* Submit button */}
        <Form.Item>
          <Button 
            type="primary"
            htmlType="submit"
            loading={loading}
            block
            disabled={loading || !formData.login || !formData.newGroup || !userInfo}
          >
            Change Group
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default GroupManagementTsx;