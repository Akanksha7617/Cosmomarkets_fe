import { api } from '@/components/common/api';
import { ProofRequestModel, SignUpRequest } from '@/generated';
import {
  LoadingOutlined,
  LockOutlined,
  PlusOutlined,
  SafetyCertificateOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { history } from '@umijs/max';
import type { FormInstance } from 'antd';
import { Button, Card, Checkbox, Form, Input, message, Upload, Space } from 'antd';
import Select from 'antd/es/select';
import type { RcFile, UploadFile, UploadProps } from 'antd/es/upload/interface';
import React, { useEffect, useState } from 'react';
import '../../common.css';
import CustomLoader from '../CustomLoader';
import { Status } from '../Finops/common/Transfer';
import MyDetails from './MyDetails';
import Password from './Password';
import { ConView } from './Profile';
import Verification from './Verification';

const onChange = (key: string) => {
  console.log(key);
};

const getBase64 = (file: RcFile): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
const beforeUpload = (file: RcFile) => {
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
  if (!isJpgOrPng) {
    message.error({
      content: 'You can only upload JPG/PNG file!',
      icon: <span className="orange-error-icon"> ✘ </span>,
      className: 'orange-error-notification',
      duration: 3,
    });
  }
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isLt2M) {
    message.error({
      content: 'Image must be smaller than 2MB!',
      icon: <span className="orange-error-icon"> ✘ </span>,
      className: 'orange-error-notification',
      duration: 3,
    });
  }
  return isJpgOrPng && isLt2M;
};

type LayoutType = Parameters<typeof Form>[0]['layout'];

