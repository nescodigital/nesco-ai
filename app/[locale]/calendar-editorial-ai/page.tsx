import type { Metadata } from "next";
import Link from "next/link";
import Logo from "@/app/components/Logo";

export const metadata: Metadata = {
  title: "Calendar Editorial Automat AI — Planifică o Lună de Conținut în 5 Minute | Nesco Digital AI",
  description: "Generează un calendar editorial complet pentru o lună întreagă cu un singur click. AI care știe când să postezi, ce să postezi și cum să variezi conținutul pentru engagement maxim.",
  keywords: ["calendar editorial AI", "planificare continut social media", "calendar postari automat", "AI social media planning Romania", "strategie continut AI"],
  alternates: {
    canonical: "https://ai.nescodigital.com/calendar-editorial-ai",
  },
  openGraph: {
    title: "Calendar Editorial Automat AI — O Lună de Conținut în 5 Minute",
    description: "Planifică o lună de postări cu AI. Zile, ore, tipuri de conținut și obiective — totul generat automat în funcție de brandul tău.",
    url: "https://ai.nescodigital.com/calendar-editorial-ai",
    type: "website",
  },
};

const FEATURES = [
  { icon: "📅", title: "Planificare pe o lună completă", desc: "30 de zile de conținut generat dintr-o singură acțiune. Cu zile, ore recomandate și tipuri de postări variate." },
  { icon: "🎯", title: "Obiective echilibrate automat", desc: "Mix optimal între vânzare, awareness și engagement. AI-ul nu lasă calendarul să devină monoton sau agresiv." },
  { icon: "📊", title: "Adaptat fiecărei platforme", desc: "Facebook, Instagram, LinkedIn — fiecare cu frecvența și formatul potrivit. Nu același conținut copiat pe toate rețelele." },
  { icon: "✏️", title: "Editabil și regenerabil", desc: "Ajustezi orice slot în calendar: schimbi ziua, tipul, obiectivul sau generezi un text complet direct din calendar." },
  { icon: "🔁", title: "Evită repetiția", desc: "Sistemul ține evidența conținutului generat anterior și evită automat temele și mesajele deja folosite recent." },
  { icon: "⚡", title: "Generare text din calendar", desc: "Apesi pe orice slot și generezi textul complet al postării. De la calendar la conținut gata de publicat în secunde." },
];

const COMPARISON = [
  { aspect: "Timp de planificare", manual: "2–4 ore/lună", nescoAI: "5 minute" },
  { aspect: "Consistență postări", manual: "Depinde de chef", nescoAI: "Automată" },
  { aspect: "Mix obiective", manual: "Adesea dezechilibrat", nescoAI: "Optimal automat" },
  { aspect: "Adaptare per platformă", manual: "Rareori", nescoAI: "Mereu" },
  { aspect: "Generare text din plan", manual: "Proces separat", nescoAI: "Cu un click" },
  { aspect: "Evitare repetiție", manual: "Din memorie", nescoAI: "Automat din istoric" },
];

const HOW_IT_WORKS = [
  { step: "1", title: "Completezi profilul brandului o singură dată", desc: "Ton, audiență, produse, canale active. Dacă ai deja profilul salvat, sari direct la pasul 2." },
  { step: "2", title: "Alegi luna și frecvența", desc: "Câte postări pe săptămână, pe ce platforme. Poți seta și perioade de liniște (weekend, sărbători)." },
  { step: "3", title: "AI generează calendarul complet", desc: "30 de zile cu zile, ore, tipuri de conținut și obiective distribuite echilibrat — în 10 secunde." },
  { step: "4", title: "Generezi textele când ești gata", desc: "Deschizi orice zi din calendar și generezi textul complet al postării cu un singur click." },
];

const FAQS = [
  { q: "Pot schimba calendarul după ce e generat?", a: "Da. Fiecare slot e editabil: poți schimba ziua, ora, tipul de conținut sau obiectivul. Poți și șterge sau adăuga slot-uri manual." },
  { q: "Generează și textele postărilor automat?", a: "Calendarul conține planul (când, ce tip, ce obiectiv). Textele se generează la cerere, direct din calendar, cu un click pe slot." },
  { q: "Funcționează pentru mai multe branduri?", a: "Da, cu planul Multi-Brand poți gestiona până la 5 branduri, fiecare cu calendarul lui separat." },
  { q: "Cât costă generarea unui calendar?", a: "2 credite pentru calendarul lunar complet. Includé în toate planurile. Generarea textelor individuale costă 1 credit/text." },
  { q: "Poate calendarul să țină cont de evenimente sau campanii?", a: "Da. La generare poți adăuga contexte specifice: Black Friday, Crăciun, lansare produs. AI-ul include aceste momente în planificare." },
];

