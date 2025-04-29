export type PutResetPasswordRequest = {
    newPassword:string | null
    passCode?:string | null
    userID?:string | null
   
};
