// import { FileExcelOutlined, RedoOutlined, SearchOutlined } from '@ant-design/icons';
// import type { ActionType } from '@ant-design/pro-components';
// import { api, rawApi } from '@/components/common/api';
// import { AppUserDto, SignUpRequest, TransactionModel } from '@/generated';
// import CustomLoader from '@/pages/CustomLoader';
// import { useModel } from '@@/exports';
// import { DownOutlined, LoadingOutlined } from '@ant-design/icons';
// import { DatePicker, Dropdown, Form, Input, MenuProps, message, Spin, theme } from 'antd';
// import Modal from 'antd/es/modal/Modal';
// import moment from 'moment';
// import { useEffect, useRef, useState } from 'react';
// import DataTable from 'react-data-table-component';
// import '../../../common.css';
// import { Type } from '../../../generated/models/Type';
// const { Search } = Input;
// <Spin indicator={<LoadingOutlined />} />;

// interface Data {
//   id: number;
//   name: string;
//   email: string;
//   Ticket: number;
//   WalletId: number;
//   Date: any;
//   Method: string;
//   Amount: any;
//   status: any;
//   Currency: any;
//   Login: number;
//   paymentMethod: string;
// }

// type DataIndex = keyof Data;

// export default () => {
//   const actionRef = useRef<ActionType>();
//   const [data, setData] = useState([]);
//   const { initialState, setInitialState } = useModel('@@initialState');
//   const [visible, setVisible] = useState(false);
//   const [selected, setSelected] = useState<AppUserDto>({});
//   const { token } = theme.useToken();
//   const [form] = Form.useForm();
//   const [searchText, setSearchText] = useState('');
//   const [searchedColumn, setSearchedColumn] = useState('');
//   // const searchInput = useRef<InputRef>();
//   const [transactions, setTransactions] = useState<TransactionModel[]>([]);
//   const [mt5Transaction, setMt5Transaction] = useState<TransactionModel[]>([]);
//   const [refreshCount, setRefreshCount] = useState(0);
//   const [loading, setLoading] = useState(true);
//   const [searchTimeout, setSearchTimeout] = useState(null);
//   const [pagination, setPagination] = useState({
//     current: 1,
//     pageSize: 10,
//     total: 0,
//   });
//   // const [globalSearchText, setGlobalSearchText] = useState('');

//   // const handleDivRefresh = () => {
//   //     fetchData(pagination.current, pagination.pageSize, "", "");

//   //     // setRefreshCount((prevCount) => prevCount + 1);
//   // };
//   const [dateRange, setDateRange] = useState({
//     start: '',
//     end: '',
//   });
//   const [selectedValue, setSelectedValue] = useState('');
//   const [totalAmount, setTotalAmount] = useState('');
//   const [globalSearchText, setGlobalSearchText] = useState('');

//   const handleDivRefresh = () => {
//     // const { start, end } = dateRange;

//     if (dateRange.start == null && dateRange.end === null && selectedValue == null) {
//       fetchData(pagination.current, pagination.pageSize, globalSearchText, '', '', '', '');
//     } else {
//       fetchData(
//         pagination.current,
//         pagination.pageSize,
//         globalSearchText,
//         '',
//         dateRange.start,
//         dateRange.end,
//         selectedValue,
//       );
//     }
//   };

