
import { useState } from "react";
import { Bell, Menu, Plus } from "lucide-react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Sidebar from "./components/Siderbar";
import Dashboard from "./pages/Dashboard";
import PayTrackTransactions from "./pages/PayTrackTransactions";
import { initialTransactions } from "./data/PayTrackTransactions";
import type { Transaction } from "./types/PayTrackTransactions";
import type { NewTransactionFormValues } from "./components/AddTransactionModal";

function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Shared transaction state for the dashboard and transactions page
  const [transactions, setTransactions] =
    useState<Transaction[]>(initialTransactions);

  // Add a new transaction to the shared list
  const handleAddTransaction = (values: NewTransactionFormValues) => {
    const sender = values.sender.trim();

    const newTransaction: Transaction = {
      id: crypto.randomUUID(),
      sender,
      initials: sender
        .split(/\s+/)
        .map((name) => name[0])
        .join("")
        .slice(0, 2)
        .toUpperCase(),
      reference: values.reference.trim(),
      date: new Date(`${values.date}T12:00:00`).toLocaleDateString(
        "en-US",
        {
          month: "short",
          day: "2-digit",
          year: "numeric",
        }
      ),
      amount: Number(values.amount),
      status: values.status,
    };

    setTransactions((previousTransactions) => [
      newTransaction,
      ...previousTransactions,
    ]);

    setIsAddModalOpen(false);
  };

  const closeAddModal = () => setIsAddModalOpen(false);
  const openAddModal = () => setIsAddModalOpen(true);

  return (
    <div className="min-h-screen bg-[#F8F9FB] text-slate-900">
      <div className="flex min-h-screen">
        <Sidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <main className="min-w-0 flex-1">
          {/* Top navigation */}
          <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-10">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open navigation"
                className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
              >
                <Menu size={21} />
              </button>

              <div>
                <p className="text-sm font-semibold text-slate-900">
                  PayTrack
                </p>

                <p className="hidden text-xs text-slate-500 sm:block">
                  Payment reconciliation workspace
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                aria-label="Notifications"
                onClick={() =>
                  alert("Notifications will be added later.")
                }
                className="relative rounded-xl border border-slate-200 p-2.5 text-slate-600 hover:bg-slate-50"
              >
                <Bell size={18} />
              </button>

              <button
                type="button"
                onClick={openAddModal}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2.5 text-sm font-medium text-white hover:bg-slate-800 sm:px-4"
              >
                <Plus size={17} />
                <span className="hidden sm:inline">
                  Add transaction
                </span>
                <span className="sm:hidden">Add</span>
              </button>
            </div>
          </header>

          {/* Application routes */}
          <Routes>
            <Route
              path="/"
              element={
                <Dashboard
                  transactions={transactions}
                  onAddTransaction={handleAddTransaction}
                  isAddModalOpen={isAddModalOpen}
                  onCloseAddModal={closeAddModal}
                  onOpenAddModal={openAddModal}
                />
              }
            />

            <Route
              path="/transactions"
              element={
                <div className="mx-auto max-w-[1500px] p-4 sm:p-6 lg:p-10">
                  <PayTrackTransactions
                    transactions={transactions}
                    onAddTransaction={handleAddTransaction}
                    isAddModalOpen={isAddModalOpen}
                    onOpenAddModal={openAddModal}
                    onCloseAddModal={closeAddModal}
                  />
                </div>
              }
            />

            {/* Fallback for unknown routes */}
            <Route
              path="*"
              element={
                <div className="p-10 text-center">
                  <h1 className="text-2xl font-semibold">
                    Page not found
                  </h1>
                  <p className="mt-2 text-sm text-slate-500">
                    The page you are looking for does not exist.
                  </p>
                </div>
              }
            />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}

export default App;