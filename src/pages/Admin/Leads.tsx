import { api, rawApi, ShowError, updateAPIToken } from '@/components/common/api';
import { AccountType, AppUserDto, AppUserModel, SignUpRequest } from '@/generated';
import Proofs from '@/pages/Admin/Proofs';
import {
  EditOutlined,
  FileExcelOutlined,
  PlusOutlined,
  RedoOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { ActionType } from '@ant-design/pro-components';
import { faCopy } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useModel } from '@umijs/max';
import { Button, Form, Input, InputRef, message, Modal, Tabs, Tooltip } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import config from '../../components/config.json';
const { Search } = Input;

import { SaveMtUser } from '@/generated/models/SaveMTUser';
import { ConfigProvider, Switch } from 'antd';
import enUS from 'antd/lib/locale/en_US';
import moment from 'moment';
import DataTable from 'react-data-table-component';
import '../../common.css';
import '../../crm-components.css';
import CustomLoader from '../CustomLoader';
import CRMModal from './CRMModal';
import './Settings.css';

const Leads: React.FC<{ appUser: AppUserModel; getUser: Function }> = ({ appUser, getUser }) => {
  const actionRef = useRef<ActionType>();
  const { initialState, setInitialState } = useModel('@@initialState');

  const [dataSource, setDataSource] = useState<AppUserDto[]>([]);
  const [visible, setVisible] = useState(false);
  const [selected, setSelected] = useState<AppUserDto>({});
  const [record, setRecord] = useState<SignUpRequest>({});
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const searchInput = useRef<InputRef>();
  const [form] = Form.useForm();
  const [login, setlogin] = useState('');
  const [server, setserver] = useState('');
  const [UserId, setUserId] = useState('');
  const [MtUser, setMtUser] = useState('');
  const [Password, setPassword] = useState('');
  const [investorPassword, setInvestorPassword] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [resetPasswordLink, setResetPasswordLink] = useState('');
  const [refreshCount, setRefreshCount] = useState(0);
  const [formState, setFormState] = useState(initialFormState);
  const [loading, setLoading] = useState(true);
  const [isLinkCopied, setIsLinkCopied] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRows, setSelectedRows] = useState<string[]>([]); // Store selected rows across pages
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [globalSearchText, setGlobalSearchText] = useState('');
  const [crmModalVisible, setCrmModalVisible] = useState(false);
  const [selectedUserForCRM, setSelectedUserForCRM] = useState<any>(null);

  interface Data {
    id: number;
    userName: string;
    managerName: string;
    userComment: string;
    flag: string;
    assign: string;
    created: string;
    status: string;
  }

  type DataIndex = keyof Data;

  const handleOpenCRM = (row: any) => {
    const mtLogin =
      row.userDto?.login ||
      (row.mtUsers && row.mtUsers.length > 0 ? row.mtUsers[0].login : null) ||
      '';
    setSelectedUserForCRM({
      ...row,
      login: mtLogin, // Make sure the login is directly accessible in the userData object
    });
    setCrmModalVisible(true);
  };

  const handleSearch = (selectedKeys: string[], confirm: () => void, dataIndex: string) => {
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
    fetchData(pagination.current, pagination.pageSize, selectedKeys[0]);
  };
  const [searchValue, setSearchValue] = useState<AppUserDto[]>([]);
  const [filteredDataSource, setFilteredDataSource] = useState([]);
  const [searchTimeout, setSearchTimeout] = useState(null);

  const handleSearchname = async (value: any) => {
    try {
      setLoading(true);
      // Call your API passing the search value
      const response = await api.app.getSearchUsers(value);
      setDataSource(response);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (resetPasswordLink) {
      navigator.clipboard.writeText(resetPasswordLink);
      setIsLinkCopied(true);
      message.success('Link Copied');
      setTimeout(() => setIsLinkCopied(false), 2000); //
    } else {
      message.error('Oppps.. Issue with COpy button, copy link manually');
    }
  };

  const handleReset = (clearFilters: () => void) => {
    clearFilters();
    setSearchText('');
    fetchData(pagination.current, pagination.pageSize, '');
  };

  const handleOk = async () => {
    try {
      const excludedFields = ['masterPassword', 'investorPassword'];
      const fieldNamesToValidate = Object.keys(form.getFieldsValue()).filter(
        (fieldName) => !excludedFields.includes(fieldName),
      );

      const values = await form.validateFields(fieldNamesToValidate);

      if (!selected.id) {
        return;
      }
      const response = await api.app.putUserById(selected.id || '', { ...values });

      if (response.message.includes('User Details Updated')) {
        //store token to local stoarge
        message.success(response.message);
        setVisible(false);
        fetchData(pagination.current, pagination.pageSize, '');
      } else {
        message.error(response.message);
      }
    } catch (error) {
      console.error('Error during form validation or API call:', error);
      // Handle the error as needed (e.g., show an error message to the user)
      message.error('An error occurred while updating user details.');
    }
    // await fetchData()
  };

  const fetchData = async (page: number, pageSize: number, searchParam: string) => {
    try {
      setLoading(true);
      const response = await api.app.getLimitedUsers(page, pageSize, searchParam);

      setPagination((prev) => ({ ...prev, current: page, total: response.totalUsers }));
      setDataSource(response.usersDtos);

      // if (response.usersDtos.length > 0) {
      //   const userDto = response.usersDtos[0]; // Get first user
      //   const mtUser = userDto.mtUsers.length > 0 ? userDto.mtUsers[0] : null; // Get first mtUser

      //   if (mtUser) {
      //     setMtUser(mtUser.login);
      //     // setUserId(mtUser.userId);
      //     // setserver(mtUser.server);

      //     // ✅ Set form values
      //     form.setFieldsValue({
      //       login: mtUser.login, // Update login in the form
      //       // userId: mtUser.userId,
      //       // server: mtUser.server,
      //     });
      //   }
      // }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const isVisible = (row: any) => {
    if (row.mtUsers.length === 0) {
      return true;
    } else {
      return false;
    }
  };
  const handleSearchDebounced = (value) => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    const timeout = setTimeout(() => {
      fetchData(pagination.current, pagination.pageSize, value);
    }, 500);
    setSearchTimeout(timeout);
  };

  useEffect(() => {
    handleSearchDebounced(globalSearchText);
  }, [globalSearchText, pagination.current, pagination.pageSize]);

  // const fetchData = async () => {
  //   const response = await api.app.getUsers();
  //   setDataSource(response);
  // };

  const fetchUserInfo = async () => {
    const userInfo = await initialState?.fetchUserInfo?.();
    if (userInfo) {
      flushSync(() => {
        setInitialState((s: any) => ({
          ...s,
          currentUser: userInfo,
        }));
      });
      window.location.href = window.location.href;
    }
  };

  const onChange = (checked: boolean) => {
    console.log('inside onchange ', checked);
    form.setFieldsValue({
      isEnabled: checked,
    });
  };

  const handleSubmit = async (values: Record<string, any>) => {
    try {
      console.log('in signin', values.email, values.password);
      // return
      // strrstrr
      // await api.app.postSignUp();

      const msg = await api.app.postSignIn({
        email: values.email,
        password: values.password,
      });

      // console.log("Login resp: ", msg)

      if (msg.status === 'ok') {
        const defaultLoginSuccessMessage = 'Login successful!';
        message.success(defaultLoginSuccessMessage);
        await fetchUserInfo();

        return;
      }
    } catch (error) {
      const defaultLoginFailureMessage = 'Incorrect username/password';
      console.log(error);
      message.error(defaultLoginFailureMessage);
    }
  };

  const storeToken = (token: string) => {
    sessionStorage.setItem('jwtToken', token);
    updateAPIToken();
  };

  const handleSubmit1 = async (values: Record<string, any>) => {
    const urlParams = new URL(window.location.href).searchParams;
    let urlWithToken = null;

    try {
      const msg = await api.app.postSignIn({
        email: values.email,
        password: values.password,
      });

      if (msg.status === 'ok') {
        //store token to local stoarge
        const token = msg.token;
        window.open(`${window.location.href}?token=${token}`, '_blank', 'noreferrer');
      } else {
        if (msg.message.includes('User is disabled by admin')) {
          message.error('User is disabled by admin');
        } else {
          const defaultLoginFailureMessage = 'Login failed. Please try again.';
          message.error(defaultLoginFailureMessage);
          throw new Error('Incorrect username/password');
        }
      }
    } catch (error) {
      const defaultLoginFailureMessage = error.message || 'Login failed. Please try again.';
      console.log(error);
      message.error(defaultLoginFailureMessage);
    }
  };

  const handleSendEmail = async () => {
    try {
      setLoading(true);
      const values = form.getFieldsValue();
      console.log('🚀 Form Values:', values);

      const requestBody = {
        name: `${values.firstName} ${values.lastName}`,
        email: values.email,
        login: values.login,
        password: values.masterPassword,
        investorPassword: values.investorPassword,
      };

      console.log('📤 Sending Payload:', requestBody);

      // Make API call
      const response = await api.app.postSendCredentialMail(requestBody);
      if (response) {
        message.success(' email sent successfully');
      } else {
        message.error(response?.message || 'Failed to send  email');
      }

      // Try parsing response correctly
      let responseData;
      try {
        responseData = response?.data || response; // Handle both JSON and plain text responses
      } catch (parseError) {
        console.warn('⚠️ Response parsing error:', parseError);
        responseData = response; // Fallback to raw response
      }

      console.log('✅ Full API Response:', responseData);

      // Fix message extraction
      const apiMessage =
        typeof responseData === 'string'
          ? responseData
          : responseData?.message || 'Failed to send email.';

      // Show success message based on plain text response
      if (
        responseData &&
        typeof responseData === 'string' &&
        responseData.includes('successfully')
      ) {
        message.success(apiMessage);
      } else {
        console.error('⚠️ Email API Error:', apiMessage);
        message.error(apiMessage);
      }
    } catch (error) {
      console.error('❌ Error sending email:', error);
      message.error('An error occurred while sending the email.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (MtUser) {
      form.setFieldsValue({ mt5Login: MtUser });
    }
  }, [MtUser]);

  const handleDivRefresh = () => {
    console.log('handleDivRefresh::');
    fetchData(pagination.current, pagination.pageSize, globalSearchText);
    // Increment the refresh count to trigger a re-render of the div
    // setRefreshCount((prevCount) => prevCount + 1);
  };
  const initialFormState = {
    UserId: '',
    login: '',
    Password: '',
    investorPassword: '',
  };

  const Method1 = async (UserId: any) => {
    setUserId(UserId);
    setModalVisible(true);
  };

  const handleAttach = async () => {
    // setSelectedUser(user);

    form.validateFields().then(async (values) => {
      try {
        setUserId(UserId);
        // const UserId = record.id;

        // // console.log("???????",userDto.firstname)
        // console.log("=============",UserId)
        const formData = {
          login,
          UserId,
          Password,
          investorPassword,
        };

        const MT5Response = await api.app.SaveMtUser(formData);
        form.resetFields();
        setModalVisible(false);

        handleDivRefresh();
      } catch (error) {
        console.error('Error attaching MT5 login:', error);
      }
    });
  };

  const columns = [
    {
      name: 'Action',
      cell: (row) => (
        <Button type="link" onClick={() => handleEdit(row)}>
          <EditOutlined />
        </Button>
      ),
    },
    // {
    //   name: 'CRM',
    //   cell: (row) => (
    //     <Button type="link" onClick={() => handleOpenCRM(row)}>
    //       <PlusOutlined />
    //     </Button>
    //   ),
    // },
    {
      name: 'Name',
      selector: (row: any) => `${row.firstName} ${row.lastName}`,
      sortable: false,
      grow: 2,
      cell: (row) => (
        <div onClick={() => handleSubmit1(row)} style={{ cursor: 'pointer' }}>
          {`${row.firstName} ${row.lastName}`}
        </div>
      ),
    },
    {
      name: 'Email',
      selector: 'email',
      sortable: true,
      grow: 2,
      filter: true,
    },
    {
      name: 'MT5 login',
      selector: (row) => row.userDto?.login || '_',
      sortable: true,
      filter: true,
      width: '130px',
    },
    {
      name: 'Mobile',
      selector: 'phone',
      sortable: true,
      filter: true,
      width: '130px',
    },
    {
      name: 'Created',
      selector: 'createdAt',
      sortable: true,
      right: false,
      format: (row) => moment(row.createdAt).format('YYYY-MM-DD'),
      width: '130px',
    },
    // {
    //   name: 'Created',
    //   selector: 'createdAt',
    //   sortable: true,
    //   format: (row) => new Date(row.createdAt).toLocaleDateString(),
    // },
    {
      name: 'Promo',
      selector: 'promo',
    },
    {
      name: 'Wallet',
      cell: (row) => `${row.wallet?.balance || '0'} ${row.wallet?.currency}`,
      sortable: true,
      width: '130px',
    },
    {
      name: 'Balance',
      cell: (row) => row.userDto?.balance || '_',
      sortable: true,
      width: '130px',
    },
    {
      name: 'Equity',
      cell: (row) => row.userDto?.equityPrevDay || '_',
      sortable: true,
    },
    {
      name: 'Attach MT',
      selector: (row: any) => `${row.UserId} ${row.MtUser}`,
      cell: (row) =>
        isVisible(row) && (
          <>
            {/* <Button style={{ backgroundColor: 'navy', color: 'white' }} onClick={() => handleSubmit1(row)}>Login</Button> */}
            <img
              src="\images\login-logo.png"
              width={16}
              height={25}
              style={{ alignContent: 'center', marginLeft: 15, cursor: 'pointer' }}
              onClick={() => Method1(row.id)}
            />
          </>
        ),
    },
  ];

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
    cells: {
      style: {
        borderRight: '1px solid #ddd',
        // Add border to cells
      },
    },
    rows: {
      style: {
        '&:hover': {
          background: '#f5f5f5', // Set the highlight color here
          transition: 'background-color 0.3s ease', // Add a smooth transition effect
          cursor: 'default',
        },
      },
    },
  };

  let BaseUrl: any;

  if (config.prod === 'yes') {
    BaseUrl = config.baseUrl;
  } else {
    BaseUrl = config.local + ':' + config.localPort;
  }

  const generateResetPasswordLink = (userId: any, passCode: any) => {
    const resetPasswordLink = `${BaseUrl}/user/login/Resetpassword?userId=${userId}&passCode=${passCode}`;

    return resetPasswordLink;
  };

  const handleEdit = async (record: any) => {
    const mtClient = record.mtUsers?.find((m) => m.accountType === AccountType.CLIENT);
    const s = {
      ...record,
      masterPassword: mtClient?.password || '',
      investorPassword: mtClient?.investorPassword || '',

      login: mtClient?.login || '',
    };

    setSelected(record);
    form.setFieldsValue(s);
    setVisible(true);

    try {
      const userId = record.id;
      console.log(record.id);

      const response = await api.app.resetPassword(record.id);
      const resetPasswordLink = generateResetPasswordLink(response.userID, response.passCode);

      setResetPasswordLink(resetPasswordLink);
      console.log('Reset password link:', resetPasswordLink);
    } catch (error) {
      console.error('API error:', error);
    }
  };
  useEffect(() => {
    fetchData(pagination.current, pagination.pageSize, '');
  }, [pagination.current, pagination.pageSize]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  async function exportExcel() {
    // let response = await api.transaction.exportXlsx()
    let response = await rawApi.get(`/api/app/export/xlsx`, {
      responseType: 'blob',
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'export.xlsx');
    document.body.appendChild(link);
    link.click();

    message.success({
      content: 'File is being downloaded...',
      icon: <span className="orange-success-icon"> ✓ </span>,
      className: 'orange-success-notification',
      duration: 3,
    });

    // Clean up by revoking the temporary URL and removing the anchor element
    window.URL.revokeObjectURL(url);
    link.remove();
  }

  const handlePageChange = (page: any) => {
    setPagination({ ...pagination, current: page });
  };
  // const handleCancel = () => {
  //   setModalVisible(false);
  // };
  const handleCancel = () => {
    // Reset the form to its initial state
    form.resetFields();

    // Close the modal
    setModalVisible(false);
  };
  const handleFinish = async (values: any) => {
    form.validateFields().then(async (values) => {
      const newCard: SaveMtUser = {
        UserId: values.UserId,
        login: values.login,
        masterPassword: values.masterPassword,
        investorPassword: values.investorPassword,
      };
      try {
        await api.app.SaveMtUser(newCard);
        form.resetFields();
        setModalVisible(false);
      } catch (e: any) {
        ShowError(e);
      }
    });
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

      {/* {
            loading ? (<CustomLoader/>
            ): ( */}

      <div className="my-data-table users-data-table">
        <h2>USERS</h2>
        <DataTable
          columns={columns}
          className="my-data-table"
          data={dataSource}
          customStyles={customStyles}
          keyField="id"
          highlightOnHover
          // responsive
          selectableRows={false}
          dense
          pagination
          paginationRowsPerPageOptions={[10, 20, 30]}
          paginationServer
          paginationTotalRows={pagination.total}
          paginationPerPage={10}
          onChangePage={handlePageChange}
          onChangeRowsPerPage={handlePageSizeChange}
          paginationComponentOptions={{ rowsPerPageText: 'Rows per page:' }}
          progressPending={loading}
          progressComponent={loading ? <CustomLoader /> : null}
          //  progressComponent={ <CustomLoader/>}
          actions={[
            <a key="exportExcel" onClick={exportExcel}>
              <FileExcelOutlined style={{ color: '#f89d42' }} />
            </a>,
            <a key="handleDivRefresh" onClick={handleDivRefresh}>
              <RedoOutlined style={{ color: '#f89d42' }} />
            </a>,
            // <a key="exportExcel" onClick={exportExcel}><img src="\images\excel-logo.png" alt="" style={{height:45,width:35}}/></a>,
            // <a key="handleDivRefresh" onClick={handleDivRefresh}><img src="\images\refresh-logo.png" alt="" style={{height:30,width:25}} /></a>
          ]}
        />
      </div>

      {/* )} */}

      <CRMModal
        visible={crmModalVisible}
        onCancel={() => setCrmModalVisible(false)}
        userData={selectedUserForCRM}
        serverConfig={{ server: 'MT5 Server' }}
        serverName="MT5"
      />

      <Modal
        title=""
        open={visible}
        onOk={handleOk}
        onCancel={() => setVisible(false)}
        width={650}
        className="edit-user-details-dialog"
      >
        <h3 style={{ color: '#1e4f6a' }}>EDIT USER DETAILS</h3>
        <Form
          form={form}
          layout="vertical"
          className="edit_user_forms"
          style={{
            maxWidth: 700,
            marginTop: 0,
            borderRadius: '8px',
            padding: 20,
            backgroundColor: '#fff',
          }}
        >
          <div className="forms_details" style={{ display: 'flex' }}>
            <Form.Item
              name="firstName"
              label="First Name"
              rules={[
                { required: true, message: 'Please enter your first name.' },
                {
                  pattern: /^[a-zA-Z0-9. _]*$/,
                  message: 'Please enter valid characters (letters) and spaces only.',
                },
              ]}
              style={{ width: '100%', marginTop: 25, fontWeight: 'bold' }}
            >
              <Input style={{ height: '40px', backgroundColor: 'rgba(0, 0, 0, 0.04)' }} />
            </Form.Item>
            <Form.Item
              name="lastName"
              label="Last Name"
              rules={[
                { required: true, message: 'Please enter your last name.' },
                {
                  pattern: /^[a-zA-Z0-9. _]*$/,
                  message: 'Please enter valid characters (letters) and spaces only.',
                },
              ]}
              style={{ width: '100%', marginTop: 25, fontWeight: 'bold' }}
            >
              <Input style={{ height: '40px', backgroundColor: 'rgba(0, 0, 0, 0.04)' }} />
            </Form.Item>
          </div>
          <div className="forms_details" style={{ display: 'flex' }}>
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: 'Please enter your email.' },
                { type: 'email', message: 'Please enter a valid email address.' },
              ]}
              style={{ width: '100%', fontWeight: 'bold' }}
            >
              <Input style={{ height: '40px', backgroundColor: 'rgba(0, 0, 0, 0.04)' }} />
            </Form.Item>
            <Form.Item
              name="password"
              label="Password"
              rules={[
                { required: true, message: 'Please enter your password.' },
                {
                  pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/,
                  message:
                    'Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 digit, 1 special symbol, and be at least 8 characters long!',
                },
              ]}
              style={{ width: '100%', fontWeight: 'bold' }}
            >
              <Input
                style={{ height: '40px', backgroundColor: 'rgba(0, 0, 0, 0.04)' }}
                type="text"
              />
            </Form.Item>
          </div>
          <div className="forms_details" style={{ display: 'flex' }}>
            {/* <Form.Item name="phone" label="Phone" rules={[{ required: true }]}  style={{ width: '100%', marginLeft:30,marginTop:25,fontWeight:'bold'}}>
            <Input  style={{width:'200px'}}/>
          </Form.Item> */}
            <Form.Item
              name="phone"
              label="Phone"
              rules={[
                { required: true, message: 'Please enter your phone number.' },
                {
                  pattern: /^[0-9+]{10,}$/, // Allowing digits and "+" symbol, at least 10 characters
                  message: 'Please enter a valid phone number.',
                },
              ]}
              style={{ width: '100%', fontWeight: 'bold' }}
            >
              <Input style={{ height: '40px', backgroundColor: 'rgba(0, 0, 0, 0.04)' }} />
            </Form.Item>
            <Form.Item
              name="promo"
              label="Promo"
              rules={[{ required: true }]}
              style={{ width: '100%', marginTop: 25, fontWeight: 'bold' }}
            >
              <Input style={{ width: '200px' }} type="number" pattern="[0-9]*" />
            </Form.Item>
          </div>

          <div className="forms_details" style={{ display: 'flex' }}>
            <Form.Item
              name="masterPassword"
              label="masterPassword"
              rules={[{ required: true }]}
              style={{ width: '100%', marginLeft: 30, marginTop: 25, fontWeight: 'bold' }}
              // hidden
            >
              <Input style={{ width: '200px' }} />
            </Form.Item>
            <Form.Item
              name="investorPassword"
              label="investorPassword"
              rules={[{ required: true }]}
              style={{ width: '100%', marginLeft: 30, marginTop: 25, fontWeight: 'bold' }}
              // hidden
            >
              <Input style={{ width: '200px' }} />
            </Form.Item>
          </div>

          <div className="forms_details" style={{ display: 'flex' }}>
            <Form.Item
              name="region"
              label="Region"
              rules={[
                { required: true, message: 'Please enter your region.' },
                {
                  pattern: /^[a-zA-Z0-9\s]+$/, // Allowing letters, numbers, and spaces
                  message: 'Please enter a valid region (letters, numbers, and spaces only).',
                },
              ]}
              style={{ width: '100%', fontWeight: 'bold' }}
            >
              <Input style={{ height: '40px', backgroundColor: 'rgba(0, 0, 0, 0.04)' }} />
            </Form.Item>
            <Form.Item
              name="isEnabled"
              valuePropName="checked"
              label="Enable/Disable"
              rules={[{ required: true }]}
              style={{ width: '100%', marginLeft: 30, marginTop: 25, fontWeight: 'bold' }}
            >
              <Switch defaultChecked onChange={onChange} />
            </Form.Item>
          </div>

          <div className="forms_details" style={{ display: 'flex' }}>
            <Form form={form} layout="vertical">
              <Form.Item label="MT5 Login" name="login">
                <Input disabled />
              </Form.Item>
            </Form>
          </div>

          <div className="forms_details" style={{ display: 'flex' }}>
            <Button type="primary" style={{ backgroundColor: '#1e4f6a' }} onClick={handleSendEmail}>
              Send Email
            </Button>
          </div>
          <br></br>

          <Form.Item label="Reset Password Link">
            {resetPasswordLink && (
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <a
                  href={resetPasswordLink}
                  style={{ wordBreak: 'break-all' }}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {resetPasswordLink}
                </a>
                <span style={{ marginLeft: '10px' }}>
                  <Tooltip title="Copy Link">
                    <FontAwesomeIcon
                      icon={faCopy}
                      onClick={handleCopyLink}
                      style={{ cursor: 'pointer', height: 25, color: '#1e4f6a' }}
                    />
                  </Tooltip>
                </span>
                {/* {isLinkCopied && (
              // <span style={{ marginLeft: '10px', color: 'green' }}>Link Copied!</span>
            )} */}
              </div>
            )}
          </Form.Item>
        </Form>
      </Modal>
      <ConfigProvider locale={enUS}>
        <Modal
          title=""
          open={modalVisible}
          onOk={handleAttach}
          onCancel={handleCancel}
          // onCancel={() => setModalVisible(false)}
          // onCancel={() => {
          //   setModalVisible(false);
          //   setUserId('');
          //   setlogin('');
          //   setPassword('');
          //   setInvestorPassword('');
          // }}
          width={350}
          className="edit-user-details-dialog"
        >
          <h3
            style={{
              color: '#1e4f6a',
              justifyContent: 'center',
              display: 'flex',
              fontSize: '20px',
            }}
          >
            Attach MT5 Account
          </h3>
          <Form
            form={form}
            initialValues={formState}
            layout="vertical"
            className="edit_user_forms"
            style={{
              maxWidth: 700,
              marginTop: 0,
              borderRadius: '8px',
              padding: 20,
              backgroundColor: '#fff',
            }}
          >
            <Form.Item
              name="UserId"
              label="UserId"
              style={{ width: '100%', marginLeft: 30, marginTop: 25, fontWeight: 'bold' }}
              hidden
            >
              <Input
                value={UserId}
                onChange={(e) => setUserId(e.target.value)}
                style={{ width: '200px' }}
                hidden
              />
            </Form.Item>

            <Form.Item
              name="login"
              label="login"
              rules={[{ required: true }]}
              style={{ width: '100%', marginLeft: 30, marginTop: 25, fontWeight: 'bold' }}
            >
              <Input
                type="number"
                value={login}
                onChange={(e) => setlogin(e.target.value)}
                style={{ width: '200px' }}
              />
            </Form.Item>
            <Form.Item
              name="Password"
              label="master password"
              rules={[{ required: true }]}
              style={{ width: '100%', marginLeft: 30, marginTop: 25, fontWeight: 'bold' }}
            >
              <Input
                value={Password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: '200px' }}
              />
            </Form.Item>

            {/* <div className="forms_details" style={{display:'flex'}}> */}
            <Form.Item
              name="investor password"
              label="investor password"
              rules={[{ required: true }]}
              style={{ width: '100%', marginLeft: 30, marginTop: 25, fontWeight: 'bold' }}
            >
              <Input
                value={investorPassword}
                onChange={(e) => setInvestorPassword(e.target.value)}
                style={{ width: '200px' }}
              />
            </Form.Item>

            {/* </div> */}
            <div className="forms_details" style={{ display: 'flex' }}></div>
          </Form>
        </Modal>
      </ConfigProvider>
    </div>
  );
};

