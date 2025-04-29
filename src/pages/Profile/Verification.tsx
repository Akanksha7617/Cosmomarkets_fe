import { api } from '@/components/common/api';
import { ProofRequestModel, Status } from '@/generated';
import { LoadingOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons';
import { Button, Card, Form, message, Upload } from 'antd';
import { FormInstance } from 'antd/es/form';
import { RcFile, UploadFile, UploadProps } from 'antd/es/upload';
import React, { useEffect, useState } from 'react';
import '../../common.css';
import { ConView } from './Profile';

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

const Verification: React.FC = () => {
  const [backpage, setBackPage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>();
  const [form] = Form.useForm();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');

  // Individual status tracking for each document
  const [idView, setIdView] = useState<ConView>({
    Status: Status.NOT_REQUESTED,
    color: 'orange',
    desc: '',
    text: '',
    image: '',
    isImage: false,
  });
  const [idViewBack, setIdViewBack] = useState<ConView>({
    Status: Status.NOT_REQUESTED,
    color: 'orange',
    desc: '',
    text: '',
    image: '',
    isImage: false,
  });
  const [addressView, setAddressView] = useState<ConView>({
    Status: Status.NOT_REQUESTED,
    color: 'orange',
    desc: '',
    text: '',
    image: '',
    isImage: false,
  });

  // New state variables to store preview images
  const [idPreviewImage, setIdPreviewImage] = useState<string>('');
  const [idBackPreviewImage, setIdBackPreviewImage] = useState<string>('');
  const [addressPreviewImage, setAddressPreviewImage] = useState<string>('');

  const [idFileList, setIdFileList] = useState<any[]>([]);
  const [idFileListBack, setIdFileListBack] = useState<any[]>([]);
  const [addressFileList, setAddressFileList] = useState<any[]>([]);
  const [modalVisible1, setModalVisible1] = useState(false);
  const [modalVisible2, setModalVisible2] = useState(false);
  const [managerComment, setManagerComment] = useState<string>();
  const [record, setRecord] = useState<ProofRequestModel>();
  const [isFlipped, setIsFlipped] = useState(false);
  const [formLayout, setFormLayout] = useState<LayoutType>('horizontal');
  const [isRequested, setIsRequested] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  // Determine if update button should be disabled based on all document statuses
  const isUpdateButtonDisabled =
    idView.Status !== Status.NOT_REQUESTED &&
    idView.Status !== Status.REJECTED &&
    idViewBack.Status !== Status.NOT_REQUESTED &&
    idViewBack.Status !== Status.REJECTED &&
    addressView.Status !== Status.NOT_REQUESTED &&
    addressView.Status !== Status.REJECTED;

  const [showCancelButton, setShowCancelButton] = useState(false);

  const onFormLayoutChange = ({ layout }: { layout: LayoutType }) => {
    setFormLayout(layout);
  };

  const formItemLayout =
    formLayout === 'horizontal' ? { labelCol: { span: 4 }, wrapperCol: { span: 14 } } : null;

  const handleChange: UploadProps['onChange'] = ({ fileList: newFileList }) =>
    setFileList(newFileList);

  const handleCancel = () => {
    console.log('Cancellation logic here');
    setShowCancelButton(false);
  };

  const handleUpdate = () => {
    console.log('----->update');
    setLoading(true);

    const isIdProofUploaded = idFileList.length > 0;
    const isIdProofUploadedBack = idFileListBack.length > 0;
    const address = addressFileList.length > 0;
    console.log(isIdProofUploaded);

    if (!isIdProofUploaded && !isIdProofUploadedBack && !address) {
      setLoading(false);
      return;
    }

    setTimeout(() => {
      setLoading(false);
      setShowCancelButton(true);
    }, 2000);
  };

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
      <Button type="primary" htmlType="submit" disabled={!submittable}>
        Submit
      </Button>
    );
  };

  const handleButton = () => {
    setIsFlipped(!isFlipped);
  };

  const descId =
    'Please Upload An Identification Documents(Passport/National Id/Driving\n' +
    '          License)in Colour Where Your Full Name Is Display';

  const descAddress =
    'Proof Of Address Is not Older Than 180 Days(Electric Bill/Bank Statement/Other\n' +
    '          Official Document With Your Name And Address On It)';

  useEffect(() => {
    init().then();
  }, []);

  // Modified init function to handle individual statuses
  const init = async () => {
    const requests = await api.proof.getMyRequest();
    let anyRequested = false;

    // Initialize with default values
    let idStatus = Status.NOT_REQUESTED;
    let idBackStatus = Status.NOT_REQUESTED;
    let addressStatus = Status.NOT_REQUESTED;

    let idImageDataUrl = '';
    let idImageDataUrlBack = '';
    let addressImageDataUrl = '';

    if (requests.length > 0) {
      const r = requests[0];
      setRecord(r);

      // Check ID Front proof status and image
      if (r.idProofName) {
        const ext = r.idProofName.split('.').pop().toLowerCase();
        idImageDataUrl = `data:image/${ext};base64,${r.idProof}`;

        // Set status based on individual document
        if (r.idProofStatus !== undefined) {
          // If you have individual status for each document
          idStatus = r.idProofStatus;
        } else {
          // Fallback to the main status if no individual status exists
          idStatus = r.status !== Status.REJECTED ? r.status : Status.NOT_REQUESTED;
        }
      }

      // Check ID Back proof status and image
      if (r.idProofBackPageName) {
        const ext = r.idProofBackPageName.split('.').pop().toLowerCase();
        idImageDataUrlBack = `data:image/${ext};base64,${r.idProofBackPage}`;

        // Set status based on individual document
        if (r.idProofBackStatus !== undefined) {
          // If you have individual status for each document
          idBackStatus = r.idProofBackStatus;
        } else {
          // Fallback to the main status if no individual status exists
          idBackStatus = r.status !== Status.REJECTED ? r.status : Status.NOT_REQUESTED;
        }
      }

      // Check Address proof status and image
      if (r.addressProofName) {
        const ext = r.addressProofName.split('.').pop().toLowerCase();
        addressImageDataUrl = `data:image/${ext};base64,${r.addressProof}`;

        // Set status based on individual document
        if (r.addressProofStatus !== undefined) {
          // If you have individual status for each document
          addressStatus = r.addressProofStatus;
        } else {
          // Fallback to the main status if no individual status exists
          addressStatus = r.status !== Status.REJECTED ? r.status : Status.NOT_REQUESTED;
        }
      }

      // Check if any document is requested
      if (
        idStatus === Status.REQUESTED ||
        idBackStatus === Status.REQUESTED ||
        addressStatus === Status.REQUESTED
      ) {
        anyRequested = true;
      }

      setIsRequested(anyRequested);
      setManagerComment(r.managerComment || '');
    }

    // Update each view with its respective status
    setIdView({
      Status: idStatus,
      color: getStatusColor(idStatus),
      text: idStatus,
      desc: idStatus === Status.NOT_REQUESTED ? descId : '',
      image: idImageDataUrl,
      isImage: !!idImageDataUrl,
    });

    setIdViewBack({
      Status: idBackStatus,
      color: getStatusColor(idBackStatus),
      text: idBackStatus,
      desc: idBackStatus === Status.NOT_REQUESTED ? descId : '',
      image: idImageDataUrlBack,
      isImage: !!idImageDataUrlBack,
    });

    setAddressView({
      Status: addressStatus,
      color: getStatusColor(addressStatus),
      text: addressStatus,
      desc: addressStatus === Status.NOT_REQUESTED ? descAddress : '',
      image: addressImageDataUrl,
      isImage: !!addressImageDataUrl,
    });
  };

  // Helper function to get color based on status
  const getStatusColor = (status: Status): string => {
    switch (status) {
      case Status.APPROVED:
        return 'green';
      case Status.REQUESTED:
        return 'orange';
      case Status.REJECTED:
        return 'red';
      default:
        return 'orange';
    }
  };

  // Check if any document is in requested state
  const hasRequestedDocuments =
    idView.Status === Status.REQUESTED ||
    idViewBack.Status === Status.REQUESTED ||
    addressView.Status === Status.REQUESTED;

  const handleCancelProof = async () => {
    try {
      const response = await api.proof.cancelRequest();
      console.log('API Response:', response);
      window.location.reload();
    } catch (error) {
      console.error('Error cancelling verification:', error);
    }
  };

  const handleImageClick1 = () => {
    setModalVisible1(true);
  };

  const handleImageClick2 = () => {
    setModalVisible2(true);
  };

  const props: UploadProps = {
    beforeUpload: (file) => {
      const acceptedFormats = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/bmp',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      ];
      console.log('file Extension', file.type);
      if (!acceptedFormats.includes(file.type)) {
        message.error({
          content: 'This file type is not supported. Please upload a valid file format.',
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

  // Modified handlers to update preview immediately after file selection
  const handleIdFileChange = async ({ fileList }: any) => {
    setIdFileList(fileList);

    // Generate preview immediately if file exists
    if (fileList.length > 0 && fileList[0].originFileObj) {
      const previewUrl = await getBase64(fileList[0].originFileObj);
      setIdPreviewImage(previewUrl);
    } else {
      setIdPreviewImage('');
    }
  };

  const handleIdFileChangeBack = async ({ fileList }: any) => {
    setIdFileListBack(fileList);

    // Generate preview immediately if file exists
    if (fileList.length > 0 && fileList[0].originFileObj) {
      const previewUrl = await getBase64(fileList[0].originFileObj);
      setIdBackPreviewImage(previewUrl);
    } else {
      setIdBackPreviewImage('');
    }
  };

  const handleAddressFileChange = async ({ fileList }: any) => {
    setAddressFileList(fileList);

    // Generate preview immediately if file exists
    if (fileList.length > 0 && fileList[0].originFileObj) {
      const previewUrl = await getBase64(fileList[0].originFileObj);
      setAddressPreviewImage(previewUrl);
    } else {
      setAddressPreviewImage('');
    }
  };

  const handleOk = () => {
    console.log('----->Uploading');
    setLoading(true);
    form
      .validateFields()
      .then(async (values) => {
        const idFile = idFileList?.length > 0 ? idFileList[0] : null;
        const idFileBack = idFileListBack?.length > 0 ? idFileListBack[0] : null;

        if (idFile?.size > 30 * 1024 * 1024) {
          message.error({
            content: 'Document size exceeds the limit. Please upload a file less than 30 MB.',
            icon: <span className="orange-error-icon"> ✘ </span>,
            className: 'orange-error-notification',
            duration: 3,
          });
          setLoading(false);
          return;
        }

        const addrFile = addressFileList[0];
        const isIdProofUploaded = idFileList.length > 0;
        const isIdProofUploadedback = idFileListBack.length > 0;
        const address = addressFileList.length > 0;

        if (!isIdProofUploaded && !isIdProofUploadedback && !address) {
          message.error({
            content: 'Please upload the required ID proof image and address.',
            icon: <span className="orange-error-icon"> ✘ </span>,
            className: 'orange-error-notification',
            duration: 3,
          });
          return;
        }

        let formData: any = {};
        if (idFile) {
          formData.IdProofFile = idFile?.originFileObj;
          formData.IdProofName = idFile?.name;
        }

        if (addrFile) {
          formData.AddressProofFile = addrFile?.originFileObj;
          formData.AddressProofName = addrFile?.name;
        }

        if (idFileBack) {
          formData.IdProofFileBackPage = idFileBack?.originFileObj;
          formData.IdProofBackPageName = idFileBack?.name;
        }

        await api.proof.postProofRequest(formData);
        init();
      })
      .catch((e) => console.log(e))
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <>
      <div className="btn-at-end">
        {/* <Button
          type="buttton"
          onClick={() => history.push('/ProfileSettings')}
          className="back-btn"
        >
          Back
        </Button> */}
      </div>
      <Card className="doc-verification-card">
        <h2 className="doc-verification-heading">Document Verification</h2>

        <Form form={form} onFinish={handleOk} labelCol={{ span: 4 }} wrapperCol={{ span: 14 }}>
          <div className="doc-upload-container">
            {[
              {
                title: 'ID Proof (Front Side)',
                status: idView,
                name: 'idProofFile',
                fileList: idFileList,
                handleChange: handleIdFileChange,
                imageAlt: 'idProofFront',
                previewImage: idPreviewImage,
              },
              {
                title: 'ID Proof (Back Side)',
                status: idViewBack,
                name: 'IdProofFileBackPage',
                fileList: idFileListBack,
                handleChange: handleIdFileChangeBack,
                imageAlt: 'idProofBack',
                previewImage: idBackPreviewImage,
              },
              {
                title: 'Proof of Address',
                status: addressView,
                name: 'addressProofFile',
                fileList: addressFileList,
                handleChange: handleAddressFileChange,
                imageAlt: 'addressProof',
                previewImage: addressPreviewImage,
              },
            ].map((doc, index) => (
              <Card key={index} className="doc-upload-card">
                <div className="doc-image-wrapper">
                  {/* Show server image if available, otherwise show preview image */}
                  <img
                    src={doc.status.image || doc.previewImage || ''}
                    alt={doc.imageAlt}
                    className={`doc-image ${
                      doc.status.image || doc.previewImage ? 'visible' : 'hidden'
                    }`}
                    onClick={handleImageClick1}
                  />
                </div>

                <h3 className="doc-title">{doc.title}</h3>

                <p className="doc-status">
                  Status: <span style={{ color: doc.status.color }}>{doc.status.text}</span>
                </p>

                {!doc.status.image && (
                  <Form.Item
                    className="custom-upload-box"
                    valuePropName="fileList"
                    getValueFromEvent={normFile}
                    name={doc.name}
                    help={
                      <div className="error-message">Please upload {doc.title.toLowerCase()}</div>
                    }
                    style={{ marginBottom: 0 }}
                  >
                    <Upload
                      {...props}
                      name="avatar"
                      fileList={doc.fileList}
                      onChange={doc.handleChange}
                      beforeUpload={beforeUpload}
                      className="img-ver"
                      showUploadList={false}
                    >
                      <Button icon={<UploadOutlined />}>Upload</Button>
                    </Upload>
                  </Form.Item>
                )}

                {doc.status.text === 'Rejected' && !doc.image && (
                  <Button type="primary" onClick={handleUpdate}>
                    Upload Again
                  </Button>
                )}
                {doc.status.text === 'Approved' && (
                  <Button disabled type="default">
                    Verified
                  </Button>
                )}
              </Card>
            ))}
          </div>

          <div className="doc-btn-group">
            <Button type="primary" htmlType="submit" loading={loading} onClick={handleUpdate}>
              Update Documents
            </Button>

            {hasRequestedDocuments && (
              <Button className="doc-cancel-btn" onClick={handleCancelProof}>
                Cancel
              </Button>
            )}
          </div>
        </Form>
      </Card>
    </>
  );
};

export default Verification;
