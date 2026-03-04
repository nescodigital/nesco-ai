"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Logo from "@/app/components/Logo";

const FEATURES = [
  {
    icon: "📧",
    title: "Emailuri care se deschid si se citesc",
    desc: "Subject lines cu rata de deschidere mare, preview text optimizat, structura clara. AI-ul scrie emailul de vanzare, newsletterul lunar sau secventa de onboarding.",
  },
  {
    icon: "🎣",
    title: "Hook Generator pentru subject line",
    desc: "Subject line-ul face diferenta intre 20% si 60% rata de deschidere. Primesti 10 variante in stiluri diferite: curiozitate, urgenta, personalizare, beneficiu direct.",
  },
  {
    icon: "📊",
    title: "Persuasion Score pentru fiecare email",
    desc: "Paste orice email draft. Primesti un scor de persuasiune, punctul exact unde cititorul abandoneaza si 3 sugestii concrete. Inainte de a trimite la toata lista.",
  },
  {
    icon: "🎙️",
    title: "Voice Cloning — emailuri care suna ca tine",
    desc: "Paste 5-10 emailuri trimise anterior. AI-ul extrage tonul, ritmul, expresiile tale. Toate emailurile generate vor suna ca si cum le-ai scris tu personal.",
  },
  {
    icon: "🔍",
    title: "Spy AI — ce trimit competitorii",
    desc: "Analizeaza paginile de landing ale competitiei. Intelege mesajele lor, propunerea de valoare, punctele slabe. Scrie emailuri care bat direct la vulnerabilitatile lor.",
  },
  {
    icon: "🧠",
    title: "Memorie de brand",
    desc: "Sistemul memoreaza produsele, publicul, tonul si obiectivele brandului tau. Fiecare email generat este consistent cu restul comunicarii, fara sa explici de fiecare data.",
  },
];

const USE_CASES = [
  {
    title: "Secventa de welcome (5-7 emailuri)",
    desc: "Sistemul genereaza o secventa completa pentru noii abonati: prezentare, beneficii, social proof, oferta. Fiecare email cu obiectiv clar si CTA specific.",
    tag: "Secventa automata",
  },
  {
    title: "Email de vanzare pentru lansare",
    desc: "Structura dovedita: hook, problema, solutie, dovezi, obiectii, CTA. AI-ul completeaza cu detaliile produsului tau si stilul tau de comunicare.",
    tag: "Conversie",
  },
  {
    title: "Newsletter lunar sau saptamanal",
    desc: "Subiect relevant pentru audienta ta, continut valoros, sectiune de update-uri, CTA usor. Gata in 5 minute, nu in 2 ore.",
    tag: "Newsletter",
  },
  {
    title: "Re-engagement pentru lista rece",
    desc: "Secventa speciala pentru abonati inactivi. 3 emailuri cu unghi diferit: curiozitate, ultima sansa, oferta exclusiva. Recuperezi pana la 15% din lista rece.",
    tag: "Re-activare",
  },
];

