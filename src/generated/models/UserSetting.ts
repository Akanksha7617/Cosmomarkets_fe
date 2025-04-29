/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { SettingType } from './SettingType';

export type UserSetting = {
    id?: number;
    name?: string | null;
    type?: SettingType;
    promo?: string | null;
    group?: string | null;
    leverage?: number;
    priority?: number;
};
