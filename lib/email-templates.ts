// Shared email HTML templates for Nesco Digital AI

const BASE_STYLE = `
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: #0a0a0a;
  color: #ffffff;
  margin: 0;
  padding: 0;
`;

const CONTAINER = `
  max-width: 560px;
  margin: 0 auto;
  padding: 40px 24px;
`;

const BUTTON = `
  display: inline-block;
  background: linear-gradient(135deg, #56db84, #818cf8);
  color: #000000;
  text-decoration: none;
  padding: 14px 28px;
  border-radius: 10px;
  font-weight: 700;
  font-size: 15px;
  letter-spacing: -0.01em;
`;


const FOOTER = `
  margin-top: 40px;
  padding-top: 24px;
  border-top: 1px solid rgba(255,255,255,0.07);
  color: rgba(255,255,255,0.3);
  font-size: 12px;
  line-height: 1.6;
`;

function wrap(content: string): string {
  return `<!DOCTYPE html>
<html lang="ro">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Nesco Digital AI</title>
</head>
<body style="${BASE_STYLE}">
  <div style="${CONTAINER}">
    <!-- Logo -->
    <div style="margin-bottom: 32px;">
      <img src="https://zeiysldulaawgqdhhfpx.supabase.co/storage/v1/object/public/assets/ai_nescodigital_logo.png" alt="Nesco Digital AI" style="height: 25px; width: auto; display: block;" />
    </div>

    ${content}

    <div style="${FOOTER}">
      <p>Ai primit acest email pentru că te-ai înregistrat la Nesco Digital AI.</p>
      <p><a href="https://ai.nescodigital.com" style="color: rgba(255,255,255,0.3);">ai.nescodigital.com</a></p>
    </div>
  </div>
</body>
</html>`;
}

function getName(email: string): string {
  const part = email.split("@")[0].split(".")[0];
  return part.charAt(0).toUpperCase() + part.slice(1);
}

// ── EMAIL 1: Welcome (ziua 0) ─────────────────────────────────────────────────
export function welcomeEmail(email: string): { subject: string; html: string } {
  const name = getName(email);

  return {
    subject: `${name}, workspace-ul tău e gata. Ai 10 credite gratuite. ⚡`,
    html: wrap(`
      <h1 style="font-size: 26px; font-weight: 800; letter-spacing: -0.03em; margin: 0 0 8px; line-height: 1.2;">
        Bun venit, ${name}. 👋
      </h1>
      <p style="color: rgba(255,255,255,0.5); font-size: 15px; margin: 0 0 28px; line-height: 1.6;">
        AI-ul tău de marketing e configurat și gata. Ai <strong style="color: #56db84;">10 credite gratuite</strong> — destul să generezi primele postări, o reclamă Meta și să vezi cum funcționează sistemul.
      </p>

      <!-- Ce poți face acum -->
      <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 14px; padding: 24px; margin-bottom: 24px;">
        <p style="font-size: 12px; font-weight: 700; color: rgba(255,255,255,0.3); text-transform: uppercase; letter-spacing: 0.1em; margin: 0 0 16px;">
          Ce poți face cu cele 10 credite
        </p>
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <span style="font-size: 18px; width: 24px; text-align: center;">✍️</span>
            <div>
              <p style="margin: 0; font-size: 14px; font-weight: 600; color: #fff;">10 postări sau emailuri</p>
              <p style="margin: 2px 0 0; font-size: 12px; color: rgba(255,255,255,0.35);">Facebook, Instagram, LinkedIn, Email, Meta Ads — 1 credit fiecare</p>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 12px;">
            <span style="font-size: 18px; width: 24px; text-align: center;">🔍</span>
            <div>
              <p style="margin: 0; font-size: 14px; font-weight: 600; color: #fff;">2 analize Spy AI</p>
              <p style="margin: 2px 0 0; font-size: 12px; color: rgba(255,255,255,0.35);">Analizează orice competitor — 5 credite fiecare</p>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 12px;">
            <span style="font-size: 18px; width: 24px; text-align: center;">📅</span>
            <div>
              <p style="margin: 0; font-size: 14px; font-weight: 600; color: #fff;">Calendar editorial săptămânal</p>
              <p style="margin: 2px 0 0; font-size: 12px; color: rgba(255,255,255,0.35);">Planul e gratuit — generarea per slot costă 1 credit</p>
            </div>
          </div>
        </div>
      </div>

      <a href="https://ai.nescodigital.com/dashboard" style="${BUTTON}">
        ⚡ Deschide workspace-ul →
      </a>

      <p style="margin-top: 20px; font-size: 13px; color: rgba(255,255,255,0.3); line-height: 1.6;">
        Profilul brandului tău e deja salvat din onboarding. AI-ul va scrie în stilul tău de la prima generare — nu trebuie să explici nimic.
      </p>
    `),
  };
}

