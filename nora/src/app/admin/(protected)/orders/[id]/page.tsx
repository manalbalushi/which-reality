"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Order, OrderStatus } from "@/lib/types";
import { formatOMR } from "@/lib/format";
import { products } from "@/data/products";
import { packagingTypes } from "@/data/packaging";
import { recipients, styles } from "@/data/styles";
import { occasions } from "@/data/occasions";

const statusOptions: OrderStatus[] = [
  "New",
  "Confirmed",
  "Being Prepared",
  "Ready",
  "Out for Delivery",
  "Delivered",
  "Cancelled",
];

export default function AdminOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/orders/${params.id}`)
      .then((r) => r.json())
      .then(setOrder);
  }, [params.id]);

  if (!order) return <p className="text-sm text-charcoal-soft">Loading…</p>;

  const updateStatus = async (status: OrderStatus) => {
    setSaving(true);
    const res = await fetch(`/api/orders/${order.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const updated = await res.json();
    setOrder(updated);
    setSaving(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
        <div>
          <h1 className="font-serif text-2xl">{order.id}</h1>
          <p className="text-sm text-charcoal-soft">{new Date(order.createdAt).toLocaleString()}</p>
        </div>
        <select
          value={order.status}
          disabled={saving}
          onChange={(e) => updateStatus(e.target.value as OrderStatus)}
          className="border border-line rounded-full px-4 py-2 text-sm bg-cream"
        >
          {statusOptions.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="rounded-2xl border border-line p-5">
          <h2 className="font-serif text-lg mb-3">Customer</h2>
          <dl className="text-sm space-y-1.5">
            <Row label="Name" value={order.customer.fullName} />
            <Row label="Mobile" value={order.customer.mobile} />
            <Row label="Email" value={order.customer.email} />
            <Row label="Address" value={`${order.customer.address}, ${order.customer.area}, ${order.customer.city}`} />
          </dl>
        </div>

        <div className="rounded-2xl border border-line p-5">
          <h2 className="font-serif text-lg mb-3">Delivery & Payment</h2>
          <dl className="text-sm space-y-1.5">
            <Row label="Delivery Date" value={order.deliveryDate || "—"} />
            <Row label="Delivery Method" value={order.deliveryMethod} />
            <Row label="Delivery Region" value={order.deliveryRegion} />
            <Row label="Payment Method" value={order.paymentMethod} />
            <Row label="Is Gift" value={order.isGift ? "Yes — hide prices from recipient" : "No"} />
            <Row label="Gift Recipient" value={order.giftRecipientName || "—"} />
            <Row label="Gift Message" value={order.giftMessage || "—"} />
          </dl>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="font-serif text-lg mb-4">Items & Gift Selections</h2>
        <div className="space-y-4">
          {order.items.map((item) => {
            if (item.kind === "product") {
              const product = products.find((p) => p.id === item.productId);
              return (
                <div key={item.id} className="rounded-2xl border border-line p-5">
                  <p className="text-xs uppercase tracking-wider text-charcoal-soft mb-1">Direct Product</p>
                  <p className="font-medium">
                    {item.quantity}× {product?.name.en ?? item.productId}
                  </p>
                  <p className="text-sm text-charcoal-soft mt-1">
                    {formatOMR(item.unitPrice)} each · {formatOMR(item.unitPrice * item.quantity)} total
                  </p>
                </div>
              );
            }

            const packaging = packagingTypes.find((p) => p.id === item.packagingId);
            const recipient = recipients.find((r) => r.id === item.recipient);
            const occasion = occasions.find((o) => o.id === item.occasion);
            const style = styles.find((s) => s.id === item.style);

            return (
              <div key={item.id} className="rounded-2xl border border-line p-5">
                <p className="text-xs uppercase tracking-wider text-charcoal-soft mb-2">
                  Build Your Gift · Qty {item.quantity}
                </p>
                <dl className="grid sm:grid-cols-2 gap-x-8 gap-y-1.5 text-sm">
                  <Row label="Recipient" value={recipient?.name.en ?? item.recipient ?? "—"} />
                  <Row label="Occasion" value={occasion?.name.en ?? item.occasion ?? "—"} />
                  <Row label="Budget" value={item.budget ? `OMR ${item.budget}` : "—"} />
                  <Row label="Style" value={style?.name.en ?? item.style ?? "—"} />
                  <Row label="Packaging" value={packaging?.name.en ?? item.packagingId ?? "—"} />
                  <Row label="Total" value={formatOMR(item.unitPrice * item.quantity)} />
                </dl>

                <p className="text-xs uppercase tracking-wider text-charcoal-soft mt-4 mb-1.5">Products</p>
                <ul className="text-sm space-y-1">
                  {item.products?.map((line) => {
                    const p = products.find((pr) => pr.id === line.productId);
                    return (
                      <li key={line.productId}>
                        {line.quantity}× {p?.name.en ?? line.productId}
                      </li>
                    );
                  })}
                </ul>

                {item.personalization && (
                  <div className="mt-4 pt-4 border-t border-line text-sm space-y-1">
                    <p className="text-xs uppercase tracking-wider text-charcoal-soft mb-1.5">Personalization</p>
                    <Row label="Recipient Name" value={item.personalization.recipientName || "—"} />
                    <Row label="Message" value={item.personalization.message || "—"} />
                    <Row
                      label="Extras"
                      value={
                        [
                          item.personalization.greetingCard && "Greeting Card",
                          item.personalization.companyLogo && "Company Logo",
                          item.personalization.customRibbon && "Custom Ribbon",
                          item.personalization.personalizedTag && "Personalized Tag",
                        ]
                          .filter(Boolean)
                          .join(", ") || "None"
                      }
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-line p-5 max-w-sm ms-auto">
        <Row label="Subtotal" value={formatOMR(order.subtotal)} />
        <Row label="Delivery Fee" value={formatOMR(order.deliveryFee)} />
        <div className="flex justify-between mt-2 pt-2 border-t border-line">
          <span className="font-serif">Total</span>
          <span className="font-serif">{formatOMR(order.total)}</span>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-charcoal-soft shrink-0">{label}</dt>
      <dd className="text-end">{value}</dd>
    </div>
  );
}
