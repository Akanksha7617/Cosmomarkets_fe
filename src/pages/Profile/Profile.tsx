import {PageContainer} from '@ant-design/pro-components';
import {PlusOutlined} from "@ant-design/icons";
import {Button, Card, Form, Input, message, Modal, Space, Tabs, theme, Typography, Upload} from 'antd';
import React, {useEffect, useState} from 'react';
import type {UploadProps} from 'antd/es/upload/interface';


import {api} from "@/components/common/api";
import {ProofRequestModel, SignUpRequest, Status} from "@/generated";
import { useModel } from '@umijs/max';
import ProfileSettings from './ProfileSettings';


const {Title, Text} = Typography

const MyEaseInOutCard = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const cardStyle = {
    opacity: isVisible ? 1 : 0,
    transition: 'opacity 1s ease-in-out',
  };

  return (
    <Card style={cardStyle}>
      {/* Card content */}
    </Card>
  );
};


const Detail: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false)
  useEffect(() => {
    getDetails().then()
  }, [])

  async function getDetails() {
    var record = await api.app.getMe()
    const password = record

    const mtClient = record.mtUser;
    var s: SignUpRequest = {
      ...record,
      password: atob(record.passcode || ''),
      masterPassword: mtClient?.password || '',
      investorPassword: mtClient?.investorPassword || '',
    }

    form.setFieldsValue(s)
    form.setFieldValue("logins", mtClient?.login)
  }

  const handleOk = () => {
    setLoading(true)
    form.validateFields().then(async (values) => {
      await api.app.putMe({...values})
      getDetails().then()
    }).finally(() => {
      setLoading(false)
    });
  };

  return (
    <>
    <Card style={{width:800}}>
      <Title level={3}>My Details</Title>
      <hr />
      <Form form={form} onFinish={handleOk}
            labelCol={{span: 14}}
            wrapperCol={{span: 14}}
            layout="horizontal"
            style={{maxWidth: 600}}
      >
        <Form.Item name="firstName" label="First Name" rules={[{required: true}]}>
          <Input/>
        </Form.Item>
        <Form.Item name="lastName" label="Last Name" rules={[{required: true}]}>
          <Input/>
        </Form.Item>
        <Form.Item name="email" label="Email" rules={[{required: true}]}>
          <Input/>
        </Form.Item>
        <Form.Item name="password" label="Password" rules={[{required: true}]}>
          <Input/>
        </Form.Item>
        <Form.Item name="logins" label="MT5 Account" rules={[{required: true}]}>
          <Input />
        </Form.Item>
        <Form.Item name="masterPassword" label="MT5 Master Password" rules={[{required: true}]}>
          <Input/>
        </Form.Item>
        <Form.Item name="investorPassword" label="MT5 Investor Password" rules={[{required: true}]}>
          <Input/>
        </Form.Item>
        <Form.Item name="phone" label="Phone" rules={[{required: true}]}>
          <Input/>
        </Form.Item>
        <Form.Item name="promo" label="Promo" rules={[{required: true}]}>
          <Input/>
        </Form.Item>
        <Form.Item name="region" label="Region" rules={[{required: true}]}>
          <Input/>
        </Form.Item>
        <Form.Item wrapperCol={{offset: 8, span: 16}}>
          <Button type="primary" htmlType="submit" loading={loading}>
            Update
          </Button>
        </Form.Item>
      </Form>
      </Card>
    </>
  );
};


export type ConView = {
  Status: Status,
  color: string,
  text: string,
  desc: string,
  image: string,
  isImage:false,
  
}
const descId = "Please Upload An Identification Documents(Passport/National Id/Driving\n" +
  "          License)in Colour Where Your Full Name Is Display"

const descAddress = "Proof Of Address Is not Older Than 180 Days(Electric Bill/Bank Statement/Other\n" +
  "          Official Document With Your Name And Address On It)"
