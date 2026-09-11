"use client";

import { useTransition } from "react";
import { Table, Thead, Th, Td, Tr } from "@/components/ui/Table";
import { Select } from "@/components/ui/Form";
import { Badge } from "@/components/ui/Badge";
import { updateUserRole, toggleUserActive } from "@/lib/actions/admin";
import { USER_ROLES, type Profile, type UserRole } from "@/types/domain";

export function UsersTable({ users, currentUserId }: { users: Profile[]; currentUserId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <Table>
      <Thead><tr><Th>Name</Th><Th>Email</Th><Th>Job Title</Th><Th>Role</Th><Th>Status</Th></tr></Thead>
      <tbody>
        {users.map((u) => (
          <Tr key={u.id}>
            <Td className="font-medium">{u.full_name} {u.id === currentUserId && <span className="text-xs text-slate-400">(you)</span>}</Td>
            <Td className="text-xs text-slate-500">{u.email}</Td>
            <Td>{u.job_title ?? "—"}</Td>
            <Td>
              <Select
                value={u.role}
                disabled={pending || u.id === currentUserId}
                onChange={(e) => startTransition(() => updateUserRole(u.id, e.target.value as UserRole))}
                className="w-48"
              >
                {USER_ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
              </Select>
            </Td>
            <Td>
              <button onClick={() => startTransition(() => toggleUserActive(u.id, !u.is_active))} disabled={u.id === currentUserId}>
                <Badge color={u.is_active ? "green" : "slate"}>{u.is_active ? "Active" : "Disabled"}</Badge>
              </button>
            </Td>
          </Tr>
        ))}
      </tbody>
    </Table>
  );
}
