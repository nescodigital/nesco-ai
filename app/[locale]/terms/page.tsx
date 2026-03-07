import type { Metadata } from "next";
import Link from "next/link";
import Logo from "@/app/components/Logo";

export const metadata: Metadata = {
  title: "Termeni și Condiții | Nesco Digital AI",
  description: "Termenii și condițiile de utilizare a platformei Nesco Digital AI — drepturi, obligații, plăți și politica de rambursare.",
  alternates: {
    canonical: "https://ai.nescodigital.com/terms",
    languages: {
      ro: "https://ai.nescodigital.com/terms",
      en: "https://ai.nescodigital.com/en/terms",
    },
  },
  robots: { index: true, follow: true },
};

const SECTIONS = [
  {
    title: "1. Acceptarea termenilor",
    content: `Prin crearea unui cont sau utilizarea platformei Nesco Digital AI (ai.nescodigital.com), ești de acord cu acești Termeni și Condiții. Dacă nu ești de acord, te rugăm să nu utilizezi platforma.\n\nAcești termeni constituie un contract legal între tine și Nesco Digital SRL, România.`,
  },
  {
    title: "2. Descrierea serviciului",
    content: `Nesco Digital AI este o platformă de generare de conținut de marketing bazată pe inteligență artificială. Serviciile includ:\n\n• Generator de conținut (postări social media, reclame, emailuri)\n• Calendar editorial automat\n• Spy AI — analiză competitor\n• Hook Generator\n• Persuasion Score\n• Voice Cloning (plan Pro și Multi-Brand)\n• Traducere în 10 limbi`,
  },
  {
    title: "3. Cont și acces",
    content: `• Trebuie să ai minimum 18 ani pentru a crea un cont\n• Ești responsabil pentru securitatea contului și a parolei tale\n• Nu poți transfera sau vinde accesul la cont\n• Un cont este valabil pentru o singură persoană sau entitate (excepție: planul Multi-Brand)\n• Ne rezervăm dreptul de a suspenda conturi care încalcă acești termeni`,
  },
  {
    title: "4. Credite și utilizare",
    content: `• Platforma funcționează pe bază de credite incluse în abonament lunar\n• Creditele neutilizate nu se transferă în luna următoare\n• 1 credit = 1 text generat sau 2 credite = 1 imagine AI\n• Creditele suplimentare pot fi achiziționate separat\n• Nu oferim rambursări pentru credite nefolosite`,
  },
  {
    title: "5. Plăți și abonamente",
    content: `• Plățile sunt procesate prin Stripe, securizat și criptat\n• Abonamentele sunt lunare și se reînnoiesc automat\n• Prețurile sunt afișate în RON și includ TVA unde aplicabil\n• Poți anula oricând din contul tău — accesul rămâne activ până la sfârșitul perioadei plătite\n• La anulare nu se emit rambursări prorata pentru perioada rămasă`,
  },
  {
    title: "6. Politica de rambursare",
    content: `Oferim garanție de 7 zile de la prima achiziție. Dacă nu ești mulțumit, contactează-ne în primele 7 zile la contact@nescodigital.com și îți returnăm integral suma plătită.\n\nCondiții:\n• Valabil doar pentru prima achiziție\n• Nu se aplică dacă au fost consumate mai mult de 20 de credite\n• Procesarea durează 5-10 zile lucrătoare`,
  },
  {
    title: "7. Conținut generat — proprietate și responsabilitate",
    content: `• Conținutul generat cu ajutorul platformei îți aparține ție\n• Ești responsabil pentru conținutul pe care îl publici\n• Nu folosești platforma pentru a genera conținut ilegal, înșelător, discriminatoriu sau care încalcă drepturile terților\n• Nu garantăm că conținutul generat este original sau lipsit de erori — verifică întotdeauna înainte de publicare\n• Nu suntem responsabili pentru decizii de business luate pe baza conținutului generat`,
  },
  {
    title: "8. Utilizare acceptabilă",
    content: `Este interzisă utilizarea platformei pentru:\n\n• Generarea de spam sau conținut de phishing\n• Încălcarea drepturilor de autor ale terților\n• Crearea de conținut fals, înșelător sau manipulativ\n• Atacarea sau denigrarea unor persoane sau grupuri\n• Automatizarea excesivă prin scraping sau boți\n• Revânzarea accesului la platformă`,
  },
  {
    title: "9. Disponibilitate și întreruperi",
    content: `Ne străduim să menținem platforma disponibilă 99% din timp. Cu toate acestea:\n\n• Nu garantăm disponibilitate neîntreruptă\n• Putem efectua mentenanță cu notificare prealabilă\n• Nu suntem responsabili pentru întreruperi cauzate de terți (Anthropic, Supabase, Stripe)\n• Creditele nu se compensează pentru întreruperi sub 24 de ore`,
  },
  {
    title: "10. Modificări ale serviciului și prețurilor",
    content: `Ne rezervăm dreptul de a:\n\n• Modifica funcționalitățile platformei\n• Ajusta prețurile cu notificare de minimum 30 de zile\n• Întrerupe serviciul cu notificare de minimum 60 de zile\n\nUtilizatorii cu abonament activ beneficiază de prețul blocat pe durata abonamentului curent (Founding Members — pe viață, conform ofertei la momentul achiziției).`,
  },
  {
    title: "11. Limitarea răspunderii",
    content: `În măsura permisă de lege, Nesco Digital SRL nu este responsabilă pentru:\n\n• Pierderi indirecte sau consecvente rezultate din utilizarea platformei\n• Prejudicii cauzate de conținut generat și publicat de utilizator\n• Pierderi de profit sau oportunități de business\n\nRăspunderea noastră totală nu poate depăși suma plătită de tine în ultimele 3 luni.`,
  },
  {
    title: "12. Lege aplicabilă",
    content: `Acești termeni sunt guvernați de legea română. Orice litigiu va fi soluționat de instanțele competente din România. Înainte de orice procedură legală, ne angajăm să depunem eforturi rezonabile pentru soluționarea amiabilă a disputelor.`,
  },
  {
    title: "13. Contact",
    content: `Nesco Digital SRL\nEmail: contact@nescodigital.com\nWeb: nescodigital.com`,
  },
];

export default function TermsPage() {
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
        <h1 className="text-3xl font-bold text-white mb-2">Termeni și Condiții</h1>
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
        <Link href="/privacy" className="hover:text-zinc-400 transition-colors ml-3">Politica de Confidențialitate</Link>
      </footer>
    </div>
  );
}
