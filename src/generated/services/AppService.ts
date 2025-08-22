/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { AppUserDto } from '../models/AppUserDto';
import type { AppUserModel } from '../models/AppUserModel';
import { AttchMT5 } from '../models/AttachMT5';
import { ChangePassword } from '../models/ChangePassword';
import { CreateAdmin } from '../models/CreateAdmin';
import { DeleteAdmin } from '../models/DeleteAdmin';
import type { MtUserRequest } from '../models/MtUserRequest';
import { PutResetPasswordRequest } from '../models/PutResetPasswordRequest';
import type { ResetPasswordRequest } from '../models/ResetPasswordRequest';
import { SaveMtUser } from '../models/SaveMTUser';
import type { SignInRequest } from '../models/SignInRequest';
import type { SignUpRequest } from '../models/SignUpRequest';
import { TransactionModel } from '../models/TransactionModel';
import { Encrypt } from './Encrypt';

const encryptor = new Encrypt();

export class AppService {
  constructor(public readonly httpRequest: BaseHttpRequest) {}

  /**
   * @param requestBody
   * @returns any Success
   * @throws ApiError
   */
  public postSignInOld(requestBody?: SignInRequest): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/api/app/signin',
      body: requestBody,
      mediaType: 'application/json',
    });
  }

  // public postSignIn(
  //   requestBody?: SignInRequest,
  // ): CancelablePromise<any> {

  //   const enc = encryptor.encryptData(requestBody)
  //   console.log("enc======",enc)
  //   return this.httpRequest.request({
  //     method: 'POST',
  //     url: `/api/app/signinEncrypt?base64EncryptedData=${enc}`,
  //     mediaType: 'application/json',
  //   });
  // }

  public postSignIn(requestBody?: SignInRequest): CancelablePromise<any> {
    const enc = encryptor.encryptData(requestBody);
    const signInRequestEncrypt = {
      base64EncryptedData: enc,
    };
    console.log('enc======', enc);
    return this.httpRequest.request({
      method: 'POST',
      url: '/api/app/signinEncrypt',
      mediaType: 'application/json',
      body: signInRequestEncrypt,
    });
  }
  /**
   * @param id
   * @param requestBody
   * @returns any Success
   * @throws ApiError
   */
  public putUserById(id: string, requestBody?: SignUpRequest): CancelablePromise<any> {
    const enc = encryptor.encryptData(requestBody);

    const signUpRequestEncrypt = {
      base64EncryptedData: enc,
    };
    return this.httpRequest.request({
      method: 'PUT',
      url: '/api/app/{id}',
      path: {
        id: id,
      },
      body: signUpRequestEncrypt,
      mediaType: 'application/json',
    });
  }
  public resetPassword(userId: ResetPasswordRequest): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'GET',
      url: `/api/app/ResetPassword?userId=${userId}`,

      mediaType: 'application/json',
    });
  }
  public deleteAdmin(userId: DeleteAdmin): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'PUT',
      url: `/api/app/DeletAdminAccount/${userId}`,

      mediaType: 'application/json',
    });
  }

  public forgotPassword(email: string): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'GET',
      url: `/api/app/ForgotPasswordLink?email=${email}`,

      mediaType: 'application/json',
    });
  }
  public PutResetPassword(requestBody?: PutResetPasswordRequest): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'PUT',
      url: `/api/app/PutResetPassword`,
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /*    public ResetPassword(
         userId: any,
         requestBody?: ResetPasswordRequest,
       ): CancelablePromise<any> {
         return this.httpRequest.request({
           method: 'GET',
           url: `/api/app/ResetPassword/{userId}`,
           path:{
             'userId':userId
           },
           body: requestBody,
           mediaType: 'application/json',
         });
       } */

  /**
   * @param requestBody
   * @returns any Success
   * @throws ApiError
   */
  public postSignUpOld(requestBody?: SignUpRequest): CancelablePromise<any> {
    console.log('bidy');
    console.log(requestBody);
    return this.httpRequest.request({
      method: 'POST',
      url: '/api/app/signup',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  public postSignUp(requestBody?: SignUpRequest): CancelablePromise<any> {
    console.log('Inside Signup....');
    const enc = encryptor.encryptData(requestBody);

    const signUpRequestEncrypt = {
      base64EncryptedData: enc,
    };

    return this.httpRequest.request({
      method: 'POST',
      url: '/api/app/signupEncrypt',
      mediaType: 'application/json',
      body: signUpRequestEncrypt,
    });
  }
  /**
   * @returns any Success
   * @throws ApiError
   */
  public postSignOut(): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/api/app/signout',
    });
  }

  public password(userId: string, requestBody?: ChangePassword): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'PUT',
      url: '/api/app/password/{id}',
      path: {
        userId: userId,
      },
      body: requestBody,
      mediaType: 'application/json',
    });
  }

  /**
   * @returns AppUserDto Success
   * @throws ApiError
   */
  public getUsers(): CancelablePromise<Array<AppUserDto>> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/api/app/users',
    });
  }
  public searchUser(): CancelablePromise<Array<AppUserDto>> {
    return this.httpRequest.request({
      method: 'GET',
      url: 'api/app/searchUser',
    });
  }
  public getLimitedUsers(start: number, end: number, searchParam: String): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/api/app/usersList?pageNumber={start}&pageSize={end}&searchParam={searchParam}',
      path: {
        start: start,
        end: end,
        searchParam: searchParam,
      },
      mediaType: 'application/json',
    });
  }

  public getAdmins(): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/api/app/admins',
    });
  }

  public getSearchUsers(email: String): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/api/app/searchUser?searchParam={email}',
      path: {
        email: email,
      },
      mediaType: 'application/json',
    });
  }

  /**
   * @returns AppUserModel Success
   * @throws ApiError
   */
  public getMe(): CancelablePromise<AppUserModel> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/api/app/me',
    });
  }

  public getMeEncrypt(): CancelablePromise<AppUserModel> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/api/app/GetMeEncrypt',
    });
  }

  public getUsersGraph(): CancelablePromise<AppUserModel> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/api/app/usersgraph',
    });
  }
  public getTransactionGraph(): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/api/app/transaction/getTransactioGraph',
    });
  }

  public AttachMtLogin(requestBody?: AttchMT5): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/api/app/AttachMtLogin',
      body: requestBody,
      mediaType: 'application/json',
    });
  }

  /**
   * @param requestBody
   * @returns any Success
   * @throws ApiError
   */
  public putMe(requestBody?: SignUpRequest): CancelablePromise<any> {
    //console.log("Inside Signup....")
    const enc = encryptor.encryptData(requestBody);

    const signUpRequestEncrypt = {
      base64EncryptedData: enc,
    };
    return this.httpRequest.request({
      method: 'PUT',
      url: '/api/app/me',
      body: signUpRequestEncrypt,
      mediaType: 'application/json',
    });
  }

  /**
   * @returns any Success
   * @throws ApiError
   */
  public postMyMt5Account(): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/api/app/my_mt5_account',
    });
  }

  /**
   * @param requestBody
   * @returns any Success
   * @throws ApiError
   */
  public putMyMt5Account(requestBody?: MtUserRequest): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'PUT',
      url: '/api/app/my_mt5_account',
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
      url: '/api/app/export/xlsx',
    });
  }
  public isSuperAdmin(): CancelablePromise<Array<TransactionModel>> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/api/app/isSuperAdmin',
    });
  }
  public createadmin(requestBody?: CreateAdmin): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/api/app/createadmin ',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  public SaveMtUser(requestBody?: SaveMtUser): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/api/app/SaveMT5Detils/',
      body: requestBody,
      mediaType: 'application/json',
    });
  }

  public balance(
    id: number,
    requestBody: {
      amount: number;
      comment: string;
      operationType: string;
      isDeposit: boolean;
      isCredit: boolean;
      skipMarginCheck: boolean;
    },
  ): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'POST',
      url: `/api/app/balance?login=${id}`,
      mediaType: 'application/json',
      body: requestBody,
    });
  }

  public sendCustomEmail(requestBody: {
    email: string;
    subject: string;
    message: string;
  }): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/api/app/SendCustomEmail',
      mediaType: 'application/json',
      body: requestBody,
    });
  }

  public sendMarginCallEmail(requestBody: {
    email: string;
    name: string;
    login: string;
  }): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/api/app/SendStopOutMail',
      mediaType: 'application/json',
      body: requestBody,
    });
  }

  public sendBankDetailsEmail(requestBody: {
    email: string;
    name: string;
  }): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/api/app/SendBankDetailsMail',
      mediaType: 'application/json',
      body: requestBody,
    });
  }

  public sendPortalLinkEmail(requestBody: { email: string; name: string }): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/api/app/SendPortalLinkMail',
      mediaType: 'application/json',
      body: requestBody,
    });
  }
  public getGroupById(id: String): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/api/app/get-user?login={id}',
      path: {
        id: id,
      },
      mediaType: 'application/json',
    });
  }

  public changeGroup(requestBody?: GroupChange): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'PUT',
      url: '/api/app/change-group',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  public postSendCredentialMail(requestBody: {
    name: string;
    email: string;
    login: string;
    password: string;
    investorPassword: string;
  }): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/api/app/SendCredentialMail',
      mediaType: 'application/json',
      body: requestBody,
    });
  }

  public getUserCreditGet(id: number,): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'GET',
      url: `/api/app/get-user-credit?login=${id}`,
      mediaType: 'application/json',
    });
  }

  public getGroups(): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/api/app/get-group',
      mediaType: 'application/json',
    });
  }

  // HelpDesk
  public createTicket(data: { queryType: string; message: string }): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/api/Support/create-ticket',
      mediaType: 'application/json',
      body: data,
    });
  }

