/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CompanySetting } from '../models/CompanySetting';
import type { JsonValueKind } from '../models/JsonValueKind';
import type { PaymentSetting } from '../models/PaymentSetting';
import type { SettingType } from '../models/SettingType';
import type { UserSetting } from '../models/UserSetting';

import type { BaseHttpRequest } from '../core/BaseHttpRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { ProofService } from './ProofService';

export class SettingService {
  constructor(public readonly httpRequest: BaseHttpRequest) {}

  /**
   * @returns UserSetting Success
   * @throws ApiError
   */
  public getUserSettings(): CancelablePromise<Array<UserSetting>> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/api/app/setting/users',
    });
  }

  /**
   * @param requestBody
   * @returns any Success
   * @throws ApiError
   */
  public putUserSettings(requestBody?: Array<UserSetting>): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'PUT',
      url: '/api/app/setting/users',
      body: requestBody,
      mediaType: 'application/json',
    });
  }

  /**
   * @returns PaymentSetting Success
   * @throws ApiError
   */
  public getPaymentSettings(): CancelablePromise<Array<PaymentSetting>> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/api/app/setting/payments',
    });
  }


  public getpaymentlinks(id: number): CancelablePromise<Array<PaymentSetting>> {
    return this.httpRequest.request({
      method:'GET',
      url: '/api/app/setting/getpaymemtslinks/{id}',
      path: {
        'id': id,
    },
      mediaType: 'application/json',
    })
  }

//   public postSignIn(
//     requestBody?: SignInRequest,
// ): CancelablePromise<any> {
//     return this.httpRequest.request({
//         method: 'POST',
//         url: '/api/app/signin',
//         body: requestBody,
//         mediaType: 'application/json',
//     });
// }
    /**
   * @param requestBody
   * @returns any Success
   * @throws ApiError
   */
    public updateLimit(link?: string, amount?:string): CancelablePromise<any> {
      return this.httpRequest.request({
        method: 'POST',
        url: '/api/app/setting/updatePaymentlinksRemainingLimit?{link}&{amount}',
        path: {
          'link': link,
          'amount':amount,
      },
        mediaType: 'application/json',
      });
    }

     
      public resetLimit(): CancelablePromise<any> {
        return this.httpRequest.request({
          method: 'POST',
          url: '/api/app/setting/updateALlPaymentLinksLimit',
          mediaType: 'application/json',
        });
      }

  /**
   * @param requestBody
   * @returns any Success
   * @throws ApiError
   */
  public putPaymentSetting(requestBody?: Array<PaymentSetting>): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'PUT',
      url: '/api/app/setting/payments',
      body: requestBody,
      mediaType: 'application/json',
    });
  }

  /**
   * @returns CompanySetting Success
   * @throws ApiError
   */
  public getCompanySettings(): CancelablePromise<Array<CompanySetting>> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/api/app/setting/company',
    });
  }

  /**
   * @param formData
   * @returns any Success
   * @throws ApiError
   */
  public putCompanySetting(formData?: {
    BlackLogoFile?: Blob;
    WhiteLogoFile?: Blob;
    CompanyName?: string;
    Email?: string;
    WhiteLogo?: string;
    WhiteLogoName?: string;
    BlackLogo?: string;
    BlackLogoName?: string;
    Id?: number;
    Name?: string;
    Type?: SettingType;
    'Json.ValueKind'?: JsonValueKind;
  }): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'PUT',
      url: '/api/app/setting/company',
      formData: formData,
      mediaType: 'multipart/form-data',
    });
  }

  /**
   * @param id
   * @returns any Success
   * @throws ApiError
   */
  public deleteSetting(id: number): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'DELETE',
      url: '/api/app/setting/{id}',
      path: {
        id: id,
      },
    });
  }
}
