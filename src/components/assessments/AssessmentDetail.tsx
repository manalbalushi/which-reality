"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { Download, FileSpreadsheet, FileText, Pencil, Send, Trash2 } from "lucide-react";
import { Card, SectionCard } from "@/components/ui/Card";
import { Badge, RiskRatingBadge, StatusBadge } from "@/components/ui/Badge";
import { Button, Field, Input, Select, Textarea } from "@/components/ui/Form";
import { Modal } from "@/components/ui/Modal";
import { Table, Thead, Th, Td, Tr, EmptyState } from "@/components/ui/Table";
import { ActionsTable } from "@/components/actions/ActionsTable";
import { EvidenceList } from "@/components/evidence/EvidenceList";
import { fmtDate, fmtDateTime } from "@/lib/format";
import { ratingForScore } from "@/lib/risk";
import { canEditContent, isAdmin } from "@/lib/roles";
import {
  addParticipant,
  deleteParticipant,
  addRisk,
  setAssessmentAssets,
  submitForApproval,
  decideApproval,
  validateAssessmentForSubmission,
  deleteAssessment,
  upsertAssessmentControl,
} from "@/lib/actions/assessments";
import type { ReferenceData } from "@/lib/data/reference";
import type {
  ActionItem,
  Approval,
  Asset,
  Assessment,
  AssessmentControl,
  AssessmentParticipant,
  AuditLog,
  Evidence,
  ParticipationType,
  Profile,
  Risk,
  VAction,
} from "@/types/domain";
import { exportAssessmentExcel, exportAssessmentPdf } from "@/lib/export/assessmentExport";

const TABS = ["Overview", "Scope", "Participants", "Assets", "Risks", "Controls", "Actions", "Evidence", "Approvals", "History"] as const;
type Tab = (typeof TABS)[number];

const APPROVAL_STEP_FOR_STATUS: Record<string, "risk_manager_review" | "process_owner_review" | "approver_review" | null> = {
  risk_manager_review: "risk_manager_review",
  process_owner_review: "process_owner_review",
  approver_review: "approver_review",
};
const ROLE_FOR_STEP: Record<string, string> = {
  risk_manager_review: "risk_manager",
  process_owner_review: "process_owner",
  approver_review: "approver",
};

