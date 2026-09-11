import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { SectionCard } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/Table";
import { fmtRelative } from "@/lib/format";
import { MarkAllReadButton } from "@/components/notifications/MarkAllReadButton";
import type { AppNotification } from "@/types/domain";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const profile = await requireProfile();
  const supabase = await createClient();
  const { data } = await supabase.from("notifications").select("*").eq("user_id", profile.id).order("created_at", { ascending: false }).limit(100);
  const rows = (data ?? []) as AppNotification[];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Notifications</h1>
          <p className="text-sm text-slate-500">Assessment assignments, due dates, approvals and overdue items.</p>
        </div>
        <MarkAllReadButton />
      </div>

      <SectionCard title="All notifications">
        {rows.length === 0 ? (
          <EmptyState title="No notifications" />
        ) : (
          <ul className="divide-y divide-slate-100">
            {rows.map((n) => (
              <li key={n.id} className={`flex items-start gap-3 py-3 ${!n.is_read ? "bg-brand-50/40" : ""}`}>
                <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${!n.is_read ? "bg-brand-500" : "bg-slate-200"}`} />
                <div>
                  <p className="text-sm font-medium text-slate-800">{n.title}</p>
                  <p className="text-xs text-slate-500">{n.message}</p>
                  <p className="mt-0.5 text-[11px] text-slate-400">{fmtRelative(n.created_at)}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>
    </div>
  );
}
