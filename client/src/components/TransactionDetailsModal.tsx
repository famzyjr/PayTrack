
import { useEffect, useState } from "react";
import { FileText, X, CheckCircle2 } from "lucide-react";
import { z } from "zod";

import type {
  Transaction,
  TransactionStatus,
} from "../types/PayTrackTransactions";

interface TransactionDetailsModalProps {
  transaction: Transaction;
  onClose: () => void;
  onSaveRemarks: (id: string, remarks: string) => void;
  onUpdateStatus: (id: string, status: TransactionStatus) => void;
}

const remarksSchema = z
  .string()
  .max(1000, "Remarks cannot exceed 1000 characters");

const statusSchema = z.enum([
  "Confirmed",
  "Pending",
  "Needs review",
]);

const statusStyles: Record<TransactionStatus, string> = {
  Confirmed: "bg-emerald-50 text-emerald-700",
  Pending: "bg-amber-50 text-amber-700",
  "Needs review": "bg-rose-50 text-rose-700",
};

function TransactionDetailsModal({
  transaction,
  onClose,
  onSaveRemarks,
  onUpdateStatus,
}: TransactionDetailsModalProps) {
  const [remarks, setRemarks] = useState(
    transaction.remarks ?? "",
  );

  const [status, setStatus] = useState<TransactionStatus>(
    transaction.status,
  );

  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setRemarks(transaction.remarks ?? "");
    setStatus(transaction.status);
    setError("");
    setSaved(false);
  }, [transaction.id, transaction.remarks, transaction.status]);

  const formattedAmount = transaction.amount.toLocaleString(
    "en-NG",
    {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 2,
    },
  );

  const fieldClass = "break-words text-sm text-slate-800";

  const labelClass =
    "mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500";

  const handleSave = () => {
    const remarksResult = remarksSchema.safeParse(remarks);
    const statusResult = statusSchema.safeParse(status);

    if (!remarksResult.success) {
      setError(
        remarksResult.error.issues[0]?.message ??
          "Invalid remarks",
      );
      setSaved(false);
      return;
    }

    if (!statusResult.success) {
      setError("Please select a valid transaction status.");
      setSaved(false);
      return;
    }

    // Save both changes to the shared transaction state.
    onSaveRemarks(transaction.id, remarksResult.data.trim());
    onUpdateStatus(transaction.id, statusResult.data);

    setError("");
    setSaved(true);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/40 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="transaction-details-title"
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-xl"
      >
        {/* Modal header */}
        <div className="flex items-center justify-between border-b border-slate-100 p-5">
          <div>
            <h2
              id="transaction-details-title"
              className="text-lg font-semibold text-slate-900"
            >
              Transaction details
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Review payment details, update status, and add remarks.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close transaction details"
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-5 p-5">
          {/* Transaction amount and current status */}
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
            <p className={labelClass}>Transaction amount</p>

            <p className="text-2xl font-bold text-slate-900">
              {formattedAmount}
            </p>

            <span
              className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-medium ${statusStyles[transaction.status]}`}
            >
              Current status: {transaction.status}
            </span>
          </div>

          {/* Transaction information */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <p className={labelClass}>Sender</p>
              <p className={fieldClass}>{transaction.sender}</p>
            </div>

            <div>
              <p className={labelClass}>Reference</p>
              <p className={fieldClass}>{transaction.reference}</p>
            </div>

            <div>
              <p className={labelClass}>Transaction date</p>
              <p className={fieldClass}>{transaction.date}</p>
            </div>

            <div>
              <p className={labelClass}>Record ID</p>
              <p className={fieldClass}>{transaction.id}</p>
            </div>
          </div>

          {/* Update transaction status */}
          <div className="border-t border-slate-100 pt-4">
            <label
              htmlFor="transaction-status"
              className="mb-2 block text-sm font-semibold text-slate-800"
            >
              Transaction status
            </label>

            <select
              id="transaction-status"
              value={status}
              onChange={(event) => {
                setStatus(event.target.value as TransactionStatus);
                setError("");
                setSaved(false);
              }}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-800 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10"
            >
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Needs review">Needs review</option>
            </select>

            <p className="mt-2 text-xs text-slate-500">
              Update this status based on your reconciliation review.
              Selecting Confirmed does not independently verify an
              OPay transaction.
            </p>
          </div>

          {/* Remarks */}
          <div className="border-t border-slate-100 pt-4">
            <label
              htmlFor="transaction-remarks"
              className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-800"
            >
              <FileText size={16} />
              Transaction remarks
              <span className="font-normal text-slate-400">
                (optional)
              </span>
            </label>

            <textarea
              id="transaction-remarks"
              value={remarks}
              onChange={(event) => {
                setRemarks(event.target.value);
                setError("");
                setSaved(false);
              }}
              rows={4}
              maxLength={1000}
              aria-invalid={Boolean(error)}
              aria-describedby={
                error ? "remarks-error" : "remarks-help"
              }
              placeholder="Add a note about this payment or any discrepancy..."
              className={`w-full resize-y rounded-xl border px-3 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-600/10 ${
                error
                  ? "border-rose-500 focus:border-rose-500"
                  : "border-slate-200 focus:border-emerald-600"
              }`}
            />

            <div className="mt-1 flex items-start justify-between gap-3">
              <div>
                {error ? (
                  <p
                    id="remarks-error"
                    role="alert"
                    className="text-xs text-rose-600"
                  >
                    {error}
                  </p>
                ) : (
                  <p
                    id="remarks-help"
                    className="text-xs text-slate-500"
                  >
                    Optional. You can leave this field empty.
                  </p>
                )}
              </div>

              <p className="shrink-0 text-xs text-slate-400">
                {remarks.length}/1000
              </p>
            </div>

            <p className="mt-2 text-xs text-slate-500">
              Remarks are internal notes and do not independently
              verify an OPay payment.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              <CheckCircle2 size={17} />
              Save changes
            </button>
          </div>

          {saved && (
            <p role="status" className="text-sm text-emerald-700">
              Changes saved successfully.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

export default TransactionDetailsModal;
