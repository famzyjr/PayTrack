
import { useEffect, useState } from "react";

import { useAuth } from "../src/context/AuthContext";
import { getTransactions } from "../src/services/transactions";

import type {
  Transaction,
  TransactionStatus,
} from "../src/types/PayTrackTransactions";

import type { NewTransactionFormValues } from "../src/components/AddTransactionModal";

export function useTransactions() {
  const { token } = useAuth();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    if (!token) {
      setTransactions([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setLoadError(null);

    getTransactions(token)
      .then((data) => {
        if (!cancelled) {
          setTransactions(data);
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setLoadError(
            error instanceof Error
              ? error.message
              : "Failed to load transactions.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

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
    isLoading,
    loadError,
    handleAddTransaction,
    handleSaveRemarks,
    handleUpdateStatus,
    openAddModal,
    closeAddModal,
  };
}
