import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";

const FREQUENCY_DAYS: Record<string, number[]> = {
  daily: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13], // every day
  "2-3week": [0, 2, 4, 7, 9, 11], // mon, wed, fri × 2 weeks
  weekly: [2, 9], // wednesday × 2 weeks
  monthly: [3, 10], // thursday × 2 weeks (2 posts in 2 weeks ≈ monthly)
};

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { regenerate } = await request.json().catch(() => ({ regenerate: false }));

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
  const updates = (updatesResult.data ?? []).map((u: { text: string }) => u.text);

  const frequency = (d.frequency as string) || "2-3week";
  const channels = (d.channels as string[]) || [];
  const brandName = (d.brand_name as string) || "acest brand";

  // Get today and calculate date range (2 weeks from today)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const startDate = today.toISOString().split("T")[0];
  const endDate = new Date(today.getTime() + 13 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  // If regenerate: delete only 'suggested' slots in range
  if (regenerate) {
    await supabase
      .from("calendar_slots")
      .delete()
      .eq("user_id", user.id)
      .eq("status", "suggested")
      .gte("scheduled_date", startDate)
      .lte("scheduled_date", endDate);
  }

  // Get which day offsets to use based on frequency
  const dayOffsets = FREQUENCY_DAYS[frequency] ?? FREQUENCY_DAYS["2-3week"];

  // Build slots dates
  const slotDates = dayOffsets.map((offset) => {
    const d = new Date(today.getTime() + offset * 24 * 60 * 60 * 1000);
    return d.toISOString().split("T")[0];
  });

  // Prompt Claude to generate the plan
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const updatesText = updates.length
    ? `Noutăți recente în business:\n${updates.map((u) => `- ${u}`).join("\n")}`
    : "Nicio noutate recentă.";

  const prompt = `Ești un expert în marketing digital. Creează un plan editorial pentru ${slotDates.length} postări.

Brand: ${brandName}
Frecvență publicare: ${frequency}
Canale active: ${channels.join(", ") || "Facebook, Instagram"}
${updatesText}

Datele pentru care trebuie să creezi postări (ISO format): ${slotDates.join(", ")}

Returnează DOAR un JSON valid cu această structură exactă, fără text înainte sau după:
{
  "slots": [
    {
      "scheduled_date": "YYYY-MM-DD",
      "content_type": "Post Facebook",
      "objective": "Awareness",
      "context": "Descriere scurtă (max 80 caractere) a ce să scrie AI-ul pentru această postare"
    }
  ]
}

Tipuri de conținut disponibile: Post Facebook, Post Instagram, Post LinkedIn, Email newsletter, Reclamă Meta Ads
Obiective disponibile: Vânzare, Awareness, Engagement, Promovare ofertă specială

Reguli stricte:
- Câte un slot pentru fiecare dată din lista de mai sus, exact în ordinea datelor
- Variază tipurile de conținut și obiectivele (nu repeta același tip de 2 ori la rând)
- Distribuie: 40% Awareness, 30% Engagement, 30% Vânzare sau Promovare ofertă specială
- Dacă există noutăți de business, include-le în context pentru slot-urile relevante
- Folosește canalele active pentru a determina tipurile de conținut preferate
- Context-ul trebuie să fie specific și util pentru AI (nu generic)`;

  const message = await anthropic.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 2048,
    messages: [{ role: "user", content: prompt }],
  });

  const responseText = message.content[0].type === "text" ? message.content[0].text : "";

  // Parse JSON from response (extract JSON block if wrapped)
  let planSlots: Array<{
    scheduled_date: string;
    content_type: string;
    objective: string;
    context: string;
  }> = [];

  try {
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      planSlots = parsed.slots ?? [];
    }
  } catch {
    return NextResponse.json({ error: "Failed to parse AI plan response" }, { status: 500 });
  }

  if (planSlots.length === 0) {
    return NextResponse.json({ error: "No slots generated" }, { status: 500 });
  }

  // Insert slots into DB
  const rows = planSlots.map((s) => ({
    user_id: user.id,
    scheduled_date: s.scheduled_date,
    content_type: s.content_type,
    objective: s.objective,
    context: s.context,
    status: "suggested",
  }));

  const { data: inserted, error: insertError } = await supabase
    .from("calendar_slots")
    .insert(rows)
    .select("*");

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ slots: inserted ?? [] });
}
