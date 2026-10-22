
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";

import {
  transactionSchema,
  type NewTransactionFormValues,
} from "./AddTransactionModal";

import type { Transaction } from "../types/PayTrackTransactions";

interface EditTransactionModalProps {
  transaction: Transaction;
  onClose: () => void;
  onUpdateTransaction: (
    id: string,
    values: NewTransactionFormValues,
  ) => Promise<void>;
}

function formatDateForInput(dateValue: string): string {
  if (!dateValue) return "";

  // Preserve an existing YYYY-MM-DD date.
  const isoMatch = dateValue.match(/^(\d{4})-(\d{2})-(\d{2})/);

  if (isoMatch) {
    const [, year, month, day] = isoMatch;
    const date = new Date(
      Number(year),
      Number(month) - 1,
      Number(day),
    );

    if (
      date.getFullYear() === Number(year) &&
      date.getMonth() === Number(month) - 1 &&
      date.getDate() === Number(day)
    ) {
      return `${year}-${month}-${day}`;
    }
  }

  // Also support display dates such as "Oct 18, 2026".
  const parsedDate = new Date(dateValue);

  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  // Use UTC components for ISO timestamps to avoid changing
  // the calendar date because of the browser's timezone.
  if (dateValue.includes("T") || dateValue.endsWith("Z")) {
    return [
      parsedDate.getUTCFullYear(),
      String(parsedDate.getUTCMonth() + 1).padStart(2, "0"),
      String(parsedDate.getUTCDate()).padStart(2, "0"),
    ].join("-");
  }

  return [
    parsedDate.getFullYear(),
    String(parsedDate.getMonth() + 1).padStart(2, "0"),
    String(parsedDate.getDate()).padStart(2, "0"),
  ].join("-");
}

function EditTransactionModal({
  transaction,
  onClose,
  onUpdateTransaction,
}: EditTransactionModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<NewTransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      sender: transaction.sender,
      reference: transaction.reference,
      amount: String(transaction.amount),
      date: formatDateForInput(transaction.date),
      status: transaction.status,
      remarks: transaction.remarks ?? "",
    },
  });

  useEffect(() => {
    reset({
      sender: transaction.sender,
      reference: transaction.reference,
      amount: String(transaction.amount),
      date: formatDateForInput(transaction.date),
      status: transaction.status,
      remarks: transaction.remarks ?? "",
    });
  }, [transaction, reset]);

  const onSubmit = async (values: NewTransactionFormValues) => {
    try {
      if (!values.date) {
        setError("date", {
          type: "manual",
          message: "Please select a transaction date.",
        });
        return;
      }

      // HTML date inputs should provide YYYY-MM-DD.
      const dateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(values.date);

      if (!dateMatch) {
        setError("date", {
          type: "manual",
          message: "Please enter a valid transaction date.",
        });
        return;
      }

      const [, year, month, day] = dateMatch;
      const checkedDate = new Date(
        Number(year),
        Number(month) - 1,
        Number(day),
      );

      if (
        checkedDate.getFullYear() !== Number(year) ||
        checkedDate.getMonth() !== Number(month) - 1 ||
        checkedDate.getDate() !== Number(day)
      ) {
        setError("date", {
          type: "manual",
          message: "The selected transaction date is invalid.",
        });
        return;
      }

      await onUpdateTransaction(transaction.id, values);
      onClose();
    } catch (error: unknown) {
      setError("root", {
        type: "server",
        message:
          error instanceof Error
            ? error.message
            : "Unable to update this transaction.",
      });
    }
  };

  const inputClass =
    "w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10";

  const labelClass = "mb-1.5 block text-sm font-medium text-slate-700";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isSubmitting) {
          onClose();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-transaction-title"
        className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h2
              id="edit-transaction-title"
              className="text-lg font-semibold text-slate-900"
            >
              Edit transaction
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Update the transaction details below.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close edit transaction modal"
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 p-5">
          <div>
            <label htmlFor="edit-sender" className={labelClass}>
              Sender name
            </label>
            <input
              id="edit-sender"
              {...register("sender")}
              className={inputClass}
              placeholder="Enter sender's name"
            />
            {errors.sender && (
              <p className="mt-1 text-xs text-rose-600">
                {errors.sender.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="edit-reference" className={labelClass}>
              Transaction reference
            </label>
            <input
              id="edit-reference"
              {...register("reference")}
              className={inputClass}
              placeholder="Enter transaction reference"
            />
            {errors.reference && (
              <p className="mt-1 text-xs text-rose-600">
                {errors.reference.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="edit-amount" className={labelClass}>
                Amount (₦)
              </label>
              <input
                id="edit-amount"
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                {...register("amount")}
                className={inputClass}
                placeholder="e.g. 2300"
              />
              {errors.amount && (
                <p className="mt-1 text-xs text-rose-600">
                  {errors.amount.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="edit-date" className={labelClass}>
                Transaction date
              </label>
              <input
                id="edit-date"
                type="date"
                {...register("date")}
                className={inputClass}
              />
              {errors.date && (
                <p className="mt-1 text-xs text-rose-600">
                  {errors.date.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="edit-status" className={labelClass}>
              Status
            </label>
            <select
              id="edit-status"
              {...register("status")}
              className={inputClass}
            >
              <option value="Confirmed">Confirmed</option>
              <option value="Pending">Pending</option>
              <option value="Needs review">Needs review</option>
            </select>
            {errors.status && (
              <p className="mt-1 text-xs text-rose-600">
                {errors.status.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="edit-remarks" className={labelClass}>
              Remarks
            </label>
            <textarea
              id="edit-remarks"
              {...register("remarks")}
              rows={3}
              className={inputClass}
              placeholder="Add notes about this transaction..."
            />
            {errors.remarks && (
              <p className="mt-1 text-xs text-rose-600">
                {errors.remarks.message}
              </p>
            )}
          </div>

          {errors.root && (
            <p role="alert" className="text-sm text-rose-600">
              {errors.root.message}
            </p>
          )}

          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? "Saving changes..." : "Save changes"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default EditTransactionModal;
