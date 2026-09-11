"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/Form";
import { downloadXlsx } from "@/lib/export/xlsx";
import type { VAssessmentInventory } from "@/types/domain";

export function ExportAssessmentInventoryButton({ rows }: { rows: VAssessmentInventory[] }) {
  const [busy, setBusy] = useState(false);

  async function handleExport() {
    setBusy(true);
    try {
      await downloadXlsx(`assessment-inventory-${new Date().toISOString().slice(0, 10)}.xlsx`, [
        {
          name: "Assessment Inventory",
          columns: [
            { header: "Assessment ID", key: "assessment_code" },
            { header: "Title", key: "title", width: 34 },
            { header: "Type", key: "type" },
            { header: "Asset", key: "asset_name" },
            { header: "Business", key: "business_unit_name" },
            { header: "Owner", key: "owner_name" },
            { header: "Assessment Date", key: "assessment_date" },
            { header: "Completion Date", key: "completion_date" },
            { header: "Risks", key: "risk_count" },
            { header: "Highest Risk", key: "highest_risk_rating" },
            { header: "Status", key: "status" },
          ],
          rows: rows.map((r) => ({ ...r, status: r.status.replace(/_/g, " ") })),
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
