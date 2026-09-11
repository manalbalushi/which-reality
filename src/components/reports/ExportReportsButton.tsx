"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/Form";
import { downloadXlsx } from "@/lib/export/xlsx";
import type { VAction } from "@/types/domain";

export function ExportReportsButton({
  byBusiness, byAsset, byCategory, overdueActions,
}: {
  byBusiness: { label: string; count: number }[];
  byAsset: { label: string; count: number }[];
  byCategory: { label: string; count: number }[];
  overdueActions: VAction[];
}) {
  const [busy, setBusy] = useState(false);

  async function handleExport() {
    setBusy(true);
    try {
      await downloadXlsx(`ot-risk-reports-${new Date().toISOString().slice(0, 10)}.xlsx`, [
        { name: "Risk by Business Unit", columns: [{ header: "Business Unit", key: "label" }, { header: "Risks", key: "count" }], rows: byBusiness },
        { name: "Risk by Asset", columns: [{ header: "Asset", key: "label" }, { header: "Risks", key: "count" }], rows: byAsset },
        { name: "Risk by Category", columns: [{ header: "Category", key: "label" }, { header: "Risks", key: "count" }], rows: byCategory },
        {
          name: "Overdue Actions",
          columns: [
            { header: "Action ID", key: "action_code" }, { header: "Description", key: "description", width: 34 },
            { header: "Owner", key: "owner_name" }, { header: "Target Date", key: "target_date" }, { header: "Days Overdue", key: "days_overdue" },
          ],
          rows: overdueActions,
        },
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Button variant="secondary" size="sm" onClick={handleExport} disabled={busy}>
      <Download size={14} />
      {busy ? "Exporting…" : "Export Reports"}
    </Button>
  );
}
