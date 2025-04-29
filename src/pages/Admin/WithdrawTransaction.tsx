import { Tabs } from 'antd';
import TabPane from 'antd/es/tabs/TabPane';
import React,{useState,useEffect} from 'react';
import DepositTransaction from './Transactions/DepositTransaction';
import DepositTransactionMT5 from './Transactions/DepositTransactionMT5';
import WithdrawTransaction from './Transactions/WithdrawTransaction';
import WithdrawTransactionsMT from './Transactions/WithdrawTransactionsMT';
import CustomLoader from '../CustomLoader';

export default () => {

    const [loading,setLoading] = useState(true);

    useEffect(() => {
        // Simulate a 2-second loading time
        const timer = setTimeout(() => {
            setLoading(false);
        }, 2000);

        // Clear the timer when the component unmounts or when loading becomes false
        return () => clearTimeout(timer);
    }, []);

    return (
        <div>
            {/* {loading ? (
        <CustomLoader />
      ) : ( */}
            <Tabs defaultActiveKey="1" >
                

                <TabPane
                    tab={
                        <span>
                            <div className='withdraw-tab'>
                            <img src="\images\wallet-logo-icon-voco.png" style={{ height: 60, width: 60, padding: '8px',borderRadius:'5px',marginLeft:5 }} />
                            </div>
                        </span>
                    }
                    key="1"

                >
                    <WithdrawTransaction/>
                </TabPane>

                <TabPane
                    tab={
                        <span>
                             <div className='withdraw-tab'>
                                    <img src="\images\mt5-logo-icon-voco.png" style={{ height: 60, width: 60, padding: '8px', borderRadius: '5px' ,marginLeft:5}} />
                            </div>
                        </span>
                    }
                    key="2"

                >
                   <WithdrawTransactionsMT/>
                </TabPane>
            </Tabs>
      {/* )} */}
        </div>
    )
}