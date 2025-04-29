export enum TransactionStatus {
    Requested = 1,
    Approved = 2,
    Rejected = 3,
    Completed = 4,
    Cancelled = 5,
    Not_Requested = 6
}

export const TransactionStatusMapping = {
    [TransactionStatus.Requested]: 'Requested',
    [TransactionStatus.Approved]: 'Approved',
    [TransactionStatus.Rejected]: 'Reject',
   
};