//   public createTicket(data: { queryType: string; message: string }): CancelablePromise<any> {
//   const now = new Date();
//   const offset = -now.getTimezoneOffset();
//   const sign = offset >= 0 ? "+" : "-";
//   const pad = (n: number) => String(n).padStart(2, "0");
//   const hours = pad(Math.floor(Math.abs(offset) / 60));
//   const minutes = pad(Math.abs(offset) % 60);

//   const localTime = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}${sign}${hours}:${minutes}`;

//   return this.httpRequest.request({
//     method: 'POST',
//     url: '/api/Support/create-ticket',
//     mediaType: 'application/json',
//     body: {
//       ...data,
//       clientTime: localTime  // <-- now sends PC local time with offset
//     },
//   });
// }
  
 


  public getUserQueries(
    pageNumber: number,
    pageSize: number,
    searchParam: string,
    startDate?: string,
    endDate?: string,
    status?: string
  ): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'GET',
      url: `/api/Support/list`,
      query: {
        pageNumber,
        pageSize,
        searchParam,
        startDate,
        endDate,
        status
      },
      mediaType: 'application/json',
    });
  }
  

  public getMessages(
    supportId: number,
  ): CancelablePromise<{ id: number; text: string; isMine: boolean; createdAt: number }[]> {
    return this.httpRequest.request({
      method: 'GET',
      url: `/api/Support/${supportId}/messages`,
      mediaType: 'application/json',
    });
  }

  // Appservices.ts
  public postReply(
    supportId: number,
    requestBody: { message: string },
  ): CancelablePromise<any> {

    return this.httpRequest.request({
      method: 'POST',
      url: `/api/Support/${supportId}/reply`,
      body: JSON.stringify(requestBody), 
      mediaType: 'application/json',
      headers: {
        'Content-Type': 'application/json', 
      },
    });
  }
