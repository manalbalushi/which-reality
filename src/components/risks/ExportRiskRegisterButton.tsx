"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/Form";
import { downloadXlsx } from "@/lib/export/xlsx";
import type { VRisk } from "@/types/domain";

export function ExportRiskRegisterButton({ rows }: { rows: VRisk[] }) {
  const [busy, setBusy] = useState(false);

  async function handleExport() {
    setBusy(true);
    try {
      await downloadXlsx(`risk-register-${new Date().toISOString().slice(0, 10)}.xlsx`, [
        {
          name: "Risk Register",
          columns: [
            { header: "Risk ID", key: "risk_code" },
            { header: "Assessment ID", key: "assessment_code" },
            { header: "Assessment Name", key: "assessment_title", width: 30 },
            { header: "Risk Title", key: "risk_title", width: 30 },
            { header: "Asset", key: "asset_name" },
            { header: "Category", key: "category_name" },
            { header: "Inherent Score", key: "inherent_score" },
            { header: "Inherent Rating", key: "inherent_rating" },
            { header: "Residual Score", key: "residual_score" },
            { header: "Residual Rating", key: "residual_rating" },
            { header: "Treatment", key: "treatment" },
            { header: "Risk Owner", key: "owner_name" },
            { header: "Business Unit", key: "business_unit_name" },
            { header: "Status", key: "status" },
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
