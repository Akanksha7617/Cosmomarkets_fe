/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

// import type { Bank } from './Bank';
import type { Type } from './Type';

export type CommissionWith = {
    type?: Type;
    amount?: number;
    currency?: string | null;
    comment?: string | null;
    paymentMethod?: string | null;
    login?: string | null;
    
};
