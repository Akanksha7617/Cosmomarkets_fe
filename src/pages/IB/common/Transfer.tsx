import React, {useState} from 'react';
import {Button, Card, Form, Input, InputNumber, message} from "antd";
import {flushSync} from "react-dom";
import {useModel} from "@@/exports";
import {api} from "@/components/common/api";
import "./common.css"

enum Status {
  Requested= 'Requested',
  Approved= 'Approved',
  Rejected= 'Rejected',
  Completed= 'Completed',
  Cancelled= 'Cancelled',
};

enum Type {
  ExtToWallet = "ExtToWallet",
  WalletToExt = "WalletToExt",
  WalletToMt = "WalletToMt",
  MtToWallet = "MtToWallet"
}
const Transfer: React.FC<
  { title: string,  type:Type, successMsg:String, failureMsg:string }> =
  ({ title, type, successMsg,failureMsg }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false)
  const {initialState, setInitialState} = useModel('@@initialState');

  const onFinish = async (values: any) => {
    setLoading(true)
    try {
      const response = await api.transaction.putTransaction({
        ...values,
        type:type
      })
      await fetchUserInfo()
      form.resetFields();
      message.success(successMsg);
    } catch (error) {
      message.error(failureMsg);
    }finally {
      setLoading(false)
    }
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);
  };

  const fetchUserInfo = async () => {
    const userInfo = await initialState?.fetchUserInfo?.();
    if (userInfo) {
      flushSync(() => {
        setInitialState((s) => ({
          ...s,
          currentUser: userInfo,
        }));
      });
    }
  };

  return (
    <Card title={title}>
      <Form
        form={form}
        initialValues={{currency: "USD"}}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        //layout={'inline'}
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        style={{ maxWidth: 500 }}
      >
        <Form.Item
          label="Amount"
          name="amount"
          rules={[{
            required: true,
            pattern: /^(?!0\d{15,})(\d{1,16})(\.\d{0,2})?$/,
            message: 'Please input a positive value up to 2 decimal places!'
          }]}
        >
          <InputNumber addonAfter={<Form.Item name="currency" noStyle>USD</Form.Item>} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          label="Comment"
          name="comment"
          rules={[{required: true, message: 'Please input comment!'}]}
        >
          <Input/>
        </Form.Item>

        <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
          <Button type="primary" htmlType="submit" loading={loading}>
            Submit
          </Button>
        </Form.Item>
      </Form>
    </Card>
  )
}

export {Transfer, Status, Type};