export function AssessmentDetail({
  currentProfile,
  assessment,
  participants,
  linkedAssets,
  risks,
  assessmentControls,
  riskControlLinks,
  actions,
  evidence,
  approvals,
  auditLogs,
  selectedOtLevelIds,
  reference,
  initialTab,
}: {
  currentProfile: Profile;
  assessment: Assessment;
  participants: AssessmentParticipant[];
  linkedAssets: Asset[];
  risks: Risk[];
  assessmentControls: AssessmentControl[];
  riskControlLinks: { risk_id: string; assessment_control_id: string }[];
  actions: ActionItem[];
  evidence: Evidence[];
  approvals: Approval[];
  auditLogs: AuditLog[];
  selectedOtLevelIds: string[];
  reference: ReferenceData;
  initialTab?: Tab;
}) {
  const [tab, setTab] = useState<Tab>(initialTab ?? "Overview");
  const canEdit = canEditContent(currentProfile.role) && ["draft", "in_progress", "rejected"].includes(assessment.status);

  const categoryName = (id: string | null) => reference.riskCategories.find((c) => c.id === id)?.name ?? "—";
  const assetName = (id: string | null) => reference.assets.find((a) => a.id === id)?.name ?? "—";
  const profileName = (id: string | null) => reference.profiles.find((p) => p.id === id)?.full_name ?? "—";
  const controlDef = (id: string) => reference.controls.find((c) => c.id === id);

  const vActions: VAction[] = useMemo(
    () =>
      actions.map((a) => {
        const risk = risks.find((r) => r.id === a.risk_id);
        const overdue = a.status !== "completed" && a.status !== "cancelled" && new Date(a.target_date) < new Date();
        return {
          ...a,
          risk_code: risk?.risk_code ?? "",
          risk_title: risk?.title ?? "",
          assessment_code: assessment.assessment_code,
          owner_name: profileName(a.owner_id),
          department_name: reference.departments.find((d) => d.id === a.department_id)?.name ?? null,
          effective_status: overdue ? "overdue" : a.status,
          days_overdue: overdue ? Math.floor((Date.now() - new Date(a.target_date).getTime()) / 86400000) : 0,
        };
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [actions, risks]
  );

  return (
    <div className="space-y-4">
      <AssessmentHeader
        assessment={assessment}
        currentProfile={currentProfile}
        canEdit={canEdit}
        risks={risks}
        participants={participants}
        assets={linkedAssets}
        assessmentControls={assessmentControls}
        actions={actions}
        evidence={evidence}
        approvals={approvals}
        controlDef={controlDef}
        profiles={reference.profiles}
      />

      <div className="flex gap-1 overflow-x-auto border-b border-slate-200">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition ${
              tab === t ? "border-navy-900 text-navy-900" : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            {t}
            {t === "Risks" && risks.length > 0 && <span className="ml-1.5 text-xs text-slate-400">({risks.length})</span>}
            {t === "Actions" && actions.length > 0 && <span className="ml-1.5 text-xs text-slate-400">({actions.length})</span>}
            {t === "Evidence" && evidence.length > 0 && <span className="ml-1.5 text-xs text-slate-400">({evidence.length})</span>}
          </button>
        ))}
      </div>

      {tab === "Overview" && <OverviewPanel assessment={assessment} profileName={profileName} />}
      {tab === "Scope" && <ScopePanel assessment={assessment} otLevels={reference.otLevels} selectedOtLevelIds={selectedOtLevelIds} />}
      {tab === "Participants" && (
        <ParticipantsPanel assessmentId={assessment.id} participants={participants} evidence={evidence} canEdit={canEdit} profiles={reference.profiles} />
      )}
      {tab === "Assets" && <AssetsPanel assessmentId={assessment.id} linkedAssets={linkedAssets} allAssets={reference.assets} canEdit={canEdit} />}
      {tab === "Risks" && (
        <RisksPanel
          assessment={assessment}
          risks={risks}
          reference={reference}
          canEdit={canEdit}
          categoryName={categoryName}
          assetName={assetName}
          profileName={profileName}
        />
      )}
      {tab === "Controls" && (
        <ControlsPanel
          assessmentId={assessment.id}
          assessmentControls={assessmentControls}
          risks={risks}
          riskControlLinks={riskControlLinks}
          controlDef={controlDef}
          profileName={profileName}
          controls={reference.controls}
          profiles={reference.profiles}
          canEdit={canEdit}
        />
      )}
      {tab === "Actions" && <ActionsTable rows={vActions} profiles={reference.profiles} canEdit={canEdit} />}
      {tab === "Evidence" && (
        <EvidenceList evidence={evidence} profiles={reference.profiles} canManage={canEdit} linkContext={{ assessment_id: assessment.id }} />
      )}
      {tab === "Approvals" && (
        <ApprovalsPanel
          assessment={assessment}
          approvals={approvals}
          currentProfile={currentProfile}
          profileName={profileName}
        />
      )}
      {tab === "History" && <HistoryPanel auditLogs={auditLogs} />}
    </div>
  );
}