const FAQS = [
  {
    q: "Pot genera emailuri pentru orice platforma (Mailchimp, Brevo, ActiveCampaign)?",
    a: "Da. Sistemul genereaza textul emailului. Il copiezi in orice platforma de email marketing folosesti tu. Nu e integrat direct cu platformele, dar textul generat e gata de folosit.",
  },
  {
    q: "Cat de personalizate sunt emailurile generate?",
    a: "Depinde de cat de bine ai configurat profilul brandului. Cu Voice Cloning activ si profilul complet, emailurile suna ca si cum le-ai scris tu. Fara configurare, sunt profesionale dar mai generice.",
  },
  {
    q: "Pot genera secvente complete automate?",
    a: "Poti genera fiecare email individual cu context legat. Nu exista inca un generator de secventa in un singur click, dar poti genera 5-7 emailuri consistente in sub 30 de minute.",
  },
  {
    q: "Ce e diferit fata de ChatGPT sau alte AI?",
    a: "Nesco AI are memorie de brand (nu explici de fiecare data cine esti), Voice Cloning (tonul tau specific), Spy AI (analiza competitie) si Persuasion Score. ChatGPT e general, Nesco e specializat pentru marketing.",
  },
  {
    q: "Functioeaza si pentru B2B, nu doar B2C?",
    a: "Da. Sistemul a fost folosit pentru emailuri B2B (propuneri, follow-up, lead nurturing) la fel de bine ca pentru B2C. Ii spui audienta si tonul formal sau informal.",
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

export default function EmailMarketingLP() {
  const router = useRouter();

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: "radial-gradient(ellipse at 50% 0%, rgba(129,140,248,0.07) 0%, transparent 55%), #0a0a0a",
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
          style={{ background: "rgba(129,140,248,0.1)", color: "#818cf8", border: "1px solid rgba(129,140,248,0.2)" }}
        >
          Intra in cont
        </button>
      </header>

      <main className="flex-1 px-5">

        {/* Hero */}
        <section className="max-w-3xl mx-auto text-center pt-16 pb-12">
          <div
            className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full text-[11px] font-bold"
            style={{ background: "rgba(129,140,248,0.1)", border: "1px solid rgba(129,140,248,0.25)", color: "#818cf8" }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#818cf8] animate-pulse" />
            Email marketing
          </div>

          <h1 className="text-[36px] sm:text-[52px] font-extrabold leading-[1.1] tracking-[-0.03em] text-white mb-6">
            Emailuri care{" "}
            <span style={{ background: "linear-gradient(135deg,#818cf8,#56db84)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              vand, nu plictisesc
            </span>
            .
          </h1>

          <p className="text-[17px] text-white/50 leading-relaxed max-w-xl mx-auto mb-8">
            AI specializat pentru email marketing. Secvente de onboarding, emailuri de vanzare, newslettere. In stilul tau, gata de trimis.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <button
              onClick={() => router.push("/signup")}
              className="px-7 py-3.5 rounded-xl text-[15px] font-bold text-black transition-all hover:opacity-90"
              style={{ background: "linear-gradient(135deg,#818cf8,#56db84)", boxShadow: "0 4px 24px rgba(129,140,248,0.3)" }}
            >
              Incearca gratuit 10 credite
            </button>
            <p className="text-[13px] text-white/30">Fara card bancar. Cont in 60 secunde.</p>
          </div>
        </section>

        {/* Use cases */}
        <section className="max-w-2xl mx-auto mb-16">
          <h2 className="text-center text-[22px] sm:text-[28px] font-bold text-white mb-2">Ce poti genera</h2>
          <p className="text-center text-[14px] text-white/40 mb-10">Tipuri de emailuri pentru orice scenariu de marketing.</p>
          <div className="flex flex-col gap-4">
            {USE_CASES.map((uc) => (
              <div
                key={uc.title}
                className="rounded-2xl p-5 flex gap-4"
                style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-[15px] font-bold text-white">{uc.title}</h3>
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                      style={{ background: "rgba(129,140,248,0.1)", color: "#818cf8", border: "1px solid rgba(129,140,248,0.2)" }}
                    >
                      {uc.tag}
                    </span>
                  </div>
                  <p className="text-[13px] text-white/45 leading-relaxed">{uc.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="max-w-3xl mx-auto mb-16">
          <h2 className="text-center text-[22px] sm:text-[28px] font-bold text-white mb-2">Tool-uri incluse</h2>
          <p className="text-center text-[14px] text-white/40 mb-10">Tot ce ai nevoie pentru email marketing eficient.</p>
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
              background: "linear-gradient(135deg,rgba(129,140,248,0.06),rgba(86,219,132,0.04))",
              border: "1.5px solid rgba(129,140,248,0.2)",
            }}
          >
            <div
              className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full text-[11px] font-bold text-black"
              style={{ background: "linear-gradient(135deg,#818cf8,#56db84)" }}
            >
              Founding Members
            </div>
            <h2 className="text-[22px] font-bold text-white mb-2">Pret blocat pe viata</h2>
            <p className="text-[14px] text-white/45 mb-6 leading-relaxed">
              Primii 200 de clienti mentin pretul actual chiar si cand preturile cresc. Acum la 45 RON/luna, ulterior 89 RON.
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
                    background: accent ? "rgba(129,140,248,0.08)" : "rgba(255,255,255,0.03)",
                    border: accent ? "1.5px solid rgba(129,140,248,0.3)" : "1px solid rgba(255,255,255,0.08)",
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
              style={{ background: "linear-gradient(135deg,#818cf8,#3ecf8e 60%,#56db84)", boxShadow: "0 4px 20px rgba(129,140,248,0.25)" }}
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
          <h2 className="text-[24px] sm:text-[30px] font-bold text-white mb-3">Gata sa trimiti emailuri mai bune?</h2>
          <p className="text-[14px] text-white/40 mb-6">10 credite gratuite. Cont in 60 secunde. Fara card.</p>
          <button
            onClick={() => router.push("/signup")}
            className="px-8 py-4 rounded-xl text-[15px] font-bold text-black transition-all hover:opacity-90 w-full sm:w-auto"
            style={{ background: "linear-gradient(135deg,#818cf8,#3ecf8e 60%,#56db84)", boxShadow: "0 4px 24px rgba(129,140,248,0.3)" }}
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
