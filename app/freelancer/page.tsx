"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Logo from "@/app/components/Logo";

const FOR_WHO = [
  {
    icon: "📱",
    title: "Freelancer de social media",
    desc: "Gestionezi 3-5 clienti. Fiecare cu alt ton, alt public, alta strategie. Profiluri separate, calendare separate, stiluri separate. Un singur cont.",
  },
  {
    icon: "✍️",
    title: "Copywriter independent",
    desc: "Clientii tai sunt branduri diferite cu voci diferite. Voice Cloning per client inseamna ca fiecare text suna exact cum vrea clientul, nu generic.",
  },
  {
    icon: "🏪",
    title: "Antreprenor cu mai multe business-uri",
    desc: "Ai un magazin online, un serviciu de consultanta si un cont personal de creator. Alt ton, alt public, alta strategie pentru fiecare. Un singur workspace.",
  },
  {
    icon: "👨‍💼",
    title: "Consultant de marketing",
    desc: "Livrezi continut lunar pentru mai multi clienti. Cu calendare separate si memorie de brand per client, nu mai pierzi timp explicand contextul de la zero.",
  },
];

const FEATURES = [
  {
    icon: "🏷️",
    title: "5 profiluri de client separate",
    desc: "Fiecare client are memoria lui, tonul lui, publicul lui si calendarul lui. Schimbi clientul cu un click si totul se adapteaza automat.",
  },
  {
    icon: "🎙️",
    title: "Voice Cloning per client",
    desc: "Clientul de tech scrie formal si concis. Clientul de fashion scrie entuziastist si relaxat. Clonezi stilul pentru fiecare in parte, o singura data.",
  },
  {
    icon: "📅",
    title: "Calendar editorial per client",
    desc: "Clientul A posteaza de 5 ori pe saptamana. Clientul B trimite un newsletter lunar. Calendarul fiecaruia e independent, fara sa se incurce.",
  },
  {
    icon: "🔍",
    title: "Spy AI — analiza competitia clientului",
    desc: "Paste URL-ul competitorului clientului tau. Sistemul extrage strategia lor si iti spune cum sa-l bati. Per client, fara sa amesteci datele.",
  },
  {
    icon: "⚡",
    title: "Switch rapid intre clienti",
    desc: "Brand Switcher in dashboard. Un click si esti in contextul altui client: alta memorie, alt profil, alt calendar. Zero timp pierdut.",
  },
  {
    icon: "🎣",
    title: "Hook Generator + Persuasion Score",
    desc: "Pentru fiecare client: hook-uri care opresc scrollul si scor de persuasiune inainte sa trimiti textul. Livrezi calitate mai buna in mai putin timp.",
  },
];

const BEFORE_AFTER = [
  { before: "Explici contextul brandului de fiecare data", after: "Memoria de brand il stie deja — zero brief repetat" },
  { before: "Textele suna generic la toti clientii", after: "Voice Cloning per client — fiecare text in stilul lor" },
  { before: "Confunzi tonul intre clienti", after: "Profiluri separate, imposibil de amestecat" },
  { before: "Copywriter extern: 500-2000 RON/client/luna", after: "Nesco AI: 199 RON/luna pentru 5 clienti" },
  { before: "Calendarul editorial dureaza zile", after: "O luna planificata in 10 minute per client" },
];

const FAQS = [
  {
    q: "Clientii mei pot accesa propriul profil?",
    a: "In planul Multi-Brand, profilurile sunt gestionate din contul tau. Clientii nu au acces separat. Tu generezi si livrezi tu continutul catre ei.",
  },
  {
    q: "Cum functioneaza Voice Cloning per client?",
    a: "In profilul fiecarui brand (client), mergi la sectiunea de Voice. Paste-uiesti 5-10 texte scrise de ei sau in stilul dorit. AI-ul extrage stilul si il foloseste la toate generarile pentru acel brand.",
  },
  {
    q: "Creditele se impart sau fiecare client are ale lui?",
    a: "Creditele sunt in comun: 600/luna pentru toate brandurile. Le distribuiti dupa volumul de continut al fiecarui client. Nu exista limita per brand.",
  },
  {
    q: "Pot adauga clienti treptat?",
    a: "Da. Creezi primul profil de client, il configurezi complet, il folosesti. Adaugi al doilea cand castigi un nou client. Nu trebuie sa ai 5 active de la inceput.",
  },
  {
    q: "Ce se intampla daca am mai mult de 5 clienti?",
    a: "Lucram la un plan extins cu mai multe profiluri. Scrie-ne la contact@nescodigital.com daca ai nevoie acum.",
  },
];

