import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { TRANSLATE_FORMATTING } from "@/lib/formatting";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { text, targetLanguage } = await request.json();

  const { data: creditsRow } = await supabase
    .from("user_credits")
    .select("credits")
    .eq("user_id", user.id)
    .single();

  if (!creditsRow || creditsRow.credits <= 0) {
    return Response.json({ error: "no_credits" }, { status: 402 });
  }

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const message = await anthropic.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 1024,
    messages: [{
      role: "user",
      content: `Traduce exact următorul text în ${targetLanguage}. Păstrează același ton, structură și formatare. Nu adăuga explicații, doar textul tradus.\n\n${TRANSLATE_FORMATTING}\n\n${text}`,
    }],
  });

  const translated = message.content[0].type === "text" ? message.content[0].text : "";

  await supabase
    .from("user_credits")
    .update({ credits: creditsRow.credits - 1, updated_at: new Date().toISOString() })
    .eq("user_id", user.id);

  return Response.json({ content: translated, creditsRemaining: creditsRow.credits - 1 });
}
