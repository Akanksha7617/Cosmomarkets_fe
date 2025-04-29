/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { MtUser } from '../models/MtUser';

import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';

export class MtUsersService {

    constructor(public readonly httpRequest: BaseHttpRequest) {}

    /**
     * @returns MtUser Success
     * @throws ApiError
     */
    public getMtUser(): CancelablePromise<Array<MtUser>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/app/mt/user',
        });
    }

    /**
     * @param requestBody 
     * @returns MtUser Success
     * @throws ApiError
     */
    public postMtUser(
requestBody?: MtUser,
): CancelablePromise<MtUser> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/app/mt/user',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * @param id 
     * @returns MtUser Success
     * @throws ApiError
     */
    public getMtUser1(
id: number,
): CancelablePromise<MtUser> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/app/mt/user/{id}',
            path: {
                'id': id,
            },
        });
    }

    /**
     * @param id 
     * @param requestBody 
     * @returns any Success
     * @throws ApiError
     */
    public putMtUser(
id: number,
requestBody?: MtUser,
): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'PUT',
            url: '/api/app/mt/user/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * @param id 
     * @returns any Success
     * @throws ApiError
     */
    public deleteMtUser(
id: number,
): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'DELETE',
            url: '/api/app/mt/user/{id}',
            path: {
                'id': id,
            },
        });
    }

    /**
     * @returns any Success
     * @throws ApiError
     */
    public exportXlsx(): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/app/mt/user/export/xlsx',
        });
    }

}