const ProfileSettings: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [imageUrl, setImageUrl] = useState<string>();
  const [form] = Form.useForm();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');
  const [step2Visible, setStep2Visible] = useState(false);
  const [step3Visible, setStep3Visible] = useState(false);
  const [step4Visible, setStep4Visible] = useState(false);
  const [step5Visible, setStep5Visible] = useState(false);
  const [activeTab, setActiveTab] = useState('1');
  const [isMobile, setIsMobile] = useState(false);

  const [backpage, setBackPage] = useState(false);

  // const [loading, setLoading] = useState<boolean>(false)
  const [idView, setIdView] = useState<ConView>({
    Status: Status.NOT_REQUESTED,
    color: 'orange',
    desc: '',
    text: '',
    image: '',
  });
  const [addressView, setAddressView] = useState<ConView>({
    Status: Status.NOT_REQUESTED,
    color: 'orange',
    desc: '',
    text: '',
    image: '',
  });

  const [idFileList, setIdFileList] = useState<any[]>([]);
  const [addressFileList, setAddressFileList] = useState<any[]>([]);
  const [modalVisible1, setModalVisible1] = useState(false);
  const [modalVisible2, setModalVisible2] = useState(false);
  const [managerComment, setManagerComment] = useState<string>();
  const [record, setRecord] = useState<ProofRequestModel>();
  const [isFlipped, setIsFlipped] = useState(false);
  const [formLayout, setFormLayout] = useState<LayoutType>('horizontal');
  const [status, setStatus] = useState('');
  const [isRequested, setIsRequested] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const onFormLayoutChange = ({ layout }: { layout: LayoutType }) => {
    setFormLayout(layout);
  };

  // Check for mobile screen size on mount and window resize
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 500);
    };
    
    // Initial check
    checkIsMobile();
    
    // Set up event listener for window resize
    window.addEventListener('resize', checkIsMobile);
    
    // Clean up event listener
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  const formItemLayout = isMobile
    ? null
    : formLayout === 'horizontal'
    ? { labelCol: { span: 4 }, wrapperCol: { span: 14 } }
    : null;

  const handleChange: UploadProps['onChange'] = ({ fileList: newFileList }) =>
    setFileList(newFileList);
  const handleCancel = () => setPreviewOpen(false);

  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as RcFile);
    }

    setPreviewImage(file.url || (file.preview as string));
    setPreviewOpen(true);
    setPreviewTitle(file.name || file.url!.substring(file.url!.lastIndexOf('/') + 1));
  };

  const uploadButton = (
    <div>
      {loading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  );
  const SubmitButton = ({ form }: { form: FormInstance }) => {
    const [submittable, setSubmittable] = React.useState(false);

    // Watch all values
    const values = Form.useWatch([], form);

    React.useEffect(() => {
      form.validateFields({ validateOnly: true }).then(
        () => {
          setSubmittable(true);
        },
        () => {
          setSubmittable(false);
        },
      );
    }, [values]);

    return (
      <Button type="button" htmlType="submit" disabled={!submittable}>
        Submit
      </Button>
    );
  };

  const handleButton = () => {
    setIsFlipped(!isFlipped);
  };

  function handleSubmit() {
    console.log('onClick');
    setStep2Visible(false);
    setStep3Visible(false);
    setStep4Visible(false);
    setStep5Visible(false);

    history.push('/MyDetails');
  }
  function handleOpen() {
    console.log('onClick');
    history.push('/Verification');

    setStep3Visible(false);
    setStep2Visible(false);
    setStep5Visible(false);
    setStep4Visible(false);
  }
  function handleStart() {
    history.push('/Password');
    console.log('onClick');
    setStep4Visible(false);
    setStep2Visible(false);
    setStep3Visible(false);
    setStep5Visible(false);
  }
  function handleBegin() {
    history.push('/IBcode');

    console.log('onClick');
    setStep5Visible(false);
    setStep2Visible(false);
    setStep3Visible(false);
    setStep4Visible(false);
  }

  const descId =
    'Please Upload An Identification Documents(Passport/National Id/Driving\n' +
    '          License)in Colour Where Your Full Name Is Display';

  const descAddress =
    'Proof Of Address Is not Older Than 180 Days(Electric Bill/Bank Statement/Other\n' +
    '          Official Document With Your Name And Address On It)';

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 100);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  const init = async () => {
    var requests = await api.proof.getMyRequest();
    let s: Status = Status.NOT_REQUESTED;
    let idImageDataUrl = '';
    let addressImageDataUrl = '';
    if (requests.length > 0) {
      const r = requests[0];
      setRecord(r);
      s = r?.status || Status.NOT_REQUESTED;
      if (r.status !== Status.REJECTED && r.idProofName) {
        // @ts-ignore
        const ext = r.idProofName.split('.').pop().toLowerCase();
        idImageDataUrl = `data:image/${ext};base64,${r.idProof}`;
      }
      if (r.status !== Status.REJECTED && r.addressProofName) {
        // @ts-ignore
        const ext = r.addressProofName.split('.').pop().toLowerCase();
        addressImageDataUrl = `data:image/${ext};base64,${r.addressProof}`;
      }
      setManagerComment(r.managerComment || ``);
    }

    setIdView({
      Status: s,
      color: s === Status.APPROVED ? 'green' : s === Status.REQUESTED ? 'orange' : 'red',
      text: s,
      desc: s === Status.NOT_REQUESTED ? descAddress : '',
      image: idImageDataUrl,
    });
    setAddressView({
      Status: s,
      color: s === Status.APPROVED ? 'green' : s === Status.REQUESTED ? 'orange' : 'red',

      text: s,
      desc: s === Status.NOT_REQUESTED ? descAddress : '',
      image: addressImageDataUrl,
    });
  };

  const handleImageClick1 = () => {
    setModalVisible1(true);
  };

  const handleImageClick2 = () => {
    setModalVisible2(true);
  };
  const handleBackPage = () => {
    setBackPage(true);
  };

  const props: UploadProps = {
    beforeUpload: (file) => {
      const acceptedFormats = ['image/jpeg', 'image/png'];
      if (!acceptedFormats.includes(file.type)) {
        message.error({
          content: 'Only JPEG/PNG images are allowed!',
          icon: <span className="orange-error-icon"> ✘ </span>,
          className: 'orange-error-notification',
          duration: 3,
        });
        return Upload.LIST_IGNORE;
      }
      return true;
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

  const handleIdFileChange = ({ fileList }: any) => {
    setIdFileList(fileList);
  };

  const handleAddressFileChange = ({ fileList }: any) => {
    setAddressFileList(fileList);
  };

  const handleOk = () => {
    form
      .validateFields()
      .then(async (values) => {
        const idFile = idFileList[0];
        const addrFile = addressFileList[0];

        const formData = {
          IdProofFile: idFile.originFileObj,
          IdProofName: idFile.name,
          AddressProofFile: addrFile.originFileObj,
          AddressProofName: addrFile.name,
        };
        await api.proof.postProofRequest(formData);
        init();
      })
      .catch((e) => console.log(e));
  };

  async function getDetails() {
    var record = await api.app.getMe();
    const password = record;

    const mtClient = record.mtUser;
    var s: SignUpRequest = {
      ...record,
      password: atob(record.passcode || ''),
      masterPassword: mtClient?.password || '',
      investorPassword: mtClient?.investorPassword || '',
    };

    form.setFieldsValue(s);
    form.setFieldValue('logins', mtClient?.login);
  }

  const handleOkForm = () => {
    form.validateFields().then(async (values) => {
      await api.app.putMe({ ...values });
      getDetails().then();
    });
  };

  // Tabs items with custom vertical styling
  const tabItems = [
    {
      key: '1',
      component: <MyDetails />,
      icon: <UserOutlined />,
      title: 'My Account',
      subtitle: 'Update your profile details',
    },
    {
      key: '2',
      component: <Verification />,
      icon: <SafetyCertificateOutlined />,
      title: 'Approval',
      subtitle: 'Submit ID and address proof',
    },
    {
      key: '3',
      component: <Password />,
      icon: <LockOutlined />,
      title: 'Reset Password',
      subtitle: 'Change your client area password',
    },
  ];

  // Handle tab change
  const handleTabChange = (key: string) => {
    setActiveTab(key);
    onChange(key);
  };

  // Get the current active component
  const getActiveComponent = () => {
    return tabItems.find((item) => item.key === activeTab)?.component;
  };

  return (
    <>
     {loading ? (
        <CustomLoader />
      ) : (
        <Card style={{ backgroundColor: '#f7f7f3' }} className="profile-setting-parent">
          <h2>Profile Settings</h2>

          <div className="horizontal-tabs-wrapper">
            {/* Flowing Curved Tabs Container */}
            <div className="horizontal-tabs-container">
              {/* Tabs List */}
              <div className="horizontal-tab-list">
                {tabItems.map((item, index) => (
                  <div
                    key={item.key}
                    className={`horizontal-tab-item ${activeTab === item.key ? 'active' : ''}`}
                    onClick={() => handleTabChange(item.key)}
                    role="tab"
                    tabIndex={0}
                    aria-selected={activeTab === item.key}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        handleTabChange(item.key);
                      }
                    }}
                  >
                    {/* Number badge */}
                    <div className="tab-number">{index + 1}</div>
                    
                    {/* Icon container */}
                    <div className="tab-icon-container">
                      <div className="tab-icon-horizontal">
                        {item.icon}
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="tab-content-horizontal">
                      <div className="tab-title-horizontal">{item.title}</div>
                      <div className="tab-subtext-horizontal">{item.subtitle}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Content Area */}
            <div className="vertical-tabs-content" style={{ 
             
              padding: isMobile ? '10px 0' : '15px' 
            }}>
              {getActiveComponent()}
            </div>
          </div>
        </Card>
      )}

      {step5Visible && (
        <>
          <Card
            title="Introducing Broker"
            style={{ backgroundColor: '#f2f2f2', marginBottom: 20, marginTop: 20 }}
          >
            <Card title="Your IB" headStyle={{ backgroundColor: '#f89d42', color: 'white' }}>
              <Form.Item label="IB Code">
                <Input placeholder="12345" />
              </Form.Item>
            </Card>
            <Card
              title="IB Details"
              className="ib-detail"
              headStyle={{ backgroundColor: '#f89d42', color: 'white' }}
            >
              <Form.Item label="Please select which country You are operating your IB Program from:">
                <Select placeholder="Select country">
                  <Select.Option value="demo">Demo</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item label="What is the main region you will be referring clients from?">
                <Select placeholder="Select region">
                  <Select.Option value="demo">Demo</Select.Option>
                </Select>
              </Form.Item>
              <p>
                Do you hold relevant regulatory/licensing permissions in the EEA to refer clients?
              </p>
              <Space direction={isMobile ? 'vertical' : 'horizontal'} style={{ width: '100%' }}>
                <Form.Item label="Yes">
                  <Checkbox></Checkbox>
                </Form.Item>
                <Form.Item label="No">
                  <Checkbox></Checkbox>
                </Form.Item>
              </Space>
            </Card>
            <Card
              title="Program Information"
              headStyle={{ backgroundColor: '#f89d42', color: 'white' }}
            >
              <div className="img-para" style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row' }}>
                <div className="program-img" style={{ width: isMobile ? '100%' : '30%', textAlign: isMobile ? 'center' : 'left' }}>
                  <img
                    src="./images/program-information.png"
                    alt="Image"
                    style={{
                      width: isMobile ? '150px' : '190px',
                      height: 'auto',
                      maxHeight: '200px',
                      verticalAlign: 'bottom',
                      marginBottom: 20,
                      marginTop: 20,
                    }}
                  />
                </div>

                <div className="programinfo" style={{ width: isMobile ? '100%' : '70%' }}>
                  <Form.Item label="What type of IB program do you operate?">
                    <Select placeholder="Select program type">
                      <Select.Option value="demo">Demo</Select.Option>
                    </Select>
                  </Form.Item>
                  <Form.Item label="Do you hold a regulatory license/authorisation?">
                    <Select placeholder="Select option">
                      <Select.Option value="demo">Demo</Select.Option>
                    </Select>
                  </Form.Item>
                  <Form.Item label="What is the frequency of communication you have with clients?">
                    <Select placeholder="Select frequency">
                      <Select.Option value="demo">Demo</Select.Option>
                    </Select>
                  </Form.Item>
                </div>
              </div>
              <div>
                <div className="checkbox">
                  <Form.Item>
                    <Checkbox>I agree to IB Terms and Conditions</Checkbox>
                  </Form.Item>
                  <Form.Item>
                    <Checkbox>
                      I declare and confirm that I accept all terms and conditions of Digibits.
                    </Checkbox>
                  </Form.Item>
                </div>
              </div>
              <div className="programinf" style={{ color: 'black' }}>
                <p>That the information provided in this form is accurate and complete;</p>
                <p>
                  It is my responsibility to advise TTS Markets as soon as possible if any of the
                  information changes; and
                </p>
                <p>
                  TTS Markets may take steps to verify the information, including contacting my
                  clients to validate the nature of my services.
                </p>
                <p>
                  I must not display TTS Markets's licensing details on any website or via any other
                  communication channel
                </p>
              </div>
              <Form.Item>
                <Button type="button" className="submit-btn" style={{ width: isMobile ? '100%' : 'auto' }}>
                  Submit
                </Button>
              </Form.Item>
            </Card>
          </Card>
        </>
      )}
    </>
  );
};

export default ProfileSettings;