//   const customStyles = {
//     headCells: {
//       style: {
//         background: '',
//         color: 'black',
//         fontWeight: 'bold',
//         fontSize: '13px',
//         borderBottom: '2px solid #fff',
//         borderRight: '1px solid #fff', // Add a border on the right side of header cells
//       },
//     },
//     rows: {
//       style: {
//         '&:hover': {
//           background: '#f5f5f5',
//           transition: 'background-color 0.3s ease',
//           cursor: 'pointer',
//         },
//         borderBottom: '1px solid #ddd', // Add a bottom border to all rows
//       },
//     },
//     cells: {
//       style: {
//         borderRight: '1px solid #ddd', // Add a border on the right side of cells
//         textAlign: 'center',
//       },
//     },
//   };
//   /*    const customStyles = {
//         headCells: {
//             style: {
//                 background: '#487b9a',
//                 color: 'white', 
//                 fontWeight: 'bold',
//                 fontSize: '15px',
//                 borderBottom: '2px solid #fff'
//             },
//         },
//         rows: {
//             style: {
//                 '&:hover': {
//                     background: '#f5f5f5', 
//                     transition: 'background-color 0.3s ease', 
//                     cursor:'pointer'
//                 },
//             },
//         },
//     }; */

//   const fetchData = async (
//     page: any,
//     pageSize: any,
//     param: any,
//     type: any,
//     startDate: any,
//     endDate: any,
//     status: any,
//   ) => {
//     try {
//       setLoading(true);
//       const response = await api.transaction.getLimitedTransactionAdmin(
//         page,
//         pageSize,
//         param,
//         Type.CMS_WALLET_TO_MT,
//         startDate,
//         endDate,
//         status,
//       );
//       setPagination({ ...pagination, current: page, total: response.totalRecords });
//       setTransactions(response.requests);
//       setTotalAmount(response?.totalAmount);
//       setLoading(false);
//     } catch (error) {
//       console.log(error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSearchDebounced = (value) => {
//     if (searchTimeout) {
//       clearTimeout(searchTimeout);
//     }
//     const timeout = setTimeout(() => {
//       fetchData(
//         pagination.current,
//         pagination.pageSize,
//         value,
//         '',
//         dateRange.start,
//         dateRange.end,
//         selectedValue,
//       );
//     }, 500);
//     setSearchTimeout(timeout);
//   };

//   useEffect(() => {
//     handleSearchDebounced(globalSearchText);
//   }, [globalSearchText, pagination.current, pagination.pageSize]);

//   const handlePageChange = (page: any) => {
//     setPagination({ ...pagination, current: page });
//   };

//   // Function to handle page size changes
//   // const handlePageSizeChange = (pageSize: any) => {
//   //     setPagination({ ...pagination, current: 1, pageSize }); // Reset to first page when page size changes
//   // };

//   const handlePageSizeChange = (size) => {
//     const totalRecords = pagination.total;
//     const currentRecordIndex = (pagination.current - 1) * pagination.pageSize;
//     const newPageIndex = Math.ceil((currentRecordIndex + 1) / size);

//     setPagination({
//       ...pagination,
//       pageSize: size,
//       current: newPageIndex,
//     });
//   };

//   const handleSubmit1 = async (values: Record<string, any>) => {
//     const urlParams = new URL(window.location.href).searchParams;
//     let urlWithToken = null;
//     //console.log("Values ",values.Client

//     try {
//       const msg = await api.app.postSignIn({
//         email: values.email,
//         password: values.password,
//       });

//       if (msg.status === 'ok') {
//         //store token to local stoarge
//         const token = msg.token;
//         window.open(`${window.location.href}?token=${token}`, '_blank', 'noreferrer');
//       } else {
//         throw new Error('Incorrect username/password');
//       }
//     } catch (error) {
//       const defaultLoginFailureMessage = error.message || 'Login failed. Please try again.';
//       console.log(error);
//       message.error(defaultLoginFailureMessage);
//     }
//   };
//   // const handleMenuClick = (key, record) => {
//   //     if (key === 'approved') {
//   //         // showConfirmationModal('Approved', record);
//   //     } else if (key === 'rejected') {
//   //         // showConfirmationModal('Rejected', record);
//   //     }
//   // };

