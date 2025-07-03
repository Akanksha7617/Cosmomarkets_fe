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
  balance: number;
};

const Transfer: React.FC<{ title: string; type: Type; successMsg: String; failureMsg: string }> = ({
  title,
  type,
  successMsg,
  failureMsg,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { initialState, setInitialState } = useModel('@@initialState');
  const [mtLogins, setMtLogins] = useState<string[]>([]);
  const [loginToFreeMargin, setLoginToFreeMargin] = useState<LoginFreeMargin[]>([]);
  const [balance, setbalance] = useState<number>(0);

  useEffect(() => {
    init().then();
  }, []);

  async function init() {
    const userResponse = await api.app.getMe();
    const logins = userResponse.userDtos?.map((u) => u.login?.toString() || '') || [];
    const loginToFreeMargin =
      userResponse.userDtos?.map((u) => {
        const login = u.login?.toString() || '';
        const balance = u.balance || 0; // ✅ use balance instead of marginFree
        return { login, balance };
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
        comment: 'Withdraw',
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

  //    const [balance, setBalance] = useState<number>(0);
  //  /*  const wallet = initialState?.currentUser?.wallet
  //    const balance = `${wallet?.balance?.toFixed(2)} ${wallet?.currency}` */
  //    const onFinish = async (values: any) => {
  //     setLoading(true);
  //     const { amount } = values;

  //    if (amount > balance) {
  //       setLoading(false);
  //       message.error("User does not have enough wallet balance!");
  //       return;
  //     }

  //     try {
  //       await form.validateFields();

  //       console.log("amt", amount);
  //       console.log("bal", balance);

  //       const response = await api.transaction.putTransaction({
  //         ...values,
  //         type: type,
  //         currency: "USD",
  //       });

  //       await fetchUserInfo();
  //       form.resetFields();
  //       message.success(successMsg);
  //       history.push("/finops/transaction_history");
  //     } catch (error) {
  //       console.error(error);
  //       message.error(failureMsg);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

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
    setbalance(foundEntry?.balance || 0);
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
              // style={{ maxWidth: 500 }}
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
                <ProDescriptions.Item label="Balance	">{balance}</ProDescriptions.Item>
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

                        if (enteredAmount <= balance) {
                          return Promise.resolve();
                        }

                        return Promise.reject(
                          new Error(`Must be less than or equal to balance	 (${balance}) !`),
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

export { Transfer, Status, Type1 };
