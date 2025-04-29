/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { GroupDto } from '../models/GroupDto';

import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';

export class GroupService {
    getcompany() {
        throw new Error('Method not implemented.');
    }

    constructor(public readonly httpRequest: BaseHttpRequest) {}

    /**
     * @returns GroupDto Success
     * @throws ApiError
     */
    public getGroup(): CancelablePromise<Array<GroupDto>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/mt/group',
        });
    }

    /**
     * @param name 
     * @returns GroupDto Success
     * @throws ApiError
     */
    public getGroupByName(
name: string,
): CancelablePromise<GroupDto> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/mt/group/{name}',
            path: {
                'name': name,
            },
        });
    }

}
