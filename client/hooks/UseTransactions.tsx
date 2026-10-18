
import { useState } from "react";

import { initialTransactions } from "../src/data/PayTrackTransactions";

import type {
  Transaction,
  TransactionStatus,
} from "../src/types/PayTrackTransactions";

import type { NewTransactionFormValues } from "../src/components/AddTransactionModal";

export function useTransactions() {
  const [transactions, setTransactions] =
    useState<Transaction[]>(initialTransactions);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleAddTransaction = (
    values: NewTransactionFormValues,
  ) => {
    const sender = values.sender.trim();

    const newTransaction: Transaction = {
      id: crypto.randomUUID(),
      sender,
      initials: sender
        .split(/\s+/)
        .map((name) => name[0])
        .join("")
        .slice(0, 2)
        .toUpperCase(),
      reference: values.reference.trim(),
      date: new Date(`${values.date}T12:00:00`).toLocaleDateString(
        "en-US",
        {
          month: "short",
          day: "2-digit",
          year: "numeric",
        },
      ),
      amount: Number(values.amount),
      status: values.status,
      remarks: values.remarks.trim(),
    };

    setTransactions((previous) => [
      newTransaction,
      ...previous,
    ]);

    setIsAddModalOpen(false);
  };

  const handleSaveRemarks = (
    id: string,
    remarks: string,
  ) => {
    setTransactions((previous) =>
      previous.map((transaction) =>
        transaction.id === id
          ? { ...transaction, remarks }
          : transaction,
      ),
    );
  };

  const handleUpdateStatus = (
    id: string,
    status: TransactionStatus,
  ) => {
    setTransactions((previous) =>
      previous.map((transaction) =>
        transaction.id === id
          ? { ...transaction, status }
          : transaction,
      ),
    );
  };

  const openAddModal = () => setIsAddModalOpen(true);
  const closeAddModal = () => setIsAddModalOpen(false);

  return {
    transactions,
    isAddModalOpen,
    handleAddTransaction,
    handleSaveRemarks,
    handleUpdateStatus,
    openAddModal,
    closeAddModal,
  };
}
