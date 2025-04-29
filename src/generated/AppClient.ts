/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BaseHttpRequest } from './core/BaseHttpRequest';
import type { OpenAPIConfig } from './core/OpenAPI';
import { AxiosHttpRequest } from './core/AxiosHttpRequest';

import { AppService } from './services/AppService';
import { GroupService } from './services/GroupService';
import { IbService } from './services/IbService';
import { MtUsersService } from './services/MtUsersService';
import { ProofService } from './services/ProofService';
import { SettingService } from './services/SettingService';
import { TransactionService } from './services/TransactionService';
import { UserService } from './services/UserService';

type HttpRequestConstructor = new (config: OpenAPIConfig) => BaseHttpRequest;

export class AppClient {
    [x: string]: any;

    public readonly app: AppService;
    public readonly group: GroupService;
    public readonly ib: IbService;
    public readonly mtUsers: MtUsersService;
    public readonly proof: ProofService;
    public readonly setting: SettingService;
    public readonly transaction: TransactionService;
    public readonly user: UserService;

    public readonly request: BaseHttpRequest;

    constructor(config?: Partial<OpenAPIConfig>, HttpRequest: HttpRequestConstructor = AxiosHttpRequest) {
        this.request = new HttpRequest({
            BASE: config?.BASE ?? '',
            VERSION: config?.VERSION ?? '1',
            WITH_CREDENTIALS: config?.WITH_CREDENTIALS ?? false,
            CREDENTIALS: config?.CREDENTIALS ?? 'include',
            TOKEN: config?.TOKEN,
            USERNAME: config?.USERNAME,
            PASSWORD: config?.PASSWORD,
            HEADERS: config?.HEADERS,
            ENCODE_PATH: config?.ENCODE_PATH,
        });

        this.app = new AppService(this.request);
        this.group = new GroupService(this.request);
        this.ib = new IbService(this.request);
        this.mtUsers = new MtUsersService(this.request);
        this.proof = new ProofService(this.request);
        this.setting = new SettingService(this.request);
        this.transaction = new TransactionService(this.request);
        this.user = new UserService(this.request);
    }
}
