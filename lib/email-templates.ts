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
      <img src="https://zeiysldulaawgqdhhfpx.supabase.co/storage/v1/object/public/assets/ai_nescodigital_logo.png" alt="Nesco Digital AI" style="height: 36px; width: auto; display: block;" />
    </div>

    ${content}

    <div style="${FOOTER}">
      <p>Ai primit acest email pentru că te-ai înregistrat la Nesco Digital AI.</p>
    </div>
  </div>
</body>
</html>`;
}

export function welcomeEmail(email: string): { subject: string; html: string } {
  const firstName = email.split("@")[0].split(".")[0];
  const displayName = firstName.charAt(0).toUpperCase() + firstName.slice(1);

  return {
    subject: "Ai 10 credite gratuite. Hai să le folosești. ⚡",
    html: wrap(`
      <h1 style="font-size: 26px; font-weight: 800; letter-spacing: -0.03em; margin: 0 0 8px; line-height: 1.2;">
        Bun venit, ${displayName}! 👋
      </h1>
      <p style="color: rgba(255,255,255,0.5); font-size: 15px; margin: 0 0 32px; line-height: 1.6;">
        Contul tău Nesco Digital AI e activ. Ai <strong style="color: #56db84;">10 credite gratuite</strong> care te așteaptă.
      </p>

      <!-- Steps -->
      <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 14px; padding: 24px; margin-bottom: 28px;">
        <p style="font-size: 12px; font-weight: 700; color: rgba(255,255,255,0.3); text-transform: uppercase; letter-spacing: 0.1em; margin: 0 0 16px;">
          Cum funcționează
        </p>
        <div style="display: flex; flex-direction: column; gap: 14px;">
          <div style="display: flex; align-items: flex-start; gap: 12px;">
            <div style="width: 24px; height: 24px; border-radius: 8px; background: linear-gradient(135deg,rgba(86,219,132,0.2),rgba(129,140,248,0.15)); flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; color: #56db84;">1</div>
            <div>
              <p style="margin: 0; font-size: 14px; font-weight: 600; color: #ffffff;">Alege tipul de conținut</p>
              <p style="margin: 4px 0 0; font-size: 13px; color: rgba(255,255,255,0.4);">Post, email, reclamă - AI-ul știe regulile fiecărei platforme.</p>
            </div>
          </div>
          <div style="display: flex; align-items: flex-start; gap: 12px;">
            <div style="width: 24px; height: 24px; border-radius: 8px; background: linear-gradient(135deg,rgba(86,219,132,0.2),rgba(129,140,248,0.15)); flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; color: #56db84;">2</div>
            <div>
              <p style="margin: 0; font-size: 14px; font-weight: 600; color: #ffffff;">Spune-i despre ce să scrie</p>
              <p style="margin: 4px 0 0; font-size: 13px; color: rgba(255,255,255,0.4);">Un context scurt - promoție, produs nou, eveniment.</p>
            </div>
          </div>
          <div style="display: flex; align-items: flex-start; gap: 12px;">
            <div style="width: 24px; height: 24px; border-radius: 8px; background: linear-gradient(135deg,rgba(86,219,132,0.2),rgba(129,140,248,0.15)); flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; color: #56db84;">3</div>
            <div>
              <p style="margin: 0; font-size: 14px; font-weight: 600; color: #ffffff;">Generează și publică</p>
              <p style="margin: 4px 0 0; font-size: 13px; color: rgba(255,255,255,0.4);">Conținut în stilul brandului tău, gata de publicat.</p>
            </div>
          </div>
        </div>
      </div>

      <a href="https://ai.nescodigital.com/dashboard" style="${BUTTON}">
        ⚡ Deschide workspace-ul →
      </a>

      <p style="margin-top: 24px; font-size: 13px; color: rgba(255,255,255,0.3);">
        Ai completat profilul brandului tău la înregistrare - AI-ul va scrie deja în stilul tău. Dacă vrei să actualizezi ceva, găsești setările în dashboard.
      </p>
    `),
  };
}

export function day2Email(email: string): { subject: string; html: string } {
  return {
    subject: "Cum să creezi conținut care vinde (nu doar postări frumoase)",
    html: wrap(`
      <h1 style="font-size: 26px; font-weight: 800; letter-spacing: -0.03em; margin: 0 0 8px; line-height: 1.2;">
        Conținut bun vs. conținut care vinde 🎯
      </h1>
      <p style="color: rgba(255,255,255,0.5); font-size: 15px; margin: 0 0 28px; line-height: 1.6;">
        Există o diferență mare între un post care primește like-uri și unul care aduce clienți. Ți-o explicăm în 3 minute.
      </p>

      <!-- Tip 1 -->
      <div style="border-left: 3px solid #56db84; padding: 4px 0 4px 16px; margin-bottom: 20px;">
        <p style="margin: 0 0 6px; font-size: 14px; font-weight: 700; color: #ffffff;">✦ Specifică problema, nu soluția</p>
        <p style="margin: 0; font-size: 13px; color: rgba(255,255,255,0.5); line-height: 1.6;">
          "Economisești timp" e slab. "Nu mai petreci 3 ore pe săptămână scriind postări" e puternic. AI-ul nostru folosește context-ul tău pentru a fi specific.
        </p>
      </div>

      <!-- Tip 2 -->
      <div style="border-left: 3px solid #818cf8; padding: 4px 0 4px 16px; margin-bottom: 20px;">
        <p style="margin: 0 0 6px; font-size: 14px; font-weight: 700; color: #ffffff;">✦ Un singur CTA per post</p>
        <p style="margin: 0; font-size: 13px; color: rgba(255,255,255,0.5); line-height: 1.6;">
          "Comentează, dă share și intră pe site" = nimeni nu face nimic. Alege un singur obiectiv când generezi - AI-ul va construi postul în jurul lui.
        </p>
      </div>

      <!-- Tip 3 -->
      <div style="border-left: 3px solid #56db84; padding: 4px 0 4px 16px; margin-bottom: 32px;">
        <p style="margin: 0 0 6px; font-size: 14px; font-weight: 700; color: #ffffff;">✦ Contextul face diferența</p>
        <p style="margin: 0; font-size: 13px; color: rgba(255,255,255,0.5); line-height: 1.6;">
          "Post despre reduceri" vs "Post despre reducere 30% la colecția de primăvară, pentru femei 25-40 ani, weekend-ul ăsta". Al doilea câștigă mereu.
        </p>
      </div>

      <a href="https://ai.nescodigital.com/dashboard" style="${BUTTON}">
        Încearcă acum →
      </a>
    `),
  };
}

export function day5Email(email: string): { subject: string; html: string } {
  return {
    subject: "Creditele tale gratuite expiră curând → Vezi planurile",
    html: wrap(`
      <h1 style="font-size: 26px; font-weight: 800; letter-spacing: -0.03em; margin: 0 0 8px; line-height: 1.2;">
        Ai testat. Acum fă-o serios. 🚀
      </h1>
      <p style="color: rgba(255,255,255,0.5); font-size: 15px; margin: 0 0 28px; line-height: 1.6;">
        Creditele gratuite sunt aproape de final. Dacă AI-ul ți-a economisit timp și ți-a plăcut conținutul generat, acum e momentul să treci la un plan.
      </p>

      <!-- Plans -->
      <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 32px;">
        <!-- Starter -->
        <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 20px;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div>
              <p style="margin: 0 0 4px; font-size: 15px; font-weight: 700; color: #ffffff;">Starter</p>
              <p style="margin: 0; font-size: 13px; color: rgba(255,255,255,0.4);">50 generări/lună - perfect pentru un brand activ</p>
            </div>
            <p style="margin: 0; font-size: 20px; font-weight: 800; color: #56db84; white-space: nowrap;">9€<span style="font-size: 12px; font-weight: 400; color: rgba(255,255,255,0.3)">/lună</span></p>
          </div>
        </div>
        <!-- Pro -->
        <div style="background: linear-gradient(135deg,rgba(86,219,132,0.07),rgba(129,140,248,0.05)); border: 1px solid rgba(86,219,132,0.25); border-radius: 14px; padding: 20px;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div>
              <p style="margin: 0 0 4px; font-size: 15px; font-weight: 700; color: #ffffff;">Pro <span style="font-size: 11px; background: rgba(86,219,132,0.15); color: #56db84; padding: 2px 8px; border-radius: 20px; font-weight: 600;">Popular</span></p>
              <p style="margin: 0; font-size: 13px; color: rgba(255,255,255,0.4);">200 generări/lună + traduceri incluse</p>
            </div>
            <p style="margin: 0; font-size: 20px; font-weight: 800; color: #56db84; white-space: nowrap;">29€<span style="font-size: 12px; font-weight: 400; color: rgba(255,255,255,0.3)">/lună</span></p>
          </div>
        </div>
      </div>

      <a href="https://ai.nescodigital.com/pricing" style="${BUTTON}">
        Vezi toate planurile →
      </a>

      <p style="margin-top: 20px; font-size: 13px; color: rgba(255,255,255,0.3);">
        Poți anula oricând. Fără costuri ascunse.
      </p>
    `),
  };
}
