"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Logo from "@/app/components/Logo";

const FEATURES = [
  {
    icon: "✍️",
    title: "Generator de conținut complet",
    desc: "Post, caption, story, reel — pentru orice rețea: Instagram, Facebook, LinkedIn, TikTok. Alegi tonul, lungimea și obiectivul.",
  },
  {
    icon: "🔍",
    title: "Spy AI — copiezi strategia competiției",
    desc: "Paste URL-ul oricărei pagini de Facebook sau website. Sistemul extrage mesajele cheie, punctele slabe și îți spune exact cum îi poți depăși.",
  },
  {
    icon: "🎣",
    title: "Hook Generator — prima propoziție care oprește scrollul",
    desc: "10 variante de hook pentru orice subiect în 5 secunde. Curiozitate, șoc, statistici, controversă. Fiecare cu explicația psihologică.",
  },
  {
    icon: "📊",
    title: "Persuasion Score",
    desc: "Paste orice text și primești un scor 0-100. Sistemul îți arată exact unde pierzi cititorul și 3 sugestii concrete de îmbunătățire.",
  },
  {
    icon: "🎙️",
    title: "Voice Cloning — AI-ul scrie exact ca tine",
    desc: "Paste 5-10 texte scrise de tine. AI-ul extrage stilul, ritmul, expresiile preferate. Niciun text generic, niciun ton de robot.",
  },
  {
    icon: "📅",
    title: "Calendar editorial",
    desc: "Planifică o lună întreagă de conținut în 10 minute. Fiecare slot are subiect, tip de conținut și obiectiv definit automat.",
  },
];

const BEFORE_AFTER = [
  { before: "3-4 ore/săptămână scris conținut", after: "15 minute pentru o săptămână întreagă" },
  { before: "Idei de subiecte: zero", after: "Calendar cu 30 de zile gata în 10 minute" },
  { before: "Texte care sună AI și generic", after: "Conținut în stilul tău, de nedetectat" },
  { before: "Ghicești ce funcționează la competiție", after: "Spy AI îți arată exact strategia lor" },
  { before: "Copywriter extern: 500-2000 RON/lună", after: "Nesco AI: 45-99 RON/lună" },
];