// ---------------------------------------------------------------------------
function AssessmentHeader({
  assessment,
  currentProfile,
  canEdit,
  risks,
  participants,
  assets,
  assessmentControls,
  actions,
  evidence,
  approvals,
  controlDef,
  profiles,
}: {
  assessment: Assessment;
  currentProfile: Profile;
  canEdit: boolean;
  risks: Risk[];
  participants: AssessmentParticipant[];
  assets: Asset[];
  assessmentControls: AssessmentControl[];
  actions: ActionItem[];
  evidence: Evidence[];
  approvals: Approval[];
  controlDef: (id: string) => { name: string } | undefined;
  profiles: Profile[];
}) {
  const [pending, startTransition] = useTransition();
  const [validationErrors, setValidationErrors] = useState<string[] | null>(null);
  const [checking, setChecking] = useState(false);

  async function handleSubmitClick() {
    setChecking(true);
    const errors = await validateAssessmentForSubmission(assessment.id);
    setChecking(false);
    if (errors.length) {
      setValidationErrors(errors);
      return;
    }
    startTransition(() => submitForApproval(assessment.id));
  }

  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs text-slate-400">{assessment.assessment_code}</span>
            <Badge color={assessment.type === "full" ? "navy" : "blue"}>{assessment.type === "full" ? "Full Assessment" : "Light Assessment"}</Badge>
            <StatusBadge status={assessment.status} />
          </div>
          <h1 className="mt-1 text-xl font-semibold text-slate-900">{assessment.title}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {assessment.business_process ?? "—"} · Assessment date {fmtDate(assessment.assessment_date)} · Due {fmtDate(assessment.due_date)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {canEdit && assessment.type === "full" && (
            <Link href={`/assessments/${assessment.id}/edit/info`}>
              <Button variant="secondary" size="sm"><Pencil size={14} />Continue Wizard</Button>
            </Link>
          )}
          {canEdit && assessment.type === "light" && (
            <Link href={`/assessments/${assessment.id}/light`}>
              <Button variant="secondary" size="sm"><Pencil size={14} />Continue Editing</Button>
            </Link>
          )}
          <Button
            variant="secondary"
            size="sm"
            onClick={() =>
              exportAssessmentExcel({
                assessment: assessment as unknown as Record<string, unknown> & { assessment_code: string; title: string },
                participants,
                assets,
                risks,
                assessmentControls: assessmentControls.map((c) => ({ ...c, control_name: controlDef(c.control_id)?.name })),
                actions,
                evidence,
                approvals,
                profiles,
              })
            }
          >
            <FileSpreadsheet size={14} />
            Excel
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() =>
              exportAssessmentPdf({
                assessment: assessment as unknown as Record<string, unknown> & { assessment_code: string; title: string },
                participants,
                assets,
                risks,
                assessmentControls: assessmentControls.map((c) => ({ ...c, control_name: controlDef(c.control_id)?.name })),
                actions,
                evidence,
                approvals,
                profiles,
              })
            }
          >
            <FileText size={14} />
            PDF
          </Button>
          {canEdit && ["draft", "in_progress", "rejected"].includes(assessment.status) && (
            <Button size="sm" onClick={handleSubmitClick} disabled={pending || checking}>
              <Send size={14} />
              {checking ? "Checking…" : pending ? "Submitting…" : "Submit for Review"}
            </Button>
          )}
          {isAdmin(currentProfile.role) && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => confirm("Archive this assessment?") && startTransition(() => deleteAssessment(assessment.id))}
            >
              <Trash2 size={14} />
            </Button>
          )}
        </div>
      </div>

      {validationErrors && (
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3">
          <p className="mb-1 text-xs font-semibold text-amber-800">This assessment cannot be submitted yet:</p>
          <ul className="list-disc space-y-0.5 pl-4 text-xs text-amber-800">
            {validationErrors.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}

// ---------------------------------------------------------------------------
export function OverviewPanel({ assessment, profileName }: { assessment: Assessment; profileName: (id: string | null) => string }) {
  const rows: [string, string][] = [
    ["Process Owner", profileName(assessment.process_owner_id)],
    ["Assessment Owner", profileName(assessment.assessment_owner_id)],
    ["Location", assessment.location ?? "—"],
    ["Business Process", assessment.business_process ?? "—"],
    ["Assessment Date", fmtDate(assessment.assessment_date)],
    ["Due Date", fmtDate(assessment.due_date)],
    ["Completion Date", fmtDate(assessment.completion_date)],
  ];
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <SectionCard title="Assessment Information" className="lg:col-span-2">
        <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
          {rows.map(([label, value]) => (
            <div key={label}>
              <dt className="text-xs text-slate-400">{label}</dt>
              <dd className="text-slate-800">{value}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-4 space-y-3 border-t border-slate-100 pt-4 text-sm">
          <div>
            <dt className="text-xs text-slate-400">Reason for Assessment</dt>
            <dd className="text-slate-700">{assessment.reason_for_assessment ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-400">Description</dt>
            <dd className="text-slate-700">{assessment.description ?? "—"}</dd>
          </div>
        </div>
      </SectionCard>
      <SectionCard title="Wizard Progress">
        <p className="text-xs text-slate-500">
          Step {assessment.wizard_step} · {assessment.type === "full" ? "10 steps" : "quick flow"}
        </p>
        <p className="mt-3 text-xs text-slate-400">
          Created {fmtDateTime(assessment.created_at)}
          <br />
          Last updated {fmtDateTime(assessment.updated_at)}
        </p>
      </SectionCard>
    </div>
  );
}

export function ScopePanel({ assessment, otLevels, selectedOtLevelIds }: { assessment: Assessment; otLevels: ReferenceData["otLevels"]; selectedOtLevelIds: string[] }) {
  const rows: [string, string | null][] = [
    ["Objective", assessment.objective],
    ["In Scope", assessment.scope_in],
    ["Out of Scope", assessment.scope_out],
    ["Boundary", assessment.boundary],
    ["OT Environment", assessment.ot_environment],
    ["Network Zone", assessment.network_zone],
    ["Methodology", assessment.methodology],
    ["System", assessment.scope_system],
    ["Asset", assessment.scope_asset],
    ["Technology", assessment.scope_technology],
    ["Assessment Criteria", assessment.assessment_criteria],
  ];
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <SectionCard title="Scope" className="lg:col-span-2">
        <dl className="space-y-3 text-sm">
          {rows.map(([label, value]) => (
            <div key={label}>
              <dt className="text-xs text-slate-400">{label}</dt>
              <dd className="text-slate-700">{value ?? "—"}</dd>
            </div>
          ))}
        </dl>
      </SectionCard>
      <SectionCard title="OT Architecture Levels">
        {otLevels.length === 0 ? (
          <EmptyState title="No levels configured" />
        ) : (
          <ul className="space-y-1.5">
            {otLevels.map((lvl) => (
              <li key={lvl.id} className="flex items-center gap-2 text-sm">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${selectedOtLevelIds.includes(lvl.id) ? "bg-brand-500" : "bg-slate-200"}`}
                />
                <span className={selectedOtLevelIds.includes(lvl.id) ? "text-slate-800" : "text-slate-400"}>{lvl.name}</span>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>
    </div>
  );
}

// ---------------------------------------------------------------------------
const PARTICIPATION_TYPES: ParticipationType[] = [
  "workshop", "interview", "technical_review", "risk_assessment", "validation", "approval", "subject_matter_expert",
];

export function ParticipantsPanel({
  assessmentId, participants, evidence, canEdit, profiles,
}: {
  assessmentId: string; participants: AssessmentParticipant[]; evidence: Evidence[]; canEdit: boolean; profiles: Profile[];
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <SectionCard
      title="Assessment Participants"
      subtitle="Everyone involved in workshops, interviews, technical reviews and validation"
      action={canEdit && <Button size="sm" onClick={() => setOpen(true)}>+ Add Participant</Button>}
    >
      {participants.length === 0 ? (
        <EmptyState title="No participants recorded" />
      ) : (
        <Table>
          <Thead>
            <tr>
              <Th>Name</Th><Th>Role</Th><Th>Department</Th><Th>Organization</Th><Th>Participation</Th><Th>Date</Th><Th />
            </tr>
          </Thead>
          <tbody>
            {participants.map((p) => (
              <Tr key={p.id}>
                <Td className="font-medium">{p.name}</Td>
                <Td>{p.role_in_assessment ?? p.job_title ?? "—"}</Td>
                <Td>{p.department ?? "—"}</Td>
                <Td>{p.organization ?? "—"}</Td>
                <Td><Badge>{p.participation_type.replace(/_/g, " ")}</Badge></Td>
                <Td>{fmtDate(p.date_participated)}</Td>
                <Td>
                  {canEdit && (
                    <button onClick={() => startTransition(() => deleteParticipant(p.id, assessmentId))} className="text-slate-400 hover:text-red-600">
                      <Trash2 size={14} />
                    </button>
                  )}
                </Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      )}

      <div className="mt-6">
        <p className="mb-2 text-xs font-semibold text-slate-500">Session Evidence (attendance sheets, meeting minutes, invitations)</p>
        <EvidenceList evidence={evidence} profiles={profiles} canManage={canEdit} linkContext={{ assessment_id: assessmentId }} />
      </div>

      {open && <AddParticipantModal assessmentId={assessmentId} onClose={() => setOpen(false)} />}
    </SectionCard>
  );
}

function AddParticipantModal({ assessmentId, onClose }: { assessmentId: string; onClose: () => void }) {
  const [form, setForm] = useState({ name: "", job_title: "", department: "", organization: "", role_in_assessment: "", email: "", participation_type: "workshop" as ParticipationType, date_participated: "", comments: "" });
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function save() {
    setError(null);
    startTransition(async () => {
      try {
        await addParticipant(assessmentId, form);
        onClose();
      } catch (e) {
        setError((e as Error).message);
      }
    });
  }

  return (
    <Modal open onClose={onClose} title="Add Participant" wide>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Name" required><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
        <Field label="Job Title"><Input value={form.job_title} onChange={(e) => setForm({ ...form, job_title: e.target.value })} /></Field>
        <Field label="Department"><Input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} /></Field>
        <Field label="Organization"><Input value={form.organization} onChange={(e) => setForm({ ...form, organization: e.target.value })} /></Field>
        <Field label="Role in Assessment"><Input value={form.role_in_assessment} onChange={(e) => setForm({ ...form, role_in_assessment: e.target.value })} /></Field>
        <Field label="Email"><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
        <Field label="Participation Type">
          <Select value={form.participation_type} onChange={(e) => setForm({ ...form, participation_type: e.target.value as ParticipationType })}>
            {PARTICIPATION_TYPES.map((t) => <option key={t} value={t}>{t.replace(/_/g, " ")}</option>)}
          </Select>
        </Field>
        <Field label="Date Participated"><Input type="date" value={form.date_participated} onChange={(e) => setForm({ ...form, date_participated: e.target.value })} /></Field>
        <Field label="Comments" className="col-span-2"><Textarea value={form.comments} onChange={(e) => setForm({ ...form, comments: e.target.value })} /></Field>
      </div>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      <div className="mt-4 flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button onClick={save} disabled={pending || !form.name}>{pending ? "Saving…" : "Add Participant"}</Button>
      </div>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
export function AssetsPanel({ assessmentId, linkedAssets, allAssets, canEdit }: { assessmentId: string; linkedAssets: Asset[]; allAssets: Asset[]; canEdit: boolean }) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>(linkedAssets.map((a) => a.id));
  const [pending, startTransition] = useTransition();

  return (
    <SectionCard title="Linked Assets" subtitle="OT systems in scope for this assessment" action={canEdit && <Button size="sm" onClick={() => setOpen(true)}>Manage Assets</Button>}>
      {linkedAssets.length === 0 ? (
        <EmptyState title="No assets linked" />
      ) : (
        <Table>
          <Thead><tr><Th>Asset ID</Th><Th>Name</Th><Th>Type</Th><Th>Location</Th><Th>Criticality</Th></tr></Thead>
          <tbody>
            {linkedAssets.map((a) => (
              <Tr key={a.id}>
                <Td className="font-medium">{a.asset_code}</Td>
                <Td>{a.name}</Td>
                <Td>{a.asset_type.replace(/_/g, " ")}</Td>
                <Td>{a.location ?? "—"}</Td>
                <Td><Badge color={a.criticality === "Critical" ? "red" : a.criticality === "High" ? "amber" : "slate"}>{a.criticality}</Badge></Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      )}

      {open && (
        <Modal open onClose={() => setOpen(false)} title="Manage Linked Assets" wide>
          <div className="max-h-96 space-y-1 overflow-y-auto">
            {allAssets.map((a) => (
              <label key={a.id} className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={selected.includes(a.id)}
                  onChange={(e) => setSelected(e.target.checked ? [...selected, a.id] : selected.filter((id) => id !== a.id))}
                />
                <span className="font-mono text-xs text-slate-400">{a.asset_code}</span>
                {a.name} <span className="text-xs text-slate-400">({a.asset_type})</span>
              </label>
            ))}
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => startTransition(async () => { await setAssessmentAssets(assessmentId, selected); setOpen(false); })} disabled={pending}>
              {pending ? "Saving…" : "Save"}
            </Button>
          </div>
        </Modal>
      )}
    </SectionCard>
  );
}

// ---------------------------------------------------------------------------
export function RisksPanel({
  assessment, risks, reference, canEdit, categoryName, assetName, profileName,
}: {
  assessment: Assessment; risks: Risk[]; reference: ReferenceData; canEdit: boolean;
  categoryName: (id: string | null) => string; assetName: (id: string | null) => string; profileName: (id: string | null) => string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <SectionCard title="Risk Identification" subtitle="Risks identified for this assessment" action={canEdit && <Button size="sm" onClick={() => setOpen(true)}>+ Add Risk</Button>}>
      {risks.length === 0 ? (
        <EmptyState title="No risks identified yet" />
      ) : (
        <Table>
          <Thead>
            <tr><Th>Risk ID</Th><Th>Title</Th><Th>Category</Th><Th>Asset</Th><Th>Inherent</Th><Th>Residual</Th><Th>Treatment</Th><Th>Owner</Th></tr>
          </Thead>
          <tbody>
            {risks.map((r) => (
              <Tr key={r.id}>
                <Td><Link href={`/risks/${r.id}`} className="font-medium text-brand-600 hover:underline">{r.risk_code}</Link></Td>
                <Td className="max-w-xs truncate">{r.title}</Td>
                <Td>{categoryName(r.category_id)}</Td>
                <Td>{assetName(r.affected_asset_id)}</Td>
                <Td><RiskRatingBadge rating={ratingForScore(r.inherent_score)} score={r.inherent_score} size="sm" /></Td>
                <Td><RiskRatingBadge rating={ratingForScore(r.residual_score)} score={r.residual_score} size="sm" /></Td>
                <Td>{r.treatment ? <Badge>{r.treatment}</Badge> : <span className="text-xs text-slate-400">Pending</span>}</Td>
                <Td>{profileName(r.owner_id)}</Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      )}

      {open && <AddRiskModal assessmentId={assessment.id} reference={reference} onClose={() => setOpen(false)} />}
    </SectionCard>
  );
}

function AddRiskModal({ assessmentId, reference, onClose }: { assessmentId: string; reference: ReferenceData; onClose: () => void }) {
  const [form, setForm] = useState({
    title: "", cause: "", event: "", consequence_text: "", category_id: "", source: "", threat: "", vulnerability: "",
    consequence: "", affected_asset_id: "", affected_process: "", existing_controls_text: "", owner_id: "",
  });
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function save() {
    setError(null);
    startTransition(async () => {
      try {
        await addRisk(assessmentId, form);
        onClose();
      } catch (e) {
        setError((e as Error).message);
      }
    });
  }

  return (
    <Modal open onClose={onClose} title="Add Risk" wide>
      <div className="space-y-3">
        <Field label="Risk Title" required><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
        <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
          Risk statement: <em>Because of [Cause], there is a risk that [Event], resulting in [Consequence].</em>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Field label="Cause"><Textarea rows={2} value={form.cause} onChange={(e) => setForm({ ...form, cause: e.target.value })} /></Field>
          <Field label="Event"><Textarea rows={2} value={form.event} onChange={(e) => setForm({ ...form, event: e.target.value })} /></Field>
          <Field label="Consequence"><Textarea rows={2} value={form.consequence_text} onChange={(e) => setForm({ ...form, consequence_text: e.target.value })} /></Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Risk Category">
            <Select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}>
              <option value="">Select…</option>
              {reference.riskCategories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
          </Field>
          <Field label="Affected Asset">
            <Select value={form.affected_asset_id} onChange={(e) => setForm({ ...form, affected_asset_id: e.target.value })}>
              <option value="">Select…</option>
              {reference.assets.map((a) => <option key={a.id} value={a.id}>{a.asset_code} — {a.name}</option>)}
            </Select>
          </Field>
          <Field label="Threat"><Input value={form.threat} onChange={(e) => setForm({ ...form, threat: e.target.value })} /></Field>
          <Field label="Vulnerability"><Input value={form.vulnerability} onChange={(e) => setForm({ ...form, vulnerability: e.target.value })} /></Field>
          <Field label="Risk Source"><Input value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} /></Field>
          <Field label="Affected Process"><Input value={form.affected_process} onChange={(e) => setForm({ ...form, affected_process: e.target.value })} /></Field>
          <Field label="Risk Owner">
            <Select value={form.owner_id} onChange={(e) => setForm({ ...form, owner_id: e.target.value })}>
              <option value="">Select…</option>
              {reference.profiles.map((p) => <option key={p.id} value={p.id}>{p.full_name}</option>)}
            </Select>
          </Field>
        </div>
        <Field label="Existing Controls"><Textarea value={form.existing_controls_text} onChange={(e) => setForm({ ...form, existing_controls_text: e.target.value })} /></Field>
      </div>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      <div className="mt-4 flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button onClick={save} disabled={pending || !form.title}>{pending ? "Saving…" : "Add Risk"}</Button>
      </div>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
export function ControlsPanel({
  assessmentId, assessmentControls, risks, riskControlLinks, controlDef, profileName, controls, profiles, canEdit = true,
}: {
  assessmentId: string;
  assessmentControls: AssessmentControl[]; risks: Risk[]; riskControlLinks: { risk_id: string; assessment_control_id: string }[];
  controlDef: (id: string) => { name: string; control_code?: string } | undefined; profileName: (id: string | null) => string;
  controls: ReferenceData["controls"]; profiles: Profile[]; canEdit?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AssessmentControl | null>(null);

  return (
    <SectionCard
      title="Applicability & Control Assessment"
      subtitle="Applicable controls, implementation status and effectiveness"
      action={canEdit && <Button size="sm" onClick={() => setOpen(true)}>+ Assess Control</Button>}
    >
      {assessmentControls.length === 0 ? (
        <EmptyState title="No controls assessed yet" subtitle="Click “+ Assess Control” to evaluate a control from the catalog." />
      ) : (
        <Table>
          <Thead>
            <tr><Th>Control</Th><Th>Applicability</Th><Th>Implementation</Th><Th>Effectiveness</Th><Th>Owner</Th><Th>Linked Risks</Th><Th /></tr>
          </Thead>
          <tbody>
            {assessmentControls.map((c) => {
              const def = controlDef(c.control_id);
              const linkedRiskCodes = riskControlLinks.filter((l) => l.assessment_control_id === c.id).map((l) => risks.find((r) => r.id === l.risk_id)?.risk_code).filter(Boolean);
              return (
                <Tr key={c.id}>
                  <Td className="font-medium">{def?.name ?? c.control_id}</Td>
                  <Td>
                    <Badge color={c.applicability === "not_applicable" ? "slate" : c.applicability === "applicable" ? "green" : "amber"}>
                      {c.applicability.replace(/_/g, " ")}
                    </Badge>
                    {c.applicability === "not_applicable" && c.na_justification && (
                      <p className="mt-1 max-w-xs text-[11px] text-slate-400">{c.na_justification}</p>
                    )}
                  </Td>
                  <Td><Badge>{c.implementation_status.replace(/_/g, " ")}</Badge></Td>
                  <Td>
                    <Badge color={c.effectiveness === "effective" ? "green" : c.effectiveness === "ineffective" ? "red" : "amber"}>
                      {c.effectiveness.replace(/_/g, " ")}
                    </Badge>
                  </Td>
                  <Td>{profileName(c.control_owner_id)}</Td>
                  <Td className="text-xs text-slate-500">{linkedRiskCodes.join(", ") || "—"}</Td>
                  <Td>
                    {canEdit && (
                      <button onClick={() => setEditing(c)} className="text-xs font-medium text-brand-600 hover:underline">
                        Edit
                      </button>
                    )}
                  </Td>
                </Tr>
              );
            })}
          </tbody>
        </Table>
      )}

      {(open || editing) && (
        <AssessControlModal
          assessmentId={assessmentId}
          controls={controls}
          profiles={profiles}
          existing={editing}
          alreadyAssessedIds={assessmentControls.map((c) => c.control_id)}
          onClose={() => { setOpen(false); setEditing(null); }}
        />
      )}
    </SectionCard>
  );
}

function AssessControlModal({
  assessmentId, controls, profiles, existing, alreadyAssessedIds, onClose,
}: {
  assessmentId: string; controls: ReferenceData["controls"]; profiles: Profile[]; existing: AssessmentControl | null;
  alreadyAssessedIds: string[]; onClose: () => void;
}) {
  const [controlId, setControlId] = useState(existing?.control_id ?? "");
  const [applicability, setApplicability] = useState(existing?.applicability ?? "applicable");
  const [naJustification, setNaJustification] = useState(existing?.na_justification ?? "");
  const [implementation, setImplementation] = useState(existing?.implementation_status ?? "not_implemented");
  const [ownerId, setOwnerId] = useState(existing?.control_owner_id ?? "");
  const [evidenceAvailable, setEvidenceAvailable] = useState(existing?.evidence_available ?? false);
  const [evidenceRef, setEvidenceRef] = useState(existing?.evidence_reference ?? "");
  const [effectiveness, setEffectiveness] = useState(existing?.effectiveness ?? "not_tested");
  const [comments, setComments] = useState(existing?.comments ?? "");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const availableControls = existing ? controls : controls.filter((c) => !alreadyAssessedIds.includes(c.id));

  function save() {
    setError(null);
    startTransition(async () => {
      try {
        await upsertAssessmentControl(assessmentId, {
          id: existing?.id,
          control_id: controlId,
          applicability,
          na_justification: naJustification,
          implementation_status: implementation,
          control_owner_id: ownerId,
          evidence_available: evidenceAvailable,
          evidence_reference: evidenceRef,
          effectiveness,
          comments,
        });
        onClose();
      } catch (e) {
        setError((e as Error).message);
      }
    });
  }

  return (
    <Modal open onClose={onClose} title={existing ? "Update Control Assessment" : "Assess Control"} wide>
      <div className="space-y-3">
        <Field label="Control" required>
          <Select value={controlId} onChange={(e) => setControlId(e.target.value)} disabled={!!existing}>
            <option value="">Select…</option>
            {availableControls.map((c) => <option key={c.id} value={c.id}>{c.control_code} — {c.name}</option>)}
          </Select>
        </Field>
        <Field label="Applicability">
          <Select value={applicability} onChange={(e) => setApplicability(e.target.value as AssessmentControl["applicability"])}>
            <option value="applicable">Applicable</option>
            <option value="partially_applicable">Partially Applicable</option>
            <option value="not_applicable">Not Applicable</option>
          </Select>
        </Field>
        {applicability === "not_applicable" && (
          <Field label="N/A Justification" required hint="Required when marking a control Not Applicable.">
            <Textarea value={naJustification} onChange={(e) => setNaJustification(e.target.value)} />
          </Field>
        )}
        <div className="grid grid-cols-2 gap-3">
          <Field label="Implementation Status">
            <Select value={implementation} onChange={(e) => setImplementation(e.target.value as AssessmentControl["implementation_status"])}>
              <option value="implemented">Implemented</option>
              <option value="partially_implemented">Partially Implemented</option>
              <option value="not_implemented">Not Implemented</option>
              <option value="not_applicable">Not Applicable</option>
            </Select>
          </Field>
          <Field label="Control Owner">
            <Select value={ownerId} onChange={(e) => setOwnerId(e.target.value)}>
              <option value="">Select…</option>
              {profiles.map((p) => <option key={p.id} value={p.id}>{p.full_name}</option>)}
            </Select>
          </Field>
          <Field label="Effectiveness">
            <Select value={effectiveness} onChange={(e) => setEffectiveness(e.target.value as AssessmentControl["effectiveness"])}>
              <option value="effective">Effective</option>
              <option value="partially_effective">Partially Effective</option>
              <option value="ineffective">Ineffective</option>
              <option value="not_tested">Not Tested</option>
            </Select>
          </Field>
          <Field label="Evidence Available?">
            <Select value={evidenceAvailable ? "yes" : "no"} onChange={(e) => setEvidenceAvailable(e.target.value === "yes")}>
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </Select>
          </Field>
        </div>
        {evidenceAvailable && (
          <Field label="Evidence Reference"><Input value={evidenceRef} onChange={(e) => setEvidenceRef(e.target.value)} placeholder="File name or reference" /></Field>
        )}
        <Field label="Comments"><Textarea value={comments} onChange={(e) => setComments(e.target.value)} /></Field>
      </div>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      <div className="mt-4 flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button onClick={save} disabled={pending || !controlId || (applicability === "not_applicable" && !naJustification.trim())}>
          {pending ? "Saving…" : "Save"}
        </Button>
      </div>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
export function ApprovalsPanel({ assessment, approvals, currentProfile, profileName }: {
  assessment: Assessment; approvals: Approval[]; currentProfile: Profile; profileName: (id: string | null) => string;
}) {
  const [pending, startTransition] = useTransition();
  const [comments, setComments] = useState("");
  const [error, setError] = useState<string | null>(null);

  const step = APPROVAL_STEP_FOR_STATUS[assessment.status];
  const canDecide = step && (currentProfile.role === ROLE_FOR_STEP[step] || currentProfile.role === "administrator");

  function decide(action: "approve" | "reject" | "return_for_revision") {
    if (!step) return;
    setError(null);
    startTransition(async () => {
      try {
        await decideApproval(assessment.id, step, action, comments);
        setComments("");
      } catch (e) {
        setError((e as Error).message);
      }
    });
  }

  const stages = ["draft", "risk_manager_review", "process_owner_review", "approver_review", "completed"];
  const currentIdx = stages.indexOf(assessment.status === "in_progress" || assessment.status === "pending_approval" ? "draft" : assessment.status);

  return (
    <div className="space-y-4">
      <SectionCard title="Approval Workflow">
        <div className="mb-5 flex items-center gap-1">
          {stages.map((s, i) => (
            <div key={s} className="flex flex-1 items-center">
              <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${i <= currentIdx ? "bg-navy-900 text-white" : "bg-slate-200 text-slate-500"}`}>
                {i + 1}
              </div>
              {i < stages.length - 1 && <div className={`h-0.5 flex-1 ${i < currentIdx ? "bg-navy-900" : "bg-slate-200"}`} />}
            </div>
          ))}
        </div>
        <p className="mb-4 text-xs text-slate-500">
          Draft → Submitted → Risk Manager Review → Process Owner Review → Approver Review → Approved → Completed
        </p>

        {canDecide && (
          <div className="rounded-lg border border-brand-100 bg-brand-50 p-4">
            <p className="mb-2 text-xs font-semibold text-navy-900">Your review is required at this stage.</p>
            <Textarea placeholder="Comments (required for reject / return for revision)" value={comments} onChange={(e) => setComments(e.target.value)} />
            {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
            <div className="mt-3 flex gap-2">
              <Button size="sm" onClick={() => decide("approve")} disabled={pending}>Approve</Button>
              <Button size="sm" variant="secondary" onClick={() => decide("return_for_revision")} disabled={pending}>Return for Revision</Button>
              <Button size="sm" variant="danger" onClick={() => decide("reject")} disabled={pending}>Reject</Button>
            </div>
          </div>
        )}
      </SectionCard>

      <SectionCard title="Approval History">
        {approvals.length === 0 ? (
          <EmptyState title="No approval activity yet" />
        ) : (
          <ul className="space-y-3">
            {approvals.map((a) => (
              <li key={a.id} className="flex gap-3 text-sm">
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-brand-500" />
                <div>
                  <p className="text-slate-800">
                    <strong>{profileName(a.reviewer_id)}</strong> {a.action.replace(/_/g, " ")}d at <Badge>{a.step.replace(/_/g, " ")}</Badge>
                  </p>
                  {a.comments && <p className="text-xs text-slate-500">{a.comments}</p>}
                  <p className="text-[11px] text-slate-400">{fmtDateTime(a.decided_at)}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>
    </div>
  );
}

// ---------------------------------------------------------------------------
export function HistoryPanel({ auditLogs }: { auditLogs: AuditLog[] }) {
  return (
    <SectionCard title="Change History" subtitle="Full audit trail for this assessment and its risks/actions">
      {auditLogs.length === 0 ? (
        <EmptyState title="No changes recorded yet" />
      ) : (
        <Table>
          <Thead><tr><Th>Date</Th><Th>Object</Th><Th>Action</Th><Th>Field</Th><Th>Old Value</Th><Th>New Value</Th></tr></Thead>
          <tbody>
            {auditLogs.map((log) => (
              <Tr key={log.id}>
                <Td>{fmtDateTime(log.occurred_at)}</Td>
                <Td className="text-xs">{log.object_type}</Td>
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
  );
}
