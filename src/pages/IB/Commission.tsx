import {DislikeTwoTone, LikeTwoTone} from '@ant-design/icons';
import type {ActionType, ProColumns} from '@ant-design/pro-components';
import {ProTable} from '@ant-design/pro-components';
import {Button, Form, Modal, Space, Tag, theme} from 'antd';
import {useEffect, useRef, useState} from 'react';
import {api} from "@/components/common/api";
import {Status, Transaction} from "@/generated";
import {API} from "@/services/ant-design-pro/typings";
import {TextPopconfirm} from '@/components/Custom/TextPopconfirm';
import form from 'antd/es/form';
import Input from 'antd/lib/input';


export default () => {
  const actionRef = useRef<ActionType>();
  const [data, setData] = useState<Transaction[]>();
  const {initialState, setInitialState} = useModel('@@initialState');
  const {token} = theme.useToken();
  const [form] = Form.useForm();
  const [visible, setVisible] = useState(false);





  useEffect(() => {
    getData()
  }, [])

  const getData = ()=>{
    api.transaction.getTransaction().then(response => setData(response))
  }

  const columns: ProColumns<Transaction>[] = [
    // {
    //   dataIndex: 'index',
    //   valueType: 'indexBorder',
    //   width: 48,
    // },
    {
      title: 'Id',
      dataIndex: 'id',
      ellipsis: true,
      tip: 'auto wraps',
      hideInSearch: true,
      formItemProps: {
        rules: [
          {
            required: true,
            message: 'title required',
          },
        ],
      },
    },
    {
      hideInSearch: true,
      title: 'State',
      dataIndex: 'status',
      filters: true,
      onFilter: true,
      ellipsis: true,
      valueType: 'select',
      valueEnum: {
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
        }
      },
    },
    {
      disable: true,
      title: 'Type',
      dataIndex: 'type',
      search: false,
      renderFormItem: (_, {defaultRender}) => {
        return defaultRender(_);
      },
      render: (type, record) => (
        <Tag color={'success'} key={record.type}>
          {type}
        </Tag>
      ),
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      hideInSearch: true,
      align: 'right',
      render: (val, record) => (
        <>{`${record.amount?.toFixed(2)} ${record.currency}`}</>
      )
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

  if (initialState?.currentUser?.roles?.includes('Manager')) {
    columns.push(
      {
        title: 'Action',
        valueType: 'option',
        key: 'option',
        render: (text, record, _, action) => [
          <>

          {/* <Button onClick={()=>{
                    form.setFieldsValue(
                      
                      
                      
                      {
                        "accountNumber": "1211221222",

                        "additionalComment": "Godd And Well",

                        "bankAddress": "pune",
                        
                        "bankName": "sbi",
                        
                        "ifscIBAN" :  "11011",
                       
                        "username":"zaki Ahmad"
                        
                  });
                  setVisible(true)
                  }} style={{width:60,backgroundColor:'navy',color:'white'}}>Show</Button> */}
                  
                  
            {
              record.status === Status.REQUESTED && record.managerId=== initialState?.currentUser?.id ?
                <Space>
                  <TextPopconfirm initText={'Approved'} onConfirm={(comment: string)=>{
                    api.transaction.putTransactionById(record.id, {
                      approved:true,
                      comment:comment
                    }).then(()=>getData())
                  }}>
                    <Button
                    ><LikeTwoTone twoToneColor={token.colorSuccess}/>Approve</Button>
                  </TextPopconfirm>
                  <TextPopconfirm initText={'Rejected'} onConfirm={(comment: string)=> {
                    api.transaction.putTransactionById(record.id, {
                      approved:false,
                      comment:comment
                    }).then(()=>getData())
                  }}>
                    <Button>
                      <DislikeTwoTone twoToneColor={token.colorError}/>Reject
                    </Button>
                  </TextPopconfirm>

                </Space>
                : <></>
            }
          </>
          // <a
          //   key="editable"
          //   onClick={() => {
          //     //action?.startEditable?.(record.id);
          //   }}
          // >
          //   Approve
          // </a>
        ],
      }
    )
  }




 
  return (
    <><ProTable<Transaction, API.PageParams>
      headerTitle="Transactions"
      actionRef={actionRef}
      rowKey="id"
      search={false}
      cardBordered
      // request={
      //   async (params = {}, sort, filter) => {
      //   console.log(sort, filter);
      //   let d = await api.transaction.getTransaction();
      //   return {
      //     data:d,
      //     page:1,
      //     total:d.length,
      //     success:true,
      //   };
      // }
      // }
      dataSource={data}
      columns={columns}
      // editable={{
      //   type: 'multiple',
      // }}
      // columnsState={{
      //   persistenceKey: 'pro-table-singe-demos',
      //   persistenceType: 'localStorage',
      //   onChange(value) {
      //     console.log('value: ', value);
      //   },
      // }}
      options={{
        setting: {
          listsHeight: 400,
        },
      }}
      // form={{
      //   syncToUrl: (values, type) => {
      //     if (type === 'get') {
      //       return {
      //         ...values,
      //         created_at: [values.startTime, values.endTime],
      //       };
      //     }
      //     return values;
      //   },
      // }}
      pagination={{
        showSizeChanger: true,
        showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
      }}
      dateFormatter="string" />
      <Modal
        title="Edit User Details"
        open={visible}
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
          <Form.Item name="additionalComment" label="Additional Comment" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal></>

  );
};
function fetchData() {
  throw new Error('Function not implemented.');
}

function useModel(arg0: string): { initialState: any; setInitialState: any; } {
  throw new Error('Function not implemented.');
}