const Wrapper: React.FC = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading for 3 seconds
    const timer = setTimeout(() => {
      setLoading(false); // Set loading to false after 3 seconds
    }, 2000);

    return () => {
      clearTimeout(timer); // Clear the timer when the component unmounts
    };
  }, []);

  return (
    <div className="app">
      {/* {
  loading ? ( <CustomLoader/>
  ) : ( */}

      <Tabs
        defaultActiveKey="1"
        style={{ paddingRight: '20px' }}
        items={[
          {
            key: '1',
            label: (
              <span>
                <div className="users-tab">
                  <img
                    src="\images\users_icon_voco.png"
                    style={{ width: '45px', height: '40px' }}
                  />
                </div>
                <h5>USERS</h5>
              </span>
            ),
            children: (
              <div style={{ height: '600px', overflowY: 'auto' }}>
                <Leads />
              </div>
            ),
          },
          {
            key: '2',
            label: (
              <span>
                <div className="users-tab">
                  <img
                    src="\images\verification-red-icon-voco.png"
                    style={{ width: '40px', height: '40px' }}
                  />
                </div>
                <h5 style={{ marginLeft: '-10px' }}>VERIFICATION</h5>
              </span>
            ),
            children: (
              <div style={{ height: '500px', overflowY: 'auto' }}>
                <Proofs />
              </div>
            ),
          },
        ]}
        // tabBarExtraContent={<div style={{ width: 160 }}></div>} // Add space between tabs
        // tabHoverColor="#ff0000" // Change hover color
      />
      {/* )} */}
    </div>
  );
};

export default Wrapper;
