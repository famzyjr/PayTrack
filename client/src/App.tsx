
import { useState, useEffect } from "react";
import {
  Bell,
  Menu,
  Plus,
} from "lucide-react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import Sidebar from "./components/Siderbar";
import Dashboard from "./pages/Dashboard";
import PayTrackTransactions from "./pages/PayTrackTransactions";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedRoute from "./components/ProtectedRoute";

import { initialTransactions } from "./data/PayTrackTransactions";
import { apiRequest } from "./services/api";
import { AuthProvider, useAuth } from "./context/AuthContext";

import type {
  Transaction,
  TransactionStatus,
} from "./types/PayTrackTransactions";

import type { NewTransactionFormValues } from "./components/AddTransactionModal";

function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [transactions, setTransactions] =
    useState<Transaction[]>(initialTransactions);

  const [apiStatus, setApiStatus] = useState<
    "checking" | "connected" | "error"
  >("checking");

  const { user, logout } = useAuth();
  const location = useLocation();

  useEffect(() => {
    apiRequest<{ success: boolean; message: string }>("/health")
      .then(() => setApiStatus("connected"))
      .catch((error: unknown) => {
        console.error("PayTrack API connection failed:", error);
        setApiStatus("error");
      });
  }, []);

  const handleAddTransaction = (
    values: NewTransactionFormValues,
  ) => {
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
        },
      ),
      amount: Number(values.amount),
      status: values.status,
      remarks: values.remarks.trim(),
    };

    setTransactions((previous) => [
      newTransaction,
      ...previous,
    ]);

    setIsAddModalOpen(false);
  };

  const handleSaveRemarks = (
    id: string,
    remarks: string,
  ) => {
    setTransactions((previous) =>
      previous.map((transaction) =>
        transaction.id === id
          ? { ...transaction, remarks }
          : transaction,
      ),
    );
  };

  const handleUpdateStatus = (
    id: string,
    status: TransactionStatus,
  ) => {
    setTransactions((previous) =>
      previous.map((transaction) =>
        transaction.id === id
          ? { ...transaction, status }
          : transaction,
      ),
    );
  };

  const closeAddModal = () => setIsAddModalOpen(false);
  const openAddModal = () => setIsAddModalOpen(true);

  const isAuthPage =
    location.pathname === "/login" ||
    location.pathname === "/register";

  // Redirect logged-in users away from Login and Register.
  if (isAuthPage && user) {
    return <Navigate to="/" replace />;
  }

  // Authentication pages do not show the dashboard layout.
  if (isAuthPage) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    );
  }

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
                type="button"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open navigation"
                className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
              >
                <Menu size={21} />
              </button>

              <div className="flex flex-wrap items-center gap-2">
                <p className="hidden text-xs text-slate-500 sm:block">
                  Payment reconciliation workspace
                </p>

                <span
                  className={`rounded-full px-2 py-1 text-xs font-medium ${
                    apiStatus === "connected"
                      ? "bg-emerald-50 text-emerald-700"
                      : apiStatus === "error"
                        ? "bg-rose-50 text-rose-700"
                        : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {apiStatus === "connected"
                    ? "API connected"
                    : apiStatus === "error"
                      ? "API connection failed"
                      : "Connecting..."}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              {user && (
                <span className="hidden text-sm text-slate-600 md:block">
                  {user.name}
                </span>
              )}

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

              <button
                type="button"
                onClick={logout}
                className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Sign out
              </button>
            </div>
          </header>

          <Routes>
            <Route
              path="/"
              element={
                <Dashboard
                  transactions={transactions}
                  onAddTransaction={handleAddTransaction}
                  onSaveRemarks={handleSaveRemarks}
                  onUpdateStatus={handleUpdateStatus}
                  isAddModalOpen={isAddModalOpen}
                  onCloseAddModal={closeAddModal}
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
                    onSaveRemarks={handleSaveRemarks}
                    onUpdateStatus={handleUpdateStatus}
                    isAddModalOpen={isAddModalOpen}
                    onOpenAddModal={openAddModal}
                    onCloseAddModal={closeAddModal}
                  />
                </div>
              }
            />

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
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<AppLayout />} />
          <Route path="/register" element={<AppLayout />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/*" element={<AppLayout />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
