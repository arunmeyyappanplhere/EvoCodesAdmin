import React from "react";
import { Search, Bell, Mail, Sun } from "lucide-react";

/**
 * Top bar (search + icons + avatar) shared across admin pages.
 */
export function TopBar({ userName = "Admin User", userRole = "SUPER ADMIN" }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-800 px-8 py-4">
      <div className="relative w-full max-w-md">
        <Search
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
        />
        <input
          type="text"
          placeholder="Search across clients, industries, or contacts..."
          className="w-full rounded-lg border border-slate-700 bg-slate-800/60 py-2 pl-9 pr-3 text-sm text-slate-200 placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
        />
      </div>

      <div className="flex items-center gap-5">
        <button className="relative text-slate-400 hover:text-slate-200">
          <Bell size={18} />
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-semibold text-white">
            3
          </span>
        </button>
        <button className="text-slate-400 hover:text-slate-200">
          <Mail size={18} />
        </button>
        <button className="text-slate-400 hover:text-slate-200">
          <Sun size={18} />
        </button>
        <div className="flex items-center gap-2 border-l border-slate-800 pl-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-500/20 text-xs font-semibold text-cyan-300">
            {userName
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </div>
          <div className="leading-tight">
            <p className="text-sm font-medium text-slate-200">{userName}</p>
            <p className="text-[10px] tracking-wide text-slate-500">{userRole}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Breadcrumb + title + subtitle + primary action, e.g.:
 * <PageHeading breadcrumb={["Admin", "Client Directory"]} title="Client Directory"
 *   subtitle="Manage corporate relationships..." action={<button>Add Client</button>} />
 */
export function PageHeading({ breadcrumb = [], title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between px-8 pt-6">
      <div>
        <p className="text-xs text-slate-500">
          {breadcrumb.map((crumb, i) => (
            <span key={crumb}>
              {i > 0 && <span className="mx-1.5 text-slate-600">/</span>}
              <span className={i === breadcrumb.length - 1 ? "text-cyan-400" : ""}>
                {crumb}
              </span>
            </span>
          ))}
        </p>
        <h2 className="mt-1 text-2xl font-bold text-white">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-slate-400">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}