const COMPARISON = [
  { feature: "Profiluri de client", free: "1", pro: "1", multi: "5" },
  { feature: "Credite/luna", free: "10 (trial)", pro: "200", multi: "600" },
  { feature: "Voice Cloning", free: "—", pro: "✓ (1 brand)", multi: "✓ (per client)" },
  { feature: "Spy AI", free: "✓", pro: "✓", multi: "✓" },
  { feature: "Calendar editorial", free: "✓", pro: "✓", multi: "✓ (per client)" },
  { feature: "Memorie de brand", free: "✓", pro: "✓", multi: "✓ (per client)" },
  { feature: "Pret fondator", free: "—", pro: "99 RON/luna", multi: "199 RON/luna" },
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

export default function FreelancerPage() {
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
            Pentru freelanceri
          </div>

          <h1 className="text-[36px] sm:text-[52px] font-extrabold leading-[1.1] tracking-[-0.03em] text-white mb-6">
            5 clienti.{" "}
            <span style={{ background: "linear-gradient(135deg,#56db84,#818cf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Un singur tool.
            </span>
          </h1>

          <p className="text-[17px] text-white/50 leading-relaxed max-w-xl mx-auto mb-8">
            Gestionezi mai multi clienti si fiecare vrea alt stil, alt ton, alta strategie? Profiluri separate, Voice Cloning per client, calendare independente. Tu doar generezi si livrezi.
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

        {/* Before / After */}
        <section className="max-w-2xl mx-auto mb-16">
          <h2 className="text-center text-[13px] font-semibold uppercase tracking-[0.1em] text-white/30 mb-6">Inainte si dupa</h2>
          <div className="flex flex-col gap-3">
            {BEFORE_AFTER.map(({ before, after }) => (
              <div key={before} className="grid grid-cols-2 gap-3">
                <div
                  className="rounded-xl p-4 text-[13px] text-white/40 leading-snug"
                  style={{ background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.12)" }}
                >
                  <span className="text-red-400 mr-1.5">✕</span>{before}
                </div>
                <div
                  className="rounded-xl p-4 text-[13px] text-white/70 leading-snug font-medium"
                  style={{ background: "rgba(86,219,132,0.05)", border: "1px solid rgba(86,219,132,0.15)" }}
                >
                  <span className="text-[#56db84] mr-1.5">✓</span>{after}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* For who */}
        <section className="max-w-3xl mx-auto mb-16">
          <h2 className="text-center text-[22px] sm:text-[28px] font-bold text-white mb-2">Cine foloseste Multi-Brand</h2>
          <p className="text-center text-[14px] text-white/40 mb-10">Oricine livreaza continut pentru mai mult de un brand sau client.</p>
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
          <h2 className="text-center text-[22px] sm:text-[28px] font-bold text-white mb-2">Ce primesti</h2>
          <p className="text-center text-[14px] text-white/40 mb-10">Tot ce are planul Pro, multiplicat pentru 5 clienti.</p>
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
            <p className="text-[13px] text-white/50 mb-1">199 RON/luna pentru 5 clienti = 40 RON/client/luna.</p>
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
          <h2 className="text-[24px] sm:text-[30px] font-bold text-white mb-3">Gata sa livrezi mai repede si mai bine?</h2>
          <p className="text-[14px] text-white/40 mb-6">10 credite gratuite. Upgrade cand esti convins.</p>
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
