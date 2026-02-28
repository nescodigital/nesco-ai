// STYLE RULE: Never use em dash (—) in any text. Use commas or rewrite naturally.
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

type Lang = "ro" | "en";

export default function Home() {
  const [lang, setLang] = useState<Lang>("ro");
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
  const [waitlistCount, setWaitlistCount] = useState(0);

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

  useEffect(() => {
    fetch("/api/waitlist-count")
      .then((r) => r.json())
      .then((data) => setWaitlistCount(data.count ?? 0))
      .catch(() => setWaitlistCount(0));
  }, []);

  function toggleService(value: string) {
    setServices((prev) =>
      prev.includes(value) ? prev.filter((s) => s !== value) : [...prev, value]
    );
  }

  const t = (ro: string, en: string) => (lang === "ro" ? ro : en);

  function setField(key: keyof typeof fields, value: string) {
    setFields((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!fields.email) return;
    setLoading(true);
    try {
      await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...fields, services: services.join(", "), lang }),
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
              {t("Locul tău e rezervat.", "Your spot is reserved.")}
            </p>
            <p className="mt-3 leading-relaxed text-zinc-400">
              {t(
                "Vei fi printre primii care testează și vei primi cel mai bun preț disponibil.",
                "You'll be among the first to test it and you'll get the best price available."
              )}
            </p>
          </div>
        </div>
      )}

      {/* ── NAV ── */}
      <header className="fixed inset-x-0 top-0 z-50 flex items-center justify-between border-b border-white/10 bg-[#0a0a0a]/80 px-6 py-4 backdrop-blur">
        <div className="w-16" />
        <Image
          src="/nesco-logo.png"
          alt="Nesco Digital"
          height={32}
          width={241}
          className="h-8 w-auto"
        />
        <button
          onClick={() => setLang(lang === "ro" ? "en" : "ro")}
          className="rounded-full border border-white/20 px-3 py-1 text-xs font-semibold text-zinc-400 transition hover:border-white/40 hover:text-white"
        >
          {lang === "ro" ? "EN" : "RO"}
        </button>
      </header>

      <main className="pt-20">
        {/* ── 1. HERO ── */}
        <section className="mx-auto max-w-3xl px-6 pb-24 pt-24 text-center">
          <span className="inline-block rounded-full border border-[#56db84]/40 bg-[#56db84]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[#56db84]">
            Nesco Digital AI
          </span>

          <h1 className="mt-6 text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl">
            {t(
              "Un singur workspace. Tot marketingul tău, înțeles.",
              "One workspace. Your entire marketing, understood."
            )}
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-zinc-400">
            {t(
              "Un AI care îți cunoaște brandul, audiența și ofertele. Nu mai explici nimic. Creezi direct.",
              "AI that knows your brand, audience, and offers. No more explaining. Just create."
            )}
          </p>

          <a
            href="#waitlist"
            className="mt-8 inline-block rounded-full bg-[#56db84] px-8 py-3.5 text-sm font-semibold text-black shadow-md transition hover:bg-[#3ec96d] active:scale-95"
          >
            {t("Înscrie-te pe listă", "Join the Waitlist")}
          </a>

          {/* ── Countdown ── */}
          <div className="mt-8 flex items-center justify-center gap-3">
            {[
              { value: countdown.days, label: t("zile", "days") },
              { value: countdown.hours, label: t("ore", "hours") },
              { value: countdown.minutes, label: t("min", "min") },
              { value: countdown.seconds, label: t("sec", "sec") },
            ].map(({ value, label }, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#141414] border border-white/10">
                  <span className="text-xl font-bold text-[#56db84]">
                    {String(value).padStart(2, "0")}
                  </span>
                </div>
                <span className="mt-1 text-[10px] uppercase tracking-widest text-zinc-500">{label}</span>
              </div>
            ))}
          </div>

          {/* ── Live counter ── */}
          <p className="mt-4 text-xs text-zinc-500">
            <span className="inline-block h-2 w-2 rounded-full bg-red-500 mr-1.5 align-middle" />
            LIVE · {waitlistCount} {t("persoane înscrise deja", "people already signed up")}
          </p>

          <p className="mt-2 text-xs text-zinc-500">
            {t("Acces anticipat gratuit · Fără card.", "Free early access · No credit card.")}
          </p>
        </section>

        {/* ── 2. PROBLEM ── */}
        <section className="bg-[#111111] py-24">
          <div className="mx-auto max-w-3xl px-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#56db84]">
              {t("Situația actuală", "The current situation")}
            </p>
            <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
              {t("Știi deja cum merge...", "You already know how this goes...")}
            </h2>

            <div className="mt-10 space-y-6 text-zinc-400">
              <p className="text-lg leading-relaxed">
                {t(
                  "Deschizi ChatGPT. Sau Claude. Sau oricare alt instrument.",
                  "You open ChatGPT. Or Claude. Or whatever tool you're using."
                )}
              </p>

              <ul className="space-y-3 pl-5">
                {[
                  t("Explici brandul tău. Din nou.", "You explain your brand. Again."),
                  t("Explici audiența. Din nou.", "You explain your audience. Again."),
                  t("Explici oferta, tonul, contextul. Din nou.", "You explain the offer, the tone, the context. Again."),
                  t(
                    "45 de minute mai târziu... ai un text mediocru care nu sună ca tine.",
                    "45 minutes later... you have generic copy that sounds nothing like you."
                  ),
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
                {t(
                  "Nu AI-ul e problema. Problema e că îl resetezi de fiecare dată. Îl tratezi ca pe un freelancer nou, și el te tratează la fel.",
                  "It's not the AI that's broken. The problem is you reset it every single time. You treat it like a new freelancer, and it treats you the same way."
                )}
              </p>
            </div>
          </div>
        </section>

        {/* ── 3. SOLUTION ── */}
        <section className="py-24">
          <div className="mx-auto max-w-3xl px-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#56db84]">
              {t("De ce e diferit", "Why it's different")}
            </p>
            <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
              {t(
                "Un AI care te cunoaște. Și nu uită.",
                "An AI that knows you. And never forgets."
              )}
            </h2>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-zinc-400">
              {t(
                "Nu e un prompt mai lung. E un sistem care gândește marketingul tău de la zero, cu contextul tău deja înăuntru.",
                "It's not a longer prompt. It's a system that thinks your marketing from scratch, with your context already baked in."
              )}
            </p>

            <div className="mt-12 grid gap-6 sm:grid-cols-3">
              {/* Card 1 */}
              <div className="rounded-2xl border border-white/10 bg-[#141414] p-6">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[#56db84]/10 text-xl">
                  🧠
                </div>
                <h3 className="font-bold text-white">
                  {t("Memorie permanentă de business", "Permanent business memory")}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                  {t(
                    "Brandul tău, audiența, ofertele, tonul de voce. Stocate o dată, folosite de fiecare dată.",
                    "Your brand, audience, offers, and tone of voice. Stored once, applied every time."
                  )}
                </p>
              </div>

              {/* Card 2 */}
              <div className="rounded-2xl border border-white/10 bg-[#141414] p-6">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[#56db84]/10 text-xl">
                  🎯
                </div>
                <h3 className="font-bold text-white">
                  {t("Construit doar pentru marketing", "Built solely for marketing")}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                  {t(
                    "Nu e un tool general. Fiecare funcție e gândită pentru campanii, email-uri, reclame și pagini care convertesc.",
                    "Not a general-purpose tool. Every feature is built for campaigns, emails, ads, and pages that convert."
                  )}
                </p>
              </div>

              {/* Card 3 */}
              <div className="rounded-2xl border border-white/10 bg-[#141414] p-6">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[#56db84]/10 text-xl">
                  💡
                </div>
                <h3 className="font-bold text-white">
                  {t("Psihologia cumpărătorului integrată", "Buyer psychology built-in")}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                  {t(
                    "Modelul înțelege de ce cumpără oamenii și îți ajustează mesajele în consecință, nu doar le formatează.",
                    "The model understands why people buy and shapes your messaging accordingly, not just formats it."
                  )}
                </p>
              </div>
            </div>

            <div className="mt-10 text-center">
              <a
                href="#waitlist"
                className="inline-block rounded-full bg-[#56db84] px-8 py-3.5 text-sm font-semibold text-black shadow-md transition hover:bg-[#3ec96d] active:scale-95"
              >
                {t("Rezervă-mi locul gratuit", "Reserve My Spot Free")}
              </a>
            </div>
          </div>
        </section>

        {/* ── 4. CE NU AM CONSTRUIT ── */}
        <section className="bg-[#111111] py-24">
          <div className="mx-auto max-w-3xl px-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#56db84]">
              {t("Decizii conștiente", "Conscious decisions")}
            </p>
            <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
              {t("Ce am refuzat să construim", "What We Refused to Build")}
            </h2>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-zinc-400">
              {t(
                "Majoritatea tool-urilor AI adaugă complexitate. Noi am ales altfel.",
                "Most AI tools add complexity. We chose differently."
              )}
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {[
                {
                  ro: "O bibliotecă de prompturi",
                  en: "A prompt library",
                  descRo: "Prompturile sunt un plasture pe un proces stricat.",
                  descEn: "Prompts are a band-aid for a broken process.",
                },
                {
                  ro: "14 tool-uri lipite laolaltă",
                  en: "14 tools duct-taped together",
                  descRo: "Am construit un singur produs care face un lucru excepțional de bine.",
                  descEn: "We built one product that does one thing exceptionally well.",
                },
                {
                  ro: "Template-uri generice",
                  en: "Generic templates",
                  descRo: "Template-urile există când AI-ul nu îți cunoaște business-ul. Al nostru îl cunoaște.",
                  descEn: "Templates exist when AI doesn't know your business. Ours does.",
                },
                {
                  ro: "Un chatbot general",
                  en: "A general chatbot",
                  descRo: "Nu îți răspunde la orice. Îți construiește marketingul.",
                  descEn: "It doesn't answer everything. It builds your marketing.",
                },
              ].map(({ ro, en, descRo, descEn }) => (
                <div key={ro} className="rounded-2xl border border-white/10 bg-[#141414] p-6">
                  <div className="mb-3 flex items-center gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-500/20 text-xs text-red-400">
                      ✕
                    </span>
                    <h3 className="font-bold text-white">{t(ro, en)}</h3>
                  </div>
                  <p className="text-sm leading-relaxed text-zinc-400">{t(descRo, descEn)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 5. WAITLIST FORM ── */}
        <section id="waitlist" className="bg-[#111111] py-24 text-white">
          <div className="mx-auto max-w-xl px-6 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#56db84]">
              {t("Acces anticipat", "Early access")}
            </p>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
              {t("Fii primul care încearcă.", "Be the first to try it.")}
            </h2>
            <p className="mt-4 text-zinc-400">
              {t(
                "Înscriere gratuită. Vei primi acces înaintea lansării publice și vei influența ce construim.",
                "Free to join. You'll get access before the public launch and help shape what we build."
              )}
            </p>

            <form
                onSubmit={handleSubmit}
                className="mt-10 flex flex-col gap-3 text-left"
              >
                <input type="hidden" name="lang" value={lang} />

                <input
                  type="text"
                  required
                  value={fields.name}
                  onChange={(e) => setField("name", e.target.value)}
                  placeholder={t("Nume *", "Name *")}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-white placeholder-zinc-500 outline-none ring-[#56db84] focus:ring-2"
                />
                <input
                  type="email"
                  required
                  value={fields.email}
                  onChange={(e) => setField("email", e.target.value)}
                  placeholder={t("Email *", "Email *")}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-white placeholder-zinc-500 outline-none ring-[#56db84] focus:ring-2"
                />
                <input
                  type="tel"
                  value={fields.phone}
                  onChange={(e) => setField("phone", e.target.value)}
                  placeholder={t("Telefon", "Phone")}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-white placeholder-zinc-500 outline-none ring-[#56db84] focus:ring-2"
                />
                <input
                  type="text"
                  value={fields.businessType}
                  onChange={(e) => setField("businessType", e.target.value)}
                  placeholder={t("Tip business (ex: eCommerce, servicii, SaaS)", "Business type (e.g. eCommerce, services, SaaS)")}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-white placeholder-zinc-500 outline-none ring-[#56db84] focus:ring-2"
                />
                {/* ── Servicii de interes ── */}
                <div className="rounded-xl border border-white/10 bg-white/5 px-5 py-4">
                  <p className="mb-3 text-sm text-zinc-400">
                    {t(
                      "Ce vrei să faci cu AI-ul? (selectează tot ce se aplică)",
                      "What do you want to use AI for? (select all that apply)"
                    )}
                  </p>
                  <div className="flex flex-col gap-2">
                    {[
                      { value: "paid-ads", ro: "Reclame plătite (Meta, Google, TikTok)", en: "Paid ads (Meta, Google, TikTok)" },
                      { value: "email-marketing", ro: "Email marketing și automatizări", en: "Email marketing & automations" },
                      { value: "copywriting", ro: "Copywriting și texte de vânzare", en: "Copywriting & sales copy" },
                      { value: "strategy", ro: "Strategie de marketing", en: "Marketing strategy" },
                      { value: "social-media", ro: "Social media și conținut", en: "Social media & content" },
                      { value: "seo", ro: "SEO și conținut organic", en: "SEO & organic content" },
                      { value: "website", ro: "Website și landing pages", en: "Website & landing pages" },
                      { value: "other", ro: "Altul", en: "Other" },
                    ].map(({ value, ro, en }) => (
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
                        <span className="text-sm text-zinc-300">{t(ro, en)}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <input
                  type="url"
                  value={fields.website}
                  onChange={(e) => setField("website", e.target.value)}
                  placeholder={t("Website (opțional)", "Website (optional)")}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-white placeholder-zinc-500 outline-none ring-[#56db84] focus:ring-2"
                />
                <select
                  value={fields.budget}
                  onChange={(e) => setField("budget", e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#1a1a1a] px-5 py-3 text-sm text-white outline-none ring-[#56db84] focus:ring-2"
                >
                  <option value="" disabled>{t("Buget lunar marketing", "Monthly marketing budget")}</option>
                  <option value="sub-500">{t("Sub 500€", "Under €500")}</option>
                  <option value="500-2000">{t("500€ - 2.000€", "€500 - €2,000")}</option>
                  <option value="2000-5000">{t("2.000€ - 5.000€", "€2,000 - €5,000")}</option>
                  <option value="5000-15000">{t("5.000€ - 15.000€", "€5,000 - €15,000")}</option>
                  <option value="15000+">{t("15.000€+", "€15,000+")}</option>
                </select>
                <select
                  value={fields.teamSize}
                  onChange={(e) => setField("teamSize", e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#1a1a1a] px-5 py-3 text-sm text-white outline-none ring-[#56db84] focus:ring-2"
                >
                  <option value="" disabled>{t("Mărimea echipei", "Team size")}</option>
                  <option value="solo">{t("Solo / Fondator", "Solo / Founder")}</option>
                  <option value="2-3">{t("2-3 persoane", "2-3 people")}</option>
                  <option value="4-10">{t("4-10 persoane", "4-10 people")}</option>
                  <option value="10+">{t("10+ persoane", "10+ people")}</option>
                </select>
                <textarea
                  value={fields.frustration}
                  onChange={(e) => setField("frustration", e.target.value)}
                  rows={3}
                  placeholder={t("Care e cea mai mare frustrare cu AI-ul actual? (opțional)", "What's your biggest frustration with AI tools today? (optional)")}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-white placeholder-zinc-500 outline-none ring-[#56db84] focus:ring-2 resize-none"
                />
                {/* ── Call radio ── */}
                <div className="rounded-xl border border-white/10 bg-white/5 px-5 py-4">
                  <p className="mb-3 text-sm text-zinc-400">
                    {t(
                      "Ești deschis la un call de 15 min cu echipa noastră?",
                      "Open to a 15-min call with our team?"
                    )}
                  </p>
                  <div className="flex gap-6">
                    {[
                      { value: "yes", ro: "Da", en: "Yes" },
                      { value: "no", ro: "Nu", en: "No" },
                    ].map(({ value, ro, en }) => (
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
                        <span className="text-sm text-zinc-300">{t(ro, en)}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-[#56db84] px-6 py-3 text-sm font-semibold text-black transition hover:bg-[#3ec96d] disabled:opacity-60"
                >
                  {loading ? t("Se trimite...", "Sending...") : t("Înscrie-mă", "Join now")}
                </button>
              </form>

            <p className="mt-4 text-xs text-zinc-600">
              {t(
                "Nu trimitem spam. Niciodată.",
                "We never send spam. Ever."
              )}
            </p>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer className="border-t border-white/10 py-8 text-center text-xs text-zinc-600">
          © {new Date().getFullYear()} Nesco Digital. {t("Toate drepturile rezervate.", "All rights reserved.")}
        </footer>
      </main>
    </div>
  );
}
