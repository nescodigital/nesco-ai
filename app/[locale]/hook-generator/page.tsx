import type { Metadata } from "next";
import Link from "next/link";
import Logo from "@/app/components/Logo";

export const metadata: Metadata = {
  title: "Generator Hook-uri Marketing AI — Captează Atenția în 3 Secunde | Nesco Digital AI",
  description: "Generează hook-uri puternice pentru reclame, postări și emailuri. AI specializat pentru audiența din România. Primul rând care oprește scrollul și forțează citirea.",
  keywords: ["generator hookuri marketing", "hook reclame facebook", "hook copywriting Romania", "primul rand reclama AI", "hook instagram AI"],
  alternates: {
    canonical: "https://ai.nescodigital.com/hook-generator",
  },
  openGraph: {
    title: "Generator Hook-uri Marketing AI — Captează Atenția în 3 Secunde",
    description: "Primul rând care oprește scrollul. Hook-uri pentru reclame, postări și emailuri generate de AI în secunde.",
    url: "https://ai.nescodigital.com/hook-generator",
    type: "website",
  },
};

const HOOK_TYPES = [
  { icon: "🎯", title: "Hook pentru reclame Meta Ads", desc: "Prima linie care oprește scrollul și forțează citirea reclamei. Testat pe audiențe reci și calde." },
  { icon: "📱", title: "Hook pentru postări Instagram", desc: "Primul rând al caption-ului care transformă un scroll pasiv în citire activă." },
  { icon: "📘", title: "Hook pentru postări Facebook", desc: "Primele cuvinte care apar înainte de 'Vezi mai mult' — decisive pentru engagement." },
  { icon: "📧", title: "Subiect email", desc: "Linia de subiect care crește rata de deschidere. Curiozitate, urgență sau beneficiu clar." },
  { icon: "🎬", title: "Hook pentru video / Reels", desc: "Prima propoziție rostită sau afișată în primele 2 secunde care reține privitorul." },
  { icon: "💬", title: "Hook pentru Stories", desc: "Text scurt, șocant sau intrigant care face userul să apese pe story în loc să swipe." },
];

const HOOK_FORMULAS = [
  { formula: "Întrebarea dureroasă", example: "De ce pierzi bani în fiecare lună fără să știi?" },
  { formula: "Cifra surprinzătoare", example: "87% din reclamele românești eșuează din primul rând." },
  { formula: "Provocarea directă", example: "Dacă nu faci asta, concurenții tăi te vor depăși în 30 de zile." },
  { formula: "Secretul dezvăluit", example: "Ce nu îți spun agențiile despre reclamele Facebook." },
  { formula: "Rezultatul neașteptat", example: "Am generat 50 de clienți noi în 3 zile. Fără reclamă plătită." },
  { formula: "Contra-intuitivul", example: "Postează MAI RAR pe Instagram. Iată de ce funcționează." },
];

const HOW_IT_WORKS = [
  { step: "1", title: "Descrie ce vrei să promovezi", desc: "Produsul, serviciul sau mesajul. Câteva cuvinte sunt suficiente — AI-ul completează." },
  { step: "2", title: "Alege tipul de hook și platforma", desc: "Reclamă, postare, email, video. Fiecare platformă are un format optim diferit." },
  { step: "3", title: "Primești 5 variante în 5 secunde", desc: "Alegi ce rezonează sau regenerezi instant. Fiecare variantă aplică o formulă de copywriting diferită." },
];

const FAQS = [
  { q: "Ce este un hook în marketing?", a: "Hook-ul este primul element dintr-o reclamă, postare sau email care captează atenția. Statistic, ai 1.7 secunde să oprești scrollul înainte ca userul să treacă mai departe." },
  { q: "De câte variante primesc?", a: "5 hook-uri per generare, fiecare pe o formulă diferită: întrebare, cifră, provocare, secret, rezultat, contra-intuitiv. Poți regenera oricând." },
  { q: "Sunt hook-urile adaptate pieței din România?", a: "Da. AI-ul cunoaște contextul local, expresiile care funcționează în română și sensibilitățile audienței românești." },
  { q: "Cât costă?", a: "1 credit per generare, inclus în toate planurile. Starter: 45 RON/lună cu 150 credite." },
];

