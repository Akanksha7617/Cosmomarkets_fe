import { ToTopOutlined } from '@ant-design/icons';
import { Divider, Space, Statistic } from 'antd';
// import {PageContainer, ProFormSelect, ProFormText} from '@ant-design/pro-components';
import { api } from '@/components/common/api';
import { AppUserModel, TransactionModel } from '@/generated';
import { Encrypt } from '@/generated/services/Encrypt';
import { history, useModel } from '@umijs/max';
import { Form, InputRef, theme } from 'antd';
import { valueType } from 'antd/es/statistic/utils';
import { FilterConfirmProps } from 'antd/es/table/interface';
import {
  JSXElementConstructor,
  ReactElement,
  ReactNode,
  ReactPortal,
  useEffect,
  useRef,
  useState,
} from 'react';
import '../../common.css';
import CustomLoader from '../CustomLoader';
import AdminGraph from './AdminGraph';
const encryptor = new Encrypt();
//  import Graph from '../'

const AdminDashboard: React.FC = () => {
  const { token } = theme.useToken();
  const { initialState } = useModel('@@initialState');
  const [data, setData] = useState([]);
  const [transactions, setTransactions] = useState<TransactionModel[]>([]);
  const [userData, setUserData] = useState<AppUserModel>([]);
  const [totalDeposit, setTotalDeposit] = useState(0);
  const [totalWithdraw, setTotalWithdraw] = useState(0);
  const [mt5Deposit, setMt5Deposit] = useState(0);
  const [mt5Withdraw, setMt5Withdraw] = useState(0);
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const searchInput = useRef<InputRef>();
  const [form] = Form.useForm();
  const [accountData, setAccountData] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleSearch = (
    selectedKeys: string[],
    confirm: (param?: FilterConfirmProps) => void,
    dataIndex: string,
  ) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };
  const handleReset = (clearFilters: () => void) => {
    clearFilters();
    setSearchText('');
  };

  const onTabChange = (key: string) => {
    console.log(key);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await api.transaction.AdminAccountDetails();
        console.log('response:::', response.totalDeposit);
        setTotalDeposit(response.totalDeposit);
        setTotalWithdraw(response.totalWithdraw);
        setMt5Withdraw(response.totalMt5Withdraw);
        console.log('responseMt5:::', response.totalMt5Withdraw);

        setMt5Deposit(response.totalMt5Deposit);
        setAccountData(response); // Assuming the API returns data in the 'data' field
        setLoading(false);
      } catch (error) {
        console.error('Error fetching account details:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="admin-container">
      {loading ? (
        <CustomLoader />
      ) : (
        <div className="admin-sub-container">
          {/* <h2> <b> Dashboard</b></h2> */}

          <Space direction="horizontal">
            <DashboardCard
              title="Total Deposit"
              key="Total Deposit"
              value={totalDeposit + ` USD`}
              icon={
                <img
                  src="/images/Total.png" // Replace with your actual icon path
                  alt="Total Deposit Icon"
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255,165,0,0.15)',
                    padding: 8,
                  }}
                  onClick={() => history.push('/admin/transactions')}
                />
              }
            />

            <DashboardCard
              title="Total MT5 Deposit"
              key={`Total Mt5 Deposit`}
              value={mt5Deposit + ` USD`}
              icon={
                <img
                  src="/images/MT5Deposit.png" // Replace with your actual icon path
                  alt="Total Deposit Icon"
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255,165,0,0.15)',
                    padding: 8,
                  }}
                />
              }
            />

            <DashboardCard
              title="MT5 Withdraw Amount"
              key={`Total Mt5 Withdraw`}
              value={mt5Withdraw + ` USD`}
              icon={
                <img
                  src="/images/WithdrawAmount.png" // Replace with your actual icon path
                  alt="Total Deposit Icon"
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255,165,0,0.15)',
                    padding: 8,
                    marginBottom: 23, // Adjust this value to move the icon up
                  }}
                  onClick={() => history.push('/admin/withdrawTransaction')}
                />
              }
            />

            <DashboardCard
              title=" Withdraw Amount"
              key={`Total  Withdraw`}
              value={totalWithdraw + ` USD`}
              icon={
                <img
                  src="/images/MT5.png" // Replace with your actual icon path
                  alt="Total Deposit Icon"
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255,165,0,0.15)',
                    padding: 8,
                  }}
                  onClick={() => history.push('/admin/withdrawTransaction')}
                />
              }
            />
          </Space>
          <Divider />
          <div className="admin-graph-container">
            <Space direction="horizontal">
              <AdminGraph />
            </Space>
          </div>
        </div>
      )}
    </div>
  );
};

function DashboardCard(params: {
  icon:
    | string
    | number
    | boolean
    | ReactElement<any, string | JSXElementConstructor<any>>
    | Iterable<ReactNode>
    | ReactPortal
    | null
    | undefined;
  title:
    | string
    | number
    | boolean
    | ReactElement<any, string | JSXElementConstructor<any>>
    | Iterable<ReactNode>
    | ReactPortal
    | null
    | undefined;
  value: valueType | undefined;
}) {
  return (
    // <div className='main-dashboard'>
    <div className="dashboard-card-admin">
      <Space direction="horizontal">
        {params.icon}
        <Statistic
          title={<span style={{ fontSize: 16, color: 'white' }}>{params.title}</span>}
          value={params.value}
        />
      </Space>
    </div>
    // </div>
  );
}

export default AdminDashboard;
