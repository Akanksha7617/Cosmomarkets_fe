import { api } from '@/components/common/api';
import { Type } from '@/generated';
import { useModel } from '@@/exports';
import {
  ProDescriptions,
  ProForm,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { history } from '@umijs/max';
import { Card, ConfigProvider, Form, message } from 'antd';
import enUS from 'antd/lib/locale/en_US';
import React, { useEffect, useState } from 'react';
import { flushSync } from 'react-dom';
import '../../../common.css';

enum Status {
  Requested = 'Requested',
  Approved = 'Approved',
  Rejected = 'Rejected',
  Completed = 'Completed',
  Cancelled = 'Cancelled',
  NOT_REQUESTED = 'NOT_REQUESTED',
  REJECTED = 'REJECTED',
  APPROVED = 'APPROVED',
  REQUESTED = 'REQUESTED',
}

enum Type1 {
  ExtToWallet = 'ExtToWallet',
  WalletToExt = 'WalletToExt',
  WalletToMt = 'WalletToMt',
  MtToWallet = 'MtToWallet',
  EXT_TO_WALLET = 'EXT_TO_WALLET',
  WALLET_TO_EXT = 'WALLET_TO_EXT',
  MT_TO_WALLET = 'MT_TO_WALLET',
}

type LoginFreeMargin = {
  login: string;
  freeMargin: number;
};

const DepositTransferCommon: React.FC<{
  title: string;
  type: Type;
  successMsg: String;
  failureMsg: string;
}> = ({ title, type, successMsg, failureMsg }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { initialState, setInitialState } = useModel('@@initialState');
  const [mtLogins, setMtLogins] = useState<string[]>([]);
  const [loginToFreeMargin, setLoginToFreeMargin] = useState<LoginFreeMargin[]>([]);
  const [freeMargin, setFreeMargin] = useState<number>(0);
  const [balance, setBalance] = useState(initialState?.currentUser?.wallet?.balance || 0);

  useEffect(() => {
    init().then();
  }, []);

  async function init() {
    const userResponse = await api.app.getMe();
    const logins = userResponse.userDtos?.map((u) => u.login?.toString() || '') || [];
    const loginToFreeMargin =
      userResponse.userDtos?.map((u) => {
        const login = u.login?.toString() || '';
        const fm = u.marginFree || 0;
        return { login: login, freeMargin: fm };
      }) || [];
    setLoginToFreeMargin(loginToFreeMargin);
    setMtLogins(loginToFreeMargin.map((l) => l.login));
    console.log('=======>' + mtLogins);
  }

  const onFinish = async (values: any) => {
    setLoading(true);

    try {
      const response = await api.transaction.putTransaction({
        ...values,
        type: type,
        comment: 'Deposit',
        currency: 'USD',
        PaymentMethod: 'MT5 transaction',
      });
      console.log('put transaction', response);
      console.log(response.message);
      if (response.message != 'User does not have enough wallet balance!') {
        await fetchUserInfo();
        form.resetFields();
        message.success(successMsg);
        history.push('/finops/transaction_history');
        return;
      } else {
        message.error(failureMsg);
      }
    } catch (error) {
      // message.error(failureMsg);
    } finally {
      setLoading(false);
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

  const handleSelectChange = async (value: any) => {
    const foundEntry = loginToFreeMargin.find((entry) => entry.login === value);
    setFreeMargin(foundEntry?.freeMargin || 0);
  };

  return (
   
    <div className="mt5-parent-class">
      <div className="mt5-card">
        <ConfigProvider locale={enUS}>
          <Card
            title={title}
            headStyle={{
              background: '#f9f7f0',
              textTransform: 'uppercase',
              
            }}
          >
            <ProForm
              onFinish={onFinish}
              onFinishFailed={onFinishFailed}
              layout="vertical"
              labelCol={{ span: 8 }}
              wrapperCol={{ span: 20 }}
              // style={{ maxWidth: 500}}
              initialValues={{ currency: 'USD' }}
              submitter={{}}
            >
              <ProFormSelect
                name="login"
                label="MT5 Account"
                placeholder="Please Select Account"
                options={mtLogins}
                rules={[{ required: true, message: 'Please select a MT5 account' }]}
                fieldProps={{
                  onChange: (e) => {
                    handleSelectChange(e);
                  },
                }}
              />
              <ProDescriptions column={1}>
                <ProDescriptions.Item label="Available Wallet Balance : ">
                  {balance}
                </ProDescriptions.Item>
                {/* Add more ProDescriptions.Item components as needed */}
              </ProDescriptions>

              {type === Type.MT_TO_WALLET ? (
                <ProFormText
                  label="Amount"
                  name="amount"
                  placeholder="Enter Amount"
                  rules={[
                    {
                      required: true,
                      pattern: /^(?!0\d{15,})(\d{1,16})(\.\d{0,2})?$/,
                      message: 'Please input a positive value up to 2 decimal places!',
                    },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        const enteredAmount = parseFloat(value);

                        if (enteredAmount === 0) {
                          return Promise.reject(new Error('Amount cannot be zero!'));
                        }

                        if (enteredAmount <= freeMargin) {
                          return Promise.resolve();
                        }

                        return Promise.reject(
                          new Error(`Must be less than or equal to Free Margin (${freeMargin}) !`),
                        );
                      },
                    }),
                   
                  ]}
                  fieldProps={{
                    addonAfter: 'USD',
                  }}
                />
              ) : (
                <ProFormText
                  label="Amount"
                  placeholder="Amount"
                  name="amount"
                  rules={[
                    {
                      required: true,
                      pattern: /^(?!0\d{15,})(\d{1,16})(\.\d{0,2})?$/,
                      message: 'Please input a positive value up to 2 decimal places!',
                    },
                  ]}
                  fieldProps={{
                    addonAfter: 'USD',
                  }}
                />
              )}

              <ProFormTextArea
                label="Comment"
                name="comment"
                placeholder="Comment"
                rules={[{ required: true, message: 'Please input comment!' }]}
              />
            </ProForm>
          </Card>
        </ConfigProvider>
      </div>
      {/* <div className="mt5-img-class">
        <img src="\images\step.png" alt="" width={'100%'} height={350} />
      </div> */}
    </div>
  );
};

export { DepositTransferCommon, Status, Type1 };
