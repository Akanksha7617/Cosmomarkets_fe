/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Bank } from './Bank';
import type { FileData } from './FileData';
import type { Status } from './Status';
import type { Type } from './Type';

export type WalletTransactionModel = {
  id: any;
  userId: string;
  balance: number;
  currency: string;
}


export type TransactionModel = {
  cryptoWallet: any;
  // cryptoWallet: any;
  cyrptoWalletAddress: string | null;
  id: number;
  name:string;
  userId: string | null;
  managerId: string | null;
  amount: number;
  Login:number;
  walletId :number;
  currency: string | null;
  type: Type;
  status: Status;
  requestedAt: string;
  completedAt: string | null;
  userComment: string | null;
  managerComment: string | null;
  bank: Bank;
  fileData: FileData;
  client: string | null;
  email: string | null;
  manager: string | null;
  paymentMethod:string
  isSuperAdmin:any,
  // wallet: Wallet;
};
