"use client";

import { useEffect, useState } from "react";
import { Product, Category, Occasion, GiftStyle } from "@/lib/types";
import { formatOMR } from "@/lib/format";
import { styles as allStyles } from "@/data/styles";

const emptyForm = {
  nameEn: "",
  nameAr: "",
  descriptionEn: "",
  descriptionAr: "",
  price: "",
  category: "",
  stock: "20",
  featured: false,
  occasions: [] as string[],
  styles: [] as GiftStyle[],
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [occasions, setOccasions] = useState<Occasion[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [formOpen, setFormOpen] = useState(false);

  const load = () => {
    Promise.all([
      fetch("/api/products").then((r) => r.json()),
      fetch("/api/categories").then((r) => r.json()),
      fetch("/api/occasions").then((r) => r.json()),
    ]).then(([p, c, o]) => {
      setProducts(p);
      setCategories(c);
      setOccasions(o);
      setLoading(false);
    });
  };

  useEffect(load, []);

  const resetForm = () => {
    setForm({ ...emptyForm, category: categories[0]?.id ?? "" });
    setEditingId(null);
  };

  const openNew = () => {
    resetForm();
    setFormOpen(true);
  };

  const openEdit = (p: Product) => {
    setForm({
      nameEn: p.name.en,
      nameAr: p.name.ar,
      descriptionEn: p.description.en,
      descriptionAr: p.description.ar,
      price: String(p.price),
      category: p.category,
      stock: String(p.stock),
      featured: !!p.featured,
      occasions: p.occasions,
      styles: p.styles,
    });
    setEditingId(p.id);
    setFormOpen(true);
  };

  const toggleArr = <T,>(arr: T[], value: T): T[] =>
    arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: { en: form.nameEn, ar: form.nameAr },
      description: { en: form.descriptionEn, ar: form.descriptionAr },
      price: Number(form.price),
      category: form.category,
      stock: Number(form.stock),
      featured: form.featured,
      occasions: form.occasions,
      styles: form.styles,
    };
    if (editingId) {
      await fetch(`/api/products/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }
    setFormOpen(false);
    resetForm();
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-3xl">Products</h1>
        <button
          onClick={() => (formOpen ? setFormOpen(false) : openNew())}
          className="rounded-full bg-charcoal text-cream px-5 py-2.5 text-sm uppercase tracking-wider hover:bg-charcoal-soft"
        >
          {formOpen ? "Cancel" : "Add Product"}
        </button>
      </div>

      {formOpen && (
        <form onSubmit={submit} className="mb-8 rounded-2xl border border-line p-5 grid sm:grid-cols-2 gap-4">
          <Field label="Name (English)" value={form.nameEn} onChange={(v) => setForm((f) => ({ ...f, nameEn: v }))} required />
          <Field label="Name (Arabic)" value={form.nameAr} onChange={(v) => setForm((f) => ({ ...f, nameAr: v }))} />
          <Field
            label="Description (English)"
            value={form.descriptionEn}
            onChange={(v) => setForm((f) => ({ ...f, descriptionEn: v }))}
            className="sm:col-span-2"
          />
          <Field
            label="Description (Arabic)"
            value={form.descriptionAr}
            onChange={(v) => setForm((f) => ({ ...f, descriptionAr: v }))}
            className="sm:col-span-2"
          />
          <Field label="Price (OMR)" type="number" value={form.price} onChange={(v) => setForm((f) => ({ ...f, price: v }))} required />
          <Field label="Stock" type="number" value={form.stock} onChange={(v) => setForm((f) => ({ ...f, stock: v }))} />

          <label className="text-sm">
            <span className="block text-xs uppercase tracking-wider text-charcoal-soft mb-2">Category</span>
            <select
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              className="w-full border border-line rounded-xl px-4 py-3 bg-cream"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name.en}</option>
              ))}
            </select>
          </label>

          <label className="flex items-center gap-2 text-sm mt-7">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))}
              className="w-4 h-4"
            />
            Featured on homepage
          </label>

          <div className="sm:col-span-2">
            <p className="text-xs uppercase tracking-wider text-charcoal-soft mb-2">Occasions</p>
            <div className="flex flex-wrap gap-2">
              {occasions.map((o) => (
                <button
                  type="button"
                  key={o.id}
                  onClick={() => setForm((f) => ({ ...f, occasions: toggleArr(f.occasions, o.id) }))}
                  className={`px-3 py-1.5 rounded-full text-xs border ${
                    form.occasions.includes(o.id) ? "bg-charcoal text-cream border-charcoal" : "border-line"
                  }`}
                >
                  {o.name.en}
                </button>
              ))}
            </div>
          </div>

          <div className="sm:col-span-2">
            <p className="text-xs uppercase tracking-wider text-charcoal-soft mb-2">Styles</p>
            <div className="flex flex-wrap gap-2">
              {allStyles.map((s) => (
                <button
                  type="button"
                  key={s.id}
                  onClick={() => setForm((f) => ({ ...f, styles: toggleArr(f.styles, s.id) }))}
                  className={`px-3 py-1.5 rounded-full text-xs border ${
                    form.styles.includes(s.id) ? "bg-charcoal text-cream border-charcoal" : "border-line"
                  }`}
                >
                  {s.name.en}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="sm:col-span-2 rounded-full bg-charcoal text-cream px-6 py-3 text-sm uppercase tracking-wider hover:bg-charcoal-soft w-fit"
          >
            {editingId ? "Save Changes" : "Create Product"}
          </button>
        </form>
      )}

      {loading ? (
        <p className="text-sm text-charcoal-soft">Loading…</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line">
          <table className="w-full text-sm">
            <thead className="bg-ivory text-charcoal-soft text-xs uppercase tracking-wider">
              <tr>
                <th className="text-start px-4 py-3">Name</th>
                <th className="text-start px-4 py-3">Category</th>
                <th className="text-start px-4 py-3">Price</th>
                <th className="text-start px-4 py-3">Stock</th>
                <th className="text-start px-4 py-3">Featured</th>
                <th className="text-start px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-t border-line">
                  <td className="px-4 py-3">{p.name.en}</td>
                  <td className="px-4 py-3 text-charcoal-soft">
                    {categories.find((c) => c.id === p.category)?.name.en ?? p.category}
                  </td>
                  <td className="px-4 py-3">{formatOMR(p.price)}</td>
                  <td className="px-4 py-3">{p.stock}</td>
                  <td className="px-4 py-3">{p.featured ? "Yes" : "—"}</td>
                  <td className="px-4 py-3 text-end">
                    <button onClick={() => openEdit(p)} className="text-taupe hover:underline me-3">
                      Edit
                    </button>
                    <button onClick={() => remove(p.id)} className="text-red-700 hover:underline">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  className?: string;
}) {
  return (
    <label className={`text-sm ${className}`}>
      <span className="block text-xs uppercase tracking-wider text-charcoal-soft mb-2">{label}</span>
      <input
        type={type}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-line rounded-xl px-4 py-3 bg-cream outline-none focus:border-charcoal"
      />
    </label>
  );
}
