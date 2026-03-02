import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";

async function fetchWebsiteContent(url: string): Promise<string> {
  const normalizedUrl = url.startsWith("http") ? url : `https://${url}`;

  const res = await fetch(normalizedUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "ro-RO,ro;q=0.9,en;q=0.8",
    },
    signal: AbortSignal.timeout(10000),
  });

  if (!res.ok) throw new Error(`Site returned ${res.status}`);

  const html = await res.text();

  // Strip HTML tags and extract meaningful text
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\s{2,}/g, " ")
    .trim();

  // Return first 8000 chars — enough for AI to analyze
  return text.slice(0, 8000);
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
  let websiteText = "";

  try {
    websiteText = await fetchWebsiteContent(pageUrl);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: `Nu am putut accesa site-ul: ${message}` }, { status: 502 });
  }

  if (!websiteText || websiteText.length < 100) {
    return Response.json({ error: "Conținut insuficient pe site pentru analiză." }, { status: 422 });
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

  const brandProfile = profileData?.data as Record<string, unknown> | undefined;
  const brandName = (brandProfile?.brand_name as string) ?? "brandul tău";
  const brandUsp = (brandProfile?.usp as string) ?? "";
  const brandTone = ((brandProfile?.tone_words as string[]) ?? []).join(", ");
  const brandAudience = (brandProfile?.audience_type as string) ?? "";

  const prompt = `Ești un expert în marketing digital și analiză competitivă.

Analizează conținutul website-ului competitorului "${domain}" și extrage insight-uri strategice de marketing pentru brandul "${brandName}".

CONȚINUT WEBSITE COMPETITOR (${domain}):
${websiteText}

PROFILUL BRANDULUI TĂU:
- Nume: ${brandName}
- USP: ${brandUsp || "nespecificat"}
- Ton: ${brandTone || "nespecificat"}
- Audiență: ${brandAudience || "nespecificată"}

Analizează și returnează DOAR un JSON valid, fără explicații sau markdown:
{
  "competitorName": "numele brandului/companiei identificat pe site",
  "strategy": "2-3 propoziții despre strategia lor de marketing — ce promit, cui se adresează, cum se poziționează",
  "hooks": ["top 3-4 mesaje cheie sau propuneri de valoare identificate pe site"],
  "tone": "descrie tonul comunicării lor (ex: profesionist, prietenos, agresiv, aspirațional etc.)",
  "offers": ["ofertele principale sau serviciile/produsele promovate"],
  "differentiation": "2-3 propoziții concrete despre cum poate ${brandName} să se diferențieze față de această strategie — bazat pe USP-ul și tonul brandului"
}`;

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

  try {
    const msg = await anthropic.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 800,
      messages: [{ role: "user", content: prompt }],
    });

    const raw = (msg.content[0] as { type: string; text: string }).text.trim();
    const cleaned = raw.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    const analysis = JSON.parse(cleaned);

    return Response.json({ analysis, domain, competitorName: analysis.competitorName ?? domain });
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
