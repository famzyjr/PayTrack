
import {
  ArrowDownToLine,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  ShieldAlert,
} from "lucide-react";

import StatCard from "../components/StatCard";
import TransactionsTable from "../components/TransactionsTable";

import type { Transaction } from "../types/PayTrackTransactions";
import type { NewTransactionFormValues } from "../components/AddTransactionModal";

interface DashboardProps {
  transactions: Transaction[];
  onAddTransaction: (values: NewTransactionFormValues) => void;
  isAddModalOpen: boolean;
  onCloseAddModal: () => void;
  onOpenAddModal: () => void;
}

function Dashboard({
  transactions,
  onAddTransaction,
  isAddModalOpen,
  onCloseAddModal,
}: DashboardProps) {
  const dateStr = new Date().toDateString();

  // Calculate total received from confirmed transactions.
  const totalReceived = transactions
    .filter((transaction) => transaction.status === "Confirmed")
    .reduce((total, transaction) => total + transaction.amount, 0);

  // Calculate transaction counts.
  const confirmedCount = transactions.filter(
    (transaction) => transaction.status === "Confirmed"
  ).length;

  const pendingCount = transactions.filter(
    (transaction) => transaction.status === "Pending"
  ).length;

  const reviewCount = transactions.filter(
    (transaction) => transaction.status === "Needs review"
  ).length;

  // Format amounts in Nigerian Naira.
  const formatCurrency = (amount: number) =>
    amount.toLocaleString("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    });

  return (
    <div className="mx-auto max-w-[1500px] space-y-8 p-4 sm:p-6 lg:p-10">
      {/* Dashboard heading */}
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium text-emerald-700">
            {dateStr}
          </p>

          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            Overview
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Track, verify, and reconcile your incoming payments.
          </p>
        </div>

        <button
          type="button"
          onClick={() => alert("PDF reports will be added later.")}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          <ArrowDownToLine size={17} />
          Export report
        </button>
      </section>

      {/* Transaction statistics */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total received"
          value={formatCurrency(totalReceived)}
          description="From confirmed transactions"
          icon={ArrowUpRight}
          iconColor="text-emerald-700"
          iconBackground="bg-emerald-50"
        />

        <StatCard
          title="Confirmed"
          value={String(confirmedCount)}
          description="Confirmed transactions"
          icon={CheckCircle2}
          iconColor="text-emerald-700"
          iconBackground="bg-emerald-50"
        />

        <StatCard
          title="Pending"
          value={String(pendingCount)}
          description="Payments awaiting verification"
          icon={Clock3}
          iconColor="text-amber-700"
          iconBackground="bg-amber-50"
        />

        <StatCard
          title="Needs review"
          value={String(reviewCount)}
          description="Records requiring attention"
          icon={ShieldAlert}
          iconColor="text-rose-700"
          iconBackground="bg-rose-50"
        />
      </section>

      {/* Recent transactions */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Recent transactions
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            A quick look at your latest payment records.
          </p>
        </div>

        <TransactionsTable
          transactions={transactions}
          onAddTransaction={onAddTransaction}
          isAddModalOpen={isAddModalOpen}
          onCloseAddModal={onCloseAddModal}
        />
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-5 text-center text-xs text-slate-400">
        PayTrack · Secure payment reconciliation
      </footer>
    </div>
  );
}

export default Dashboard;
