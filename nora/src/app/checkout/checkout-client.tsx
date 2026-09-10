"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart-context";
import { useLocale } from "@/lib/locale-context";
import { formatOMR } from "@/lib/format";
import { getDeliveryFee, omanCities, DeliveryMethod, DeliveryRegion } from "@/lib/delivery";
import { LinkButton } from "@/components/button";
import { Order } from "@/lib/types";

const paymentOptions: Order["paymentMethod"][] = [
  "Card",
  "Apple Pay",
  "Online Payment",
  "Cash on Delivery",
];

export function CheckoutClient() {
  const { items, subtotal, clear } = useCart();
  const { t, locale } = useLocale();

  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [area, setArea] = useState("");
  const [city, setCity] = useState(omanCities[0]);
  const [deliveryDate, setDeliveryDate] = useState("");
  const [giftRecipientName, setGiftRecipientName] = useState("");
  const [giftMessage, setGiftMessage] = useState("");
  const [isGift, setIsGift] = useState(true);
  const [deliveryRegion, setDeliveryRegion] = useState<DeliveryRegion>("Muscat");
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("Standard");
  const [paymentMethod, setPaymentMethod] = useState<Order["paymentMethod"]>("Card");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  const deliveryFee = getDeliveryFee(deliveryMethod, deliveryRegion);
  const total = subtotal + deliveryFee;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: { fullName, mobile, email, address, area, city },
          items,
          isGift,
          deliveryDate,
          deliveryMethod,
          deliveryRegion,
          giftRecipientName,
          giftMessage,
          paymentMethod,
          subtotal,
          deliveryFee,
          total,
        }),
      });
      if (!res.ok) throw new Error("Failed to place order");
      const order = (await res.json()) as Order;
      setConfirmedOrder(order);
      clear();
    } catch {
      setError(locale === "ar" ? "حدث خطأ، حاولي مرة أخرى." : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (confirmedOrder) {
    return (
      <div className="container-nora py-24 text-center max-w-lg mx-auto">
        <h1 className="font-serif text-3xl">{t("order_confirmed")}</h1>
        <p className="mt-3 text-charcoal-soft">{t("order_confirmed_sub")}</p>
        <p className="mt-6 text-sm text-charcoal-soft">
          {locale === "ar" ? "رقم الطلب" : "Order Reference"}:{" "}
          <span className="font-medium text-charcoal">{confirmedOrder.id}</span>
        </p>
        <p className="mt-1 font-serif text-xl">{formatOMR(confirmedOrder.total, locale)}</p>
        <LinkButton href="/shop" className="mt-8 inline-flex">
          {t("cart_continue")}
        </LinkButton>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container-nora py-24 text-center">
        <p className="text-charcoal-soft">{t("cart_empty")}</p>
        <LinkButton href="/shop" className="mt-6 inline-flex">
          {t("cart_continue")}
        </LinkButton>
      </div>
    );
  }

  return (
    <div className="container-nora py-12 sm:py-16">
      <h1 className="font-serif text-3xl sm:text-4xl">{t("checkout_title")}</h1>

      <form onSubmit={submit} className="mt-10 grid lg:grid-cols-[1fr_360px] gap-12">
        <div className="space-y-8">
          <fieldset className="grid sm:grid-cols-2 gap-4">
            <Field label={t("full_name")} value={fullName} onChange={setFullName} required />
            <Field label={t("mobile_number")} value={mobile} onChange={setMobile} required type="tel" />
            <Field label={t("email")} value={email} onChange={setEmail} required type="email" className="sm:col-span-2" />
            <Field label={t("delivery_address")} value={address} onChange={setAddress} required className="sm:col-span-2" />
            <Field label={t("area")} value={area} onChange={setArea} required />
            <label className="text-sm">
              <span className="block text-xs uppercase tracking-wider text-charcoal-soft mb-2">{t("city")}</span>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full border border-line rounded-xl px-4 py-3 bg-cream outline-none focus:border-charcoal"
              >
                {omanCities.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </label>
          </fieldset>

          <fieldset>
            <p className="font-serif text-lg mb-4">{t("delivery_method")}</p>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label={t("delivery_date")} value={deliveryDate} onChange={setDeliveryDate} type="date" required />
              <label className="text-sm">
                <span className="block text-xs uppercase tracking-wider text-charcoal-soft mb-2">{t("delivery_region")}</span>
                <select
                  value={deliveryRegion}
                  onChange={(e) => setDeliveryRegion(e.target.value as DeliveryRegion)}
                  className="w-full border border-line rounded-xl px-4 py-3 bg-cream outline-none focus:border-charcoal"
                >
                  <option value="Muscat">Muscat</option>
                  <option value="Other">{locale === "ar" ? "مناطق عمان الأخرى" : "Other Oman Regions"}</option>
                </select>
              </label>
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              {(["Standard", "Express", "Scheduled"] as DeliveryMethod[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setDeliveryMethod(m)}
                  className={`rounded-full border px-5 py-2.5 text-sm transition-colors ${
                    deliveryMethod === m
                      ? "bg-charcoal text-cream border-charcoal"
                      : "border-line hover:border-taupe"
                  }`}
                >
                  {m === "Standard" ? t("standard_delivery") : m === "Express" ? t("express_delivery") : t("scheduled_delivery")}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <p className="font-serif text-lg mb-4">{t("nav_build")}</p>
            <label className="flex items-start gap-3 text-sm border border-line rounded-xl px-4 py-3">
              <input type="checkbox" checked={isGift} onChange={(e) => setIsGift(e.target.checked)} className="w-4 h-4 mt-0.5" />
              <span>
                <span className="block">{t("is_gift")}</span>
                <span className="block text-xs text-charcoal-soft mt-0.5">{t("is_gift_sub")}</span>
              </span>
            </label>
            <div className="grid sm:grid-cols-2 gap-4 mt-4">
              <Field label={t("gift_recipient_name")} value={giftRecipientName} onChange={setGiftRecipientName} />
              <Field label={t("gift_message")} value={giftMessage} onChange={setGiftMessage} />
            </div>
          </fieldset>

          <fieldset>
            <p className="font-serif text-lg mb-4">{t("payment_options")}</p>
            <div className="flex flex-wrap gap-3">
              {paymentOptions.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPaymentMethod(p)}
                  className={`rounded-full border px-5 py-2.5 text-sm transition-colors ${
                    paymentMethod === p
                      ? "bg-charcoal text-cream border-charcoal"
                      : "border-line hover:border-taupe"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </fieldset>

          {error && <p className="text-sm text-red-700">{error}</p>}
        </div>

        <aside className="h-fit rounded-3xl border border-line bg-ivory p-6">
          <p className="text-xs uppercase tracking-wider text-charcoal-soft mb-4">
            {items.length} {locale === "ar" ? "عنصر" : "items"}
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-charcoal-soft">{t("subtotal")}</span>
              <span>{formatOMR(subtotal, locale)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-charcoal-soft">{t("delivery_fee")}</span>
              <span>{formatOMR(deliveryFee, locale)}</span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-line flex justify-between items-center">
            <span className="text-sm uppercase tracking-wider">{t("total")}</span>
            <span className="font-serif text-xl">{formatOMR(total, locale)}</span>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-full bg-charcoal text-cream px-7 py-3.5 text-sm uppercase tracking-wider hover:bg-charcoal-soft transition-colors disabled:opacity-50"
          >
            {submitting ? "…" : t("place_order")}
          </button>
        </aside>
      </form>
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
