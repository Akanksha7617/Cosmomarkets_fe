import React, { useState} from 'react';
import {Button, Card, Col,Input, Table, Row, Checkbox ,Segmented, QRCode } from "antd";
// import type { CheckboxChangeEvent } from 'antd/es/checkbox';
import type { QRCodeProps } from 'antd';
import {InfoCircleOutlined} from '@ant-design/icons';
import {scalarOptions} from "yaml";
// import Str = scalarOptions.Str;
import {flushSync} from "react-dom";
import {useModel} from "@@/exports";
import {api} from "@/components/common/api";

const { Meta } = Card;


interface MyComponentProps {
  selectedCard: number;
}

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
  MtToWallet = "MtToWallet",
  Walletj = "Walletj"
}
const text = 'select';
const { TextArea } = Input;


const CustoumCheckbox: React.FC = () => {
  const [isChecked, setIsChecked] = useState(false);

  const handleCheckboxChange = (e: any) => {
    setIsChecked(e.target.checked);
  };

  return (
    <div>
      <Checkbox checked={isChecked} onChange={handleCheckboxChange}>
      <h3>* I have read all instructions and agree with terms and conditions of payments operations</h3>
      </Checkbox><br></br>
      <Button type="primary" disabled={!isChecked}>
        Pay Now
      </Button>
    </div>
  );
};


const Step3: React.FC<MyComponentProps> = ({ selectedCard }) => {
  // const [currentCard, setCurrentCard] = useState<number>();
  const [level, setLevel] = useState<string | number>('L');

  return (
    <div>
      {selectedCard === 1 && (
      <Row  justify="center" align="middle" gutter={8}>
        <Card  style={{ width: 1000}}  bordered={false} hoverable={true}>
           <Meta title="Step3" description="Choose Amount" />
              <><p>Amount*</p>
              <Input placeholder="Enter Amount" maxLength={5}  size='middle' bordered={true}/>
                <br />
              <CustoumCheckbox></CustoumCheckbox>
              <br />
              <h4>*Amount:</h4>
              <h3>For Deposit, Please use the below details</h3>
              <Row  justify="center" align="middle" gutter={8}>
                 <>
                   <QRCode
                     style={{ marginBottom: 16 }}
                     errorLevel={level as QRCodeProps['errorLevel']}
                     value="https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg"
                   />
                   <Segmented value={level} onChange={setLevel} />
                 </>
               </Row>
               <p
                  style={{
                    backgroundColor: '#03136b',
                    fontSize: '15px',
                    color: '#fff',
                    borderRadius: '5px',
                    width: '500px',
                  }}
                  className="p-2"
                >
                  <InfoCircleOutlined /> Once payment done proceed to next step4
                </p>
                <button style={{ backgroundColor: '#03136b', color: 'white' }}>
                 &lt; Back
                  </button>
             </>
        </Card>
      </Row>
      )}
      {selectedCard === 2 && (
        <Card title="Card 2">
          <p>Content for Card 2</p>
        </Card>
      )}
      {selectedCard === 3 && (
        <Card title="Card 3">
          <p>Content for Card 3</p>
        </Card>
      )}
      {selectedCard === 4 && (
        <Card title="Card 4">
          <p>Content for Card 4</p>
        </Card>
      )}
      {selectedCard === 5 && (
        <Card title="Card 5">
          <p>Content for Card 5</p>
        </Card>
      )}
    </div>
  );
};



const Step1: React.FC = () => {
  const [selectedOption, setSelectedOption] = useState('0');

  const handleOptionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedOption(event.target.value);
  };

  return (
    <Row justify="center" align="middle" gutter={8}>
      <Col span={32}>
        <Card style={{ width: 300, marginTop: 16, height: 150 }} bordered={false} hoverable={true}>
          <Meta title="Step1" description="Select Currency" />
          <select
            name="wallet_currency_id"
            id="wallet_currency_id"
            className="selectForm form-control"
            value={selectedOption}
            onChange={handleOptionChange}
          >
            <option value="0">Select Account</option>
            <option value="1">USD Available Balance: 0.00</option>
          </select>
        </Card>
      </Col>
    </Row>
  );
};

const dataSource = [
  {
    PaymentMethod: 'http://crm.digibits.info/libraries/assets/images/payments/visa-master.png',
    Description: '<p> Visa/Master Card $<br></br> Instant deposit 24/7 </p>',
    FundingTime: '24/7 Instant',
    Fee: '0%',
    action:'Select',
  },
  {
    PaymentMethod: 'http://crm.digibits.info/libraries/assets/images/payments/bankwire.png',
    Description: '<p> bank wire $<br></br> Instant deposit 24/7 </p>',
    FundingTime: '24/7 Instant',
    Fee: '0%',
    action:'Select',
  },
  {
    PaymentMethod: 'http://crm.digibits.info/libraries/assets/images/payments/bycash.jpeg',
    Description: '<p> Bitcoin <br></br> Instant deposit 24/7 </p>',
    FundingTime: '24/7 Instant',
    Fee: '0%',
    action:'Select',
  },
  {
    PaymentMethod: 'http://crm.digibits.info/libraries/assets/images/payments/bitcoin.png',
    Description: '<p> By Cash <br></br> Instant deposit 24/7 </p>',
    FundingTime: '24/7 Instant',
    Fee: '0%',
    action:'Select',
  },
  {
    PaymentMethod: 'http://crm.digibits.info/libraries/assets/images/payments/TetherUSDT.png',
    Description: '<p> USDT TRC20 <br></br> Instant deposit 24/7 </p>',
    FundingTime: '24/7 Instant',
    Fee: '0%',
    action:'Select',
  }
  ,
  {
    PaymentMethod: 'http://crm.digibits.info/libraries/assets/images/payments/erc20.png',
    Description: '<p> ERC20 <br></br> Instant deposit 24/7 </p>',
    FundingTime: '24/7 Instant',
    Fee: '0%',
    action:'Select',
  }
  ,
  {
    PaymentMethod: 'http://crm.digibits.info/libraries/assets/images/payments/visa-master.png',
    Description: '<p> BackupPayment <br></br> Instant deposit 24/7 </p>',
    FundingTime: '24/7 Instant',
    Fee: '0%',
    action:'Select',
  },

];


const handleButtonClick = (record) => {
  // Handle button click here
  console.log('Button clicked for record:', record);


};


const columns = [
  {
    title: 'Payment Method',
    dataIndex: 'PaymentMethod',
    key: 'PaymentMethod',
    render: (image) => <img src={image} alt="Avatar" style={{ width: '100px' }} />,

  },
  {
    title: 'Description',
    dataIndex: 'Description',
    key: 'Description',
    render: (content) => <div dangerouslySetInnerHTML={{ __html: content }} />,

  },
  {
    title: 'Funding Time',
    dataIndex: 'FundingTime',
    key: 'FundingTime',
  },
  {
    title: 'Fee',
    dataIndex: 'Fee',
    key: 'Fee',
  },
  {
    title: 'Action',
    dataIndex: 'action',
    key: 'action',
    render: (text: string, record) => {
        return (
        <Button type="primary" onClick={() => handleButtonClick(record)}>
          {text}
        </Button>
      );
    },
  },
];

const Step2: React.FC = () => (
<Row justify="center" align="middle"  gutter={8}>
    <Col span={16} >
      <Card  bordered={false} hoverable={true}>
      <Meta title="Step2" description="Choose Payment Method" />
      <Table dataSource={dataSource} columns={columns}        style={{fontSize: '35px'}}   pagination={{ pageSize: 5 }}
      />;

      </Card>
    </Col>
  </Row>

);



export {Step1, Step2, Step3};
