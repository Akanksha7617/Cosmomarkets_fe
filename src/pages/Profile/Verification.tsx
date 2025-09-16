import { api } from '@/components/common/api';
import { ProofRequestModel, Status } from '@/generated';
import { DeleteOutlined, FileOutlined, UploadOutlined } from '@ant-design/icons';
import { Button, Card, Form, message, Modal, Upload ,Avatar} from 'antd';
import { RcFile, UploadProps } from 'antd/es/upload';
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
      content: (
        <div className="notification-content">
          <span className="notification-icon" />
          <span className="notification-text">You can only upload JPG/PNG file!</span>
        </div>
      ),
      className: 'error-notification',
      duration: 4,
    });
  }
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isLt2M) {
    message.error({
      content: (
        <div className="notification-content">
          <span className="notification-icon" />
          <span className="notification-text">Image must be smaller than 2MB!</span>
        </div>
      ),
      className: 'error-notification',
      duration: 4,
    });
  }
  return isJpgOrPng && isLt2M;
};

const Verification: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [userInitial, setUserInitial] = useState('');

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

  const [idPreviewImage, setIdPreviewImage] = useState<string>('');
  const [idBackPreviewImage, setIdBackPreviewImage] = useState<string>('');
  const [addressPreviewImage, setAddressPreviewImage] = useState<string>('');

  const [idFileList, setIdFileList] = useState<any[]>([]);
  const [idFileListBack, setIdFileListBack] = useState<any[]>([]);
  const [addressFileList, setAddressFileList] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const [managerComment, setManagerComment] = useState<string>();
  const [record, setRecord] = useState<ProofRequestModel>();
  const [showCancelButton, setShowCancelButton] = useState(false);

  const isUpdateButtonDisabled =
    idView.Status !== Status.NOT_REQUESTED &&
    idView.Status !== Status.REJECTED &&
    idViewBack.Status !== Status.NOT_REQUESTED &&
    idViewBack.Status !== Status.REJECTED &&
    addressView.Status !== Status.NOT_REQUESTED &&
    addressView.Status !== Status.REJECTED;

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    try {
      const requests = await api.proof.getMyRequest();
      let anyRequested = false;

      let idStatus = Status.NOT_REQUESTED;
      let idBackStatus = Status.NOT_REQUESTED;
      let addressStatus = Status.NOT_REQUESTED;

      let idImageDataUrl = '';
      let idImageDataUrlBack = '';
      let addressImageDataUrl = '';

      if (requests.length > 0) {
        const r = requests[0];
        setRecord(r);

        if (r.idProofName) {
          const ext = r.idProofName.split('.').pop().toLowerCase();
          idImageDataUrl = `data:image/${ext};base64,${r.idProof}`;
          idStatus =
            r.idProofStatus !== undefined
              ? r.idProofStatus
              : r.status !== Status.REJECTED
              ? r.status
              : Status.NOT_REQUESTED;
          setIdPreviewImage(idImageDataUrl);
        }

        if (r.idProofBackPageName) {
          const ext = r.idProofBackPageName.split('.').pop().toLowerCase();
          idImageDataUrlBack = `data:image/${ext};base64,${r.idProofBackPage}`;
          idBackStatus =
            r.idProofBackStatus !== undefined
              ? r.idProofBackStatus
              : r.status !== Status.REJECTED
              ? r.status
              : Status.NOT_REQUESTED;
          setIdBackPreviewImage(idImageDataUrlBack);
        }

        if (r.addressProofName) {
          const ext = r.addressProofName.split('.').pop().toLowerCase();
          addressImageDataUrl = `data:image/${ext};base64,${r.addressProof}`;
          addressStatus =
            r.addressProofStatus !== undefined
              ? r.addressProofStatus
              : r.status !== Status.REJECTED
              ? r.status
              : Status.NOT_REQUESTED;
          setAddressPreviewImage(addressImageDataUrl);
        }

        if (
          idStatus === Status.REQUESTED ||
          idBackStatus === Status.REQUESTED ||
          addressStatus === Status.REQUESTED
        ) {
          anyRequested = true;
          setShowCancelButton(true);
        }
      }

      const getStatusText = (status) => {
        switch (status) {
          case Status.APPROVED:
            return 'APPROVED';
          case Status.REQUESTED:
            return 'REQUESTED';
          case Status.REJECTED:
            return 'REJECTED';
          default:
            return 'NOT_REQUESTED';
        }
      };

      setIdView({
        Status: idStatus,
        color: getStatusColor(idStatus),
        text: getStatusText(idStatus),
        desc: '',
        image: idImageDataUrl,
        isImage: !!idImageDataUrl,
      });

      setIdViewBack({
        Status: idBackStatus,
        color: getStatusColor(idBackStatus),
        text: getStatusText(idBackStatus),
        desc: '',
        image: idImageDataUrlBack,
        isImage: !!idImageDataUrlBack,
      });

      setAddressView({
        Status: addressStatus,
        color: getStatusColor(addressStatus),
        text: getStatusText(addressStatus),
        desc: '',
        image: addressImageDataUrl,
        isImage: !!addressImageDataUrl,
      });
    } catch (error) {
      console.error('Error initializing verification:', error);
      message.error({
        content: (
          <div className="notification-content">
            <span className="notification-icon" />
            <span className="notification-text">Error loading verification status</span>
          </div>
        ),
        className: 'error-notification',
        duration: 4,
      });
    }
  };

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

 // Updated getStatusBadge function for your Verification component

