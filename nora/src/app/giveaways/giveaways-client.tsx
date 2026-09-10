"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale } from "@/lib/locale-context";
import { useCart } from "@/lib/cart-context";
import { formatOMR } from "@/lib/format";
import { UIIcon } from "@/components/icons";
import { ChipButton } from "@/components/chip-button";
import { GiveawayOptionCard } from "@/components/giveaway-option-card";
import { GiveawayPersonalizeStep } from "@/components/giveaway-personalize-step";
import { styles, quantityTiers, bulkBudgetTiers, giveawayOccasionIds, recipientGroups } from "@/data/styles";
import { occasions } from "@/data/occasions";
import { packagingTypes } from "@/data/packaging";
import { recommendGiveaway, GiveawayOption } from "@/lib/recommend";
import { Gender, GiftStyle, Personalization } from "@/lib/types";

const TOTAL_STEPS = 7;

function groupToGender(group: string): Gender | undefined {
  if (group === "girls") return "girl";
  if (group === "boys") return "boy";
  if (group === "mixed") return "unisex";
  return undefined;
}

export function GiveawaysClient() {
  const { t, text, locale } = useLocale();
  const { addGiftBuild } = useCart();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [occasion, setOccasion] = useState("");
  const [group, setGroup] = useState("");
  const [quantity, setQuantity] = useState(20);
  const [totalBudget, setTotalBudget] = useState<number | null>(null);
  const [style, setStyle] = useState<GiftStyle | "">("");
  const [packagingId, setPackagingId] = useState<string | "">("");
  const [surprisePackaging, setSurprisePackaging] = useState(false);
  const [personalization, setPersonalization] = useState<Personalization>({
    recipientName: "",
    message: "",
    greetingCard: false,
    companyLogo: false,
    customRibbon: false,
    personalizedTag: false,
  });
  const [justAdded, setJustAdded] = useState(false);
  const [pendingOption, setPendingOption] = useState<GiveawayOption | null>(null);

  const perGiftPreview = totalBudget ? Math.max(0.1, Number((totalBudget / Math.max(1, quantity)).toFixed(3))) : null;

  const result = useMemo(() => {
    if (!occasion || !group || !totalBudget || !style) return null;
    return recommendGiveaway({
      quantity,
      totalBudget,
      occasion,
      style: style as GiftStyle,
      packagingId: surprisePackaging ? undefined : packagingId || undefined,
      gender: groupToGender(group),
    });
  }, [occasion, group, totalBudget, style, quantity, packagingId, surprisePackaging]);

  const surpriseMe = () => {
    const o = giveawayOccasionIds[Math.floor(Math.random() * giveawayOccasionIds.length)];
    const g = recipientGroups[Math.floor(Math.random() * recipientGroups.length)];
    const q = quantityTiers[Math.floor(Math.random() * quantityTiers.length)];
    const b = bulkBudgetTiers[Math.floor(Math.random() * (bulkBudgetTiers.length - 1)) + 1];
    const s = styles[Math.floor(Math.random() * styles.length)];
    setOccasion(o);
    setGroup(g.id);
    setQuantity(q);
    setTotalBudget(b);
    setStyle(s.id);
    setSurprisePackaging(true);
    setPackagingId("");
    setStep(6);
  };

  const addOptionToCart = (option: GiveawayOption) => {
    addGiftBuild({
      recipient: group,
      occasion,
      budget: totalBudget ?? 0,
      quantity,
      style: style as GiftStyle,
      packagingId: option.packaging.id,
      products: option.products.map((p) => ({ productId: p.id, quantity: 1 })),
      personalization,
      unitPrice: option.perGiftTotal,
    });
    setJustAdded(true);
    setTimeout(() => router.push("/cart"), 700);
  };

  const customizeOption = (option: GiveawayOption) => {
    setPendingOption(option);
    setStep(7);
  };

  const finish = () => {
    if (!pendingOption) return;
    addOptionToCart(pendingOption);
  };

  const canContinue = () => {
    if (step === 1) return !!occasion;
    if (step === 2) return !!group;
    if (step === 3) return quantity > 0 && !!totalBudget;
    if (step === 4) return !!style;
    return true;
  };

  const showGenericNav = step < 6;

  return (
    <div className="container-nora py-10 sm:py-14">
      <div className="max-w-2xl flex items-start justify-between gap-6 flex-wrap">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-taupe mb-3">{t("nav_giveaways")}</p>
          <h1 className="font-serif text-4xl leading-tight">{t("giveaways_hero_title")}</h1>
          <p className="mt-3 text-charcoal-soft">{t("giveaways_hero_sub")}</p>
        </div>
        {step < 6 && (
          <button
            onClick={surpriseMe}
            className="inline-flex items-center gap-2 rounded-full border border-taupe px-5 py-2.5 text-xs uppercase tracking-wider text-taupe hover:bg-taupe hover:text-cream transition-colors shrink-0"
          >
            <UIIcon name="star" className="w-4 h-4" />
            {t("surprise_me")}
          </button>
        )}
      </div>

      <div className="mt-8 flex items-center gap-2">
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <div key={i} className={`h-1 flex-1 rounded-full ${i + 1 <= step ? "bg-charcoal" : "bg-line"}`} />
        ))}
      </div>
      <p className="mt-2 text-xs text-charcoal-soft">
        {t("step")} {step} {t("of")} {TOTAL_STEPS}
      </p>

      <div className="mt-8 max-w-3xl">
        {step === 1 && (
          <div>
            <h2 className="font-serif text-2xl mb-5">{t("giveaway_step_occasion")}</h2>
            <div className="flex flex-wrap gap-3">
              {giveawayOccasionIds.map((id) => {
                const o = occasions.find((occ) => occ.id === id);
                if (!o) return null;
                return (
                  <ChipButton key={id} label={text(o.name)} selected={occasion === id} onClick={() => setOccasion(id)} />
                );
              })}
            </div>
            {occasion === "qaranqashouh" && (
              <Link
                href="/giveaways/qaranqashouh"
                className="mt-5 inline-flex items-center gap-2 rounded-2xl border border-taupe bg-beige/50 px-5 py-3 text-sm text-charcoal hover:bg-beige transition-colors"
              >
                {t("go_to_qaranqashouh")}
              </Link>
            )}
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="font-serif text-2xl mb-5">{t("giveaway_step_group")}</h2>
            <div className="flex flex-wrap gap-3">
              {recipientGroups.map((g) => (
                <ChipButton key={g.id} label={text(g.name)} selected={group === g.id} onClick={() => setGroup(g.id)} />
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="font-serif text-2xl mb-2">{t("giveaway_step_quantity_budget")}</h2>

            <p className="text-xs uppercase tracking-wider text-charcoal-soft mb-3 mt-6">{t("number_of_gifts_field")}</p>
            <div className="flex flex-wrap gap-3">
              {quantityTiers.map((q) => (
                <ChipButton key={q} label={`${q} ${t("gifts_suffix")}`} selected={quantity === q} onClick={() => setQuantity(q)} />
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

            <p className="text-xs uppercase tracking-wider text-charcoal-soft mb-3 mt-7">{t("max_total_budget")}</p>
            <div className="flex flex-wrap gap-3">
              {bulkBudgetTiers.map((b) => (
                <ChipButton key={b} label={`${b} OMR`} selected={totalBudget === b} onClick={() => setTotalBudget(b)} />
              ))}
            </div>
            <input
              type="number"
              min={1}
              value={totalBudget ?? ""}
              onChange={(e) => setTotalBudget(Number(e.target.value) || null)}
              placeholder={t("custom_amount")}
              className="mt-3 w-40 border border-line rounded-xl px-4 py-2.5 bg-cream outline-none focus:border-charcoal text-sm"
            />
            {perGiftPreview !== null && (
              <p className="mt-4 text-sm text-charcoal-soft">
                ≈ {formatOMR(perGiftPreview, locale)} {t("per_gift")}
              </p>
            )}
          </div>
        )}

        {step === 4 && (
          <div>
            <h2 className="font-serif text-2xl mb-5">{t("giveaway_step_style")}</h2>
            <div className="flex flex-wrap gap-3">
              {styles.map((s) => (
                <ChipButton key={s.id} label={text(s.name)} selected={style === s.id} onClick={() => setStyle(s.id)} />
              ))}
            </div>
          </div>
        )}

        {step === 5 && (
          <div>
            <h2 className="font-serif text-2xl mb-5">{t("giveaway_step_packaging")}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <button
                onClick={() => {
                  setSurprisePackaging(true);
                  setPackagingId("");
                }}
                className={`text-center rounded-2xl border p-5 flex flex-col items-center justify-center gap-2 transition-colors ${
                  surprisePackaging ? "border-charcoal bg-beige/60" : "border-line hover:border-taupe"
                }`}
              >
                <UIIcon name="star" className="w-6 h-6 text-taupe" />
                <span className="text-sm font-serif">{t("surprise_me_packaging")}</span>
              </button>
              {packagingTypes.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setSurprisePackaging(false);
                    setPackagingId(p.id);
                  }}
                  className={`text-start rounded-2xl border p-3 transition-colors ${
                    !surprisePackaging && packagingId === p.id ? "border-charcoal bg-beige/60" : "border-line hover:border-taupe"
                  }`}
                >
                  <p className="mt-1 font-serif text-[15px]">{text(p.name)}</p>
                  <p className="mt-1 text-sm text-charcoal-soft">+{formatOMR(p.price, locale)} {t("per_gift_price")}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 6 && (
          <div>
            {!result ? (
              <div className="py-10 text-center text-charcoal-soft">
                <button onClick={() => setStep(1)} className="text-sm underline underline-offset-4">
                  {t("back")}
                </button>
              </div>
            ) : (
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-taupe mb-3">{t("giveaway_results_heading")}</p>
                <h2 className="font-serif text-3xl mb-2">
                  {result.tight ? t("tight_budget_msg") : t("giveaway_results_heading")}
                </h2>
                <p className="text-charcoal-soft max-w-lg mb-2">{t("giveaway_results_sub")}</p>
                <p className="text-sm text-charcoal-soft mb-8">
                  {quantity} {t("gifts_suffix")} · {formatOMR(result.perGiftBudget, locale)} {t("per_gift")} {t("max_total_budget").toLowerCase()}
                </p>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {result.options.map((option) => (
                    <GiveawayOptionCard
                      key={option.id}
                      option={option}
                      quantity={quantity}
                      onCustomize={() => customizeOption(option)}
                      onAddToCart={() => addOptionToCart(option)}
                      justAdded={justAdded}
                    />
                  ))}
                </div>

                <button
                  onClick={() => setStep(4)}
                  className="mt-8 text-sm underline underline-offset-4 text-charcoal-soft hover:text-charcoal"
                >
                  {t("edit_answers")}
                </button>
              </div>
            )}
          </div>
        )}

        {step === 7 && (
          <GiveawayPersonalizeStep
            personalization={personalization}
            setPersonalization={setPersonalization}
            onFinish={finish}
            justAdded={justAdded}
          />
        )}

        {showGenericNav && (
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

        {step === 7 && (
          <button
            onClick={() => setStep(6)}
            className="mt-4 text-sm underline underline-offset-4 text-charcoal-soft hover:text-charcoal"
          >
            {t("back")}
          </button>
        )}
      </div>
    </div>
  );
}
