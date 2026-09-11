"use client";

import { useState, useTransition } from "react";
import { Button, Input } from "@/components/ui/Form";
import { Badge } from "@/components/ui/Badge";
import { addReferenceItem, toggleReferenceItem } from "@/lib/actions/admin";

type Table = "departments" | "business_units" | "risk_categories" | "control_categories";

export function SimpleListEditor({ table, items }: { table: Table; items: { id: string; name: string; is_active?: boolean }[] }) {
  const [name, setName] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function add() {
    setError(null);
    startTransition(async () => {
      try {
        await addReferenceItem(table, name);
        setName("");
      } catch (e) {
        setError((e as Error).message);
      }
    });
  }

  return (
    <div>
      <ul className="mb-3 max-h-56 space-y-1 overflow-y-auto">
        {items.map((item) => (
          <li key={item.id} className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-slate-50">
            <span className={item.is_active === false ? "text-slate-400 line-through" : "text-slate-700"}>{item.name}</span>
            {"is_active" in item && (
              <button
                onClick={() => startTransition(() => toggleReferenceItem(table, item.id, !(item.is_active ?? true)))}
                className="text-xs"
              >
                <Badge color={item.is_active === false ? "slate" : "green"}>{item.is_active === false ? "Inactive" : "Active"}</Badge>
              </button>
            )}
          </li>
        ))}
      </ul>
      <div className="flex gap-2">
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="New item name" className="text-sm" />
        <Button size="sm" onClick={add} disabled={pending || !name.trim()}>Add</Button>
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
