import { api } from '@/components/common/api';
import { ProofRequestModel, Status } from '@/generated';
import { useModel } from '@@/exports';
import { EditOutlined, RedoOutlined, SearchOutlined } from '@ant-design/icons';
import type { ActionType } from '@ant-design/pro-components';
import { Button, Divider, Form, Input, InputRef, Modal, Space, theme, Typography } from 'antd';
import type { ColumnType, FilterConfirmProps } from 'antd/es/table/interface';
import { useEffect, useRef, useState } from 'react';
// import {scalarOptions} from "yaml";
// import Str = scalarOptions.Str;
import moment from 'moment';
import DataTable from 'react-data-table-component';
import CustomLoader from '../CustomLoader';

export type ConViewProof = {
  Status: Status;
  color: string;
  text: string;
  desc: string;
  image: string;
  isImage: false;
  fileName: string;
};

export default () => {
  const actionRef = useRef<ActionType>();
  const [data, setData] = useState([]);
  const { initialState, setInitialState } = useModel('@@initialState');
  const { token } = theme.useToken();

  const [form] = Form.useForm();
  const [visible, setVisible] = useState(false);
  const [selected, setSelected] = useState<ProofRequestModel>({});
  const { Title, Text } = Typography;
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const [refreshCount, setRefreshCount] = useState(0);

  const searchInput = useRef<InputRef>();

  const [idView, setIdView] = useState<ConViewProof>({
    Status: Status.NOT_REQUESTED,
    color: 'orange',
    desc: '',
    text: '',
    image: '',
    isImage: false,
    fileName: '',
  });
  const [idBackView, setIdBackView] = useState<ConViewProof>({
    Status: Status.NOT_REQUESTED,
    color: 'orange',
    desc: '',
    text: '',
    image: '',
    isImage: false,
    fileName: '',
  });
  const [addressView, setAddressView] = useState<ConViewProof>({
    Status: Status.NOT_REQUESTED,
    color: 'orange',
    desc: '',
    text: '',
    image: '',
    isImage: false,
    fileName: '',
  });

  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const [globalSearchText, setGlobalSearchText] = useState('');
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [pdfConvert, setPdfConvert] = useState('');
  const [pdfConvertBack, setPdfConvertBack] = useState('');
  const [pdfConvertAddress, setPdfConvertAddress] = useState('');

  const handleSearchDebounced = (value: any) => {
    // Clear previous search timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Set a new timeout for debounce
    const timeout = setTimeout(() => {
      getData(pagination.current, pagination.pageSize, value);
    }, 500); // Set the debounce delay here (500ms in this example)
    setSearchTimeout(timeout);
  };

  useEffect(() => {
    handleSearchDebounced(globalSearchText);
  }, [globalSearchText, pagination.current, pagination.pageSize]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  const getData = async (page: any, pageSize: any, param: any) => {
    // api.proof.getRequests().then(response => setData(response))
    try {
      setLoading(true);
      const response = await api.proof.getProofRequestsAdmin(page, pageSize, param);
      setData(response.requests);
      setPagination({ ...pagination, current: page, total: response.totalRecords });
      setLoading(false);
    } catch (error) {
      console.log('Under Proof Page ', console.error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: any) => {
    setPagination({ ...pagination, current: page });
  };

  // Function to handle page size changes
  // const handlePageSizeChange = (pageSize: any) => {
  //   setPagination({ ...pagination, current: 1, pageSize }); // Reset to first page when page size changes
  // };
  const handlePageSizeChange = (size) => {
    const totalRecords = pagination.total;
    const currentRecordIndex = (pagination.current - 1) * pagination.pageSize;
    const newPageIndex = Math.ceil((currentRecordIndex + 1) / size);

    setPagination({
      ...pagination,
      pageSize: size,
      current: newPageIndex,
    });
  };

  const handleSearch = (
    selectedKeys: string[],
    confirm: (param?: FilterConfirmProps) => void,
    dataIndex: string,
  ) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters: () => void) => {
    clearFilters();
    setSearchText('');
  };

  const getColumnSearchProps = (dataIndex: string): ColumnType<dataIndex> => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          ref={searchInput}
          placeholder={`Search ${data}`}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys as string[], confirm, dataIndex)}
          style={{ marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys as string[], confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              confirm({ closeDropdown: false });
              setSearchText((selectedKeys as string[])[0]);
              setSearchedColumn(data);
            }}
          >
            Filter
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              close();
            }}
          >
            close
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered: boolean) => (
      <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
    ),
    onFilter: (value, record) =>
      record[dataIndex]
        .toString()
        .toLowerCase()
        .includes((value as string).toLowerCase()),
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
  });
  const handleEdit = async (record: ProofRequestModel) => {
    // const password = record.mtUsers?.find(m => m.accountType == AccountType.CLIENT)?.password;
    // var s: SignUpRequest = {
    //   ...record,
    //   password: password
    // }

    const response = await api.proof.getProofSettingEdit(record.id);

    setSelected(record);
    form.setFieldsValue(record);

    let idImageDataUrl = '';
    let addressImageDataUrl = '';
    let idImageBackDataUrl = '';
    let s: Status = Status.NOT_REQUESTED;
    let isIdProofImage = false;
    let isAddressProofImage = false;
    let isBackProofImage = false;
    let fName = '';
    let fNameBack = '';
    let fNameAddress = '';
    if (record) {
      const r = response;
      s = r?.status || Status.NOT_REQUESTED;
      if (r.idProofName) {
        console.log('addressProofName');
        console.log(r.idProofName);
        // @ts-ignore
        const ext = r.idProofName.split('.').pop().toLowerCase();
        if (!ext.includes('pdf')) {
          isIdProofImage = true;
        }
        idImageDataUrl = `data:image/${ext};base64,${r.idProof}`;
        setPdfConvert(idImageDataUrl);
        fName = r.idProofName;
      }
      if (r.addressProofName) {
        console.log(r.addressProofName);
        // @ts-ignore
        const ext = r.addressProofName.split('.').pop().toLowerCase();
        if (!ext.includes('pdf')) {
          isAddressProofImage = true;
        }
        addressImageDataUrl = `data:image/${ext};base64,${r.addressProof}`;
        setPdfConvertAddress(addressImageDataUrl);
        fNameAddress = r.addressProofName;
      }
      if (r.idProofBackPageName) {
        console.log(r.idProofBackPageName);
        // @ts-ignore
        const ext = r.idProofBackPageName.split('.').pop().toLowerCase();

        if (!ext.includes('pdf')) {
          isBackProofImage = true;
        }
        idImageBackDataUrl = `data:image/${ext};base64,${r.idProofBackPage}`;
        setPdfConvertBack(idImageBackDataUrl);
        fNameBack = r.idProofBackPageName;
      }
    }

    setIdView({
      Status: s,
      color: s === Status.APPROVED ? 'green' : s === Status.REQUESTED ? 'orange' : 'red',
      text: s,
      desc: '',
      image: idImageDataUrl,
      isImage: isIdProofImage,
      fileName: fName,
    });
    setAddressView({
      Status: s,
      color: s === Status.APPROVED ? 'green' : s === Status.REQUESTED ? 'orange' : 'red',
      text: s,
      desc: '',
      image: addressImageDataUrl,
      isImage: isAddressProofImage,
      fileName: fNameAddress,
    });
    setIdBackView({
      Status: s,
      color: s === Status.APPROVED ? 'green' : s === Status.REQUESTED ? 'orange' : 'red',
      text: s,
      desc: '',
      image: idImageBackDataUrl,
      isImage: isBackProofImage,
      fileName: fNameBack,
    });
    setVisible(true);
  };

  const handleApproval = (isApproved: boolean) => {
    form.validateFields().then(async (values) => {
      if (!selected.id) {
        return;
      }
      await api.proof.putProofRequestById(selected.id, {
        approved: isApproved,
        comment: form.getFieldValue('managerComment'),
      });
      setVisible(false);
      await getData(pagination.current, pagination.pageSize, '');
    });
  };
  const handleDivRefresh = () => {
    getData(pagination.current, pagination.pageSize, globalSearchText);
  };

  const handleApprove = () => {
    handleApproval(true);
  };

  const handleReject = () => {
    handleApproval(false);
  };

  const handleCancel = () => {
    setVisible(false);
  };

  const columns = [
    {
      name: 'Id',
      selector: 'id',
      sortable: true,
      wrap: true,
      // Add additional props as needed
    },
    {
      name: 'User Name',
      selector: 'userName',
      sortable: true,
      // Add additional props as needed
    },
    {
      name: 'Email',
      selector: 'emailId',
    },
    {
      name: 'Request Date',
      selector: 'requestedAt',
      sortable: true,
      format: (row) => moment(row.requestedAt).format('YYYY-MM-DD'),
      width: '170px',
    },
    {
      name: 'Complete Date',
      selector: 'completedAt',
      sortable: true,
      format: (row) => moment(row.completedAt).format('YYYY-MM-DD'),
      width: '170px',
    },
    {
      name: 'Status',
      selector: 'status',
      hide: true, // Hide the column in the initial view
      right: true,
      cell: (row) => {
        const statusText = row.status;
        const statusValueEnum = {
          Rejected: {
            text: 'Rejected',
            status: 'Error',
          },
          Approved: {
            text: 'Approved',
            status: 'Success',
          },
          Requested: {
            text: 'Requested',
            status: 'Processing',
          },
          Completed: {
            text: `Completed`,
            status: 'Success',
          },
        };

        const statusValue = statusValueEnum[statusText];
        return (
          <span style={{ color: statusValue.status === 'Success' ? 'green' : 'red' }}>
            {statusValue.text}
          </span>
        );
      },
    },
  ];

  if (initialState?.currentUser?.roles?.includes('Manager')) {
    columns.push({
      name: 'Action',
      selector: 'option',
      cell: (row) => (
        <Button type="link" onClick={() => handleEdit(row)}>
          <EditOutlined />
        </Button>
      ),
    });
  }

  const customStyles = {
    headCells: {
      style: {
        background: '#2b2726', // Specify your gradient or background color here
        color: 'white', // Set the font color to make it visible
        fontWeight: 'bold',
        fontSize: '15px',
        borderBottom: '2px solid #fff',
      },
    },
    rows: {
      style: {
        '&:hover': {
          background: '#f5f5f5', // Set the highlight color here
          transition: 'background-color 0.3s ease', // Add a smooth transition effect
          cursor: 'pointer',
        },
      },
    },
  };

  const handleDownloadClick = (fileName: any, pdfLink: any | undefined) => {
    console.log('finside', fileName);
    const downloadLink = document.createElement('a');
    downloadLink.href = pdfLink;
    downloadLink.download = fileName;
    downloadLink.click();
  };
  console.log('<--->', idView.fileName);

  return (
    <div className="search-table">
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
        <Input
          size="small"
          placeholder="Search"
          prefix={<SearchOutlined style={{ color: '#eeab4c' }} />}
          style={{
            width: '250px',
            height: '40px',
            marginBottom: '16px',
            border: '2px solid #eeab4c',
            borderRadius: '10px 0px 10px 0px', // Diagonal edges
            paddingLeft: '15px',
            backgroundColor: '#fff',
          }}
          value={globalSearchText}
          onChange={(e) => setGlobalSearchText(e.target.value)}
        />
      </div>
      {/* {loading ? (
        <CustomLoader />
      ) : ( */}

      <div className="my-data-table proofs-data-table">
        <h2>VERIFICATION</h2>
        <DataTable
          columns={columns}
          className="my-data-table"
          data={data}
          customStyles={customStyles}
          keyField="id"
          highlightOnHover
          responsive
          selectableRows={false}
          dense
          pagination
          paginationServer
          paginationTotalRows={pagination.total}
          paginationPerPage={10}
          onChangePage={handlePageChange}
          onChangeRowsPerPage={handlePageSizeChange}
          paginationRowsPerPageOptions={[10, 20, 30]}
          paginationComponentOptions={{ rowsPerPageText: 'Rows per page:' }}
          progressPending={loading}
          progressComponent={loading ? <CustomLoader /> : null}
          actions={[
            <a key="handleDivRefresh" onClick={handleDivRefresh}>
              <RedoOutlined style={{ color: '#f89d42', height: 70 }} />
            </a>,

            //  <a key="exportExcel" onClick={exportExcel}><FileExcelOutlined /></a>,
            // <a key="handleDivRefresh" onClick={handleDivRefresh}><RedoOutlined /></a>
          ]}
        />
      </div>
      {/* )} */}

      <Modal
        title=" "
        open={visible}
        //onOk={handleOk}
        onCancel={() => setVisible(false)}
        footer={[
          <Button key="approve" type="primary" onClick={handleApprove}>
            Approve
          </Button>,
          <Button key="reject" onClick={handleReject}>
            Reject
          </Button>,
          <Button key="cancel" onClick={handleCancel}>
            Cancel
          </Button>,
        ]}
      >
        <Title level={3}>Verification</Title>
        <Space>
          <Form form={form} labelCol={{ span: 4 }} wrapperCol={{ span: 14 }}>
            <h2 style={{ textAlign: 'center' }}>ID Proof (Front Side)</h2>

            {idView.image && (
              <div style={{ textAlign: 'center' }}>
                {!idView.isImage ? (
                  <button onClick={() => handleDownloadClick(idView.fileName, pdfConvert)}>
                    <img src="\images\pdf-image.png" alt="" style={{ width: 80, height: 100 }} />
                  </button>
                ) : (
                  <img
                    src={idView.image}
                    alt="idProof"
                    style={{ maxWidth: '100%', maxHeight: 'calc(100vh - 200px)' }}
                  />
                )}
              </div>
            )}

            <Divider />

            <h2 style={{ textAlign: 'center' }}>ID Proof (Back Side)</h2>
            {idBackView.image && (
              <div style={{ textAlign: 'center' }}>
                {!idBackView.isImage ? (
                  <button onClick={() => handleDownloadClick(idBackView.fileName, pdfConvertBack)}>
                    <img src="\images\pdf-image.png" alt="" style={{ width: 80, height: 100 }} />
                  </button>
                ) : (
                  <img
                    src={idBackView.image}
                    alt="idProof"
                    style={{ maxWidth: '100%', maxHeight: 'calc(100vh - 200px)' }}
                  />
                )}
              </div>
            )}

            <Divider />

            <h2 style={{ textAlign: 'center' }}>Proof Of Address</h2>
            {addressView.image && (
              <div style={{ textAlign: 'center' }}>
                {!addressView.isImage ? (
                  <button
                    onClick={() => handleDownloadClick(addressView.fileName, pdfConvertAddress)}
                  >
                    <img src="\images\pdf-image.png" alt="" style={{ width: 80, height: 100 }} />
                  </button>
                ) : (
                  <img
                    src={addressView.image}
                    alt="addressProof"
                    style={{ maxWidth: '100%', maxHeight: 'calc(100vh - 200px)' }}
                  />
                )}
              </div>
            )}

            <Divider />

            <Form.Item
              label={'Comment'}
              name="managerComment"
              rules={[
                {
                  required: true,
                  message: 'Comment is required',
                },
              ]}
              labelCol={{ span: 10 }}
              wrapperCol={{ span: 16 }}
            >
              <Input.TextArea placeholder="Enter comment" />
            </Form.Item>
          </Form>
        </Space>
      </Modal>
    </div>
  );
};
