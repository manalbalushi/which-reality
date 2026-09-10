"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale } from "@/lib/locale-context";
import { useCart } from "@/lib/cart-context";
import { formatOMR } from "@/lib/format";
import { UIIcon } from "@/components/icons";
import { Frame } from "@/components/media";
import { PackagingCard } from "@/components/packaging-card";
import { recipients, styles, budgetTiers, builderOccasionIds, quantityTiers, bulkBudgetTiers } from "@/data/styles";
import { occasions } from "@/data/occasions";
import { packagingTypes } from "@/data/packaging";
import { categories } from "@/data/categories";
import { products } from "@/data/products";
import { recommendGift } from "@/lib/recommend";
import { GiftStyle, Personalization } from "@/lib/types";

const TOTAL_STEPS = 7;

function ChipButton({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-5 py-2.5 text-sm transition-colors ${
        selected
          ? "bg-charcoal text-cream border-charcoal"
          : "border-line hover:border-taupe text-charcoal"
      }`}
    >
      {label}
    </button>
  );
}

export function BuilderClient() {
  const { t, text, locale } = useLocale();
  const { addGiftBuild } = useCart();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [step, setStep] = useState(1);
  const [recipient, setRecipient] = useState("");
  const [occasion, setOccasion] = useState("");
  const [budget, setBudget] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [style, setStyle] = useState<GiftStyle | "">("");
  const [packagingId, setPackagingId] = useState("");
  const [selected, setSelected] = useState<Record<string, number>>({});
  const [category, setCategory] = useState("all");
  const [personalization, setPersonalization] = useState<Personalization>({
    recipientName: "",
    message: "",
    greetingCard: false,
    companyLogo: false,
    customRibbon: false,
    personalizedTag: false,
  });
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    const initialOccasion = searchParams.get("occasion");
    if (initialOccasion && occasions.some((o) => o.id === initialOccasion)) {
      // One-time sync from the incoming URL (e.g. an occasion page's "Build Your Gift" link).
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOccasion(initialOccasion);
    }
  }, [searchParams]);

  const packaging = packagingTypes.find((p) => p.id === packagingId);
  const productsTotal = Object.entries(selected).reduce((sum, [id, qty]) => {
    const p = products.find((pr) => pr.id === id);
    return sum + (p ? p.price * qty : 0);
  }, 0);
  const grandTotal = (packaging?.price ?? 0) + productsTotal;
  const itemCount = Object.values(selected).reduce((a, b) => a + b, 0);
  const isBulk = quantity > 1;
  // When ordering multiple identical gifts (e.g. a kids' party giveaway), the
  // budget chips represent the TOTAL for the whole batch — the recommendation
  // engine still reasons per single gift, so we divide it back down here.
  const perGiftBudget = budget ? (isBulk ? Math.max(5, Math.round((budget / quantity) * 1000) / 1000) : budget) : null;

  const recommendation = useMemo(() => {
    if (!recipient || !occasion || !perGiftBudget || !style) return null;
    return recommendGift({ recipient, occasion, budget: perGiftBudget, style: style as GiftStyle });
  }, [recipient, occasion, perGiftBudget, style]);

  const applyRecommendation = () => {
    if (!recommendation) return;
    setPackagingId(recommendation.packaging.id);
    const next: Record<string, number> = {};
    recommendation.products.forEach((p) => (next[p.id] = 1));
    setSelected(next);
  };

  const canContinue = () => {
    if (step === 1) return !!recipient;
    if (step === 2) return !!occasion;
    if (step === 3) return !!budget;
    if (step === 4) return !!style;
    if (step === 5) return !!packagingId;
    if (step === 6) return itemCount > 0;
    return true;
  };

  const updateQty = (id: string, qty: number) => {
    setSelected((prev) => {
      const next = { ...prev };
      if (qty <= 0) delete next[id];
      else next[id] = qty;
      return next;
    });
  };

  const visibleProducts =
    category === "all" ? products : products.filter((p) => p.category === category);

  const finish = () => {
    if (!packagingId || itemCount === 0) return;
    addGiftBuild({
      recipient,
      occasion,
      budget: budget ?? 0,
      quantity,
      style: style as GiftStyle,
      packagingId,
      products: Object.entries(selected).map(([productId, qty]) => ({ productId, quantity: qty })),
      personalization,
      unitPrice: grandTotal,
    });
    setJustAdded(true);
    setTimeout(() => router.push("/cart"), 900);
  };

  const summaryLines = [
    recipient && `${t("step1_title")}: ${recipients.find((r) => r.id === recipient) ? text(recipients.find((r) => r.id === recipient)!.name) : ""}`,
    occasion && `${t("occasion")}: ${text(occasions.find((o) => o.id === occasion)!.name)}`,
    isBulk && `${t("quantity")}: ${quantity} ${t("gifts_suffix")}`,
    budget && `${isBulk ? t("total_budget") : t("step3_title")}: OMR ${budget}`,
    style && `${t("style")}: ${text(styles.find((s) => s.id === style)!.name)}`,
    packaging && `${t("packaging")}: ${text(packaging.name)}`,
  ].filter(Boolean);

  const shareText = encodeURIComponent(
    `${t("nav_build")} — ${summaryLines.join(" · ")} · Total ${formatOMR(grandTotal * quantity, locale)}`
  );

  return (
    <div className="container-nora py-10 sm:py-14">
      <div className="max-w-2xl">
        <p className="text-xs uppercase tracking-[0.3em] text-taupe mb-3">{t("nav_build")}</p>
        <h1 className="font-serif text-4xl leading-tight">{t("build_teaser_title")}</h1>
        <p className="mt-3 text-charcoal-soft">{t("build_teaser_sub")}</p>
      </div>

      <div className="mt-8 flex items-center gap-2">
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full ${i + 1 <= step ? "bg-charcoal" : "bg-line"}`}
          />
        ))}
      </div>
      <p className="mt-2 text-xs text-charcoal-soft">
        {t("step")} {step} {t("of")} {TOTAL_STEPS}
      </p>

      <div className="mt-8 grid lg:grid-cols-[1fr_360px] gap-12">
        <div>
          {step === 1 && (
            <div>
              <h2 className="font-serif text-2xl mb-5">{t("step1_title")}</h2>
              <div className="flex flex-wrap gap-3">
                {recipients.map((r) => (
                  <ChipButton
                    key={r.id}
                    label={text(r.name)}
                    selected={recipient === r.id}
                    onClick={() => setRecipient(r.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="font-serif text-2xl mb-5">{t("step2_title")}</h2>
              <div className="flex flex-wrap gap-3">
                {builderOccasionIds.map((id) => {
                  const o = occasions.find((occ) => occ.id === id)!;
                  return (
                    <ChipButton
                      key={id}
                      label={text(o.name)}
                      selected={occasion === id}
                      onClick={() => setOccasion(id)}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="font-serif text-2xl mb-2">{t("step3_title")}</h2>
              <p className="text-sm text-charcoal-soft mb-6 max-w-md">{t("quantity_hint")}</p>

              <p className="text-xs uppercase tracking-wider text-charcoal-soft mb-3">{t("quantity")}</p>
              <div className="flex flex-wrap gap-3">
                {quantityTiers.map((q) => (
                  <ChipButton
                    key={q}
                    label={q === 1 ? t("single_gift") : `${q} ${t("gifts_suffix")}`}
                    selected={quantity === q}
                    onClick={() => setQuantity(q)}
                  />
                ))}
              </div>
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
                placeholder={t("custom_quantity")}
                className="mt-3 w-40 border border-line rounded-xl px-4 py-2.5 bg-cream outline-none focus:border-charcoal text-sm"
              />

              <p className="text-xs uppercase tracking-wider text-charcoal-soft mb-3 mt-7">
                {isBulk ? t("total_budget") : t("step3_title")}
              </p>
              <div className="flex flex-wrap gap-3">
                {(isBulk ? bulkBudgetTiers : budgetTiers).map((b) => (
                  <ChipButton
                    key={b}
                    label={b === 100 && !isBulk ? "100 OMR+" : `${b} OMR`}
                    selected={budget === b}
                    onClick={() => setBudget(b)}
                  />
                ))}
              </div>
              <input
                type="number"
                min={1}
                value={budget ?? ""}
                onChange={(e) => setBudget(Number(e.target.value) || null)}
                placeholder={t("custom_amount")}
                className="mt-3 w-40 border border-line rounded-xl px-4 py-2.5 bg-cream outline-none focus:border-charcoal text-sm"
              />
              {isBulk && perGiftBudget && (
                <p className="mt-3 text-sm text-charcoal-soft">
                  ≈ {formatOMR(perGiftBudget, locale)} {t("per_gift")}
                </p>
              )}
            </div>
          )}

          {step === 4 && (
            <div>
              <h2 className="font-serif text-2xl mb-5">{t("step4_title")}</h2>
              <div className="flex flex-wrap gap-3">
                {styles.map((s) => (
                  <ChipButton
                    key={s.id}
                    label={text(s.name)}
                    selected={style === s.id}
                    onClick={() => setStyle(s.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {step === 5 && (
            <div>
              <h2 className="font-serif text-2xl mb-5">{t("step5_title")}</h2>
              {recommendation && (
                <RecommendationCallout
                  recommendation={recommendation}
                  quantity={quantity}
                  onApply={applyRecommendation}
                />
              )}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {packagingTypes.map((p) => (
                  <PackagingCard
                    key={p.id}
                    packaging={p}
                    selected={packagingId === p.id}
                    onSelect={() => setPackagingId(p.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {step === 6 && (
            <div>
              <h2 className="font-serif text-2xl mb-5">{t("step6_title")}</h2>
              {recommendation && (
                <RecommendationCallout
                  recommendation={recommendation}
                  quantity={quantity}
                  onApply={applyRecommendation}
                />
              )}
              <div className="flex flex-wrap gap-2 mb-6">
                <ChipButton label={t("all")} selected={category === "all"} onClick={() => setCategory("all")} />
                {categories.map((c) => (
                  <ChipButton
                    key={c.id}
                    label={text(c.name)}
                    selected={category === c.id}
                    onClick={() => setCategory(c.id)}
                  />
                ))}
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {visibleProducts.map((p) => {
                  const qty = selected[p.id] ?? 0;
                  return (
                    <div
                      key={p.id}
                      className={`flex gap-3 rounded-2xl border p-3 ${
                        qty > 0 ? "border-charcoal bg-beige/50" : "border-line"
                      }`}
                    >
                      <Frame swatch={p.swatch} className="w-20 h-20 shrink-0" iconClassName="w-8 h-8" />
                      <div className="flex-1 min-w-0">
                        <p className="font-serif text-sm leading-snug">{text(p.name)}</p>
                        <p className="text-xs text-charcoal-soft mt-1">
                          {formatOMR(p.price, locale)}
                        </p>
                        <div className="mt-2">
                          {qty === 0 ? (
                            <button
                              onClick={() => updateQty(p.id, 1)}
                              className="text-xs uppercase tracking-wider border border-charcoal rounded-full px-4 py-1.5 hover:bg-charcoal hover:text-cream transition-colors"
                            >
                              {t("add")}
                            </button>
                          ) : (
                            <div className="flex items-center border border-line rounded-full w-fit">
                              <button onClick={() => updateQty(p.id, qty - 1)} className="p-2" aria-label="Decrease">
                                <UIIcon name="minus" className="w-3.5 h-3.5" />
                              </button>
                              <span className="w-6 text-center text-xs">{qty}</span>
                              <button onClick={() => updateQty(p.id, qty + 1)} className="p-2" aria-label="Increase">
                                <UIIcon name="plus" className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {step === 7 && (
            <div>
              <h2 className="font-serif text-2xl mb-5">{t("step7_title")}</h2>
              <div className="grid gap-5 max-w-lg">
                <label className="text-sm">
                  <span className="block text-xs uppercase tracking-wider text-charcoal-soft mb-2">
                    {t("recipient_name")}
                  </span>
                  <input
                    value={personalization.recipientName}
                    onChange={(e) =>
                      setPersonalization((p) => ({ ...p, recipientName: e.target.value }))
                    }
                    className="w-full border border-line rounded-xl px-4 py-3 bg-cream outline-none focus:border-charcoal"
                  />
                </label>
                <label className="text-sm">
                  <span className="block text-xs uppercase tracking-wider text-charcoal-soft mb-2">
                    {t("gift_message")}
                  </span>
                  <textarea
                    value={personalization.message}
                    onChange={(e) => setPersonalization((p) => ({ ...p, message: e.target.value }))}
                    rows={4}
                    className="w-full border border-line rounded-xl px-4 py-3 bg-cream outline-none focus:border-charcoal"
                  />
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {(
                    [
                      ["greetingCard", "greeting_card"],
                      ["companyLogo", "company_logo"],
                      ["customRibbon", "custom_ribbon"],
                      ["personalizedTag", "personalized_tag"],
                    ] as const
                  ).map(([key, labelKey]) => (
                    <label key={key} className="flex items-center gap-2 text-sm border border-line rounded-xl px-4 py-3">
                      <input
                        type="checkbox"
                        checked={personalization[key]}
                        onChange={(e) =>
                          setPersonalization((p) => ({ ...p, [key]: e.target.checked }))
                        }
                        className="w-4 h-4"
                      />
                      {t(labelKey)}
                    </label>
                  ))}
                </div>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  onClick={finish}
                  className="inline-flex items-center gap-2 rounded-full bg-charcoal text-cream px-8 py-3.5 text-sm uppercase tracking-wider hover:bg-charcoal-soft transition-colors"
                >
                  {justAdded ? t("order_confirmed") : t("finish_add_to_cart")}
                </button>
                <a
                  href={`https://wa.me/96890000000?text=${shareText}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-charcoal px-6 py-3.5 text-sm uppercase tracking-wider hover:bg-charcoal hover:text-cream transition-colors"
                >
                  <UIIcon name="whatsapp" className="w-4 h-4" />
                  {t("order_via_whatsapp")}
                </a>
              </div>
            </div>
          )}

          {step < 7 && (
            <div className="mt-10 flex items-center gap-3">
              {step > 1 && (
                <button
                  onClick={() => setStep((s) => s - 1)}
                  className="rounded-full border border-line px-6 py-3 text-sm uppercase tracking-wider hover:bg-beige"
                >
                  {t("back")}
                </button>
              )}
              <button
                onClick={() => setStep((s) => Math.min(TOTAL_STEPS, s + 1))}
                disabled={!canContinue()}
                className="rounded-full bg-charcoal text-cream px-8 py-3 text-sm uppercase tracking-wider hover:bg-charcoal-soft transition-colors disabled:opacity-40 disabled:pointer-events-none"
              >
                {t("continue")}
              </button>
            </div>
          )}
        </div>

        <LivePreview
          recipient={recipient}
          occasion={occasion}
          budget={budget}
          quantity={quantity}
          style={style}
          packagingId={packagingId}
          selected={selected}
          personalization={personalization}
          grandTotal={grandTotal}
        />
      </div>
    </div>
  );
}

function RecommendationCallout({
  recommendation,
  quantity,
  onApply,
}: {
  recommendation: ReturnType<typeof recommendGift>;
  quantity: number;
  onApply: () => void;
}) {
  const { t, text, locale } = useLocale();
  const gallery = [
    { swatch: recommendation.packaging.swatch, name: recommendation.packaging.name },
    ...recommendation.products.map((p) => ({ swatch: p.swatch, name: p.name })),
  ];

  return (
    <div className="mb-6 rounded-2xl border border-taupe/50 bg-beige/40 p-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-xs uppercase tracking-wider text-taupe">{t("recommended_for_you")}</p>
          <p className="text-sm text-charcoal-soft mt-1">{t("recommended_sub")}</p>
        </div>
        <button
          onClick={onApply}
          className="rounded-full bg-charcoal text-cream px-5 py-2 text-xs uppercase tracking-wider hover:bg-charcoal-soft"
        >
          {t("use_recommendation")}
        </button>
      </div>

      <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
        {gallery.map((g, i) => (
          <div key={i} className="shrink-0 w-16 text-center">
            <Frame swatch={g.swatch} className="w-16 h-16" iconClassName="w-6 h-6" />
            <p className="mt-1.5 text-[10.5px] leading-tight text-charcoal-soft">{text(g.name)}</p>
          </div>
        ))}
      </div>

      <div className="mt-3">
        {quantity > 1 ? (
          <span className="inline-block px-4 py-1.5 rounded-full bg-charcoal text-cream text-xs">
            {formatOMR(recommendation.total, locale)} {t("per_gift")} × {quantity} = {formatOMR(recommendation.total * quantity, locale)}
          </span>
        ) : (
          <span className="inline-block px-4 py-1.5 rounded-full bg-charcoal text-cream text-xs">
            {formatOMR(recommendation.total, locale)}
          </span>
        )}
      </div>
    </div>
  );
}

function LivePreview({
  recipient,
  occasion,
  budget,
  quantity,
  style,
  packagingId,
  selected,
  personalization,
  grandTotal,
}: {
  recipient: string;
  occasion: string;
  budget: number | null;
  quantity: number;
  style: GiftStyle | "";
  packagingId: string;
  selected: Record<string, number>;
  personalization: Personalization;
  grandTotal: number;
}) {
  const { t, text, locale } = useLocale();
  const isBulk = quantity > 1;
  const packaging = packagingTypes.find((p) => p.id === packagingId);
  const recipientLabel = recipients.find((r) => r.id === recipient);
  const occasionLabel = occasions.find((o) => o.id === occasion);
  const styleLabel = styles.find((s) => s.id === style);
  const items = Object.entries(selected);

  return (
    <aside className="lg:sticky lg:top-28 h-fit rounded-3xl border border-line bg-ivory p-6">
      <p className="text-xs uppercase tracking-wider text-charcoal-soft mb-4">{t("live_preview")}</p>

      {packaging ? (
        <Frame swatch={packaging.swatch} className="aspect-[4/3] w-full mb-4" iconClassName="w-12 h-12" />
      ) : (
        <div className="aspect-[4/3] w-full mb-4 rounded-2xl border border-dashed border-line flex items-center justify-center text-xs text-charcoal-soft">
          {t("packaging")}
        </div>
      )}

      <dl className="space-y-2 text-sm">
        {recipientLabel && (
          <div className="flex justify-between">
            <dt className="text-charcoal-soft">{t("step1_title")}</dt>
            <dd>{text(recipientLabel.name)}</dd>
          </div>
        )}
        {occasionLabel && (
          <div className="flex justify-between">
            <dt className="text-charcoal-soft">{t("occasion")}</dt>
            <dd>{text(occasionLabel.name)}</dd>
          </div>
        )}
        {isBulk && (
          <div className="flex justify-between">
            <dt className="text-charcoal-soft">{t("quantity")}</dt>
            <dd>{quantity} {t("gifts_suffix")}</dd>
          </div>
        )}
        {budget && (
          <div className="flex justify-between">
            <dt className="text-charcoal-soft">{isBulk ? t("total_budget") : t("step3_title")}</dt>
            <dd>OMR {budget}</dd>
          </div>
        )}
        {styleLabel && (
          <div className="flex justify-between">
            <dt className="text-charcoal-soft">{t("style")}</dt>
            <dd>{text(styleLabel.name)}</dd>
          </div>
        )}
        {packaging && (
          <div className="flex justify-between">
            <dt className="text-charcoal-soft">{t("packaging")}</dt>
            <dd>{text(packaging.name)}</dd>
          </div>
        )}
      </dl>

      {items.length > 0 && (
        <div className="mt-4 pt-4 border-t border-line space-y-1.5">
          {items.map(([id, qty]) => {
            const p = products.find((pr) => pr.id === id);
            if (!p) return null;
            return (
              <div key={id} className="flex justify-between text-sm">
                <span className="text-charcoal-soft">
                  {qty}× {text(p.name)}
                </span>
                <span>{formatOMR(p.price * qty, locale)}</span>
              </div>
            );
          })}
        </div>
      )}

      {(personalization.recipientName || personalization.message) && (
        <div className="mt-4 pt-4 border-t border-line text-sm">
          {personalization.recipientName && (
            <p className="font-serif italic">{t("gift_recipient_name")}: {personalization.recipientName}</p>
          )}
          {personalization.message && (
            <p className="mt-1 text-charcoal-soft">“{personalization.message}”</p>
          )}
        </div>
      )}

      {isBulk && grandTotal > 0 && (
        <p className="mt-3 text-xs text-charcoal-soft">
          {formatOMR(grandTotal, locale)} {t("per_gift")} × {quantity}
        </p>
      )}
      <div className="mt-5 pt-4 border-t border-line flex justify-between items-center">
        <span className="text-sm uppercase tracking-wider">{t("total")}</span>
        <span className="font-serif text-xl">{formatOMR(grandTotal * quantity, locale)}</span>
      </div>
    </aside>
  );
}
