import React, { useRef, useState } from 'react'

import DateRange from '@/tools/DateRange'
import SearchBox from '@/tools/SearchBox'
import Search from 'antd/es/input/Search'
import { Button, Checkbox, Form, Input, InputRef, Modal, Space, Table } from 'antd'
import { DeleteFilled, DeleteOutlined, EditOutlined, MinusOutlined, PlusOutlined, SearchOutlined, SettingOutlined, VerticalAlignBottomOutlined } from '@ant-design/icons'
import EditGroup from './EditGroup'
import { ColumnType, FilterConfirmProps } from 'antd/es/table/interface'
// import EditGroup from './EditGroup'

interface Record {
  expanded: any
  name: string;
  level: string;
  group: string;

}
type DataIndex = keyof Record;


const LevelSettings: React.FC = () => {

  // const [record, setRecord] = useState<SignUpRequest>({});
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const searchInput = useRef<InputRef>();
  const [form] = Form.useForm();


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
    onFilter: (value, record) => {
      let key = "";
      if (dataIndex === "name") {
        key = `${record.firstName} ${record.lastName}`
      } else {
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

  const dataSource = [
    {
      key: '1',
      group: 'beta',
      level: 'L2',
      commission: 2,
      action: '',

    },
    {
      key: '2',
      group: 'beta',
      level: 'L1',
      commission: 3,
      action: '',

    },

  ];


  const expandedRowRender = (record: Record) => (
    <div style={{ marginLeft: '10px', textAlign: 'center' }}>
      <div>Account Type</div>
      <div>Action <EditOutlined />   <DeleteOutlined /></div>
    </div>
  );

  const handleExpand = (record: Record) => {
    record.expanded = !record.expanded;
  };

  const columns = [

    {
      title: 'Group',
      dataIndex: 'group',
      key: 'group',
      ...getColumnSearchProps('group'),

    },
    {
      title: 'Level',
      dataIndex: 'level',
      key: 'level',
      ...getColumnSearchProps('level'),

    },
    {
      title: 'Commission',
      dataIndex: 'commission',
      key: 'commission',
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      render: ( record: Record) => (
        <div onClick={() => showModal(record)}>
          <SettingOutlined />
        </div>
      ),
    },

  ];



  const showModal = (record: Record) => {
    Modal.info({
      title: `${record.name} Settings`,
      content: (
        <div>
          <EditGroup />
        </div>
      ),
      width: 600,
    });
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

  // const LevelSettings: React.FC = () => {
  return (
    <>
      <div>
        <div style={{ textAlign: 'left' }}>
          <p><h4>Groups IB Levels Commission</h4></p>
          <p>All Groups Levels Created Here</p>
        </div>
        <div style={{ textAlign: 'left' }}>
          <p><h4>Commissions Details</h4></p>
          <p>Commissions List with all the details</p>
        </div>
        <div className='date-picker-cls'>

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
          <Table
            dataSource={dataSource}
            columns={columns}
            // expandable={expandable}
            bordered

          />
        </div>
      </div>
    </>
  );
};


export default LevelSettings
