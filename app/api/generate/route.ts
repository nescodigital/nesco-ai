import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";

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

  const { contentType, objective, context } = await request.json();

  const { data: profile } = await supabase
    .from("brand_profiles")
    .select("data")
    .eq("user_id", user.id)
    .single();

  const d = (profile?.data as Record<string, unknown>) || {};

  const systemPrompt = `Ești un copywriter expert pentru brandul "${d.brand_name || "acest brand"}".
Ton: ${((d.tone_words as string[]) || []).join(", ")}
Audiență: ${d.audience_type}, vârsta ${((d.audience_age as string[]) || []).join(", ")}
Canale principale: ${((d.channels as string[]) || []).join(", ")}
Problema pe care o rezolvi: ${d.audience_pain}
USP: ${d.usp || ""}
Cuvinte interzise: ${d.avoid || "niciuna"}
Scrie DOAR în română. Fără explicații, doar conținutul final gata de publicat.`;

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const message = await anthropic.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 1024,
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
