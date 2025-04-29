/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type SignUpRequest = {
    email?: string | null;
    password?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    phone?: string | null;
    region?: string | null;
    promo?: string | null;
    createMtUser?: boolean;
    isEnabled:boolean;
    masterPassword?: string | null;
    investorPassword?: string | null;
};
