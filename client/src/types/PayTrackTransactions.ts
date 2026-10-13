
export type TransactionStatus =
  | "Confirmed"
  | "Pending"
  | "Needs review";

export interface Transaction {
  id: string;
  sender: string;
  initials: string;
  reference: string;
  date: string;
  amount: number;
  status: TransactionStatus;
}