//   const columns = [
//     {
//       name: 'Ticket #',
//       selector: 'id',
//       sortable: true,
//       right: false,
//       hide: true, // To hide this column in the table view
//       // ... Add other column properties as needed ...
//     },
//     // {
//     //     name: 'Wallet #',
//     //     selector: (row) => row.wallet?.id,
//     //     sortable: true,
//     //     right: false,
//     //     // width:'130px'
//     // },
//     {
//       name: 'Account #',
//       selector: 'login',
//       sortable: true,
//       right: false,
//       width: '130px',
//     },
//     {
//       name: 'Name',
//       selector: 'client',
//       sortable: false,
//       grow: 2,
//       cell: (row) => (
//         <div onClick={() => handleSubmit1(row)} style={{ cursor: 'pointer' }}>
//           {`${row.client} `}
//         </div>
//       ),
//     },
//     {
//       name: 'Email',
//       grow: 2,
//       selector: 'email',
//       sortable: true,
//       right: false,
//       // ... Add other column properties as needed ...
//     },
//     {
//       name: 'Date',
//       selector: 'requestedAt',
//       sortable: true,
//       right: false,
//       format: (row) => moment(row.requestedAt).format('YYYY-MM-DD'),
//       // ... Add other column properties as needed ...
//     },
//     // {
//     //     name: 'Currency',
//     //     selector: 'currency',
//     //     sortable: true,
//     //     right: false,
//     //     width: '110px'
//     // },
//     // {
//     //     name: 'Method',
//     //     selector: 'paymentMethod',
//     //     sortable: true,
//     //     right: false,
//     //     // ... Add other column properties as needed ...
//     // },
//     {
//       name: 'Amount',
//       selector: (row) => `${row.amount?.toFixed(2)} ${row.currency}`,
//       sortable: true,
//       right: true,
//       width: '110px',
//       // ... Add other column properties as needed ...
//     },
//     {
//       name: 'Status',
//       selector: 'status',
//       sortable: true,
//       right: false,
//       cell: (row) => {
//         const statusText = row.status;
//         console.log(row.status);
//         const statusValueEnum = {
//           Rejected: {
//             text: 'Rejected',
//             status: 'red',
//           },
//           Approved: {
//             text: 'Approved',
//             status: 'green',
//           },
//           Requested: {
//             text: 'Requested',
//             status: 'black',
//           },
//           Completed: {
//             text: 'Completed',
//             status: 'green',
//           },
//         };

//         const statusValue = statusValueEnum[statusText];
//         return <span style={{ color: statusValue.status }}>{statusValue.text}</span>;
//       },
//     },
//     /*    {
//             name: 'Status',
//             selector: 'status',
//             sortable: true,
//             right: false,
          
//         }, */
//   ];

//   // if (initialState?.currentUser?.roles?.includes('Manager')) {
//   //     columns.push({
//   //         name: 'Action',
//   //        // grow:2,
//   //         selector: 'action', // You need to define a property in your data that holds the action
//   //         sortable: false,
//   //         right: true,
//   //         cell: (record: any) => (
//   //             <Space size={0}>
//   //                 {record.status === Status.REQUESTED && record.managerId === initialState?.currentUser?.id ? (
//   //                     <>
//   //                     </>
//   //                 ) : null}

//   //                 {/* <Dropdown
//   //                     trigger={['click']}
//   //                     overlay={
//   //                          <Menu onClick={(e) => handleMenuClick(e.key, record)}> */}

//   //                              {/* <Menu.Item key="approved" > */}
//   //                                  {/* Approve */}

