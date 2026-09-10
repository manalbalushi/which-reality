"use client";

import { useEffect, useState } from "react";
import { Packaging } from "@/lib/types";
import { formatOMR } from "@/lib/format";

const empty = { nameEn: "", nameAr: "", descriptionEn: "", price: "" };

export default function AdminPackagingPage() {
  const [items, setItems] = useState<Packaging[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(empty);
  const [open, setOpen] = useState(false);

  const load = () => fetch("/api/packaging").then((r) => r.json()).then((d) => { setItems(d); setLoading(false); });
  useEffect(() => { load(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: { en: form.nameEn, ar: form.nameAr || form.nameEn },
      description: { en: form.descriptionEn, ar: form.descriptionEn },
      price: Number(form.price) || 0,
    };
    if (editingId) {
      await fetch(`/api/packaging/${editingId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    } else {
      await fetch("/api/packaging", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    }
    setOpen(false);
    setForm(empty);
    setEditingId(null);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this packaging type?")) return;
    await fetch(`/api/packaging/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-3xl">Packaging</h1>
        <button
          onClick={() => { setForm(empty); setEditingId(null); setOpen((v) => !v); }}
          className="rounded-full bg-charcoal text-cream px-5 py-2.5 text-sm uppercase tracking-wider hover:bg-charcoal-soft"
        >
          {open ? "Cancel" : "Add Packaging"}
        </button>
      </div>

      {open && (
        <form onSubmit={submit} className="mb-8 rounded-2xl border border-line p-5 grid sm:grid-cols-2 gap-4">
          <label className="text-sm">
            <span className="block text-xs uppercase tracking-wider text-charcoal-soft mb-2">Name (English)</span>
            <input value={form.nameEn} onChange={(e) => setForm((f) => ({ ...f, nameEn: e.target.value }))} required className="w-full border border-line rounded-xl px-4 py-3 bg-cream" />
          </label>
          <label className="text-sm">
            <span className="block text-xs uppercase tracking-wider text-charcoal-soft mb-2">Name (Arabic)</span>
            <input value={form.nameAr} onChange={(e) => setForm((f) => ({ ...f, nameAr: e.target.value }))} className="w-full border border-line rounded-xl px-4 py-3 bg-cream" />
          </label>
          <label className="text-sm sm:col-span-2">
            <span className="block text-xs uppercase tracking-wider text-charcoal-soft mb-2">Description</span>
            <input value={form.descriptionEn} onChange={(e) => setForm((f) => ({ ...f, descriptionEn: e.target.value }))} className="w-full border border-line rounded-xl px-4 py-3 bg-cream" />
          </label>
          <label className="text-sm">
            <span className="block text-xs uppercase tracking-wider text-charcoal-soft mb-2">Price (OMR)</span>
            <input type="number" step="0.001" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} required className="w-full border border-line rounded-xl px-4 py-3 bg-cream" />
          </label>
          <button type="submit" className="sm:col-span-2 rounded-full bg-charcoal text-cream px-6 py-3 text-sm uppercase tracking-wider hover:bg-charcoal-soft w-fit">
            {editingId ? "Save Changes" : "Create Packaging"}
          </button>
        </form>
      )}

      {loading ? (
        <p className="text-sm text-charcoal-soft">Loading…</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((p) => (
            <div key={p.id} className="rounded-2xl border border-line p-4 flex items-center justify-between">
              <div>
                <p className="font-medium">{p.name.en}</p>
                <p className="text-xs text-charcoal-soft">{formatOMR(p.price)}</p>
              </div>
              <div className="flex gap-3 text-sm">
                <button
                  onClick={() => { setForm({ nameEn: p.name.en, nameAr: p.name.ar, descriptionEn: p.description.en, price: String(p.price) }); setEditingId(p.id); setOpen(true); }}
                  className="text-taupe hover:underline"
                >
                  Edit
                </button>
                <button onClick={() => remove(p.id)} className="text-red-700 hover:underline">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
