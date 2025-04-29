/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { SettingType } from './SettingType';

export type CompanySetting = {
    id?: number;
    name?: string | null;
    type?: SettingType;
    companyName?: string | null;
    email?: string | null;
    whiteLogo?: string | null;
    whiteLogoName?: string | null;
    blackLogo?: string | null;
    blackLogoName?: string | null;
};
