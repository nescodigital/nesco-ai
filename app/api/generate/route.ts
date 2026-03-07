import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { getFormattingInstructions } from "@/lib/formatting";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  // Check credits
  const { data: creditsRow } = await supabase
    .from("user_credits")
    .select("credits")
    .eq("user_id", user.id)
    .single();

  if (!creditsRow || creditsRow.credits <= 0) {
    return Response.json({ error: "no_credits" }, { status: 402 });
  }

  const { contentType, objective, context, brandId = 1, usePersonalVoice = false } = await request.json();

  const [profileResult, updatesResult, historyResult] = await Promise.all([
    supabase.from("brand_profiles").select("data").eq("user_id", user.id).eq("brand_id", brandId).single(),
    supabase
      .from("business_updates")
      .select("text")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("generation_history")
      .select("content_type, objective, result")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(3),
  ]);

  const d = (profileResult.data?.data as Record<string, unknown>) || {};
  const businessUpdates = updatesResult.data ?? [];
  const recentHistory = historyResult.data ?? [];

  // Load personal voice profile if requested
  let voiceSection = "";
  if (usePersonalVoice) {
    const { data: voiceRow } = await supabase
      .from("personal_voice")
      .select("style_profile")
      .eq("user_id", user.id)
      .eq("brand_id", brandId)
      .maybeSingle();
    if (voiceRow?.style_profile) {
      const sp = voiceRow.style_profile as Record<string, unknown>;
      const rules = (sp.writing_rules as string[]).map((r) => `- ${r}`).join("\n");
      const phrases = (sp.signature_phrases as string[]).join(", ");
      voiceSection = `\n\nSTILUL PERSONAL AL AUTORULUI — respectă EXACT aceste reguli, au prioritate maximă:\n${rules}\nExpresii caracteristice de folosit natural: ${phrases}\nLungime fraze: ${sp.sentence_length}\nStil paragrafe: ${sp.paragraph_style}\nEmoji: ${sp.emoji_usage}`;
    }
  }

  const formattingInstructions = getFormattingInstructions(contentType);

  const updatesSection = businessUpdates.length
    ? `\nNOUTĂȚI RECENTE ÎN BUSINESS (folosește-le dacă sunt relevante pentru conținut):\n${businessUpdates.map((u: { text: string }) => `- ${u.text}`).join("\n")}`
    : "";

  const historySection = recentHistory.length
    ? `\nCONȚINUT RECENT GENERAT (evită să repeți aceleași idei sau hook-uri de deschidere):\n${recentHistory.map((h: { content_type: string; objective: string; result: string }) => `- ${h.content_type} (${h.objective}): "${h.result.slice(0, 80)}..."`).join("\n")}`
    : "";

  const systemPrompt = `${formattingInstructions}

BRAND VOICE:
Brand: "${d.brand_name || "acest brand"}"
Ton: ${((d.tone_words as string[]) || []).join(", ")}
Audiență: ${d.audience_type}, vârsta ${((d.audience_age as string[]) || []).join(", ")}
Canale principale: ${((d.channels as string[]) || []).join(", ")}
Decizia de cumpărare a clienților: ${d.buying_decision || ""}
USP: ${d.usp || ""}
Cuvinte interzise: ${d.avoid || "niciuna"}
Scrie DOAR în română.${updatesSection}${historySection}${voiceSection}`;

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const message = await anthropic.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 2048,
    system: systemPrompt,
    messages: [
      {
        role: "user",
        content: `Scrie un ${contentType} cu obiectivul: ${objective}.${context ? ` Context: ${context}` : ""}`,
      },
    ],
  });

  const generatedContent = message.content[0].type === "text" ? message.content[0].text : "";

  // Deduct 1 credit after successful generation
  await supabase
    .from("user_credits")
    .update({ credits: creditsRow.credits - 1, updated_at: new Date().toISOString() })
    .eq("user_id", user.id);

  // Save to history
  await supabase.from("generation_history").insert({
    user_id: user.id,
    content_type: contentType,
    objective,
    context,
    result: generatedContent,
  });

  return Response.json({
    content: generatedContent,
    creditsRemaining: creditsRow.credits - 1,
  });
}
