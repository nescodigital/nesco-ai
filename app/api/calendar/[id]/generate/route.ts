import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { getFormattingInstructions } from "@/lib/formatting";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  // Check credits
  const { data: creditsRow } = await supabase
    .from("user_credits")
    .select("credits")
    .eq("user_id", user.id)
    .single();

  if (!creditsRow || creditsRow.credits <= 0) {
    return NextResponse.json({ error: "no_credits" }, { status: 402 });
  }

  // Fetch slot (verify ownership)
  const { data: slot, error: slotError } = await supabase
    .from("calendar_slots")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (slotError || !slot) {
    return NextResponse.json({ error: "Slot not found" }, { status: 404 });
  }

  // Fetch brand profile + business updates in parallel
  const [profileResult, updatesResult] = await Promise.all([
    supabase.from("brand_profiles").select("data").eq("user_id", user.id).single(),
    supabase
      .from("business_updates")
      .select("text")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const d = (profileResult.data?.data as Record<string, unknown>) || {};
  const businessUpdates = updatesResult.data ?? [];

  const formattingInstructions = getFormattingInstructions(slot.content_type);

  const updatesSection = businessUpdates.length
    ? `\nNOUTĂȚI RECENTE ÎN BUSINESS:\n${businessUpdates.map((u: { text: string }) => `- ${u.text}`).join("\n")}`
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
Scrie DOAR în română.${updatesSection}`;

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const message = await anthropic.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 1024,
    system: systemPrompt,
    messages: [
      {
        role: "user",
        content: `Scrie un ${slot.content_type} cu obiectivul: ${slot.objective}.${slot.context ? ` Context: ${slot.context}` : ""}`,
      },
    ],
  });

  const generatedContent = message.content[0].type === "text" ? message.content[0].text : "";

  // Deduct credit
  await supabase
    .from("user_credits")
    .update({ credits: creditsRow.credits - 1, updated_at: new Date().toISOString() })
    .eq("user_id", user.id);

  // Update slot with result
  await supabase
    .from("calendar_slots")
    .update({ status: "generated", result: generatedContent })
    .eq("id", id)
    .eq("user_id", user.id);

  // Also save to generation_history for context awareness
  await supabase.from("generation_history").insert({
    user_id: user.id,
    content_type: slot.content_type,
    objective: slot.objective,
    context: slot.context,
    result: generatedContent,
  });

  return NextResponse.json({
    result: generatedContent,
    creditsRemaining: creditsRow.credits - 1,
  });
}
