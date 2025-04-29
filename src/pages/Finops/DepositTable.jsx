import { ExclamationCircleOutlined, AudioOutlined, DownloadOutlined, VerticalAlignBottomOutlined } from '@ant-design/icons';
import { Table, Input, Space, Typography, DatePicker, Select, Button, Divider, Checkbox } from 'antd'
import React, { useState } from 'react'
// import { ExportCSV } from 'antd-table-export';
// import stringify from 'csv-stringify/lib/sync';
import '../master.scss';
import dayjs from 'dayjs';
import SearchBox from '../../tools/SearchBox';
import DateRange from '../../tools/DateRange';
import DepositTabs from './DepositTabs';
const { Search } = Input;



const options1 = [
  {
    value: 'all',
    label: 'All',
  },
  {
    value: 'pending',
    label: 'Pending',
  },
  {
    value: 'cancelled',
    label: 'Cancelled',
  },
  {
    value: 'approved',
    label: 'Approved',
  },
  {
    value: 'rejected',
    label: 'Rejected',
  },


]

const options2 = [
  {
    value: 'all',
    label: 'All',
  },
  {
    value: 'real',
    label: 'Only Real Deposit',
  },
]

const ExportButton = ({ onClick }) => (
  <Space wrap>
    <Button type="primary"
      icon={<DownloadOutlined />}
      size='Middle' >
      {/* onClick={onClick} */}
      Export
    </Button>
  </Space>
)

const DepositTable = () => {
  return (
    <>
    {/* <Button onClick={() => history.push('/AdminDashboard')} className="back-btn">Back</Button>  */}

      <div style={{ fontSize: 16, padding: 10 }}><b>Deposit Transaction History</b></div>

      <Typography title={4}><h2 style={{ textAlign: 'left' }}>Deposit Transations</h2></Typography>
      <Typography title={4}><h4 style={{ textAlign: 'left' }}>All Deposit Transactions</h4></Typography>

      <div>
        <Typography title={4}><h4 style={{ textAlign: 'left' }}>Deposit Details</h4></Typography>
        <p style={{ textAlign: 'left' }}>Deposit List with all the details</p>
      </div>
      <div className='date-picker-cls'>
        <div className='date-picker-range'>
          <DateRange />
        </div>
        <div className='search-box-1'>
          <SearchBox
            option={options1} />
        </div>
        <div className='search-box-1'>
          <SearchBox
            option={options2} />
        </div>
        <div style={{ marginLeft: '350px' }}>
          <ExportButton />
        </div>
      </div>




      <div>
        <DepositTabs />
      </div>
    </>
  )
}

export default DepositTable