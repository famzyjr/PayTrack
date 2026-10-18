
import { apiRequest } from "./api";

import type {
  Transaction,
  TransactionStatus,
} from "../types/PayTrackTransactions";

interface ApiTransaction {
  _id: string;
  sender: string;
  reference: string;
  amount: number;
  date: string;
  status: TransactionStatus;
  remarks?: string;
}

interface TransactionsResponse {
  success: boolean;
  transactions: ApiTransaction[];
}

function getInitials(sender: string): string {
  return sender
    .trim()
    .split(/\s+/)
    .map((name) => name[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatTransactionDate(date: string): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

function mapApiTransaction(
  transaction: ApiTransaction,
): Transaction {
  return {
    id: transaction._id,
    sender: transaction.sender,
    initials: getInitials(transaction.sender),
    reference: transaction.reference,
    date: formatTransactionDate(transaction.date),
    amount: Number(transaction.amount),
    status: transaction.status,
    remarks: transaction.remarks ?? "",
  };
}

export async function getTransactions(
  token: string,
): Promise<Transaction[]> {
  const response = await apiRequest<TransactionsResponse>(
    "/transactions",
    {
      method: "GET",
      token,
    },
  );

  return response.transactions.map(mapApiTransaction);
}
