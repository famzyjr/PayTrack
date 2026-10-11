
import { useState } from "react";
import { Bell, Menu, Plus } from "lucide-react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Sidebar from "./components/Siderbar.tsx";
import Dashboard from "./pages/Dashboard";
import PayTrackTransactions from "./pages/PayTrackTransactions";

function AppLayout() {
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
                  PayTrack
                </p>
                <p className="hidden text-xs text-slate-500 sm:block">
                  Payment reconciliation workspace
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
              </button>

              <button
                onClick={() => alert("Transaction creation will be added later.")}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2.5 text-sm font-medium text-white hover:bg-slate-800 sm:px-4"
              >
                <Plus size={17} />
                <span className="hidden sm:inline">Add transaction</span>
                <span className="sm:hidden">Add</span>
              </button>
            </div>
          </header>

          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/transactions" element={<div className="mx-auto max-w-[1500px] p-4 sm:p-6 lg:p-10"><PayTrackTransactions/></div>} />
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
