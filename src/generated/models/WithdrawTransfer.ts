/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Bank } from './Bank';
import type { Type } from './Type';

export type WithdrawTransfer = {
    type?: Type;
    amount?: number;
    currency?: string | null;
    comment?: string | null;
    bank?: Bank;
};
