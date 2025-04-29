import { Type } from '@/generated'
import React from 'react'
import { DepositTransferCommon } from './common/DepositTransferCommon'
import '../../common.css'
import {history} from '@umijs/max'
import { Button } from 'antd'



const DepositTransfer: React.FC = () => {
    return (
      <>
        <Button type='button' onClick={() => history.push('/finops/deposit')} className="back-btn">Back</Button>
        <div>
          <DepositTransferCommon
            title={"Deposit to MT5"}
            type={Type.WALLET_TO_MT}
            successMsg={{
              content: 'Requested deposit to MT5 successfully!',
              icon: <span className="orange-success-icon"> ✔ </span>,
              className: 'orange-success-notification',
              duration: 3,
            }}
            failureMsg={{
              content: 'User does not have enough wallet balance!',
              icon: <span className="orange-error-icon"> ✘ </span>,
              className: 'orange-error-notification',
              duration: 3,
            }}
          />
        </div>
      </>
    );
  };
  

export default DepositTransfer