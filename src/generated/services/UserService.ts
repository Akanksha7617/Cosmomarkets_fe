/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BalanceRequest } from '../models/BalanceRequest';
import type { Password } from '../models/Password';
import type { UserDto } from '../models/UserDto';

import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';

export class UserService {

    constructor(public readonly httpRequest: BaseHttpRequest) {}

    /**
     * @returns UserDto Success
     * @throws ApiError
     */
    public getUser(): CancelablePromise<Array<UserDto>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/mt/user',
        });
    }

    /**
     * @param requestBody 
     * @returns any Success
     * @throws ApiError
     */
    public postUser(
requestBody?: UserDto,
): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/mt/user',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * @param login 
     * @returns UserDto Success
     * @throws ApiError
     */
    public getUserByLogin(
login: number,
): CancelablePromise<UserDto> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/mt/user/{login}',
            path: {
                'login': login,
            },
        });
    }

    /**
     * @param login 
     * @param requestBody 
     * @returns UserDto Success
     * @throws ApiError
     */
    public putUser(
login: number,
requestBody?: UserDto,
): CancelablePromise<UserDto> {
        return this.httpRequest.request({
            method: 'PUT',
            url: '/api/mt/user/{login}',
            path: {
                'login': login,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * @param login 
     * @param requestBody 
     * @returns UserDto Success
     * @throws ApiError
     */
    public putBalance(
login: number,
requestBody?: BalanceRequest,
): CancelablePromise<UserDto> {
        return this.httpRequest.request({
            method: 'PUT',
            url: '/api/mt/user/{login}/balance',
            path: {
                'login': login,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * @param login 
     * @param requestBody 
     * @returns any Success
     * @throws ApiError
     */
    public putPassword(
login: number,
requestBody?: Password,
): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'PUT',
            url: '/api/mt/user/{login}/password',
            path: {
                'login': login,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }

}
