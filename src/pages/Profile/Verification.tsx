import { api } from '@/components/common/api';
import { ProofRequestModel, Status } from '@/generated';
import { FileOutlined, UploadOutlined } from '@ant-design/icons';
import { Button, Form, message, Modal, Upload } from 'antd';
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
  const [loading, setLoading] = useState(false);
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

  // State variables to store preview images
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

  // Determine if update button should be disabled based on all document statuses
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

  // Initialize document statuses
  const init = async () => {
    try {
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
          idStatus =
            r.idProofStatus !== undefined
              ? r.idProofStatus
              : r.status !== Status.REJECTED
              ? r.status
              : Status.NOT_REQUESTED;

          // Set the preview image
          setIdPreviewImage(idImageDataUrl);
        }

        // Check ID Back proof status and image
        if (r.idProofBackPageName) {
          const ext = r.idProofBackPageName.split('.').pop().toLowerCase();
          idImageDataUrlBack = `data:image/${ext};base64,${r.idProofBackPage}`;

          // Set status based on individual document
          idBackStatus =
            r.idProofBackStatus !== undefined
              ? r.idProofBackStatus
              : r.status !== Status.REJECTED
              ? r.status
              : Status.NOT_REQUESTED;

          // Set the preview image
          setIdBackPreviewImage(idImageDataUrlBack);
        }

        // Check Address proof status and image
        if (r.addressProofName) {
          const ext = r.addressProofName.split('.').pop().toLowerCase();
          addressImageDataUrl = `data:image/${ext};base64,${r.addressProof}`;

          // Set status based on individual document
          addressStatus =
            r.addressProofStatus !== undefined
              ? r.addressProofStatus
              : r.status !== Status.REJECTED
              ? r.status
              : Status.NOT_REQUESTED;

          // Set the preview image
          setAddressPreviewImage(addressImageDataUrl);
        }

        // Check if any document is requested
        if (
          idStatus === Status.REQUESTED ||
          idBackStatus === Status.REQUESTED ||
          addressStatus === Status.REQUESTED
        ) {
          anyRequested = true;
          setShowCancelButton(true);
        }
      }

      // Convert enum Status to string for consistent display
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

      // Update each view with its respective status
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
        content: 'Error loading verification status',
        icon: <span className="orange-error-icon"> ✘ </span>,
        className: 'orange-error-notification',
        duration: 3,
      });
    }
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

  // Helper function to get status badge text and style
  const getStatusBadge = (status) => {
    // Convert status.text to uppercase for consistent comparison
    const statusText = typeof status.text === 'string' ? status.text.toUpperCase() : status.text;

    if (statusText === 'APPROVED') {
      return <span className="verification-badge verification-badge-verified">Verified</span>;
    } else if (statusText === 'REQUESTED') {
      return <span className="verification-badge verification-badge-pending">Pending</span>;
    } else if (statusText === 'REJECTED') {
      return <span className="verification-badge verification-badge-rejected">Rejected</span>;
    } else {
      return <span className="verification-badge verification-badge-upload">Upload</span>;
    }
  };

  // Check if any document is in requested state
  const hasRequestedDocuments =
    idView.Status === Status.REQUESTED ||
    idViewBack.Status === Status.REQUESTED ||
    addressView.Status === Status.REQUESTED;

  const handleCancelProof = async () => {
    try {
      setLoading(true);
      const response = await api.proof.cancelRequest();
      console.log('API Response:', response);
      message.success('Verification request cancelled');
      await init();
      setShowCancelButton(false);
    } catch (error) {
      console.error('Error cancelling verification:', error);
      message.error({
        content: 'Error cancelling verification',
        icon: <span className="orange-error-icon"> ✘ </span>,
        className: 'orange-error-notification',
        duration: 3,
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
      const acceptedFormats = ['image/jpeg', 'image/png', 'image/gif', 'image/bmp'];

      if (!acceptedFormats.includes(file.type)) {
        message.error({
          content: 'This file type is not supported. Please upload a valid image format.',
          icon: <span className="orange-error-icon"> ✘ </span>,
          className: 'orange-error-notification',
          duration: 3,
        });
        return Upload.LIST_IGNORE;
      }

      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        message.error({
          content: 'Image must be smaller than 2MB!',
          icon: <span className="orange-error-icon"> ✘ </span>,
          className: 'orange-error-notification',
          duration: 3,
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

  // Update local status to REQUESTED immediately after form submission
  const updateLocalStatus = () => {
    // Update ID Front status if a file is uploaded
    if (idFileList.length > 0) {
      setIdView((prev) => ({
        ...prev,
        Status: Status.REQUESTED,
        text: 'REQUESTED', // Using string directly to ensure consistency
        color: getStatusColor(Status.REQUESTED),
      }));
    }

    // Update ID Back status if a file is uploaded
    if (idFileListBack.length > 0) {
      setIdViewBack((prev) => ({
        ...prev,
        Status: Status.REQUESTED,
        text: 'REQUESTED', // Using string directly to ensure consistency
        color: getStatusColor(Status.REQUESTED),
      }));
    }

    // Update Address Proof status if a file is uploaded
    if (addressFileList.length > 0) {
      setAddressView((prev) => ({
        ...prev,
        Status: Status.REQUESTED,
        text: 'REQUESTED', // Using string directly to ensure consistency
        color: getStatusColor(Status.REQUESTED),
      }));
    }

    // Show cancel button if any document is now in REQUESTED state
    setShowCancelButton(true);
  };

  const handleSubmit = () => {
    setLoading(true);
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
            content: 'Image size exceeds the limit. Please upload files less than 2MB.',
            icon: <span className="orange-error-icon"> ✘ </span>,
            className: 'orange-error-notification',
            duration: 3,
          });
          setLoading(false);
          return;
        }

        const isAnyFileUploaded = idFile || idFileBack || addrFile;

        if (!isAnyFileUploaded) {
          message.error({
            content: 'Please upload at least one document.',
            icon: <span className="orange-error-icon"> ✘ </span>,
            className: 'orange-error-notification',
            duration: 3,
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
          // First update the local state to show "Pending" immediately
          updateLocalStatus();

          // Forcing a re-render to make sure status changes are visible
          setTimeout(() => {
            // This setState call forces React to re-render with the new status
            if (idFile) {
              setIdView((prev) => ({ ...prev }));
            }
            if (idFileBack) {
              setIdViewBack((prev) => ({ ...prev }));
            }
            if (addrFile) {
              setAddressView((prev) => ({ ...prev }));
            }
          }, 0);

          // Then make the API call
          await api.proof.postProofRequest(formData);
          message.success('Documents submitted successfully');

          // No need to call init() here as we've already updated the local state
        } catch (error) {
          console.error('Error submitting documents:', error);
          message.error({
            content: 'Error submitting documents',
            icon: <span className="orange-error-icon"> ✘ </span>,
            className: 'orange-error-notification',
            duration: 3,
          });
          // If there's an error, revert to the previous state
          init();
        } finally {
          setLoading(false);
        }
      })
      .catch((e) => {
        console.log(e);
        message.error({
          content: 'Please check your form inputs',
          icon: <span className="orange-error-icon"> ✘ </span>,
          className: 'orange-error-notification',
          duration: 3,
        });
        setLoading(false);
      });
  };

  // Render document item with correct UI states based on status
  const renderDocumentItem = (doc, index) => {
    // Make sure we're consistently working with uppercase strings for comparison
    const statusText =
      typeof doc.status.text === 'string' ? doc.status.text.toUpperCase() : doc.status.text;

    const isStatusRequested = statusText === 'REQUESTED';
    const isStatusApproved = statusText === 'APPROVED';
    const isStatusRejected = statusText === 'REJECTED';
    const isStatusNotRequested = !isStatusRequested && !isStatusApproved && !isStatusRejected;

    console.log(`Document ${doc.title} status: ${statusText}`, {
      isRequested: isStatusRequested,
      isApproved: isStatusApproved,
      isRejected: isStatusRejected,
      isNotRequested: isStatusNotRequested,
    });

    return (
      
      <div key={index} className="verification-document-item">
          
        <div className="verification-document-details">
          {/* Document Thumbnail */}
          {doc.previewImage ? (
            <div className="document-thumbnail" onClick={() => handleImageClick(doc.previewImage)}>
              <img src={doc.previewImage} alt={doc.imageAlt} />
            </div>
          ) : (
            <div className="document-thumbnail placeholder">
              <FileOutlined />
            </div>
          )}

          {/* Document Info */}
          <div className="verification-document-info">
            <div className="verification-document-title">{doc.title}</div>
            <div className="verification-document-subtitle">{doc.subtitle}</div>
          </div>
        </div>

        <div className="verification-document-status">
          {/* Always display the current status badge */}
          {getStatusBadge(doc.status)}

          {/* Show upload button only if not requested or approved */}
          {isStatusNotRequested && (
            <Form.Item
              className="verification-upload-form-item"
              valuePropName="fileList"
              getValueFromEvent={normFile}
              name={doc.name}
            >
              <Upload
                {...props}
                name="document"
                fileList={doc.fileList}
                onChange={doc.handleChange}
                showUploadList={false}
              >
                <Button className="verification-upload-button" icon={<UploadOutlined />}>
                  Upload
                </Button>
              </Upload>
            </Form.Item>
          )}

          {/* Show Upload Again button for rejected documents */}
          {isStatusRejected && (
            <Form.Item
              className="verification-upload-form-item"
              valuePropName="fileList"
              getValueFromEvent={normFile}
              name={doc.name}
            >
              <Upload
                {...props}
                name="document"
                fileList={doc.fileList}
                onChange={doc.handleChange}
                showUploadList={false}
              >
                <Button type="primary" className="verification-upload-again">
                  Upload Again
                </Button>
              </Upload>
            </Form.Item>
          )}

          {/* Show Verified button for approved documents */}
          {isStatusApproved && (
            <Button disabled type="default" className="verification-verified-button">
              Verified
            </Button>
          )}

          {/* Show Pending button for requested documents */}
          {isStatusRequested && (
            <Button disabled type="default" className="verification-pending-button">
              Pending
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Account Wrapper inspired by MY ACCOUNT section */}
      <div className="account-wrapper">
        <div className="account-headerr">
          {/* <div className="account-avatar">
            <div className="account-letter">V</div>
          </div> */}
          <div className="account-title">
            <h2>VERIFICATION</h2>
            <div className="account-subtitle">
              <span className="verification-tag">Documents</span>
            </div>
          </div>
        </div>
        
        {/* Verification Container (Using similar styles as the original) */}
        <div className="verification-container">
          <Form form={form} onFinish={handleSubmit} layout="vertical">
            <div className="verification-documents-list">
              {renderDocumentItem(
                {
                  title: 'ID Verification',
                  subtitle: 'Passport or ID card (front)',
                  status: idView,
                  name: 'idProofFile',
                  fileList: idFileList,
                  handleChange: handleIdFileChange,
                  imageAlt: 'ID Proof Front',
                  previewImage: idPreviewImage || idView.image,
                },
                0,
              )}

              {renderDocumentItem(
                {
                  title: 'ID Verification (Back)',
                  subtitle: 'Passport or ID card (back)',
                  status: idViewBack,
                  name: 'IdProofFileBackPage',
                  fileList: idFileListBack,
                  handleChange: handleIdFileChangeBack,
                  imageAlt: 'ID Proof Back',
                  previewImage: idBackPreviewImage || idViewBack.image,
                },
                1,
              )}

              {renderDocumentItem(
                {
                  title: 'Proof of Address',
                  subtitle: 'Utility bill or bank statement',
                  status: addressView,
                  name: 'addressProofFile',
                  fileList: addressFileList,
                  handleChange: handleAddressFileChange,
                  imageAlt: 'Address Proof',
                  previewImage: addressPreviewImage || addressView.image,
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

      {/* Image Preview Modal */}
      <Modal
        open={modalVisible}
        footer={null}
        onCancel={() => setModalVisible(false)}
        width={600}
        centered
      >
        <img alt="Document Preview" style={{ width: '100%' }} src={selectedImage} />
      </Modal>
    </>
  );
};


export default Verification;