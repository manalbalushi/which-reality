"use client";

import { useState, useTransition } from "react";
import { FileText, Download, Trash2, Upload } from "lucide-react";
import { Table, Thead, Th, Td, Tr, EmptyState } from "@/components/ui/Table";
import { Button, Field, Input, Select, Textarea } from "@/components/ui/Form";
import { Modal } from "@/components/ui/Modal";
import { fmtDate } from "@/lib/format";
import { uploadEvidence, deleteEvidence, getEvidenceDownloadUrl } from "@/lib/actions/assessments";
import type { Evidence, Profile } from "@/types/domain";

const EVIDENCE_TYPES = [
  "Document", "Report", "Configuration Export", "Meeting Minutes", "Attendance Sheet",
  "Email", "Screenshot", "Image", "Spreadsheet", "Other",
];

type LinkContext = { assessment_id?: string; risk_id?: string; action_id?: string; participant_id?: string };

export function EvidenceList({
  evidence,
  profiles,
  canManage = true,
  linkContext,
}: {
  evidence: Evidence[];
  profiles: Profile[];
  canManage?: boolean;
  linkContext?: LinkContext;
}) {
  const [uploadOpen, setUploadOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function uploaderName(id: string | null) {
    return profiles.find((p) => p.id === id)?.full_name ?? "—";
  }

  async function handleDownload(path: string) {
    const url = await getEvidenceDownloadUrl(path);
    window.open(url, "_blank");
  }

  function handleDelete(id: string) {
    if (!confirm("Remove this evidence item?")) return;
    startTransition(() => deleteEvidence(id, linkContext?.assessment_id));
  }

  return (
    <div>
      {canManage && (
        <div className="mb-3 flex justify-end">
          <Button size="sm" onClick={() => setUploadOpen(true)}>
            <Upload size={14} />
            Upload Evidence
          </Button>
        </div>
      )}

      {evidence.length === 0 ? (
        <EmptyState title="No evidence uploaded" subtitle="Attach configuration exports, reports, meeting minutes and more." />
      ) : (
        <Table>
          <Thead>
            <tr>
              <Th>Evidence ID</Th>
              <Th>File</Th>
              <Th>Type</Th>
              <Th>Description</Th>
              <Th>Uploaded By</Th>
              <Th>Date</Th>
              <Th />
            </tr>
          </Thead>
          <tbody>
            {evidence.map((e) => (
              <Tr key={e.id}>
                <Td className="font-medium">{e.evidence_code}</Td>
                <Td>
                  <span className="flex items-center gap-1.5">
                    <FileText size={14} className="text-slate-400" />
                    {e.file_name}
                  </span>
                </Td>
                <Td>{e.evidence_type}</Td>
                <Td className="max-w-xs truncate">{e.description ?? "—"}</Td>
                <Td>{uploaderName(e.uploaded_by)}</Td>
                <Td>{fmtDate(e.upload_date)}</Td>
                <Td>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleDownload(e.storage_path)} className="text-slate-400 hover:text-brand-600" title="Download">
                      <Download size={15} />
                    </button>
                    {canManage && (
                      <button onClick={() => handleDelete(e.id)} disabled={pending} className="text-slate-400 hover:text-red-600" title="Remove">
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      )}

      {uploadOpen && <UploadModal onClose={() => setUploadOpen(false)} linkContext={linkContext} />}
    </div>
  );
}

function UploadModal({ onClose, linkContext }: { onClose: () => void; linkContext?: LinkContext }) {
  const [file, setFile] = useState<File | null>(null);
  const [evidenceType, setEvidenceType] = useState("Document");
  const [description, setDescription] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleUpload() {
    if (!file) return;
    setError(null);
    const fd = new FormData();
    fd.set("file", file);
    fd.set("evidence_type", evidenceType);
    fd.set("description", description);
    if (linkContext?.assessment_id) fd.set("assessment_id", linkContext.assessment_id);
    if (linkContext?.risk_id) fd.set("risk_id", linkContext.risk_id);
    if (linkContext?.action_id) fd.set("action_id", linkContext.action_id);
    if (linkContext?.participant_id) fd.set("participant_id", linkContext.participant_id);

    startTransition(async () => {
      try {
        await uploadEvidence(fd);
        onClose();
      } catch (e) {
        setError((e as Error).message);
      }
    });
  }

  return (
    <Modal open onClose={onClose} title="Upload Evidence">
      <div className="space-y-3">
        <Field label="File" required>
          <Input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        </Field>
        <Field label="Evidence Type">
          <Select value={evidenceType} onChange={(e) => setEvidenceType(e.target.value)}>
            {EVIDENCE_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </Select>
        </Field>
        <Field label="Description">
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What does this evidence demonstrate?" />
        </Field>
        {error && <p className="text-xs text-red-600">{error}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleUpload} disabled={pending || !file}>{pending ? "Uploading…" : "Upload"}</Button>
        </div>
      </div>
    </Modal>
  );
}
