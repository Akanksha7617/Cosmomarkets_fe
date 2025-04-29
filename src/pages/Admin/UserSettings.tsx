import React, {useEffect, useState} from 'react';
import {Button, Card, Divider, Form, Input, message, Modal, Select, Space, Switch} from 'antd';
import {PlusOutlined} from '@ant-design/icons';
import {Status, UserSetting} from "@/generated";
import {api} from "@/components/common/api";
import {ProForm, ProFormDigit} from "@ant-design/pro-form";
import {ProFormSelect, ProFormText} from "@ant-design/pro-components";
import { ConfigProvider } from 'antd';
import enUS from 'antd/lib/locale/en_US'; 
import "../../common.css"
const {Option} = Select;

const Settings: React.FC = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [data, setData] = useState<UserSetting[]>([]);
  const [form] = Form.useForm();
  const [card, setCard] = useState({
    name: '',
    url: '',
  });
  const [groupOptions, setGroupOptions] = useState<string[]>([]);
  const [promoOptions, setPromoOptions] = useState<string[]>([]);
  // const [selectedGroup, setSelectedGroup] = useState<string | null>(null);


  useEffect(() => {
    init().then()
  }, []);

  async function init() {
    const data = await api.setting.getUserSettings()
    setData(data);
    const groups = await api.group.getGroup()
    const groupNames = groups.map((g) => g.group || '');
    setGroupOptions(groupNames);

    const promos  = await api.ib.getRequests(Status.APPROVED)
    const promoNames = promos.map((p)=> (p.ibCode + " | " + p.userName))
    promoNames.push("999999 | Default")
    setPromoOptions(promoNames);
  }


  const showModal = () => {
    setModalVisible(true);
  };

  const handleCancel = () => {
    setModalVisible(false);
  };

  const handleFinish = async (values: any) => {
    form.validateFields().then(async (values) => {
      const newCard: UserSetting = {
        name: values.promo.split("|")[0].trim(),
        promo: values.promo,
        group: values.group,
        leverage: values.leverage,
        priority: values.priority
      };
      await api.setting.putUserSettings([newCard])
      form.resetFields();
      setModalVisible(false);
      await init()
    });
  };

  const UserCard: React.FC<{ key: string, userSetting: UserSetting }> = ({userSetting}) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState<boolean>(false)

    useEffect(() => {
      form.setFieldsValue(userSetting)
    }, [])
    const updateUserSetting = async (values: any) => {
      const formValues = form.getFieldsValue();
      const updateCard = { ...formValues, name: formValues.promo.split("|")[0].trim() };
      setLoading(true);
    
      try {
        const response = await api.setting.putUserSettings([updateCard]);
    
        // Success message with custom design
        message.success({
          content: "User setting updated successfully!",
          icon: <span style={{ color: 'green', fontSize: '20px' }}>✔</span>, // Custom success icon
          className: 'custom-success-notification', // Custom class for styling
          duration: 3, // Duration of the message
        });
    
        await init(); // Assuming init() is a function to refresh or re-fetch data
    
      } catch (error) {
        // Error message with custom design
        message.error({
          content: "Failed to update user setting.",
          icon: <span style={{ color: 'red', fontSize: '20px' }}>✘</span>, // Custom error icon
          className: 'custom-error-notification', // Custom class for styling
          duration: 3, // Duration of the message
        });
      } finally {
        setLoading(false);
      }
    };
    

    const deleteUserSetting = async (id: number) => {
      try {
        await api.setting.deleteSetting(id);
    
        // Success message with custom design
        message.success({
          content: "User setting deleted successfully.",
          icon: <span style={{ color: 'green', fontSize: '20px' }}>✔</span>, // Custom success icon
          className: 'custom-success-notification', // Custom class for styling
          duration: 3, // Duration of the message
        });
    
        await init(); // Refresh or re-fetch data after deletion
    
      } catch (error) {
        // Error message with custom design
        message.error({
          content: "Failed to delete user setting.",
          icon: <span style={{ color: 'red', fontSize: '20px' }}>✘</span>, // Custom error icon
          className: 'custom-error-notification', // Custom class for styling
          duration: 3, // Duration of the message
        });
      }
    };
    
    const handleDelete = () => {
      Modal.confirm({
        title: "Confirm Delete",
        content: "Are you sure you want to delete this user setting?",
        onOk: () => deleteUserSetting(userSetting.id || 0),
        okText: "Delete",
        cancelText: "Cancel",
      });
    };
    

    return (<div style={{paddingBottom: 20}}>
      <Card title={`User Mapping ID: ${userSetting.id}`} className='usersettings-card'>
        <ProForm
          form={form}
          onFinish={updateUserSetting}
          layout="vertical"
          submitter={{ render: false }}
        >
          <Form.Item label="ID" name="id" hidden initialValue={0}>
            <Input type="hidden"/>
          </Form.Item>

          <ProFormSelect
            name="promo"
            label="User attracted via promo"
            placeholder="Please Select Promo"
            options={promoOptions}
            rules={[{required: true, message: 'Please select a promo'}]}
          />

          <ProFormSelect
            name="group"
            label="Will go under group"
            options={groupOptions}
            rules={[{required: true, message: 'Please select a group'}]}
          />

          <ProFormDigit
            name="leverage"
            label="Will have leverage"
            rules={[
              { required: true, message: 'Please enter a positive number' },
              { type: 'integer', message: 'Please enter a valid number' },
              { validator: (_, value) => value > 0 ? Promise.resolve() : Promise.reject('Please enter a positive number') },
            ]}
          />
          <Space>
          <Button type="button" className='payment-gatewaybtn' htmlType="submit" loading={loading}>
            {loading ? 'Submitting' : 'Submit'}
          </Button>
          <Button type="button" className='payment-gatewaybtn' onClick={handleDelete}>
            Delete
          </Button>
          </Space>
        </ProForm>

      </Card>
    </div>);
  }

  return ( 
    <div className='user-setting-card-block'>
      <Card style={{width:'100%'}}>
      <Button className='add-new-txt' type="link" icon={<PlusOutlined/>} onClick={showModal}>Add New User Group Mapping</Button>
      </Card>
      <Divider/>
      {/* <Space wrap > */}
      {data.map((p) => (
        <UserCard key={p.name || ''} userSetting={p}/>
      ))}
      {/* </Space> */}
      <ConfigProvider locale={enUS}>

      <Modal
        open={modalVisible}
        footer={null}
        onCancel={handleCancel}
      >
        <ProForm
          form={form}
          onFinish={handleFinish}
          layout="vertical"
        >
          <ProFormSelect
            name="promo"
            label="User attracted via promo"
            placeholder='Please Select Promo'
            options={promoOptions}
            rules={[{required: true, message: 'Please select a promo'}]}
          />

          <ProFormSelect
            name="group"
            label="Will go under group"
            placeholder='Please Select Group'
            options={groupOptions}
            rules={[{required: true, message: 'Please select a group'}]}
          />

          <ProFormDigit
            name="leverage"
            label="Will have leverage"
            placeholder='Please Enter Leverage'
            rules={[
              // { required: true, message: 'Please enter a positive number' },
              { type: 'integer', message: 'Please enter a valid number' },
              { validator: (_, value) => value > 0 ? Promise.resolve() : Promise.reject('Please enter a positive number') },
            ]}
          />

        </ProForm>
      </Modal>
      </ConfigProvider>
    </div>
  );
};

export default Settings;
 