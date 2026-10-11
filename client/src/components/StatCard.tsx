
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  description: string;
  icon: LucideIcon;
  iconColor: string;
  iconBackground: string;
}

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  iconColor,
  iconBackground,
}: StatCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-slate-300">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">
            {value}
          </h2>
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconBackground} ${iconColor}`}
        >
          <Icon size={21} strokeWidth={1.8} />
        </div>
      </div>

      <p className="mt-4 text-xs text-slate-500">{description}</p>
    </div>
  );
}

export default StatCard;
