import { Type } from '@/generated';
import React from 'react';
import { DepositTransferCommon } from './common/DepositTransferCommon';

const Deposit_Transfer: React.FC = () => {
  return (
    <div>
      <DepositTransferCommon
        title={'Deposit to MT5'}
        type={Type.WALLET_TO_MT}
        successMsg={{
          content: 'Requested deposit to MT5 successfully!',
          icon: <span className="orange-success-icon"> ✔ </span>,
          className: 'orange-success-notification',
          duration: 3,
        }}
        failureMsg={{
          content: 'Failed to request deposit amount to MT5!',
          icon: <span className="orange-error-icon"> ✘ </span>,
          className: 'orange-error-notification',
          duration: 3,
        }}
      />
    </div>
  );
};

export default Deposit_Transfer;
