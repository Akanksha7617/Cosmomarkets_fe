// import { VerticalAlignBottomOutlined } from '@ant-design/icons';
// import { Checkbox, Table, Tabs } from 'antd';
// import TabPane from 'antd/es/tabs/TabPane';
// import React, { useState, useEffect, useRef } from 'react';

// import { api, ShowError } from "@/components/common/api";
// import { TransactionModel } from '@/generated';

// import type { Type } from '../../generated/models/Type';


// const DepositTabs = () => {

//   const [transactions, setTransactions] = useState<TransactionModel[]>([]);
//   const [mt5Transaction, setMt5Transaction] = useState<TransactionModel[]>([]);
//   // const [userData, setUserData] = useState<AppUserModel>({});




//   useEffect(() => {

//     const fetchData = async () => {

//       const response = await api.transaction.getTransaction();
    
//       const depositFilteredData = response.filter(item => item.type === 'ExtToWallet')
//       const mt5FilteredData = response.filter(item => item.type === 'WalletToMt')

//       if (response) {
    
            
//         setTransactions(depositFilteredData);
//         setMt5Transaction(mt5FilteredData);

//       }
//     };

//     fetchData();
//   }, []);

//   const columns = [
//     {
//       title: 'ID',
//       dataIndex: 'id',
//     },
//     {
//       title: 'User',
//       dataIndex: 'client',
//     },
//     {
//       title: 'Manager',
//       dataIndex: 'manager',
//     },
//     {
//       title: 'Amount',
//       dataIndex: 'amount',
//     },
//     {
//       title: 'Currency',
//       dataIndex: 'currency',
//     },
//     {
//       title: 'Email',
//       dataIndex: 'email',
//     },
//     {
//       title: 'Status',
//       dataIndex: 'status',
//     },
//     {
//       title: 'Requested At',
//       dataIndex: 'requestedAt',
//     },
//     {
//       title: 'Completed At',
//       dataIndex: 'completedAt',
//     },
//     {
//       title: 'User Comment',
//       dataIndex: 'userComment',
//     },
//     {
//       title: 'Manager Comment',
//       dataIndex: 'managerComment',
//     },
//   ];




//   return (
//     <div>
//       <Tabs defaultActiveKey="1" >

//         <TabPane
//           tab={
//             <span>
//               Wallet
//             </span>
//           }
//           key="1"
//           lazyLoad
//         >
//           <Table columns={columns} dataSource={transactions} className='table-row' />
//         </TabPane>
//         <TabPane
//           tab={
//             <span>
//               MT5 
//             </span>
//           }
//           key="2"
//           lazyLoad
//         >
//           <Table columns={columns} dataSource={mt5Transaction} className='table-row' />
//         </TabPane>
//         {/* <TabPane
//           tab={
//             <span>
//               IB
//             </span>
//           }
//           key="3"
//           lazyLoad
//         >
//           <Table columns={columns} dataSource={transactions} className='table-row' />
//         </TabPane> */}
//       </Tabs>
//     </div>
//   )
// }

// export default DepositTabs


