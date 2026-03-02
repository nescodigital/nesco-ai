import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Format → DALL-E 3 size mapping
const FORMAT_SIZE: Record<string, "1024x1024" | "1024x1792" | "1792x1024"> = {
  "1:1": "1024x1024",
  "4:5": "1024x1792",
  "16:9": "1792x1024",
};

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Check credits (costs 2)
  const { data: creditsRow } = await supabase
    .from("user_credits")
    .select("credits")
    .eq("user_id", user.id)
    .single();

  if (!creditsRow || creditsRow.credits < 2) {
    return NextResponse.json({ error: "no_credits" }, { status: 402 });
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "Image generation not configured yet." }, { status: 503 });
  }

  const { text, contentType, format = "1:1" } = await request.json();
  const size = FORMAT_SIZE[format] ?? "1024x1024";

  // Build a focused prompt from the post text
  const prompt = `Create a professional social media image for a ${contentType} post.
The post is about: ${text.slice(0, 300)}
Style: clean, modern, professional marketing photo. No text overlays. Suitable for Romanian business audience.`;

  const openaiRes = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "dall-e-3",
      prompt,
      n: 1,
      size,
      quality: "standard",
      response_format: "url",
    }),
  });

  if (!openaiRes.ok) {
    const err = await openaiRes.json().catch(() => ({}));
    return NextResponse.json({ error: err?.error?.message ?? "Image generation failed" }, { status: 500 });
  }

  const openaiData = await openaiRes.json();
  const imageUrl = openaiData.data?.[0]?.url;
  if (!imageUrl) return NextResponse.json({ error: "No image returned" }, { status: 500 });

  // Deduct 2 credits
  await supabase
    .from("user_credits")
    .update({ credits: creditsRow.credits - 2, updated_at: new Date().toISOString() })
    .eq("user_id", user.id);

  return NextResponse.json({
    imageUrl,
    creditsRemaining: creditsRow.credits - 2,
  });
}
