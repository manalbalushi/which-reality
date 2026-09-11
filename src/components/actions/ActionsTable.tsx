"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Clock } from "lucide-react";
import { Table, Thead, Th, Td, Tr, EmptyState } from "@/components/ui/Table";
import { Badge, StatusBadge } from "@/components/ui/Badge";
import { Button, Field, Input, Select, Textarea } from "@/components/ui/Form";
import { Modal } from "@/components/ui/Modal";
import { fmtDate } from "@/lib/format";
import { updateAction, requestExtension } from "@/lib/actions/assessments";
import type { ActionStatus, Profile, VAction } from "@/types/domain";

const PRIORITY_COLOR: Record<string, "red" | "amber" | "blue" | "slate"> = {
  critical: "red",
  high: "amber",
  medium: "blue",
  low: "slate",
};

export function ActionsTable({
  rows,
  profiles,
  showRisk = true,
  canEdit = true,
}: {
  rows: VAction[];
  profiles: Profile[];
  showRisk?: boolean;
  canEdit?: boolean;
}) {
  const [extensionFor, setExtensionFor] = useState<VAction | null>(null);
  const [editFor, setEditFor] = useState<VAction | null>(null);

  if (rows.length === 0) return <EmptyState title="No actions" subtitle="Mitigation actions will appear here." />;

  return (
    <>
      <Table>
        <Thead>
          <tr>
            <Th>Action ID</Th>
            <Th>Description</Th>
            {showRisk && <Th>Risk</Th>}
            <Th>Owner</Th>
            <Th>Department</Th>
            <Th>Priority</Th>
            <Th>Target Date</Th>
            <Th>Status</Th>
            {canEdit && <Th>Actions</Th>}
          </tr>
        </Thead>
        <tbody>
          {rows.map((a) => (
            <Tr key={a.id}>
              <Td className="font-medium">{a.action_code}</Td>
              <Td className="max-w-sm truncate" title={a.description}>{a.description}</Td>
              {showRisk && (
                <Td>
                  <Link href={`/risks/${a.risk_id}`} className="text-brand-600 hover:underline">
                    {a.risk_code}
                  </Link>
                </Td>
              )}
              <Td>{a.owner_name ?? "—"}</Td>
              <Td>{a.department_name ?? "—"}</Td>
              <Td>
                <Badge color={PRIORITY_COLOR[a.priority] ?? "slate"}>{a.priority}</Badge>
              </Td>
              <Td>
                {fmtDate(a.target_date)}
                {a.effective_status === "overdue" && <span className="ml-1.5 text-xs font-semibold text-red-600">({a.days_overdue}d overdue)</span>}
              </Td>
              <Td>
                <StatusBadge status={a.effective_status} />
              </Td>
              {canEdit && (
                <Td>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setEditFor(a)} className="text-xs font-medium text-brand-600 hover:underline">
                      Update
                    </button>
                    {a.effective_status !== "completed" && (
                      <button onClick={() => setExtensionFor(a)} className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:underline">
                        <Clock size={12} />
                        Extend
                      </button>
                    )}
                  </div>
                </Td>
              )}
            </Tr>
          ))}
        </tbody>
      </Table>

      {editFor && <UpdateActionModal action={editFor} profiles={profiles} onClose={() => setEditFor(null)} />}
      {extensionFor && <ExtensionModal action={extensionFor} onClose={() => setExtensionFor(null)} />}
    </>
  );
}

function UpdateActionModal({ action, profiles, onClose }: { action: VAction; profiles: Profile[]; onClose: () => void }) {
  const [status, setStatus] = useState<Exclude<ActionStatus, "overdue">>(
    action.effective_status === "overdue" ? "open" : (action.effective_status as Exclude<ActionStatus, "overdue">)
  );
  const [completionDate, setCompletionDate] = useState(action.completion_date ?? "");
  const [comments, setComments] = useState(action.comments ?? "");
  const [ownerId, setOwnerId] = useState(action.owner_id ?? "");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSave() {
    setError(null);
    startTransition(async () => {
      try {
        await updateAction(action.id, {
          status,
          completion_date: status === "completed" ? completionDate || new Date().toISOString().slice(0, 10) : null,
          comments,
          owner_id: ownerId,
        });
        onClose();
      } catch (e) {
        setError((e as Error).message);
      }
    });
  }

  return (
    <Modal open onClose={onClose} title={`Update ${action.action_code}`}>
      <div className="space-y-3">
        <Field label="Status">
          <Select value={status} onChange={(e) => setStatus(e.target.value as Exclude<ActionStatus, "overdue">)}>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="on_hold">On Hold</option>
            <option value="cancelled">Cancelled</option>
          </Select>
        </Field>
        <Field label="Owner">
          <Select value={ownerId} onChange={(e) => setOwnerId(e.target.value)}>
            {profiles.map((p) => (
              <option key={p.id} value={p.id}>
                {p.full_name}
              </option>
            ))}
          </Select>
        </Field>
        {status === "completed" && (
          <Field label="Completion Date" required>
            <Input type="date" value={completionDate} onChange={(e) => setCompletionDate(e.target.value)} />
          </Field>
        )}
        <Field label="Comments">
          <Textarea value={comments} onChange={(e) => setComments(e.target.value)} />
        </Field>
        {error && <p className="text-xs text-red-600">{error}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={pending}>{pending ? "Saving…" : "Save"}</Button>
        </div>
      </div>
    </Modal>
  );
}

function ExtensionModal({ action, onClose }: { action: VAction; onClose: () => void }) {
  const [requested, setRequested] = useState("");
  const [reason, setReason] = useState("");
  const [riskImpact, setRiskImpact] = useState("");
  const [compensating, setCompensating] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit() {
    setError(null);
    startTransition(async () => {
      try {
        await requestExtension(action.id, {
          current_target_date: action.target_date,
          requested_target_date: requested,
          reason,
          risk_impact: riskImpact,
          compensating_controls: compensating,
        });
        onClose();
      } catch (e) {
        setError((e as Error).message);
      }
    });
  }

  return (
    <Modal open onClose={onClose} title={`Request Extension — ${action.action_code}`}>
      <div className="space-y-3">
        <p className="text-xs text-slate-500">Current target date: <strong>{fmtDate(action.target_date)}</strong></p>
        <Field label="Requested Target Date" required>
          <Input type="date" value={requested} min={action.target_date} onChange={(e) => setRequested(e.target.value)} />
        </Field>
        <Field label="Reason" required>
          <Textarea value={reason} onChange={(e) => setReason(e.target.value)} />
        </Field>
        <Field label="Risk Impact of Delay">
          <Textarea value={riskImpact} onChange={(e) => setRiskImpact(e.target.value)} />
        </Field>
        <Field label="Compensating Controls">
          <Textarea value={compensating} onChange={(e) => setCompensating(e.target.value)} />
        </Field>
        {error && <p className="text-xs text-red-600">{error}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={pending || !requested || !reason}>{pending ? "Submitting…" : "Submit Request"}</Button>
        </div>
      </div>
    </Modal>
  );
}