// ── EMAIL 2: Day 2 — Educațional: conținut care vinde ─────────────────────────
export function day2Email(email: string): { subject: string; html: string } {
  const name = getName(email);

  return {
    subject: "De ce 90% din postările românești nu vând (și cum să nu fii tu în aia 90%)",
    html: wrap(`
      <h1 style="font-size: 24px; font-weight: 800; letter-spacing: -0.03em; margin: 0 0 8px; line-height: 1.3;">
        Conținut bun vs. conținut care vinde 🎯
      </h1>
      <p style="color: rgba(255,255,255,0.5); font-size: 15px; margin: 0 0 28px; line-height: 1.6;">
        ${name}, există o diferență mare între un post care primește like-uri și unul care aduce clienți. Cei mai mulți antreprenori confundă engagement cu vânzări. Iată cum să nu faci asta.
      </p>

      <div style="display: flex; flex-direction: column; gap: 16px; margin-bottom: 28px;">
        <div style="border-left: 3px solid #56db84; padding: 4px 0 4px 16px;">
          <p style="margin: 0 0 4px; font-size: 14px; font-weight: 700; color: #fff;">✦ Specifică problema, nu soluția</p>
          <p style="margin: 0; font-size: 13px; color: rgba(255,255,255,0.5); line-height: 1.6;">
            "Economisești timp" e slab. "Nu mai petreci 3 ore pe săptămână scriind postări de la zero" e puternic. Fii specific cu durerea, nu cu promisiunea.
          </p>
        </div>
        <div style="border-left: 3px solid #818cf8; padding: 4px 0 4px 16px;">
          <p style="margin: 0 0 4px; font-size: 14px; font-weight: 700; color: #fff;">✦ Un singur CTA per post</p>
          <p style="margin: 0; font-size: 13px; color: rgba(255,255,255,0.5); line-height: 1.6;">
            "Comentează, dă share și intră pe site" = nimeni nu face nimic. Când generezi conținut, alege un singur obiectiv — vânzare, engagement sau awareness.
          </p>
        </div>
        <div style="border-left: 3px solid #56db84; padding: 4px 0 4px 16px;">
          <p style="margin: 0 0 4px; font-size: 14px; font-weight: 700; color: #fff;">✦ Hook-ul face diferența</p>
          <p style="margin: 0; font-size: 13px; color: rgba(255,255,255,0.5); line-height: 1.6;">
            Prima propoziție decide dacă oamenii citesc sau scroll-uiesc. Încearcă Hook Generator-ul din dashboard — generează 10 variante psihologice pentru orice subiect.
          </p>
        </div>
        <div style="border-left: 3px solid #818cf8; padding: 4px 0 4px 16px;">
          <p style="margin: 0 0 4px; font-size: 14px; font-weight: 700; color: #fff;">✦ Contextul multiplică calitatea</p>
          <p style="margin: 0; font-size: 13px; color: rgba(255,255,255,0.5); line-height: 1.6;">
            "Post despre reduceri" vs "Post despre reducere 30% la colecția de primăvară, femei 25–40 ani, weekend-ul ăsta". Al doilea câștigă mereu — adaugă context în câmpul dedicat din generator.
          </p>
        </div>
      </div>

      <a href="https://ai.nescodigital.com/dashboard" style="${BUTTON}">
        Încearcă acum →
      </a>
    `),
  };
}

