/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { HandleRequest } from '../models/HandleRequest';
import type { ProofRequestModel } from '../models/ProofRequestModel';
import type { Status } from '../models/Status';

import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';

export class ProofService {

    constructor(public readonly httpRequest: BaseHttpRequest) { }

    /**
     * @returns ProofRequestModel Success
     * @throws ApiError
     */
    public getMyRequest(): CancelablePromise<Array<ProofRequestModel>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/app/proof/own',
        });
    }

    /**
     * @param status 
     * @returns ProofRequestModel Success
     * @throws ApiError
     */
    public getRequests(
        status?: Status,
    ): CancelablePromise<Array<ProofRequestModel>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/app/proof',
            query: {
                'status': status,
            },
        });
    }

    public getProofRequestsAdmin(
        start: number,
        end: number,
        param:String
      ): CancelablePromise<any> {
        return this.httpRequest.request({
          method: 'GET',
          url: '/api/app/proof/Admin?pageIndex={start}&pageSize={end}&searchParam={param}',
          path: {
            start: start,
            end: end,
            param:param
          },
          mediaType: 'application/json',
        });
      }

    

      public getProofSettingEdit(id:any): CancelablePromise<ProofRequestModel> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/app/proof/requestById?id={id}',
            path:{
                id:id
            },
            mediaType: 'application/json',
        });
    }
  

    public getProofSetting(): CancelablePromise<Array<ProofRequestModel>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/app/proof/status',
        });
    }
 
    /**
     * @param formData 
     * @returns ProofRequestModel Success
     * @throws ApiError
     */
    public postProofRequest(
        formData?: {
            UserName?: string;
            ManagerName?: string;
            IdProofFile?: Blob;
            AddressProofFile?: Blob;
            Id?: number;
            UserId?: string;
            ManagerId?: string;
            Status?: Status;
            RequestedAt?: string;
            CompletedAt?: string;
            UserComment?: string;
            ManagerComment?: string;
            IdProof?: string;
            AddressProof?: string;
            IdProofName?: string;
            AddressProofName?: string;
        },
    ): CancelablePromise<Array<ProofRequestModel>> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/app/proof',
            formData: formData,
            mediaType: 'multipart/form-data',
        });
    }

    /**
     * @param id 
     * @param requestBody 
     * @returns any Success
     * @throws ApiError
     */
    public putProofRequestById(
        id: number,
        requestBody?: HandleRequest,
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'PUT',
            url: '/api/app/proof/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    public cancelRequest():CancelablePromise<any>{
        return this.httpRequest.request({
            method:'DELETE',
            url:'/api/app/proof/cancelRequest',
            mediaType: 'application/json',
        })
    }

}
