import React from "react";
import { Button, Form, Input } from 'antd';


const PaymentLink3: React.FC = () => {

    const handleClick=()=>{
    }
    return(
        <>
<Form
    name="wrap"
    labelCol={{ flex: '110px' }}
    labelAlign="left"
    labelWrap
    wrapperCol={{ flex: 1 }}
    colon={false}
    style={{ maxWidth: 600 }}
  >
    <Form.Item label="First Name" name="firstname" rules={[{ required: true }]}>
      <Input />
    </Form.Item>

    <Form.Item label="Last Name" name="lastname" rules={[{ required: true }]}>
      <Input />
    </Form.Item>
    <Form.Item label="Email Address" name="email" rules={[{ required: true }]}>
      <Input />
    </Form.Item>
    <Form.Item label="Amount" name="amount" rules={[{ required: true }]}>
      <Input />
    </Form.Item>

    <Form.Item label=" ">
      <Button type="primary" htmlType="submit" onClick={handleClick}>
        Submit
      </Button>
    </Form.Item>
  </Form>
        </>
    )
}
 export default PaymentLink3