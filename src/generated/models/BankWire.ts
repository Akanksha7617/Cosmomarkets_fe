export type BankWire = {
    id: number;
    accountHolder:string;
    iban: string | null;
    branch: string | null;
    accountNumber: number;
    bank :string | null;
    swifT_BIC: string | null;
    mmid:string | null;
    ifsc :string | null;
    isActive: boolean | null;
    }