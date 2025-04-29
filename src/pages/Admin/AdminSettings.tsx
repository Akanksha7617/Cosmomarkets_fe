import { api } from '@/components/common/api';
import { AccountType, AppUserDto } from '@/generated';
import { DeleteOutlined, EditOutlined, PlusOutlined, RedoOutlined } from '@ant-design/icons';
import { Button, Divider, Form, Input, message, Modal, Select, Space, Tooltip } from 'antd';
import React, { useEffect, useState } from 'react';
import 'react-phone-input-2/lib/style.css';

import { AdminSetting } from '@/generated/models/AdminSetting';
import { useModel } from '@umijs/max';
import moment from 'moment';
import DataTable from 'react-data-table-component';
import '../../common.css';
import config from '../../components/config.json';
import CustomLoader from '../CustomLoader';

const { Option } = Select;
// const countryCodes = [
//     { code: '+1', name: 'USA' },
//     { code: '+97', name: 'UAE' },
//     { code: '+91', name: 'India' },
//     { code: '+44', name: 'United Kingdom' },
//     { code: '+61', name: 'Australia' },
//     { code: '+33', name: 'France' },
//     { code: '+49', name: 'Germany' },
//     { code: '+81', name: 'Japan' },
//     { code: '+86', name: 'China' },
//     { code: '+7', name: 'Russia' },
//   ];
const countryCodes = [
  { code: '+971', name: 'United Arab Emirates' },
  { code: '+93', name: 'Afghanistan' },
  { code: '+355', name: 'Albania' },
  { code: '+966', name: 'Saudi' },
  { code: '+213', name: 'Algeria' },
  { code: '+1 684', name: 'American Samoa' },
  { code: '+376', name: 'Andorra' },
  { code: '+244', name: 'Angola' },
  { code: '+1 264', name: 'Anguilla' },
  { code: '+1 268', name: 'Antigua and Barbuda' },
  { code: '+54', name: 'Argentina' },
  { code: '+374', name: 'Armenia' },
  { code: '+297', name: 'Aruba' },
  { code: '+61', name: 'Australia' },
  { code: '+43', name: 'Austria' },
  { code: '+994', name: 'Azerbaijan' },
  { code: '+1 242', name: 'Bahamas' },
  { code: '+973', name: 'Bahrain' },
  { code: '+880', name: 'Bangladesh' },
  { code: '+1 246', name: 'Barbados' },
  { code: '+375', name: 'Belarus' },
  { code: '+32', name: 'Belgium' },
  { code: '+501', name: 'Belize' },
  { code: '+229', name: 'Benin' },
  { code: '+1 441', name: 'Bermuda' },
  { code: '+975', name: 'Bhutan' },
  { code: '+591', name: 'Bolivia' },
  { code: '+387', name: 'Bosnia and Herzegovina' },
  { code: '+267', name: 'Botswana' },
  { code: '+55', name: 'Brazil' },
  { code: '+246', name: 'British Indian Ocean Territory' },
  { code: '+1 284', name: 'British Virgin Islands' },
  { code: '+673', name: 'Brunei' },
  { code: '+359', name: 'Bulgaria' },
  { code: '+226', name: 'Burkina Faso' },
  { code: '+257', name: 'Burundi' },
  { code: '+855', name: 'Cambodia' },
  { code: '+237', name: 'Cameroon' },
  { code: '+1', name: 'Canada' },
  { code: '+238', name: 'Cape Verde' },
  { code: '+345', name: 'Cayman Islands' },
  { code: '+236', name: 'Central African Republic' },
  { code: '+235', name: 'Chad' },
  { code: '+56', name: 'Chile' },
  { code: '+86', name: 'China' },
  { code: '+61', name: 'Christmas Island' },
  { code: '+61', name: 'Cocos Islands' },
  { code: '+57', name: 'Colombia' },
  { code: '+269', name: 'Comoros' },
  { code: '+682', name: 'Cook Islands' },
  { code: '+506', name: 'Costa Rica' },
  { code: '+385', name: 'Croatia' },
  { code: '+53', name: 'Cuba' },
  { code: '+599', name: 'Curacao' },
  { code: '+537', name: 'Cyprus' },
  { code: '+420', name: 'Czech Republic' },
  { code: '+243', name: 'Democratic Republic of the Congo' },
  { code: '+45', name: 'Denmark' },
  { code: '+253', name: 'Djibouti' },
  { code: '+1 767', name: 'Dominica' },
  { code: '+1 809, +1 829, +1 849', name: 'Dominican Republic' },
  { code: '+670', name: 'East Timor' },
  { code: '+593', name: 'Ecuador' },
  { code: '+20', name: 'Egypt' },
  { code: '+503', name: 'El Salvador' },
  { code: '+240', name: 'Equatorial Guinea' },
  { code: '+291', name: 'Eritrea' },
  { code: '+372', name: 'Estonia' },
  { code: '+251', name: 'Ethiopia' },
  { code: '+500', name: 'Falkland Islands' },
  { code: '+298', name: 'Faroe Islands' },
  { code: '+679', name: 'Fiji' },
  { code: '+358', name: 'Finland' },
  { code: '+33', name: 'France' },
  { code: '+689', name: 'French Polynesia' },
  { code: '+241', name: 'Gabon' },
  { code: '+220', name: 'Gambia' },
  { code: '+995', name: 'Georgia' },
  { code: '+49', name: 'Germany' },
  { code: '+233', name: 'Ghana' },
  { code: '+350', name: 'Gibraltar' },
  { code: '+30', name: 'Greece' },
  { code: '+299', name: 'Greenland' },
  { code: '+1 473', name: 'Grenada' },
  { code: '+1 671', name: 'Guam' },
  { code: '+502', name: 'Guatemala' },
  { code: '+44', name: 'Guernsey' },
  { code: '+224', name: 'Guinea' },
  { code: '+245', name: 'Guinea-Bissau' },
  { code: '+592', name: 'Guyana' },
  { code: '+509', name: 'Haiti' },
  { code: '+504', name: 'Honduras' },
  { code: '+852', name: 'Hong Kong' },
  { code: '+36', name: 'Hungary' },
  { code: '+354', name: 'Iceland' },
  { code: '+91', name: 'India' },
  { code: '+62', name: 'Indonesia' },
  { code: '+98', name: 'Iran' },
  { code: '+964', name: 'Iraq' },
  { code: '+353', name: 'Ireland' },
  { code: '+44', name: 'Isle of Man' },
  { code: '+972', name: 'Israel' },
  { code: '+39', name: 'Italy' },
  { code: '+225', name: 'Ivory Coast' },
  { code: '+1 876', name: 'Jamaica' },
  { code: '+81', name: 'Japan' },
  { code: '+44', name: 'Jersey' },
  { code: '+962', name: 'Jordan' },
  { code: '+7', name: 'Kazakhstan' },
  { code: '+254', name: 'Kenya' },
  { code: '+686', name: 'Kiribati' },
  { code: '+383', name: 'Kosovo' },
  { code: '+965', name: 'Kuwait' },
  { code: '+996', name: 'Kyrgyzstan' },
  { code: '+856', name: 'Laos' },
  { code: '+371', name: 'Latvia' },
  { code: '+961', name: 'Lebanon' },
  { code: '+266', name: 'Lesotho' },
  { code: '+231', name: 'Liberia' },
  { code: '+218', name: 'Libya' },
  { code: '+423', name: 'Liechtenstein' },
  { code: '+370', name: 'Lithuania' },
  { code: '+352', name: 'Luxembourg' },
  { code: '+853', name: 'Macau' },
  { code: '+389', name: 'Macedonia' },
  { code: '+261', name: 'Madagascar' },
  { code: '+265', name: 'Malawi' },
  { code: '+60', name: 'Malaysia' },
  { code: '+960', name: 'Maldives' },
  { code: '+223', name: 'Mali' },
  { code: '+356', name: 'Malta' },
  { code: '+692', name: 'Marshall Islands' },
  { code: '+222', name: 'Mauritania' },
  { code: '+230', name: 'Mauritius' },
  { code: '+262', name: 'Mayotte' },
  { code: '+52', name: 'Mexico' },
  { code: '+691', name: 'Micronesia' },
  { code: '+373', name: 'Moldova' },
  { code: '+377', name: 'Monaco' },
  { code: '+976', name: 'Mongolia' },
  { code: '+382', name: 'Montenegro' },
  { code: '+1 664', name: 'Montserrat' },
  { code: '+212', name: 'Morocco' },
  { code: '+258', name: 'Mozambique' },
  { code: '+95', name: 'Myanmar' },
  { code: '+264', name: 'Namibia' },
  { code: '+674', name: 'Nauru' },
  { code: '+977', name: 'Nepal' },
  { code: '+31', name: 'Netherlands' },
  { code: '+599', name: 'Netherlands Antilles' },
  { code: '+687', name: 'New Caledonia' },
  { code: '+64', name: 'New Zealand' },
  { code: '+505', name: 'Nicaragua' },
  { code: '+227', name: 'Niger' },
  { code: '+234', name: 'Nigeria' },
  { code: '+683', name: 'Niue' },
  { code: '+672', name: 'Norfolk Island' },
  { code: '+850', name: 'North Korea' },
  { code: '+1 670', name: 'Northern Mariana Islands' },
  { code: '+47', name: 'Norway' },
  { code: '+968', name: 'Oman' },
  { code: '+92', name: 'Pakistan' },
  { code: '+680', name: 'Palau' },
  { code: '+970', name: 'Palestine' },
  { code: '+507', name: 'Panama' },
  { code: '+675', name: 'Papua New Guinea' },
  { code: '+595', name: 'Paraguay' },
  { code: '+51', name: 'Peru' },
  { code: '+63', name: 'Philippines' },
  { code: '+48', name: 'Poland' },
  { code: '+351', name: 'Portugal' },
  { code: '+1 787, +1 939', name: 'Puerto Rico' },
  { code: '+965', name: 'Kuwait' },
  { code: '+968', name: 'Oman' },
  { code: '+970', name: 'Palestine' },
  { code: '+974', name: 'Qatar' },
  { code: '+966', name: 'Saudi Arabia' },
  { code: '+963', name: 'Syria' },
  { code: '+90', name: 'Turkey' },
  { code: '+967', name: 'Yemen' },
  { code: '+44', name: 'United Kingdom' },
];
const LoginMessage: React.FC<{
  content: string;
}> = ({ content }) => {
  return (
    <Alert
      style={{
        marginBottom: 24,
      }}
      message={content}
      type="error"
      showIcon
    />
  );
};