// ── EMAIL 3: Day 4 — Spy AI + Hook Generator demo ─────────────────────────────
export function day4Email(email: string): { subject: string; html: string } {
  const name = getName(email);

  return {
    subject: "Știi exact ce fac competitorii tăi pe social media?",
    html: wrap(`
      <h1 style="font-size: 24px; font-weight: 800; letter-spacing: -0.03em; margin: 0 0 8px; line-height: 1.3;">
        Competitorii tăi au o strategie. Tu o știi? 🔍
      </h1>
      <p style="color: rgba(255,255,255,0.5); font-size: 15px; margin: 0 0 28px; line-height: 1.6;">
        ${name}, în timp ce tu postezi "din instinct", competitorii tăi testează mesaje, hook-uri și oferte. Cu Spy AI, poți vedea exact ce funcționează pentru ei — și cum îi poți depăși.
      </p>

      <!-- Spy AI -->
      <div style="background: rgba(86,219,132,0.05); border: 1px solid rgba(86,219,132,0.2); border-radius: 14px; padding: 20px; margin-bottom: 16px;">
        <p style="margin: 0 0 6px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #56db84;">🔍 Spy AI</p>
        <p style="margin: 0 0 10px; font-size: 15px; font-weight: 700; color: #fff;">Analizezi orice competitor în 30 de secunde</p>
        <p style="margin: 0 0 14px; font-size: 13px; color: rgba(255,255,255,0.5); line-height: 1.6;">
          Paste URL-ul oricărei pagini de Facebook sau website. AI-ul extrage strategia lor, mesajele cheie, punctele slabe și îți spune exact cum îi poți depăși.
        </p>
        <p style="margin: 0; font-size: 12px; color: rgba(255,255,255,0.3);">Costă 5 credite per analiză.</p>
      </div>

      <!-- Hook Generator -->
      <div style="background: rgba(129,140,248,0.05); border: 1px solid rgba(129,140,248,0.2); border-radius: 14px; padding: 20px; margin-bottom: 28px;">
        <p style="margin: 0 0 6px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #818cf8;">🎣 Hook Generator</p>
        <p style="margin: 0 0 10px; font-size: 15px; font-weight: 700; color: #fff;">10 hook-uri pentru orice subiect — gratuit</p>
        <p style="margin: 0; font-size: 13px; color: rgba(255,255,255,0.5); line-height: 1.6;">
          Scrii subiectul și primești 10 variante de prima propoziție — curiozitate, șoc, statistici, poveste personală, controversă. Fiecare cu explicația psihologică.
        </p>
      </div>

      <a href="https://ai.nescodigital.com/dashboard" style="${BUTTON}">
        Încearcă Spy AI →
      </a>
    `),
  };
}