const Verification: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false)
  const [idView, setIdView] = useState<ConView>({Status: Status.NOT_REQUESTED, color: "orange", desc: "", text: "", image:"",    isImage: false
})
  const [addressView, setAddressView] = useState<ConView>({
    Status: Status.NOT_REQUESTED,
    color: "orange",
    desc: "",
    text: "",
    image: "",
    isImage: false

  })

  const [idFileList, setIdFileList] = useState<any[]>([]);
  const [addressFileList, setAddressFileList] = useState<any[]>([]);
  const [modalVisible1, setModalVisible1] = useState(false);
  const [modalVisible2, setModalVisible2] = useState(false);
  const [managerComment, setManagerComment] = useState<string>()
  const [record, setRecord] = useState<ProofRequestModel>()

  useEffect(() => {
    init().then()
  }, [])


  const init = async () => {
    var requests = await api.proof.getMyRequest()
    let s:Status = Status.NOT_REQUESTED
    let idImageDataUrl = ""
    let addressImageDataUrl = ""
    if (requests.length > 0) {
      const r = requests[0];
      setRecord(r)
      s = r?.status || Status.NOT_REQUESTED;
      if(r.status!==Status.REJECTED && r.idProofName){
        // @ts-ignore
        const ext = r.idProofName.split('.').pop().toLowerCase();
        idImageDataUrl = `data:image/${ext};base64,${r.idProof}`;
      }
      if(r.status!==Status.REJECTED && r.addressProofName){
        // @ts-ignore
        const ext = r.addressProofName.split('.').pop().toLowerCase();
        addressImageDataUrl = `data:image/${ext};base64,${r.addressProof}`;
      }
      setManagerComment(r.managerComment||``)
    }

    setIdView({
      Status: s,
      color: s === Status.APPROVED ? "green" : s === Status.REQUESTED ? "orange" : "red",
      text: s,
      desc: s === Status.NOT_REQUESTED ? descAddress : "",
      image: idImageDataUrl,
      isImage: false

    })
    setAddressView({
      Status: s,
      color: s === Status.APPROVED ? "green" : s === Status.REQUESTED ? "orange" : "red",
      text: s,
      desc: s === Status.NOT_REQUESTED ? descAddress : "",
      image: addressImageDataUrl,
      isImage: false

    })

  }

  const handleImageClick1 = () => {
    setModalVisible1(true);
  };

  const handleImageClick2 = () => {
    setModalVisible2(true);
  };

  const props: UploadProps = {
    beforeUpload: (file) => {
      const acceptedFormats = ['image/jpeg', 'image/png'];
      if (!acceptedFormats.includes(file.type)) {
        message.error('Only JPEG/PNG images are allowed!');
        return Upload.LIST_IGNORE;
      }
      return true
    },
    onChange: (info) => {
      console.log(info.fileList);
    },
  };


  const normFile = (e: any) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e && e.fileList.slice(-1);
  };

  const handleIdFileChange = ({fileList}: any) => {
    setIdFileList(fileList);
  };

  const handleAddressFileChange = ({fileList}: any) => {
    setAddressFileList(fileList);
  };


  const handleOk = () => {
    setLoading(true)
    form.validateFields().then(async (values) => {
      //const formData = new FormData();
      // formData.append('userName', values.userName);
      // formData.append('managerName', values.managerName);

      const idFile = idFileList[0]
      const addrFile = addressFileList[0]

      const formData = {
        IdProofFile: idFile.originFileObj,
        IdProofName: idFile.name,
        AddressProofFile: addrFile.originFileObj,
        AddressProofName: addrFile.name
      };
      await api.proof.postProofRequest(formData)
      init()
    }).catch((e)=>console.log(e)).finally(() => {
      setLoading(false)
    });
  };

  return (
    <>
    <Card>
      <Title level={3}>Verification</Title>
      <hr style={{color:'lightgray'}}/>
      <Space>
      <Form form={form} onFinish={handleOk}
            labelCol={{span: 4}}
            wrapperCol={{span: 14}}
      >

        <Card
              style={{
                height: 500,
                width: 450,
                display: 'inline-block',
                marginRight: 10,
                verticalAlign: 'bottom',
                textAlign: 'center'
              }}>
          <h2 style={{textAlign: 'center',color:'black'}}>ID Proof</h2>

          <p style={{textAlign: 'center',color:'black'}}>Status: <span style={{color: idView.color}}>{idView.text}</span></p>
          <p style={{textAlign: 'center',color:'black'}}>{idView.desc}</p>

          {idView.image && (
            <div>
              <img src={idView.image}  alt={'idProof'} height={200} width={200}
                   onClick={handleImageClick1}
              />
            </div>
          )}

          {!idView.image && (<>
            <Form.Item valuePropName="fileList" getValueFromEvent={normFile} name="idProofFile"
                     rules={[{ required: true, message: 'Please select id proof' }]}
          >
            <Upload {...props}
                    name="avatar"
                    listType="picture-card"
                    fileList={idFileList}
                    onChange={handleIdFileChange}
                    style={{width:350}}
            >
              {(idFileList.length< 1) && (
                <div style={{width:'100%'}}>
                  <PlusOutlined/>
                  <div style={{marginTop: 8}}>Upload</div>
                </div>
              )}
            </Upload>
          </Form.Item>
          <span style={{color:'black'}}>Only JPEG/PNG images are allowed</span>
            </>
          )}
        </Card>

        <Card
              style={{
                height: 500,
                width: 450,
                display: 'inline-block',
                marginRight: 10,
                verticalAlign: 'bottom',
                textAlign: 'center'
              }}>
          <h2 style={{textAlign: 'center',color:'black'}}>Proof Of Address</h2>

          <p style={{textAlign: 'center',color:'black'}}>Status: <span style={{color: addressView.color}}>{addressView.text}</span>
          </p>
          <p style={{textAlign: 'center',color:'black'}}>{addressView.desc}</p>

          {addressView.image && (
            <div>
              <img src={addressView.image}  alt={'addressProof'} height={200} width={200}
                   onClick={handleImageClick2}
              />
            </div>
          )}

          {!addressView.image && ( <>
          <Form.Item valuePropName="fileList" getValueFromEvent={normFile} name="addressProofFile"
                     rules={[{ required: true, message: 'Please select address proof' }]}
          >
              <Upload {...props}
                    name="avatar"
                    listType="picture-card"
                    fileList={addressFileList}
                    onChange={handleAddressFileChange}
                    style={{width:350}}
            >
              {addressFileList.length < 1 && (
                <div>
                  <PlusOutlined/>
                  <div>Upload</div>
                </div>
              )}
            </Upload>
          </Form.Item>
          <span style={{color:'black'}}>Only JPEG/PNG images are allowed</span>
            </>
            )}
        </Card>
        

        <Form.Item wrapperCol={{offset: 8, span: 16}} style={{marginTop:20}}>
          <Button type="primary" htmlType="submit" loading={loading} disabled={idView.Status!=Status.NOT_REQUESTED && idView.Status!=Status.REJECTED}>
            Update
          </Button>
        </Form.Item>
      </Form>
      </Space>
    </Card>

      <Modal
        open={modalVisible1}
        onCancel={() => setModalVisible1(false)}
        footer={null}
      >
        <div style={{ textAlign: 'center' }}>
          <img
            src={idView.image}
            alt="idProof"
            style={{ maxWidth: '100%', maxHeight: 'calc(100vh - 200px)' }}
          />
        </div>
      </Modal>

      <Modal
        open={modalVisible2}
        onCancel={() => setModalVisible2(false)}
        footer={null}
      >
        <div style={{ textAlign: 'center' }}>
          <img
            src={addressView.image}
            alt="addressProof"
            style={{ maxWidth: '100%', maxHeight: 'calc(100vh - 200px)' }}
          />
        </div>
      </Modal>

    </>
  )
}
const Profile: React.FC = () => {
  const {token} = theme.useToken();
  const {initialState, setInitialState} = useModel('@@initialState');


  return (
    <PageContainer>
      <Tabs
        defaultActiveKey="1"
        items={[
          {
            key: '1',
            label: 'My Details',
            children: <Detail/>,
          },
          // {
          //   key: '2',
          //   label: 'Verification',
          //   children: <Verification/>,
          // },
          {
            key: '3',
            label: 'Profile Settings',
            children: <ProfileSettings/>,
          },
        
        ]}
      />

    </PageContainer>
  );
};
export default Profile;


