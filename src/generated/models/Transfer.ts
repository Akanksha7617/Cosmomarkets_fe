/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Type } from './Type';

export type Transfer = {
    type?: Type;
    amount?: number;
    currency?: string | null;
    comment?: string | null;
};
