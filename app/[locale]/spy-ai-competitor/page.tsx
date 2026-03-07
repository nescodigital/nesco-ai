import type { Metadata } from "next";
import Link from "next/link";
import Logo from "@/app/components/Logo";

export const metadata: Metadata = {
  title: "Spy AI — Analizează Strategia Competitorilor | Nesco Digital AI",
  description: "Paste URL-ul oricărui competitor și primești în 30 secunde strategia lor de marketing, punctele slabe și cum îi poți depăși. AI de analiză competitor pentru piața din România.",
  keywords: ["analiza competitor AI", "spy tool marketing", "analiza concurenta AI Romania", "marketing intelligence AI", "strategie competitor"],
  alternates: {
    canonical: "https://ai.nescodigital.com/spy-ai-competitor",
  },
  openGraph: {
    title: "Spy AI — Copiază Strategia Competitorilor în 30 Secunde",
    description: "Analizează orice competitor cu AI. Strategia lor, punctele slabe, cum îi depășești.",
    url: "https://ai.nescodigital.com/spy-ai-competitor",
    type: "website",
  },
};

const WHAT_YOU_GET = [
  { icon: "🎯", title: "Strategia lor de marketing", desc: "Ce mesaje folosesc, cui se adresează, ce emoții activează în conținut." },
  { icon: "⚠️", title: "Punctele slabe", desc: "Ce lacune are comunicarea lor pe care tu le poți exploata." },
  { icon: "🪝", title: "Hook-urile lor principale", desc: "Ce formulări repetă și de ce funcționează la audiența lor." },
  { icon: "💡", title: "Cum îi depășești", desc: "Recomandări concrete pentru a te diferenția și a câștiga aceeași audiență." },
  { icon: "📊", title: "Ton și stil de comunicare", desc: "Formal sau informal, agresiv sau empatic, vizual sau text-heavy." },
  { icon: "🚀", title: "Aplici direct în generator", desc: "Insight-urile se aplică automat în profilul tău de brand cu un singur click." },
];

const HOW_IT_WORKS = [
  { step: "1", title: "Paste URL sau text", desc: "Linkul paginii de Facebook, Instagram, website-ului sau bio-ul competitorului. Sau paste direct text din postările lor." },
  { step: "2", title: "AI analizează în 30 secunde", desc: "Sistemul extrage mesajele cheie, identifică pattern-urile și evaluează eficiența comunicării." },
  { step: "3", title: "Primești raportul complet", desc: "Strategie, ton, puncte slabe, hook-uri și recomandări concrete. Poți trimite raportul pe email." },
];

const FAQS = [
  { q: "Ce surse pot analiza?", a: "Orice URL public: pagini Facebook, Instagram, website-uri, landing pages. Sau poți paste direct text: bio, postări, descrieri de produse." },
  { q: "Cât costă o analiză?", a: "1 credit per analiză. Inclus în toate planurile. Poți reanaliza oricând pentru a urmări evoluția competitorului." },
  { q: "Pot salva analizele anterioare?", a: "Da, ultimele analize sunt salvate în istoricul tău. Poți revedea sau reanaliza oricând." },
  { q: "Funcționează și pentru competitori internaționali?", a: "Da. AI-ul analizează conținut în orice limbă și livrează raportul în română." },
];

export default function SpyAICompetitorPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white" style={{ fontFamily: "var(--font-geist-sans)" }}>
      <header className="fixed inset-x-0 top-0 z-50 flex items-center justify-between px-6 py-4 backdrop-blur-sm" style={{ background: "rgba(0,0,0,0.6)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <Logo />
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-white/50 hover:text-white transition-colors">Cont existent</Link>
          <Link href="/signup" className="text-sm font-bold px-4 py-2 rounded-full text-black" style={{ background: "#56db84" }}>
            Încearcă gratuit
          </Link>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="pt-40 pb-24 text-center px-6" style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(129,140,248,0.08) 0%, transparent 60%), #0a0a0a" }}>
          <div className="mx-auto max-w-3xl">
            <span className="inline-block text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "#818cf8" }}>Spy AI — Analiză competitor</span>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight mb-6">
              Copiază strategia competitorului<br />în 30 de secunde
            </h1>
            <p className="text-lg text-white/60 max-w-xl mx-auto mb-8 leading-relaxed">
              Paste URL-ul oricărei pagini de Facebook, Instagram sau website. AI-ul extrage strategia, punctele slabe și îți spune exact cum îi poți depăși.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link href="/signup" className="px-8 py-4 rounded-full text-sm font-bold text-black" style={{ background: "linear-gradient(135deg,#818cf8,#56db84)" }}>
                Analizează primul competitor gratuit
              </Link>
              <Link href="/pricing" className="px-6 py-4 rounded-full text-sm font-semibold text-white/70 border border-white/15 hover:border-white/30 transition-colors">
                Vezi planurile →
              </Link>
            </div>
          </div>
        </section>

        {/* What you get */}
        <section className="py-20 px-6 bg-[#0d0d0d]">
          <div className="mx-auto max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3 text-center" style={{ color: "#818cf8" }}>Ce primești</p>
            <h2 className="text-3xl font-bold text-white text-center mb-12">Raport complet de marketing intelligence</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {WHAT_YOU_GET.map((item) => (
                <div key={item.title} className="rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <div className="text-2xl mb-3">{item.icon}</div>
                  <h3 className="font-bold text-white mb-1">{item.title}</h3>
                  <p className="text-sm text-white/50 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-20 px-6">
          <div className="mx-auto max-w-2xl">
            <h2 className="text-3xl font-bold text-white text-center mb-12">Cum funcționează</h2>
            <div className="space-y-6">
              {HOW_IT_WORKS.map((step) => (
                <div key={step.step} className="flex gap-4">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm text-black" style={{ background: "linear-gradient(135deg,#818cf8,#56db84)" }}>
                    {step.step}
                  </div>
                  <div>
                    <h3 className="font-bold text-white mb-1">{step.title}</h3>
                    <p className="text-sm text-white/50 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 px-6 bg-[#111111]">
          <div className="mx-auto max-w-2xl">
            <h2 className="text-2xl font-bold text-white mb-8 text-center">Întrebări frecvente</h2>
            <div className="space-y-4">
              {FAQS.map((faq) => (
                <div key={faq.q} className="rounded-xl p-5" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}>
                  <p className="font-semibold text-white text-sm mb-2">{faq.q}</p>
                  <p className="text-sm text-white/50 leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-6 text-center">
          <div className="mx-auto max-w-xl">
            <h2 className="text-3xl font-bold text-white mb-4">Știi tot ce face competitorul tău?</h2>
            <p className="text-white/50 mb-8">Prima analiză e gratuită. Fără card.</p>
            <Link href="/signup" className="inline-block px-8 py-4 rounded-full text-sm font-bold text-black" style={{ background: "linear-gradient(135deg,#818cf8,#56db84)" }}>
              Analizează primul competitor →
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t py-8 text-center text-xs text-zinc-600" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
        © {new Date().getFullYear()} Nesco Digital.{" "}
        <Link href="/privacy" className="hover:text-zinc-400 transition-colors ml-2">Confidențialitate</Link>
        <Link href="/terms" className="hover:text-zinc-400 transition-colors ml-2">Termeni</Link>
      </footer>
    </div>
  );
}
