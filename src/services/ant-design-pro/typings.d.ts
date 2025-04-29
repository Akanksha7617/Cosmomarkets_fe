// @ts-ignore
/* eslint-disable */

import { scalarOptions } from 'yaml';
import {api} from "@/components/common/api";

import {AppUserModel, Transaction} from "@/generated";

declare namespace API {
  import Str = scalarOptions.Str;
  type wallet = {
    balance: decimal;
    currency: string;
  };
  type CurrentUser = AppUserModel & {
    name?: string;
    avatar?: string;
  };

  type LoginResult = {
    status?: string;
    type?: string;
    currentAuthority?: string;
    message?: string;
  };

  type PageParams = {
    current?: number;
    pageSize?: number;
  };

  type RuleListItem = {
    key?: number;
    disabled?: boolean;
    href?: string;
    avatar?: string;
    name?: string;
    owner?: string;
    desc?: string;
    callNo?: number;
    status?: number;
    updatedAt?: string;
    createdAt?: string;
    progress?: number;
  };

  type RuleList = {
    data?: RuleListItem[];
    /** strrstrrstrrstrrstrrstrrstrr */
    total?: number;
    success?: boolean;
  };

  type FakeCaptcha = {
    code?: number;
    status?: string;
  };

  type LoginParams = {
    email?: string;
    password?: string;
    autoLogin?: boolean;
    type?: string;
  };

  type ErrorResponse = {
    /** strrstrrstrrstrrstrrstrrstrrstrr */
    errorCode: string;
    /** strrstrrstrrstrrstrrstrrstrrstrr */
    errorMessage?: string;
    /** strrstrrstrrstrrstrrstrrstrrstrrstrrstrr */
    success?: boolean;
  };

  type NoticeIconList = {
    data?: NoticeIconItem[];
    /** strrstrrstrrstrrstrrstrrstrr */
    total?: number;
    success?: boolean;
  };

  type NoticeIconItemType = 'notification' | 'message' | 'event';

  type NoticeIconItem = {
    id?: string;
    extra?: string;
    key?: string;
    read?: boolean;
    avatar?: string;
    title?: string;
    status?: string;
    datetime?: string;
    description?: string;
    type?: NoticeIconItemType;
  };
}
