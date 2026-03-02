// STYLE RULE: Never use em dash (—) in any text. Use commas or rewrite naturally.
"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import HeroBackground from "../components/HeroBackground";
import LocaleSwitcher from "../components/LocaleSwitcher";

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="rounded-2xl border border-white/10 bg-[#141414] overflow-hidden cursor-pointer"
      onClick={() => setOpen((v) => !v)}
    >
      <div className="flex items-center justify-between px-6 py-5 gap-4">
        <p className="text-sm font-semibold text-white leading-snug">{question}</p>
        <svg
          width="18" height="18" viewBox="0 0 18 18" fill="none"
          className="flex-shrink-0 transition-transform duration-200"
          style={{ transform: open ? "rotate(45deg)" : "rotate(0deg)" }}
        >
          <path d="M9 3v12M3 9h12" stroke="#56db84" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </div>
      {open && (
        <div className="px-6 pb-5">
          <p className="text-sm leading-relaxed text-zinc-400">{answer}</p>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const t = useTranslations("landing");
  const locale = useLocale();
  const [step, setStep] = useState<1 | 2>(1);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fields, setFields] = useState({
    name: "",
    email: "",
    phone: "",
    businessType: "",
    website: "",
    budget: "",
    teamSize: "",
    frustration: "",
    callOpen: "",
  });
  const [services, setServices] = useState<string[]>([]);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // Fake counter: 175 acum, 3239 la lansare (15 Mar 2026)
  const fakeCount = (() => {
    const start = new Date("2026-02-28T00:00:00").getTime();
    const end = new Date("2026-03-15T00:00:00").getTime();
    const now = Date.now();
    const clamped = Math.min(Math.max(now, start), end);
    return 175 + Math.floor((3239 - 175) * (clamped - start) / (end - start));
  })();

  useEffect(() => {
    const target = new Date("2026-03-15T00:00:00").getTime();
    function tick() {
      const now = Date.now();
      const diff = Math.max(0, target - now);
      setCountdown({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  function toggleService(value: string) {
    setServices((prev) =>
      prev.includes(value) ? prev.filter((s) => s !== value) : [...prev, value]
    );
  }

  function setField(key: keyof typeof fields, value: string) {
    setFields((prev) => ({ ...prev, [key]: value }));
  }

  async function handleStep1(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!fields.name || !fields.email) return;
    setLoading(true);
    try {
      await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: fields.name, email: fields.email, lang: locale }),
      });
    } finally {
      setLoading(false);
      setStep(2);
    }
  }

  async function handleStep2(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...fields, services: services.join(", "), lang: locale }),
      });
    } finally {
      setLoading(false);
      setSubmitted(true);
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white antialiased">
      {/* ── SUCCESS MODAL ── */}
      {submitted && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center px-4"
          style={{ background: "rgba(0,0,0,0.85)" }}
          onClick={() => setSubmitted(false)}
        >
          <div
            className="relative w-full max-w-[480px] rounded-[20px] p-12 text-center"
            style={{ background: "#141414", border: "1px solid rgba(86,219,132,0.3)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSubmitted(false)}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-zinc-500 transition hover:text-white"
              aria-label="Close"
            >
              ✕
            </button>
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#56db84]">
              <span className="text-2xl font-bold text-black">✓</span>
            </div>
            <p className="text-2xl font-bold text-white">
              {t("waitlistSuccess.title")}
            </p>
            <p className="mt-3 leading-relaxed text-zinc-400">
              {t("waitlistSuccess.subtitle")}
            </p>
          </div>
        </div>
      )}

      {/* ── NAV ── */}
      <header className="fixed inset-x-0 top-0 z-50 flex items-center justify-between bg-black/30 px-6 py-4 backdrop-blur-sm">
        <img
          src="https://zeiysldulaawgqdhhfpx.supabase.co/storage/v1/object/public/assets/ai_nescodigital_logo.png"
          alt="Nesco Digital"
          className="h-8 w-auto sm:absolute sm:left-1/2 sm:-translate-x-1/2"
        />
        <LocaleSwitcher />
      </header>

      <main>
        {/* ── 1. HERO ── */}
        <section className="relative overflow-hidden pb-24 pt-40 text-center" style={{ background: "rgb(9,4,0)" }}>
          <HeroBackground />
          <div className="relative mx-auto max-w-3xl px-6" style={{ zIndex: 1 }}>
            {/* Badge + Social proof pe același rând */}
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold text-white">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
                </span>
                <span className="font-bold">{fakeCount}</span>
                {t("footer.signups")}
              </span>
            </div>

            {/* H1 */}
            <h1 className="mt-6 text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl">
              {t("hero.tagline")}
            </h1>

            {/* Subtitlu */}
            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-white">
              {t("hero.subtitle")}
            </p>

            {/* CTA */}
            <a
              href="#waitlist"
              className="mt-8 inline-block rounded-full bg-[#56db84] px-8 py-3.5 text-sm font-semibold text-black shadow-md transition hover:bg-[#3ec96d] active:scale-95"
            >
              {t("hero.cta")}
            </a>

            <p className="mt-3 text-xs text-white">
              {t("hero.ctaNote")}
            </p>

            {/* Countdown */}
            <div className="mt-8 flex items-center justify-center gap-3">
              {[
                { value: countdown.days, label: t("hero.countdown.days") },
                { value: countdown.hours, label: t("hero.countdown.hours") },
                { value: countdown.minutes, label: t("hero.countdown.min") },
                { value: countdown.seconds, label: t("hero.countdown.sec") },
              ].map(({ value, label }, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#141414] border border-white/10">
                    <span className="text-xl font-bold text-[#56db84]">
                      {String(value).padStart(2, "0")}
                    </span>
                  </div>
                  <span className="mt-1 text-[10px] uppercase tracking-widest text-white">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 2. PROBLEM ── */}
        <section className="bg-[#0a0a0a] py-24">
          <div className="mx-auto max-w-3xl px-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#56db84]">
              {t("situation.title")}
            </p>
            <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
              {t("situation.subtitle")}
            </h2>

            <div className="mt-10 space-y-6 text-zinc-400">
              <p className="text-lg leading-relaxed">
                {t("situation.steps.open")}
              </p>

              <ul className="space-y-3 pl-5">
                {[
                  t("situation.steps.explain1"),
                  t("situation.steps.explain2"),
                  t("situation.steps.explain3"),
                  t("situation.steps.result"),
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-500/20 text-xs text-red-400">
                      ✕
                    </span>
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>

              <p className="text-lg leading-relaxed text-zinc-200">
                {t("situation.conclusion")}
              </p>
            </div>
          </div>
        </section>

        {/* ── 3. SOLUTION ── */}
        <section className="py-24">
          <div className="mx-auto max-w-3xl px-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#56db84]">
              {t("difference.title")}
            </p>
            <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
              {t("difference.subtitle")}
            </h2>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-zinc-400">
              {t("difference.body")}
            </p>

            <div className="mt-12 grid gap-6 sm:grid-cols-3">
              {[
                { emoji: "🧠", fkey: "memory" as const },
                { emoji: "✍️", fkey: "focused" as const },
                { emoji: "📅", fkey: "psychology" as const },
                { emoji: "🔍", fkey: "spy" as const },
                { emoji: "🎣", fkey: "hooks" as const },
                { emoji: "🎙️", fkey: "voice" as const },
              ].map(({ emoji, fkey }) => (
                <div key={fkey} className="rounded-2xl border border-white/10 bg-[#141414] p-6">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[#56db84]/10 text-xl">
                    {emoji}
                  </div>
                  <h3 className="font-bold text-white">
                    {t(`difference.features.${fkey}.title` as Parameters<typeof t>[0])}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                    {t(`difference.features.${fkey}.desc` as Parameters<typeof t>[0])}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-10 text-center">
              <a
                href="#waitlist"
                className="inline-block rounded-full bg-[#56db84] px-8 py-3.5 text-sm font-semibold text-black shadow-md transition hover:bg-[#3ec96d] active:scale-95"
              >
                {t("hero.cta")}
              </a>
            </div>
          </div>
        </section>

        {/* ── 4. CE NU AM CONSTRUIT ── */}
        <section className="bg-[#111111] py-24">
          <div className="mx-auto max-w-3xl px-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#56db84]">
              {t("refused.title")}
            </p>
            <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
              {t("refused.title")}
            </h2>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-zinc-400">
              {t("refused.subtitle")}
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {[
                {
                  titleKey: "refused.items.prompts.title",
                  descKey: "refused.items.prompts.desc",
                },
                {
                  titleKey: "refused.items.tools.title",
                  descKey: "refused.items.tools.desc",
                },
                {
                  titleKey: "refused.items.templates.title",
                  descKey: "refused.items.templates.desc",
                },
                {
                  titleKey: "refused.items.chatbot.title",
                  descKey: "refused.items.chatbot.desc",
                },
              ].map(({ titleKey, descKey }) => (
                <div key={titleKey} className="rounded-2xl border border-white/10 bg-[#141414] p-6">
                  <div className="mb-3 flex items-center gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-500/20 text-xs text-red-400">
                      ✕
                    </span>
                    <h3 className="font-bold text-white">{t(titleKey as Parameters<typeof t>[0])}</h3>
                  </div>
                  <p className="text-sm leading-relaxed text-zinc-400">{t(descKey as Parameters<typeof t>[0])}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 5. WAITLIST FORM ── */}
        <section id="waitlist" className="bg-[#111111] py-24 text-white">
          <div className="mx-auto max-w-xl px-6 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#56db84]">
              {t("earlyAccess.title")}
            </p>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
              {t("earlyAccess.subtitle")}
            </h2>
            <p className="mt-4 text-zinc-400">
              {t("earlyAccess.body")}
            </p>

            {/* ── STEP INDICATOR ── */}
            <div className="mt-8 flex items-center justify-center gap-2">
              <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors ${step >= 1 ? "bg-[#56db84] text-black" : "bg-white/10 text-zinc-400"}`}>
                {step > 1 ? "✓" : "1"}
              </div>
              <div className={`h-px w-8 transition-colors ${step > 1 ? "bg-[#56db84]" : "bg-white/10"}`} />
              <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors ${step === 2 ? "bg-[#56db84] text-black" : "bg-white/10 text-zinc-400"}`}>
                2
              </div>
            </div>

            {/* ── STEP 1: Nume + Email ── */}
            {step === 1 && (
              <form onSubmit={handleStep1} className="mt-8 flex flex-col gap-3 text-left">
                <input type="hidden" name="lang" value={locale} />
                <input
                  type="text"
                  required
                  value={fields.name}
                  onChange={(e) => setField("name", e.target.value)}
                  placeholder={t("waitlistForm.name")}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-white placeholder-zinc-500 outline-none ring-[#56db84] focus:ring-2"
                />
                <input
                  type="email"
                  required
                  value={fields.email}
                  onChange={(e) => setField("email", e.target.value)}
                  placeholder={t("waitlistForm.email")}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-white placeholder-zinc-500 outline-none ring-[#56db84] focus:ring-2"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-[#56db84] px-6 py-4 text-base font-bold text-black shadow-lg shadow-[#56db84]/25 transition hover:bg-[#3ec96d] hover:shadow-[#56db84]/40 active:scale-[0.98] disabled:opacity-60"
                >
                  {loading ? t("waitlistForm.cta") : t("waitlistForm.cta")}
                </button>
                <p className="text-center text-xs text-zinc-600">
                  {t("waitlistForm.noSpam")}
                </p>
              </form>
            )}

            {/* ── STEP 2: Detalii suplimentare ── */}
            {step === 2 && (
              <form onSubmit={handleStep2} className="mt-8 flex flex-col gap-3 text-left">
                <p className="text-center text-sm text-zinc-400 mb-1">
                  {t("step2.title")}
                </p>

                <input
                  type="tel"
                  value={fields.phone}
                  onChange={(e) => setField("phone", e.target.value)}
                  placeholder={t("step2.phone")}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-white placeholder-zinc-500 outline-none ring-[#56db84] focus:ring-2"
                />
                <input
                  type="text"
                  value={fields.businessType}
                  onChange={(e) => setField("businessType", e.target.value)}
                  placeholder={t("step2.businessType")}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-white placeholder-zinc-500 outline-none ring-[#56db84] focus:ring-2"
                />

                {/* ── Servicii de interes ── */}
                <div className="rounded-xl border border-white/10 bg-white/5 px-5 py-4">
                  <p className="mb-3 text-sm text-zinc-400">
                    {t("step2.goals")}
                  </p>
                  <div className="flex flex-col gap-2">
                    {[
                      { value: "paid-ads", labelKey: "step2.goalOptions.ads" },
                      { value: "email-marketing", labelKey: "step2.goalOptions.email" },
                      { value: "copywriting", labelKey: "step2.goalOptions.copywriting" },
                      { value: "strategy", labelKey: "step2.goalOptions.strategy" },
                      { value: "social-media", labelKey: "step2.goalOptions.social" },
                      { value: "seo", labelKey: "step2.goalOptions.seo" },
                      { value: "website", labelKey: "step2.goalOptions.web" },
                      { value: "other", labelKey: "step2.goalOptions.other" },
                    ].map(({ value, labelKey }) => (
                      <label key={value} className="flex cursor-pointer items-center gap-3">
                        <span
                          className="flex h-5 w-5 shrink-0 items-center justify-center rounded border border-white/20 transition"
                          style={services.includes(value) ? { background: "#56db84", borderColor: "#56db84" } : {}}
                        >
                          {services.includes(value) && (
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                              <path d="M2 6l3 3 5-5" stroke="#000" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </span>
                        <input
                          type="checkbox"
                          className="sr-only"
                          value={value}
                          checked={services.includes(value)}
                          onChange={() => toggleService(value)}
                        />
                        <span className="text-sm text-zinc-300">{t(labelKey as Parameters<typeof t>[0])}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <input
                  type="url"
                  value={fields.website}
                  onChange={(e) => setField("website", e.target.value)}
                  placeholder={t("step2.website")}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-white placeholder-zinc-500 outline-none ring-[#56db84] focus:ring-2"
                />
                <select
                  value={fields.budget}
                  onChange={(e) => setField("budget", e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#1a1a1a] px-5 py-3 text-sm text-white outline-none ring-[#56db84] focus:ring-2"
                >
                  <option value="" disabled>{t("step2.budget")}</option>
                  <option value="sub-500">{t("step2.budgetOptions.low")}</option>
                  <option value="500-2000">{t("step2.budgetOptions.mid1")}</option>
                  <option value="2000-5000">{t("step2.budgetOptions.mid2")}</option>
                  <option value="5000-15000">{t("step2.budgetOptions.mid3")}</option>
                  <option value="15000+">{t("step2.budgetOptions.high")}</option>
                </select>
                <select
                  value={fields.teamSize}
                  onChange={(e) => setField("teamSize", e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#1a1a1a] px-5 py-3 text-sm text-white outline-none ring-[#56db84] focus:ring-2"
                >
                  <option value="" disabled>{t("step2.teamSize")}</option>
                  <option value="solo">{t("step2.teamOptions.solo")}</option>
                  <option value="2-3">{t("step2.teamOptions.small")}</option>
                  <option value="4-10">{t("step2.teamOptions.medium")}</option>
                  <option value="10+">{t("step2.teamOptions.large")}</option>
                </select>
                <textarea
                  value={fields.frustration}
                  onChange={(e) => setField("frustration", e.target.value)}
                  rows={3}
                  placeholder={t("step2.frustration")}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-white placeholder-zinc-500 outline-none ring-[#56db84] focus:ring-2 resize-none"
                />

                {/* ── Call radio ── */}
                <div className="rounded-xl border border-white/10 bg-white/5 px-5 py-4">
                  <p className="mb-3 text-sm text-zinc-400">
                    {t("step2.call")}
                  </p>
                  <div className="flex gap-6">
                    {[
                      { value: "yes", labelKey: "step2.yes" },
                      { value: "no", labelKey: "step2.no" },
                    ].map(({ value, labelKey }) => (
                      <label key={value} className="flex cursor-pointer items-center gap-2">
                        <span
                          className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-white/20 transition"
                          style={fields.callOpen === value ? { borderColor: "#56db84" } : {}}
                        >
                          {fields.callOpen === value && (
                            <span className="h-3 w-3 rounded-full" style={{ background: "#56db84" }} />
                          )}
                        </span>
                        <input
                          type="radio"
                          className="sr-only"
                          name="callOpen"
                          value={value}
                          checked={fields.callOpen === value}
                          onChange={() => setField("callOpen", value)}
                        />
                        <span className="text-sm text-zinc-300">{t(labelKey as Parameters<typeof t>[0])}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-[#56db84] px-6 py-4 text-base font-bold text-black shadow-lg shadow-[#56db84]/25 transition hover:bg-[#3ec96d] hover:shadow-[#56db84]/40 active:scale-[0.98] disabled:opacity-60"
                >
                  {loading ? t("waitlistForm.cta") : t("step2.submit")}
                </button>

                <button
                  type="button"
                  onClick={() => setSubmitted(true)}
                  className="text-center text-xs text-zinc-500 transition hover:text-zinc-300"
                >
                  {t("step2.skip")}
                </button>
              </form>
            )}
          </div>
        </section>

        {/* ── 5B. TESTIMONIALE ── */}
        <section className="bg-[#0a0a0a] py-24">
          <div className="mx-auto max-w-3xl px-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#56db84]">
              {t("testimonials.title")}
            </p>
            <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
              {t("testimonials.subtitle")}
            </h2>
            <div className="mt-10 grid gap-5 sm:grid-cols-2">
              {[
                {
                  quoteKey: "testimonials.items.andreea.text",
                  name: "Andreea M.",
                  roleKey: "testimonials.items.andreea.role",
                  initial: "A",
                },
                {
                  quoteKey: "testimonials.items.radu.text",
                  name: "Radu P.",
                  roleKey: "testimonials.items.radu.role",
                  initial: "R",
                },
                {
                  quoteKey: "testimonials.items.cristina.text",
                  name: "Cristina V.",
                  roleKey: "testimonials.items.cristina.role",
                  initial: "C",
                },
                {
                  quoteKey: "testimonials.items.dan.text",
                  name: "Dan S.",
                  roleKey: "testimonials.items.dan.role",
                  initial: "D",
                },
              ].map(({ quoteKey, name, roleKey, initial }) => (
                <div key={name} className="rounded-2xl border border-white/10 bg-[#141414] p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-black" style={{ background: "linear-gradient(135deg,#56db84,#818cf8)" }}>
                      {initial}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{name}</p>
                      <p className="text-xs text-zinc-500">{t(roleKey as Parameters<typeof t>[0])}</p>
                    </div>
                    <div className="ml-auto flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} width="12" height="12" viewBox="0 0 12 12" fill="#56db84"><path d="M6 1l1.4 2.8 3.1.4-2.2 2.2.5 3.1L6 8l-2.8 1.5.5-3.1L1.5 4.2l3.1-.4z"/></svg>
                      ))}
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed text-zinc-300 italic">"{t(quoteKey as Parameters<typeof t>[0])}"</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 6. PREVIEW DASHBOARD ── */}
        <section className="py-24" style={{ background: "rgb(9,4,0)" }}>
          <div className="mx-auto max-w-3xl px-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#56db84]">
              {t("demo.title")}
            </p>
            <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
              {t("demo.subtitle")}
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-zinc-400">
              {t("demo.body")}
            </p>
            {/* Dashboard UI mockup */}
            <div className="mt-10 rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(86,219,132,0.2)", background: "#0d0d0d", boxShadow: "0 0 60px rgba(86,219,132,0.06)" }}>
              {/* Fake browser bar */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
                <div className="w-3 h-3 rounded-full bg-red-500/40" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/40" />
                <div className="w-3 h-3 rounded-full bg-green-500/40" />
                <div className="ml-3 flex-1 rounded-md px-3 py-1 text-xs text-zinc-600" style={{ background: "rgba(255,255,255,0.04)" }}>
                  ai.nescodigital.com/dashboard
                </div>
              </div>
              {/* Fake dashboard content */}
              <div className="p-6 sm:p-8">
                <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
                  <div>
                    <div className="h-5 w-40 rounded-md bg-white/10 mb-2" />
                    <div className="h-3 w-56 rounded-md bg-white/5" />
                  </div>
                  <div className="flex items-center gap-3 rounded-xl px-4 py-2.5" style={{ background: "#111113", border: "1px solid rgba(86,219,132,0.3)" }}>
                    <span className="text-[#56db84] font-bold text-lg">10</span>
                    <span className="text-xs text-white/40">{t("demo.creditsLeft")}</span>
                    <span className="text-xs font-bold text-black px-2 py-1 rounded-md" style={{ background: "#56db84" }}>+ {t("demo.buy")}</span>
                  </div>
                </div>
                <div className="rounded-xl p-4 mb-4" style={{ border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)" }}>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="h-2.5 w-20 rounded bg-white/10 mb-2" />
                      <div className="h-10 rounded-lg" style={{ background: "rgba(255,255,255,0.04)", border: "1.5px solid rgba(255,255,255,0.08)" }}>
                        <div className="h-full flex items-center px-3">
                          <span className="text-xs text-zinc-500">📸 Post Instagram</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="h-2.5 w-16 rounded bg-white/10 mb-2" />
                      <div className="h-10 rounded-lg" style={{ background: "rgba(255,255,255,0.04)", border: "1.5px solid rgba(255,255,255,0.08)" }}>
                        <div className="h-full flex items-center px-3">
                          <span className="text-xs text-zinc-500">💰 {t("demo.generate")}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="h-16 rounded-lg mb-4" style={{ background: "rgba(255,255,255,0.02)", border: "1.5px solid rgba(255,255,255,0.06)" }}>
                    <div className="p-3">
                      <span className="text-xs text-zinc-600">{t("demo.generate")}...</span>
                    </div>
                  </div>
                  <div className="h-11 rounded-xl flex items-center justify-center gap-2" style={{ background: "linear-gradient(135deg,#56db84,#818cf8)" }}>
                    <span className="text-sm font-bold text-black">⚡ {t("demo.generate")}</span>
                  </div>
                </div>
                {/* Output preview */}
                <div className="rounded-xl p-4" style={{ border: "1.5px solid rgba(86,219,132,0.2)", background: "linear-gradient(135deg,rgba(86,219,132,0.04),rgba(129,140,248,0.03))" }}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full" style={{ background: "linear-gradient(135deg,#56db84,#818cf8)" }} />
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-white/30">{t("demo.generatedContent")}</span>
                    <div className="ml-auto text-[11px] font-semibold px-2 py-0.5 rounded-md text-zinc-400" style={{ background: "rgba(255,255,255,0.06)" }}>
                      {t("demo.copy")}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="h-2.5 w-full rounded bg-white/10" />
                    <div className="h-2.5 w-5/6 rounded bg-white/8" />
                    <div className="h-2.5 w-4/6 rounded bg-white/6" />
                    <div className="h-2.5 w-3/4 rounded bg-white/8 mt-2" />
                    <div className="h-2.5 w-full rounded bg-white/6" />
                    <div className="h-2.5 w-2/3 rounded bg-white/5 mt-2 text-[#56db84]" style={{ background: "rgba(86,219,132,0.15)" }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 7. PREȚ MINIM ── */}
        <section className="bg-[#0a0a0a] py-16">
          <div className="mx-auto max-w-3xl px-6 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#56db84] mb-3">
              {t("pricing.title")}
            </p>
            <p className="text-2xl font-bold text-white mb-2">
              {t("pricing.subtitle")}
            </p>
            <p className="text-zinc-400 mb-6">
              {t("pricing.body")}
            </p>
            <a
              href="/pricing"
              className="inline-block rounded-full border border-[#56db84]/40 px-6 py-2.5 text-sm font-semibold text-[#56db84] transition hover:bg-[#56db84]/10"
            >
              {t("pricing.cta")}
            </a>
          </div>
        </section>

        {/* ── 8. FAQ ── */}
        <section className="bg-[#111111] py-24">
          <div className="mx-auto max-w-2xl px-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#56db84] mb-3">FAQ</p>
            <h2 className="text-3xl font-bold text-white mb-10">
              {t("faq.title")}
            </h2>
            <div className="space-y-4">
              {[
                { qKey: "faq.items.q1.q", aKey: "faq.items.q1.a" },
                { qKey: "faq.items.q2.q", aKey: "faq.items.q2.a" },
                { qKey: "faq.items.q3.q", aKey: "faq.items.q3.a" },
                { qKey: "faq.items.q4.q", aKey: "faq.items.q4.a" },
                { qKey: "faq.items.q5.q", aKey: "faq.items.q5.a" },
              ].map(({ qKey, aKey }, i) => (
                <FaqItem
                  key={i}
                  question={t(qKey as Parameters<typeof t>[0])}
                  answer={t(aKey as Parameters<typeof t>[0])}
                />
              ))}
            </div>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer className="border-t border-white/10 py-8 text-center text-xs text-zinc-600">
          © {new Date().getFullYear()} Nesco Digital. {t("footer.rights")}
        </footer>
      </main>
    </div>
  );
}
