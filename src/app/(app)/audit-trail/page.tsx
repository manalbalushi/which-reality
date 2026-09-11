import { createClient } from "@/lib/supabase/server";
import { getReferenceData } from "@/lib/data/reference";
import { SectionCard } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Table, Thead, Th, Td, Tr, EmptyState } from "@/components/ui/Table";
import { fmtDateTime } from "@/lib/format";
import type { AuditLog } from "@/types/domain";

export const dynamic = "force-dynamic";

export default async function AuditTrailPage({
  searchParams,
}: {
  searchParams: Promise<{ object_type?: string; user?: string }>;
}) {
  const { object_type, user } = await searchParams;
  const supabase = await createClient();
  const reference = await getReferenceData();

  let query = supabase.from("audit_logs").select("*").order("occurred_at", { ascending: false }).limit(500);
  if (object_type) query = query.eq("object_type", object_type);
  if (user) query = query.eq("user_id", user);
  const { data } = await query;
  const rows = (data ?? []) as AuditLog[];

  const userName = (id: string | null) => reference.profiles.find((p) => p.id === id)?.full_name ?? "System";

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Audit Trail</h1>
        <p className="text-sm text-slate-500">
          Immutable, append-only record of every change to assessments, risks, actions, controls, approvals and evidence.
          Nobody — including administrators — can edit or delete these entries.
        </p>
      </div>

      <form className="flex flex-wrap items-center gap-2" action="/audit-trail">
        <select name="object_type" defaultValue={object_type ?? ""} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm">
          <option value="">All object types</option>
          {["assessments", "risks", "actions", "assessment_controls", "approvals", "evidence"].map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <select name="user" defaultValue={user ?? ""} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm">
          <option value="">All users</option>
          {reference.profiles.map((p) => <option key={p.id} value={p.id}>{p.full_name}</option>)}
        </select>
        <button type="submit" className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-200">Filter</button>
      </form>

      <SectionCard title={`${rows.length} audit entries (most recent 500)`}>
        {rows.length === 0 ? (
          <EmptyState title="No audit activity" />
        ) : (
          <Table>
            <Thead>
              <tr><Th>Date &amp; Time</Th><Th>User</Th><Th>Object</Th><Th>Object ID</Th><Th>Action</Th><Th>Field</Th><Th>Old Value</Th><Th>New Value</Th></tr>
            </Thead>
            <tbody>
              {rows.map((log) => (
                <Tr key={log.id}>
                  <Td>{fmtDateTime(log.occurred_at)}</Td>
                  <Td>{userName(log.user_id)}</Td>
                  <Td className="text-xs">{log.object_type}</Td>
                  <Td className="font-mono text-[11px] text-slate-400">{log.object_id.slice(0, 8)}</Td>
                  <Td><Badge color={log.action === "insert" ? "green" : log.action === "delete" ? "red" : "blue"}>{log.action}</Badge></Td>
                  <Td className="text-xs">{log.field_changed ?? "—"}</Td>
                  <Td className="max-w-[160px] truncate text-xs text-slate-400">{log.old_value ?? "—"}</Td>
                  <Td className="max-w-[160px] truncate text-xs">{log.new_value ?? "—"}</Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        )}
      </SectionCard>
    </div>
  );
}
