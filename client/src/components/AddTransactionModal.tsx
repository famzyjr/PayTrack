
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";

const transactionSchema = z.object({
  sender: z
    .string()
    .trim()
    .min(2, "Sender name must be at least 2 characters"),

  reference: z
    .string()
    .trim()
    .min(3, "Enter a valid transaction reference"),

  amount: z
    .string()
    .trim()
    .min(1, "Amount is required")
    .refine(
      (value) =>
        /^\d+(\.\d{1,2})?$/.test(value) && Number(value) > 0,
      "Enter a valid amount greater than zero",
    ),

  date: z.string().min(1, "Transaction date is required"),

  status: z.enum(["Confirmed", "Pending", "Needs review"]),

  remarks: z
    .string()
    .trim()
    .max(500, "Remarks cannot exceed 500 characters"),
});

export type NewTransactionFormValues = z.infer<
  typeof transactionSchema
>;

interface AddTransactionModalProps {
  onClose: () => void;
  onAddTransaction: (transaction: NewTransactionFormValues) => void;
}

function AddTransactionModal({
  onClose,
  onAddTransaction,
}: AddTransactionModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<NewTransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    mode: "onTouched",
    defaultValues: {
      sender: "",
      reference: "",
      amount: "",
      date: new Date().toISOString().slice(0, 10),
      status: "Pending",
      remarks: "",
    },
  });

  const onSubmit = (values: NewTransactionFormValues) => {
    onAddTransaction(values);
    onClose();
  };

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10";

  const labelClass =
    "mb-1.5 block text-sm font-medium text-slate-700";

  const errorClass = "mt-1 text-xs text-rose-600";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-transaction-title"
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-slate-100 p-5">
          <div>
            <h2
              id="add-transaction-title"
              className="text-lg font-semibold text-slate-900"
            >
              Add transaction
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Enter the transaction details below.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4 p-5"
          noValidate
        >
          <div>
            <label htmlFor="sender" className={labelClass}>
              Sender name
            </label>
            <input
              id="sender"
              {...register("sender")}
              placeholder="e.g. Ada Okafor"
              className={inputClass}
              aria-invalid={Boolean(errors.sender)}
            />
            {errors.sender && (
              <p className={errorClass}>{errors.sender.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="reference" className={labelClass}>
              Transaction reference
            </label>
            <input
              id="reference"
              {...register("reference")}
              placeholder="e.g. PAY-484200"
              className={inputClass}
              aria-invalid={Boolean(errors.reference)}
            />
            {errors.reference && (
              <p className={errorClass}>{errors.reference.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="amount" className={labelClass}>
                Amount (₦)
              </label>
              <input
                id="amount"
                type="text"
                inputMode="decimal"
                {...register("amount")}
                placeholder="e.g. 50000"
                className={inputClass}
                aria-invalid={Boolean(errors.amount)}
              />
              {errors.amount && (
                <p className={errorClass}>{errors.amount.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="date" className={labelClass}>
                Transaction date
              </label>
              <input
                id="date"
                type="date"
                {...register("date")}
                className={inputClass}
                aria-invalid={Boolean(errors.date)}
              />
              {errors.date && (
                <p className={errorClass}>{errors.date.message}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="status" className={labelClass}>
              Status
            </label>
            <select
              id="status"
              {...register("status")}
              className={inputClass}
            >
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Needs review">Needs review</option>
            </select>
          </div>

          <div>
            <label htmlFor="remarks" className={labelClass}>
              Remarks / Payment description
              <span className="ml-1 font-normal text-slate-400">
                (optional)
              </span>
            </label>
            <textarea
              id="remarks"
              {...register("remarks")}
              rows={3}
              maxLength={500}
              placeholder="e.g. October textbook payment"
              className={`${inputClass} resize-y`}
              aria-invalid={Boolean(errors.remarks)}
            />
            {errors.remarks && (
              <p className={errorClass}>{errors.remarks.message}</p>
            )}
            <p className="mt-1 text-xs text-slate-400">
              Add a note to help identify what the payment is for.
            </p>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Add transaction
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default AddTransactionModal;
