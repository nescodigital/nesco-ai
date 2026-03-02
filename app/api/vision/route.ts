import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";

async function fetchWithJina(url: string): Promise<string> {
  const normalizedUrl = url.startsWith("http") ? url : `https://${url}`;
  const jinaUrl = `https://r.jina.ai/${normalizedUrl}`;
  const res = await fetch(jinaUrl, {
    headers: { "Accept": "text/plain" },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) return "";
  const text = await res.text();
  if (text.includes("could not be resolved") || text.includes("ParamValidationError")) return "";
  return text.slice(0, 5000);
}

async function fetchMultiPageContent(domain: string): Promise<string> {
  const base = `https://${domain}`;
  const pagesToTry = [
    base,
    `${base}/servicii`,
    `${base}/services`,
    `${base}/despre`,
    `${base}/about`,
    `${base}/despre-noi`,
    `${base}/pricing`,
    `${base}/preturi`,
  ];

  // Fetch homepage + up to 2 subpages in parallel
  const [homepage, ...subResults] = await Promise.allSettled(
    pagesToTry.slice(0, 5).map(u => fetchWithJina(u))
  );

  const homepageText = homepage.status === "fulfilled" ? homepage.value : "";
  const subTexts = subResults
    .filter((r): r is PromiseFulfilledResult<string> => r.status === "fulfilled" && r.value.length > 200)
    .map(r => r.value)
    .slice(0, 2);

  const combined = [homepageText, ...subTexts].filter(Boolean).join("\n\n---\n\n");
  return combined.slice(0, 12000);
}

async function fetchAdsFromRapidAPI(pageName: string): Promise<{ text: string; count: number }> {
  const key = process.env.RAPIDAPI_KEY;
  if (!key) return { text: "", count: 0 };

  try {
    const res = await fetch(
      `https://facebook-ads-library.p.rapidapi.com/ads?query=${encodeURIComponent(pageName)}&country=RO&status=active&limit=20`,
      {
        headers: {
          "x-rapidapi-key": key,
          "x-rapidapi-host": "facebook-ads-library.p.rapidapi.com",
        },
        signal: AbortSignal.timeout(10000),
      }
    );
    if (!res.ok) return { text: "", count: 0 };
    const data = await res.json();
    const ads = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
    if (ads.length === 0) return { text: "", count: 0 };

    const summaries = ads.slice(0, 15).map((ad: Record<string, unknown>, i: number) => {
      const body = (ad.ad_creative_bodies as string[] | undefined)?.[0]
        ?? (ad.body as string)
        ?? (ad.message as string)
        ?? "";
      const title = (ad.ad_creative_link_titles as string[] | undefined)?.[0]
        ?? (ad.title as string)
        ?? "";
      const platforms = (ad.publisher_platforms as string[] | undefined)?.join(", ")
        ?? (ad.platforms as string)
        ?? "";
      const startDate = (ad.ad_delivery_start_time as string) ?? (ad.start_date as string) ?? "";
      return `Ad ${i + 1}${startDate ? ` (activ din ${startDate.slice(0, 10)})` : ""}:\nTitlu: ${title}\nText: ${body.slice(0, 400)}\nPlatforme: ${platforms}`;
    }).join("\n\n");

    return { text: summaries, count: ads.length };
  } catch {
    return { text: "", count: 0 };
  }
}

function extractDomain(input: string): string {
  const trimmed = input.trim();
  try {
    const url = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
    return url.hostname.replace(/^www\./, "");
  } catch {
    return trimmed.replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0];
  }
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { pageUrl, brandId = 1 } = await request.json();
  if (!pageUrl) return Response.json({ error: "pageUrl required" }, { status: 400 });

  const domain = extractDomain(pageUrl);

  // Fetch website content (multi-page) + ads in parallel
  const [websiteText, adsResult] = await Promise.all([
    fetchMultiPageContent(domain),
    fetchAdsFromRapidAPI(domain),
  ]);

  if (!websiteText && !adsResult.text) {
    return Response.json({ error: "Nu am putut accesa site-ul sau reclamele competitorului." }, { status: 502 });
  }

  // Save competitor
  await supabase.from("tracked_competitors").upsert(
    {
      user_id: user.id,
      brand_id: brandId,
      page_identifier: domain,
      page_name: domain,
      last_checked: new Date().toISOString(),
    },
    { onConflict: "user_id,brand_id,page_identifier" }
  );

  // Get brand profile
  const { data: profileData } = await supabase
    .from("brand_profiles")
    .select("data")
    .eq("user_id", user.id)
    .eq("brand_id", brandId)
    .single();

  const d = profileData?.data as Record<string, unknown> | undefined;
  const brandName = (d?.brand_name as string) ?? "brandul tău";
  const brandUsp = (d?.usp as string) ?? "";
  const brandTone = ((d?.tone_words as string[]) ?? []).join(", ");
  const brandAudience = (d?.audience_type as string) ?? "";
  const buyingDecision = (d?.buying_decision as string) ?? "";
  const channels = ((d?.channels as string[]) ?? []).join(", ");

  const websiteSection = websiteText
    ? `\n\nCONȚINUT WEBSITE (${domain}):\n${websiteText}`
    : "";

  const adsSection = adsResult.text
    ? `\n\nRECLAME ACTIVE (${adsResult.count} găsite):\n${adsResult.text}`
    : "";

  const hasAds = adsResult.count > 0;

  const prompt = `Ești un expert senior în strategie de marketing digital și analiză competitivă. Misiunea ta: oferă insight-uri CONCRETE și ACȚIONABILE, nu generalități.
${websiteSection}${adsSection}

PROFILUL BRANDULUI "${brandName}":
- USP: ${brandUsp || "nespecificat"}
- Ton: ${brandTone || "nespecificat"}
- Audiență: ${brandAudience || "nespecificată"}
- Decizia de cumpărare: ${buyingDecision || "nespecificată"}
- Canale: ${channels || "nespecificate"}

INSTRUCȚIUNI ANALIZĂ:
1. Identifică EXACT ce promit (nu parafrazat, ci fraze reale din text)
2. Identifică ce FRICI sau DURERI adresează în mesajele lor
3. Identifică ce OBIECȚII anticipează și cum le depășesc
4. Dacă ai reclame: analizează ce hook-uri folosesc, ce CTA-uri, ce emoții vizează
5. Diferențierea: fii SPECIFIC — nu "comunică mai personal", ci "Ei promit X în Y zile, tu poți promite Z cu garanție + dovadă socială de tip ABC"

Returnează DOAR JSON valid, fără markdown:
{
  "competitorName": "numele brandului identificat",
  "strategy": "2-3 fraze despre poziționarea și strategia lor generală",
  "painPoints": ["durerea/frica #1 pe care o adresează", "durerea/frica #2", "durerea/frica #3"],
  "hooks": ${hasAds ? '["hook/mesaj din reclamă 1", "hook/mesaj din reclamă 2", "hook/mesaj din reclamă 3"]' : '["mesaj cheie de pe site 1", "mesaj cheie de pe site 2", "mesaj cheie de pe site 3"]'},
  "tone": "descriere ton comunicare în 1 frază",
  "offers": ["oferta/serviciul principal 1", "oferta/serviciul principal 2", "oferta/serviciul principal 3"],
  "weaknesses": ["punct slab identificat 1", "punct slab identificat 2"],
  "differentiation": "2-3 fraze SPECIFICE și CONCRETE despre cum poate ${brandName} să câștige față de ei — cu referire directă la slăbiciunile lor și USP-ul tău",
  "actionableMove": "1 acțiune concretă pe care ${brandName} o poate face ACUM pentru a ataca direct poziționarea competitorului"
}`;

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

  try {
    const msg = await anthropic.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }],
    });

    const raw = (msg.content[0] as { type: string; text: string }).text.trim();
    const cleaned = raw.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    const analysis = JSON.parse(cleaned);

    return Response.json({ analysis, domain, competitorName: analysis.competitorName ?? domain, hasAds });
  } catch {
    return Response.json({ error: "Eroare la analiza AI." }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const brandId = parseInt(searchParams.get("brandId") || "1", 10);

  const { data } = await supabase
    .from("tracked_competitors")
    .select("page_identifier, page_name, last_checked")
    .eq("user_id", user.id)
    .eq("brand_id", brandId)
    .order("last_checked", { ascending: false });

  return Response.json({ competitors: data ?? [] });
}
