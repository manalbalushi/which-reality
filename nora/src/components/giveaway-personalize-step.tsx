"use client";

import { useLocale } from "@/lib/locale-context";
import { UIIcon } from "@/components/icons";
import { Personalization } from "@/lib/types";

export function GiveawayPersonalizeStep({
  personalization,
  setPersonalization,
  onFinish,
  justAdded,
}: {
  personalization: Personalization;
  setPersonalization: (fn: (p: Personalization) => Personalization) => void;
  onFinish: () => void;
  justAdded: boolean;
}) {
  const { t } = useLocale();

  return (
    <div>
      <h2 className="font-serif text-2xl mb-2">{t("step7_title")}</h2>
      <p className="text-sm text-charcoal-soft mb-6 max-w-md">{t("personalize_giveaway_hint")}</p>

      <div className="grid gap-5 max-w-lg">
        <div className="grid grid-cols-2 gap-4">
          <label className="text-sm">
            <span className="block text-xs uppercase tracking-wider text-charcoal-soft mb-2">{t("event_name")}</span>
            <input
              value={personalization.eventName ?? ""}
              onChange={(e) => setPersonalization((p) => ({ ...p, eventName: e.target.value }))}
              className="w-full border border-line rounded-xl px-4 py-3 bg-cream outline-none focus:border-charcoal"
            />
          </label>
          <label className="text-sm">
            <span className="block text-xs uppercase tracking-wider text-charcoal-soft mb-2">{t("event_date")}</span>
            <input
              type="date"
              value={personalization.eventDate ?? ""}
              onChange={(e) => setPersonalization((p) => ({ ...p, eventDate: e.target.value }))}
              className="w-full border border-line rounded-xl px-4 py-3 bg-cream outline-none focus:border-charcoal"
            />
          </label>
        </div>

        <label className="text-sm">
          <span className="block text-xs uppercase tracking-wider text-charcoal-soft mb-2">{t("recipient_name")}</span>
          <input
            value={personalization.recipientName}
            onChange={(e) => setPersonalization((p) => ({ ...p, recipientName: e.target.value }))}
            className="w-full border border-line rounded-xl px-4 py-3 bg-cream outline-none focus:border-charcoal"
          />
        </label>

        <label className="text-sm">
          <span className="block text-xs uppercase tracking-wider text-charcoal-soft mb-2">{t("gift_message")}</span>
          <textarea
            value={personalization.message}
            onChange={(e) => setPersonalization((p) => ({ ...p, message: e.target.value }))}
            rows={3}
            className="w-full border border-line rounded-xl px-4 py-3 bg-cream outline-none focus:border-charcoal"
          />
        </label>

        <div className="grid grid-cols-2 gap-4">
          <label className="text-sm">
            <span className="block text-xs uppercase tracking-wider text-charcoal-soft mb-2">{t("theme_field")}</span>
            <input
              value={personalization.theme ?? ""}
              onChange={(e) => setPersonalization((p) => ({ ...p, theme: e.target.value }))}
              className="w-full border border-line rounded-xl px-4 py-3 bg-cream outline-none focus:border-charcoal"
            />
          </label>
          <label className="text-sm">
            <span className="block text-xs uppercase tracking-wider text-charcoal-soft mb-2">{t("color_field")}</span>
            <input
              value={personalization.color ?? ""}
              onChange={(e) => setPersonalization((p) => ({ ...p, color: e.target.value }))}
              className="w-full border border-line rounded-xl px-4 py-3 bg-cream outline-none focus:border-charcoal"
            />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {(
            [
              ["greetingCard", "greeting_card"],
              ["customRibbon", "custom_ribbon"],
              ["personalizedTag", "personalized_tag"],
              ["sticker", "sticker"],
              ["companyLogo", "company_logo"],
            ] as const
          ).map(([key, labelKey]) => (
            <label key={key} className="flex items-center gap-2 text-sm border border-line rounded-xl px-4 py-3">
              <input
                type="checkbox"
                checked={!!personalization[key]}
                onChange={(e) => setPersonalization((p) => ({ ...p, [key]: e.target.checked }))}
                className="w-4 h-4"
              />
              {t(labelKey)}
            </label>
          ))}
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <button
          onClick={onFinish}
          className="inline-flex items-center gap-2 rounded-full bg-charcoal text-cream px-8 py-3.5 text-sm uppercase tracking-wider hover:bg-charcoal-soft transition-colors"
        >
          {justAdded ? t("order_confirmed") : t("finish_add_to_cart")}
        </button>
        <a
          href="https://wa.me/96890000000"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-charcoal px-6 py-3.5 text-sm uppercase tracking-wider hover:bg-charcoal hover:text-cream transition-colors"
        >
          <UIIcon name="whatsapp" className="w-4 h-4" />
          {t("order_via_whatsapp")}
        </a>
      </div>
    </div>
  );
}
