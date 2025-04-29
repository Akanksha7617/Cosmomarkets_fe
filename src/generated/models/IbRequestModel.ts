/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Status } from './Status';

export type IbRequestModel = {
    id?: number;
    userId?: string | null;
    managerId?: string | null;
    ibCode?: string | null;
    ibGroup?: string | null;
    status?: Status;
    requestedAt?: string;
    completedAt?: string | null;
    userComment?: string | null;
    managerComment?: string | null;
    userName?: string | null;
    managerName?: string | null;
};
