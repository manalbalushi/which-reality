"use client";

import { downloadXlsx, downloadBlob } from "@/lib/export/xlsx";
import { ratingForScore } from "@/lib/risk";
import type {
  ActionItem,
  Approval,
  Asset,
  AssessmentControl,
  AssessmentParticipant,
  Evidence,
  Profile,
  Risk,
} from "@/types/domain";

export interface AssessmentExportBundle {
  assessment: Record<string, unknown> & { assessment_code: string; title: string };
  participants: AssessmentParticipant[];
  assets: Asset[];
  risks: Risk[];
  assessmentControls: (AssessmentControl & { control_name?: string })[];
  actions: ActionItem[];
  evidence: Evidence[];
  approvals: Approval[];
  profiles: Profile[];
}

function name(profiles: Profile[], id: string | null) {
  return profiles.find((p) => p.id === id)?.full_name ?? "—";
}

export async function exportAssessmentExcel(bundle: AssessmentExportBundle) {
  const { assessment, participants, assets, risks, assessmentControls, actions, evidence, approvals, profiles } = bundle;

  await downloadXlsx(`${assessment.assessment_code}-${assessment.title}.xlsx`.replace(/[^a-zA-Z0-9._-]/g, "_"), [
    {
      name: "Assessment",
      columns: Object.keys(assessment).map((k) => ({ header: k.replace(/_/g, " "), key: k, width: 26 })),
      rows: [assessment],
    },
    {
      name: "Participants",
      columns: [
        { header: "Name", key: "name" }, { header: "Job Title", key: "job_title" }, { header: "Department", key: "department" },
        { header: "Organization", key: "organization" }, { header: "Role", key: "role_in_assessment" },
        { header: "Email", key: "email" }, { header: "Participation Type", key: "participation_type" }, { header: "Date", key: "date_participated" },
      ],
      rows: participants,
    },
    {
      name: "Assets",
      columns: [
        { header: "Asset ID", key: "asset_code" }, { header: "Name", key: "name" }, { header: "Type", key: "asset_type" },
        { header: "System", key: "system_name" }, { header: "Location", key: "location" }, { header: "Criticality", key: "criticality" },
      ],
      rows: assets,
    },
    {
      name: "Risks",
      columns: [
        { header: "Risk ID", key: "risk_code" }, { header: "Title", key: "title", width: 30 }, { header: "Risk Statement", key: "risk_statement", width: 40 },
        { header: "Inherent Likelihood", key: "inherent_likelihood" }, { header: "Inherent Impact", key: "inherent_impact" },
        { header: "Inherent Score", key: "inherent_score" }, { header: "Inherent Rating", key: "inherent_rating" },
        { header: "Residual Likelihood", key: "residual_likelihood" }, { header: "Residual Impact", key: "residual_impact" },
        { header: "Residual Score", key: "residual_score" }, { header: "Residual Rating", key: "residual_rating" },
        { header: "Treatment", key: "treatment" }, { header: "Owner", key: "owner" },
      ],
      rows: risks.map((r) => ({
        ...r,
        inherent_rating: ratingForScore(r.inherent_score) ?? "",
        residual_rating: ratingForScore(r.residual_score) ?? "",
        owner: name(profiles, r.owner_id),
      })),
    },
    {
      name: "Controls",
      columns: [
        { header: "Control", key: "control_name", width: 30 }, { header: "Applicability", key: "applicability" },
        { header: "N/A Justification", key: "na_justification", width: 30 }, { header: "Implementation", key: "implementation_status" },
        { header: "Effectiveness", key: "effectiveness" }, { header: "Evidence Available", key: "evidence_available" }, { header: "Comments", key: "comments", width: 30 },
      ],
      rows: assessmentControls,
    },
    {
      name: "Actions",
      columns: [
        { header: "Action ID", key: "action_code" }, { header: "Description", key: "description", width: 34 }, { header: "Owner", key: "owner" },
        { header: "Priority", key: "priority" }, { header: "Target Date", key: "target_date" }, { header: "Status", key: "status" }, { header: "Completion Date", key: "completion_date" },
      ],
      rows: actions.map((a) => ({ ...a, owner: name(profiles, a.owner_id) })),
    },
    {
      name: "Evidence",
      columns: [
        { header: "Evidence ID", key: "evidence_code" }, { header: "File", key: "file_name", width: 30 }, { header: "Type", key: "evidence_type" },
        { header: "Description", key: "description", width: 30 }, { header: "Uploaded By", key: "uploaded_by_name" }, { header: "Date", key: "upload_date" },
      ],
      rows: evidence.map((e) => ({ ...e, uploaded_by_name: name(profiles, e.uploaded_by) })),
    },
    {
      name: "Approvals",
      columns: [
        { header: "Step", key: "step" }, { header: "Reviewer", key: "reviewer" }, { header: "Action", key: "action" },
        { header: "Comments", key: "comments", width: 34 }, { header: "Date", key: "decided_at" },
      ],
      rows: approvals.map((a) => ({ ...a, reviewer: name(profiles, a.reviewer_id) })),
    },
  ]);
}

