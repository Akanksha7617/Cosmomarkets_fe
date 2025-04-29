import type { SettingType } from './SettingType';

export type AdminSetting = {
    id?: number;
    name?: string | null;
    type?: SettingType;
    promo?: string | null;
    group?: string | null;
    leverage?: number;
    priority?: number;
};