//   //                             {/* // </Menu.Item> */}
//   //                             {/* <Menu.Item key="rejected" >
//   //                                 Reject
//   //                                 <TextPopconfirm
//   //                                     initText={'Rejected'}
//   //                                     onConfirm={(comment: string) => {
//   //                                         api.transaction
//   //                                             .putTransactionById(record.id, {
//   //                                                 approved: false,
//   //                                                 comment: comment
//   //                                             })
//   //                                             .then(() => fetchData(pagination.current, pagination.pageSize, "", record.type,dateRange.start,dateRange.end,""));
//   //                                     }}
//   //                                 >
//   //                                     <Button><DislikeTwoTone twoToneColor={token.colorError} /></Button>
//   //                                 </TextPopconfirm>
//   //                             </Menu.Item> */}
//   //                          {/* </Menu>
//   //                     }
//   //                 > */}
//   //                     {/* <Button style={{ backgroundColor: '#487b9a', color: 'white' ,marginBottom:5 }}> */}
//   //                         {/* <Space> */}
//   //                         {/* Action  */}
//   //                         {/* </Space> */}
//   //                     {/* </Button> */}
//   //                 {/* </Dropdown> */}
//   //                 <TextPopconfirm
//   //                                     initText={'Approved'}
//   //                                      initAmount={record.amount}
//   //                                     onConfirm={(comment: string, amount?: number) => {
//   //                                         api.transaction
//   //                                             .putTransactionById(record.id, {
//   //                                                 approved: true,
//   //                                                 comment: comment,
//   //                                                 amount: amount
//   //                                             })
//   //                                             .then(() => fetchData(pagination.current, pagination.pageSize, "", record.type,dateRange.start,dateRange.end,""));
//   //                                     }}
//   //                                 >

//   //                                     <Button>Action</Button>
//   //                 </TextPopconfirm>
//   //             </Space>
//   //         ),
//   //     });
//   // } else {
//   //     columns.push({
//   //         name: 'Action',
//   //         selector: 'action', // You need to define a property in your data that holds the action
//   //         sortable: false,
//   //         right: true,
//   //         cell: (record: any) => (
//   //             <Space size={0}>
//   //                 {/* You can add any specific content for non-manager users here */}
//   //             </Space>
//   //         ),
//   //     });
//   // }

//   const handleOk = () => {
//     form.validateFields().then(async (values: SignUpRequest | undefined) => {
//       if (!selected.id) {
//         return;
//       }
//       await api.app.putUserById(selected.id || '', { ...values });
//       setVisible(false);
//       await fetchData(pagination.current, pagination.pageSize, '', '');
//     });
//   };

//   async function exportExcel() {
//     //let response = await api.transaction.exportXlsx()
//     let response = await rawApi.get(`/api/app/transaction/exportNew/xlsx`, {
//       responseType: 'blob',
//     });
//     const url = window.URL.createObjectURL(new Blob([response.data]));
//     const link = document.createElement('a');
//     link.href = url;
//     link.setAttribute('download', 'CommissionDeposit.xlsx');
//     document.body.appendChild(link);
//     link.click();
//     message.success('Downloading File');

//     // Clean up by revoking the temporary URL and removing the anchor element
//     window.URL.revokeObjectURL(url);
//     link.remove();
//   }

//   useEffect(() => {
//     const timer = setTimeout(() => {
//       setLoading(false);
//     }, 1500); // Set the desired duration in milliseconds (e.g., 3000 for 3 seconds)

//     return () => {
//       clearTimeout(timer); // Clean up the timer when the component unmounts or the dependencies change
//     };
//   }, []);

//   const { RangePicker } = DatePicker;
//   // Add an additional function to handle RangePicker clear event
//   const clearDateRange = () => {
//     fetchData(pagination.current, pagination.pageSize, globalSearchText, '', '', '');
//   };
//   const handleRangePickerClear = () => {
//     console.log('Inside handleRangePickerClear');
//     setDateRange({ start: dateRange.start, end: dateRange.end });
//   };

//   const handleDateChange = async (dates: any) => {
//     console.log('datepicker', dates);
//     try {
//       let formattedStartDate = '';
//       let formattedEndDate = '';
//       if (dates) {
//         const [startDate, endDate] = dates;
//         formattedStartDate = startDate.format('YYYY-MM-DD 00:00:00');
//         formattedEndDate = endDate.format('YYYY-MM-DD 23:59:59');

