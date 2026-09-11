"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/Form";
import { downloadXlsx } from "@/lib/export/xlsx";
import type { VAction } from "@/types/domain";

export function ExportActionRegisterButton({ rows }: { rows: VAction[] }) {
  const [busy, setBusy] = useState(false);

  async function handleExport() {
    setBusy(true);
    try {
      await downloadXlsx(`action-register-${new Date().toISOString().slice(0, 10)}.xlsx`, [
        {
          name: "Action Register",
          columns: [
            { header: "Action ID", key: "action_code" },
            { header: "Risk ID", key: "risk_code" },
            { header: "Assessment ID", key: "assessment_code" },
            { header: "Description", key: "description", width: 34 },
            { header: "Owner", key: "owner_name" },
            { header: "Department", key: "department_name" },
            { header: "Priority", key: "priority" },
            { header: "Target Date", key: "target_date" },
            { header: "Status", key: "effective_status" },
            { header: "Completion Date", key: "completion_date" },
            { header: "Days Overdue", key: "days_overdue" },
          ],
          rows,
        },
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Button variant="secondary" size="sm" onClick={handleExport} disabled={busy}>
      <Download size={14} />
      {busy ? "Exporting…" : "Export Excel"}
    </Button>
  );
}
