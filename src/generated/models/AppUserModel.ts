/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { MtUser } from './MtUser';
import type { UserDto } from './UserDto';
import type { Wallet } from './Wallet';

export type AppUserModel = {
    UserDtos: Array<UserDto> | null;
    userId: any;
    managerName: any;
    status: any;
    ibCode: any;
    mtUser: any;
    id?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
    phone?: string | null;
    region?: string | null;
    promo?: string | null;
    wallet?: Wallet;
    roles?: Array<string> | null;
    passcode?: string | null;
    mtUsers?: Array<MtUser> | null;
    userDtos?: Array<UserDto> | null;
};
