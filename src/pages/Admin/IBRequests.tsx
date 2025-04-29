import { api, rawApi } from '@/components/common/api';
import { TextPopconfirm } from '@/components/Custom/TextPopconfirm';
import { IbRequestModel, Status } from '@/generated';
import { useModel } from '@@/exports';
import {
  DislikeTwoTone,
  FileExcelOutlined,
  LikeTwoTone,
  RedoOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import type { ActionType } from '@ant-design/pro-components';
import { ProTableRef } from '@ant-design/pro-components';
import { Button, Form, Input, InputRef, message, Space, theme } from 'antd';
import { ColumnType, FilterConfirmProps } from 'antd/es/table/interface';
import moment from 'moment';
import { useEffect, useRef, useState } from 'react';
import DataTable from 'react-data-table-component';
import CustomLoader from '../CustomLoader';

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

export default () => {
  const actionRef = useRef<ActionType>();
  const [data, setData] = useState<IbRequestModel[]>();
  const { initialState, setInitialState } = useModel('@@initialState');
  const { token } = theme.useToken();
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const searchInput = useRef<InputRef>();
  const [form] = Form.useForm();
  const [refreshCount, setRefreshCount] = useState(0);
  const [globalSearchText, setGlobalSearchText] = useState('');
  const [searchTimeout, setSearchTimeout] = useState(null);
  // const [loading, setLoading] = useState(true);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const handleDivRefresh = () => {
    // Increment the refresh count to trigger a re-render of the div
    // setRefreshCount((prevCount) => prevCount + 1);
    getData(pagination.current, pagination.pageSize, ' ');
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
    onFilter: (value, record) => {
      let key = '';
      if (dataIndex === 'name') {
        key = `${record.firstName} ${record.lastName}`;
      } else {
        key = record[dataIndex].toString();
      }
      return key.toLowerCase().includes((value as string).toLowerCase());
    },
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
  });

  const getData = async (page: any, pageSize: any, param: any) => {
    try {
      setLoading(true);
      const response = await api.ib.getRequests();
      setData(response);
      setPagination({ ...pagination, current: page, total: 10 });
      setLoading(false);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchDebounced = (value) => {
    // Clear previous search timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const timeout = setTimeout(() => {
      getData(pagination.current, pagination.pageSize, value);
    }, 500); // Set the debounce delay here (500ms in this example)
    setSearchTimeout(timeout);
  };

  useEffect(() => {
    handleSearchDebounced(globalSearchText);
  }, [globalSearchText, pagination.current, pagination.pageSize]);

  const handlePageChange = (page: any) => {
    setPagination({ ...pagination, current: page });
  };

  // Function to handle page size changes
  const handlePageSizeChange = (pageSize: any) => {
    setPagination({ ...pagination, current: 1, pageSize }); // Reset to first page when page size changes
  };

  const columns1 = [
    {
      title: 'Id',
      dataIndex: 'id',
      ellipsis: true,
      tip: 'auto wraps',
      ...getColumnSearchProps('id'),

      hideInSearch: true,
      formItemProps: {
        rules: [
          {
            required: true,
            message: 'id required',
          },
        ],
      },
    },
    {
      title: 'User',
      dataIndex: 'userName',
      hideInSearch: true,
      ...getColumnSearchProps('userName'),
    },
    {
      title: 'Manager',
      dataIndex: 'managerName',
      hideInSearch: true,
      ...getColumnSearchProps('managerName'),
    },
    {
      title: 'User Comment',
      dataIndex: 'userComment',

      hideInSearch: true,
    },
    {
      hideInSearch: true,
      title: 'Status',
      dataIndex: 'status',
      filters: true,
      onFilter: true,
      ellipsis: true,
      valueType: 'select',
      valueEnum: {
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
          text: `Completed`,
          status: 'green',
        },
      },
    },
    {
      title: 'Requested at',
      key: 'showTime',
      dataIndex: 'requestedAt',
      valueType: 'date',
      //sorter: true,
      sorter: (a, b) => {
        const dateA = new Date(a.requestedAt || '');
        const dateB = new Date(b.requestedAt || '');
        return dateA.getTime() - dateB.getTime();
      },
      hideInSearch: true,
    },
    {
      title: 'Completed at',
      key: 'showTime',
      dataIndex: 'completedAt',
      valueType: 'date',
      //sorter: true,
      sorter: (a, b) => {
        const dateA = new Date(a.completedAt || '');
        const dateB = new Date(b.completedAt || '');
        return dateA.getTime() - dateB.getTime();
      },
      hideInSearch: true,
    },
    {
      title: 'createdInForm',
      dataIndex: 'requestedAt',
      valueType: 'dateRange',
      hideInTable: true,
      hideInSearch: true,
      search: {
        transform: (value) => {
          return {
            startTime: value[0],
            endTime: value[1],
          };
        },
      },
    },
  ];

  const managerActionColumn = {
    name: 'Action',
    selector: 'id', // Use any unique identifier for the selector
    width: '150px',
    right: true,
    cell: (row) => {
      const isRejected = row.status === Status.REJECTED;
      //const isCurrentUserManager = row.managerId === initialState?.currentUser?.id;
      const isCurrentUserManager = true;

      if (isCurrentUserManager) {
        return (
          <Space size={0}>
            {isRejected ? (
              <span style={{ color: 'red' }}>Rejected</span>
            ) : (
              <Space className="responsive-space">
                <TextPopconfirm
                  initText={'Approved'}
                  onConfirm={(comment: string) => {
                    let id = row.id ? row.id : 0;
                    api.ib
                      .putIbRequestById(id, {
                        approved: true,
                        comment: comment,
                      })
                      .then((response) => {
                        console.log(response);
                        getData(pagination.current, pagination.pageSize, '');
                      })
                      .catch((e) => console.log(e));
                  }}
                >
                  <Button style={{ display: 'flex', width: '50px' }}>
                    <LikeTwoTone twoToneColor={token.colorSuccess} style={{ marginTop: 5 }} />
                  </Button>
                </TextPopconfirm>
                <TextPopconfirm
                  initText={'Rejected'}
                  onConfirm={(comment: string) => {
                    api.ib
                      .putIbRequestById(row.id, {
                        approved: false,
                        comment: comment,
                      })
                      .then(() => getData(pagination.current, pagination.pageSize, ''));
                  }}
                >
                  <Button style={{ display: 'flex', width: '50px' }}>
                    <DislikeTwoTone twoToneColor={token.colorError} style={{ marginTop: 4 }} />
                  </Button>
                </TextPopconfirm>
              </Space>
            )}
          </Space>
        );
      } else {
        return <Space size={0}></Space>;
      }
    },
  };

  const columns = [
    {
      name: 'Id',
      selector: 'id',
      sortable: true,
      // wrap: true,
      hide: true,
      cell: (row) => row.id,
    },
    {
      name: 'User',
      selector: 'userName',
      sortable: true,
      // wrap: true,
    },
    {
      name: 'Manager',
      selector: 'managerName',
      sortable: true,
      // wrap: true,
    },
    {
      name: 'User Comment',
      selector: 'userComment',
      wrap: true,
      width: '150px',
    },
    {
      name: 'Status',
      selector: 'status',
      sortable: true,

      cell: (row) => row.status,
      hide: true,
    },
    {
      name: 'Requested at',
      selector: 'requestedAt',
      sortable: true,

      cell: (row) => {
        const dateA = new Date(row.requestedAt || '');
        return moment(dateA).format('YYYY-MM-DD');
      },
      width: '150px',
    },
    {
      name: 'Completed at',
      selector: 'completedAt',
      sortable: true,

      cell: (row) => {
        const dateA = new Date(row.completedAt || '');
        return moment(dateA).format('YYYY-MM-DD');
      },
      width: '150px',
    },
    // {
    //   name: 'created In',
    //   selector: 'requestedAt', // Assuming you want to display requestedAt in this column
    //   // wrap: true,
    //   hide: true,
    //   cell: (row) =>  moment(row.requestedAt).format('YYYY-MM-DD'), // Use the appropriate field for 'createdInForm'
    // },
    managerActionColumn,
  ];

  async function exportExcel() {
    let response = await rawApi.get(`/api/app/ib/export/xlsx`, {
      responseType: 'blob',
    });
  
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'ib.xlsx');
    document.body.appendChild(link);
    link.click();
  
    message.success({
      content: 'Your file is downloading...',
      icon: <span style={{ color: 'green', fontSize: '20px' }}>✔</span>,
      className: 'custom-success-notification',
      duration: 2,
    });
  
   
    window.URL.revokeObjectURL(url);
    link.remove();
  }
  
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    return () => {
      clearTimeout(timer);
    };
  }, []);

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
        },
      },
    },
  };

  return (
    <div>
      {/* {loading ? (
                <CustomLoader />
            ) : ( */}

      <>
        <h2>IB REQUEST</h2>
        <div className="my-data-table" style={{ flex: 1, overflowY: 'auto' }}>
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
            loading={loading}
            // conditionalRowStyles={conditionalRowStyles}
            progressComponent={loading ? <CustomLoader /> : null}
            actions={[
              <a key="exportExcel" onClick={exportExcel}>
                <FileExcelOutlined style={{ color: '#f89d42' }} />
              </a>,
              <a key="handleDivRefresh" onClick={handleDivRefresh}>
                <RedoOutlined style={{ color: '#f89d42' }} />
              </a>,
            ]}
          />
        </div>
      </>
      {/* )} */}
    </div>
  );
};
