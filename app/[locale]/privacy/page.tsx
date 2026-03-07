import type { Metadata } from "next";
import Link from "next/link";
import Logo from "@/app/components/Logo";

export const metadata: Metadata = {
  title: "Politica de Confidențialitate | Nesco Digital AI",
  description: "Află cum colectăm, procesăm și protejăm datele tale personale pe platforma Nesco Digital AI.",
  alternates: {
    canonical: "https://ai.nescodigital.com/privacy",
    languages: {
      ro: "https://ai.nescodigital.com/privacy",
      en: "https://ai.nescodigital.com/en/privacy",
    },
  },
  robots: { index: true, follow: true },
};

const SECTIONS = [
  {
    title: "1. Cine suntem",
    content: `Nesco Digital SRL, cu sediul în România, operează platforma Nesco Digital AI accesibilă la ai.nescodigital.com. Suntem responsabili pentru procesarea datelor tale personale în conformitate cu Regulamentul General privind Protecția Datelor (GDPR) și legislația română aplicabilă.\n\nContact: contact@nescodigital.com`,
  },
  {
    title: "2. Ce date colectăm",
    content: `Colectăm următoarele categorii de date:\n\n• Date de cont: adresă de email, nume (furnizate la înregistrare)\n• Date de profil brand: informații despre afacerea ta, ton de voce, audiență, canale de marketing (furnizate voluntar în onboarding)\n• Date de utilizare: conținut generat, istoricul generărilor, creditele utilizate\n• Date de plată: procesate exclusiv prin Stripe — noi nu stocăm date de card\n• Date tehnice: adresă IP, browser, pagini vizitate (prin Google Analytics și Meta Pixel)\n• Date de contact waitlist: nume, email, telefon, tip business, buget (furnizate în formularul de pe pagina principală)`,
  },
  {
    title: "3. Cum folosim datele",
    content: `Datele tale sunt folosite pentru:\n\n• Furnizarea serviciului de generare de conținut AI personalizat\n• Trimiterea secvenței de emailuri de onboarding (welcome + follow-up)\n• Procesarea plăților și gestionarea abonamentelor\n• Îmbunătățirea platformei și a experienței utilizatorului\n• Trimiterea de comunicări de marketing (doar cu acordul tău explicit)\n• Conformarea cu obligațiile legale`,
  },
  {
    title: "4. Temeiul legal al procesării",
    content: `Procesăm datele tale pe următoarele temeiuri legale:\n\n• Executarea contractului — pentru furnizarea serviciului plătit\n• Consimțământ — pentru emailuri de marketing și cookie-uri analitice\n• Interes legitim — pentru securitatea platformei și prevenirea fraudei\n• Obligație legală — pentru păstrarea documentelor contabile`,
  },
  {
    title: "5. Cât timp păstrăm datele",
    content: `• Date de cont: pe durata abonamentului + 2 ani după reziliere\n• Istoricul generărilor: 12 luni\n• Date de facturare: 10 ani (obligație legală)\n• Date waitlist: 2 ani de la înregistrare\n• Date analitice: 26 luni (setare Google Analytics)`,
  },
  {
    title: "6. Cu cine împărtășim datele",
    content: `Nu vindem datele tale. Le partajăm doar cu:\n\n• Supabase (baza de date și autentificare) — stocare în UE\n• Anthropic (generare AI) — procesare în SUA, în conformitate cu clauzele contractuale standard\n• Stripe (procesare plăți) — certificat PCI DSS\n• Resend (trimitere emailuri) — stocare în UE\n• Google Analytics (analiză trafic) — date anonimizate\n• Meta (publicitate) — date agregate prin Meta Pixel\n• TheMarketer (email marketing) — furnizor român`,
  },
  {
    title: "7. Drepturile tale",
    content: `Conform GDPR, ai dreptul la:\n\n• Acces — să soliciți o copie a datelor tale\n• Rectificare — să corectezi date incorecte\n• Ștergere — să soliciti ștergerea datelor ("dreptul de a fi uitat")\n• Restricționare — să limitezi procesarea datelor tale\n• Portabilitate — să primești datele într-un format structurat\n• Opoziție — să te opui procesării pentru marketing direct\n\nPentru exercitarea drepturilor, contactează-ne la: contact@nescodigital.com\nRăspundem în maxim 30 de zile.`,
  },
  {
    title: "8. Cookie-uri",
    content: `Folosim:\n\n• Cookie-uri esențiale — necesare pentru funcționarea platformei (autentificare, sesiune)\n• Cookie-uri analitice — Google Analytics (cu anonimizare IP)\n• Cookie-uri de marketing — Meta Pixel pentru reclame Facebook/Instagram\n\nPoți dezactiva cookie-urile non-esențiale din setările browserului tău.`,
  },
  {
    title: "9. Securitate",
    content: `Aplicăm măsuri tehnice și organizatorice pentru protecția datelor:\n\n• Conexiuni criptate HTTPS/TLS\n• Autentificare securizată prin Supabase Auth\n• Acces restricționat la date (Row Level Security)\n• Parole niciodată stocate în clar\n• Monitorizare periodică a vulnerabilităților`,
  },
  {
    title: "10. Modificări ale politicii",
    content: `Putem actualiza această politică periodic. Modificările semnificative vor fi comunicate prin email cu cel puțin 14 zile înainte de intrarea în vigoare. Continuarea utilizării platformei după această perioadă constituie acceptul noii politici.`,
  },
  {
    title: "11. Contact și reclamații",
    content: `Pentru orice întrebare despre datele tale: contact@nescodigital.com\n\nAi dreptul să depui o plângere la Autoritatea Națională de Supraveghere a Prelucrării Datelor cu Caracter Personal (ANSPDCP): www.dataprotection.ro`,
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white" style={{ fontFamily: "var(--font-geist-sans)" }}>
      <header className="px-6 py-4 flex items-center border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
        <Logo />
        <Link href="/" className="ml-auto text-sm text-white/40 hover:text-white/70 transition-colors">
          ← Înapoi
        </Link>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-16">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#56db84] mb-3">Legal</p>
        <h1 className="text-3xl font-bold text-white mb-2">Politica de Confidențialitate</h1>
        <p className="text-sm text-white/30 mb-12">Ultima actualizare: 7 martie 2026</p>

        <div className="space-y-10">
          {SECTIONS.map((section) => (
            <section key={section.title}>
              <h2 className="text-lg font-bold text-white mb-3">{section.title}</h2>
              <div className="text-sm text-white/60 leading-relaxed whitespace-pre-line">
                {section.content}
              </div>
            </section>
          ))}
        </div>
      </main>

      <footer className="border-t py-8 text-center text-xs text-zinc-600" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
        © {new Date().getFullYear()} Nesco Digital. Toate drepturile rezervate.{" "}
        <Link href="/terms" className="hover:text-zinc-400 transition-colors ml-3">Termeni și Condiții</Link>
      </footer>
    </div>
  );
}
