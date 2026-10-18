
import { useEffect, useState } from "react";
import {
    Bell,
    Menu,
    Plus,
} from "lucide-react";
import {
    Route,
    Routes,
    useNavigate,
} from "react-router-dom";

import Sidebar from "../components/Siderbar";

import Dashboard from "../pages/Dashboard";
import PayTrackTransactions from "../pages/PayTrackTransactions";

import { apiRequest } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useTransactions } from "../../hooks/UseTransactions";

export default function AppLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const [apiStatus, setApiStatus] = useState<
        "checking" | "connected" | "error"
    >("checking");

    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const {
        transactions,
        isAddModalOpen,
        isLoading,
        loadError,
        handleAddTransaction,
        handleSaveRemarks,
        handleUpdateStatus,
        openAddModal,
        closeAddModal,
    } = useTransactions();

    useEffect(() => {
        apiRequest<{ success: boolean; message: string }>("/health")
            .then(() => setApiStatus("connected"))
            .catch((error: unknown) => {
                console.error("PayTrack API connection failed:", error);
                setApiStatus("error");
            });
    }, []);

    const handleLogout = () => {
        logout();
        navigate("/login", { replace: true });
    };

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
                                    className={`rounded-full px-2 py-1 text-xs font-medium ${apiStatus === "connected"
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
                                onClick={handleLogout}
                                className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                            >
                                Sign out
                            </button>
                        </div>
                    </header>
                    {isLoading && (
                        <p className="px-6 py-4 text-sm text-slate-500">
                            Loading your transactions...
                        </p>
                    )}

                    {loadError && (
                        <div
                            role="alert"
                            className="mx-4 mt-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 sm:mx-6 lg:mx-10"
                        >
                            <p className="font-semibold">
                                Could not load transactions
                            </p>
                            <p className="mt-1">{loadError}</p>
                        </div>
                    )}
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
