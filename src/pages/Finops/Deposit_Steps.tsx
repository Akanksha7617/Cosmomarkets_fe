import { ActionType, PageContainer, ProFormText, ProTable } from '@ant-design/pro-components';
import { Button, Card, Checkbox, ConfigProvider, Form, Input, InputNumber, message, Row, Space, theme, Typography, Upload } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import { CalculatorOutlined, PlusOutlined, WalletOutlined } from "@ant-design/icons";
import { api } from "@/components/common/api";
import { flushSync } from "react-dom";
import { Transfer } from "@/pages/Finops/common/Transfer";
import Select, { DefaultOptionType } from 'antd/es/select';
import type { CheckboxChangeEvent } from 'antd/es/checkbox';
import { useModel } from "@@/exports";
import { UploadProps } from "antd/es/upload/interface";
import { PaymentSetting, Type } from "@/generated";
// import { History } from '@umijs/renderer-react';
import '../../common.css'
import { history } from 'umi';



const { Title, Text } = Typography
const { Meta } = Card

const Deposit: React.FC<{check:boolean}> = ({check}) => {

    const { token } = theme.useToken();
    // const [isMt5, setIsMt5] = useState(false)

    const [step1Visible, setStep1Visible] = useState(false)
    const [step2Visible, setStep2Visible] = useState(false)
    const [step3Visible, setStep3Visible] = useState(false)
    const [step4Visible, setStep4Visible] = useState(false)

    const { initialState, setInitialState } = useModel('@@initialState');
    const [balance, setBalance] = useState<number>(0);
    const [paymentData, setPaymentData] = useState<PaymentSetting[]>([]);

    const [amountForm] = Form.useForm();
    const [proofForm] = Form.useForm();
    const [loading, setLoading] = useState<boolean>(false)
    const [idFileList, setIdFileList] = useState<any[]>([])

    

    const normFile = (e: any) => {
        if (Array.isArray(e)) {
            return e;
        }
        return e && e.fileList.slice(-1);
    };

    const fetchUserInfo = async () => {
        const userInfo = await initialState?.fetchUserInfo?.();
        if (userInfo) {
            flushSync(() => {
                setInitialState((s: any) => ({
                    ...s,
                    currentUser: userInfo,
                }));
            });
        }
    };

    const activeStyle = {
        width: '15rem',
        backgroundColor: token.colorBgTextHover,
        transition: "all 0.3s",
        color: token.colorPrimaryHover,
    };

    const onChange = (e: CheckboxChangeEvent) => {
        console.log(`checked = ${e.target.checked}`);
    };


    const inactiveStyle = {
        ...activeStyle,
        transition: "all 0.3s",
        color: token.colorText,
    };

    useEffect(() => {
        init().then()

    }, [])

    async function init() {
        setBalance(initialState?.currentUser?.wallet?.balance || 0)
       // const response = await api.setting.getPaymentSettings()
        //setPaymentData(response)
    }

    function handleOpen() {
        setStep1Visible(true);
        // setIsMt5(false);
        // setStep2Visible(false)
        // setStep3Visible(false)
        // setStep4Visible(false)

    }
    function handleChange() {
        
        setStep2Visible(true)
        // setStep3Visible(false)
        // setStep4Visible(false)

    }
    function handleSubmit() {
        // setStep2Visible(true)
        setStep3Visible(true)
        // setStep4Visible(false)

    }
    function handleClick() {

        console.log("onClick")
        setStep4Visible(true)
    }
    const onFinish = (values: any) => {
        setStep4Visible(true)
        // @ts-ignore
        // window.open(paymentData[0].url, '_blank');
    };

    const onProceed = (values: any) => {
        setLoading(true)
        proofForm.validateFields().then(async (values) => {
            //const formData = new FormData();
            // formData.append('userName', values.userName);
            // formData.append('managerName', values.managerName);

            const idFile = idFileList[0]
            const amount = amountForm.getFieldValue("amount")

            const formData = {
                FormFile: idFile.originFileObj,
                Type: Type.EXT_TO_WALLET,
                Amount: amount,
                Currency: "USD",
                Comment: `Deposit ${amount}`
            };

            await api.transaction.deposit(formData)
            message.success("Requested successfully")
            history.push("/finops/transaction_history")
            init()
        }).catch((e) => console.log(e)).finally(() => {
            message.error("Failed to request deposit")
            setLoading(false)
        });
    };

    const handleIdFileChange = ({ fileList }: any) => {
        setIdFileList(fileList);
    };


    const Steps: React.FC = () => {
       
        handleOpen();
        const actionRef = useRef<ActionType>();

        const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>(['Visa/Master Card']);

        const handleRowSelection = (record: any, selected: boolean) => {
            if (selected) {
                setSelectedRowKeys([record.paymentMethod]);
            } else {
                setSelectedRowKeys([]);
            }
        };

        const data = [
            {
                PaymentMethod: <img src='http://crm.digibits.info/libraries/assets/images/payments/visa-master.png' style={{ height: 40, width: 100 }} />,
                paymentMethod: 'Visa/Master Card',
                description: 'Instant deposit 24/7',
                fundingTime: '24/7 Instant',
                fees: 0,
            },
            {
                PaymentMethod: <img src='http://crm.digibits.info/libraries/assets/images/payments/bankwire.png' style={{ height: 40, width: 100 }} />,
                paymentMethod: 'BankWire',
                description: 'Deposit with 1-24 hours',
                fundingTime: '1-24 hours',
                fees: 0,
            },
            {
                PaymentMethod: <img src='http://crm.digibits.info/libraries/assets/images/payments/bycash.jpeg' style={{ height: 50, width: 80 }} />,
                paymentMethod: 'By Cash',
                description: 'Instant deposit 24/7',
                fundingTime: '24/7 Instant',
                fees: 0,
            },
        ];

        const columns2 = [
            {
                title: 'Payment Method',
                dataIndex: 'paymentMethod',
                key: 'paymentMethod',
            },
            {
                title: 'Description',
                dataIndex: 'description',
                key: 'description',
            },
            {
                title: 'Funding Time',
                dataIndex: 'fundingTime',
                key: 'fundingTime',
            },
            {
                title: 'Fees',
                dataIndex: 'fees',
                key: 'fees',
            },
            {
                title: 'Action',
                key: 'action',
                render: (_: any, record: any) => (
                    <Space size="middle">
                        <Button style={{ backgroundColor: 'navy', color: 'white' }} onClick={handleSubmit}>Selected</Button>
                    </Space>
                ),
            },
        ];



        const props: UploadProps = {
            beforeUpload: (file) => {
                const acceptedFormats = ['image/jpeg', 'image/png', 'application/pdf'];
                if (!acceptedFormats.includes(file.type)) {
                    message.error('Only JPEG/PNG/PDF files are allowed!');
                    return Upload.LIST_IGNORE;
                }
                return true;
            },
            onChange: (info) => {
                console.log(info.fileList);
            },
        };


        function onFinishFailed(errorInfo: ValidateErrorEntity<any>): void {
        }

        return (
            <>

                {
                    step1Visible &&
                    <div className='deposite-img-card-1'>
                        <div className='step1-text'>
                            <Card title="Step 1" extra={<a href="#" style={{ color: 'white', fontSize: '30' }}><b>Select Currency</b></a>} style={{ width: '100%', backgroundColor: '#FA8E21' }}>
                             
                                <Select
                                    onSelect={handleChange}
                                    name='wallet_currency_id' id='wallet_currency_id' className='selectForm form-control' style={{ width: '100%', height: 30, textDecoration: 'none', backgroundColor: 'white' }}>
                                    <option value={0}>USD Available Balance: {balance}</option>
                                    <option value={1}>Select Account</option>
                                </Select>
                            </Card>
                        </div>
                        <div className='image-1'>
                            <img src="\images\step1.png" style={{ height: 300, width: '100%' }} />
                        </div>
                    </div>
                }
               {  console.log("------"+step2Visible)}
                {
                
                    step2Visible &&

                    <>
                    <div className='deposite-img-card-1'>
                    <div className='image-2'>
                       
                       <img src="\images\step2.png" style={{ height: 400, width: '100%' }} />
                   </div>
                   <div className='step2-text'>
                           <Card title="Step 2" extra={<a href="#" style={{ color: 'white', fontSize: '30'}}>
                               <b>Choose Payment Method</b></a>} style={{ width: '100%', backgroundColor: '#FA8E21', }}>
                               <ProTable
                                   headerTitle="Payment Methods"
                                   rowKey="paymentMethod"
                                   columns={columns2}
                                   dataSource={data}
                                   search={false}
                                   options={false}
                                   pagination={false}
                                  
                                   onRow={(record) => ({
                                       onClick: () => handleRowSelection(record, !selectedRowKeys.includes(record.paymentMethod)),
                                   })}
                                   rowClassName={() => 'clickable-row'}
                                   actionRef={actionRef}
                                   tableAlertOptionRender={false}
                                   tableAlertRender={false}
                                   style={{ maxWidth: 700 }} />
                           </Card>
                       </div>
                    </div>
                    
                        
                        </>

                }
                {step3Visible &&

                    <div className='deposite-img-card-3'>
                        <div className='step3-text'>
                            <Card title="Step 3" extra={<a href="#" style={{ color: 'white', fontSize: '30',}}>
                                <b>Choose Amount</b></a>} style={{ width: '100%', backgroundColor: '#FA8E21',}}>
                                {/* <h5 style={{ color: 'black' }}>Please fill in the form below to get your bank deposit reference code.</h5> */}
                                <Card extra={<a href="#" style={{ color: 'white', fontSize: '30' }}>
                                    <b>Choose Amount</b></a>} style={{ width: '100%' }}>
                                    <h5>Please fill in the form below to get your bank deposit reference code.</h5>
                                    {/* <h3>Amount</h3> */}

                                    <Form
                                        form={amountForm}
                                        name="basic"
                                        labelCol={{ span: 8 }}
                                        wrapperCol={{ span: 16 }}
                                        style={{ maxWidth: 500, textAlign: 'left' }}
                                        initialValues={{ remember: true }}
                                        onFinish={onFinish}
                                        autoComplete="off">
                                        <Form.Item name="amount" label="Amount" rules={[{
                                            required: true,
                                            pattern: /^(?!0\d{15,})(\d{1,16})(\.\d{0,2})?$/,
                                            message: 'Please input a positive value up to 2 decimal places!'
                                        }]}>
                                            <Input addonAfter="USD" />
                                        </Form.Item>

                                        <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                                        </Form.Item>
                                        <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                                            <Button type="primary" style={{ backgroundColor: 'navy', borderRadius: 5, width: 100 }} onClick={handleSubmit}>Back</Button>
                                            <Button type="primary" htmlType="submit" style={{ backgroundColor: 'navy', borderRadius: 5, marginLeft: 5, width: 100 }} onClick={handleClick}>
                                                Submit
                                            </Button>
                                        </Form.Item>
                                        {/* <Input placeholder="Basic usage" type='number' style={{ width: 200 }} rules={[{ required: true  message: 'Please Enter Amount' }]} /> */}
                                        {/* <h5>Note:<span style={{ color: 'red' }}>This Field Is Required</span></h5>
              {/* <Checkbox></Checkbox><h4> I have read all instructions and agree with terms and conditions of payments operations.</h4> */}
                                    </Form>
                                </Card>
                            </Card>
                        </div>
                        <div className='image-3'>
                            <img src="\images\step3.png" style={{ height: 250, width: '100%', verticalAlign: 'text-bottom' }} />
                        </div>
                    </div>


                }
                {
                    step4Visible && (<>
                        <div className='deposite-img-card-4'>
                            <div className='image-4'>
                                <img src="\images\step4.png" style={{ height: 300, width: 250, verticalAlign: 'baseline', paddingTop: 50 }} />
                            </div>
                            <div className='step4-text'>
                                <Card title="Step 4" extra={<a href="#" style={{ color: 'black', fontSize: '30', textAlign: 'center' }}>
                                    <b>SEND TRANSACTION DETAILS</b></a>} style={{ width: 700, backgroundColor: '#FA8E21', marginTop: 10 }}>
                                    {/* <p style={{ textAlign: 'center', color: 'black' }}><b>Send Screenshot Of Your Transactions</b></p> */}
                                    <Card extra={<a href="#" style={{ color: 'black', fontSize: '30', textAlign: 'center' }}>
                                    </a>} style={{ width: 600, }}>
                                        <p style={{ textAlign: 'center' }}><b>Send Screenshot Of Your Transactions</b></p>
                                        <Form form={proofForm} onFinish={onProceed}>
                                            <Form.Item valuePropName="fileList" getValueFromEvent={normFile} name="idProofFile"
                                            >
                                                <Upload {...props}
                                                    name="avatar"
                                                    listType="picture-card"
                                                    fileList={idFileList}
                                                    onChange={handleIdFileChange}
                                                    style={{ width: 350 }}
                                                >
                                                    {(idFileList.length < 1) && (
                                                        <div style={{ width: '100%' }}>
                                                            <PlusOutlined />
                                                            <div style={{ marginTop: 8 }}>Upload</div>
                                                        </div>
                                                    )}
                                                </Upload>
                                                <div style={{ textAlign: 'center' }}><b>Only JPEG/PNG/PDF files are allowed. (Max 2 MB) </b></div>
                                            </Form.Item>
                                            <Form.Item wrapperCol={{ offset: 8, span: 16 }} style={{ marginTop: 20 }}>
                                                <Button type="primary" htmlType="submit">
                                                    Confirm & Proceed
                                                </Button>
                                            </Form.Item>
                                        </Form>
                                    </Card>
                                </Card>
                            </div>
                        </div>
                    </>
                    )}

            </>)
    }




    return (
        // <ConfigProvider>
        //   <PageContainer>


        //     <Card style={{ paddingBottom: 70 }}>
        //       <Row align="middle" justify="center" style={{ marginBottom: '2rem', width: 700 }}>
        //         <Title level={4} style={{ marginLeft: 250 }}> <u>Select Type of Transaction</u></Title>

        //       </Row>
        //       <Row align={'middle'} justify={'space-around'}>
        //         <div>
        //           <Card hoverable className='wallet-cls'
        //             onClick={(e) => {
        //               handleOpen();
        //               // "openpage("Deposit-mt5-page");"
        //               ;
        //             }}
        //           >
        //             <WalletOutlined className='wallet-logo' style={{ fontSize: '64px' }} />
        //             {/* <Meta title={'Wallet'} className='wallet-title' /> */}
        //             <h3 className='wallet-title'>Wallet</h3>
        //           </Card>
        //         </div>
        //         <div>
        //           <Card hoverable className='mt5-cls'
        //             onClick={(e) => {
        //               setIsMt5(true);

        //             }}
        //           >
        //             <CalculatorOutlined style={{ fontSize: '64px' }} className='wallet-logo' />
        //             {/* <Meta title={'MT5 Account'} style={{ color: 'white' }} className='mt5-title' /> */}
        //             <h3 className='wallet-title'>MT5 Account</h3>
        //           </Card>
        //         </div>
        //       </Row>
        //     </Card>

        <ConfigProvider>
            <PageContainer>

                {
                    <Steps
                    
                    
                    />
                }

            </PageContainer>
        </ConfigProvider>
    );
};


export default Deposit;