//         setDateRange({
//           start: formattedStartDate,
//           end: formattedEndDate,
//         });

//         await fetchData(
//           pagination.current,
//           pagination.pageSize,
//           '',
//           Type.CMS_WALLET_TO_MT,
//           formattedStartDate,
//           formattedEndDate,
//           selectedValue,
//         );

//         console.log('Selected date range:', formattedStartDate, formattedEndDate);
//       } else {
//         setDateRange({
//           start: '',
//           end: '',
//         });
//       }
//     } catch (error) {
//       console.log('Something went wrong', error);
//       await fetchData(pagination.current, pagination.pageSize, '', Type.CMS_WALLET_TO_MT, '', '');
//     }
//   };

//   const predefinedRanges = {
//     Today: [moment(), moment()],
//     Yesterday: [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
//     'Last 7 Days': [moment().subtract(6, 'days'), moment()],
//     // 'Last Month': [moment().subtract(6, 'days'), moment()],
//     'Last Month': [
//       moment().subtract(1, 'months').startOf('month'),
//       moment().subtract(1, 'months').endOf('month'),
//     ],
//   };
//   const rangePickerStyle = {
//     width: '100px', // Set the width as desired

//     // Add more custom styles here
//   };
//   const calendarStyle = { height: '10%', width: '250px' };
//   const dropdownPlacement = 'bottomLeft';

//   const onClick: MenuProps['onClick'] = ({ key }) => {
//     handleDropdownClick(key);
//   };

//   const items: MenuProps['items'] = [
//     {
//       label: 'Requested',

//       key: 'Requested',
//     },
//     {
//       label: 'Approved',

//       key: 'Approved',
//     },
//     {
//       label: 'Rejected',

//       key: 'Rejected',
//     },
//     {
//       label: 'All',
//       key: '',
//     },
//     /*   {
//       label: '4rd menu item',
//       key: '4',

//       danger: true,

//     }, */
//   ];
//   const handleDropdownClick = async (key: string) => {
//     console.log('======', key);
//     try {
//       const selectedValue = key;
//       console.log('Selected Value:', selectedValue);

//       setSelectedValue(selectedValue);
//       let formattedStartDate = '';
//       let formattedEndDate = '';
//       if (dateRange != undefined) {
//         const startDate = dateRange?.start as any;
//         const endDate = dateRange?.end as any;
//         if (startDate) {
//           formattedStartDate = moment(startDate)?.format('YYYY-MM-DD 00:00:00');
//         }
//         if (endDate) {
//           formattedEndDate = moment(endDate)?.format('YYYY-MM-DD 23:59:59');
//         }
//       }
//       setDateRange({
//         start: formattedStartDate,
//         end: formattedEndDate,
//       });

//       await fetchData(
//         pagination.current,
//         pagination.pageSize,
//         globalSearchText,
//         Type.CMS_WALLET_TO_MT,
//         formattedStartDate,
//         formattedEndDate,
//         selectedValue,
//       );

//       console.log('Selected date range:', formattedStartDate, formattedEndDate);
//     } catch (error) {
//       console.log('Something went wrong', error);
//       await fetchData(
//         pagination.current,
//         pagination.pageSize,
//         '',
//         Type.CMS_WALLET_TO_MT,
//         '',
//         '',
//         '',
//       );
//     }
//   };
//   //   const menuProps = {
//   //     items,
//   //     onClick: handleDropdownClick,
//   //   };
//   return (
//     <div>
//       <div
//         style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}
//         className="deposite_search"
//       >
//         <Input
//           size="small"
//           placeholder="Search"
//           prefix={<SearchOutlined style={{ color: '#487b9a' }} />}
//           style={{
//             width: '250px',
//             height: '40px',
//             marginBottom: '16px',
//             border: '2px solid #487b9a',
//           }}
//           value={globalSearchText}
//           onChange={(e) => setGlobalSearchText(e.target.value)}
//         />
//       </div>

