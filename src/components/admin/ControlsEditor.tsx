"use client";

import { useState, useTransition } from "react";
import { Button, Field, Input, Select, Textarea } from "@/components/ui/Form";
import { Badge } from "@/components/ui/Badge";
import { Table, Thead, Th, Td, Tr } from "@/components/ui/Table";
import { addControl, toggleControl } from "@/lib/actions/admin";
import type { ControlCategory, ControlDef } from "@/types/domain";

export function ControlsEditor({ controls, categories }: { controls: ControlDef[]; categories: ControlCategory[] }) {
  const [form, setForm] = useState({ control_code: "", name: "", description: "", category_id: "" });
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function add() {
    setError(null);
    startTransition(async () => {
      try {
        await addControl(form);
        setForm({ control_code: "", name: "", description: "", category_id: "" });
      } catch (e) {
        setError((e as Error).message);
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
        <Field label="Control Code"><Input value={form.control_code} onChange={(e) => setForm({ ...form, control_code: e.target.value })} placeholder="CTRL-019" /></Field>
        <Field label="Name" className="sm:col-span-2"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
        <Field label="Category">
          <Select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}>
            <option value="">Select…</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
        </Field>
        <Field label="Description" className="sm:col-span-4"><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} /></Field>
      </div>
      <Button size="sm" onClick={add} disabled={pending || !form.control_code || !form.name}>{pending ? "Adding…" : "+ Add Control"}</Button>
      {error && <p className="text-xs text-red-600">{error}</p>}

      <Table>
        <Thead><tr><Th>Code</Th><Th>Name</Th><Th>Category</Th><Th>Status</Th></tr></Thead>
        <tbody>
          {controls.map((c) => (
            <Tr key={c.id}>
              <Td className="font-mono text-xs">{c.control_code}</Td>
              <Td>{c.name}</Td>
              <Td>{categories.find((cat) => cat.id === c.category_id)?.name ?? "—"}</Td>
              <Td>
                <button onClick={() => startTransition(() => toggleControl(c.id, !c.is_active))}>
                  <Badge color={c.is_active ? "green" : "slate"}>{c.is_active ? "Active" : "Inactive"}</Badge>
                </button>
              </Td>
            </Tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}
