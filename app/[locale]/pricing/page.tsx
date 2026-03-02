"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import Logo from "@/app/components/Logo";
import { PLAN_CONFIG, type Locale, type PlanId } from "@/lib/plans";

const PLAN_IDS: PlanId[] = ["starter", "pro", "multi-brand"];
const PLAN_CREDITS: Record<PlanId, number> = {
  starter: 60,
  pro: 200,
  "multi-brand": 600,
};
const PLAN_ACCENT: Record<PlanId, boolean> = {
  starter: false,
  pro: true,
  "multi-brand": false,
};

export default function PricingPage() {
  const router = useRouter();
  const locale = useLocale() as Locale;
  const t = useTranslations("pricing");
  const [loading, setLoading] = useState<string | null>(null);

  async function handleUpgrade(planId: PlanId) {
    setLoading(planId);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId, locale }),
      });
      const data = await res.json();
      if (res.status === 401) {
        const prefix = locale === "en" ? "/en" : "";
        router.push(`${prefix}/login`);
        return;
      }
      if (data.url) window.location.href = data.url;
    } catch {
      // silent
    } finally {
      setLoading(null);
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: "radial-gradient(ellipse at 50% 0%, rgba(86,219,132,0.05) 0%, transparent 60%), #0a0a0a",
        fontFamily: "var(--font-geist-sans)",
      }}
    >
      {/* Header */}
      <header
        className="px-6 py-4 flex items-center justify-between border-b"
        style={{ borderColor: "rgba(255,255,255,0.07)" }}
      >
        <Logo />
        <button
          onClick={() => router.push(locale === "en" ? "/en/dashboard" : "/dashboard")}
          className="text-[13px] text-white/40 hover:text-white/70 transition-colors"
        >
          {t("backToDashboard")}
        </button>
      </header>

      <main className="flex-1 px-5 py-12 max-w-4xl mx-auto w-full">
        {/* Title */}
        <div className="text-center mb-12">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#56db84] mb-3">
            {t("eyebrow")}
          </p>
          <h1 className="text-[28px] font-bold text-white mb-3 leading-tight">
            {t("title")}
          </h1>
          <p className="text-[15px] text-white/40">{t("subtitle")}</p>
        </div>

        {/* Plans grid */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {PLAN_IDS.map((planId) => {
            const config = PLAN_CONFIG[locale][planId];
            const credits = PLAN_CREDITS[planId];
            const accent = PLAN_ACCENT[planId];
            const description = t(`plans.${planId}.description`);
            const features = t.raw(`plans.${planId}.features`) as string[];

            return (
              <div
                key={planId}
                className="relative rounded-2xl p-6 flex flex-col"
                style={{
                  border: accent
                    ? "1.5px solid rgba(86,219,132,0.4)"
                    : "1px solid rgba(255,255,255,0.08)",
                  background: accent
                    ? "linear-gradient(135deg,rgba(86,219,132,0.07),rgba(129,140,248,0.05))"
                    : "rgba(255,255,255,0.02)",
                  boxShadow: accent ? "0 0 32px rgba(86,219,132,0.08)" : "none",
                }}
              >
                {accent && (
                  <div
                    className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[11px] font-bold text-black"
                    style={{ background: "linear-gradient(135deg,#56db84,#818cf8)" }}
                  >
                    {t("mostPopular")}
                  </div>
                )}

                <div className="mb-5">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-white/40 mb-1">
                    {description}
                  </p>
                  <h2 className="text-[20px] font-bold text-white mb-3">
                    {planId === "starter" ? "Starter" : planId === "pro" ? "Pro" : "Multi-Brand"}
                  </h2>
                  <div className="flex items-baseline gap-1">
                    <span className="text-[36px] font-bold text-white leading-none">{config.price}</span>
                    <span className="text-[14px] text-white/40">{config.label}{t("perMonth")}</span>
                  </div>
                  <p className="text-[13px] text-white/40 mt-1">
                    {t("creditsInfo", { credits, images: Math.round(credits / 2) })}
                  </p>
                </div>

                <ul className="flex flex-col gap-2.5 mb-6 flex-1">
                  {features.map((f: string) => (
                    <li key={f} className="flex items-start gap-2.5">
                      <div
                        className="flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center mt-0.5"
                        style={{ background: "linear-gradient(135deg,#56db84,#818cf8)" }}
                      >
                        <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                          <path d="M1 3l2 2 4-4" stroke="#000" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <span className="text-[13px] text-white/65 leading-snug">{f}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleUpgrade(planId)}
                  disabled={loading === planId}
                  className="w-full py-3.5 rounded-xl text-[14px] font-bold transition-all duration-150 active:scale-[0.98] disabled:opacity-60"
                  style={{
                    background: accent
                      ? "linear-gradient(135deg,#56db84,#3ecf8e 60%,#818cf8)"
                      : "rgba(255,255,255,0.07)",
                    color: accent ? "#000" : "rgba(255,255,255,0.8)",
                    border: accent ? "none" : "1px solid rgba(255,255,255,0.1)",
                    boxShadow: accent ? "0 4px 20px rgba(86,219,132,0.25)" : "none",
                  }}
                >
                  {loading === planId ? t("processing") : t("selectPlan")}
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer note */}
        <p className="text-center text-[12px] text-white/20 mt-8">{t("footer")}</p>
      </main>
    </div>
  );
}
