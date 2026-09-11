"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import type { Profile } from "@/types/domain";

export function AppShell({ profile, children }: { profile: Profile; children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <Sidebar role={profile.role} />
      </div>

      {/* Mobile off-canvas sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/50" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-y-0 left-0">
            <div className="relative h-full">
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute right-[-40px] top-4 flex h-8 w-8 items-center justify-center rounded-lg bg-navy-950 text-white"
              >
                <X size={18} />
              </button>
              <Sidebar role={profile.role} />
            </div>
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <button
          onClick={() => setMobileOpen(true)}
          className="flex h-12 w-full items-center gap-2 border-b border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 lg:hidden"
        >
          <Menu size={18} />
          Menu
        </button>
        {children}
      </div>
    </div>
  );
}
