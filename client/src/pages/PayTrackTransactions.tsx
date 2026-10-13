
import { ArrowDownToLine, Plus } from "lucide-react";

import TransactionsTable from "../components/TransactionsTable";

import type { Transaction } from "../types/PayTrackTransactions";
import type { NewTransactionFormValues } from "../components/AddTransactionModal";

interface PayTrackTransactionsProps {
  transactions: Transaction[];
  onAddTransaction: (values: NewTransactionFormValues) => void;
  isAddModalOpen: boolean;
  onOpenAddModal: () => void;
  onCloseAddModal: () => void;
}

function PayTrackTransactions({
  transactions,
  onAddTransaction,
  isAddModalOpen,
  onOpenAddModal,
  onCloseAddModal,
}: PayTrackTransactionsProps) {
  return (
    <div className="space-y-8">
      {/* Page heading */}
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium text-emerald-700">
            Payment management
          </p>

          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            Transactions
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Review and reconcile your incoming payments.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            <ArrowDownToLine size={17} />
            Print page
          </button>

          <button
            type="button"
            onClick={onOpenAddModal}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            <Plus size={17} />
            Add transaction
          </button>
        </div>
      </section>

      {/* Transactions table */}
      <TransactionsTable
        transactions={transactions}
        onAddTransaction={onAddTransaction}
        isAddModalOpen={isAddModalOpen}
        onCloseAddModal={onCloseAddModal}
      />
    </div>
  );
}

export default PayTrackTransactions;
