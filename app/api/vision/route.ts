import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";

function extractPageIdentifier(input: string): string {
  const trimmed = input.trim();
  try {
    const url = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
    const parts = url.pathname.split("/").filter(Boolean);
    if (parts[0] === "pages" && parts.length >= 3) return parts[2];
    if (parts.length > 0) return parts[parts.length - 1];
  } catch {
    // treat as search term
  }
  return trimmed;
}

async function fetchMetaAdLibrary(searchTerm: string): Promise<{ ads: Record<string, unknown>[]; pageName: string }> {
  // Meta Ad Library public endpoint — no token required
  const params = new URLSearchParams({
    active_status: "active",
    ad_type: "ALL",
    country: "RO",
    q: searchTerm,
    search_type: "page",
    media_type: "all",
  });

  const headers = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "application/json, text/plain, */*",
    "Accept-Language": "ro-RO,ro;q=0.9,en-US;q=0.8,en;q=0.7",
    "Referer": "https://www.facebook.com/ads/library/",
    "X-FB-Friendly-Name": "AdLibrarySearchPaginatedAdsQuery",
  };

  const res = await fetch(
    `https://www.facebook.com/ads/library/async/search_ads/?${params.toString()}`,
    { headers, cache: "no-store" }
  );

  if (!res.ok) throw new Error(`Meta returned ${res.status}`);

  const text = await res.text();

  // Meta sometimes prepends "for (;;);" to JSON responses
  const cleaned = text.replace(/^for\s*\(;;\);/, "").trim();
  const json = JSON.parse(cleaned);

  // Extract ads from response structure
  const payload = json?.payload ?? json?.data ?? json;
  const rawAds: Record<string, unknown>[] = [];
  let pageName = searchTerm;

  if (Array.isArray(payload?.results)) {
    for (const result of payload.results) {
      const adCards = result?.adCards ?? result?.collationAdCards ?? [];
      for (const card of adCards) {
        rawAds.push({
          id: card?.adArchiveID ?? card?.ad_archive_id ?? Math.random().toString(),
          page_name: card?.pageName ?? card?.page_name ?? searchTerm,
          ad_creative_bodies: card?.snapshot?.body?.text
            ? [card.snapshot.body.text]
            : card?.snapshot?.cards?.map((c: Record<string, unknown>) => c?.body ?? "").filter(Boolean) ?? [],
          ad_creative_link_titles: card?.snapshot?.title
            ? [card.snapshot.title]
            : [],
          ad_snapshot_url: card?.snapshot?.link_url ?? null,
          publisher_platforms: card?.publisherPlatform ?? card?.publisher_platform ?? [],
          ad_delivery_start_time: card?.startDate ?? null,
        });
        if (card?.pageName) pageName = card.pageName;
      }
    }
  }

  return { ads: rawAds.slice(0, 20), pageName };
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { pageUrl, brandId = 1 } = await request.json();
  if (!pageUrl) return Response.json({ error: "pageUrl required" }, { status: 400 });

  const pageIdentifier = extractPageIdentifier(pageUrl);

  let ads: Record<string, unknown>[] = [];
  let pageName = pageIdentifier;

  try {
    const result = await fetchMetaAdLibrary(pageIdentifier);
    ads = result.ads;
    pageName = result.pageName;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: `Nu am putut accesa Meta Ad Library: ${message}` }, { status: 502 });
  }

  // Save competitor
  await supabase.from("tracked_competitors").upsert(
    {
      user_id: user.id,
      brand_id: brandId,
      page_identifier: pageIdentifier,
      page_name: pageName,
      last_checked: new Date().toISOString(),
    },
    { onConflict: "user_id,brand_id,page_identifier" }
  );

  if (ads.length === 0) {
    return Response.json({ ads: [], analysis: null, pageName });
  }

  // AI analysis
  const adSummaries = ads.slice(0, 10).map((ad, i) => {
    const body = (ad.ad_creative_bodies as string[] | undefined)?.[0] ?? "";
    const title = (ad.ad_creative_link_titles as string[] | undefined)?.[0] ?? "";
    const platforms = (ad.publisher_platforms as string[] | undefined)?.join(", ") ?? "";
    return `Reclamă ${i + 1}:\nTitlu: ${title}\nText: ${body.slice(0, 300)}\nPlatforme: ${platforms}`;
  }).join("\n\n");

  const { data: profileData } = await supabase
    .from("brand_profiles")
    .select("data")
    .eq("user_id", user.id)
    .eq("brand_id", brandId)
    .single();

  const brandProfile = profileData?.data as Record<string, unknown> | undefined;
  const brandName = (brandProfile?.brand_name as string) ?? "brandul tău";
  const brandUsp = (brandProfile?.usp as string) ?? "";
  const brandTone = ((brandProfile?.tone_words as string[]) ?? []).join(", ");

  const prompt = `Ești un expert în marketing digital și analiză competitivă.

Analizează reclamele active ale competitorului "${pageName}" și oferă insight-uri strategice pentru brandul "${brandName}".

RECLAMELE COMPETITORULUI:
${adSummaries}

PROFILUL BRANDULUI TĂU:
- Nume: ${brandName}
- USP: ${brandUsp || "nespecificat"}
- Ton: ${brandTone || "nespecificat"}

Returnează DOAR un JSON valid, fără explicații sau markdown:
{
  "strategy": "2-3 propoziții care descriu strategia generală a competitorului (mesaje cheie, ton, obiective predominante)",
  "hooks": ["top 3 hook-uri sau mesaje recurente identificate în reclame"],
  "platforms": ["platformele pe care rulează cel mai mult"],
  "differentiation": "2-3 propoziții concrete despre cum poate ${brandName} să se diferențieze față de această strategie — bazat pe USP-ul și tonul brandului"
}`;

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

  try {
    const msg = await anthropic.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 600,
      messages: [{ role: "user", content: prompt }],
    });

    const raw = (msg.content[0] as { type: string; text: string }).text.trim();
    const cleaned = raw.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    const analysis = JSON.parse(cleaned);

    return Response.json({ ads, analysis, pageName });
  } catch {
    return Response.json({ ads, analysis: null, pageName });
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
