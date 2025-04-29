// import { Card, Col, Divider, Row, Space, Statistic, Typography } from 'antd'
// import React from 'react'
// import { ShoppingCartOutlined, UserOutlined, AccountBookOutlined, ToTopOutlined, VerticalAlignBottomOutlined } from '@ant-design/icons'
// // import Graph from './Graph'
// // import {PageContainer, ProFormSelect, ProFormText} from '@ant-design/pro-components';
// import {useModel} from '@umijs/max';
// import {
//   Button,
//   Form,
//   Input,
//   InputRef, message,
//   Modal,
//   Table,
//   Tabs,
//   TabsProps,
//   theme
// } from 'antd';
// import  {useState, useEffect, useRef} from 'react';
// // import {Typography} from "antd";
// import {CustomList, KeyValue} from "@/components/Custom/CustomList"
// // import {history} from '@umijs/max'
// // import Login from '../User/Login';
// // import {api, ShowError} from "@/components/common/api";
// import {AppUserDto, AppUserModel, MtUserRequest, TransactionModel, UserSetting} from '@/generated';
// import {Item} from 'rc-menu';
// import Telegram from '@/generated/bot/Telegram';
// import {SearchOutlined} from '@ant-design/icons';
// import {ColumnType, FilterConfirmProps} from 'antd/es/table/interface';
// // import ProCard from "@ant-design/pro-card";
// import TabPane from "antd/es/tabs/TabPane";
// // import {ProForm, ProFormDigit} from "@ant-design/pro-form";
// import {PasswordValidator} from "@/components/Custom/Validators";
// import "../../common.css"

// const Home = () => {
//   return (
//     <div>
//       <div>
//         <Typography title={4}>Dashboard</Typography>
//         <Space direction='horizontal'>
//           <DashboardCard
//             title="Regisred Users"
//             value="66"
//             icon=<UserOutlined
//               style={{
//                 color: 'green',
//                 backgroundColor: "rgba(0,255,0,0.15)",
//                 borderRadius: 20,
//                 fontSize: 24,
//                 padding: 8
//               }}
//             />
//           />
//           <DashboardCard
//             title="Live Accounts"
//             value="66"
//             icon=<AccountBookOutlined
//               style={{
//                 color: 'blue',
//                 backgroundColor: "rgba(0,0,250,0.15)",
//                 borderRadius: 20,
//                 fontSize: 24,
//                 padding: 8
//               }}
//             />
//           />
//           <DashboardCard
//             title="Deposit Amount"
//             value="66"
//             icon=<ToTopOutlined
//               style={{
//                 color: 'Yellow',
//                 backgroundColor: "rgba(255,165,0,0.15)",
//                 borderRadius: 20,
//                 fontSize: 24,
//                 padding: 8
//               }}
//             />
//           />
//           <DashboardCard
//             title="Withdraw Amount"
//             value="66"
//             icon=<VerticalAlignBottomOutlined
//               style={{
//                 color: 'Red',
//                 backgroundColor: "rgba(255,0,0,0.15)",
//                 borderRadius: 20,
//                 fontSize: 24,
//                 padding: 8
//               }}
//             />
//           />
//         </Space>
//         <Divider />
//         <div>
//         <Space direction='horizontal'>
//           <Graph />
//         </Space>
//         </div>
//       </div>
     
//     </div>

//   )
// }

// function DashboardCard(params) {
//   return (
//     <div className='main-dashboard'>
//       <div>
//         <Card>
//           <Space direction='horizontal'>
//             {params.icon}
//             <Statistic title={params.title} value={params.value} />
//           </Space>
//         </Card>
//       </div>

//     </div>
//   )
// }

// export default Home