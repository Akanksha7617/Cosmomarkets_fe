 import {
  FileExcelOutlined,
  RedoOutlined,
  SearchOutlined,
  DownOutlined,
  LoadingOutlined,
} from '@ant-design/icons';

import type { ActionType } from '@ant-design/pro-components';
import { api, rawApi } from '@/components/common/api';
import { TextPopconfirm } from '@/components/Custom/TextPopconfirm';
import { AppUserDto, TransactionModel } from '@/generated';
import { Encrypt } from '@/generated/services/Encrypt';
import CustomLoader from '@/pages/CustomLoader';
import { useModel } from '@@/exports';
import { LikeTwoTone, DislikeTwoTone } from '@ant-design/icons';
import {
  Button,
  DatePicker,
  Drawer,
  Dropdown,
  Form,
  Input,
  message,
  Space,
  Spin,
  theme,
} from 'antd';
import type { DrawerProps } from 'antd/es/drawer';
import Modal from 'antd/es/modal/Modal';
import moment from 'moment';
import { useEffect, useRef, useState } from 'react';
import DataTable from 'react-data-table-component';
import '../../../common.css';
import { Type } from '../../../generated/models/Type';

const encryptor = new Encrypt();
const { Search } = Input;

<Spin indicator={<LoadingOutlined />} />;

interface Data {
  id: number;
  name: string;
  email: string;
  Ticket: number;
  WalletId: number;
  Date: any;
  Method: string;
  Amount: any;
  status: any;
  Currency: any;
  Login: number;
  paymentMethod: string;
}

type DataIndex = keyof Data;

export default () => {
  const actionRef = useRef<ActionType>();
  const [data, setData] = useState([]);
  const { initialState, setInitialState } = useModel('@@initialState');
  const [visible, setVisible] = useState(false);
  const [selected, setSelected] = useState<AppUserDto>({});
  const { token } = theme.useToken();
  const [form] = Form.useForm();

  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');

  const [transactions, setTransactions] = useState<TransactionModel[]>([]);
  const [mt5Transaction, setMt5Transaction] = useState<TransactionModel[]>([]);
  const [refreshCount, setRefreshCount] = useState(0);

  const [showImage, setShowImage] = useState(false);
  const [recordButton, setRecordButton] = useState(false);
  const [record, setRecord] = useState(false);

  const [loading, setLoading] = useState(true);
 const [searchTimeoutId, setSearchTimeoutId] = useState<any>(null);

  const [pagination, setPagination] = useState({
    originalCurrent: 1,
    originalPageSize: 10,
    pageSize: 10,
    total: 0,
    current: 1,
  });

  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedValue, setSelectedValue] = useState('');
  const [globalSearchText, setGlobalSearchText] = useState('');
  const [totalAmount, setTotalAmount] = useState('');

  const handleDivRefresh = () => {
    if (dateRange.start == null && dateRange.end === null && selectedValue == null) {
      fetchData(pagination.current, pagination.pageSize, globalSearchText, '', '', '', '');
    } else {
      fetchData(
        pagination.current,
        pagination.pageSize,
        globalSearchText,
        '',
        dateRange.start,
        dateRange.end,
        selectedValue,
      );
    }
  };

  const [open, setOpen] = useState(false);
  const [placement, setPlacement] = useState<DrawerProps['placement']>('right');

  const showDrawer = (record: any) => {
    setOpen(true);
    setShowImage(record.FileData);
    setRecord(record);
  };

  const onClose = () => {
    setOpen(false);
    setRecord(false);
  };

  const customStyles = {
    headCells: {
      style: {
        background: '#005f73',
        color: 'white',
        fontWeight: 'bold',
        fontSize: '13px',
        borderBottom: '2px solid #fff',
        borderRight: '1px solid #fff',
      },
    },
    rows: {
      style: {
        '&:hover': {
          background: '#f5f5f5',
          transition: 'background-color 0.3s ease',
          cursor: 'pointer',
        },
        borderBottom: '1px solid #ddd',
      },
    },
    cells: {
      style: {
        borderRight: '1px solid #ddd',
        textAlign: 'center',
      },
    },
  };

  /*   const customStyles = {
        headCells: {
            style: {
                background: '#eeab4c', 
                color: 'white', 
                fontWeight: 'bold',
                fontSize: '13px',
            
                borderBottom: '2px solid #fff'
            },
        },
        rows: {
            style: {
                '&:hover': {
                    background: '#f5f5f5',
                    transition: 'background-color 0.3s ease', 
                    cursor: 'pointer',
               
                },
            },
        },
    }; */

  /*  const fetchData = async (page: any, pageSize: any, param: any, type: any) => {
        console.log("====>", type)
        try {
            
            setLoading(true)
            const encrypt = await api.transaction.getLimitedTransactionAdminEncrypt(page, pageSize, param, Type.EXT_TO_WALLET);
            const userResponse = encryptor.decrypData(encrypt.encryptedData);
            const response = JSON.parse(userResponse);
            setPagination({ ...pagination, current: page, total: response.totalRecords });
            setTransactions(response.Requests);
            setLoading(false)
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }


    } */
   const fetchData = async (
  page: any,
  pageSize: any,
  param: any,
  type: any,
  startDate: any,
  endDate: any,
  status: any,
) => {
  try {
    setLoading(true);
    const encrypt = await api.transaction.getLimitedTransactionAdminEncrypt(
      page,
      pageSize,
      param,
      Type.EXT_TO_WALLET,
      startDate,
      endDate,
      status,
    );
    const userResponse = encryptor.decrypData(encrypt.encryptedData);
    const response = JSON.parse(userResponse);

    setTotalAmount(response?.totalAmount);
    setPagination({ ...pagination, current: page, total: response.totalRecords });
    setTransactions(response.Requests);
    setLoading(false);
  } catch (error) {
    console.log(error);
  } finally {
    setLoading(false);
  }
};

 const handleSearchDebounced = (value: string) => {
  if (searchTimeoutId) {
    clearTimeout(searchTimeoutId);
  }
   
     const timeout = setTimeout(() => {
    fetchData(
      pagination.current,
      pagination.pageSize,
      value,
      Type.EXT_TO_WALLET,
      dateRange.start,
      dateRange.end,
      selectedValue,
    );
  }, 500);

  setSearchTimeoutId(timeout);
};