// ── EMAIL 4: Day 7 — Founding Members urgency ─────────────────────────────────
export function day7Email(email: string): { subject: string; html: string } {
  const name = getName(email);

  return {
    subject: "Mai sunt locuri la prețul de fondator? (verifică acum)",
    html: wrap(`
      <h1 style="font-size: 24px; font-weight: 800; letter-spacing: -0.03em; margin: 0 0 8px; line-height: 1.3;">
        Primii 200 de clienți prind prețul blocat pe viață. 🔒
      </h1>
      <p style="color: rgba(255,255,255,0.5); font-size: 15px; margin: 0 0 28px; line-height: 1.6;">
        ${name}, suntem în faza de lansare și am decis să oferim un avantaj real primilor 200 de clienți plătitori: prețul actual blocat pe viață. Când prețurile cresc (și vor crește), tu rămâi la prețul de acum.
      </p>

      <!-- Plans founding -->
      <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 28px;">
        <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 16px 20px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <p style="margin: 0 0 2px; font-size: 14px; font-weight: 700; color: #fff;">Starter</p>
            <p style="margin: 0; font-size: 12px; color: rgba(255,255,255,0.4);">60 credite/lună · Toate tool-urile</p>
          </div>
          <div style="text-align: right;">
            <p style="margin: 0; font-size: 20px; font-weight: 800; color: #56db84;">45 RON<span style="font-size: 12px; font-weight: 400; color: rgba(255,255,255,0.3)">/lună</span></p>
            <p style="margin: 0; font-size: 11px; color: rgba(255,255,255,0.25); text-decoration: line-through;">viitor: 89 RON</p>
          </div>
        </div>
        <div style="background: linear-gradient(135deg,rgba(86,219,132,0.07),rgba(129,140,248,0.05)); border: 1.5px solid rgba(86,219,132,0.3); border-radius: 12px; padding: 16px 20px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <p style="margin: 0 0 2px; font-size: 14px; font-weight: 700; color: #fff;">Pro <span style="font-size: 11px; background: rgba(86,219,132,0.15); color: #56db84; padding: 2px 7px; border-radius: 20px;">Popular</span></p>
            <p style="margin: 0; font-size: 12px; color: rgba(255,255,255,0.4);">200 credite/lună · Voice Cloning inclus</p>
          </div>
          <div style="text-align: right;">
            <p style="margin: 0; font-size: 20px; font-weight: 800; color: #56db84;">99 RON<span style="font-size: 12px; font-weight: 400; color: rgba(255,255,255,0.3)">/lună</span></p>
            <p style="margin: 0; font-size: 11px; color: rgba(255,255,255,0.25); text-decoration: line-through;">viitor: 169 RON</p>
          </div>
        </div>
        <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 16px 20px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <p style="margin: 0 0 2px; font-size: 14px; font-weight: 700; color: #fff;">Multi-Brand</p>
            <p style="margin: 0; font-size: 12px; color: rgba(255,255,255,0.4);">600 credite/lună · 5 branduri</p>
          </div>
          <div style="text-align: right;">
            <p style="margin: 0; font-size: 20px; font-weight: 800; color: #56db84;">199 RON<span style="font-size: 12px; font-weight: 400; color: rgba(255,255,255,0.3)">/lună</span></p>
            <p style="margin: 0; font-size: 11px; color: rgba(255,255,255,0.25); text-decoration: line-through;">viitor: 349 RON</p>
          </div>
        </div>
      </div>

      <a href="https://ai.nescodigital.com/pricing" style="${BUTTON}">
        Prinde prețul de fondator →
      </a>

      <p style="margin-top: 16px; font-size: 13px; color: rgba(255,255,255,0.3); line-height: 1.6;">
        Anulezi oricând. Dacă nu ești mulțumit în primele 7 zile, îți returnăm banii.
      </p>
    `),
  };
}

// ── EMAIL 5: Day 10 — Voice Cloning + Persuasion Score ───────────────────────
export function day10Email(email: string): { subject: string; html: string } {
  const name = getName(email);

  return {
    subject: "Scrie AI exact ca tine. Nu ca un robot.",
    html: wrap(`
      <h1 style="font-size: 24px; font-weight: 800; letter-spacing: -0.03em; margin: 0 0 8px; line-height: 1.3;">
        Conținut care sună ca tine. Serios. 🎙️
      </h1>
      <p style="color: rgba(255,255,255,0.5); font-size: 15px; margin: 0 0 28px; line-height: 1.6;">
        ${name}, cel mai mare complaint față de AI e că "sună robotic". Am rezolvat asta cu Voice Cloning — dar mai sunt două tool-uri pe care probabil nu le-ai descoperit încă.
      </p>

      <!-- Voice Cloning -->
      <div style="background: rgba(129,140,248,0.05); border: 1px solid rgba(129,140,248,0.2); border-radius: 14px; padding: 20px; margin-bottom: 14px;">
        <p style="margin: 0 0 6px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #818cf8;">🎙️ Voice Cloning (plan Pro)</p>
        <p style="margin: 0 0 10px; font-size: 15px; font-weight: 700; color: #fff;">"Scrie ca mine" — AI-ul tău, stilul tău</p>
        <p style="margin: 0; font-size: 13px; color: rgba(255,255,255,0.5); line-height: 1.6;">
          Paste-uiești 3–10 texte scrise de tine. AI-ul extrage ritmul, expresiile preferate, lungimea frazelor, tonul unic. De atunci scrie exact ca tine — nu ca un copywriter generic.
        </p>
      </div>

      <!-- Persuasion Score -->
      <div style="background: rgba(86,219,132,0.05); border: 1px solid rgba(86,219,132,0.2); border-radius: 14px; padding: 20px; margin-bottom: 28px;">
        <p style="margin: 0 0 6px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #56db84;">📊 Persuasion Score</p>
        <p style="margin: 0 0 10px; font-size: 15px; font-weight: 700; color: #fff;">Scor 0–100 pentru orice text</p>
        <p style="margin: 0; font-size: 13px; color: rgba(255,255,255,0.5); line-height: 1.6;">
          Paste-uiești orice text — post, email, reclamă, descriere produs. Primești un scor de persuasiune, punctul exact unde cititorul se pierde și 3 sugestii concrete de îmbunătățire.
        </p>
      </div>

      <a href="https://ai.nescodigital.com/dashboard" style="${BUTTON}">
        Testează Persuasion Score →
      </a>

      <p style="margin-top: 20px; font-size: 13px; color: rgba(255,255,255,0.3); line-height: 1.6;">
        Voice Cloning e disponibil din planul Pro. Persuasion Score e disponibil pe orice plan.
      </p>
    `),
  };
}

