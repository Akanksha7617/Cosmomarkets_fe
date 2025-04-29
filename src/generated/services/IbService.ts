/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AppUserModel } from '../models/AppUserModel';
import type { HandleRequest } from '../models/HandleRequest';
import type { IbRequestModel } from '../models/IbRequestModel';
import type { Status } from '../models/Status';

import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';

export class IbService {

    constructor(public readonly httpRequest: BaseHttpRequest) { }

    /**
     * @param status 
     * @returns IbRequestModel Success
     * @throws ApiError
     */
    public getMyRequests(
        status?: Status,
    ): CancelablePromise<Array<IbRequestModel>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/app/ib/own',
            query: {
                'status': status,
            },
        });
    }

    /**
     * @param status 
     * @returns IbRequestModel Success
     * @throws ApiError
     */
    public getRequests(
        status?: Status,
    ): CancelablePromise<Array<IbRequestModel>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/app/ib',
            query: {
                'status': status,
            },
        });
    }

    /**
     * @param requestBody 
     * @returns IbRequestModel Success
     * @throws ApiError
     */
    public postIbRequest(
        requestBody?: IbRequestModel,
    ): CancelablePromise<Array<IbRequestModel>> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/app/ib',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * @param id 
     * @param requestBody 
     * @returns any Success
     * @throws ApiError
     */
    public putIbRequestById(
        id: number,
        requestBody?: HandleRequest,
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'PUT',
            url: '/api/app/ib/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * @returns AppUserModel Success
     * @throws ApiError
     */
    public getAttractedClients(): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/app/ib/clients',
        });
    }

    public getAttractedClientsLimited(
        start:number,
        end:number,
        param:String
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'GET',
            url: `/api/app/ib/clientsNew?pageIndex=${start}&pageSize=${end}&searchParam=${param}`,
            path:{
                start:start,
                end:end,
                param:param
            }
        });
    }

    /**
     * @returns any Success
     * @throws ApiError
     */
    public exportXlsx(): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/app/ib/export/xlsx',
        });
    }

}
