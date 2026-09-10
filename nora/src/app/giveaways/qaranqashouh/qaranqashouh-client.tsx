"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "@/lib/locale-context";
import { useCart } from "@/lib/cart-context";
import { formatOMR } from "@/lib/format";
import { ChipButton } from "@/components/chip-button";
import { GiveawayOptionCard } from "@/components/giveaway-option-card";
import { GiveawayPersonalizeStep } from "@/components/giveaway-personalize-step";
import { quantityTiers, bulkBudgetTiers, ageGroups, qaranqashouhThemes } from "@/data/styles";
import { recommendGiveaway, GiveawayOption } from "@/lib/recommend";
import { AgeGroup, Gender, Personalization } from "@/lib/types";

const TOTAL_STEPS = 6;

const genderOptions: { id: Gender; labelKey: "boy" | "girl" | "unisex" }[] = [
  { id: "girl", labelKey: "girl" },
  { id: "boy", labelKey: "boy" },
  { id: "unisex", labelKey: "unisex" },
];

export function QaranqashouhClient() {
  const { t, text, locale } = useLocale();
  const { addGiftBuild } = useCart();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [gender, setGender] = useState<Gender | "">("");
  const [ageGroup, setAgeGroup] = useState<AgeGroup | "">("");
  const [theme, setTheme] = useState("");
  const [quantity, setQuantity] = useState(12);
  const [totalBudget, setTotalBudget] = useState<number | null>(null);
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
    if (!gender || !ageGroup || !totalBudget) return null;
    return recommendGiveaway({
      quantity,
      totalBudget,
      occasion: "qaranqashouh",
      gender: gender as Gender,
      ageGroup: ageGroup as AgeGroup,
      themes: theme ? [theme] : undefined,
    });
  }, [gender, ageGroup, totalBudget, quantity, theme]);

  const addOptionToCart = (option: GiveawayOption) => {
    addGiftBuild({
      recipient: gender === "girl" ? "girls" : gender === "boy" ? "boys" : "mixed",
      occasion: "qaranqashouh",
      budget: totalBudget ?? 0,
      quantity,
      style: "cute",
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
    setStep(6);
  };

  const finish = () => {
    if (!pendingOption) return;
    addOptionToCart(pendingOption);
  };

  const canContinue = () => {
    if (step === 1) return !!gender;
    if (step === 2) return !!ageGroup;
    if (step === 4) return quantity > 0 && !!totalBudget;
    return true;
  };

  const showGenericNav = step < 5;

  return (
    <div className="container-nora py-10 sm:py-14">
      <p className="text-xs uppercase tracking-[0.3em] text-taupe mb-3">{t("nav_giveaways")}</p>
      <h1 className="font-serif text-4xl leading-tight max-w-2xl">{t("qaranqashouh_hero_title")}</h1>
      <p className="mt-3 text-charcoal-soft max-w-2xl">{t("qaranqashouh_hero_sub")}</p>

      <div className="mt-8 flex items-center gap-2 max-w-3xl">
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
            <h2 className="font-serif text-2xl mb-5">{t("qaranqashouh_step_gender")}</h2>
            <div className="flex flex-wrap gap-3">
              {genderOptions.map((g) => (
                <ChipButton key={g.id} label={t(g.labelKey)} selected={gender === g.id} onClick={() => setGender(g.id)} />
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="font-serif text-2xl mb-5">{t("qaranqashouh_step_age")}</h2>
            <div className="flex flex-wrap gap-3">
              {ageGroups
                .filter((a) => a.id === "3-5" || a.id === "6-8" || a.id === "9-12")
                .map((a) => (
                  <ChipButton
                    key={a.id}
                    label={text(a.name)}
                    selected={ageGroup === a.id}
                    onClick={() => setAgeGroup(a.id)}
                  />
                ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="font-serif text-2xl mb-5">{t("qaranqashouh_step_theme")}</h2>
            <div className="flex flex-wrap gap-3">
              <ChipButton label={t("any_theme")} selected={theme === ""} onClick={() => setTheme("")} />
              {qaranqashouhThemes.map((th) => (
                <ChipButton key={th.id} label={text(th.name)} selected={theme === th.id} onClick={() => setTheme(th.id)} />
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
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

        {step === 5 && (
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
                  {quantity} {t("gifts_suffix")} · {formatOMR(result.perGiftBudget, locale)} {t("per_gift")}
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
                  onClick={() => setStep(3)}
                  className="mt-8 text-sm underline underline-offset-4 text-charcoal-soft hover:text-charcoal"
                >
                  {t("edit_answers")}
                </button>
              </div>
            )}
          </div>
        )}

        {step === 6 && (
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

        {step === 6 && (
          <button
            onClick={() => setStep(5)}
            className="mt-4 text-sm underline underline-offset-4 text-charcoal-soft hover:text-charcoal"
          >
            {t("back")}
          </button>
        )}
      </div>
    </div>
  );
}
