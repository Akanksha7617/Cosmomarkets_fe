import { api } from '@/components/common/api';
import { AppUserModel } from '@/generated';
import { Tabs } from 'antd'
import TabPane from 'antd/es/tabs/TabPane'
 import SpinFC from 'antd/lib/spin';
import React, { useEffect, useState } from 'react'
 import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar, ResponsiveContainer } from 'recharts';

const AdminGraph: React.FC = () => {

    const [loading, setLoading] = useState(true);
    const [graphData, setGraphData] = useState<AppUserModel>([]);
    const [transactionData, setTransactionData] = useState<AppUserModel>({});

  

    //   const UserStatsGraph = ({ data }) => {




    useEffect(() => {
        const fetchData = async () => {
          try {
            const response = await api.app.getUsersGraph();
            console.log('usergraph:::::::::::::::', response);
    
            setGraphData(response);
          } catch (error) {
            // Handle error
            console.log('Error fetching user graph data:', error);
          }
        };
    
        fetchData();
      }, []);
    
      useEffect(() => {
        const fetchTransactionData = async () => {
          try { console.log('transactionData::::::::::::::::::::');
            const response = await api.app.getTransactionGraph();
           
    
            // Transform the API response into the required format
            const formattedData = response.accountDetailsByMonth.map((item: { month: number; totalWithdraw: any; totalMt5Withdraw: any; totalDeposit: any; totalMt5Deposit: any; }) => ({
              month: getMonthName(item.month),
              totalWithdraw: item.totalWithdraw,
              totalMt5Withdraw: item.totalMt5Withdraw,
              totalDeposit: item.totalDeposit,
              totalMt5Deposit: item.totalMt5Deposit,
            }));
    
            setTransactionData(formattedData);
            setLoading(false);
          } catch (error) {
            console.error('Error fetching transaction data:', error);
            setLoading(false);
          }
        };
    
        fetchTransactionData();
      }, []);
    
      const getMonthName = (monthNumber: number) => {
        const month = [
          'Jan', 'Feb', 'March', 'April', 'May', 'June', 'July', 'August', 'Sept', 'Oct', 'Nov', 'Dec'
        ];
        return month[monthNumber - 1];
      };
    
      if (loading) {
        return <div>Loading...</div>;
      }

    //   const maxUserCount = Math.max(...graphData.map(item => item.userCount));
    // const maxIBCount = Math.max(...graphData.map(item => item.ibCount));

    // const maxYValue = Math.max(maxUserCount, maxIBCount) > 100 ? Math.ceil(Math.max(maxUserCount, maxIBCount) / 10) * 10 : 100;

        // return (
        //     <div>
        //     {loading ? (
        //       <SpinFC />
        //     ) : (
        //       <>
            
        //                 <h2>Transaction Graph</h2>
        //                 {/* <TransactionsGraph data={transactionData} /> */}
        //     <BarChart width={800} height={500} data={transactionData} barSize={20}>
        //          <XAxis dataKey="month" />
        //           <YAxis />
        //           <CartesianGrid strokeDasharray="3 3" />
        //           <Tooltip />
        //           <Legend />
        //           <Bar  type="monotone" dataKey="withdraw" fill="#FA8E21" name="Withdraw" stroke="#8884d8" />
        //          <Bar  type="monotone" dataKey="deposit" fill="#00CC66"  name="Deposit" stroke="#82ca9d"/>
        //     </BarChart>
        //         </>
        //     )}
        //   </div>
        // );
    //   };

    const GeneralGraph = () => {
        return (
            <div className='admin-graph'>
            <h2>Clients Report</h2>
            {/* <GeneralGraph data={graphData} /> */}
            <ResponsiveContainer width="100%" height={500}>
        <BarChart data={graphData} barSize={20}>
             <XAxis dataKey="month" tickFormatter={(month) => getMonthName(month)} angle={-45} textAnchor="end" interval={0}/>
             <YAxis  ticks={[10,20,30,40,50,60,70,80,90,100]}/>
             <CartesianGrid strokeDasharray="3 3" />
             <Tooltip />
             <Legend />
                <Bar  type="monotone" dataKey="userCount" fill="#FA8E21" name="Users Registered" stroke="#8884d8" />
                <Bar  type="monotone" dataKey="ibCount" fill="#00CC66"  name="IB Accounts Created" stroke="#82ca9d"/>
         {/* <Bar  type="monotone" dataKey="userCount" fill="#00CC77"  name="IB Accounts Created" stroke="#82ca9d"/> */}

     </BarChart>
     </ResponsiveContainer>
                </div>
            )
    }

    const TransactionsGraph = () => {
        return (
          <div className='admin-graph-transac'>
          <ResponsiveContainer width="100%" height={400}>

<LineChart data={transactionData}>
  <XAxis dataKey="month" tick={{ fill: 'blue' }} />
  <YAxis yAxisId="left" tick={{ fill: 'green' }} />
  <YAxis yAxisId="right" orientation="right" tick={{ fill: 'red' }} />

  <CartesianGrid strokeDasharray="3 3" />
  <Tooltip contentStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.8)', color: 'white' }} />
  <Legend verticalAlign="top" align="center" iconType="circle" />

  <Line type="monotone" dataKey="totalWithdraw" name="Withdraw" stroke="green" strokeWidth={2} yAxisId="left" dot={{ stroke: 'red', strokeWidth: 2, fill: 'white' }} />
  <Line type="monotone" dataKey="totalMt5Withdraw" name="Mt5 Withdraw" stroke="orange" strokeWidth={2} yAxisId="left" dot={{ stroke: 'orange', strokeWidth: 2, fill: 'white' }} />
  <Line type="monotone" dataKey="totalDeposit" name="Deposit" stroke="skyblue" strokeWidth={2} yAxisId="right" dot={{ stroke: 'skyblue', strokeWidth: 2, fill: 'white' }} />
  <Line type="monotone" dataKey="totalMt5Deposit" name="Mt 5 Deposit" stroke="red" strokeWidth={2} yAxisId="right" dot={{ stroke: 'red', strokeWidth: 2, fill: 'white' }} />
</LineChart>
</ResponsiveContainer>
            </div>
        )
    }
    return (
        <div>

            <Tabs defaultActiveKey="1">

                <TabPane
                    tab={
                        <span>
                            Users
                        </span>
                    }
                    key="1"
                    lazyLoad
                >
                    <GeneralGraph />
                </TabPane>
                {/* <TabPane
                    tab={
                        <span>

                            Transactions
                        </span>
                    }
                    key="2"
                    lazyLoad
                >
                    <TransactionsGraph />
                </TabPane> */}
            </Tabs>
        </div>
    )
}

export default AdminGraph