// ── EMAIL 6: Day 14 — Final urgency + social proof ────────────────────────────
export function day14Email(email: string): { subject: string; html: string } {
  const name = getName(email);

  return {
    subject: `${name}, mai ai credite? Iată ce urmează.`,
    html: wrap(`
      <h1 style="font-size: 24px; font-weight: 800; letter-spacing: -0.03em; margin: 0 0 8px; line-height: 1.3;">
        14 zile. Ai testat. Acum fă-o serios. 🚀
      </h1>
      <p style="color: rgba(255,255,255,0.5); font-size: 15px; margin: 0 0 28px; line-height: 1.6;">
        ${name}, au trecut două săptămâni de când ai acces. Dacă AI-ul ți-a economisit timp sau ți-a generat conținut mai bun, acum e momentul să faci pasul următor.
      </p>

      <!-- Social proof -->
      <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 28px;">
        <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 12px; padding: 16px 20px;">
          <p style="margin: 0 0 8px; font-size: 13px; color: rgba(255,255,255,0.75); line-height: 1.6; font-style: italic;">
            "Înainte petreceam 3 ore pe săptămână să scriu postări. Acum le generez în 5 minute și sună exact ca mine."
          </p>
          <p style="margin: 0; font-size: 12px; color: rgba(255,255,255,0.35);">Andreea M. — fondatoare, brand de cosmetice</p>
        </div>
        <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 12px; padding: 16px 20px;">
          <p style="margin: 0 0 8px; font-size: 13px; color: rgba(255,255,255,0.75); line-height: 1.6; font-style: italic;">
            "Reclamele noastre Meta au un CTR dublu față de ce scriam noi. Merită fiecare leu."
          </p>
          <p style="margin: 0; font-size: 12px; color: rgba(255,255,255,0.35);">Dan S. — director vânzări, firmă de software</p>
        </div>
      </div>

      <!-- Founding urgency -->
      <div style="background: linear-gradient(135deg,rgba(86,219,132,0.08),rgba(129,140,248,0.06)); border: 1.5px solid rgba(86,219,132,0.25); border-radius: 14px; padding: 20px; margin-bottom: 28px; text-align: center;">
        <p style="margin: 0 0 4px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #56db84;">Founding Members</p>
        <p style="margin: 0 0 8px; font-size: 16px; font-weight: 700; color: #fff;">Prețul de fondator expiră la 200 de clienți.</p>
        <p style="margin: 0; font-size: 13px; color: rgba(255,255,255,0.4);">Locurile se termină. Când dispar, prețurile cresc.</p>
      </div>

      <a href="https://ai.nescodigital.com/pricing" style="${BUTTON}">
        Vezi locurile rămase →
      </a>

      <p style="margin-top: 16px; font-size: 13px; color: rgba(255,255,255,0.3);">
        Anulezi oricând. Garanție 7 zile.
      </p>
    `),
  };
}

// ── Existing functional emails (unchanged) ────────────────────────────────────