//   public postReply(
//   supportId: number,
//   requestBody: { message: string },
// ): CancelablePromise<any> {
//   const now = new Date();
//   const offset = -now.getTimezoneOffset();
//   const sign = offset >= 0 ? "+" : "-";
//   const pad = (n: number) => String(n).padStart(2, "0");
//   const hours = pad(Math.floor(Math.abs(offset) / 60));
//   const minutes = pad(Math.abs(offset) % 60);

//   const localTime = `${now.getFullYear()}-${pad(
//     now.getMonth() + 1
//   )}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(
//     now.getMinutes()
//   )}:${pad(now.getSeconds())}${sign}${hours}:${minutes}`;

//   return this.httpRequest.request({
//     method: "POST",
//     url: `/api/Support/${supportId}/reply`,
//     body: {
//       ...requestBody,
//       clientTime: localTime, // <-- send admin’s local PC time
//     },
//     mediaType: "application/json",
//     headers: {
//       "Content-Type": "application/json",
//     },
//   });
// }

  public resolveQuery(queryId: number): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'PUT',
      url: `/api/Support/${queryId}/resolve`,
      mediaType: 'application/json',
    });
  }

  public sendResetPasswordEmail(requestBody?: { email: string; login: string }): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/api/app/SendResetPasswordEmail',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  

  
  
  
}