useEffect(() => {
  handleSearchDebounced(globalSearchText);
}, [globalSearchText, pagination.current, pagination.pageSize]);

const handlePageChange = (page: any) => {
  console.log('paginator');
  setPagination({ ...pagination, current: page });
};

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

const handleSubmit1 = async (values: Record<string, any>) => {
  try {
    const msg = await api.app.postSignIn({
      email: values.Email,
      password: values.Password,
    });

    if (msg.status === 'ok') {
      const token = msg.token;
      window.open(`${window.location.href}?token=${token}`, '_blank', 'noreferrer');
    } else {
      if (msg.message.includes('User is disabled by admin')) {
        message.error({
          content: 'User is disabled by admin',
          icon: <span className="transactions-error-icon"> ✘ </span>,
          className: 'transactions-error-notification',
          duration: 3,
        });
      } else {
        const defaultLoginFailureMessage = 'Login failed. Please try again.';
        message.error({
          content: defaultLoginFailureMessage,
          icon: <span className="transactions-error-icon"> ✘ </span>,
          className: 'transactions-error-notification',
          duration: 3,
        });
        throw new Error('Incorrect username/password');
      }
    }
  } catch (error) {
    const defaultLoginFailureMessage = error.message || 'Login failed. Please try again.';
    console.log(error);
    message.error({
      content: defaultLoginFailureMessage,
      icon: <span className="transactions-error-icon"> ✘ </span>,
      className: 'transactions-error-notification',
      duration: 3,
    });
  }
};

 const handleMenuClick = (key, record) => {
  if (key === 'approved') {
    // showConfirmationModal('Approved', record);
  } else if (key === 'rejected') {
    // showConfirmationModal('Rejected', record);
  }
};

