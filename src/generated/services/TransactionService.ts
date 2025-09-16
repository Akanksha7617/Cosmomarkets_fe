/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { HandleTransferRequest } from '../models/HandleTransferRequest';
import type { Status } from '../models/Status';
import type { TransactionModel } from '../models/TransactionModel';
import type { Transfer } from '../models/Transfer';
import type { Type } from '../models/Type';
import type { WithdrawTransfer } from '../models/WithdrawTransfer';
import { BankWire } from '../models/BankWire';

import type { BaseHttpRequest } from '../core/BaseHttpRequest';
import type { CancelablePromise } from '../core/CancelablePromise';

export class TransactionService {
  constructor(public readonly httpRequest: BaseHttpRequest) {}

  /**
   * @returns TransactionModel Success
   * @throws ApiError
   */
  public getMyTransaction(): CancelablePromise<Array<TransactionModel>> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/api/app/transaction/own',
    });
  }

  public getLimitedOwnTransaction(
    start: number,
    end: number,
    searchParam: String,
    Type: any,
    startDate: any,
    endDate: any,
    status: any = '',
  ): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/api/app/transaction/ownSearch?pageIndex={start}&pageSize={end}&searchParam={searchParam}&Type={Type}&startDate={startDate}&endDate={endDate}&status={status}',
      path: {
        start: start,
        end: end,
        searchParam: searchParam,
        status: status,
        Type: Type,
        startDate: startDate,
        endDate: endDate,
      },
      mediaType: 'application/json',
    });
  }

  /**
   * @param status
   * @param type
   * @returns TransactionModel Success
   * @throws ApiError
   */
  public getTransaction(status?: Status, type?: Type): CancelablePromise<Array<TransactionModel>> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/api/app/transaction',
      query: {
        status: status,
        type: type,
      },
    });
  }
  public AdminAccountDetails(
    status?: Status,
    type?: Type,
  ): CancelablePromise<Array<TransactionModel>> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/api/app/accountdetails/AdminAccountDetails',
      query: {
        status: status,
        type: type,
      },
    });
  }
  public getTransactionDetails(status?: Status, type?: Type): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/api/app/accountdetails',
      query: {
        status: status,
        type: type,
      },
    });
  }

  public getBankWire(): CancelablePromise<Array<BankWire>> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/api/bankwire',
    });
  }
  public getLatestExtToWallet(email: string): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'GET',
      url: `/api/app/transaction/latest-exttowallet?email=${email}`,
      mediaType: 'application/json',
    });
  }

  public approveAutoTransfer(requestBody?: {
    transactionNumber: number;
    login: string;
    amount: number;
  }): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/api/app/transaction/approve-auto-transfer',
      body: requestBody,
      mediaType: 'application/json',
    });
  }

  
  // /api/app/transaction/getTransactionNew?pageIndex=1&pageSize=2
  public getLimitedTransaction(start: number, end: number): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/api/app/transaction/getTransactionNew?pageIndex={start}&pageSize={end}',
      path: {
        start: start,
        end: end,
      },
      mediaType: 'application/json',
    });
  }

  public getLimitedTransactionAdminEncrypt(
    start: number,
    end: number,
    param: String,
    Type: any,
    startDate: any,
    endDate: any,
    status: any = '',
  ): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/api/app/transaction/adminSearchEncrypt?pageIndex={start}&pageSize={end}&searchParam={param}&Type={Type}&startDate={startDate}&endDate={endDate}&status={status}',
      path: {
        start: start,
        end: end,
        param: param,
        status: status,
        Type: Type,
        startDate: startDate,
        endDate: endDate,
      },
      mediaType: 'application/json',
    });
  }

  public getLimitedTransactionAdmin(
    start: number,
    end: number,
    param: String,
    Type: any,
    startDate: any,
    endDate: any,
    status: any = '',
  ): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/api/app/transaction/adminSearch?pageIndex={start}&pageSize={end}&searchParam={param}&Type={Type}&startDate={startDate}&endDate={endDate}&status={status}',
      path: {
        start: start,
        end: end,
        param: param,
        status: status,
        Type: Type,
        startDate: startDate,
        endDate: endDate,
      },
      mediaType: 'application/json',
    });
  }
  public getBankAccount(): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/api/app/transaction/getBankDetails',
      mediaType: 'application/json',
    });
  }
  /**
   * @param requestBody
   * @returns any Success
   * @throws ApiError
   */
  public putTransaction(requestBody?: Transfer): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'PUT',
      url: '/api/app/transaction',
      body: requestBody,
      mediaType: 'application/json',
    });
  }

  /**
   * @param formData
   * @returns any Success
   * @throws ApiError
   */
  public deposit(formData?: {
    FormFile?: Blob;
    Type?: Type;
    Amount?: number;
    Currency?: string;
    Comment?: string;
    PaymentMethod?: string;
  }): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'PUT',
      url: '/api/app/transaction/deposit',
      formData: formData,
      mediaType: 'multipart/form-data',
    });
  }
  public depositCard(formData?: {
    Type?: Type;
    Amount?: number;
    Currency?: string;
    Comment?: string;
    paymentMethod?: string;
  }): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'PUT',
      url: '/api/app/transaction/CardDeposit',
      formData: formData,
      mediaType: 'multipart/form-data',
    });
  }

  /**
   * @param requestBody
   * @returns any Success
   * @throws ApiError
   */
  public withdraw(requestBody?: WithdrawTransfer): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'PUT',
      url: '/api/app/transaction/withdraw',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  public Cryptowithdraw(requestBody?: WithdrawTransfer): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'PUT',
      url: '/api/app/transaction/Cryprowithdraw',
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
  public putTransactionById(
    id: number,
    requestBody?: HandleTransferRequest,
  ): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'PUT',
      url: '/api/app/transaction/{id}',
      path: {
        id: id,
      },
      body: requestBody,
      mediaType: 'application/json',
    });
  }

  /**
   * @returns any Success
   * @throws ApiError
   */
  public exportXlsx(): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/api/app/transaction/export/xlsx',
    });
  }
}
