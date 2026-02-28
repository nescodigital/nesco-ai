// STYLE RULE: Never use em dash (—) in any text. Use commas or rewrite naturally.
"use client";

import { useState } from "react";
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
        body: JSON.stringify({ ...fields, lang }),
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

          <p className="mt-4 text-xs text-zinc-500">
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
          </div>
        </section>

        {/* ── 4. WAITLIST FORM ── */}
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
                <select
                  value={fields.callOpen}
                  onChange={(e) => setField("callOpen", e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#1a1a1a] px-5 py-3 text-sm text-white outline-none ring-[#56db84] focus:ring-2"
                >
                  <option value="">{t("Ești deschis la un call de 15 min? (opțional)", "Open to a 15-min call? (optional)")}</option>
                  <option value="yes">{t("Da, cu plăcere", "Yes, happy to")}</option>
                  <option value="no">{t("Nu, mersi", "No, thanks")}</option>
                </select>

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
