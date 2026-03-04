"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Logo from "@/app/components/Logo";

const FOR_WHO = [
  {
    icon: "🏪",
    title: "Antreprenori cu mai multe business-uri",
    desc: "Ai un magazin online, un serviciu de consultanta si un cont personal de creator. Fiecare cu alt ton, alt public, alta strategie. Un singur workspace pentru toate.",
  },
  {
    icon: "📱",
    title: "Manageri de social media (freelanceri)",
    desc: "Gestionezi 3-5 clienti. Acum ai profiluri separate pentru fiecare, cu memoria lor de brand, tonul lor si calendarul lor. Nu mai confunzi clientii.",
  },
  {
    icon: "🏢",
    title: "Agentii mici de marketing",
    desc: "Echipa de 2-4 oameni, 5-10 clienti activi. Multi-Brand e punctul de intrare. Poti scala la planul Enterprise cand cresti.",
  },
  {
    icon: "👨‍💼",
    title: "Antreprenori seriali",
    desc: "Lansezi produse noi frecvent. Fiecare brand are identitate separata. Sistemul pastreaza profilul, mesajele si strategia fiecarui brand fara sa amestece nimic.",
  },
];

const FEATURES = [
  {
    icon: "🏷️",
    title: "5 branduri separate cu profiluri independente",
    desc: "Fiecare brand are memoria lui, tonul lui, publicul lui si calendarul lui. Schimbi brandul cu un click si totul se adapteaza automat.",
  },
  {
    icon: "📅",
    title: "Calendare editoriale separate",
    desc: "Brand A posteaza de 5 ori pe saptamana. Brand B face un newsletter lunar. Calendarul fiecaruia e independent, fara sa se incurce.",
  },
  {
    icon: "🎙️",
    title: "Voice Cloning per brand",
    desc: "Brand-ul de tech scrie formal si concis. Brand-ul de fashion scrie entuziastist si relaxat. Clonezi stilul pentru fiecare brand in parte.",
  },
  {
    icon: "🔍",
    title: "Spy AI pentru fiecare competitor",
    desc: "Analizeaza competitorii fiecarui brand separat. Strategia de continut a competitorului lui Brand A nu se amesteca cu cea a lui Brand B.",
  },
  {
    icon: "600",
    title: "600 credite/luna pentru toate brandurile",
    desc: "Suficient pentru 300 postari, 100 emailuri sau orice combinatie. Creditele se impart intre branduri dupa cum ai nevoie.",
  },
  {
    icon: "⚡",
    title: "Switch rapid intre branduri",
    desc: "Brand Switcher vizibil in dashboard. Un click si esti in contextul altui brand: alta memorie, alt profil, alt calendar.",
  },
];

const COMPARISON = [
  { feature: "Branduri simultane", free: "1", pro: "1", multi: "5" },
  { feature: "Credite/luna", free: "10 (trial)", pro: "200", multi: "600" },
  { feature: "Voice Cloning", free: "—", pro: "✓", multi: "✓ (per brand)" },
  { feature: "Spy AI", free: "✓", pro: "✓", multi: "✓" },
  { feature: "Calendar editorial", free: "✓", pro: "✓", multi: "✓ (per brand)" },
  { feature: "Memorie de brand", free: "✓", pro: "✓", multi: "✓ (per brand)" },
  { feature: "Pret fondator", free: "—", pro: "99 RON/luna", multi: "199 RON/luna" },
];

const FAQS = [
  {
    q: "Pot adauga branduri treptat, nu toate odata?",
    a: "Da. Creezi un brand, il configurezi complet, il folosesti. Adaugi al doilea cand ai nevoie. Nu trebuie sa ai 5 branduri active de la inceput.",
  },
  {
    q: "Clientii mei pot accesa propriul brand?",
    a: "In planul Multi-Brand, brandurile sunt accesate din contul tau. Clientii nu au acces separat. Daca ai nevoie de sub-conturi separate pentru clienti, planul Enterprise (in curand) e potrivit.",
  },
  {
    q: "Creditele se impart sau fiecare brand are ale lui?",
    a: "Creditele sunt in comun si se impart intre branduri dupa cum aloci. 600 credite pot merge toate la Brand A sau distribuit 200 + 200 + 200 la 3 branduri.",
  },
  {
    q: "Pot trece de la Pro la Multi-Brand fara sa pierd datele?",
    a: "Da. Upgrade-ul pastreaza toate datele: memoria de brand, istoricul de generari, calendarul. Adaugi pur si simplu branduri noi.",
  },
  {
    q: "Ce se intampla daca am nevoie de mai mult de 5 branduri?",
    a: "Lucram la un plan Enterprise cu numar nelimitat de branduri si sub-conturi pentru clienti. Scrie-ne la contact@nescodigital.com daca esti interesat.",
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="rounded-2xl border border-white/10 bg-[#141414] overflow-hidden cursor-pointer"
      onClick={() => setOpen((v) => !v)}
    >
      <div className="flex items-center justify-between px-6 py-5 gap-4">
        <p className="text-sm font-semibold text-white leading-snug">{q}</p>
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
          <p className="text-sm leading-relaxed text-zinc-400">{a}</p>
        </div>
      )}
    </div>
  );
}

