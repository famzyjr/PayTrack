
import { useEffect, useState } from "react";
import { FileText, X } from "lucide-react";
import type { Transaction } from "../types/PayTrackTransactions";

interface TransactionDetailsModalProps {
  transaction: Transaction;
  onClose: () => void;
  onSaveRemarks: (id: string, remarks: string) => void;
}

function TransactionDetailsModal({
  transaction,
  onClose,
  onSaveRemarks,
}: TransactionDetailsModalProps) {
  const [remarks, setRemarks] = useState(transaction.remarks ?? "");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setRemarks(transaction.remarks ?? "");
    setSaved(false);
  }, [transaction.id, transaction.remarks]);

  const formattedAmount = transaction.amount.toLocaleString("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 2,
  });

  const fieldClass = "text-sm text-slate-800 break-words";

  const labelClass =
    "mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500";

  const handleSave = () => {
    onSaveRemarks(transaction.id, remarks.trim());
    setSaved(true);
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
        <div className="flex items-center justify-between border-b border-slate-100 p-5">
          <div>
            <h2
              id="transaction-details-title"
              className="text-lg font-semibold text-slate-900"
            >
              Transaction details
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Review the record and add internal remarks.
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
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
            <p className={labelClass}>Transaction amount</p>
            <p className="text-2xl font-bold text-slate-900">
              {formattedAmount}
            </p>

            <span className="mt-3 inline-flex rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200">
              {transaction.status}
            </span>
          </div>

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

          <div className="border-t border-slate-100 pt-4">
            <label
              htmlFor="transaction-remarks"
              className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-800"
            >
              <FileText size={16} />
              Transaction remarks
            </label>

            <textarea
              id="transaction-remarks"
              value={remarks}
              onChange={(event) => {
                setRemarks(event.target.value);
                setSaved(false);
              }}
              rows={4}
              maxLength={1000}
              placeholder="Add a note about this payment or any discrepancy..."
              className="w-full resize-y rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10"
            />

            <p className="mt-1 text-right text-xs text-slate-400">
              {remarks.length}/1000 characters
            </p>

            <p className="mt-2 text-xs text-slate-500">
              Remarks are internal notes and do not independently verify an
              OPay payment.
            </p>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Close
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              Save remarks
            </button>
          </div>

          {saved && (
            <p role="status" className="text-sm text-emerald-700">
              Remarks saved successfully.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

export default TransactionDetailsModal;
