"use client";

import { useTransition } from "react";
import { SectionCard } from "@/components/ui/Card";
import { Table, Thead, Th, Td, Tr } from "@/components/ui/Table";
import { Button } from "@/components/ui/Form";
import { fmtDate } from "@/lib/format";
import { decideExtension } from "@/lib/actions/assessments";
import type { ActionExtension, VAction } from "@/types/domain";

export function ExtensionRequestsPanel({
  extensions, actions, canDecide,
}: {
  extensions: ActionExtension[]; actions: VAction[]; canDecide: boolean;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <SectionCard title="Pending Target Date Extension Requests" subtitle="Requires Risk Manager / Approver decision">
      <Table>
        <Thead><tr><Th>Action</Th><Th>Current Date</Th><Th>Requested Date</Th><Th>Reason</Th>{canDecide && <Th>Decision</Th>}</tr></Thead>
        <tbody>
          {extensions.map((ext) => {
            const action = actions.find((a) => a.id === ext.action_id);
            return (
              <Tr key={ext.id}>
                <Td className="font-medium">{action?.action_code ?? ext.action_id}</Td>
                <Td>{fmtDate(ext.current_target_date)}</Td>
                <Td>{fmtDate(ext.requested_target_date)}</Td>
                <Td className="max-w-xs truncate">{ext.reason}</Td>
                {canDecide && (
                  <Td>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => startTransition(() => decideExtension(ext.id, "approved"))} disabled={pending}>Approve</Button>
                      <Button size="sm" variant="danger" onClick={() => startTransition(() => decideExtension(ext.id, "rejected"))} disabled={pending}>Reject</Button>
                    </div>
                  </Td>
                )}
              </Tr>
            );
          })}
        </tbody>
      </Table>
    </SectionCard>
  );
}
