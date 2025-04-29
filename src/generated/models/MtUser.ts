/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AccountType } from './AccountType';

export type MtUser = {
    id?: number;
    userId?: string | null;
    login?: string | null;
    password?: string | null;
    investorPassword?: string | null;
    server?: string | null;
    accountType?: AccountType;
};
