import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const {
    regenerate = false,
    platform,
    count = 3,
    weekStart,
    weekEnd,
  } = body as {
    regenerate?: boolean;
    platform?: string;
    count?: number;
    weekStart?: string;
    weekEnd?: string;
  };

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

  const brandName = (d.brand_name as string) || "acest brand";
  const contentType = platform || "Post Facebook";

  // Determine date range for this week
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const startDate = weekStart ?? today.toISOString().split("T")[0];
  const endDate = weekEnd ?? new Date(today.getTime() + 6 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  // Delete existing suggested slots for this platform in this week range if regenerating
  if (regenerate) {
    await supabase
      .from("calendar_slots")
      .delete()
      .eq("user_id", user.id)
      .eq("status", "suggested")
      .eq("content_type", contentType)
      .gte("scheduled_date", startDate)
      .lte("scheduled_date", endDate);
  }

  // Build available dates for this week (parse as local date to avoid UTC offset issues)
  const availableDates: string[] = [];
  const [sy, sm, sd] = startDate.split("-").map(Number);
  const [ey, em, ed] = endDate.split("-").map(Number);
  const startLocal = new Date(sy, sm - 1, sd);
  const endLocal = new Date(ey, em - 1, ed);
  for (const dt = new Date(startLocal); dt <= endLocal; dt.setDate(dt.getDate() + 1)) {
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, "0");
    const d = String(dt.getDate()).padStart(2, "0");
    availableDates.push(`${y}-${m}-${d}`);
  }

  // Pick `count` unique dates spread evenly across the week
  const slotCount = Math.min(count, availableDates.length);
  const slotDates: string[] = [];
  if (slotCount === availableDates.length) {
    slotDates.push(...availableDates);
  } else {
    // Use evenly spaced indices, guaranteed unique
    for (let i = 0; i < slotCount; i++) {
      const idx = Math.round((i * (availableDates.length - 1)) / (slotCount - 1 || 1));
      slotDates.push(availableDates[Math.min(idx, availableDates.length - 1)]);
    }
  }

  const updatesText = updates.length
    ? `Noutăți recente în business:\n${updates.map((u) => `- ${u}`).join("\n")}`
    : "Nicio noutate recentă.";

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const prompt = `Ești un expert în marketing digital. Creează un plan editorial de ${slotDates.length} postări pentru ${contentType}.

Brand: ${brandName}
${updatesText}

Datele pentru care trebuie să creezi postări (ISO format): ${slotDates.join(", ")}

Returnează DOAR un JSON valid cu această structură exactă, fără text înainte sau după:
{
  "slots": [
    {
      "scheduled_date": "YYYY-MM-DD",
      "content_type": "${contentType}",
      "objective": "Awareness",
      "context": "Descriere scurtă (max 80 caractere) a ce să scrie AI-ul pentru această postare"
    }
  ]
}

Obiective disponibile: Vânzare, Awareness, Engagement, Promovare ofertă specială

Reguli stricte:
- Câte un slot pentru fiecare dată din lista de mai sus, exact în ordinea datelor
- Variază obiectivele (nu repeta același obiectiv de 2 ori la rând)
- Distribuie: 40% Awareness, 30% Engagement, 30% Vânzare sau Promovare ofertă specială
- Dacă există noutăți de business, include-le în context pentru slot-urile relevante
- Context-ul trebuie să fie specific și util pentru AI (nu generic)
- Toate slot-urile au content_type exact: "${contentType}"`;

  const message = await anthropic.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });

  const responseText = message.content[0].type === "text" ? message.content[0].text : "";

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