const columns = [
  {
    name: 'Ticket #',
    selector: 'Id',
    sortable: true,
    right: false,
    hide: true,
  },
  {
    name: 'Wallet #',
    selector: (row) => row.Wallet?.Id,
    sortable: true,
    right: false,
  },
  {
    name: 'Name',
    selector: 'Client',
    sortable: false,
    grow: 2,
    cell: (row) => (
      <div
        onClick={() => handleSubmit1(row)}
        className=".client-name-cell"
      >
        {`${row.Client}`}
      </div>
    ),
  },
  {
    name: 'Email',
    grow: 3,
    selector: 'Email',
    sortable: true,
    right: false,
  },
  {
    name: 'Date',
    selector: 'RequestedAt',
    sortable: true,
    right: false,
    format: (row) => moment(row.RequestedAt).format('YYYY-MM-DD'),
  },
  {
    name: 'Currency',
    selector: 'Currency',
    sortable: true,
    right: false,
    width: '110px',
  },
  {
    name: 'Method',
    selector: 'PaymentMethod',
    sortable: true,
    right: false,
  },
  {
    name: 'Amount',
    selector: (row) => `${row.Amount?.toFixed(2)} ${row.Currency}`,
    sortable: true,
    right: true,
    width: '110px',
  },
  {
    name: 'Status',
    selector: 'status',
    sortable: true,
    right: false,
    cell: (row) => {
      const statusText = row.Status;

      const statusValueEnum = {
        Rejected: { text: 'Rejected', className: 'transactions-status-rejected' },
        Approved: { text: 'Approved', className: 'transactions-status-approved' },
        Requested: { text: 'Requested', className: 'transactions-status-requested' },
        Completed: { text: 'Completed', className: 'transactions-status-completed' },
      };

      const statusValue = statusValueEnum[statusText] || {
        text: statusText,
        className: 'transactions-status-default',
      };

      return <span className={statusValue.className}>{statusValue.text}</span>;
    },
  },
];

    // {
    //     name: 'Status',
    //     selector: 'status',
    //     sortable: true,
    //     right: false,
    // cell: (row) => {
    //     const statusText = row.Status;
    //     console.log(row.Status)
    //     const statusValueEnum = {
    //       Rejected: {
    //         text: 'Rejected',
    //         status: 'Error',
    //       },
    //       Approved: {
    //         text: 'Approved',
    //         status: 'Success',
    //       },
    //       Requested: {
    //         text: 'Requested',
    //         status: 'Processing',
    //       },
    //       Completed: {
    //         text: 'Completed',
    //         status: 'Success',
    //       },
    //     };

    //     const statusValue = statusValueEnum[statusText];
    //     return (
    //       <span style={{ color: statusValue.status === 'Success' ? 'green' : 'red' }}>
    //         {statusValue.text}
    //       </span>
    //     );
    //   },
    // }
    /*    {
            name: 'Status',
            selector: 'Status',
            sortable: true,
            right: false,
           
        }, */
  if (initialState?.currentUser?.roles?.includes('Manager')) {
  columns.push({
    name: 'Action',
    selector: 'Action',
    sortable: false,
    right: true,
    cell: (record: any) => (
      <Space size={0}>
        { record.Status === 'Requested'
             &&
        record.ManagerId === initialState?.currentUser?.Id ? (
          <></>
        ) : null}
        <Dropdown
  trigger={['click']}
  menu={{
    items: [
      { label: 'Approved', key: 'approved' },
      { label: 'Rejected', key: 'rejected' },
    ],
    onClick: (e) => handleMenuClick(e.key, record),
  }}
>
  <Button className="dep-action-btn" onClick={() => showDrawer(record)}>
    Action
  </Button>
</Dropdown>
      </Space>
    ),
  });
} else {
  columns.push({
    name: 'Action',
    selector: 'Action',
    sortable: false,
    right: true,
    cell: () => <Space size={0}></Space>,
  });
}

const handleOk = () => {
  form.validateFields().then(async (values: SignUpRequest | undefined) => {
    if (!selected.id) return;

    await api.app.putUserById(selected.id || '', { ...values });
    setVisible(false);
    setRecord(false);
    await fetchData(pagination.current, pagination.pageSize, '', '');
  });
};

async function exportExcel() {
  let response = await rawApi.get(`/api/app/transaction/exportNew/xlsx`, {
    responseType: 'blob',
  });

  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'transactions.xlsx');
  document.body.appendChild(link);
  link.click();

  message.success({
    content: 'Downloading File',
    icon: <span className="icon-success"> ✔ </span>,
    className: 'notification-success',
    duration: 3,
  });

  window.URL.revokeObjectURL(url);
  link.remove();
}

useEffect(() => {
  const timer = setTimeout(() => setLoading(false), 2000);
  return () => clearTimeout(timer);
}, []);

const { RangePicker } = DatePicker;

const handleRangePickerClear = () => {
  setDateRange({ start: dateRange.start, end: dateRange.end });
};