export function contentEmail({
  email,
  content,
  contentType,
  objective,
}: {
  email: string;
  content: string;
  contentType: string;
  objective: string;
}): { subject: string; html: string } {
  const htmlContent = content
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/\n/g, "<br/>");

  return {
    subject: `Continutul tau generat: ${contentType}`,
    html: wrap(`
      <h1 style="font-size: 22px; font-weight: 800; letter-spacing: -0.03em; margin: 0 0 6px; line-height: 1.2;">
        Continutul tau este gata
      </h1>
      <p style="color: rgba(255,255,255,0.4); font-size: 14px; margin: 0 0 24px;">
        ${contentType} · ${objective}
      </p>

      <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(86,219,132,0.2); border-radius: 14px; padding: 20px; margin-bottom: 28px;">
        <p style="margin: 0; font-size: 14px; color: rgba(255,255,255,0.85); line-height: 1.7; white-space: pre-wrap;">${htmlContent}</p>
      </div>

      <a href="https://ai.nescodigital.com/dashboard" style="${BUTTON}">
        Genereaza mai mult continut
      </a>
    `),
  };
}

export function calendarPlanEmail({
  slots,
  weekLabel,
}: {
  slots: Array<{ date: string; contentType: string; objective: string; result: string }>;
  weekLabel: string;
}): { subject: string; html: string } {
  const MONTHS_RO = ["ian", "feb", "mar", "apr", "mai", "iun", "iul", "aug", "sep", "oct", "nov", "dec"];
  const DAYS_RO = ["Dum", "Lun", "Mar", "Mie", "Joi", "Vin", "Sâm"];

  const slotsHtml = slots.map((s) => {
    const [y, m, d] = s.date.split("-").map(Number);
    const dt = new Date(y, m - 1, d);
    const dayLabel = `${DAYS_RO[dt.getDay()]} ${d} ${MONTHS_RO[m - 1]}`;

    const htmlContent = s.result
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      .replace(/\n/g, "<br/>");

    return `
      <div style="margin-bottom: 20px; border: 1px solid rgba(86,219,132,0.15); border-radius: 12px; overflow: hidden;">
        <div style="background: rgba(86,219,132,0.07); padding: 10px 16px; display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 13px; font-weight: 700; color: rgba(255,255,255,0.8);">${dayLabel}</span>
          <span style="font-size: 11px; color: rgba(255,255,255,0.35);">${s.contentType} - ${s.objective}</span>
        </div>
        <div style="padding: 14px 16px; font-size: 13px; color: rgba(255,255,255,0.75); line-height: 1.7;">${htmlContent}</div>
      </div>
    `;
  }).join("");

  return {
    subject: `Plan editorial ${weekLabel} (${slots.length} postări)`,
    html: wrap(`
      <h1 style="font-size: 22px; font-weight: 800; letter-spacing: -0.03em; margin: 0 0 6px; line-height: 1.2;">
        Planul tău editorial
      </h1>
      <p style="color: rgba(255,255,255,0.4); font-size: 14px; margin: 0 0 24px;">
        ${weekLabel} - ${slots.length} ${slots.length === 1 ? "postare generată" : "postări generate"}
      </p>
      ${slotsHtml}
      <a href="https://ai.nescodigital.com/dashboard" style="${BUTTON}">
        Generează mai mult continut
      </a>
    `),
  };
}

