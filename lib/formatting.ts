export function getFormattingInstructions(contentType: string): string {
  const base = `REGULI ABSOLUTE DE FORMATARE:
- Nu folosi niciodată "—" (em dash) sau "–" (en dash). Înlocuiește cu virgulă, punct sau rescrie propoziția.
- Nu adăuga titluri, etichete sau explicații în afara conținutului final.
- Livrează DOAR conținutul gata de copiat și publicat.`;

  const rules: Record<string, string> = {
    "Post Facebook": `${base}
FORMAT POST FACEBOOK:
- Lungime: 150-300 cuvinte
- Primul rând trebuie să fie un hook puternic (întrebare, afirmație șoc sau cifră)
- Paragrafele scurte, max 3-4 rânduri fiecare, cu spațiu între ele
- Încheie cu un singur CTA clar (comentariu, like, click pe link)
- 3-5 hashtag-uri relevante la final, pe un rând separat
- Nu folosi bullet points cu •; folosește paragrafe sau emoji-uri ca separatori`,

    "Post Instagram": `${base}
FORMAT POST INSTAGRAM:
- Lungime caption: 80-150 cuvinte (textul vizibil înainte de "mai mult")
- Primul rând (hook): max 125 caractere, trebuie să oprească scroll-ul
- Folosește emoji-uri ca separatori vizuali între idei (2-4 emoji-uri per post)
- Spații între paragrafe scurte (1-2 propoziții fiecare)
- CTA în penultimul paragraf
- 10-15 hashtag-uri la final pe rânduri separate sau grupate, mix nișă + general`,

    "Post LinkedIn": `${base}
FORMAT POST LINKEDIN:
- Lungime: 200-400 cuvinte
- Prima propoziție: hook provocator sau insight neașteptat (fără "Astăzi vreau să vă spun...")
- Structură: Hook → Context/Problemă → Insight/Soluție → Lecție → CTA
- Paragrafele de 1-2 propoziții, cu enter între fiecare
- Ton profesionist dar uman, nu corporatist
- Final cu întrebare deschisă pentru comentarii
- Fără hashtag-uri sau maxim 3 la final`,

    "Email newsletter": `${base}
FORMAT EMAIL NEWSLETTER:
- Subject line: max 50 caractere, fără emoji-uri, creează curiozitate
- Preview text: 90-100 caractere, completează subject-ul
- Structură: salut personalizat → intro scurt (2-3 propoziții) → corp principal → CTA → semnătură
- Paragrafele scurte, 3-4 rânduri max
- Un singur CTA principal, vizibil, formulat ca buton text (ex: "→ Citește acum")
- Ton conversațional, ca un email de la un prieten
- Lungime totală: 200-350 cuvinte`,

    "Reclamă Meta Ads": `${base}
FORMAT RECLAMĂ META ADS:
- Primary text: 125 caractere (textul principal vizibil fără "Citește mai mult")
- Headline: max 40 caractere, beneficiu direct sau cifră
- Description (opțional): max 30 caractere, CTA sau detaliu
- Livrează toate cele 3 componente clar etichetate: PRIMARY TEXT / HEADLINE / DESCRIPTION
- Primary text: hook + problemă + soluție + urgență în 1-3 propoziții scurte
- Fără hashtag-uri în reclame
- Ton direct, conversațional, beneficiu înainte de feature`,
  };

  return rules[contentType] || base;
}

export const TRANSLATE_FORMATTING = `REGULI ABSOLUTE DE FORMATARE ÎN TRADUCERE:
- Nu folosi niciodată "—" (em dash) sau "–" (en dash) în textul tradus.
- Înlocuiește cu virgulă, punct sau rescrie propoziția natural în limba țintă.
- Păstrează exact structura, lungimea și formatarea originalului.`;
