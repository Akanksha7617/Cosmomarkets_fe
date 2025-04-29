import React, { useState, useEffect, useRef } from 'react';
import { DatePicker, Space, Select, Typography, Checkbox, Table, Button, Modal, Input, Form, InputRef } from 'antd';
import { Dropdown, Menu } from 'antd';
import { DeleteOutlined, DownOutlined, EditOutlined, RedoOutlined, SearchOutlined, VerticalAlignBottomOutlined } from '@ant-design/icons';
import DateRange from '@/tools/DateRange';
import SearchBox from '@/tools/SearchBox';
import './../../../global.scss'
import Search from 'antd/es/input/Search';
import { API } from "@/services/ant-design-pro/typings";
import { ActionType, ProColumns, ProTable,ProTableRef } from '@ant-design/pro-components';
import { useModel } from "@@/exports";
import { api } from "@/components/common/api";
import { GroupDto, Transaction } from '@/generated';
import { ColumnType, FilterConfirmProps } from 'antd/es/table/interface';

const { RangePicker } = DatePicker;

const { Option } = Select;

interface Data {
    group: string;
    
  }
  type DataIndex = keyof Data;



const dataSource = [
    {
        key: '1',
        checkbox: '155',
        name: 'John Brown',
        email: 32,
        mobile: '',
        flag: '',
        assign: '',
        created: '',
        status: '',
        ib: 'Abhijit V',
    },
    {
        key: '2',
        checkbox: '755',
        name: 'Abhijit',
        email: 32,
        mobile: '',
        flag: '',
        assign: '',
        created: '',
        status: '',
        ib: 'Abhijit V',
    },
    {
        key: '3',
        checkbox: '455',
        name: 'John Patil',
        email: 32,
        mobile: '',
        flag: '',
        assign: '',
        created: '',
        status: '',
        ib: 'Abhijit V',
    },

];

const expandedRowRender = (record) => (
    <div style={{ marginLeft: '10px', textAlign: 'center' }}>
        <div>Account Type</div>
        <div>Action <EditOutlined />   <DeleteOutlined /></div>
    </div>
);

const handleExpand = (record) => {
    record.expanded = !record.expanded;
};
// const columns = [
//     {
//         title: <div><Checkbox /> <VerticalAlignBottomOutlined /></div>,
//         dataIndex: 'checkbox',
//         key: 'checkbox',

//     },
//     {
//         title: 'ID',
//         dataIndex: 'id',
//         key: 'id',
//     },
//     {
//         title: 'Name',
//         dataIndex: 'name',
//         key: 'name',
//     },
//     {
//         title: 'Email',
//         dataIndex: 'email',
//         key: 'email',
//     },
//     {
//         title: 'Mobile',
//         dataIndex: 'mobile',
//         key: 'mobile',
//     },
//     {
//         title: 'Country',
//         dataIndex: 'country',
//         key: 'country',
//     }, ,
//     {
//         title: 'Media',
//         dataIndex: 'media',
//         key: 'media',
//     }, ,
//     {
//         title: 'Assignee',
//         dataIndex: 'assignee',
//         key: 'assignee',
//     },
//     {
//         title: 'Category',
//         dataIndex: 'category',
//         key: 'category',
//     },
//     {
//         title: 'Date',
//         dataIndex: 'date',
//         key: 'date',
//     },
//     {
//         title: 'Status',
//         dataIndex: 'status',
//         key: 'status',
//     },
//     {
//         title: 'Action',
//         dataIndex: 'action',
//         key: 'action',
//     }
// ];




const handleAction = (record) => {
    // Perform action based on the record
    console.log(record);
};


const options1 = [
    {
        value: 'selectrows',
        label: 'Assignee For Selected Rows',
    },
    {
        value: 'admin',
        label: 'Admin',
    },
]

