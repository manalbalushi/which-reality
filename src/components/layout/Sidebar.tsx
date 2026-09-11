"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import {
  LayoutDashboard,
  ClipboardList,
  ShieldAlert,
  ListChecks,
  FolderOpen,
  CheckSquare,
  BarChart3,
  History,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";
import type { UserRole } from "@/types/domain";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/assessments", label: "Assessment Inventory", icon: ClipboardList },
  { href: "/risks", label: "Risk Register", icon: ShieldAlert },
  { href: "/actions", label: "Action Register", icon: ListChecks },
  { href: "/evidence", label: "Evidence Repository", icon: FolderOpen },
  { href: "/approvals", label: "Approvals", icon: CheckSquare },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/audit-trail", label: "Audit Trail", icon: History },
] as const;

export function Sidebar({ role }: { role: UserRole }) {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col bg-navy-950 text-slate-300">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <ShieldCheck size={24} className="text-brand-400" />
        <div>
          <p className="text-sm font-semibold leading-tight text-white">OT Risk Management</p>
          <p className="text-[10px] uppercase tracking-wide text-slate-500">Cybersecurity Platform</p>
        </div>
      </div>

      <nav className="scrollbar-thin flex-1 overflow-y-auto px-3 py-2">
        <ul className="space-y-0.5">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={clsx(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition",
                    active ? "bg-navy-800 text-white" : "text-slate-400 hover:bg-navy-900 hover:text-white"
                  )}
                >
                  <Icon size={17} />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>

        {role === "administrator" && (
          <>
            <p className="mt-5 mb-1 px-3 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
              Administration
            </p>
            <ul className="space-y-0.5">
              <li>
                <Link
                  href="/admin"
                  className={clsx(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition",
                    pathname.startsWith("/admin") ? "bg-navy-800 text-white" : "text-slate-400 hover:bg-navy-900 hover:text-white"
                  )}
                >
                  <Settings size={17} />
                  Configuration
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/users"
                  className={clsx(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition",
                    pathname.startsWith("/admin/users") ? "bg-navy-800 text-white" : "text-slate-400 hover:bg-navy-900 hover:text-white"
                  )}
                >
                  <Users size={17} />
                  Users &amp; Roles
                </Link>
              </li>
            </ul>
          </>
        )}
      </nav>

      <div className="px-5 py-4 text-[10px] text-slate-600">
        Replacing spreadsheet-based OT risk tracking.
      </div>
    </aside>
  );
}
