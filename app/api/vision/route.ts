import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";

// Extract page ID or name from a Facebook page URL
function extractPageIdentifier(input: string): string {
  const trimmed = input.trim();
  try {
    const url = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
    const parts = url.pathname.split("/").filter(Boolean);
    // facebook.com/pagename or facebook.com/pages/name/id
    if (parts[0] === "pages" && parts.length >= 3) return parts[2];
    if (parts.length > 0) return parts[parts.length - 1];
  } catch {
    // Not a URL — treat as page name directly
  }
  return trimmed;
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { pageUrl, brandId = 1 } = await request.json();
  if (!pageUrl) return Response.json({ error: "pageUrl required" }, { status: 400 });

  const pageIdentifier = extractPageIdentifier(pageUrl);

  // Fetch ads from Meta Ad Library API
  const token = process.env.META_AD_LIBRARY_TOKEN;
  if (!token) return Response.json({ error: "Meta token not configured" }, { status: 500 });

  const params = new URLSearchParams({
    access_token: token,
    search_terms: pageIdentifier,
    ad_reached_countries: '["RO"]',
    ad_active_status: "ACTIVE",
    fields: "id,ad_creative_bodies,ad_creative_link_titles,ad_creative_link_descriptions,ad_snapshot_url,page_name,publisher_platforms,impressions,spend,ad_delivery_start_time",
    limit: "20",
  });

  let ads: Record<string, unknown>[] = [];
  let pageName = pageIdentifier;

  try {
    const metaRes = await fetch(
      `https://graph.facebook.com/v19.0/ads_archive?${params.toString()}`
    );
    const metaData = await metaRes.json();

    if (metaData.error) {
      return Response.json({ error: `Meta API: ${metaData.error.message}` }, { status: 502 });
    }

    ads = metaData.data ?? [];
    if (ads.length > 0 && ads[0].page_name) {
      pageName = ads[0].page_name as string;
    }
  } catch {
    return Response.json({ error: "Failed to reach Meta API" }, { status: 502 });
  }

  // Save/update competitor in tracked_competitors
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

  // Build AI analysis prompt
  const adSummaries = ads.slice(0, 10).map((ad, i) => {
    const body = (ad.ad_creative_bodies as string[] | undefined)?.[0] ?? "";
    const title = (ad.ad_creative_link_titles as string[] | undefined)?.[0] ?? "";
    const platforms = (ad.publisher_platforms as string[] | undefined)?.join(", ") ?? "";
    return `Reclamă ${i + 1}:\nTitlu: ${title}\nText: ${body.slice(0, 300)}\nPlatforme: ${platforms}`;
  }).join("\n\n");

  // Get user's brand profile for differentiation suggestions
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
    // Return ads without analysis if AI fails
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
