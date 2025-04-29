/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Password } from './Password';
import type { Rights } from './Rights';

/**
 * A User data transfer object.
 */
export type UserDto = {
    /**
     * Account
     */
    account?: string | null;
    /**
     * Address
     */
    address?: string | null;
    /**
     * Agent
     */
    agent?: number;
    /**
     * Balance
     */
    balance?: number;
    /**
     * BalancePrevDay
     */
    balancePrevDay?: number;
    /**
     * BalancePrevMonth
     */
    balancePrevMonth?: number;
    /**
     * CertSerialNumber
     */
    certSerialNumber?: number;
    /**
     * City
     */
    city?: string | null;
    /**
     * ClientID
     */
    clientID?: number;
    /**
     * Color
     */
    color?: number;
    /**
     * Comment
     */
    comment?: string | null;
    /**
     * CommissionAgentDaily
     */
    commissionAgentDaily?: number;
    /**
     * CommissionAgentMonthly
     */
    commissionAgentMonthly?: number;
    /**
     * CommissionDaily
     */
    commissionDaily?: number;
    /**
     * CommissionMonthly
     */
    commissionMonthly?: number;
    /**
     * Company
     */
    company?: string | null;
    /**
     * Country
     */
    country?: string | null;
    /**
     * Credit
     */
    credit?: number;
    /**
     * EMail
     */
    eMail?: string | null;
    /**
     * EquityPrevDay
     */
    equityPrevDay?: number;
    /**
     * EquityPrevMonth
     */
    equityPrevMonth?: number;
    /**
     * ExternalAccountTotal
     */
    externalAccountTotal?: number;
    /**
     * FirstName
     */
    firstName?: string | null;
    /**
     * Group
     */
    group?: string | null;
    /**
     * ID
     */
    id?: string | null;
    /**
     * InterestRate
     */
    interestRate?: number;
    /**
     * Language
     */
    language?: number;
    /**
     * LastAccess
     */
    lastAccess?: number;
    /**
     * LastIP
     */
    lastIP?: string | null;
    /**
     * LastName
     */
    lastName?: string | null;
    /**
     * LastPassChange
     */
    lastPassChange?: number;
    /**
     * LeadCampaign
     */
    leadCampaign?: string | null;
    /**
     * LeadSource
     */
    leadSource?: string | null;
    /**
     * Leverage
     */
    leverage?: number;
    /**
     * LimitOrders
     */
    limitOrders?: number;
    /**
     * LimitPositionsValue
     */
    limitPositionsValue?: number;
    /**
     * Login
     */
    login?: number;
    /**
     * MQID
     */
    mqid?: string | null;
    /**
     * MiddleName
     */
    middleName?: string | null;
    /**
     * Name
     */
    name?: string | null;
    /**
     * OTPSecret
     */
    otpSecret?: string | null;
    /**
     * Phone
     */
    phone?: string | null;
    /**
     * PhonePassword
     */
    phonePassword?: string | null;
    /**
     * Registration
     */
    registration?: number;
    /**
     * State
     */
    state?: string | null;
    /**
     * Status
     */
    status?: string | null;
    /**
     * ZIPCode
     */
    zipCode?: string | null;
    password?: Password;
    rights?: Rights;
    marginFree?: number;
};
