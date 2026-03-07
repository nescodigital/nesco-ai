import type { Metadata } from "next";
import Link from "next/link";
import Logo from "@/app/components/Logo";

export const metadata: Metadata = {
  title: "Generator de Conținut AI pentru Marketing | Nesco Digital AI",
  description: "Generează postări Facebook, Instagram, LinkedIn, reclame Meta Ads și emailuri în secunde. AI care cunoaște brandul tău. Fără prompts, fără timp pierdut.",
  keywords: ["generator continut AI", "AI marketing Romania", "generare postari social media", "copywriting AI Romania", "generator reclame facebook AI"],
  alternates: {
    canonical: "https://ai.nescodigital.com/generator-continut-ai",
  },
  openGraph: {
    title: "Generator de Conținut AI pentru Marketing",
    description: "Postări, reclame, emailuri generate în secunde de un AI care cunoaște brandul tău.",
    url: "https://ai.nescodigital.com/generator-continut-ai",
    type: "website",
  },
};

const CONTENT_TYPES = [
  { icon: "📘", name: "Post Facebook", desc: "Postări optimizate pentru reach și engagement organic" },
  { icon: "📸", name: "Post Instagram", desc: "Caption-uri cu hook puternic și hashtag-uri relevante" },
  { icon: "💼", name: "Post LinkedIn", desc: "Conținut profesional care construiește autoritate" },
  { icon: "📧", name: "Email newsletter", desc: "Emailuri care se deschid și generează click-uri" },
  { icon: "🎯", name: "Reclamă Meta Ads", desc: "Copy persuasiv pentru reclame cu conversii ridicate" },
];

const BENEFITS = [
  { title: "AI care știe cine ești", desc: "Completezi o dată profilul brandului — ton, audiență, USP, canale. Fiecare generare respectă exact vocea ta." },
  { title: "Zero timp pierdut pe prompts", desc: "Alegi tipul de conținut, obiectivul și contextul. Restul îl face AI-ul. Fără instrucțiuni lungi." },
  { title: "Conținut de nedetectat ca AI", desc: "Dacă activezi Voice Cloning, AI-ul analizează stilul tău de scriere și generează în vocea ta personală." },
  { title: "Variante multiple instant", desc: "Nu-ți place prima variantă? Regenerezi în 2 secunde. Fiecare generare evită să repete idei recente." },
];

const FAQS = [
  { q: "Cât timp durează să generezi un post?", a: "Sub 10 secunde. Alegi tipul, obiectivul, adaugi context opțional și apeși Generate." },
  { q: "Conținutul sună ca un robot?", a: "Nu, dacă completezi profilul brandului. AI-ul folosește tonul, expresiile și structura pe care le definești tu. Cu Voice Cloning, sună exact ca tine." },
  { q: "Pot genera conținut pentru mai multe branduri?", a: "Da, cu planul Multi-Brand poți gestiona până la 5 branduri separate, fiecare cu profilul și istoricul lui." },
  { q: "Ce limbi sunt suportate?", a: "Generarea se face în română. Există și funcție de traducere în 10 limbi pentru conținut internațional." },
];

export default function GeneratorContinutAI() {
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
        <section className="pt-40 pb-24 text-center px-6" style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(86,219,132,0.08) 0%, transparent 60%), #0a0a0a" }}>
          <div className="mx-auto max-w-3xl">
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-[#56db84] mb-4">Generator de conținut AI</span>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight mb-6">
              Generează conținut de marketing<br />în 10 secunde, cu AI
            </h1>
            <p className="text-lg text-white/60 max-w-xl mx-auto mb-8 leading-relaxed">
              Un AI care cunoaște brandul tău, audiența și ofertele. Postări, reclame și emailuri personalizate — fără să scrii un singur prompt.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link href="/signup" className="px-8 py-4 rounded-full text-sm font-bold text-black" style={{ background: "linear-gradient(135deg,#56db84,#3ecf8e)" }}>
                Începe gratuit — 10 credite incluse
              </Link>
              <Link href="/pricing" className="px-6 py-4 rounded-full text-sm font-semibold text-white/70 border border-white/15 hover:border-white/30 transition-colors">
                Vezi planurile →
              </Link>
            </div>
            <p className="text-xs text-white/30 mt-3">Fără card de credit. Fără perioadă de trial.</p>
          </div>
        </section>

        {/* Content types */}
        <section className="py-20 px-6 bg-[#0d0d0d]">
          <div className="mx-auto max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#56db84] mb-3 text-center">Ce poți genera</p>
            <h2 className="text-3xl font-bold text-white text-center mb-12">5 tipuri de conținut, un singur tool</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {CONTENT_TYPES.map((ct) => (
                <div key={ct.name} className="rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <div className="text-2xl mb-3">{ct.icon}</div>
                  <h3 className="font-bold text-white mb-1">{ct.name}</h3>
                  <p className="text-sm text-white/50 leading-relaxed">{ct.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-20 px-6">
          <div className="mx-auto max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#56db84] mb-3 text-center">De ce Nesco AI</p>
            <h2 className="text-3xl font-bold text-white text-center mb-12">Nu e ChatGPT. E altceva.</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {BENEFITS.map((b) => (
                <div key={b.title}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg,#56db84,#818cf8)" }}>
                      <svg width="8" height="6" viewBox="0 0 8 6" fill="none"><path d="M1 3l2 2 4-4" stroke="#000" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                    <h3 className="font-bold text-white text-sm">{b.title}</h3>
                  </div>
                  <p className="text-sm text-white/50 leading-relaxed pl-7">{b.desc}</p>
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

        {/* CTA final */}
        <section className="py-20 px-6 text-center">
          <div className="mx-auto max-w-xl">
            <h2 className="text-3xl font-bold text-white mb-4">Gata să economisești 3 ore pe săptămână?</h2>
            <p className="text-white/50 mb-8">10 credite gratuite la înregistrare. Fără card.</p>
            <Link href="/signup" className="inline-block px-8 py-4 rounded-full text-sm font-bold text-black" style={{ background: "linear-gradient(135deg,#56db84,#3ecf8e)" }}>
              Creează cont gratuit →
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
