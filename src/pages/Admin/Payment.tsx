import { useState, useEffect } from 'react';
import { Card, Modal, Form, Input, Button, Select, Switch, message, Divider, Space } from 'antd';
import { DeleteColumnOutlined, DeleteFilled, PlusOutlined } from '@ant-design/icons';
import { ColumnType } from "antd/es/table";
import { PaymentSetting } from "@/generated";
import { api } from "@/components/common/api";
import "../../common.css"
import { ConfigProvider } from 'antd';
import enUS from 'antd/lib/locale/en_US'; 

const { Option } = Select;

const Settings: React.FC = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [data, setData] = useState<PaymentSetting[]>([]);
  const [form] = Form.useForm();
  const [card, setCard] = useState({
    name: '',
    url: '',
  });

  useEffect(() => {
    init().then()
  }, []);

  async function init() {
    const data = await api.setting.getPaymentSettings()
    setData(data);
  }

  const showModal = () => {
    setModalVisible(true);
  };

  const handleCancel = () => {
    setModalVisible(false);
  };

  const addPaymentSetting = async () => {
    console.log("addPaymentSetting")
    form.validateFields().then(async (values) => {
      const newCard: PaymentSetting = {
        id: 0,
        name: values.name,
        url: values.url,
        limit: values.limit,
        isActive: true,
        remainingLimit:values.limit
      };
      console.log(newCard)
      await api.setting.putPaymentSetting([newCard])
      form.resetFields();
      setModalVisible(false);
      await init()
    });
  };

  const PaymentCard: React.FC<{ key: string, paymentSetting: PaymentSetting }> = ({ paymentSetting }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState<boolean>(false)

    useEffect(() => {
      form.setFieldsValue(paymentSetting)
    }, [])
    const updatePaymentSetting = async (values: any) => {
      const formValues = form.getFieldsValue();
      formValues.remainingLimit = formValues.limit;
      setLoading(true);
      try {
        const response = await api.setting.putPaymentSetting([formValues]);
    
        // Success message with custom design
        message.success({
          content: "Payment setting updated successfully.",
          icon: <span style={{ color: 'green', fontSize: '20px' }}>✔</span>, // Custom success icon
          className: 'custom-success-notification', // Custom class for styling
          duration: 3,
        });
    
        await init();
      } catch (error) {
        // Error message with custom design
        message.error({
          content: "Failed to update payment setting.",
          icon: <span style={{ color: 'red', fontSize: '20px' }}>✘</span>, // Custom error icon
          className: 'custom-error-notification',
          duration: 3,
        });
      } finally {
        setLoading(false);
      }
    };
    
    const deletePaymentSetting = async (id: number) => {
      try {
        await api.setting.deleteSetting(id);
    
        // Success message with custom design
        message.success({
          content: "Payment setting deleted successfully.",
          icon: <span style={{ color: 'green', fontSize: '20px' }}>✔</span>,
          className: 'custom-success-notification',
          duration: 3,
        });
    
        await init();
      } catch (error) {
        // Error message with custom design
        message.error({
          content: "Failed to delete payment setting.",
          icon: <span style={{ color: 'red', fontSize: '20px' }}>✘</span>,
          className: 'custom-error-notification',
          duration: 3,
        });
      }
    };
    
    const handleDelete = () => {
      Modal.confirm({
        title: "Confirm Delete",
        content: "Are you sure you want to delete this payment setting?",
        onOk: () => deletePaymentSetting(paymentSetting.id || 0),
        okText: (
          <span className="payment-gatewaybtn" style={{ background: '#08087f', color: 'white' }}>
            Delete
          </span> // Custom style for "Delete" button
        ),
        cancelText: (
          <span style={{ color: '#d32f2f', fontWeight: 'bold' }}>Cancel</span> // Custom style for "Cancel" button
        ),
      });
    };
    

    return (<div style={{ paddingBottom: 20 }}>
      <Card title={`Payment Link ID: ${paymentSetting.id}`} className='payment-card'>
        <Form layout="vertical" form={form} onFinish={updatePaymentSetting}>
          <Form.Item label="ID" name="id" hidden initialValue={123}>
            <Input type="hidden" />
          </Form.Item>
          <div style={{ display: 'flex', marginBottom: 16, columnGap: 16 }}>
            <Form.Item label="Name" name="name">
              <Input  />
            </Form.Item>
            <Form.Item label="URL" name={"url"}>
              <Input  />
            </Form.Item>
          </div>
          <div style={{ display: 'flex', marginBottom: 16}}>
            <Form.Item label="Limit" name={"limit"} style={{ marginRight: 16}}>
              <Input  />
            </Form.Item>
            <Form.Item label="Remaining Limit" name={"remainingLimit"} hidden={true} >
              <Input  />

            </Form.Item>
            <Form.Item label="Active" name={"isActive"} valuePropName="checked">
              <Switch />
            </Form.Item>
          </div>
          {/* <Form.Item label="Remaining Limit" name={"remainingLimit"} style={{ marginRight: 60 }}  rules={[
            {
             type: 'number',
             max: 1000,
             message: 'Amount must not exceed 1000',
    },
  ]}>
              <Input style={{ width: 400 }} />
            </Form.Item> */}
          {/* <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Update
            </Button>
          </Form.Item> */}

          <div style={{ display: 'flex', marginBottom: 16 }}>
            <Form.Item>
              <Button type="button" className='payment-gatewaybtn' htmlType="submit" loading={loading} style={{marginRight:10}} onClick={addPaymentSetting}>
                Update
              </Button>
            </Form.Item>
            <Form.Item>
              <Button type="button" className='payment-gatewaybtn'  onClick={handleDelete}>
                Delete
              </Button>
            </Form.Item>
          </div>
        </Form>
      </Card>
    </div>);
  }

  return (
    <div className='payment-card-block'>
      <Card style={{width:'100%'}}>
      <Button className='add-new-txt' type="link" icon={<PlusOutlined />} onClick={showModal}>Add New Payment Gateway</Button>
      </Card>
      <Divider/>

      {/* <Space wrap> */}
      {data.map((p) => (
        <PaymentCard key={p.name || ''} paymentSetting={p} />
      ))}
      {/* </Space> */}
      <ConfigProvider locale={enUS}>

      <Modal
        title="Add Payment Link"
        open={modalVisible}
        onCancel={handleCancel}
        okText="OK" 
        cancelText="Cancel"
                footer={[
          <Button key="cancel" onClick={handleCancel}>
            Cancel
          </Button>,
          <Button key="submit" type="button" onClick={addPaymentSetting} className='payment-btn'>
            Submit
          </Button>,
        ]}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Name"
           
            rules={[{ required: true, message: 'Please enter a name' }]}
          >
            <Input  placeholder='Please Enter Name' />
          </Form.Item>
          <Form.Item
            name="url"
            label="URL"
            rules={[{ required: true, message: 'Please enter a URL' }]}
          >
            <Input  placeholder='Please Enter Link URL' />
          </Form.Item>
          <Form.Item
            name="limit"
            label="Limit"
            rules={[{ required: true, message: 'Please enter a limit' }]}
          >
            <Input  placeholder='Please Enter Limit' />
          </Form.Item>
        </Form>
      </Modal>
      </ConfigProvider>
    </div>
  );
};

export default Settings;
