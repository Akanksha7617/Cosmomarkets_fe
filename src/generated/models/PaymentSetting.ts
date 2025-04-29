/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { SettingType } from './SettingType';

export type PaymentSetting = {
  id?: number;
  name?: string | null;
  type?: SettingType;
  url?: string | null;
  limit?: number;
  isActive?: boolean;
  remainingLimit?: number;
};