export async function exportAssessmentPdf(bundle: AssessmentExportBundle) {
  const { jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;
  const { assessment, participants, assets, risks, assessmentControls, actions, evidence, approvals, profiles } = bundle;

  const doc = new jsPDF({ unit: "pt" });
  const navy: [number, number, number] = [15, 36, 68];
  let y = 40;

  doc.setFontSize(18);
  doc.setTextColor(...navy);
  doc.text("OT Risk Management", 40, y);
  y += 22;
  doc.setFontSize(13);
  doc.setTextColor(20, 20, 20);
  doc.text(`${assessment.assessment_code} — ${assessment.title}`, 40, y);
  y += 16;
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated ${new Date().toLocaleString()}`, 40, y);
  y += 20;

  function section(title: string) {
    doc.setFontSize(11);
    doc.setTextColor(...navy);
    doc.text(title, 40, y);
    y += 6;
  }

  section("Assessment Information");
  autoTable(doc, {
    startY: y,
    theme: "grid",
    styles: { fontSize: 8 },
    headStyles: { fillColor: navy },
    body: [
      ["Type", String(assessment.type ?? "")],
      ["Status", String(assessment.status ?? "")],
      ["Owner", String(assessment.assessment_owner_id ? name(profiles, assessment.assessment_owner_id as string) : "")],
      ["Assessment Date", String(assessment.assessment_date ?? "")],
      ["Due Date", String(assessment.due_date ?? "")],
      ["Description", String(assessment.description ?? "")],
      ["Objective", String(assessment.objective ?? "")],
      ["Scope (In)", String(assessment.scope_in ?? "")],
      ["Scope (Out)", String(assessment.scope_out ?? "")],
    ],
  });
  // @ts-expect-error autoTable augments doc at runtime
  y = doc.lastAutoTable.finalY + 20;

  section("Participants");
  autoTable(doc, {
    startY: y,
    head: [["Name", "Role", "Department", "Participation"]],
    body: participants.map((p) => [p.name, p.role_in_assessment ?? "", p.department ?? "", p.participation_type]),
    styles: { fontSize: 8 },
    headStyles: { fillColor: navy },
  });
  // @ts-expect-error autoTable augments doc at runtime
  y = doc.lastAutoTable.finalY + 20;

  section("Assets");
  autoTable(doc, {
    startY: y,
    head: [["Asset ID", "Name", "Type", "Criticality"]],
    body: assets.map((a) => [a.asset_code, a.name, a.asset_type, a.criticality]),
    styles: { fontSize: 8 },
    headStyles: { fillColor: navy },
  });
  // @ts-expect-error autoTable augments doc at runtime
  y = doc.lastAutoTable.finalY + 20;

  doc.addPage();
  y = 40;
  section("Risk Register");
  autoTable(doc, {
    startY: y,
    head: [["Risk ID", "Title", "Inherent", "Residual", "Treatment", "Owner"]],
    body: risks.map((r) => [
      r.risk_code,
      r.title,
      `${r.inherent_score ?? "-"} ${ratingForScore(r.inherent_score) ?? ""}`,
      `${r.residual_score ?? "-"} ${ratingForScore(r.residual_score) ?? ""}`,
      r.treatment ?? "",
      name(profiles, r.owner_id),
    ]),
    styles: { fontSize: 8 },
    headStyles: { fillColor: navy },
    columnStyles: { 1: { cellWidth: 140 } },
  });
  // @ts-expect-error autoTable augments doc at runtime
  y = doc.lastAutoTable.finalY + 20;

  section("Control Assessment");
  autoTable(doc, {
    startY: y,
    head: [["Control", "Applicability", "Implementation", "Effectiveness"]],
    body: assessmentControls.map((c) => [c.control_name ?? c.control_id, c.applicability, c.implementation_status, c.effectiveness]),
    styles: { fontSize: 8 },
    headStyles: { fillColor: navy },
  });
  // @ts-expect-error autoTable augments doc at runtime
  y = doc.lastAutoTable.finalY + 20;

  doc.addPage();
  y = 40;
  section("Mitigation Actions");
  autoTable(doc, {
    startY: y,
    head: [["Action ID", "Description", "Owner", "Priority", "Target Date", "Status"]],
    body: actions.map((a) => [a.action_code, a.description, name(profiles, a.owner_id), a.priority, a.target_date, a.status]),
    styles: { fontSize: 8 },
    headStyles: { fillColor: navy },
    columnStyles: { 1: { cellWidth: 160 } },
  });
  // @ts-expect-error autoTable augments doc at runtime
  y = doc.lastAutoTable.finalY + 20;

  section("Evidence Register");
  autoTable(doc, {
    startY: y,
    head: [["Evidence ID", "File", "Type", "Uploaded By", "Date"]],
    body: evidence.map((e) => [e.evidence_code, e.file_name, e.evidence_type, name(profiles, e.uploaded_by), e.upload_date?.slice(0, 10) ?? ""]),
    styles: { fontSize: 8 },
    headStyles: { fillColor: navy },
  });
  // @ts-expect-error autoTable augments doc at runtime
  y = doc.lastAutoTable.finalY + 20;

  section("Approval History");
  autoTable(doc, {
    startY: y,
    head: [["Step", "Reviewer", "Action", "Comments", "Date"]],
    body: approvals.map((a) => [a.step, name(profiles, a.reviewer_id), a.action, a.comments ?? "", new Date(a.decided_at).toLocaleDateString()]),
    styles: { fontSize: 8 },
    headStyles: { fillColor: navy },
  });

  downloadBlob(doc.output("blob"), `${assessment.assessment_code}.pdf`);
}