const AdminSettings: React.FC = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [data, setData] = useState<AdminSetting[]>([]);
  const [form] = Form.useForm();
  const [type, setType] = useState<string>('signup');
  const { initialState, setInitialState } = useModel('@@initialState');
  const [promoCode, setPromo] = useState<string>('99999');

  const [card, setCard] = useState({
    name: '',
    url: '',
  });

  // const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [phone, setPhone] = React.useState('');
  const [loading, setLoading] = useState<boolean>(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [visible, setVisible] = useState(false);

  const [selected, setSelected] = useState<AppUserDto[]>([]);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    region: '',
    password: '',
    promo: '0',
  });
  const [resetPasswordLink, setResetPasswordLink] = useState('');

  const [dataSource, setDataSource] = useState<AppUserDto[]>([]);
  const [selectedCountry, setSelectedCountry] = useState('');
  let promoParam;
  const urlSearchParams = new URLSearchParams(window.location.search);
  const signupParam = urlSearchParams.get('signup');
  promoParam = urlSearchParams.get('promo');
  //   const promoParam = URLSearchParams.get('promo');

  const fetchData = async (page: number, pageSize: number, searchParam: String) => {
    try {
      setLoading(true);
      const response = await api.app.getAdmins();
      setPagination({ ...pagination, current: page, total: response.totalUsers });
      setDataSource(response);
      // console.log(response.userDtos[0]?.userDto?.firstName);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchData(pagination.current, pagination.pageSize, '');
  }, [pagination.current, pagination.pageSize]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  const handlePhoneChange = (value: any) => {
    setFormData({ ...formData, phone: value });
  };

  const handleCountryChange = (value: any) => {
    setFormData({ ...formData, region: value });
  };

  const showModal = () => {
    setModalVisible(true);
  };

  const handleCancel = () => {
    setModalVisible(false);
  };

  const createAdmin = async () => {
    console.log('-----------', formData);
    try {
      const msg = await api.app.createadmin(formData);
  
      if (msg.message.startsWith('Registration successful')) {
        const registrationSuccessMessage = msg.message;
        message.success({
          content: 'Admin account gets created',
          icon: <span style={{ color: 'green', fontSize: '20px' }}>✔</span>, // Custom success icon
          className: 'custom-success-notification', // Custom class for success message styling
          duration: 3, // Duration of the message
        });
        form.resetFields();
      } else if (msg.message === 'Sign Up failed Sign Up failed DuplicateUserName') {
        const registrationErrorMessage =
          'User with this email already exists! Please use a different email.';
        message.error({
          content: registrationErrorMessage,
          icon: <span style={{ color: 'red', fontSize: '20px' }}>✘</span>, // Custom error icon
          className: 'custom-error-notification', // Custom class for error message styling
          duration: 3, // Duration of the message
        });
      } else {
        // Handle other error cases here if needed
        message.error({
          content: 'An unknown error occurred, please try again.',
          icon: <span style={{ color: 'orange', fontSize: '20px' }}>⚠</span>, // Custom warning icon
          className: 'custom-warning-notification',
          duration: 3,
        });
      }
      handleCancel();
      handleDivRefresh();
    } catch (error) {
      console.error('Error calling the API:', error);
      message.error({
        content: 'Something went wrong while processing your request.',
        icon: <span style={{ color: 'red', fontSize: '20px' }}>✘</span>, // Custom error icon
        className: 'custom-error-notification',
        duration: 3,
      });
    }
  };
  
  const handleDivRefresh = () => {
    console.log('handleDivRefresh::');
    fetchData(pagination.current, pagination.pageSize, '');
    // Increment the refresh count to trigger a re-render of the div
    // setRefreshCount((prevCount) => prevCount + 1);
  };
  const handleOk = () => {
    form.validateFields().then(async (values) => {
      if (!selected.id) {
        return;
      }
      await api.app.putUserById(selected.id || '', { ...values });

      setVisible(false);
      fetchData(pagination.current, pagination.pageSize, '');
      // await fetchData()
    });
  };
  let BaseUrl: any;

  if (config.prod === 'yes') {
    BaseUrl = config.baseUrl;
  } else {
    BaseUrl = config.local + ':' + config.localPort;
  }

  const generateResetPasswordLink = (userId: any, passCode: any) => {
    const resetPasswordLink = `${BaseUrl}/user/login/DeleteAdmin?userId=${userId}&passCode=${passCode}`;

    return resetPasswordLink;
  };

  //   const handleDelete = async (record:any) => {
  //     try {
  //       const userId = record.id;
  //       console.log(record.id);
  //       console.log(userId);
  //       const response = await api.app.deleteAdmin(userId);
  //      handleDivRefresh();
  //     } catch (error) {
  //       console.error('API error:', error);

  //   };
  // }
  const handleDelete = async (record: any) => {
    try {
      const userId = record.id;
  
      const confirmed = window.confirm('Are you sure you want to delete this admin account?');
      if (!confirmed) {
        return; // User canceled the deletion
      }
      
      const response = await api.app.deleteAdmin(userId);
      console.log('delete admin', response);
  
      if (response.includes('Super admin cannot be deleted')) {
        message.error({
          content: 'Super admin cannot be deleted',
          icon: <span style={{ color: 'red', fontSize: '20px' }}>✘</span>, // Custom error icon
          className: 'custom-error-notification', // Custom class for error message styling
          duration: 3,
        });
      } else {
        message.success({
          content: response,
          icon: <span style={{ color: 'green', fontSize: '20px' }}>✔</span>, // Custom success icon
          className: 'custom-success-notification', // Custom class for success message styling
          duration: 3,
        });
      }
  
      handleDivRefresh();
    } catch (error) {
      console.error('Error deleting admin:', error);
      message.error({
        content: 'Something went wrong while trying to delete the admin account.',
        icon: <span style={{ color: 'red', fontSize: '20px' }}>✘</span>, // Custom error icon
        className: 'custom-error-notification',
        duration: 3,
      });
    }
  };
  

  const handleEdit = async (record: any) => {
    const mtClient = record.mtUsers?.find((m) => m.accountType === AccountType.CLIENT);
    const s = {
      ...record,
      masterPassword: mtClient?.password || '',
      investorPassword: mtClient?.investorPassword || '',
    };
    setSelected(record);
    form.setFieldsValue(s);
    setVisible(true);

    try {
      const userId = record.id;
      console.log(record.id);

      const response = await api.app.resetPassword(record.id);
      // const resetPasswordLink = generateResetPasswordLink(response.userID, response.passCode);

      // setResetPasswordLink(resetPasswordLink);
      // console.log('Reset password link:', resetPasswordLink);
    } catch (error) {
      console.error('API error:', error);
    }
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
        // Store token to local storage
        const token = msg.token;
        window.open(`${window.location.href}?token=${token}`, '_blank', 'noreferrer');
  
        message.success({
          content: 'Login successful! Redirecting...',
          icon: <span style={{ color: 'green', fontSize: '20px' }}>✔</span>, // Custom success icon
          className: 'custom-success-notification',
          duration: 2,
        });
      } else {
        throw new Error('Incorrect username/password');
      }
    } catch (error) {
      const defaultLoginFailureMessage = error.message || 'Login failed. Please try again.';
      console.log(error);
  
      message.error({
        content: defaultLoginFailureMessage,
        icon: <span style={{ color: 'red', fontSize: '20px' }}>✘</span>, // Custom error icon
        className: 'custom-error-notification',
        duration: 3,
      });
    }
  };
  

  const columns = [
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
      name: 'Mobile',
      selector: 'phone',
      sortable: true,
      filter: true,
      width: '130px',
    },
    {
      name: 'Created On',
      selector: 'createdAt',
      sortable: true,
      right: false,
      format: (row) => moment(row.createdAt).format('YYYY-MM-DD'),
    },
    {
      name: 'Action',
      cell: (row) => (
        <span>
          <Button type="link" onClick={() => handleEdit(row)}>
            <EditOutlined />
          </Button>
          <Button type="link" onClick={() => handleDelete(row)}>
            <DeleteOutlined />
          </Button>
        </span>
      ),
    },
  ];

  /*   const createAdmin = async () => {
    try {
      setLoading(true); 

     
      await api.app.createadmin(values); 

      setLoading(false); 
    } catch (error) {
      console.error('Error calling the API:', error);
      setLoading(false); 
     }
  } */ //   const UserCard: React.FC<{ key: string, adminsetting: AdminSetting}> = ({adminsetting}) => {
  //     const [form] = Form.useForm();
  //     const [loading, setLoading] = useState<boolean>(false)
  //     const [phone, setPhone] = React.useState('');
  // }

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
  const onFinish = (values: any) => {
    createAdmin();
    console.log('Success:', values);
  };

  return (
    <div>
      <Button type="link" icon={<PlusOutlined />} onClick={showModal}>
        Create New Admin
      </Button>
      <Divider />
      <Space wrap>
        {data.map((p) => (
          <UserCard key={p.name || ''} adminsetting={p} />
        ))}
      </Space>
      <div className="my-data-table users-data-table">
        <h2 style={{ fontFamily: 'math' }}>Admin Accounts</h2>
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
          // paginationTotalRows={pagination.total}
          paginationPerPage={10}
          // onChangePage={handlePageChange}
          // onChangeRowsPerPage={handlePageSizeChange}
          paginationComponentOptions={{ rowsPerPageText: 'Rows per page:' }}
          progressPending={loading}
          progressComponent={loading ? <CustomLoader /> : null}
          actions={[
            <a key="handleDivRefresh">
              <Tooltip title="Refresh">
                <RedoOutlined
                  // icon={FileExcelOutlined}
                  onClick={handleDivRefresh}
                  style={{ cursor: 'pointer', height: 20, color: '#f27059' }}
                />
              </Tooltip>
            </a>,
            // <a key="handleDivRefresh" onClick={handleDivRefresh}><RedoOutlined style={{ color: '#1e4f6a' }} /></a>
            // <a key="exportExcel" onClick={exportExcel}><img src="\images\excel-logo.png" alt="" style={{height:45,width:35}}/></a>,
            // <a key="handleDivRefresh" onClick={handleDivRefresh}><img src="\images\refresh-logo.png" alt="" style={{height:30,width:25}} /></a>
          ]}
        />
      </div>

      <Modal open={modalVisible} footer={null} onCancel={handleCancel} width={400}>
        <div className="create-form">
          <h2 className="login-title">Create Admin Account</h2>
          <Form layout="vertical" onFinish={onFinish}>
            <div className="create-firstname">
              <Form.Item
                label="First Name"
                name="firstName"
                initialValue={formData.firstName}
                rules={[
                  {
                    required: true,
                    message: 'Please enter your First Name',
                  },
                ]}
              >
                <Input name="firstName" onChange={handleInputChange} placeholder="First Name" />
              </Form.Item>
            </div>

            <div className="create-firstname">
              <Form.Item
                label="Last Name"
                name="lastName"
                initialValue={formData.lastName}
                rules={[
                  {
                    required: true,
                    message: 'Please enter your Last Name',
                  },
                ]}
              >
                <Input name="lastName" onChange={handleInputChange} placeholder="Last Name" />
              </Form.Item>
            </div>

            <div className="create-firstname">
              <Form.Item
                label="Email"
                name="email"
                initialValue={formData.email}
                rules={[
                  {
                    required: true,
                    message: 'Please enter email address!',
                  },
                  {
                    type: 'email',
                    message: 'Invalid email format',
                  },
                ]}
              >
                <Input name="email" onChange={handleInputChange} placeholder="Email address" />
              </Form.Item>
            </div>

            <div className="create-firstname">
              <Form.Item
                label="Phone Number"
                name="phone"
                initialValue={formData.phone}
                rules={[
                  {
                    required: true,
                    message: 'Please enter your Phone Number',
                  },
                  {
                    pattern: /^\d{10}$/, // Add the pattern for a 10-digit phone number
                    message: 'Please enter a valid 10-digit phone number',
                  },
                ]}
              >
                <Input name="phone" onChange={handleInputChange} placeholder="Phone number" />
              </Form.Item>
            </div>

            <div className="create-firstname">
              <Form.Item
                label="Select Country"
                name="region"
                rules={[
                  {
                    required: true,
                    message: 'Please select your country!',
                  },
                ]}
              >
                <Select
                  value={formData.region}
                  style={{ width: '100%' }}
                  onChange={handleCountryChange}
                  placeholder="Select Country"
                >
                  {countryCodes.map((country) => (
                    <Option key={country.name} value={country.name}>
                      {country.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </div>

            <div className="create-firstname">
              <Form.Item
                label="Password"
                name="password"
                rules={[
                  {
                    required: true,
                    message: 'Please input your password!',
                  },
                  {
                    pattern:
                      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/,
                    min: 8,
                    message:
                      'Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 digit, 1 special symbol, and be at least 8 characters long!',
                  },
                ]}
              >
                <Input.Password
                  name="password"
                  onChange={handleInputChange}
                  placeholder="Password"
                />
              </Form.Item>
            </div>

            <div className="create-firstname">
              <Form.Item hidden label="Promo" name="promo" initialValue={formData.promo}>
                <Input hidden name="promo" onChange={handleInputChange} placeholder="Promo" />
              </Form.Item>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <Button type="primary" htmlType="submit" className="create-btn">
                Submit
              </Button>
            </div>
          </Form>
        </div>
      </Modal>
      <Modal
        title=""
        open={visible}
        onOk={handleOk}
        onCancel={() => setVisible(false)}
        width={650}
        className="edit-user-details-dialog"
      >
        <h3
          style={{ color: '#1e4f6a', justifyContent: 'center', display: 'flex', fontSize: '20px' }}
        >
          EDIT ADMIN DETAILS
        </h3>
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
              rules={[{ required: true }]}
              style={{ width: '100%', marginLeft: 30, marginTop: 25, fontWeight: 'bold' }}
            >
              <Input style={{ width: '200px' }} />
            </Form.Item>
            <Form.Item
              name="lastName"
              label="Last Name"
              rules={[{ required: true }]}
              style={{ width: '100%', marginLeft: 60, marginTop: 25, fontWeight: 'bold' }}
            >
              <Input style={{ width: '200px' }} />
            </Form.Item>
          </div>
          <div className="forms_details" style={{ display: 'flex' }}>
            <Form.Item
              name="email"
              label="Email"
              rules={[{ required: true }]}
              style={{ width: '100%', marginLeft: 30, marginTop: 25, fontWeight: 'bold' }}
            >
              <Input style={{ width: '200px' }} />
            </Form.Item>
            <Form.Item
              name="password"
              label="Password"
              rules={[{ required: true }]}
              style={{ width: '100%', marginTop: 25, fontWeight: 'bold' }}
            >
              <Input style={{ width: '200px' }} />
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
                { required: true, message: 'Please enter your phone number' },
                {
                  pattern: /^\+?[0-9]{7,15}$/,
                  message: 'Invalid characters in phone number',
                },
              ]}
              style={{ width: '100%', marginLeft: 30, marginTop: 25, fontWeight: 'bold' }}
            >
              <Input style={{ width: '200px' }} placeholder="Enter phone number" />
            </Form.Item>

            <Form.Item
              name="promo"
              label="Promo"
              rules={[{ required: true }]}
              style={{ width: '100%', marginTop: 25, fontWeight: 'bold' }}
            >
              <Input style={{ width: '200px' }} />
            </Form.Item>
          </div>
          <div className="forms_details" style={{ display: 'flex' }}>
            <Form.Item
              name="region"
              label="Region"
              rules={[{ required: true }]}
              style={{ width: '100%', marginLeft: 30, marginTop: 25, fontWeight: 'bold' }}
            >
              <Input style={{ width: '200px' }} />
            </Form.Item>
            <Form.Item
              name="masterPassword"
              label="masterPassword"
              rules={[{ required: true }]}
              style={{ width: '100%', marginLeft: 30, marginTop: 25, fontWeight: 'bold' }}
              hidden
            >
              <Input style={{ width: '200px' }} />
            </Form.Item>
            <Form.Item
              name="investorPassword"
              label="investorPassword"
              rules={[{ required: true }]}
              style={{ width: '100%', marginLeft: 30, marginTop: 25, fontWeight: 'bold' }}
              hidden
            >
              <Input style={{ width: '200px' }} />
            </Form.Item>
          </div>
        </Form>
        {/* <div>
        <button onClick={() => handleDelete(row)}>Delete</button>
        </div> */}
      </Modal>
    </div>
  );
};

export default AdminSettings;

function async(arg0: (page: number, pageSize: number, searchParam: String) => void) {
  throw new Error('Function not implemented.');
}
