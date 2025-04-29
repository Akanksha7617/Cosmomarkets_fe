/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Status } from './Status';

export type ProofRequestModel = {
    [x: string]: any;
    id?: number;
    userId?: string | null;
    managerId?: string | null;
    status?: Status;
    requestedAt?: string;
    completedAt?: string | null;
    userComment?: string | null;
    managerComment?: string | null;
    idProof?: string | null;
    addressProof?: string | null;
    idProofName?: string | null;
    addressProofName?: string | null;
    userName?: string | null;
    managerName?: string | null;
    idProofFile?: Blob | null;
    addressProofFile?: Blob | null;
    IdProofFileBackPage?: Blob;
    IdProofBackPageName?: string | null;
    IdProofBackPage?: string;
};
