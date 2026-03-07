import type { Metadata } from "next";
import Link from "next/link";
import Logo from "@/app/components/Logo";

export const metadata: Metadata = {
  title: "Copywriting AI pentru România — Texte care Vând | Nesco Digital AI",
  description: "Înlocuiește copywriter-ul extern cu un AI specializat pentru piața din România. Texte pentru reclame, postări, emailuri și landing pages — în stilul brandului tău.",
  keywords: ["copywriting AI Romania", "copywriter AI", "texte marketing AI", "AI pentru reclame Romania", "generator texte vanzari"],
  alternates: {
    canonical: "https://ai.nescodigital.com/copywriting-ai-romania",
  },
  openGraph: {
    title: "Copywriting AI pentru România — Texte care Vând",
    description: "Înlocuiește copywriter-ul extern cu AI specializat pentru piața română. 45 RON/lună.",
    url: "https://ai.nescodigital.com/copywriting-ai-romania",
    type: "website",
  },
};

const COMPARISON = [
  { aspect: "Cost", copywriter: "500–2.000 RON/lună", nescoAI: "45–99 RON/lună" },
  { aspect: "Timp de livrare", copywriter: "1–3 zile per text", nescoAI: "10 secunde" },
  { aspect: "Cunoaștere brand", copywriter: "Brief la fiecare proiect", nescoAI: "Memorat permanent" },
  { aspect: "Disponibilitate", copywriter: "Program de lucru", nescoAI: "24/7" },
  { aspect: "Variante alternative", copywriter: "Cost suplimentar", nescoAI: "Gratuit, instant" },
  { aspect: "Adaptare feedback", copywriter: "Revizii limitate", nescoAI: "Regenerări nelimitate" },
];

const USE_CASES = [
  { icon: "🎯", title: "Reclame Meta Ads", desc: "Copy pentru reclame Facebook și Instagram care convertesc. Headline, primary text și CTA adaptate obiectivului campaniei." },
  { icon: "📱", title: "Postări social media", desc: "Conținut organic pentru Facebook, Instagram și LinkedIn. Adaptat tonului brandului și obiectivului: vânzare, engagement sau awareness." },
  { icon: "📧", title: "Email marketing", desc: "Newslettere, emailuri promoționale și secvențe automate. Linii de subiect care cresc rata de deschidere." },
  { icon: "💬", title: "Postări Instagram Stories", desc: "Text scurt, impactant, cu call-to-action clar pentru stories eficiente." },
];

export default function CopywritingAIRomania() {
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
        <section className="pt-40 pb-24 text-center px-6" style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(86,219,132,0.07) 0%, transparent 60%), #0a0a0a" }}>
          <div className="mx-auto max-w-3xl">
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-[#56db84] mb-4">Copywriting AI · România</span>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight mb-6">
              Texte care vând,<br />fără copywriter extern
            </h1>
            <p className="text-lg text-white/60 max-w-xl mx-auto mb-4 leading-relaxed">
              Un AI specializat pentru piața din România care cunoaște brandul tău și scrie exact ca tine. Reclame, postări, emailuri — în 10 secunde.
            </p>
            <p className="text-[#56db84] font-semibold mb-8">De la 45 RON/lună, față de 500–2.000 RON pentru un copywriter</p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link href="/signup" className="px-8 py-4 rounded-full text-sm font-bold text-black" style={{ background: "linear-gradient(135deg,#56db84,#3ecf8e)" }}>
                Încearcă 10 texte gratuit
              </Link>
              <Link href="/pricing" className="px-6 py-4 rounded-full text-sm font-semibold text-white/70 border border-white/15 hover:border-white/30 transition-colors">
                Vezi prețurile →
              </Link>
            </div>
          </div>
        </section>

        {/* Comparison table */}
        <section className="py-20 px-6 bg-[#0d0d0d]">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-3xl font-bold text-white text-center mb-12">Nesco AI vs Copywriter extern</h2>
            <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="grid grid-cols-3 px-5 py-3 text-xs font-bold uppercase tracking-wider" style={{ background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.35)" }}>
                <span>Criteriu</span>
                <span className="text-center">Copywriter</span>
                <span className="text-center text-[#56db84]">Nesco AI</span>
              </div>
              {COMPARISON.map((row, i) => (
                <div key={row.aspect} className="grid grid-cols-3 px-5 py-4 text-sm" style={{ borderTop: "1px solid rgba(255,255,255,0.05)", background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)" }}>
                  <span className="text-white/50 font-medium">{row.aspect}</span>
                  <span className="text-center text-white/40">{row.copywriter}</span>
                  <span className="text-center font-semibold text-[#56db84]">{row.nescoAI}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Use cases */}
        <section className="py-20 px-6">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-3xl font-bold text-white text-center mb-12">Ce tipuri de texte generezi</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {USE_CASES.map((uc) => (
                <div key={uc.title} className="rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <div className="text-2xl mb-3">{uc.icon}</div>
                  <h3 className="font-bold text-white mb-2">{uc.title}</h3>
                  <p className="text-sm text-white/50 leading-relaxed">{uc.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-6 text-center" style={{ background: "rgba(86,219,132,0.03)", borderTop: "1px solid rgba(86,219,132,0.1)" }}>
          <div className="mx-auto max-w-xl">
            <h2 className="text-3xl font-bold text-white mb-4">Încearcă 10 texte gratuit</h2>
            <p className="text-white/50 mb-2">Fără card de credit. Fără angajament.</p>
            <p className="text-sm text-white/30 mb-8">Dacă nu ești mulțumit în 7 zile, îți returnăm banii.</p>
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
