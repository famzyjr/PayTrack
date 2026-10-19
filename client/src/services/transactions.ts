
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
  count: number;
  transactions: ApiTransaction[];
}

interface TransactionResponse {
  success: boolean;
  message: string;
  transaction: ApiTransaction;
}

interface DeleteTransactionResponse {
  success: boolean;
  message: string;
}

export interface CreateTransactionData {
  sender: string;
  reference: string;
  amount: number;
  date: string;
  status: TransactionStatus;
  remarks: string;
}

export type UpdateTransactionData = Partial<
  Pick<
    Transaction,
    "sender" | "reference" | "amount" | "status" | "remarks"
  >
>;

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
    isReconciled: transaction.isReconciled
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

export async function createTransaction(
  token: string,
  data: CreateTransactionData,
): Promise<Transaction> {
  const response = await apiRequest<TransactionResponse>(
    "/transactions",
    {
      method: "POST",
      token,
      body: JSON.stringify(data),
    },
  );

  return mapApiTransaction(response.transaction);
}

export async function updateTransaction(
  token: string,
  id: string,
  data: UpdateTransactionData,
): Promise<Transaction> {
  const response = await apiRequest<TransactionResponse>(
    `/transactions/${id}`,
    {
      method: "PATCH",
      token,
      body: JSON.stringify(data),
    },
  );

  return mapApiTransaction(response.transaction);
}

export async function deleteTransaction(
  token: string,
  id: string,
): Promise<void> {
  await apiRequest<DeleteTransactionResponse>(
    `/transactions/${id}`,
    {
      method: "DELETE",
      token,
    },
  );
}