//       {/* {loading ? (
//         <CustomLoader />
//       ) : ( */}
//       <div className="my-data-table" style={{ flex: 1, overflowY: 'auto' }}>
//         <h2 style={{ color: 'rgb(2 3 0)' }}>DEPOSIT COMMISSIONS TRANSACTION</h2>
//         <div className="datepicker-container">
//           <RangePicker
//             style={{ height: '40px' }}
//             ranges={predefinedRanges} // Add the predefined ranges
//             onChange={handleDateChange}
//             allowClear
//             // onCalendarClear={handleRangePickerClear}

//             placement="bottomLeft"
//             //    style={calendarStyle}
//             format="YYYY-MM-DD" // Specify date format
//           />
//           <Dropdown menu={{ items, onClick }}>
//             <a onClick={(e) => e.preventDefault()}>
//               <span
//                 style={{
//                   padding: '8px',
//                   margin: '8px',
//                   color: 'white',
//                   border: '1px solid white',
//                   borderRadius: '5px',
//                   backgroundColor: '#487b9a',
//                 }}
//               >
//                 Status: {selectedValue || 'All'}
//                 <DownOutlined />
//               </span>
//             </a>
//           </Dropdown>
//           <button className="divrefresh-btn" onClick={handleDivRefresh}>
//             Search
//           </button>
//           <div
//             style={{
//               width: '200px',
//               padding: '2px',
//               fontWeight: 700,
//               color: '#487b9a',

//               fontSize: '16px',
//             }}
//           >
//             {/* Total Amount: {totalAmount} */}
//           </div>
//         </div>

//         <DataTable
//           columns={columns}
//           className="my-data-table"
//           data={transactions}
//           customStyles={customStyles}
//           keyField="id"
//           highlightOnHover
//           responsive
//           selectableRows={false}
//           dense
//           pagination
//           paginationServer
//           paginationTotalRows={pagination.total}
//           paginationPerPage={10}
//           onChangePage={handlePageChange}
//           onChangeRowsPerPage={handlePageSizeChange}
//           paginationRowsPerPageOptions={[10, 20, 30]}
//           paginationComponentOptions={{ rowsPerPageText: 'Rows per page:' }}
//           progressPending={loading}
//           // conditionalRowStyles={conditionalRowStyles}
//           progressComponent={loading ? <CustomLoader /> : null}
//           actions={[
//             <a key="exportExcel" onClick={exportExcel}>
//               <FileExcelOutlined style={{ color: '#487b9a' }} />
//             </a>,
//             <a key="handleDivRefresh" onClick={handleDivRefresh}>
//               <RedoOutlined style={{ color: '#487b9a' }} />
//             </a>,
//           ]}
//         />
//       </div>
//       {/* )} */}

//       <Modal
//         title="Edit User Details"
//         open={visible}
//         onOk={handleOk}
//         onCancel={() => setVisible(false)}
//       >
//         <Form form={form} layout="vertical">
//           <Form.Item name="username" label="User Name" rules={[{ required: true }]}>
//             <Input />
//           </Form.Item>
//           <Form.Item name="bankName" label="Bank Name" rules={[{ required: true }]}>
//             <Input />
//           </Form.Item>
//           <Form.Item name="bankAddress" label="Bank Address" rules={[{ required: true }]}>
//             <Input />
//           </Form.Item>
//           <Form.Item name="accountNumber" label="Account Number" rules={[{ required: true }]}>
//             <Input />
//           </Form.Item>
//           <Form.Item name="ifscIBAN" label="IFSC/IBAN" rules={[{ required: true }]}>
//             <Input />
//           </Form.Item>
//           <Form.Item
//             name="additionalComment"
//             label="Additional Comment"
//             rules={[{ required: true }]}
//           >
//             <Input />
//           </Form.Item>
//         </Form>
//       </Modal>
//     </div>
//   );
// };
