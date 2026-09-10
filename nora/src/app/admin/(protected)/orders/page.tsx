"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Order, OrderStatus } from "@/lib/types";
import { formatOMR } from "@/lib/format";

const statuses: (OrderStatus | "All")[] = [
  "All",
  "New",
  "Confirmed",
  "Being Prepared",
  "Ready",
  "Out for Delivery",
  "Delivered",
  "Cancelled",
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<OrderStatus | "All">("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/orders")
      .then((r) => r.json())
      .then((data) => {
        setOrders(data);
        setLoading(false);
      });
  }, []);

  const visible = filter === "All" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div>
      <h1 className="font-serif text-3xl mb-6">Orders</h1>

      <div className="flex flex-wrap gap-2 mb-6">
        {statuses.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`rounded-full border px-4 py-1.5 text-xs transition-colors ${
              filter === s ? "bg-charcoal text-cream border-charcoal" : "border-line hover:bg-beige"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-charcoal-soft">Loading…</p>
      ) : visible.length === 0 ? (
        <p className="text-sm text-charcoal-soft">No orders found.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line">
          <table className="w-full text-sm">
            <thead className="bg-ivory text-charcoal-soft text-xs uppercase tracking-wider">
              <tr>
                <th className="text-start px-4 py-3">Order</th>
                <th className="text-start px-4 py-3">Date</th>
                <th className="text-start px-4 py-3">Customer</th>
                <th className="text-start px-4 py-3">Items</th>
                <th className="text-start px-4 py-3">Status</th>
                <th className="text-start px-4 py-3">Total</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((o) => (
                <tr key={o.id} className="border-t border-line hover:bg-ivory/60">
                  <td className="px-4 py-3">
                    <Link href={`/admin/orders/${o.id}`} className="hover:text-taupe font-medium">
                      {o.id}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-charcoal-soft">
                    {new Date(o.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">{o.customer.fullName}</td>
                  <td className="px-4 py-3">{o.items.reduce((s, i) => s + i.quantity, 0)}</td>
                  <td className="px-4 py-3">
                    <span className="px-2.5 py-1 rounded-full bg-beige text-xs">{o.status}</span>
                  </td>
                  <td className="px-4 py-3">{formatOMR(o.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