const handleDateChange = async (dates: any) => {
  try {
    let formattedStartDate = '';
    let formattedEndDate = '';

    if (dates) {
      const [startDate, endDate] = dates;
      formattedStartDate = startDate.format('YYYY-MM-DD 00:00:00');
      formattedEndDate = endDate.format('YYYY-MM-DD 23:59:59');

      setDateRange({ start: formattedStartDate, end: formattedEndDate });

      await fetchData(
        pagination.current,
        pagination.pageSize,
        globalSearchText,
        Type.EXT_TO_WALLET,
        formattedStartDate,
        formattedEndDate,
        selectedValue,
      );
    } else {
      setDateRange({ start: '', end: '' });
    }
  } catch (error) {
    console.log('Something went wrong', error);
    await fetchData(pagination.current, pagination.pageSize, '', Type.EXT_TO_WALLET, '', '', '');
  }
};

const predefinedRanges = {
  Today: [moment(), moment()],
  Yesterday: [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
  'Last 7 Days': [moment().subtract(6, 'days'), moment()],
  'Last Month': [
    moment().subtract(1, 'months').startOf('month'),
    moment().subtract(1, 'months').endOf('month'),
  ],
};

const rangePickerStyle = { width: '100px' };
const calendarStyle = { height: '10%', width: '250px' };
const dropdownPlacement = 'bottomLeft';

const handleDropdownClick = async (key: string) => {
  try {
    const selectedValue = key;
    setSelectedValue(selectedValue);

    let formattedStartDate = '';
    let formattedEndDate = '';

    if (dateRange) {
      const startDate = dateRange?.start as any;
      const endDate = dateRange?.end as any;
      if (startDate) formattedStartDate = moment(startDate).format('YYYY-MM-DD 00:00:00');
      if (endDate) formattedEndDate = moment(endDate).format('YYYY-MM-DD 23:59:59');
    }

    setDateRange({ start: formattedStartDate, end: formattedEndDate });

    await fetchData(
      pagination.current,
      pagination.pageSize,
      globalSearchText,
      Type.EXT_TO_WALLET,
      formattedStartDate,
      formattedEndDate,
      selectedValue,
    );
  } catch (error) {
    console.log('Something went wrong', error);
  }
};

const onClick: MenuProps['onClick'] = ({ key }) => {
  handleDropdownClick(key);
};

const items: MenuProps['items'] = [
  { label: 'Requested', key: 'Requested' },
  { label: 'Approved', key: 'Approved' },
  { label: 'Rejected', key: 'Rejected' },
  { label: 'All', key: '' },
];

  

  return (
    <> 
 <div className="search-wrapper">
  <Input
    size="small"
    placeholder="Search"
    prefix={<SearchOutlined className="search-icon" />}
    className="depsearch-input"
    value={globalSearchText}
    onChange={(e) => setGlobalSearchText(e.target.value)}
  />
</div>

    {/* Data Table */}
     <div className="table-deposit-transactions">
  <h2>DEPOSIT TRANSACTION</h2>
  <div className="search-bar">
    
    <RangePicker 
      ranges={predefinedRanges}
      onChange={handleDateChange}
      allowClear
      placement="bottomRight"
      format="YYYY-MM-DD"
    />

    <Dropdown menu={{ items, onClick }}>
      <a onClick={(e) => e.preventDefault()}>
        <button className='status'> 
          <span className="status-button">
            Status: {selectedValue || 'All'} <DownOutlined />
          </span>
        </button>
      </a>
    </Dropdown>

    <button className="dep-refresh" onClick={handleDivRefresh}>
      Search
    </button>

  </div>
</div>
           <div className="transactions-container">
    {/* Search & Filters */}
    <div className="filters-bar">
      {/* <Input
        size="small"
        placeholder="Search"
        prefix={<SearchOutlined className="search-icon" />}
        className="input-search"
        value={globalSearchText}
        onChange={(e) => setGlobalSearchText(e.target.value)}
      />

      <RangePicker
        ranges={predefinedRanges}
        onChange={handleDateChange}
        allowClear
        placement="bottomRight"
        format="YYYY-MM-DD"
        className="input-date-range"
      /> */}

      {/* <Dropdown menu={{ items, onClick }}>
        <a onClick={(e) => e.preventDefault()}>
          <span className="dropdown-status">
            Status: {selectedValue || 'All'} <DownOutlined />
          </span>
        </a>
      </Dropdown> */}

     

       
    </div>

    {/* Data Table */}
    <div className=".table-wrapper">
      <div className="total-amount-display">Total Amount: {totalAmount}</div>
      <DataTable
        columns={columns}
        className="my-data-table scroll-bar-pad"
        data={transactions}
        customStyles={customStyles}
        keyField="id"
        highlightOnHover
        responsive
        selectableRows={false}
        dense
        pagination
        paginationServer
        paginationTotalRows={pagination.total}
        paginationPerPage={pagination.pageSize}
        onChangePage={handlePageChange}
        onChangeRowsPerPage={handlePageSizeChange}
        paginationRowsPerPageOptions={[10, 20, 30]}
        paginationComponentOptions={{ rowsPerPageText: 'Rows per page:' }}
        progressPending={loading}
        progressComponent={loading ? <CustomLoader /> : null}
        actions={[
          <a key="exportExcel" onClick={exportExcel}>
            <FileExcelOutlined className="excel-icon" />
          </a>,
          <a key="handleDivRefresh" onClick={handleDivRefresh}>
            <RedoOutlined className="refresh-icon" />
          </a>,
        ]}
      />
    </div>

    {/* Edit User Modal */}
        <Modal
  title="Edit User Details"
  open={visible}
  onCancel={() => setVisible(false)}
  className="modal-edit-user"
  footer={[
    <Button key="cancel" onClick={() => setVisible(false)}>Cancel</Button>,
    <Button key="ok" type="primary" onClick={handleOk}>OK</Button>,
  ]}
  bodyStyle={{ padding: '16px', overflowY: 'auto' }}
>
  <Form form={form} layout="vertical">
    <Form.Item
      name="username"
      label="User Name"
      rules={[{ required: true }]}
    >
      <Input />
    </Form.Item>
    <Form.Item
      name="bankName"
      label="Bank Name"
      rules={[{ required: true }]}
    >
      <Input />
    </Form.Item>
    <Form.Item
      name="bankAddress"
      label="Bank Address"
      rules={[{ required: true }]}
    >
      <Input />
    </Form.Item>
    <Form.Item
      name="accountNumber"
      label="Account Number"
      rules={[{ required: true }]}
    >
      <Input />
    </Form.Item>
    <Form.Item
      name="ifscIBAN"
      label="IFSC/IBAN"
      rules={[{ required: true }]}
    >
      <Input />
    </Form.Item>
    <Form.Item
      name="additionalComment"
      label="Additional Comment"
      rules={[{ required: true }]}
    >
      <Input />
    </Form.Item>
  </Form>
</Modal>


    {/* Deposit Request Drawer */}
      <Drawer
  title="Deposit Request"
  placement={placement}
  width={undefined} // CSS handles width
  onClose={onClose}
  open={open}
  className="drawer-deposit-request"
  bodyStyle={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}
>
      <div className="drawer-content">
        {showImage && (
          <>
            <h3 className="payment-proof-title">Payment Proof</h3>
            <img src={`data:image/jpg;base64,${showImage.Bytes}`} className="payment-proof-img" />
          </>
        )}

        <div className="drawer-actions">
          {record && (
            <TextPopconfirm
              initText={'Approved'}
              initAmount={record.Amount}
              onConfirm={async (comment: string, Amount: Number) => {
                setLoading(true);
                try {
                  await api.transaction.putTransactionById(record.Id, {
                    approved: true,
                    comment,
                    amount: Amount,
                  });
                  await fetchData(
                    pagination.current,
                    pagination.pageSize,
                    globalSearchText,
                    record.Type,
                    dateRange.start,
                    dateRange.end,
                    selectedValue,
                  );
                } finally {
                  setLoading(false);
                  setOpen(false);
                  setRecord(false);
                }
              }}
            >
              <Button className="approve-btn">
                Approve <LikeTwoTone twoToneColor={token.colorSuccess} />
              </Button>
            </TextPopconfirm>
          )}

          {record && (
            <TextPopconfirm
              initText={'Rejected'}
              onConfirm={async (comment: string) => {
                await api.transaction.putTransactionById(record.Id, {
                  approved: false,
                  comment,
                });
                await fetchData(
                  pagination.current,
                  pagination.pageSize,
                  globalSearchText,
                  record.Type,
                  dateRange.start,
                  dateRange.end,
                  selectedValue,
                );
                setOpen(false);
                setRecord(false);
              }}
            >
              <Button className="reject-btn">
                Reject <DislikeTwoTone twoToneColor={token.colorError} />
              </Button>
            </TextPopconfirm>
          )}
        </div>
      </div>
    </Drawer>
  </div>
  </>
);
};
