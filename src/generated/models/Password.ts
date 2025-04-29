/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

/**
 * A Password data transfer object. Password wont be changed if corresponding value is empty
 */
export type Password = {
    /**
     * Master Password
     */
    master?: string | null;
    /**
     * Investor Password
     */
    investor?: string | null;
};