const getStatusBadge = (status) => {
  const statusText = typeof status.text === 'string' ? status.text.toUpperCase() : status.text;
  
  if (statusText === 'APPROVED') {
    return (
      <div className="verification-badge verification-badge-verified">
        <div className="verification-badge-icon"></div>
        <span>Complete</span>
      </div>
    );
  } else if (statusText === 'REQUESTED') {
    return (
      <div className="verification-badge verification-badge-pending">
        <div className="verification-badge-icon"></div>
        <span>Pending</span>
      </div>
    );
  } else if (statusText === 'REJECTED') {
    return (
      <div className="verification-badge verification-badge-rejected">
        <div className="verification-badge-icon"></div>
        <span>Rejected</span>
      </div>
    );
  } else {
    return <span className="verification-badge verification-badge-upload">Upload</span>;
  }
};

  const hasRequestedDocuments =
    idView.Status === Status.REQUESTED ||
    idViewBack.Status === Status.REQUESTED ||
    addressView.Status === Status.REQUESTED;

  const handleCancelProof = async () => {
    try {
      setLoading(true);
      const response = await api.proof.cancelRequest();
      console.log('API Response:', response);
      message.success({
        content: (
          <div className="notification-content">
            <span className="notification-icon" />
            <span className="notification-text">Verification request cancelled</span>
          </div>
        ),
        className: 'success-notification',
        duration: 4,
      });
      await init();
      setShowCancelButton(false);
    } catch (error) {
      console.error('Error cancelling verification:', error);
      message.error({
        content: (
          <div className="notification-content">
            <span className="notification-icon" />
            <span className="notification-text">Error cancelling verification</span>
          </div>
        ),
        className: 'error-notification',
        duration: 4,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl);
    setModalVisible(true);
  };

 const props: UploadProps = {
  beforeUpload: (file) => {
    // ✅ Accept images + PDF
    const acceptedFormats = ['image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'application/pdf'];
    if (!acceptedFormats.includes(file.type)) {
      message.error({
        content: (
          <div className="notification-content">
            <span className="notification-icon" />
            <span className="notification-text">
              This file type is not supported. Please upload JPG, PNG, GIF, BMP, or PDF files.
            </span>
          </div>
        ),
        className: 'error-notification',
        duration: 4,
      });
      return Upload.LIST_IGNORE;
    }

    // ✅ File size validation still applies
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error({
        content: (
          <div className="notification-content">
            <span className="notification-icon" />
            <span className="notification-text">File must be smaller than 2MB!</span>
          </div>
        ),
        className: 'error-notification',
        duration: 4,
      });
      return Upload.LIST_IGNORE;
    }
    return true;
  },
};

  const normFile = (e: any) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e && e.fileList.slice(-1);
  };

  const handleIdFileChange = async ({ fileList }: any) => {
    setIdFileList(fileList);
    if (fileList.length > 0 && fileList[0].originFileObj) {
      const previewUrl = await getBase64(fileList[0].originFileObj);
      setIdPreviewImage(previewUrl);
    } else {
      setIdPreviewImage('');
    }
  };

  const handleIdFileChangeBack = async ({ fileList }: any) => {
    setIdFileListBack(fileList);
    if (fileList.length > 0 && fileList[0].originFileObj) {
      const previewUrl = await getBase64(fileList[0].originFileObj);
      setIdBackPreviewImage(previewUrl);
    } else {
      setIdBackPreviewImage('');
    }
  };

  const handleAddressFileChange = async ({ fileList }: any) => {
    setAddressFileList(fileList);
    if (fileList.length > 0 && fileList[0].originFileObj) {
      const previewUrl = await getBase64(fileList[0].originFileObj);
      setAddressPreviewImage(previewUrl);
    } else {
      setAddressPreviewImage('');
    }
  };

  const handleRemoveIdFile = () => {
    setIdFileList([]);
    setIdPreviewImage('');
  };

  const handleRemoveIdBackFile = () => {
    setIdFileListBack([]);
    setIdBackPreviewImage('');
  };

  const handleRemoveAddressFile = () => {
    setAddressFileList([]);
    setAddressPreviewImage('');
  };

  const updateLocalStatus = () => {
    if (idFileList.length > 0) {
      setIdView((prev) => ({
        ...prev,
        Status: Status.REQUESTED,
        text: 'REQUESTED',
        color: getStatusColor(Status.REQUESTED),
      }));
    }
    if (idFileListBack.length > 0) {
      setIdViewBack((prev) => ({
        ...prev,
        Status: Status.REQUESTED,
        text: 'REQUESTED',
        color: getStatusColor(Status.REQUESTED),
      }));
    }
    if (addressFileList.length > 0) {
      setAddressView((prev) => ({
        ...prev,
        Status: Status.REQUESTED,
        text: 'REQUESTED',
        color: getStatusColor(Status.REQUESTED),
      }));
    }
    setShowCancelButton(true);
  };

  const handleSubmit = () => {
    setLoading(true);
    setErrorMessage(null);
    form
      .validateFields()
      .then(async (values) => {
        const idFile = idFileList?.length > 0 ? idFileList[0] : null;
        const idFileBack = idFileListBack?.length > 0 ? idFileListBack[0] : null;
        const addrFile = addressFileList?.length > 0 ? addressFileList[0] : null;

        if (
          (idFile && idFile.originFileObj && idFile.originFileObj.size > 2 * 1024 * 1024) ||
          (idFileBack &&
            idFileBack.originFileObj &&
            idFileBack.originFileObj.size > 2 * 1024 * 1024) ||
          (addrFile && addrFile.originFileObj && addrFile.originFileObj.size > 2 * 1024 * 1024)
        ) {
          message.error({
            content: (
              <div className="notification-content">
                <span className="notification-icon" />
                <span className="notification-text">
                  Image size exceeds the limit. Please upload files less than 2MB.
                </span>
              </div>
            ),
            className: 'error-notification',
            duration: 4,
          });
          setLoading(false);
          return;
        }

        const isAnyFileUploaded = idFile || idFileBack || addrFile;
        if (!isAnyFileUploaded) {
          message.error({
            content: (
              <div className="notification-content">
                <span className="notification-icon" />
                <span className="notification-text">Please upload at least one document.</span>
              </div>
            ),
            className: 'error-notification',
            duration: 4,
          });
          setLoading(false);
          return;
        }

        let formData: any = {};
        if (idFile) {
          formData.IdProofFile = idFile?.originFileObj;
          formData.IdProofName = idFile?.name;
        }
        if (idFileBack) {
          formData.IdProofFileBackPage = idFileBack?.originFileObj;
          formData.IdProofBackPageName = idFileBack?.name;
        }
        if (addrFile) {
          formData.AddressProofFile = addrFile?.originFileObj;
          formData.AddressProofName = addrFile?.name;
        }

        try {
          updateLocalStatus();
          setTimeout(() => {
            if (idFile) setIdView((prev) => ({ ...prev }));
            if (idFileBack) setIdViewBack((prev) => ({ ...prev }));
            if (addrFile) setAddressView((prev) => ({ ...prev }));
          }, 0);
          await api.proof.postProofRequest(formData);
          message.success({
            content: (
              <div className="notification-content">
                <span className="notification-icon" />
                <span className="notification-text">Documents submitted successfully</span>
              </div>
            ),
            className: 'success-notification',
            duration: 4,
          });
        } catch (error) {
          console.error('Error submitting documents:', error);
          message.error({
            content: (
              <div className="notification-content">
                <span className="notification-icon" />
                <span className="notification-text">Error submitting documents</span>
              </div>
            ),
            className: 'error-notification',
            duration: 4,
          });
          init();
        } finally {
          setLoading(false);
        }
      })
      .catch((e) => {
        console.log(e);
        message.error({
          content: (
            <div className="notification-content">
              <span className="notification-icon" />
              <span className="notification-text">Please check your form inputs</span>
            </div>
          ),
          className: 'error-notification',
          duration: 4,
        });
        setLoading(false);
      });
  };

 const renderDocumentItem = (doc, index) => {
  const statusText =
    typeof doc.status.text === 'string' ? doc.status.text.toUpperCase() : doc.status.text;
  const isStatusRequested = statusText === 'REQUESTED';
  const isStatusApproved = statusText === 'APPROVED';
  const isStatusRejected = statusText === 'REJECTED';
  const isStatusNotRequested = !isStatusRequested && !isStatusApproved && !isStatusRejected;

  return (
    <div key={index} className="document-upload-card">
      <div className="upload-area">
        {doc.previewImage ? (
          <div className="uploaded-preview" onClick={() => handleImageClick(doc.previewImage)}>
            <img src={doc.previewImage} alt={doc.imageAlt} className="preview-image" />
            <div className="upload-overlay">
              <FileOutlined className="upload-icon" />
              <span>Click to view</span>
            </div>
          </div>
        ) : (
          <div className="upload-placeholder">
            <Form.Item
              className="hidden-upload-form-item"
              valuePropName="fileList"
              getValueFromEvent={normFile}
              name={doc.name}
              style={{ margin: 0, height: '100%', width: '100%' }}
            >
              <Upload
                {...props}
                name="document"
                fileList={doc.fileList}
                onChange={doc.handleChange}
                showUploadList={false}
                style={{ height: '100%', width: '100%' }}
              >
                <div className="upload-icon-container">
                  <UploadOutlined className="upload-main-icon" />
                </div>
                <p className="upload-text">Upload Media</p>
                <p className="upload-subtitle">
                  Photos must be less than <strong>2 MB</strong> in size.
                </p>
              </Upload>
            </Form.Item>
          </div>
        )}
      </div>
      
      <div className="document-card-info">
        <div className="document-name">{doc.title}</div>
        <div className="document-subtitle">{doc.subtitle}</div>
      </div>
      
      <div className="document-card-actions">
        <div className="status-section">
          {(isStatusRequested || isStatusApproved || isStatusRejected) && 
            getStatusBadge(doc.status)
          }
        </div>
        
        <div className="upload-controls">
          {(isStatusNotRequested || isStatusRejected) && (
            <Form.Item
              className="card-upload-form-item"
              valuePropName="fileList"
              getValueFromEvent={normFile}
              name={doc.name}
            >
              {/* <Upload
                {...props}
                name="document"
                fileList={doc.fileList}
                onChange={doc.handleChange}
                showUploadList={false}
              >
                <Button 
                  className={isStatusRejected ? "card-upload-again" : "card-upload-button"} 
                  type="primary" 
                  icon={<UploadOutlined />}
                >
                  {isStatusRejected ? 'Upload Again' : 'Upload'}
                </Button>
              </Upload> */}
            </Form.Item>
          )}
          
          {(doc.previewImage || doc.fileList.length > 0) && !isStatusApproved && (
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              className="remove-file-button"
              onClick={doc.removeHandler}
            >
              Remove
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

  return (
    <Card className="profile-card">
      <div className="account-wrapper">
        <div className="profile-info pdinginfo" style={{ marginBottom: 30 }}>
          <div className="avatar-container">
          </div>
          <div className="user-info">
            <h2 className="user-name">Verification</h2>
          </div>
        </div>
        <div className="verification-container">
          <Form form={form} onFinish={handleSubmit} layout="vertical">
            <div className="verification-documents-list">
              {renderDocumentItem(
                {
                  title: 'ID Verification',
                  status: idView,
                  name: 'idProofFile',
                  fileList: idFileList,
                  handleChange: handleIdFileChange,
                  imageAlt: 'ID Proof Front',
                  previewImage: idPreviewImage || idView.image,
                  removeHandler: handleRemoveIdFile,
                },
                0,
              )}
              {renderDocumentItem(
                {
                  title: 'ID Verification (Back)',
                  status: idViewBack,
                  name: 'IdProofFileBackPage',
                  fileList: idFileListBack,
                  handleChange: handleIdFileChangeBack,
                  imageAlt: 'ID Proof Back',
                  previewImage: idBackPreviewImage || idViewBack.image,
                  removeHandler: handleRemoveIdBackFile,
                },
                1,
              )}
              {renderDocumentItem(
                {
                  title: 'Proof of Address',
                  status: addressView,
                  name: 'addressProofFile',
                  fileList: addressFileList,
                  handleChange: handleAddressFileChange,
                  imageAlt: 'Address Proof',
                  previewImage: addressPreviewImage || addressView.image,
                  removeHandler: handleRemoveAddressFile,
                },
                2,
              )}
            </div>
            <div className="verification-actions">
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                disabled={isUpdateButtonDisabled}
                className="verification-update-button"
              >
                Update Documents
              </Button>
              {(hasRequestedDocuments || showCancelButton) && (
                <Button
                  className="verification-cancel-button"
                  onClick={handleCancelProof}
                  loading={loading}
                >
                  Cancel Request
                </Button>
              )}
            </div>
          </Form>
        </div>
      </div>
      <Modal
        open={modalVisible}
        footer={null}
        onCancel={() => setModalVisible(false)}
        width={600}
        centered
      >
        <img alt="Document Preview" style={{ width: '100%' }} src={selectedImage} />
      </Modal>
    </Card>
  );
};

export default Verification;
