import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";

const client = new Anthropic();

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const brandId = parseInt(searchParams.get("brandId") || "1");

  const { data } = await supabase
    .from("personal_voice")
    .select("samples, style_profile, updated_at")
    .eq("user_id", user.id)
    .eq("brand_id", brandId)
    .maybeSingle();

  return Response.json({
    samples: data?.samples ?? [],
    style_profile: data?.style_profile ?? null,
    hasProfile: !!data?.style_profile,
    updated_at: data?.updated_at ?? null,
  });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { samples, brandId = 1 } = await request.json();
  if (!samples || !Array.isArray(samples) || samples.length < 3) {
    return Response.json({ error: "Minim 3 texte necesare" }, { status: 400 });
  }

  const validSamples = samples.filter((s: string) => s && s.trim().length > 20);
  if (validSamples.length < 3) {
    return Response.json({ error: "Textele sunt prea scurte" }, { status: 400 });
  }

  const prompt = `Analizează aceste texte scrise de aceeași persoană și extrage profilul lor exact de scriere.
Returnează UN SINGUR JSON valid, fără text suplimentar:

{
  "sentence_length": "<descriere tipar lungime fraze — ex: fraze scurte de 5-8 cuvinte, tăiate brusc>",
  "tone": "<descriere ton în 1 propoziție concisă>",
  "signature_phrases": ["<expresie sau tic verbal specific găsit în texte 1>", "<expresie 2>", "<expresie 3>"],
  "punctuation_style": "<descriere specifică — ex: puncte de suspensie frecvente, rar virgule, exclamări pentru accent>",
  "emoji_usage": "<niciodată/rar/moderat/frecvent — și contextul dacă există>",
  "opener_pattern": "<cum începe de obicei prima propoziție>",
  "paragraph_style": "<cum sunt structurate paragrafele — lungime, frecvență, aer vizual>",
  "vocabulary_level": "<simplu/mediu/tehnic + note specifice>",
  "writing_rules": [
    "<regulă concretă și acționabilă de imitat — specifică, nu generică>",
    "<regulă 2>",
    "<regulă 3>",
    "<regulă 4>",
    "<regulă 5>"
  ]
}

Fii specific și concret — nu scrie "ton prietenos" ci ce anume face textul să sune prietenos.
Extrage pattern-uri REALE din textele de mai jos, nu generalități.

TEXTE DE ANALIZAT:
${validSamples.map((s: string, i: number) => `[TEXT ${i + 1}]\n${s.trim()}`).join('\n\n---\n\n')}`;

  const message = await client.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 800,
    messages: [{ role: "user", content: prompt }],
  });

  const raw = (message.content[0] as { type: string; text: string }).text;
  const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  const style_profile = JSON.parse(cleaned);

  await supabase.from("personal_voice").upsert(
    { user_id: user.id, brand_id: brandId, samples: validSamples, style_profile, updated_at: new Date().toISOString() },
    { onConflict: "user_id,brand_id" }
  );

  return Response.json({ style_profile, ok: true });
}
