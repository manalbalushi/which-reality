"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { Search, Bell, LogOut, ChevronDown, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { initials } from "@/lib/format";
import { USER_ROLES, type Profile } from "@/types/domain";
import { Badge } from "@/components/ui/Badge";

export function Topbar({ profile, unreadCount }: { profile: Profile; unreadCount: number }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const roleLabel = USER_ROLES.find((r) => r.value === profile.role)?.label ?? profile.role;

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-slate-200 bg-white px-3 sm:gap-4 sm:px-6">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (query.trim()) router.push(`/search?q=${encodeURIComponent(query.trim())}`);
        }}
        className="flex w-full min-w-0 max-w-md items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"
      >
        <Search size={16} className="shrink-0 text-slate-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search…"
          className="w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
        />
      </form>

      <div className="flex items-center gap-3">
        <Link
          href="/assessments/new"
          className="hidden items-center gap-1.5 rounded-lg bg-navy-900 px-3.5 py-2 text-sm font-medium text-white hover:bg-navy-800 sm:flex"
        >
          <Plus size={16} />
          New Risk Assessment
        </Link>

        <Link href="/notifications" className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100">
          <Bell size={19} />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-semibold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Link>

        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 rounded-lg py-1.5 pl-1.5 pr-2 hover:bg-slate-100"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-navy-900 text-xs font-semibold text-white">
              {initials(profile.full_name)}
            </span>
            <span className="hidden text-left sm:block">
              <span className="block text-xs font-medium text-slate-800">{profile.full_name}</span>
              <span className="block text-[10px] text-slate-400">{roleLabel}</span>
            </span>
            <ChevronDown size={14} className="text-slate-400" />
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 z-20 mt-2 w-56 rounded-lg border border-slate-200 bg-white p-2 shadow-lg">
                <div className="px-2 py-1.5">
                  <p className="text-xs font-medium text-slate-800">{profile.email}</p>
                  <Badge color="navy" className="mt-1">
                    {roleLabel}
                  </Badge>
                </div>
                <div className="my-1 h-px bg-slate-100" />
                <button
                  onClick={signOut}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-slate-600 hover:bg-slate-50"
                >
                  <LogOut size={15} />
                  Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
