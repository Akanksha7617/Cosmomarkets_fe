/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

/**
 * A Rights data transfer object.
 */
export type Rights = {
    enableAccount?: boolean;
    enablePasswordChange?: boolean;
    enableOTP?: boolean;
    enablePasswordAtNextLogin?: boolean;
    enableTrading?: boolean;
    enableTradingByExpert?: boolean;
    enableTrailingStops?: boolean;
    showToManager?: boolean;
    includeInServerReport?: boolean;
    enableDailyReport?: boolean;
    enableApiConnection?: boolean;
    enableSponsoredHosting?: boolean;
    enablePushNotification?: boolean;
};
