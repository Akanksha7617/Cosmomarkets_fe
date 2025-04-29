import React, { useState } from 'react'
import { Card } from 'antd';

import { Button, Form, Input, InputNumber, message } from 'antd';
import layout from 'antd/es/layout';
import { UploadOutlined } from '@ant-design/icons';
import { PlusOutlined } from '@ant-design/icons';
import { Modal, Upload } from 'antd';
import type { RcFile, UploadProps } from 'antd/es/upload';
import type { UploadFile } from 'antd/es/upload/interface';
import {api} from "@/components/common/api";
import { CompanySetting, ProofRequestModel } from '@/generated';




const getBase64 = (file: RcFile): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
    });



const CRMsettings: React.FC <{}>= () => {

    const [crmlogoupdate, setCrmlogoupdate] = useState<any[]>([]);
    const [crmlogoupdate2, setCrmlogoupdate2] = useState<any[]>([]);

    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [previewTitle, setPreviewTitle] = useState('');
    const [searchedColumn, setSearchedColumn] = useState('');
    const [selected, setSelected] = useState<ProofRequestModel>({});

    const [data, setData] = useState<CompanySetting>({name:'company'});

    const [fileList, setFileList] = useState<UploadFile[]>([


    ]);

    const handleCancel = () => setPreviewOpen(false);

    const handleSubmit=()=>{
        

    }
    async function init() {
        const data = await api.setting.getCompanySettings()
        if(data && data.length>0){
            setData(data[0]);
        }
               
      }
    
const handleEdit = (record: ProofRequestModel) => {
    // const password = record.mtUsers?.find(m => m.accountType == AccountType.CLIENT)?.password;
    // var s: SignUpRequest = {
    //   ...record,
    //   password: password
    // }
    setSelected(record)
    form.setFieldsValue(record)

    let idImageDataUrl = ""
    let addressImageDataUrl = ""
    let s:Status = Status.NOT_REQUESTED
    if (record) {
      const r = record;
      s = r?.status || Status.NOT_REQUESTED;
      if(r.whiteLogo){
        // @ts-ignore
        const ext = r.whiteLogo.split('.').pop().toLowerCase();
        idImageDataUrl = `data:image/${ext};base64,${r.idProof}`;
      }
      if(r.addressProofName){
        // @ts-ignore
        const ext = r.addressProofName.split('.').pop().toLowerCase();
        addressImageDataUrl = `data:image/${ext};base64,${r.addressProof}`;
      }
    }
} 
const handleOk = () => {
    setLoading(true)
    form.validateFields().then(async (values) => {
      //const formData = new FormData();
      // formData.append('userName', values.userName);
      // formData.append('managerName', values.managerName);

      const whiteLogo = crmlogoupdate[0]
      const blackLogo = crmlogoupdate2[0]

      const formData = {
        IdProofFile: idFile.originFileObj,
        IdProofName: idFile.name,
        AddressProofFile: addrFile.originFileObj,
        AddressProofName: addrFile.name
      };
     
    }).catch((e)=>console.log(e)).finally(() => {
      setLoading(false)
    });
  };
    const handlePreview = async (file: UploadFile) => {
        if (!file.url && !file.preview) {
            file.preview = await getBase64(file.originFileObj as RcFile);
        }

        setPreviewImage(file.url || (file.preview as string));
        setPreviewOpen(true);
        setPreviewTitle(file.name || file.url!.substring(file.url!.lastIndexOf('/') + 1));
    };

    const handleChange: UploadProps['onChange'] = ({ fileList: newFileList }) =>
        setFileList(newFileList);

    const uploadButton = (
        <div>
            <PlusOutlined />
            <div style={{ marginTop: 8 }}>Upload</div>
        </div>
    );

    const validateMessages = {
        required: '${label} is required!',
        types: {
            email: '${label} is not a valid email!',
        },

    };
    /* eslint-enable no-template-curly-in-string */

    const onFinish = (values: any) => {
        console.log(values);
    };
    const handlePhotoChange = ({fileList}: any) => {
        setCrmlogoupdate(fileList);
      };
    
      const handleUpdate = ({fileList}: any) => {
        setCrmlogoupdate2(fileList);
      };
    const props: UploadProps = {
        name: 'file',
        action: 'https://www.mocky.io/v2/5cc8019d300000980a055e76',
        headers: {
            authorization: 'authorization-text',
        },
        onChange(info) {
            if (info.file.status !== 'uploading') {
                console.log(info.file, info.fileList);
            }
            if (info.file.status === 'done') {
                message.success(`${info.file.name} file uploaded successfully`);
            } else if (info.file.status === 'error') {
                message.error(`${info.file.name} file upload failed.`);
            }
        },
        progress: {
            strokeColor: {
                '0%': '#108ee9',
                '100%': '#87d068',
            },
            strokeWidth: 3,
            format: (percent) => percent && `${parseFloat(percent.toFixed(2))}%`,
        },
    };

    
    
        return (
            <>
            <Card title="CRM  Update Settings" bordered={false} style={{ width: 550,display:'inline-block', marginBottom: 10 ,marginRight:10}}>
                <Form
                    {...layout}
                    name="nest-messages"
                    onFinish={onFinish}
                    style={{ maxWidth: 600 }}
                    validateMessages={validateMessages}
                >
                        <Form.Item name={['companyName']} label="CRM Title"  >
                            <Input />
                        </Form.Item>
                    <Form.Item name={['email']} label="Email" rules={[{ type: 'email' }]}>
                        <Input />
                    </Form.Item>
                    <hr />
                    <Form.Item name="whiteLogo" style={{textAlign:'center'}}>
                    <h3>Add Or Update Logo Of The CRM  <div style={{ fontSize: 10 }}>(Background: White - Max Width: 300px - Max Height: 100px - Ratio 3:1)</div>
                    </h3>
                    <Upload
                     action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
                    listType="picture-card"
                    fileList={crmlogoupdate}
                    onPreview={handlePreview}
                    onChange={handlePhotoChange}
                >
                    {fileList.length >= 8 ? null : uploadButton}
                </Upload><Modal open={previewOpen} title={previewImage} footer={null} onCancel={handleCancel}>
                    <img alt="upload" style={{ width: '100%' }} src={previewImage} />
                </Modal>
                </Form.Item>
                <hr />
                <Form.Item name="blackLogo" style={{textAlign:'center'}}>
                <h3>Add Or Update Logo Of The CRM  <div style={{ fontSize: 10 }}>(Background: Black - Max Width: 300px - Max Height: 100px - Ratio 3:1)</div>
                    </h3>
                    <Upload
                     action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
                    listType="picture-card"
                    fileList={crmlogoupdate2}
                    onPreview={handlePreview}
                    onChange={handleUpdate}
                >
                    {fileList.length >= 8 ? null : uploadButton}
                </Upload><Modal open={previewOpen} title={previewTitle} footer={null} onCancel={handleCancel}>
                    <img alt="example" style={{ width: '100%' }} src={previewImage} />
                </Modal>
                        <Button type="primary" htmlType="submit" style={{textAlign:'center'}}>
                            Update
                        </Button>
                    </Form.Item>
                    <Form.Item>
                        
                    </Form.Item>

                </Form>
                </Card>
            </>
          
           
        )
    };
export default CRMsettings;