export function spyReportEmail({
  analysis,
  competitorName,
}: {
  analysis: {
    competitorName?: string;
    strategy?: string;
    tone?: string;
    painPoints?: string[];
    hooks?: string[];
    weaknesses?: string[];
    differentiation?: string;
    actionableMove?: string;
    offers?: string[];
    brandInsights?: { usp?: string; tone_words?: string[]; buying_decision?: string };
  };
  competitorName: string;
}): { subject: string; html: string } {
  const name = analysis.competitorName || competitorName;

  function listItems(items: string[] | undefined, color: string): string {
    if (!items || items.length === 0) return "";
    return items.map(i => `
      <div style="display:flex;align-items:flex-start;gap:10px;margin-bottom:10px;">
        <span style="color:${color};font-size:14px;flex-shrink:0;margin-top:1px;">→</span>
        <span style="font-size:13px;color:rgba(255,255,255,0.75);line-height:1.6;">${i.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}</span>
      </div>`).join("");
  }

  const brandInsightsSection = analysis.brandInsights ? `
    <div style="margin-top:20px;background:rgba(129,140,248,0.07);border:1px solid rgba(129,140,248,0.25);border-radius:12px;padding:16px 20px;">
      <p style="margin:0 0 10px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#818cf8;">Recomandări pentru brandul tău</p>
      ${analysis.brandInsights.usp ? `<p style="margin:0 0 8px;font-size:13px;color:rgba(255,255,255,0.8);line-height:1.6;"><strong>USP:</strong> ${analysis.brandInsights.usp}</p>` : ""}
      ${analysis.brandInsights.tone_words && analysis.brandInsights.tone_words.length > 0 ? `<p style="margin:0 0 8px;font-size:13px;color:rgba(255,255,255,0.8);"><strong>Ton:</strong> ${analysis.brandInsights.tone_words.join(", ")}</p>` : ""}
      ${analysis.brandInsights.buying_decision ? `<p style="margin:0;font-size:13px;color:rgba(255,255,255,0.8);line-height:1.6;"><strong>Decizia de cumpărare:</strong> ${analysis.brandInsights.buying_decision}</p>` : ""}
    </div>` : "";

  return {
    subject: `Raport Spy AI — ${name}`,
    html: wrap(`
      <h1 style="font-size:22px;font-weight:800;letter-spacing:-0.03em;margin:0 0 4px;line-height:1.2;">Raport Spy AI</h1>
      <p style="color:rgba(255,255,255,0.4);font-size:14px;margin:0 0 28px;">${name}</p>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px;">
        <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:12px;padding:16px;">
          <p style="margin:0 0 8px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:rgba(255,255,255,0.3);">Strategia lor</p>
          <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.75);line-height:1.6;">${(analysis.strategy || "").replace(/&/g,"&amp;")}</p>
        </div>
        <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:12px;padding:16px;">
          <p style="margin:0 0 8px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:rgba(255,255,255,0.3);">Ton comunicare</p>
          <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.75);line-height:1.6;">${(analysis.tone || "").replace(/&/g,"&amp;")}</p>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px;">
        <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:12px;padding:16px;">
          <p style="margin:0 0 10px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:rgba(255,255,255,0.3);">Frici / Dureri adresate</p>
          ${listItems(analysis.painPoints, "#f87171")}
        </div>
        <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:12px;padding:16px;">
          <p style="margin:0 0 10px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:rgba(255,255,255,0.3);">Mesaje cheie</p>
          ${listItems(analysis.hooks, "#818cf8")}
        </div>
      </div>

      <div style="background:rgba(234,179,8,0.06);border:1px solid rgba(234,179,8,0.2);border-radius:12px;padding:16px;margin-bottom:16px;">
        <p style="margin:0 0 10px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#ca8a04;">Puncte slabe identificate</p>
        ${listItems(analysis.weaknesses, "#ca8a04")}
      </div>

      <div style="background:rgba(86,219,132,0.06);border:1px solid rgba(86,219,132,0.2);border-radius:12px;padding:16px;margin-bottom:16px;">
        <p style="margin:0 0 8px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#56db84;">Avantajul tău competitiv</p>
        <p style="margin:0 0 14px;font-size:13px;color:rgba(255,255,255,0.8);line-height:1.6;">${(analysis.differentiation || "").replace(/&/g,"&amp;")}</p>
        ${analysis.actionableMove ? `
        <p style="margin:0 0 6px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:rgba(86,219,132,0.6);">Acțiunea de făcut acum</p>
        <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.8);line-height:1.6;">${analysis.actionableMove.replace(/&/g,"&amp;")}</p>
        ` : ""}
      </div>

      ${brandInsightsSection}

      <div style="margin-top:28px;">
        <a href="https://ai.nescodigital.com/dashboard" style="${BUTTON}">Deschide Spy AI →</a>
      </div>
    `),
  };
}

// Keep day5Email as alias for backwards compatibility with existing cron
export function day5Email(email: string): { subject: string; html: string } {
  return day14Email(email);
}