export default function CalendarEditorialAIPage() {
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
        <section className="pt-40 pb-24 text-center px-6" style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.08) 0%, transparent 60%), #0a0a0a" }}>
          <div className="mx-auto max-w-3xl">
            <span className="inline-block text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "#818cf8" }}>Calendar Editorial AI</span>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight mb-6">
              O lună de conținut<br />planificată în 5 minute
            </h1>
            <p className="text-lg text-white/60 max-w-xl mx-auto mb-4 leading-relaxed">
              AI-ul generează un calendar editorial complet: zile, ore, tipuri de conținut și obiective echilibrate. Tu apesi un buton, el planifică luna.
            </p>
            <p className="mb-8 font-semibold" style={{ color: "#818cf8" }}>De la haos la consistență — fără să petreci ore în spreadsheet-uri</p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link href="/signup" className="px-8 py-4 rounded-full text-sm font-bold text-black" style={{ background: "linear-gradient(135deg,#818cf8,#6366f1)" }}>
                Generează primul calendar gratuit
              </Link>
              <Link href="/pricing" className="px-6 py-4 rounded-full text-sm font-semibold text-white/70 border border-white/15 hover:border-white/30 transition-colors">
                Vezi planurile →
              </Link>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 px-6 bg-[#0d0d0d]">
          <div className="mx-auto max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3 text-center" style={{ color: "#818cf8" }}>Ce face calendarul</p>
            <h2 className="text-3xl font-bold text-white text-center mb-12">Tot ce ai nevoie pentru a posta consistent</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {FEATURES.map((f) => (
                <div key={f.title} className="rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <div className="text-2xl mb-3">{f.icon}</div>
                  <h3 className="font-bold text-white mb-2">{f.title}</h3>
                  <p className="text-sm text-white/50 leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Comparison */}
        <section className="py-20 px-6">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-3xl font-bold text-white text-center mb-12">Planificare manuală vs Calendar AI</h2>
            <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="grid grid-cols-3 px-5 py-3 text-xs font-bold uppercase tracking-wider" style={{ background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.35)" }}>
                <span>Criteriu</span>
                <span className="text-center">Manual</span>
                <span className="text-center" style={{ color: "#818cf8" }}>Nesco AI</span>
              </div>
              {COMPARISON.map((row, i) => (
                <div key={row.aspect} className="grid grid-cols-3 px-5 py-4 text-sm" style={{ borderTop: "1px solid rgba(255,255,255,0.05)", background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)" }}>
                  <span className="text-white/50 font-medium">{row.aspect}</span>
                  <span className="text-center text-white/40">{row.manual}</span>
                  <span className="text-center font-semibold" style={{ color: "#818cf8" }}>{row.nescoAI}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-20 px-6 bg-[#0d0d0d]">
          <div className="mx-auto max-w-2xl">
            <h2 className="text-3xl font-bold text-white text-center mb-12">Cum funcționează</h2>
            <div className="space-y-6">
              {HOW_IT_WORKS.map((step) => (
                <div key={step.step} className="flex gap-4">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm text-white" style={{ background: "linear-gradient(135deg,#818cf8,#6366f1)" }}>
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
        <section className="py-20 px-6 text-center" style={{ background: "rgba(99,102,241,0.03)", borderTop: "1px solid rgba(99,102,241,0.1)" }}>
          <div className="mx-auto max-w-xl">
            <h2 className="text-3xl font-bold text-white mb-4">Postează consistent. Fără stres.</h2>
            <p className="text-white/50 mb-2">10 credite gratuite la înregistrare. Fără card.</p>
            <p className="text-sm text-white/30 mb-8">Dacă nu ești mulțumit în 7 zile, îți returnăm banii.</p>
            <Link href="/signup" className="inline-block px-8 py-4 rounded-full text-sm font-bold text-white" style={{ background: "linear-gradient(135deg,#818cf8,#6366f1)" }}>
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
