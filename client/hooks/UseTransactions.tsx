
import { useEffect, useState } from "react";

import { useAuth } from "../src/context/AuthContext";
import {
  createTransaction,
  deleteTransaction,
  getTransactions,
  updateTransaction,
} from "../src/services/transactions";

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
      setLoadError(null);
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

  const handleAddTransaction = async (
    values: NewTransactionFormValues,
  ): Promise<boolean> => {
    if (!token) {
      setLoadError("Your session has expired. Please log in again.");
      return false;
    }

    setLoadError(null);

    try {
      const savedTransaction = await createTransaction(token, {
        sender: values.sender.trim(),
        reference: values.reference.trim(),
        amount: Number(values.amount),
        date: values.date,
        status: values.status,
        remarks: values.remarks.trim(),
      });

      setTransactions((previous) => [
        savedTransaction,
        ...previous.filter(
          (transaction) => transaction.id !== savedTransaction.id,
        ),
      ]);

      setIsAddModalOpen(false);
      return true;
    } catch (error: unknown) {
      setLoadError(
        error instanceof Error
          ? error.message
          : "Failed to create transaction.",
      );

      return false;
    }
  };

  const handleSaveRemarks = async (
    id: string,
    remarks: string,
  ): Promise<boolean> => {
    if (!token) {
      setLoadError("Your session has expired. Please log in again.");
      return false;
    }

    setLoadError(null);

    try {
      const updatedTransaction = await updateTransaction(token, id, {
        remarks: remarks.trim(),
      });

      setTransactions((previous) =>
        previous.map((transaction) =>
          transaction.id === id ? updatedTransaction : transaction,
        ),
      );

      return true;
    } catch (error: unknown) {
      setLoadError(
        error instanceof Error
          ? error.message
          : "Failed to save remarks.",
      );

      return false;
    }
  };

  const handleUpdateStatus = async (
    id: string,
    status: TransactionStatus,
  ): Promise<boolean> => {
    if (!token) {
      setLoadError("Your session has expired. Please log in again.");
      return false;
    }

    setLoadError(null);

    try {
      const updatedTransaction = await updateTransaction(token, id, {
        status,
      });

      setTransactions((previous) =>
        previous.map((transaction) =>
          transaction.id === id ? updatedTransaction : transaction,
        ),
      );

      return true;
    } catch (error: unknown) {
      setLoadError(
        error instanceof Error
          ? error.message
          : "Failed to update transaction status.",
      );

      return false;
    }
  };

  // NEW: Save the reconciliation checkbox state to the backend.
  const onToggleReconciliation = async (
    id: string,
    isReconciled: boolean,
  ): Promise<void> => {
    if (!token) {
      throw new Error("Your session has expired. Please log in again.");
    }

    setLoadError(null);

    try {
      const updatedTransaction = await updateTransaction(token, id, {
        isReconciled,
      });

      setTransactions((previous) =>
        previous.map((transaction) =>
          transaction.id === id ? updatedTransaction : transaction,
        ),
      );
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to update reconciliation status.";

      setLoadError(message);

      // Re-throw so the checkbox component can handle the failure.
      throw new Error(message);
    }
  };

  const handleDeleteTransaction = async (
    id: string,
  ): Promise<boolean> => {
    if (!token) {
      setLoadError("Your session has expired. Please log in again.");
      return false;
    }

    setLoadError(null);

    try {
      await deleteTransaction(token, id);

      setTransactions((previous) =>
        previous.filter((transaction) => transaction.id !== id),
      );

      return true;
    } catch (error: unknown) {
      setLoadError(
        error instanceof Error
          ? error.message
          : "Failed to delete transaction.",
      );

      return false;
    }
  };

  const openAddModal = () => {
    setLoadError(null);
    setIsAddModalOpen(true);
  };

  const closeAddModal = () => setIsAddModalOpen(false);

  return {
    transactions,
    isAddModalOpen,
    isLoading,
    loadError,
    handleAddTransaction,
    handleSaveRemarks,
    handleUpdateStatus,
    onToggleReconciliation,
    handleDeleteTransaction,
    openAddModal,
    closeAddModal,
  };
}
