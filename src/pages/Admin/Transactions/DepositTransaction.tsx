import {
  DislikeTwoTone,
  FileExcelOutlined,
  LikeTwoTone,
  RedoOutlined,
  SearchOutlined,
} from '@ant-design/icons';

import type { ActionType } from '@ant-design/pro-components';

import { api, rawApi } from '@/components/common/api';
import { TextPopconfirm } from '@/components/Custom/TextPopconfirm';
import { AppUserDto, SignUpRequest, Status, TransactionModel } from '@/generated';
import { Encrypt } from '@/generated/services/Encrypt';
import CustomLoader from '@/pages/CustomLoader';
import { useModel } from '@@/exports';
import { DownOutlined, LoadingOutlined } from '@ant-design/icons';
import {
  Button,
  DatePicker,
  Drawer,
  Dropdown,
  Form,
  Input,
  Menu,
  MenuProps,
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
  // const searchInput = useRef<InputRef>();
  const [transactions, setTransactions] = useState<TransactionModel[]>([]);
  const [mt5Transaction, setMt5Transaction] = useState<TransactionModel[]>([]);
  const [refreshCount, setRefreshCount] = useState(0);
  const [showImage, setShowImage] = useState(false);
  const [recordButton, setRecordButton] = useState(false);
  const [record, setRecord] = useState(false);

  const [loading, setLoading] = useState(true);
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [pagination, setPagination] = useState({
    originalCurrent: 1, // Original current page
    // Current page
    originalPageSize: 10, // Original page size
    pageSize: 10, // Current page size
    total: 0,
    current: 1,
  });

  const [dateRange, setDateRange] = useState({
    start: '',
    end: '',
  });

  const [selectedValue, setSelectedValue] = useState('');

  const [globalSearchText, setGlobalSearchText] = useState('');
  const [totalAmount, setTotalAmount] = useState('');

  const handleDivRefresh = () => {
    // const { start, end } = dateRange;

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

  /*  const handleDivRefresh = () => {
        
        fetchData(pagination.current, pagination.pageSize, "", "");


    }; */

  const [open, setOpen] = useState(false);
  const [placement, setPlacement] = useState<DrawerProps['placement']>('right');

  const showDrawer = (record: any) => {
    console.log('Selected Record:', record);
    console.log('------>');
    console.log(record);

    setOpen(true);
    setShowImage(record.FileData);
    // setRecordButton(record)
    setRecord(record);
  };

  const onClose = () => {
    setOpen(false);
    setRecord(false);
  };
  const customStyles = {
    headCells: {
      style: {
        background: '#2b2726',
        color: 'white',
        fontWeight: 'bold',
        fontSize: '13px',
        borderBottom: '2px solid #fff',
        borderRight: '1px solid #fff', // Add a border on the right side of header cells
      },
    },
    rows: {
      style: {
        '&:hover': {
          background: '#f5f5f5',
          transition: 'background-color 0.3s ease',
          cursor: 'pointer',
        },
        borderBottom: '1px solid #ddd', // Add a bottom border to all rows
      },
    },
    cells: {
      style: {
        borderRight: '1px solid #ddd', // Add a border on the right side of cells
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
      // const response = await api.transaction.getLimitedTransactionAdmin(page, pageSize, param, type);
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

  const handleSearchDebounced = (value) => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    const timeout = setTimeout(() => {
      console.log(pagination.current, pagination.pageSize, pagination.total);
      fetchData(
        pagination.current,
        pagination.pageSize,
        value,
        globalSearchText,
        dateRange.start,
        dateRange.end,
        selectedValue,
      );
    }, 500);
    setSearchTimeout(timeout);
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
    const urlParams = new URL(window.location.href).searchParams;
    let urlWithToken = null;

    try {
      const msg = await api.app.postSignIn({
        email: values.Email,
        password: values.Password,
      });

      if (msg.status === 'ok') {
        //store token to local storage
        const token = msg.token;
        window.open(`${window.location.href}?token=${token}`, '_blank', 'noreferrer');
      } else {
        if (msg.message.includes('User is disabled by admin')) {
          message.error({
            content: 'User is disabled by admin',
            icon: <span className="orange-error-icon"> ✘ </span>,
            className: 'orange-error-notification',
            duration: 3,
          });
        } else {
          const defaultLoginFailureMessage = 'Login failed. Please try again.';
          message.error({
            content: defaultLoginFailureMessage,
            icon: <span className="orange-error-icon"> ✘ </span>,
            className: 'orange-error-notification',
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
        icon: <span className="orange-error-icon"> ✘ </span>,
        className: 'orange-error-notification',
        duration: 3,
      });
    }
  };


  const handleMenuClick = (key, record) => {
    if (key === 'approved') {
      //  showConfirmationModal('Approved', record);
    } else if (key === 'rejected') {
      //  showConfirmationModal('Rejected', record);
    }
  };

  const columns = [
    {
      name: 'Ticket #',
      selector: 'Id',
      sortable: true,
      right: false,
      hide: true,
      // width: '100px',
    },
    {
      name: 'Wallet #',
      selector: (row) => row.Wallet?.Id,
      sortable: true,
      right: false,
      // width: '100px'
    },
    {
      name: 'Name',
      selector: 'Client',
      sortable: false,
      grow: 2,
      cell: (row) => (
        <div onClick={() => handleSubmit1(row)} style={{ cursor: 'pointer' }}>
          {`${row.Client} `}
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
      // ... Add other column properties as needed ...
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
      // width: '110px'
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
        console.log(`Status Text: ${statusText}`);

        const statusValueEnum = {
          Rejected: {
            text: 'Rejected',
            status: 'red',
          },
          Approved: {
            text: 'Approved',
            status: 'green',
          },
          Requested: {
            text: 'Requested',
            status: 'black',
          },
          Completed: {
            text: 'Completed',
            status: 'green',
          },
        };

        const statusValue = statusValueEnum[statusText];
        console.log(`Status Value: ${statusValue.status}`);

        return <span style={{ color: statusValue.status }}>{statusValue.text}</span>;
      },
    },
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
  ];

  if (initialState?.currentUser?.roles?.includes('Manager')) {
    columns.push({
      name: 'Action',
      selector: 'Action', // You need to define a property in your data that holds the action
      sortable: false,
      right: true,
      cell: (record: any) => (
        <Space size={0}>
          {record.Status === Status.REQUESTED &&
            record.ManagerId === initialState?.currentUser?.Id ? (
            <></>
          ) : null}
          <Dropdown
            trigger={['click']}
            overlay={<Menu onClick={(e) => handleMenuClick(e.key, record)}></Menu>}
          >
            <Button
              style={{ backgroundColor: '#eeab4c', color: 'white', marginBottom: 5 }}
              onClick={() => showDrawer(record)}
            >
              Action
            </Button>
          </Dropdown>
        </Space>
      ),
    });
  } else {
    columns.push({
      name: 'Action',
      selector: 'Action', // You need to define a property in your data that holds the action
      sortable: false,
      right: true,
      cell: (record: any) => (
        <Space size={0}>{/* You can add any specific content for non-manager users here */}</Space>
      ),
    });
  }

  const handleOk = () => {
    form.validateFields().then(async (values: SignUpRequest | undefined) => {
      if (!selected.id) {
        return;
      }
      await api.app.putUserById(selected.id || '', { ...values });
      setVisible(false);
      setRecord(false);

      await fetchData(pagination.current, pagination.pageSize, '', '');
    });
  };

  async function exportExcel() {
    // let response = await api.transaction.exportXlsx()
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
      icon: <span className="orange-success-icon"> ✔ </span>,
      className: 'orange-success-notification',
      duration: 3,
    });

    // Clean up by revoking the temporary URL and removing the anchor element
    window.URL.revokeObjectURL(url);
    link.remove();
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000); // Set the desired duration in milliseconds (e.g., 3000 for 3 seconds)

    return () => {
      clearTimeout(timer); // Clean up the timer when the component unmounts or the dependencies change
    };
  }, []);

  const { RangePicker } = DatePicker;
  // Add an additional function to handle RangePicker clear event
  // const clearDateRange = () => {
  //    fetchData(pagination.current, pagination.pageSize, globalSearchText, "", "", "");
  //  };
  const handleRangePickerClear = () => {
    console.log('Inside handleRangePickerClear');
    setDateRange({ start: dateRange.start, end: dateRange.end });
  };

  const handleDateChange = async (dates: any) => {
    console.log('datepicker', dates);
    try {
      let formattedStartDate = '';
      let formattedEndDate = '';
      if (dates) {
        const [startDate, endDate] = dates;
        formattedStartDate = startDate.format('YYYY-MM-DD 00:00:00');
        formattedEndDate = endDate.format('YYYY-MM-DD 23:59:59');

        setDateRange({
          start: formattedStartDate,
          end: formattedEndDate,
        });

        await fetchData(
          pagination.current,
          pagination.pageSize,
          globalSearchText,
          Type.EXT_TO_WALLET,
          formattedStartDate,
          formattedEndDate,
          selectedValue,
        );

        console.log('Selected date range:', formattedStartDate, formattedEndDate);
      } else {
        setDateRange({
          start: '',
          end: '',
        });
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
  const rangePickerStyle = {
    width: '100px', // Set the width as desired

    // Add more custom styles here
  };
  const calendarStyle = { height: '10%', width: '250px' };
  const dropdownPlacement = 'bottomLeft';

  const handleDropdownClick = async (key: string) => {
    console.log('======', key);
    try {
      const selectedValue = key;

      console.log('Selected Value:', selectedValue);

      setSelectedValue(selectedValue);
      let formattedStartDate = '';
      let formattedEndDate = '';
      if (dateRange != undefined) {
        const startDate = dateRange?.start as any;
        const endDate = dateRange?.end as any;
        if (startDate) {
          formattedStartDate = moment(startDate)?.format('YYYY-MM-DD 00:00:00');
        }
        if (endDate) {
          formattedEndDate = moment(endDate)?.format('YYYY-MM-DD 23:59:59');
        }
      }
      setDateRange({
        start: formattedStartDate,
        end: formattedEndDate,
      });

      await fetchData(
        pagination.current,
        pagination.pageSize,
        globalSearchText,
        Type.EXT_TO_WALLET,
        formattedStartDate,
        formattedEndDate,
        selectedValue,
      );

      console.log('Selected date range:', formattedStartDate, formattedEndDate);
    } catch (error) {
      console.log('Something went wrong', error);
    }
  };

  const onClick: MenuProps['onClick'] = ({ key }) => {
    handleDropdownClick(key);
  };

  const items: MenuProps['items'] = [
    {
      label: 'Requested',

      key: 'Requested',
    },
    {
      label: 'Approved',

      key: 'Approved',
    },
    {
      label: 'Rejected',

      key: 'Rejected',
    },
    {
      label: 'All',
      key: '',
    },
  ];
  //   const menuProps = {
  //     items,
  //     onClick: handleDropdownClick,

  //   };

  return (
    <div>
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

      <div className="my-data-table" style={{ flex: 1, overflowY: 'auto' }}>
        <h2>DEPOSIT TRANSACTION</h2>
        <div className="datepicker-container">
          <RangePicker
            ranges={predefinedRanges}
            onChange={handleDateChange}
            allowClear
            placement="bottomRight"
            format="YYYY-MM-DD"
          />

          <Dropdown menu={{ items, onClick }}>
            <a onClick={(e) => e.preventDefault()}>
              <span
                style={{
                  padding: '5px',
                  margin: '8px',
                  color: 'white',
                  border: '1px solid white',
                  borderRadius: '5px',
                  backgroundColor: '#eeab4c',
                }}
              >
                Status: {selectedValue || 'All'}
                <DownOutlined />
              </span>
            </a>
          </Dropdown>
          <button className="divrefresh-btn" onClick={handleDivRefresh}>
            Search
          </button>
          <div
            style={{
              width: '200px',
              padding: '2px',
              fontWeight: 700,

              fontSize: '16px',
            }}
          >
            Total Amount: {totalAmount}
          </div>
          {/* <Input
    type='text'
    disabled
  placeholder={`Total Amount: ${totalAmount}`}
  style={{
    width: '200px', 
    padding: '2px',
    fontWeight:700,
    color:'#eeab4c', 
    borderRadius: '5px', 
    border: '1px solid #ccc', 
    fontSize: '16px', 
 
 
  }}
/> */}
        </div>
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
          // conditionalRowStyles={conditionalRowStyles}
          progressComponent={loading ? <CustomLoader /> : null}
          actions={[
            <a key="exportExcel" onClick={exportExcel}>
              <FileExcelOutlined style={{ color: '#f89d42' }} />
            </a>,
            <a key="handleDivRefresh" onClick={handleDivRefresh}>
              <RedoOutlined style={{ color: '#f89d42' }} />
            </a>,
            // <a key="handleDivRefresh" onClick={handleDivRefresh}><RedoOutlined /></a>
          ]}
        />
      </div>
      {/* )} */}

      <Modal
        title="Edit User Details"
        open={visible}
        onOk={handleOk}
        onCancel={() => setVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="username" label="User Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="bankName" label="Bank Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="bankAddress" label="Bank Address" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="accountNumber" label="Account Number" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="ifscIBAN" label="IFSC/IBAN" rules={[{ required: true }]}>
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
      <Drawer
        title="Deposit Request"
        placement={placement}
        width={600}
        onClose={onClose}
        open={open}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {showImage && showImage && (
            <>
              {(() => {
                console.log("showImage:", showImage);
                console.log("typeof showImage.Bytes:", typeof showImage.Bytes);
                console.log("showImage.Bytes (sample):", showImage.Bytes?.slice?.(0, 100));
                return null;
              })()}
              <h3 style={{ textAlign: 'center', color: '#FA8E21' }}>
                {' '}
                <b> Payment Proof</b>
              </h3>
              <img
                src={`data:image/jpg;base64,${showImage.Bytes}`}
                style={{ width: 250, height: 250 }}
              />
            </>
          )}
          <div
            style={{ display: 'flex', marginTop: '20px', padding: 10, justifyContent: 'center' }}
          >
            {record && (
              <TextPopconfirm
                initText={'Approved'}
                initAmount={record.Amount}
                onConfirm={(comment: string, Amount: Number) => {
                  setLoading(true); // Set loading to true before making the API request

                  api.transaction
                    .putTransactionById(record.Id, {
                      approved: true,
                      comment: comment,
                      amount: Amount,
                    })
                    .then(() => {
                      // Handle API response here if needed
                      fetchData(
                        pagination.current,
                        pagination.pageSize,
                        globalSearchText,
                        record.Type,
                        dateRange.start,
                        dateRange.end,
                        selectedValue,
                      );
                    })
                    .catch((error) => {
                      // Handle API error if needed
                      console.error('Error in API request:', error);
                    })
                    .finally(() => {
                      setLoading(false); // Set loading back to false after the response is received
                    });

                  setOpen(false);
                  setRecord(false);
                }}
              >
                <Button style={{ backgroundColor: 'green', color: 'white', borderColor: 'green' }}>
                  Approve
                  <LikeTwoTone twoToneColor={token.colorSuccess} />
                </Button>
              </TextPopconfirm>
            )}

            {/* Reject Button */}
            {record && (
              <TextPopconfirm
                initText={'Rejected'}
                onConfirm={(comment: string) => {
                  api.transaction
                    .putTransactionById(record.Id, {
                      approved: false,
                      comment: comment,
                    })
                    .then(() =>
                      fetchData(
                        pagination.current,
                        pagination.pageSize,
                        globalSearchText,
                        record.Type,
                        dateRange.start,
                        dateRange.end,
                        selectedValue,
                      ),
                    );
                  setOpen(false);
                  setRecord(false);
                }}
              >
                <Button
                  style={{ backgroundColor: token.colorError, color: 'white', marginLeft: 20 }}
                >
                  Reject
                  <DislikeTwoTone twoToneColor={token.colorError} />
                </Button>
              </TextPopconfirm>
            )}
          </div>
        </div>
      </Drawer>
    </div>
  );
};