export default function AgentiePage() {
  const router = useRouter();

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: "radial-gradient(ellipse at 50% 0%, rgba(86,219,132,0.05) 0%, rgba(129,140,248,0.04) 30%, transparent 60%), #0a0a0a",
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
          onClick={() => router.push("/login")}
          className="text-[13px] font-medium px-4 py-2 rounded-lg transition-colors"
          style={{ background: "rgba(86,219,132,0.1)", color: "#56db84", border: "1px solid rgba(86,219,132,0.2)" }}
        >
          Intra in cont
        </button>
      </header>

      <main className="flex-1 px-5">

        {/* Hero */}
        <section className="max-w-3xl mx-auto text-center pt-16 pb-12">
          <div
            className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full text-[11px] font-bold"
            style={{ background: "rgba(86,219,132,0.1)", border: "1px solid rgba(86,219,132,0.25)", color: "#56db84" }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#56db84] animate-pulse" />
            Multi-Brand
          </div>

          <h1 className="text-[36px] sm:text-[52px] font-extrabold leading-[1.1] tracking-[-0.03em] text-white mb-6">
            5 branduri.{" "}
            <span style={{ background: "linear-gradient(135deg,#56db84,#818cf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Un singur workspace.
            </span>
          </h1>

          <p className="text-[17px] text-white/50 leading-relaxed max-w-xl mx-auto mb-8">
            Gestionezi mai multe business-uri sau clienti? Fiecare brand are profilul lui, tonul lui, calendarul lui. Tu doar schimbi brandul si generezi.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <button
              onClick={() => router.push("/pricing")}
              className="px-7 py-3.5 rounded-xl text-[15px] font-bold text-black transition-all hover:opacity-90"
              style={{ background: "linear-gradient(135deg,#56db84,#3ecf8e 60%,#818cf8)", boxShadow: "0 4px 24px rgba(86,219,132,0.3)" }}
            >
              Vezi planul Multi-Brand
            </button>
            <button
              onClick={() => router.push("/signup")}
              className="px-5 py-3.5 rounded-xl text-[14px] font-medium text-white/70 transition-colors hover:text-white"
              style={{ border: "1px solid rgba(255,255,255,0.1)" }}
            >
              Incearca gratuit intai
            </button>
          </div>
        </section>

        {/* For who */}
        <section className="max-w-3xl mx-auto mb-16">
          <h2 className="text-center text-[22px] sm:text-[28px] font-bold text-white mb-2">Cine foloseste Multi-Brand</h2>
          <p className="text-center text-[14px] text-white/40 mb-10">Potrivit daca gestionezi mai mult de un brand sau mai multi clienti.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {FOR_WHO.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl p-5"
                style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}
              >
                <div className="text-2xl mb-3">{item.icon}</div>
                <h3 className="text-[15px] font-bold text-white mb-2">{item.title}</h3>
                <p className="text-[13px] text-white/45 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="max-w-3xl mx-auto mb-16">
          <h2 className="text-center text-[22px] sm:text-[28px] font-bold text-white mb-2">Ce primesti in Multi-Brand</h2>
          <p className="text-center text-[14px] text-white/40 mb-10">Tot ce are planul Pro, multiplicat pentru 5 branduri.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl p-5"
                style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}
              >
                <div className="text-2xl mb-3">{f.icon}</div>
                <h3 className="text-[15px] font-bold text-white mb-2">{f.title}</h3>
                <p className="text-[13px] text-white/45 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Comparison table */}
        <section className="max-w-2xl mx-auto mb-16">
          <h2 className="text-center text-[22px] font-bold text-white mb-8">Comparatie planuri</h2>
          <div
            className="rounded-2xl overflow-hidden"
            style={{ border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <div
              className="grid grid-cols-4 px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-white/30"
              style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.07)" }}
            >
              <div>Functionalitate</div>
              <div className="text-center">Trial</div>
              <div className="text-center">Pro</div>
              <div className="text-center" style={{ color: "#56db84" }}>Multi-Brand</div>
            </div>
            {COMPARISON.map((row, i) => (
              <div
                key={row.feature}
                className="grid grid-cols-4 px-5 py-3.5 text-[13px]"
                style={{
                  borderBottom: i < COMPARISON.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                  background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)",
                }}
              >
                <div className="text-white/60">{row.feature}</div>
                <div className="text-center text-white/35">{row.free}</div>
                <div className="text-center text-white/60">{row.pro}</div>
                <div className="text-center font-semibold" style={{ color: "#56db84" }}>{row.multi}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing CTA */}
        <section className="max-w-lg mx-auto mb-16 text-center">
          <div
            className="rounded-2xl p-8"
            style={{
              background: "linear-gradient(135deg,rgba(86,219,132,0.07),rgba(129,140,248,0.05))",
              border: "1.5px solid rgba(86,219,132,0.25)",
            }}
          >
            <div
              className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full text-[11px] font-bold text-black"
              style={{ background: "linear-gradient(135deg,#56db84,#818cf8)" }}
            >
              Founding Members
            </div>
            <div className="mb-2">
              <span className="text-[42px] font-extrabold text-white leading-none">199</span>
              <span className="text-[16px] text-white/40 ml-1">RON/luna</span>
            </div>
            <p className="text-[12px] text-white/25 line-through mb-2">viitor: 349 RON/luna</p>
            <p className="text-[13px] text-white/50 mb-1">Economisesti 150 RON/luna fata de pretul viitor.</p>
            <p className="text-[13px] font-semibold mb-6" style={{ color: "#56db84" }}>Pret blocat pe viata pentru primii 200 de clienti.</p>
            <button
              onClick={() => router.push("/pricing")}
              className="w-full py-3.5 rounded-xl text-[15px] font-bold text-black transition-all hover:opacity-90"
              style={{ background: "linear-gradient(135deg,#56db84,#3ecf8e 60%,#818cf8)", boxShadow: "0 4px 20px rgba(86,219,132,0.25)" }}
            >
              Prinde pretul de fondator
            </button>
            <p className="text-[12px] text-white/25 mt-3">Garantie 7 zile. Anulezi oricand.</p>
          </div>
        </section>

        {/* FAQ */}
        <section className="max-w-2xl mx-auto mb-16">
          <h2 className="text-center text-[22px] font-bold text-white mb-8">Intrebari frecvente</h2>
          <div className="flex flex-col gap-3">
            {FAQS.map((item) => (
              <FaqItem key={item.q} q={item.q} a={item.a} />
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="max-w-xl mx-auto text-center pb-20">
          <h2 className="text-[24px] sm:text-[30px] font-bold text-white mb-3">Gata sa gestionezi mai multe branduri?</h2>
          <p className="text-[14px] text-white/40 mb-6">Incearca gratuit cu 10 credite. Upgrade cand esti convins.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => router.push("/signup")}
              className="px-8 py-4 rounded-xl text-[15px] font-bold text-white/80 transition-all hover:text-white"
              style={{ border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.04)" }}
            >
              Incearca gratuit
            </button>
            <button
              onClick={() => router.push("/pricing")}
              className="px-8 py-4 rounded-xl text-[15px] font-bold text-black transition-all hover:opacity-90"
              style={{ background: "linear-gradient(135deg,#56db84,#3ecf8e 60%,#818cf8)", boxShadow: "0 4px 24px rgba(86,219,132,0.3)" }}
            >
              Alege Multi-Brand
            </button>
          </div>
        </section>
      </main>

      <footer
        className="border-t px-6 py-6 text-center"
        style={{ borderColor: "rgba(255,255,255,0.07)" }}
      >
        <p className="text-[12px] text-white/20">
          Nesco Digital AI · <a href="/pricing" className="hover:text-white/40 transition-colors">Preturi</a> · <a href="/login" className="hover:text-white/40 transition-colors">Login</a>
        </p>
      </footer>
    </div>
  );
}
