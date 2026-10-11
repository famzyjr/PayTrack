
import {
  ArrowLeftRight,
  ChartNoAxesCombined,
  ClipboardList,
  LayoutDashboard,
  Settings,
  Wallet,
  X,
} from "lucide-react";

import { NavLink } from "react-router-dom";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const navigation = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Transactions", icon: ArrowLeftRight },
  { label: "Collection Registers", icon: ClipboardList },
  { label: "Reports", icon: ChartNoAxesCombined },
  { label: "Settings", icon: Settings },
];

function Sidebar({ open, onClose }: SidebarProps) {
   
  return (
    <>
      {open && (
        <button
          aria-label="Close navigation"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/30 lg:hidden"
        />
      )}
  
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-200 lg:static lg:z-auto lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-[76px] items-center justify-between border-b border-slate-100 px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white">
              <Wallet size={20} />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              PayTrack
            </span>
          </div>

          <button
            onClick={onClose}
            aria-label="Close sidebar"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
          >
            <X size={19} />
          </button>
        </div>

        <div className="px-4 pt-7">
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
            Workspace
          </p>

          <button className="flex w-full items-center gap-3 rounded-xl border border-slate-200 p-3 text-left hover:bg-slate-50">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 font-semibold text-emerald-800">
              NS
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-800">
                Northstar Stores
              </p>
              <p className="mt-0.5 text-xs text-slate-500">Business account</p>
            </div>
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-4 pt-8">
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
            Menu
          </p>
            
{navigation.map(({ label, icon: Icon }) => {
  const paths: Record<string, string> = {
    Dashboard: "/",
    Transactions: "/transactions",
    "Collection Registers": "/collection-registers",
    Reports: "/reports",
    Settings: "/settings",
  };

  return (
    <NavLink
      key={label}
      to={paths[label]}
      onClick={onClose}
      className={({ isActive }) =>
        `flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
          isActive
            ? "bg-slate-900 text-white"
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        }`
      }
    >
      <Icon size={19} strokeWidth={1.8} />
      {label}
    </NavLink>
  );
})}

        </nav>

        <div className="border-t border-slate-100 p-4">
          <div className="flex items-center gap-3 rounded-xl p-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-700">
              FA
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-800">
                Account Owner
              </p>
              <p className="truncate text-xs text-slate-500">
                Free workspace
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
