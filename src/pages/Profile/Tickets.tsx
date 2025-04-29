import React, { useState } from "react";
import { InboxOutlined, UploadOutlined } from '@ant-design/icons';
import {
    Button,
    Checkbox,
    Col,
    Form,
    Input,
    InputNumber,
    Radio,
    Rate,
    Row,
    Select,
    Slider,
    Space,
    Switch,
    Table,
    Upload,
} from 'antd';
import "../../common.css"
 



const { Option } = Select;

const formItemLayout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 20 },
};

const normFile = (e: any) => {
    console.log('Upload event:', e);
    if (Array.isArray(e)) {
        return e;
    }
    return e?.fileList;
};

const onFinish = (values: any) => {
    console.log('Received values of form: ', values);
};

const Tickets: React.FC = () => {

    const [form] = Form.useForm();
    const [visible, setVisible] =useState(false);
    const [dataSource, setDataSource] =useState([]);
    const showModal = () => {
        setVisible(true);
    }

    const columns = [
        {
          title: 'Ticket Type',
          dataIndex: 'ticketType',
          key: 'ticketType',
        },
        {
          title: 'Subject',
          dataIndex: 'subject',
          key: 'subject',
        },
        {
          title: 'Message',
          dataIndex: 'message',
          key: 'message',
        },
      ];

    return (

        <>
        <h2 style={{textAlign:"center"}}>Customer Support</h2>
        <div className="ticket-form">
            <h3>Submit A Ticket</h3>
            <Form
                name="validate_other"
                {...formItemLayout}
                onFinish={onFinish}
                initialValues={{ 'input-number': 3, 'checkbox-group': ['A', 'B'], rate: 3.5 }}
                style={{ maxWidth: 800 }}
                layout="vertical"


            >
                <Form.Item label="Ticket Type"> 
                    <Select placeholder="Please select Ticket Type">
                    <Option value="Common Questions">Common Questions</Option>
                        <Option value="payment">Payments</Option>
                        <Option value="Partnership">Partnership</Option>
                        <Option value="Complaints">Complaints</Option>

                    </Select>
                </Form.Item>
                <Form.Item name="Subject" label="Subject" rules={[{ required: true }]}   {...formItemLayout} >
                    <Input />
                </Form.Item>
                <Form.Item name="Message" label="Message" rules={[{ required: true }]}   {...formItemLayout}>
                <Input.TextArea />
                </Form.Item>

                <Form.Item
                     name="upload"
                     label="Attachment. (Maximum upload file size: 10 MB)"
                    valuePropName="fileList"
                    getValueFromEvent={normFile}
                    style={{width:1200}}
                >
                    <Upload name="logo" action="/upload.do" listType="picture">
                        <Button icon={<UploadOutlined />}>Click to upload</Button>
                    </Upload>
                </Form.Item>


                <Form.Item wrapperCol={{ span: 12, offset: 6 }}>
                    <Space>
                        <Button type="primary" htmlType="submit">
                            Submit
                        </Button>
                        <Button htmlType="reset">reset</Button>
                    </Space>
                </Form.Item>
            </Form>


            <Table dataSource={dataSource} columns={columns} />

        </div></>
    )
}

export default Tickets