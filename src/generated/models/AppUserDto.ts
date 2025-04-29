/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { MtUser } from './MtUser';
import type { UserDto } from './UserDto';
import type { Wallet } from './Wallet';

export type AppUserDto = {
  paymentMethod: string;
  cryptoWallet: any;
  // comment: any;
  // account: any;
  bank: any;
  beneficiary?:string|null;
    name?:string | null;
    address?:string| null;
    account?:string| null;
    ifscIban?:string|null;
    comment?:string|null;
    cyrptoWalletAddress?:string|null;
    id?: string | null;
    userName?: string | null;
    normalizedUserName?: string | null;
    email?: string | null;
    normalizedEmail?: string | null;
    emailConfirmed?: boolean;
    passwordHash?: string | null;
    securityStamp?: string | null;
    concurrencyStamp?: string | null;
    phoneNumber?: string | null;
    phoneNumberConfirmed?: boolean;
    twoFactorEnabled?: boolean;
    lockoutEnd?: string | null;
    lockoutEnabled?: boolean;
    accessFailedCount?: number;
    firstName?: string | null;
    lastName?: string | null;
    phone?: string | null;
    region?: string | null;
    promo?: string | null;
    password?: string | null;
    createdAt?: string;
    mtUsers?: Array<MtUser> | null;
    wallet?: Wallet;
    userDto?: UserDto;
};