const GroupSettings: React.FC<Props> = () => {

    const [value, setValue] = useState('abhi');
    const [data, setData] = useState<GroupDto[]>();
    const actionRef = useRef<ActionType>();

    const [editingId, setEditingId] = useState<number | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [editedData, setEditedData] = useState<EditedData | null>(null);
    const [searchText, setSearchText] = useState(''); 
  const [searchedColumn, setSearchedColumn] = useState('');
  const searchInput = useRef<InputRef>();
  const [form] = Form.useForm();
  const [refreshCount, setRefreshCount] = useState(0);

  const handleDivRefresh = () => {
    // Increment the refresh count to trigger a re-render of the div
    setRefreshCount((prevCount) => prevCount + 1);
  };
   const tableRef = useRef<ProTableRef>();

  const handleSearch = (
    selectedKeys: string[],
    confirm: (param?: FilterConfirmProps) => void,
    dataIndex: DataIndex,
  ) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };
  const handleReset = (clearFilters: () => void) => {
    clearFilters();
    setSearchText('');
  };
  const getColumnSearchProps = (dataIndex: DataIndex): ColumnType<dataIndex> => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
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
              setSearchedColumn(dataIndex);
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
    onFilter: (value, record) =>{
      let key = "";
      if(dataIndex==="name"){
          key = `${record.firstName} ${record.lastName}`
      }else{
        key = record[dataIndex].toString()
      }
         return key.toLowerCase()
         .includes((value as string).toLowerCase()) 
        },
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
  });

    useEffect(() => {
        getData()
    }, [])

    const getData = () => {
        api.group.getGroup().then(response => setData(response))
    }

    interface Props {
        onChange?: (dates: [moment.Moment, moment.Moment]) => void;
    }

    const handleMenuClick = (e: any) => {
        setValue(e.key);
    };

    interface EditedData {

        name: string;
        group: string;
        leverage: string;
        deposit: string;
    }

    const columns: ProColumns<GroupDto>[] = [


        {
            hideInSearch: true,
            title: 'Name',
            dataIndex: 'group',
            // filters: true,
            // onFilter: true,
            // ellipsis: true,
            align: 'left',
            key: 'name',
            ...getColumnSearchProps('group'),


        },
        // {

        //     title: 'Group',
        //     dataIndex: 'group',
        //     search: false,
        //     key: 'group'
        // },
        {
            title: 'Leverage',
            dataIndex: 'demoLeverage',
            hideInSearch: true,
            align: 'center',

        },
        {
            title: 'Deposit',
            key: 'demoDeposit',
            dataIndex: 'demoDeposit',
            // hideInSearch: true,
            align: 'center',
        },
        {
            title: 'IB Commision Levels',
            key: 'commissionTotal',
            dataIndex: 'commissionTotal',
            hideInSearch: true,
            align: 'center',
        },
        {
            title: 'Account Type',
            hideInSearch: true,
            render: () => <span>Live</span>
        },

        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <Button onClick={() => handleEdit1(record)}><EditOutlined/></Button>
            ),
        },


    ];

    const handleEdit1 = (record) => {

        setEditedData(record);
        setModalVisible(true);
    };
    

    const handleSave = () => {
        // Perform save operation for the edited data
        setModalVisible(false);
        setEditingId(null);
        setEditedData(null);
    };

    const handleCancel = () => {
        setModalVisible(false);
        setEditingId(null);
        setEditedData(null);
    };

    return (
        <div>
            <Typography title={4}><h3 style={{ textAlign: 'left' }}>Groups</h3></Typography>
            <Typography title={4}><h5 style={{ textAlign: 'left' }}>All Groups Created Here</h5></Typography>
            <div className='date-picker-cls'>
                <div className='date-picker-range'>
                    <DateRange />

                </div>
                <div className='search-box-1'>
                    <SearchBox
                        option={options1}
                    />
                </div>
            </div>
            <div className='input-search-cls'>
                <Space direction="vertical">
                    <Search
                        placeholder="input search text"
                        // onSearch={onSearch}
                        style={{ border: '0.5px solid grey', fontWeight: 'bold', width: 200, }}
                    />
                </Space>
            </div>
            <div>
                <ProTable
                    ref={tableRef}  

                    columns={columns}
                    dataSource={data}
                    actionRef={actionRef}
                    search={false}
                    rowKey="id"
                    pagination={false}
                    toolBarRender={() => [
                        // <a onClick={exportExcel}><FileExcelOutlined /></a>,
                        // <a onClick={handleDivRefresh}><ReloadOutlined /></a>
                        <a onClick={handleDivRefresh}><RedoOutlined /></a>
                        
                      ]}
                     
                />
                <Modal
                    visible={modalVisible}
                    title="Edit Record"
                    onCancel={handleCancel}
                    footer={[
                        <Button key="cancel" onClick={handleCancel}>
                            Cancel
                        </Button>,
                        <Button key="save" type="primary" onClick={handleSave}>
                            Save
                        </Button>,
                    ]}
                >
                    {editedData && (
                        <Form
                            initialValues={editedData}
                            onFinish={(values) => setEditedData(values)}
                        >
                            <Form.Item
                                label="Name"
                                name="name"
                                rules={[{ required: true, message: 'Please enter a name' }]}
                            >
                                <Input />
                            </Form.Item>
                            <Form.Item
                                label="Group"
                                name="group"
                                rules={[{ required: true, message: 'Please enter a group' }]}
                            >
                                <Input />
                            </Form.Item>
                            <Form.Item
                                label="Leverage"
                                name="leverage"
                                rules={[{ required: true, message: 'Please enter a leverage' }]}
                            >
                                <Input />
                            </Form.Item>
                            <Form.Item
                                label="Deposit"
                                name="deposit"
                                rules={[{ required: true, message: 'Please enter a deposit' }]}
                            >
                                <Input />
                            </Form.Item>
                            <Form.Item
                                label="IB Commission Levels"
                                name="ibCommissionLevels"
                                rules={[
                                    { required: true, message: 'Please enter IB commission levels' },
                                ]}
                            >
                                <Input />
                            </Form.Item>
                            <Form.Item
                                label="Account Type"
                                name="accountType"
                                rules={[
                                    { required: true, message: 'Please enter an account type' },
                                ]}
                            >
                                <Input />
                            </Form.Item>
                        </Form>
                    )}
                </Modal>
            </div>
        </div>
    )
}

export default GroupSettings;