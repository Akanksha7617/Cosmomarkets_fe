import React, {useState} from 'react';
import {Popconfirm, Form, Input} from 'antd';

interface TextPopconfirmProps {
  onConfirm: (text: string, amount?: number) => void;
  initText: string,
  initAmount?: number,
  children: React.ReactNode;
}

const TextPopconfirm: React.FC<TextPopconfirmProps> = ({onConfirm, initText, initAmount, children}) => {
  const [form] = Form.useForm();
  const [open, setOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const handleFinish = () => {
    form
      .validateFields()
      .then(values => {
        onConfirm(values.text, parseInt(values.amount));
        setOpen(false)
      })
      .catch(() => {
      });
  };

  const handleCancel = () => {
    setOpen(false);
  }

  return (
    <Popconfirm
      //open={open}
      title={
        <Form form={form} onFinish={handleFinish} initialValues={{text: initText, amount: initAmount}}
              layout={"vertical"}
        >
          <Form.Item
            label={'Comment'}
            name="text"
            rules={[
              {
                required: true,
                message: 'Comment is required',
              },
            ]}
          >
            <Input.TextArea placeholder="Enter text"/>
          </Form.Item>
          {initAmount &&
            <Form.Item name="amount" label="Amount"  rules={[{
              required: true,
              pattern: /^(?!0\d{15,})(\d{1,16})(\.\d{0,2})?$/,
              message: 'Please input a positive value up to 2 decimal places!'
            }]}>
              <Input addonAfter="USD"/>
            </Form.Item>
          }

        </Form>
      }
      onConfirm={handleFinish}
      onCancel={handleCancel}
      //cancelButtonProps={{ style: { display: 'none' } }}
      trigger="click"
    >
      <div onClick={() => setOpen(true)}>{children}</div>
    </Popconfirm>
  );
};

export {TextPopconfirm};
