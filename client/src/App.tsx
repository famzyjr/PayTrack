
import { useState } from "react";
import {
  ArrowDownToLine,
  ArrowUpRight,
  Bell,
  CheckCircle2,
  Clock3,
  Menu,
  Plus,
  ShieldAlert,
} from "lucide-react";

import Sidebar from "./components/Siderbar";
import StatCard from "./components/StatCard";
import TransactionsTable from "./components/TransactionsTable";

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8F9FB] text-slate-900">
      <div className="flex min-h-screen">
        <Sidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <main className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-10">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                aria-label="Open navigation"
                className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
              >
                <Menu size={21} />
              </button>

              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Dashboard
                </p>
                <p className="hidden text-xs text-slate-500 sm:block">
                  Welcome back! Here's your payment overview.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <button
                aria-label="Notifications"
                onClick={() => alert("Notifications will be added later.")}
                className="relative rounded-xl border border-slate-200 p-2.5 text-slate-600 hover:bg-slate-50"
              >
                <Bell size={18} />
                <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-emerald-600" />
              </button>

              <button
                onClick={() => alert("Transaction creation will be added later.")}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 sm:px-4"
              >
                <Plus size={17} />
                <span className="hidden sm:inline">Add transaction</span>
                <span className="sm:hidden">Add</span>
              </button>
            </div>
          </header>

          <div className="mx-auto max-w-[1500px] space-y-8 p-4 sm:p-6 lg:p-10">
            <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="text-sm font-medium text-emerald-700">
                  Sunday, October 11, 2026
                </p>

                <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                  Overview
                </h1>

                <p className="mt-2 text-sm text-slate-500">
                  Track, verify, and reconcile your incoming payments.
                </p>
              </div>

              <button
                onClick={() => alert("PDF reports will be added in a later step.")}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                <ArrowDownToLine size={17} />
                Export report
              </button>
            </section>

            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                title="Total received"
                value="₦845,000"
                description="Across the sample transactions"
                icon={ArrowUpRight}
                iconColor="text-emerald-700"
                iconBackground="bg-emerald-50"
              />

              <StatCard
                title="Confirmed"
                value="24"
                description="Sample confirmed transaction count"
                icon={CheckCircle2}
                iconColor="text-emerald-700"
                iconBackground="bg-emerald-50"
              />

              <StatCard
                title="Pending"
                value="3"
                description="Sample payments awaiting verification"
                icon={Clock3}
                iconColor="text-amber-700"
                iconBackground="bg-amber-50"
              />

              <StatCard
                title="Needs review"
                value="2"
                description="Sample records requiring attention"
                icon={ShieldAlert}
                iconColor="text-rose-700"
                iconBackground="bg-rose-50"
              />
            </section>

            <TransactionsTable />

            <footer className="pb-2 text-center text-xs text-slate-400">
              PayTrack · Secure payment reconciliation
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
