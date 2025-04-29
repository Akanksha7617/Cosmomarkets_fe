import { Type } from '@/generated';
import { history } from '@umijs/max';
import { Button } from 'antd';
import React from 'react';
import '../../common.css';
import { Transfer } from './common/Transfer';

const WithdrawTransfer: React.FC = () => {
  return (
    <>
      <Button onClick={() => history.push('/finops/withdraw')} className="back-btn">
        Back
      </Button>
      <div>
        <Transfer
          title={'Withdraw from MT5'}
          type={Type.MT_TO_WALLET}
          successMsg={{
            content: 'Requested withdraw to Wallet successfully!',
            icon: <span className="orange-success-icon"> ✔ </span>,
            className: 'orange-success-notification',
            duration: 3,
          }}
          failureMsg={{
            content: 'Failed to request withdraw amount to Wallet!',
            icon: <span className="orange-error-icon"> ✘ </span>,
            className: 'orange-error-notification',
            duration: 3,
          }}
        />
      </div>
    </>
  );
};

export default WithdrawTransfer;