export default function HookGeneratorPage() {
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
        <section className="pt-40 pb-24 text-center px-6" style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(251,146,60,0.08) 0%, transparent 60%), #0a0a0a" }}>
          <div className="mx-auto max-w-3xl">
            <span className="inline-block text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "#fb923c" }}>Hook Generator AI</span>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight mb-6">
              Primul rând care<br />oprește scrollul
            </h1>
            <p className="text-lg text-white/60 max-w-xl mx-auto mb-4 leading-relaxed">
              Un AI specializat în hook-uri de marketing pentru piața din România. 5 variante în 5 secunde, fiecare pe o formulă de copywriting diferită.
            </p>
            <p className="mb-8" style={{ color: "#fb923c", fontWeight: 600 }}>Ai 1.7 secunde să captezi atenția. Fă-le să conteze.</p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link href="/signup" className="px-8 py-4 rounded-full text-sm font-bold text-black" style={{ background: "linear-gradient(135deg,#fb923c,#f97316)" }}>
                Generează 5 hook-uri gratuit
              </Link>
              <Link href="/pricing" className="px-6 py-4 rounded-full text-sm font-semibold text-white/70 border border-white/15 hover:border-white/30 transition-colors">
                Vezi planurile →
              </Link>
            </div>
          </div>
        </section>

        {/* Hook types */}
        <section className="py-20 px-6 bg-[#0d0d0d]">
          <div className="mx-auto max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3 text-center" style={{ color: "#fb923c" }}>Unde folosești hook-urile</p>
            <h2 className="text-3xl font-bold text-white text-center mb-12">6 formate, un singur generator</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {HOOK_TYPES.map((ht) => (
                <div key={ht.title} className="rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <div className="text-2xl mb-3">{ht.icon}</div>
                  <h3 className="font-bold text-white mb-2">{ht.title}</h3>
                  <p className="text-sm text-white/50 leading-relaxed">{ht.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Hook formulas */}
        <section className="py-20 px-6">
          <div className="mx-auto max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3 text-center" style={{ color: "#fb923c" }}>Formule testate</p>
            <h2 className="text-3xl font-bold text-white text-center mb-12">6 formule de copywriting în fiecare generare</h2>
            <div className="space-y-3">
              {HOOK_FORMULAS.map((hf) => (
                <div key={hf.formula} className="rounded-xl p-5 flex gap-4 items-start" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}>
                  <div className="flex-shrink-0 px-3 py-1 rounded-full text-xs font-bold" style={{ background: "rgba(251,146,60,0.12)", color: "#fb923c" }}>
                    {hf.formula}
                  </div>
                  <p className="text-sm text-white/60 leading-relaxed italic">„{hf.example}"</p>
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
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm text-black" style={{ background: "linear-gradient(135deg,#fb923c,#f97316)" }}>
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
        <section className="py-20 px-6 text-center" style={{ background: "rgba(251,146,60,0.03)", borderTop: "1px solid rgba(251,146,60,0.1)" }}>
          <div className="mx-auto max-w-xl">
            <h2 className="text-3xl font-bold text-white mb-4">Oprește scrollul. Câștigă atenția.</h2>
            <p className="text-white/50 mb-2">10 credite gratuite la înregistrare. Fără card.</p>
            <p className="text-sm text-white/30 mb-8">Dacă nu ești mulțumit în 7 zile, îți returnăm banii.</p>
            <Link href="/signup" className="inline-block px-8 py-4 rounded-full text-sm font-bold text-black" style={{ background: "linear-gradient(135deg,#fb923c,#f97316)" }}>
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
