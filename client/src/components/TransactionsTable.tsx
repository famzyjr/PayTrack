
import {
  ArrowUpRight,
  Search,
  RotateCcw,
  Download,
  Eye,
  Pencil,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import AddTransactionModal, {
  type NewTransactionFormValues,
} from "./AddTransactionModal";
import TransactionDetailsModal from "./TransactionDetailsModal";
import EditTransactionModal from "../components/EditTransactionModal";


import type {
  Transaction,
  TransactionStatus,
} from "../types/PayTrackTransactions";

type StatusFilter = TransactionStatus | "All";

interface TransactionsTableProps {
  transactions: Transaction[];
  onAddTransaction: (values: NewTransactionFormValues) => void;
  onSaveRemarks: (id: string, remarks: string) => void;
  onUpdateStatus: (id: string, status: TransactionStatus) => void;
  onToggleReconciliation: (
    id: string,
    isReconciled: boolean,
  ) => Promise<void>;

  onUpdateTransaction:(
    id: string,
    values: NewTransactionFormValues,
  ) => Promise<void>

  isAddModalOpen: boolean;
  onCloseAddModal: () => void;
}



const statusStyles: Record<TransactionStatus, string> = {
  Confirmed: "bg-emerald-50 text-emerald-700",
  Pending: "bg-amber-50 text-amber-700",
  "Needs review": "bg-rose-50 text-rose-700",
};

const filterSchema = z
  .object({
    startDate: z.string(),
    endDate: z.string(),
    minAmount: z.string().refine(
      (value) => value === "" || /^\d+(\.\d{1,2})?$/.test(value),
      "Enter a valid minimum amount",
    ),
    maxAmount: z.string().refine(
      (value) => value === "" || /^\d+(\.\d{1,2})?$/.test(value),
      "Enter a valid maximum amount",
    ),
  })
  .superRefine((values, ctx) => {
    if (
      values.startDate &&
      values.endDate &&
      values.startDate > values.endDate
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["endDate"],
        message: "End date must be on or after the start date",
      });
    }

    if (
      values.minAmount !== "" &&
      values.maxAmount !== "" &&
      Number(values.minAmount) > Number(values.maxAmount)
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["maxAmount"],
        message: "Maximum must be greater than or equal to minimum",
      });
    }
  });

type FilterFormValues = z.infer<typeof filterSchema>;

