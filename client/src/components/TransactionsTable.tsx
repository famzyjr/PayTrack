
import { ArrowUpRight, Search } from "lucide-react";
import { useState } from "react";

type Status = "Confirmed" | "Pending" | "Needs review";

interface Transaction {
  id: string;
  sender: string;
  initials: string;
  reference: string;
  date: string;
  amount: number;
  status: Status;
}

const transactions: Transaction[] = [
  {
    id: "1",
    sender: "Ada Okafor",
    initials: "AO",
    reference: "PAY-483920",
    date: "Oct 11, 2026",
    amount: 125000,
    status: "Confirmed",
  },
  {
    id: "2",
    sender: "John Bello",
    initials: "JB",
    reference: "PAY-483944",
    date: "Oct 11, 2026",
    amount: 42000,
    status: "Pending",
  },
  {
    id: "3",
    sender: "Musa Ibrahim",
    initials: "MI",
    reference: "PAY-484011",
    date: "Oct 10, 2026",
    amount: 80000,
    status: "Confirmed",
  },
  {
    id: "4",
    sender: "Grace Eze",
    initials: "GE",
    reference: "PAY-484087",
    date: "Oct 10, 2026",
    amount: 55000,
    status: "Needs review",
  },
  {
    id: "5",
    sender: "Tunde Adebayo",
    initials: "TA",
    reference: "PAY-484120",
    date: "Oct 09, 2026",
    amount: 180000,
    status: "Confirmed",
  },
];

const statusStyles: Record<Status, string> = {
  Confirmed: "bg-emerald-50 text-emerald-700",
  Pending: "bg-amber-50 text-amber-700",
  "Needs review": "bg-rose-50 text-rose-700",
};

function TransactionsTable() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch = [
      transaction.sender,
      transaction.reference,
    ].some((value) =>
      value.toLowerCase().includes(search.toLowerCase()),
    );

    const matchesStatus =
      statusFilter === "All" || transaction.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
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
          onClick={() => alert("The full transactions page is coming next.")}
          className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-slate-700 hover:text-emerald-700"
        >
          View all <ArrowUpRight size={16} />
        </button>
      </div>

      <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row">
        <div className="relative flex-1">
          <Search
            size={17}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search sender or reference..."
            className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-emerald-600"
          aria-label="Filter transactions by status"
        >
          <option>All</option>
          <option>Confirmed</option>
          <option>Pending</option>
          <option>Needs review</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left">
          <thead>
            <tr className="bg-slate-50/70 text-xs font-medium uppercase tracking-wider text-slate-500">
              <th className="px-5 py-4">Sender</th>
              <th className="px-5 py-4">Reference</th>
              <th className="px-5 py-4">Date</th>
              <th className="px-5 py-4">Amount</th>
              <th className="px-5 py-4">Status</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {filteredTransactions.map((transaction) => (
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
                    maximumFractionDigits: 0,
                  })}
                </td>

                <td className="px-5 py-4">
                  <span
                    className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[transaction.status]}`}
                  >
                    {transaction.status}
                  </span>
                </td>
              </tr>
            ))}

            {filteredTransactions.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-5 py-12 text-center text-sm text-slate-500"
                >
                  No transactions match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="border-t border-slate-100 px-5 py-4 text-xs text-slate-500">
        Showing {filteredTransactions.length} of {transactions.length} sample transactions
      </div>
    </section>
  );
}

export default TransactionsTable;