const FAQS = [
  {
    q: "Trebuie să știu să scriu texte bune?",
    a: "Nu. Îi spui AI-ului subiectul, tonul și obiectivul. El scrie. Tu editezi dacă vrei sau postezi direct.",
  },
  {
    q: "Conținutul sună natural sau se simte că e AI?",
    a: "Cu Voice Cloning activ, AI-ul scrie în stilul tău exact. Fără Voice Cloning, conținutul sună profesional dar neutru. Poți activa clonarea stilului din profilul brandului.",
  },
  {
    q: "Funcționează pentru orice business?",
    a: "Da. Sistemul a fost testat cu antreprenori din comerț, servicii, coaching, restaurante, clinici, agenții. Îi spui tipul de business și publicul țintă în onboarding.",
  },
  {
    q: "Câte postări pot genera pe lună?",
    a: "Depinde de plan. Starter: 60 credite (aprox. 30 postări). Pro: 200 credite (aprox. 100 postări). Multi-Brand: 600 credite pentru 5 branduri.",
  },
  {
    q: "Pot folosi pentru mai multe branduri sau clienți?",
    a: "Da, planul Multi-Brand include 5 branduri separate cu profiluri diferite, calendare diferite și stiluri diferite. Ideal pentru antreprenori cu mai multe business-uri sau agenții mici.",
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="rounded-2xl border border-white/10 bg-[#141414] overflow-hidden cursor-pointer"
      onClick={() => setOpen((v: boolean) => !v)}
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

export default function SocialLP() {
  const router = useRouter();

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: "radial-gradient(ellipse at 50% 0%, rgba(86,219,132,0.06) 0%, transparent 55%), #0a0a0a",
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
          Intră în cont
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
            Specific pentru social media
          </div>

          <h1
            className="text-[36px] sm:text-[52px] font-extrabold leading-[1.1] tracking-[-0.03em] text-white mb-6"
          >
            Postezi zilnic{" "}
            <span style={{ background: "linear-gradient(135deg,#56db84,#818cf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              fara copywriter
            </span>
            .
          </h1>

          <p className="text-[17px] text-white/50 leading-relaxed max-w-xl mx-auto mb-8">
            AI care scrie posturi, reels, stories si captions exact in stilul tau. Plus Spy AI care analizeaza competitia si Hook Generator care opreste scrollul.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <button
              onClick={() => router.push("/signup")}
              className="px-7 py-3.5 rounded-xl text-[15px] font-bold text-black transition-all hover:opacity-90"
              style={{ background: "linear-gradient(135deg,#56db84,#3ecf8e 60%,#818cf8)", boxShadow: "0 4px 24px rgba(86,219,132,0.3)" }}
            >
              Incearca gratuit 10 credite
            </button>
            <p className="text-[13px] text-white/30">Fara card bancar. Cont in 60 secunde.</p>
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

        {/* Features */}
        <section className="max-w-3xl mx-auto mb-16">
          <h2 className="text-center text-[22px] sm:text-[28px] font-bold text-white mb-2">Tot ce ai nevoie pentru social media</h2>
          <p className="text-center text-[14px] text-white/40 mb-10">6 tool-uri intr-un singur workspace. Nu ai nevoie de altceva.</p>
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

        {/* Pricing teaser */}
        <section className="max-w-2xl mx-auto mb-16 text-center">
          <div
            className="rounded-2xl p-8"
            style={{
              background: "linear-gradient(135deg,rgba(86,219,132,0.06),rgba(129,140,248,0.04))",
              border: "1.5px solid rgba(86,219,132,0.2)",
            }}
          >
            <div
              className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full text-[11px] font-bold text-black"
              style={{ background: "linear-gradient(135deg,#56db84,#818cf8)" }}
            >
              Founding Members
            </div>
            <h2 className="text-[22px] font-bold text-white mb-2">Pret blocat pe viata</h2>
            <p className="text-[14px] text-white/45 mb-6 leading-relaxed">
              Primii 200 de clienti pastreaza pretul actual chiar si cand preturile cresc. Acum la 45 RON/luna, ulterior 89 RON.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center text-left mb-6">
              {[
                { plan: "Starter", price: "45", future: "89", credits: "60 credite" },
                { plan: "Pro", price: "99", future: "169", credits: "200 credite", accent: true },
                { plan: "Multi-Brand", price: "199", future: "349", credits: "600 credite" },
              ].map(({ plan, price, future, credits, accent }) => (
                <div
                  key={plan}
                  className="flex-1 rounded-xl p-4"
                  style={{
                    background: accent ? "rgba(86,219,132,0.08)" : "rgba(255,255,255,0.03)",
                    border: accent ? "1.5px solid rgba(86,219,132,0.3)" : "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <p className="text-[13px] font-bold text-white mb-1">{plan}</p>
                  <p className="text-[24px] font-extrabold text-white leading-none">{price} <span className="text-[13px] font-normal text-white/40">RON/luna</span></p>
                  <p className="text-[11px] text-white/25 line-through">{future} RON</p>
                  <p className="text-[12px] text-white/40 mt-1">{credits}/luna</p>
                </div>
              ))}
            </div>
            <button
              onClick={() => router.push("/pricing")}
              className="px-7 py-3.5 rounded-xl text-[15px] font-bold text-black transition-all hover:opacity-90"
              style={{ background: "linear-gradient(135deg,#56db84,#3ecf8e 60%,#818cf8)", boxShadow: "0 4px 20px rgba(86,219,132,0.25)" }}
            >
              Alege planul tau
            </button>
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
          <h2 className="text-[24px] sm:text-[30px] font-bold text-white mb-3">Gata sa postezi mai inteligent?</h2>
          <p className="text-[14px] text-white/40 mb-6">10 credite gratuite. Cont in 60 secunde. Fara card.</p>
          <button
            onClick={() => router.push("/signup")}
            className="px-8 py-4 rounded-xl text-[15px] font-bold text-black transition-all hover:opacity-90 w-full sm:w-auto"
            style={{ background: "linear-gradient(135deg,#56db84,#3ecf8e 60%,#818cf8)", boxShadow: "0 4px 24px rgba(86,219,132,0.3)" }}
          >
            Incearca gratuit
          </button>
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
