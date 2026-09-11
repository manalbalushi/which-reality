import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getReferenceData } from "@/lib/data/reference";
import { requireProfile } from "@/lib/auth";
import { SectionCard } from "@/components/ui/Card";
import { ActionsTable } from "@/components/actions/ActionsTable";
import { canEditContent } from "@/lib/auth";
import type { VAction } from "@/types/domain";
import { ExportActionRegisterButton } from "@/components/actions/ExportActionRegisterButton";
import { ExtensionRequestsPanel } from "@/components/actions/ExtensionRequestsPanel";

export const dynamic = "force-dynamic";

export default async function ActionsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; priority?: string; q?: string }>;
}) {
  const { status, priority, q } = await searchParams;
  const profile = await requireProfile();
  const supabase = await createClient();
  const reference = await getReferenceData();

  const { data } = await supabase.from("v_actions").select("*").order("target_date");
  let rows = (data ?? []) as VAction[];

  if (status) rows = rows.filter((a) => a.effective_status === status);
  if (priority) rows = rows.filter((a) => a.priority === priority);
  if (q) {
    const needle = q.toLowerCase();
    rows = rows.filter(
      (a) => a.action_code.toLowerCase().includes(needle) || a.description.toLowerCase().includes(needle) || a.risk_code.toLowerCase().includes(needle)
    );
  }

  const { data: extensions } = await supabase
    .from("action_extensions")
    .select("*")
    .eq("approval_status", "pending")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Mitigation Action Register</h1>
          <p className="text-sm text-slate-500">All mitigation actions across every risk assessment.</p>
        </div>
        <ExportActionRegisterButton rows={rows} />
      </div>

      <form className="flex flex-wrap items-center gap-2" action="/actions">
        <input name="q" defaultValue={q} placeholder="Search by action ID, description, risk…" className="w-64 rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-brand-500 focus:outline-none" />
        <select name="status" defaultValue={status ?? ""} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm">
          <option value="">All statuses</option>
          {["open", "in_progress", "completed", "overdue", "on_hold", "cancelled"].map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
        </select>
        <select name="priority" defaultValue={priority ?? ""} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm">
          <option value="">All priorities</option>
          {["critical", "high", "medium", "low"].map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <button type="submit" className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-200">Filter</button>
        {(status || priority || q) && <Link href="/actions" className="text-xs text-slate-400 hover:underline">Clear</Link>}
      </form>

      {extensions && extensions.length > 0 && (
        <ExtensionRequestsPanel extensions={extensions} actions={rows} canDecide={canEditContent(profile.role) && profile.role !== "risk_assessor"} />
      )}

      <SectionCard title={`${rows.length} action${rows.length === 1 ? "" : "s"}`}>
        <ActionsTable rows={rows} profiles={reference.profiles} canEdit={canEditContent(profile.role)} />
      </SectionCard>
    </div>
  );
}