function TransactionsTable({
  transactions,
  onAddTransaction,
  onSaveRemarks,
  onUpdateStatus,
  isAddModalOpen,
  onCloseAddModal,
    onUpdateTransaction

}: TransactionsTableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("All");

  // Store the ID so the modal receives the latest transaction.
  const [selectedTransactionId, setSelectedTransactionId] =
    useState<string | null>(null);

  // Track which transaction is currently being updated.

  const [editingTransactionId, setEditingTransactionId] =
    useState<string | null>(null);

  const editingTransaction = transactions.find(
    (transaction) => transaction.id === editingTransactionId,
  )

  const {
    register,
    watch,
    reset,
    formState: { errors },
  } = useForm<FilterFormValues>({
    resolver: zodResolver(filterSchema),
    mode: "onChange",
    defaultValues: {
      startDate: "",
      endDate: "",
      minAmount: "",
      maxAmount: "",
    },
  });

  const startDate = watch("startDate");
  const endDate = watch("endDate");
  const minAmount = watch("minAmount");
  const maxAmount = watch("maxAmount");

  const selectedTransaction = transactions.find(
    (transaction) => transaction.id === selectedTransactionId,
  );

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("All");
    reset();
  };

  // Save reconciliation status through the parent component/API.
 
  const filteredTransactions = transactions.filter((transaction) => {
    const normalizedSearch = search.toLowerCase().trim();

    const matchesSearch = [
      transaction.sender,
      transaction.reference,
      transaction.remarks ?? "",
    ].some((value) =>
      value.toLowerCase().includes(normalizedSearch),
    );

    const matchesStatus =
      statusFilter === "All" ||
      transaction.status === statusFilter;

    const transactionDate = new Date(transaction.date);

    const matchesStartDate =
      !startDate ||
      transactionDate >= new Date(`${startDate}T00:00:00`);

    const matchesEndDate =
      !endDate ||
      transactionDate <= new Date(`${endDate}T23:59:59.999`);

    const matchesMinAmount =
      minAmount === "" ||
      transaction.amount >= Number(minAmount);

    const matchesMaxAmount =
      maxAmount === "" ||
      transaction.amount <= Number(maxAmount);


    return (
      matchesSearch &&
      matchesStatus &&
      matchesStartDate &&
      matchesEndDate &&
      matchesMinAmount &&
      matchesMaxAmount
    );
  });

  const hasInvalidRange =
    Boolean(errors.startDate) ||
    Boolean(errors.endDate) ||
    Boolean(errors.minAmount) ||
    Boolean(errors.maxAmount);

  const displayedTransactions = hasInvalidRange
    ? []
    : filteredTransactions;

  // Export currently filtered transactions to PDF.
  const handleExportPDF = () => {
    if (displayedTransactions.length === 0) return;

    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    doc.setFontSize(18);
    doc.text("PayTrack Transaction Report", 14, 18);

    doc.setFontSize(10);
    doc.text(
      `Generated: ${new Date().toLocaleDateString("en-NG")}`,
      14,
      25,
    );
    doc.text(
      `Total records: ${displayedTransactions.length}`,
      14,
      31,
    );

    autoTable(doc, {
      startY: 38,
      head: [[
        "Sender",
        "Reference",
        "Date",
        "Amount (NGN)",
        "Status",
        "Reconciled",
        "Remarks",
      ]],
      body: displayedTransactions.map((transaction) => [
        transaction.sender,
        transaction.reference,
        transaction.date,
        transaction.amount.toLocaleString("en-NG"),
        transaction.status,
        transaction.isReconciled ? "[x] Checked" : "[ ] Not checked",
        transaction.remarks?.trim() || "No remarks",
      ]),
      theme: "grid",
      styles: {
        fontSize: 8,
        cellPadding: 3,
        overflow: "linebreak",
      },
      headStyles: {
        fillColor: [5, 150, 105],
      },
      columnStyles: {
        6: { cellWidth: 55 },
      },
      margin: {
        left: 14,
        right: 14,
      },
    });

    doc.save("paytrack-transaction-report.pdf");
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      {/* Table heading */}
      <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-semibold text-slate-900">
            Recent transactions
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Review your latest incoming payments.
          </p>
        </div>

        <button
          type="button"
          onClick={() => window.location.assign("/transactions")}
          className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-slate-700 transition hover:text-emerald-700"
        >
          View all <ArrowUpRight size={16} />
        </button>
      </div>

      {/* Search and status filters */}
      <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row">
        <div className="relative flex-1">
          <Search
            size={17}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search sender, reference or remarks..."
            aria-label="Search transactions"
            className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(event.target.value as StatusFilter)
          }
          className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-emerald-600"
          aria-label="Filter transactions by status"
        >
          <option value="All">All statuses</option>
          <option value="Confirmed">Confirmed</option>
          <option value="Pending">Pending</option>
          <option value="Needs review">Needs review</option>
        </select>
      </div>

      {/* Date and amount filters */}
      <div className="space-y-4 border-b border-slate-100 bg-slate-50/50 p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div>
            <label
              htmlFor="start-date"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              From date
            </label>
            <input
              id="start-date"
              type="date"
              max={endDate || undefined}
              {...register("startDate")}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10"
            />
            {errors.startDate && (
              <p className="mt-1 text-xs text-rose-600">
                {errors.startDate.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="end-date"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              To date
            </label>
            <input
              id="end-date"
              type="date"
              min={startDate || undefined}
              {...register("endDate")}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10"
            />
            {errors.endDate && (
              <p className="mt-1 text-xs text-rose-600">
                {errors.endDate.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="min-amount"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Minimum amount (₦)
            </label>
            <input
              id="min-amount"
              type="text"
              inputMode="decimal"
              placeholder="e.g. 50000"
              {...register("minAmount")}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10"
            />
            {errors.minAmount && (
              <p className="mt-1 text-xs text-rose-600">
                {errors.minAmount.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="max-amount"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Maximum amount (₦)
            </label>
            <input
              id="max-amount"
              type="text"
              inputMode="decimal"
              placeholder="e.g. 150000"
              {...register("maxAmount")}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10"
            />
            {errors.maxAmount && (
              <p className="mt-1 text-xs text-rose-600">
                {errors.maxAmount.message}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-500">
            Combine filters to narrow down your transactions.
          </p>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
            >
              <RotateCcw size={16} />
              Reset filters
            </button>

            <button
              type="button"
              onClick={handleExportPDF}
              disabled={displayedTransactions.length === 0}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Download size={16} />
              Export PDF
            </button>
          </div>
        </div>
      </div>

      
    

      {/* Transactions table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1200px] text-left">
          <thead>
            <tr className="bg-slate-50/70 text-xs font-medium uppercase tracking-wider text-slate-500">
              <th className="px-5 py-4">Sender</th>
              <th className="px-5 py-4">Reference</th>
              <th className="px-5 py-4">Date</th>
              <th className="px-5 py-4">Amount</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4">Remarks</th>
              <th className="px-5 py-4">Reconciled</th>
              <th className="px-5 py-4">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {displayedTransactions.map((transaction) => (
              <tr
                key={transaction.id}
                className="transition hover:bg-slate-50/70"
              >
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                      {transaction.initials}
                    </div>
                    <span className="text-sm font-medium text-slate-800">
                      {transaction.sender}
                    </span>
                  </div>
                </td>

                <td className="px-5 py-4 text-sm text-slate-500">
                  {transaction.reference}
                </td>

                <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-500">
                  {transaction.date}
                </td>

                <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-slate-800">
                  {transaction.amount.toLocaleString("en-NG", {
                    style: "currency",
                    currency: "NGN",
                    maximumFractionDigits: 2,
                  })}
                </td>

                <td className="px-5 py-4">
                  <span
                    className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[transaction.status]}`}
                  >
                    {transaction.status}
                  </span>
                </td>

                <td className="max-w-[240px] px-5 py-4">
                  {transaction.remarks?.trim() ? (
                    <p
                      className="max-w-[220px] truncate text-sm text-slate-600"
                      title={transaction.remarks}
                    >
                      {transaction.remarks}
                    </p>
                  ) : (
                    <span className="text-sm text-slate-400">
                      No remarks
                    </span>
                  )}
                </td>

                <td className="px-5 py-4">
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => setEditingTransactionId(transaction.id)}
                      className="inline-flex items-center gap-1.5 whitespace-nowrap text-sm font-semibold text-slate-700 transition hover:text-emerald-700"
                      aria-label={`Edit transaction from ${transaction.sender}`}
                    >
                      <Pencil size={15} />
                      Edit
                    </button>


                  </div>
                </td>

                <td className="px-5 py-4">
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedTransactionId(transaction.id)
                    }
                    className="inline-flex items-center gap-1.5 whitespace-nowrap text-sm font-semibold text-emerald-700 transition hover:text-emerald-800"
                  >
                    <Eye size={15} />
                    View details
                  </button>
                </td>
              </tr>
            ))}

            {displayedTransactions.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="px-5 py-12 text-center text-sm text-slate-500"
                >
                  {hasInvalidRange
                    ? "Please correct the filter values to continue."
                    : "No transactions match your filters."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Table footer */}
      <div className="border-t border-slate-100 px-5 py-4 text-xs text-slate-500">
        Showing {displayedTransactions.length} of {transactions.length} transactions
      </div>

      {/* Add transaction modal */}
      {isAddModalOpen && (
        <AddTransactionModal
          onClose={onCloseAddModal}
          onAddTransaction={onAddTransaction}
        />
      )}

      {/* Transaction details, remarks, and status modal */}
      {selectedTransaction && (
        <TransactionDetailsModal
          transaction={selectedTransaction}
          onClose={() => setSelectedTransactionId(null)}
          onSaveRemarks={onSaveRemarks}
          onUpdateStatus={onUpdateStatus}
        />
      )}
       
      {editingTransaction &&(
      <EditTransactionModal
        transaction={editingTransaction}
      onClose={() => setEditingTransactionId(null)}
        onUpdateTransaction={onUpdateTransaction}
       />
      )} 
    </section>
  );
}

export default TransactionsTable;
